"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import { XRControllerModel, useXR, useXRInputSourceStateContext, useXRStore } from "@react-three/xr";
import * as THREE from "three";
import { FIREWALL_CARDS, FIREWALL_MAX_SCORE, FIREWALL_MISSION_ID, type FeedCard } from "@/game/vr/firewallData";
import { recordScore } from "@/game/progress";
import { COLORS, FONT, FONT_BOLD, Panel3D } from "./ui3d";

// ─── Sabers ──────────────────────────────────────────────────────────
// Each controller registers its blade so the game loop can hit-test it.

interface SaberEntry {
  base: THREE.Object3D;
  tip: THREE.Object3D;
  pulse: () => void;
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
      pulse: () => gamepad?.hapticActuators?.[0]?.pulse?.(0.8, 60),
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
    // Slab test of segment a→b against the box [-half, half].
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
function beep(freq: number, ms: number, type: OscillatorType = "sine", gain = 0.08) {
  try {
    audio ??= new AudioContext();
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audio.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audio.currentTime + ms / 1000);
    g.gain.setValueAtTime(gain, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + ms / 1000);
    osc.connect(g).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + ms / 1000);
  } catch {
    /* audio unavailable */
  }
}
const sfx = {
  good: () => { beep(880, 160, "triangle"); beep(1320, 120, "sine", 0.05); },
  bad: () => beep(160, 300, "sawtooth", 0.07),
  slash: () => beep(500, 90, "square", 0.04),
};

// ─── Game ────────────────────────────────────────────────────────────

const CARD_W = 0.58;
const CARD_H = 0.34;
const CARD_HALF = new THREE.Vector3(CARD_W / 2, CARD_H / 2, 0.09);
const BUTTON_HALF = new THREE.Vector3(0.27, 0.11, 0.12);
const LANES_X = [-0.5, 0, 0.5];
const LANES_Y = [1.12, 1.48];
const SPAWN_Z = -10;
const PASS_Z = 0.6;
const HIT_ZONE: [number, number] = [-1.5, 0.45];

interface Flying {
  key: number;
  card: FeedCard;
  x: number;
  y: number;
  z: number;
  status: "flying" | "slashed" | "passed";
  since: number;
}

type Outcome = { correct: boolean; text: string };

