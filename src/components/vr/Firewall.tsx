"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import { XRControllerModel, useXR, useXRInputSourceStateContext, useXRStore } from "@react-three/xr";
import * as THREE from "three";
import { FIREWALL_CARDS, FIREWALL_MAX_SCORE, FIREWALL_MISSION_ID, FIREWALL_RULES, TUTORIAL_CARDS, type FeedCard } from "@/game/vr/firewallData";
import { FIREWALL_CARDS_ID, FIREWALL_RULES_ID } from "@/game/vr/firewallData.id";
import { recordScore } from "@/game/progress";
import { useLang, useT, type Lang } from "@/lib/i18n";
import { COLORS, FONT, FONT_BOLD, Panel3D } from "./ui3d";
import QuitControl from "./QuitControl";

// ─── Sabers ──────────────────────────────────────────────────────────
// Each controller registers its blade so the game loop can hit-test it.

interface SaberEntry {
  base: THREE.Object3D;
  tip: THREE.Object3D;
  pulse: (strength?: number) => void;
}
const sabers = new Map<string, SaberEntry>();
const BLADE_LENGTH = 0.9;

export function SaberController() {
  const state = useXRInputSourceStateContext("controller");
  const base = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Group>(null);
  const hand = state.inputSource.handedness;
  const color = hand === "left" ? COLORS.cyan : "#ff3df2";

  useEffect(() => {
    if (!base.current || !tip.current) return;
    const gamepad = state.inputSource.gamepad as (Gamepad & { hapticActuators?: { pulse?: (v: number, ms: number) => void }[] }) | undefined;
    sabers.set(hand, {
      base: base.current,
      tip: tip.current,
      pulse: (strength = 0.8) => gamepad?.hapticActuators?.[0]?.pulse?.(strength, 60),
    });
    return () => { sabers.delete(hand); };
  }, [hand, state]);

  return (
    <>
      <Suspense fallback={null}>
        <XRControllerModel />
      </Suspense>
      <group>
        <mesh position={[0, 0, -0.02]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.016, 0.018, 0.1, 12]} />
          <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, -0.07 - BLADE_LENGTH / 2]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.011, 0.011, BLADE_LENGTH, 10]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.07 - BLADE_LENGTH / 2]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.026, 0.026, BLADE_LENGTH, 10]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={base} position={[0, 0, -0.07]} />
        <group ref={tip} position={[0, 0, -0.07 - BLADE_LENGTH]} />
      </group>
    </>
  );
}

// ─── Hit testing ─────────────────────────────────────────────────────

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _inv = new THREE.Matrix4();

/** Segment (world space) vs. an object's local box of half-size `half`. */
function bladeHits(obj: THREE.Object3D, half: THREE.Vector3): SaberEntry | null {
  _inv.copy(obj.matrixWorld).invert();
  for (const saber of sabers.values()) {
    saber.base.getWorldPosition(_a).applyMatrix4(_inv);
    saber.tip.getWorldPosition(_b).applyMatrix4(_inv);
    let t0 = 0;
    let t1 = 1;
    let hit = true;
    for (const axis of ["x", "y", "z"] as const) {
      const d = _b[axis] - _a[axis];
      const h = half[axis];
      if (Math.abs(d) < 1e-6) {
        if (_a[axis] < -h || _a[axis] > h) { hit = false; break; }
      } else {
        let ta = (-h - _a[axis]) / d;
        let tb = (h - _a[axis]) / d;
        if (ta > tb) [ta, tb] = [tb, ta];
        t0 = Math.max(t0, ta);
        t1 = Math.min(t1, tb);
        if (t0 > t1) { hit = false; break; }
      }
    }
    if (hit) return saber;
  }
  return null;
}

// ─── Sound ───────────────────────────────────────────────────────────

let audio: AudioContext | null = null;
function beep(freq: number, ms: number, type: OscillatorType = "sine", gain = 0.08, delay = 0) {
  try {
    audio ??= new AudioContext();
    const t = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + ms / 1000);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
    osc.connect(g).connect(audio.destination);
    osc.start(t);
    osc.stop(t + ms / 1000);
  } catch {
    /* audio unavailable */
  }
}
const sfx = {
  good: () => { beep(880, 160, "triangle"); beep(1320, 120, "sine", 0.05, 0.05); },
  bad: () => beep(160, 320, "sawtooth", 0.07),
  slash: () => beep(520, 90, "square", 0.04),
  wave: () => { beep(523, 140, "triangle", 0.06); beep(659, 140, "triangle", 0.06, 0.14); beep(784, 220, "triangle", 0.06, 0.28); },
  breach: () => { beep(220, 500, "sawtooth", 0.08); beep(110, 700, "sawtooth", 0.06, 0.2); },
};