function CardMesh({ f, register, onClick }: { f: Flying; register: (key: number, g: THREE.Group | null) => void; onClick: () => void }) {
  return (
    <group ref={(g) => register(f.key, g)} position={[f.x, f.y, f.z]}>
      <RoundedBox args={[CARD_W, CARD_H, 0.02]} radius={0.02} smoothness={2} onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <meshBasicMaterial color="#e8edf5" toneMapped={false} />
      </RoundedBox>
      <Text position={[-CARD_W / 2 + 0.03, CARD_H / 2 - 0.035, 0.012]} fontSize={0.022} color="#475569" anchorX="left" anchorY="middle" font={FONT_BOLD} maxWidth={CARD_W - 0.06}>
        {f.card.source}
      </Text>
      <Text position={[-CARD_W / 2 + 0.03, CARD_H / 2 - 0.075, 0.012]} fontSize={0.034} color="#0f172a" anchorX="left" anchorY="top" font={FONT_BOLD} maxWidth={CARD_W - 0.06} lineHeight={1.2}>
        {f.card.headline}
      </Text>
      <group position={[0, -CARD_H / 2 + 0.04, 0.012]}>
        <RoundedBox args={[CARD_W - 0.06, 0.045, 0.004]} radius={0.012} smoothness={2}>
          <meshBasicMaterial color="#fde68a" toneMapped={false} />
        </RoundedBox>
        <Text position={[0, 0, 0.004]} fontSize={0.022} color="#78350f" anchorX="center" anchorY="middle" font={FONT_BOLD} maxWidth={CARD_W - 0.1}>
          {`CLUE: ${f.card.cue}`}
        </Text>
      </group>
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
  useFrame(() => {
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
      <Text position={[0, 0, 0.045]} fontSize={0.05} color="#001014" anchorX="center" anchorY="middle" font={FONT_BOLD} maxWidth={0.5} textAlign="center">
        {label}
      </Text>
    </group>
  );
}

export default function Firewall() {
  const store = useXRStore();
  const inVR = useXR((s) => s.mode === "immersive-vr");
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [visible, setVisible] = useState<Flying[]>([]);
  const [hud, setHud] = useState({ points: 0, combo: 0, best: 0, correct: 0, done: 0 });
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [mistakes, setMistakes] = useState<FeedCard[]>([]);

  const queue = useRef<FeedCard[]>([]);
  const flying = useRef<Flying[]>([]);
  const groups = useRef(new Map<number, THREE.Group>());
  const stats = useRef({ points: 0, combo: 0, best: 0, correct: 0, done: 0, spawned: 0, nextSpawn: 0, clock: 0, key: 0 });
  const wrong = useRef<FeedCard[]>([]);
  const total = FIREWALL_CARDS.length;

  const register = useMemo(() => (key: number, g: THREE.Group | null) => {
    if (g) groups.current.set(key, g);
    else groups.current.delete(key);
  }, []);

  const start = () => {
    const deck = [...FIREWALL_CARDS];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    queue.current = deck;
    flying.current = [];
    wrong.current = [];
    stats.current = { points: 0, combo: 0, best: 0, correct: 0, done: 0, spawned: 0, nextSpawn: 1.2, clock: 0, key: stats.current.key };
    setVisible([]);
    setMistakes([]);
    setOutcome(null);
    setHud({ points: 0, combo: 0, best: 0, correct: 0, done: 0 });
    setPhase("play");
  };

  const resolve = (f: Flying, slashed: boolean) => {
    const s = stats.current;
    const correct = slashed === f.card.suspicious;
    f.status = slashed ? "slashed" : "passed";
    f.since = s.clock;
    s.done++;
    if (correct) {
      s.correct++;
      s.combo++;
      s.best = Math.max(s.best, s.combo);
      s.points += (slashed ? 100 : 50) * Math.min(4, 1 + Math.floor(s.combo / 4));
      sfx.good();
    } else {
      s.combo = 0;
      s.points = Math.max(0, s.points - 50);
      wrong.current.push(f.card);
      sfx.bad();
    }
    setOutcome({
      correct,
      text: slashed
        ? correct ? `Blocked! ${f.card.cue}` : "That one was credible!"
        : correct ? "Credible — let through" : `Missed a fake: ${f.card.cue}`,
    });
    setHud({ points: s.points, combo: s.combo, best: s.best, correct: s.correct, done: s.done });
  };

  const finish = () => {
    const rating = Math.round((FIREWALL_MAX_SCORE * stats.current.correct) / total);
    recordScore(FIREWALL_MISSION_ID, rating);
    setMistakes(wrong.current.slice(0, 3));
    setPhase("done");
  };

  useFrame((_, rawDt) => {
    if (phase !== "play") return;
    const dt = Math.min(rawDt, 0.05);
    const s = stats.current;
    s.clock += dt;
    let changed = false;

    // Spawn: speed and frequency ramp up as the run goes on.
    if (s.clock >= s.nextSpawn && queue.current.length) {
      const card = queue.current.shift()!;
      flying.current.push({
        key: ++s.key,
        card,
        x: LANES_X[Math.floor(Math.random() * LANES_X.length)],
        y: LANES_Y[Math.floor(Math.random() * LANES_Y.length)],
        z: SPAWN_Z,
        status: "flying",
        since: 0,
      });
      s.spawned++;
      s.nextSpawn = s.clock + Math.max(1.15, 2.1 - s.spawned * 0.05);
      changed = true;
    }

    const speed = 2.1 + Math.min(1.3, s.spawned * 0.06);
    for (const f of flying.current) {
      const g = groups.current.get(f.key);
      if (f.status === "flying") {
        f.z += speed * dt;
        if (g) {
          g.position.z = f.z;
          if (inVR && f.z > HIT_ZONE[0] && f.z < HIT_ZONE[1]) {
            g.updateMatrixWorld();
            const saber = bladeHits(g, CARD_HALF);
            if (saber) {
              saber.pulse();
              sfx.slash();
              resolve(f, true);
            }
          }
        }
        if (f.status === "flying" && f.z > PASS_Z) resolve(f, false);
      } else if (g) {
        // Exit animation: slashed cards spin away, passed cards fade behind the player.
        const t = s.clock - f.since;
        if (f.status === "slashed") {
          g.position.y = f.y + t * 1.5;
          g.rotation.z = t * 6;
          g.scale.setScalar(Math.max(0.01, 1 - t * 1.8));
        } else {
          g.position.z = f.z + t * 3;
        }
      }
    }

    const before = flying.current.length;
    flying.current = flying.current.filter((f) => f.status === "flying" || s.clock - f.since < 0.6);
    if (flying.current.length !== before) changed = true;
    if (changed) setVisible([...flying.current]);

    if (s.done >= total && flying.current.length === 0) finish();
  });

  return (
    <group>
      {/* Gate frame that cards fly through */}
      <mesh position={[0, 1.3, -1.6]}>
        <torusGeometry args={[1.25, 0.012, 8, 64]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.35} toneMapped={false} />
      </mesh>

      {phase === "intro" && (
        <>
          <Panel3D
            position={[0, 1.62, -1.5]}
            width={1.3}
            height={0.66}
            bodySize={0.045}
            title="MISINFORMATION FIREWALL"
            body={"Posts are flying at you.\nSLASH the suspicious ones (scams, fakes, manipulation).\nLET CREDIBLE ONES PASS (official, named, confirmed).\nRead the CLUE line on each card — it's your best hint."}
          />
          <SlashButton label={inVR ? "SLASH TO START" : "CLICK TO START"} position={[0, 1.15, -0.75]} color={COLORS.cyan} onHit={start} />
        </>
      )}

      {phase === "play" && (
        <>
          {visible.map((f) => (
            <CardMesh key={f.key} f={f} register={register} onClick={() => f.status === "flying" && resolve(f, true)} />
          ))}
          <group position={[0, 2.05, -2.2]}>
            <Text fontSize={0.09} color={COLORS.text} anchorX="center" anchorY="middle" font={FONT_BOLD}>
              {`${hud.points} PTS   ×${Math.min(4, 1 + Math.floor(hud.combo / 4))}   ${hud.done}/${total}`}
            </Text>
            {outcome && (
              <Text position={[0, -0.13, 0]} fontSize={0.06} color={outcome.correct ? COLORS.green : COLORS.red} anchorX="center" anchorY="middle" font={FONT_BOLD} maxWidth={2.6} textAlign="center">
                {outcome.text}
              </Text>
            )}
          </group>
          {!inVR && (
            <Text position={[0, 0.72, -0.9]} fontSize={0.035} color="#94a3b8" anchorX="center" font={FONT}>
              Desktop preview: click a card to slash it
            </Text>
          )}
        </>
      )}

      {phase === "done" && (
        <>
          <Panel3D
            position={[0, 1.6, -1.5]}
            width={1.3}
            height={0.86}
            bodySize={0.04}
            title="FIREWALL REPORT"
            body={`${hud.correct} of ${total} correct  ·  ${hud.points} pts  ·  best combo ${hud.best}\nRating: ${Math.round((FIREWALL_MAX_SCORE * hud.correct) / total)} / ${FIREWALL_MAX_SCORE}${mistakes.length ? "\n\nWhat to remember:\n" + mistakes.map((m) => `• ${m.lesson}`).join("\n") : "\n\nPerfect firewall. Nothing got past you."}`}
          />
          <SlashButton label="PLAY AGAIN" position={[-0.32, 1.0, -0.75]} color={COLORS.cyan} onHit={start} />
          <SlashButton label="EXIT VR" position={[0.32, 1.0, -0.75]} color="#94a3b8" onHit={() => store.getState().session?.end()} />
        </>
      )}
    </group>
  );
}