// ─── Sparks (slash particles) ────────────────────────────────────────

const SPARK_COUNT = 64;
interface Spark { pos: THREE.Vector3; vel: THREE.Vector3; life: number; color: THREE.Color }
type SparkEmitter = (at: THREE.Vector3, color: string) => void;

function Sparks({ onReady }: { onReady: (emit: SparkEmitter | null) => void }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const sparks = useRef<Spark[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    onReady((at, color) => {
      const c = new THREE.Color(color);
      for (let i = 0; i < 16; i++) {
        if (sparks.current.length >= SPARK_COUNT) sparks.current.shift();
        sparks.current.push({
          pos: at.clone(),
          vel: new THREE.Vector3((Math.random() - 0.5) * 2.4, Math.random() * 2 + 0.4, (Math.random() - 0.5) * 1.6),
          life: 0.6 + Math.random() * 0.3,
          color: c,
        });
      }
    });
    return () => onReady(null);
  }, [onReady]);

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const list = sparks.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const sp = list[i];
      sp.life -= dt;
      sp.vel.y -= 4 * dt;
      sp.pos.addScaledVector(sp.vel, dt);
      if (sp.life <= 0) list.splice(i, 1);
    }
    for (let i = 0; i < SPARK_COUNT; i++) {
      const sp = list[i];
      if (sp) {
        dummy.position.copy(sp.pos);
        dummy.scale.setScalar(Math.max(0.01, sp.life) * 0.03);
        m.setColorAt(i, sp.color);
      } else {
        dummy.scale.setScalar(0);
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, SPARK_COUNT]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

// ─── Game configuration ──────────────────────────────────────────────

const CARD_W = 0.66;
const CARD_H = 0.44;
const TUTORIAL_READ_SECONDS = 9;
const CARD_HALF = new THREE.Vector3(CARD_W / 2, CARD_H / 2, 0.09);
const BUTTON_HALF = new THREE.Vector3(0.27, 0.11, 0.12);
const SPAWN_Z = -9;
const READ_Z = -2.5; // cards hover here so they can be read
const CARD_SCALE = 1.15;
const PASS_Z = 0.6;
const HIT_ZONE: [number, number] = [-1.5, 0.45];
const INTEGRITY_HIT = 15;

interface Wave {
  name: [string, string];
  short: [string, string];
  subtitle: [string, string];
  lanes: [number, number][]; // [x, y]
  readSeconds: number;
  approachSeconds: number;
  spawnEvery: number;
  maxActive: number;
}

const WAVES: Wave[] = [
  { name: ["WAVE 1 · TRAINING", "GELOMBANG 1 · LATIHAN"], short: ["TRAINING", "LATIHAN"], subtitle: ["One post at a time. Read both checks, then decide.", "Satu unggahan sekali jalan. Baca kedua cek, lalu putuskan."], lanes: [[0, 1.38]], readSeconds: 4.5, approachSeconds: 1.5, spawnEvery: 0, maxActive: 1 },
  { name: ["WAVE 2 · RUSH HOUR", "GELOMBANG 2 · JAM SIBUK"], short: ["RUSH HOUR", "JAM SIBUK"], subtitle: ["Two feeds at once. Stay sharp.", "Dua arus sekaligus. Tetap fokus."], lanes: [[-0.47, 1.28], [0.47, 1.52]], readSeconds: 3.4, approachSeconds: 1.25, spawnEvery: 2.6, maxActive: 2 },
  { name: ["WAVE 3 · OVERLOAD", "GELOMBANG 3 · KEWALAHAN"], short: ["OVERLOAD", "KEWALAHAN"], subtitle: ["Three feeds, less time. Trust the clues.", "Tiga arus, waktu lebih sedikit. Percayai petunjuknya."], lanes: [[-0.86, 1.22], [0, 1.55], [0.86, 1.22]], readSeconds: 2.6, approachSeconds: 1.05, spawnEvery: 1.9, maxActive: 3 },
];

type CardPhase = "incoming" | "reading" | "approach" | "slashed" | "passed";

interface Flying {
  key: number;
  card: FeedCard;
  wave: number;
  x: number;
  y: number;
  z: number;
  phase: CardPhase;
  t: number; // seconds in the current phase
}

type Outcome = { correct: boolean; text: [string, string]; card: FeedCard };

/** The post's text in the player's language (decks are built from the English cards). */
function localizeCard(card: FeedCard, lang: Lang): FeedCard {
  const id = lang === "id" ? FIREWALL_CARDS_ID[card.id] : undefined;
  return id ? { ...card, ...id } : card;
}

/** Splits a deck so each wave gets an even mix of suspicious and credible posts. */
function buildWaves(): FeedCard[][] {
  const shuffle = <T,>(arr: T[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const sus = shuffle(FIREWALL_CARDS.filter((c) => c.suspicious));
  const cred = shuffle(FIREWALL_CARDS.filter((c) => !c.suspicious));
  const per = Math.floor(sus.length / WAVES.length);
  const waves = WAVES.map((_, w) => shuffle([...sus.slice(w * per, (w + 1) * per), ...cred.slice(w * per, (w + 1) * per)]));
  // Wave 1 opens with the two coached tutorial posts.
  waves[0] = [...TUTORIAL_CARDS, ...waves[0]];
  return waves;
}

const TOTAL_CARDS = FIREWALL_CARDS.length + TUTORIAL_CARDS.length;

/** Tutorial posts hover longer so the coach text can be read. */
const readFor = (f: Flying) => (f.card.coach ? TUTORIAL_READ_SECONDS : WAVES[f.wave].readSeconds);

// ─── Card visuals ────────────────────────────────────────────────────

type Register = (key: number, group: THREE.Group | null, bar: THREE.Mesh | null) => void;

function CardMesh({ f, register, onClick }: { f: Flying; register: Register; onClick: () => void }) {
  const t = useT();
  const card = localizeCard(f.card, useLang());
  const group = useRef<THREE.Group>(null);
  const bar = useRef<THREE.Mesh>(null);
  useEffect(() => {
    register(f.key, group.current, bar.current);
    return () => register(f.key, null, null);
  }, [f.key, register]);

  return (
    <group ref={group} position={[f.x, f.y, f.z]} scale={CARD_SCALE}>
      <RoundedBox args={[CARD_W + 0.012, CARD_H + 0.012, 0.016]} radius={0.024} smoothness={2} position-z={-0.004}>
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.35} toneMapped={false} />
      </RoundedBox>
      <RoundedBox args={[CARD_W, CARD_H, 0.02]} radius={0.02} smoothness={2} onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <meshBasicMaterial color="#f1f5f9" toneMapped={false} />
      </RoundedBox>
      {/* App + sender */}
      <group position={[-CARD_W / 2 + 0.03, CARD_H / 2 - 0.038, 0.012]}>
        <RoundedBox args={[0.15, 0.036, 0.004]} radius={0.01} smoothness={2} position-x={0.075}>
          <meshBasicMaterial color="#0f172a" toneMapped={false} />
        </RoundedBox>
        <Text position={[0.075, 0, 0.004]} fontSize={0.018} color="#f8fafc" anchorX="center" anchorY="middle" font={FONT_BOLD} maxWidth={0.14}>
          {card.app.toUpperCase()}
        </Text>
        <Text position={[0.165, 0, 0.004]} fontSize={0.02} color="#475569" anchorX="left" anchorY="middle" font={FONT_BOLD} maxWidth={CARD_W - 0.23}>
          {card.sender}
        </Text>
      </group>
      <Text position={[-CARD_W / 2 + 0.03, CARD_H / 2 - 0.075, 0.012]} fontSize={0.033} color="#0f172a" anchorX="left" anchorY="top" font={FONT_BOLD} maxWidth={CARD_W - 0.06} lineHeight={1.18}>
        {card.headline}
      </Text>
      {/* The two things to check */}
      {card.clues.map((clue, i) => (
        <group key={i} position={[0, -CARD_H / 2 + 0.105 - i * 0.052, 0.012]}>
          <RoundedBox args={[CARD_W - 0.06, 0.044, 0.004]} radius={0.012} smoothness={2}>
            <meshBasicMaterial color="#e2e8f0" toneMapped={false} />
          </RoundedBox>
          <Text position={[-CARD_W / 2 + 0.05, 0, 0.004]} fontSize={0.019} color="#64748b" anchorX="left" anchorY="middle" font={FONT_BOLD}>
            {`${t("CHECK", "CEK")} ${i + 1}`}
          </Text>
          <Text position={[-CARD_W / 2 + 0.155, 0, 0.004]} fontSize={0.022} color="#0f172a" anchorX="left" anchorY="middle" font={FONT_BOLD} maxWidth={CARD_W - 0.2}>
            {clue}
          </Text>
        </group>
      ))}
      {/* Coach text on tutorial posts */}
      {card.coach && (
        <group position={[0, CARD_H / 2 + 0.07, 0]}>
          <RoundedBox args={[CARD_W + 0.1, 0.075, 0.01]} radius={0.02} smoothness={2}>
            <meshBasicMaterial color="#0f172a" transparent opacity={0.9} toneMapped={false} />
          </RoundedBox>
          <Text position={[0, 0, 0.008]} fontSize={0.026} color="#fde68a" anchorX="center" anchorY="middle" font={FONT_BOLD} maxWidth={CARD_W + 0.05} textAlign="center">
            {`TUTORIAL: ${card.coach}`}
          </Text>
        </group>
      )}
      {/* Reading-time bar */}
      <mesh ref={bar} position={[0, -CARD_H / 2 - 0.018, 0.01]}>
        <planeGeometry args={[CARD_W, 0.012]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>
    </group>
  );
}

/** A big block that the player slashes (VR) or clicks (desktop) to trigger an action. */
function SlashButton({ label, position, color, onHit }: { label: string; position: [number, number, number]; color: string; onHit: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const armed = useRef(false);
  useEffect(() => {
    const id = setTimeout(() => { armed.current = true; }, 600);
    return () => clearTimeout(id);
  }, []);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2) * 0.01;
    if (!armed.current || !ref.current) return;
    const saber = bladeHits(ref.current, BUTTON_HALF);
    if (saber) {
      armed.current = false;
      saber.pulse();
      sfx.slash();
      onHit();
    }
  });
  return (
    <group ref={ref} position={position}>
      <RoundedBox args={[0.54, 0.22, 0.08]} radius={0.03} smoothness={2} onClick={(e) => { e.stopPropagation(); onHit(); }}>
        <meshBasicMaterial color={color} toneMapped={false} />
      </RoundedBox>
      <Text position={[0, 0, 0.045]} fontSize={0.05} color="#0f172a" anchorX="center" anchorY="middle" font={FONT_BOLD} maxWidth={0.5} textAlign="center">
        {label}
      </Text>
    </group>
  );
}

function IntegrityBar({ value }: { value: number }) {
  const w = 1.0;
  const color = value > 50 ? "#7dd3fc" : value > 25 ? "#fbbf24" : "#f87171";
  const t = useT();
  return (
    <group>
      <mesh>
        <planeGeometry args={[w, 0.03]} />
        <meshBasicMaterial color="#1e293b" toneMapped={false} />
      </mesh>
      <mesh position-x={(-w / 2) * (1 - value / 100)} scale-x={Math.max(0.001, value / 100)} position-z={0.001}>
        <planeGeometry args={[w, 0.03]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <Text position={[0, 0.04, 0]} fontSize={0.028} color="#cbd5e1" anchorX="center" anchorY="bottom" font={FONT_BOLD}>
        {`${t("FIREWALL INTEGRITY", "KEKUATAN FIREWALL")} ${value}%`}
      </Text>
    </group>
  );
}

/** Always-visible cheat sheet to the player's left. */
function RulesBoard() {
  const t = useT();
  const rules = useLang() === "id" ? FIREWALL_RULES_ID : FIREWALL_RULES;
  const line = (text: string) => `•  ${text}`;
  return (
    <Panel3D position={[-1.75, 1.45, -2.05]} rotation={[0, 0.6, 0]} scale={1.3} width={0.78} height={0.86} title={t("HOW TO DECIDE", "CARA MEMUTUSKAN")}>
      <Text position={[-0.34, 0.24, 0.012]} fontSize={0.03} color="#fda4af" anchorX="left" anchorY="top" font={FONT_BOLD}>
        {t("SLASH (block) when you see:", "TEBAS (blokir) kalau kamu lihat:")}
      </Text>
      <Text position={[-0.34, 0.19, 0.012]} fontSize={0.026} color="#e2e8f0" anchorX="left" anchorY="top" font={FONT} lineHeight={1.4} maxWidth={0.7}>
        {rules.slash.map(line).join("\n")}
      </Text>
      <Text position={[-0.34, -0.07, 0.012]} fontSize={0.03} color="#a7f3d0" anchorX="left" anchorY="top" font={FONT_BOLD}>
        {t("LET IT PASS (trust) when you see:", "BIARKAN LEWAT (percaya) kalau kamu lihat:")}
      </Text>
      <Text position={[-0.34, -0.12, 0.012]} fontSize={0.026} color="#e2e8f0" anchorX="left" anchorY="top" font={FONT} lineHeight={1.4} maxWidth={0.7}>
        {rules.pass.map(line).join("\n")}
      </Text>
    </Panel3D>
  );
}

/** Explains the last decision to the player's right. */
function ExplainPanel({ outcome }: { outcome: Outcome | null }) {
  const t = useT();
  const lang = useLang();
  if (!outcome) return null;
  const card = localizeCard(outcome.card, lang);
  return (
    <Panel3D
      position={[1.75, 1.45, -2.05]}
      rotation={[0, -0.6, 0]}
      scale={1.3}
      width={0.78}
      height={0.6}
      title={outcome.correct ? t("GOOD CALL", "KEPUTUSAN TEPAT") : t("MISTAKE", "KELIRU")}
      titleColor={outcome.correct ? COLORS.cyan : COLORS.amber}
    >
      <Text position={[0, 0.17, 0.012]} fontSize={0.027} color="#ffffff" anchorX="center" anchorY="top" font={FONT_BOLD} maxWidth={0.7} textAlign="center">
        {`${card.suspicious ? t("It was SUSPICIOUS", "Ini MENCURIGAKAN") : t("It was CREDIBLE", "Ini TEPERCAYA")} — ${card.app}`}
      </Text>
      <Text position={[0, 0.1, 0.012]} fontSize={0.024} color="#cbd5e1" anchorX="center" anchorY="top" font={FONT} maxWidth={0.7} textAlign="center" lineHeight={1.3}>
        {`“${card.headline}”`}
      </Text>
      <Text position={[0, -0.1, 0.012]} fontSize={0.026} color="#fde68a" anchorX="center" anchorY="top" font={FONT_BOLD} maxWidth={0.7} textAlign="center" lineHeight={1.3}>
        {card.lesson}
      </Text>
    </Panel3D>
  );
}

// ─── Game ────────────────────────────────────────────────────────────

type Phase = "intro" | "interlude" | "play" | "done";

interface WaveStats { correct: number; total: number }

export default function Firewall() {
  const store = useXRStore();
  const inVR = useXR((st) => st.mode === "immersive-vr");
  const [phase, setPhase] = useState<Phase>("intro");
  const [wave, setWave] = useState(0);
  const [visible, setVisible] = useState<Flying[]>([]);
  const [hud, setHud] = useState({ points: 0, combo: 0, best: 0, correct: 0, done: 0, integrity: 100 });
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [mistakes, setMistakes] = useState<FeedCard[]>([]);
  const [waveStats, setWaveStats] = useState<WaveStats[]>([]);
  const [breached, setBreached] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const lang = useLang();
  const t = useT();

  const decks = useRef<FeedCard[][]>([]);
  const flying = useRef<Flying[]>([]);
  const objects = useRef(new Map<number, { group: THREE.Group; bar: THREE.Mesh | null }>());
  const s = useRef({ points: 0, combo: 0, best: 0, correct: 0, done: 0, integrity: 100, clock: 0, nextSpawn: 0, key: 0, laneTurn: 0 });
  const perWave = useRef<WaveStats[]>([]);
  const wrong = useRef<FeedCard[]>([]);
  const emitSparks = useRef<SparkEmitter | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const total = TOTAL_CARDS;

  useEffect(() => () => clearInterval(timer.current), []);

  const register = useMemo<Register>(() => (key, group, bar) => {
    if (group) objects.current.set(key, { group, bar });
    else objects.current.delete(key);
  }, []);
  const onSparksReady = useMemo(() => (emit: SparkEmitter | null) => { emitSparks.current = emit; }, []);

  const pushHud = () => {
    const v = s.current;
    setHud({ points: v.points, combo: v.combo, best: v.best, correct: v.correct, done: v.done, integrity: v.integrity });
  };

  const beginWave = (w: number) => {
    setWave(w);
    setPhase("interlude");
    setCountdown(3);
    sfx.wave();
    let n = 3;
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      n -= 1;
      setCountdown(n);
      if (n <= 0) {
        clearInterval(timer.current);
        s.current.nextSpawn = s.current.clock + 0.4;
        setPhase("play");
      }
    }, 1000);
  };

  const start = () => {
    decks.current = buildWaves();
    flying.current = [];
    wrong.current = [];
    perWave.current = WAVES.map(() => ({ correct: 0, total: 0 }));
    s.current = { points: 0, combo: 0, best: 0, correct: 0, done: 0, integrity: 100, clock: 0, nextSpawn: 0, key: s.current.key, laneTurn: 0 };
    setVisible([]);
    setMistakes([]);
    setOutcome(null);
    setBreached(false);
    pushHud();
    beginWave(0);
  };

  const finish = (wasBreached: boolean) => {
    const rating = Math.round((FIREWALL_MAX_SCORE * s.current.correct) / total);
    recordScore(FIREWALL_MISSION_ID, rating);
    setMistakes(wrong.current.slice(0, 3));
    setWaveStats(perWave.current.map((x) => ({ ...x })));
    setBreached(wasBreached);
    flying.current = [];
    setVisible([]);
    setPhase("done");
    if (wasBreached) sfx.breach();
  };

  // Leave mid-game without recording a score, back to the intro and out of VR.
  const quit = () => {
    clearInterval(timer.current);
    flying.current = [];
    setVisible([]);
    setOutcome(null);
    setPhase("intro");
    store.getState().session?.end();
  };

  const resolve = (f: Flying, slashed: boolean) => {
    const v = s.current;
    const correct = slashed === f.card.suspicious;
    f.phase = slashed ? "slashed" : "passed";
    f.t = 0;
    v.done++;
    perWave.current[f.wave].total++;
    if (correct) {
      v.correct++;
      perWave.current[f.wave].correct++;
      v.combo++;
      v.best = Math.max(v.best, v.combo);
      v.points += (slashed ? 100 : 60) * Math.min(4, 1 + Math.floor(v.combo / 4));
      sfx.good();
    } else {
      v.combo = 0;
      v.integrity = Math.max(0, v.integrity - INTEGRITY_HIT);
      wrong.current.push(f.card);
      sfx.bad();
    }
    if (slashed) {
      const g = objects.current.get(f.key)?.group;
      if (g) emitSparks.current?.(g.getWorldPosition(new THREE.Vector3()), correct ? "#7dd3fc" : "#fca5a5");
    }
    setOutcome({
      correct,
      card: f.card,
      text: slashed
        ? correct ? ["Blocked a suspicious post!", "Unggahan mencurigakan diblokir!"] : ["You slashed a credible post", "Kamu menebas unggahan tepercaya"]
        : correct ? ["Credible post — let through", "Unggahan tepercaya — dibiarkan lewat"] : ["A suspicious post got through", "Unggahan mencurigakan lolos"],
    });
    pushHud();
  };

  useFrame((_, rawDt) => {
    if (phase !== "play") return;
    const dt = Math.min(rawDt, 0.05);
    const v = s.current;
    const cfg = WAVES[wave];
    const deck = decks.current[wave];
    v.clock += dt;
    let changed = false;

    // Spawn
    const live = flying.current.filter((f) => f.phase === "incoming" || f.phase === "reading" || f.phase === "approach");
    const canSpawn = cfg.spawnEvery === 0 ? live.length === 0 : v.clock >= v.nextSpawn;
    if (deck.length && live.length < cfg.maxActive && canSpawn) {
      const used = new Set(live.map((f) => f.x));
      const free = cfg.lanes.filter(([x]) => !used.has(x));
      if (free.length) {
        const [x, y] = free[v.laneTurn++ % free.length];
        flying.current.push({ key: ++v.key, card: deck.shift()!, wave, x, y, z: SPAWN_Z, phase: "incoming", t: 0 });
        v.nextSpawn = v.clock + cfg.spawnEvery;
        changed = true;
      }
    }

    for (const f of flying.current) {
      const o = objects.current.get(f.key);
      f.t += dt;
      if (f.phase === "incoming") {
        // Ease in quickly to the reading position.
        const k = Math.min(1, f.t / 0.6);
        f.z = SPAWN_Z + (READ_Z - SPAWN_Z) * (1 - (1 - k) ** 3);
        if (k >= 1) { f.phase = "reading"; f.t = 0; }
      } else if (f.phase === "reading") {
        if (o?.bar) {
          const left = Math.max(0, 1 - f.t / readFor(f));
          o.bar.scale.x = Math.max(0.001, left);
          o.bar.position.x = (-CARD_W / 2) * (1 - left);
        }
        if (o) o.group.position.y = f.y + Math.sin(f.t * 2.2) * 0.012;
        if (f.t >= readFor(f)) { f.phase = "approach"; f.t = 0; }
      } else if (f.phase === "approach") {
        f.z = READ_Z + (PASS_Z - READ_Z) * Math.min(1, f.t / cfg.approachSeconds);
        if (f.t >= cfg.approachSeconds) resolve(f, false);
      }

      if (o && (f.phase === "incoming" || f.phase === "reading" || f.phase === "approach")) {
        o.group.position.z = f.z;
        if (inVR && f.z > HIT_ZONE[0] && f.z < HIT_ZONE[1]) {
          o.group.updateMatrixWorld();
          const saber = bladeHits(o.group, CARD_HALF);
          if (saber) {
            saber.pulse();
            sfx.slash();
            resolve(f, true);
          }
        }
      } else if (o) {
        // Exit animations: slashed cards burst apart, passed cards slide behind the player.
        if (f.phase === "slashed") {
          o.group.position.y = f.y + f.t * 1.6;
          o.group.rotation.z = f.t * 7;
          o.group.scale.setScalar(Math.max(0.01, 1 - f.t * 2));
        } else {
          o.group.position.z = f.z + f.t * 3;
        }
      }
    }

    const before = flying.current.length;
    flying.current = flying.current.filter((f) => !(f.phase === "slashed" || f.phase === "passed") || f.t < 0.55);
    if (flying.current.length !== before) changed = true;
    if (changed) setVisible([...flying.current]);

    if (v.integrity <= 0) {
      finish(true);
      return;
    }
    if (!deck.length && flying.current.length === 0) {
      if (wave + 1 < WAVES.length) beginWave(wave + 1);
      else finish(false);
    }
  });

  const multiplier = Math.min(4, 1 + Math.floor(hud.combo / 4));
  const rating = Math.round((FIREWALL_MAX_SCORE * hud.correct) / total);

  return (
    <group>
      <Sparks onReady={onSparksReady} />

      {/* Gate the posts arrive through */}
      <group position={[0, 1.36, READ_Z - 0.2]}>
        <mesh>
          <torusGeometry args={[1.25, 0.01, 8, 96]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.45} toneMapped={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.32, 0.004, 6, 96]} />
          <meshBasicMaterial color="#e0f2fe" transparent opacity={0.25} toneMapped={false} />
        </mesh>
      </group>

      {phase === "intro" && (
        <>
          <Panel3D
            position={[0, 1.7, -2.3]}
            scale={1.2}
            width={1.5}
            height={0.9}
            bodySize={0.038}
            title={t("MISINFORMATION FIREWALL", "FIREWALL MISINFORMASI")}
            body={t(
              "You are the firewall. Posts from WhatsApp, SMS, Instagram and news sites fly in and hover in front of you.\n\nRead the sender and the two CHECKS on each post, then:\nSLASH it if it's a scam or fake.  LET IT PASS if it's credible.\n\nThe board on your left lists the rules. The first two posts are a tutorial.",
              "Kamulah firewall-nya. Unggahan dari WhatsApp, SMS, Instagram, dan situs berita melayang dan berhenti di depanmu.\n\nBaca pengirim dan dua CEK di setiap unggahan, lalu:\nTEBAS kalau itu penipuan atau palsu.  BIARKAN LEWAT kalau tepercaya.\n\nPapan di sebelah kirimu berisi aturannya. Dua unggahan pertama adalah tutorial.",
            )}
          />
          <SlashButton label={inVR ? t("SLASH TO START", "TEBAS UNTUK MULAI") : t("CLICK TO START", "KLIK UNTUK MULAI")} position={[0, 1.12, -0.95]} color="#e0f2fe" onHit={start} />
        </>
      )}

      {phase === "interlude" && (
        <group position={[0, 1.6, -2.5]} scale={1.2}>
          <Text fontSize={0.1} color="#e0f2fe" anchorX="center" anchorY="middle" font={FONT_BOLD}>
            {t(...WAVES[wave].name)}
          </Text>
          <Text position={[0, -0.12, 0]} fontSize={0.05} color="#cbd5e1" anchorX="center" anchorY="middle" font={FONT}>
            {t(...WAVES[wave].subtitle)}
          </Text>
          <Text position={[0, -0.32, 0]} fontSize={0.16} color="#ffffff" anchorX="center" anchorY="middle" font={FONT_BOLD}>
            {countdown > 0 ? String(countdown) : t("GO", "MULAI")}
          </Text>
        </group>
      )}

      {(phase === "play" || phase === "interlude") && (
        <>
          <RulesBoard />
          <ExplainPanel outcome={outcome} />
          <QuitControl onQuit={quit} />
          {visible.map((f) => (
            <CardMesh key={f.key} f={f} register={register} onClick={() => (f.phase === "reading" || f.phase === "approach" || f.phase === "incoming") && resolve(f, true)} />
          ))}
          <group position={[0, 2.35, -3.0]} scale={1.25}>
            <Text fontSize={0.075} color="#f1f5f9" anchorX="center" anchorY="middle" font={FONT_BOLD}>
              {`${hud.points} ${t("PTS", "POIN")}   ×${multiplier}   ${hud.done}/${total}`}
            </Text>
            {outcome && (
              <Text position={[0, -0.11, 0]} fontSize={0.05} color={outcome.correct ? "#bae6fd" : "#fcd34d"} anchorX="center" anchorY="middle" font={FONT_BOLD} maxWidth={2.6} textAlign="center">
                {t(...outcome.text)}
              </Text>
            )}
            <group position={[0, -0.24, 0]}>
              <IntegrityBar value={hud.integrity} />
            </group>
          </group>
          {!inVR && (
            <Text position={[0, 0.7, -0.9]} fontSize={0.032} color="#94a3b8" anchorX="center" font={FONT}>
              {t("Desktop preview: click a card to slash it", "Pratinjau desktop: klik kartu untuk menebasnya")}
            </Text>
          )}
        </>
      )}

      {phase === "done" && (
        <>
          <Panel3D
            position={[0, 1.7, -2.3]}
            scale={1.2}
            width={1.45}
            height={0.95}
            bodySize={0.038}
            title={breached ? t("FIREWALL BREACHED", "FIREWALL JEBOL") : t("FIREWALL REPORT", "LAPORAN FIREWALL")}
            titleColor={breached ? COLORS.amber : COLORS.cyan}
            body={`${hud.correct} ${t("correct", "benar")}  ·  ${hud.points} ${t("pts", "poin")}  ·  ${t("best combo", "kombo terbaik")} ${hud.best}  ·  ${t("rating", "nilai")} ${rating}/${FIREWALL_MAX_SCORE}\n${waveStats.map((w, i) => `${t(...WAVES[i].short)}: ${w.correct}/${w.total}`).join("    ")}${mistakes.length ? `\n\n${t("What to remember:", "Yang perlu diingat:")}\n` + mistakes.map((m) => `• ${localizeCard(m, lang).lesson}`).join("\n") : `\n\n${t("Perfect firewall. Nothing got past you.", "Firewall sempurna. Tidak ada yang lolos.")}`}`}
          />
          <SlashButton label={t("PLAY AGAIN", "MAIN LAGI")} position={[-0.32, 1.05, -0.95]} color="#e0f2fe" onHit={start} />
          <SlashButton label={t("EXIT VR", "KELUAR VR")} position={[0.32, 1.05, -0.95]} color="#94a3b8" onHit={() => store.getState().session?.end()} />
        </>
      )}
    </group>
  );
}
