"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture, RoundedBox } from "@react-three/drei";
import { Handle, defaultApply, type HandleState } from "@react-three/handle";
import { useXRStore, useXRInputSourceState } from "@react-three/xr";
import * as THREE from "three";
import { LAB_MAX_SCORE, LAB_MISSION_ID, labEvidenceFor, type LabEvidence } from "@/game/vr/labData";
import { useLang, useT } from "@/lib/i18n";
import { recordScore } from "@/game/progress";
import { Button3D, COLORS, FONT, FONT_BOLD, Panel3D } from "./ui3d";

// ─── Layout (metres, standing player at the origin facing -Z) ─────────
const PHOTO_WIDTH = 0.42;
const LENS_RADIUS = 0.07;
const MAGNIFY = 1; // the lens reveals hints at normal size (no magnification)
const ZOOM_MIN = 1;
const ZOOM_MAX = 1.9; // ~0.8 m wide at most — stays inside the field of view
const DESK_Y = 0.64;
// How far the desk sits beyond its original spot (negative = further from the player).
const DESK_PUSH = -0.25;
const STAND_POS = new THREE.Vector3(0, DESK_Y + 0.33, -0.62 + DESK_PUSH);
const STAND_QUAT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.28, 0, 0));
const LENS_POS = new THREE.Vector3(0.24, DESK_Y + 0.14, -0.34 + DESK_PUSH);
const BINS = { real: { x: -0.52, z: -0.5 + DESK_PUSH }, ai: { x: 0.52, z: -0.5 + DESK_PUSH } } as const;
const BIN_HALF = { x: 0.2, z: 0.2 };
// Where the photo may be moved (keeps it within reach and view).
const BOUNDS = { min: new THREE.Vector3(-0.85, DESK_Y - 0.02, -1.15 + DESK_PUSH), max: new THREE.Vector3(0.85, 1.85, -0.18 + DESK_PUSH) };
const POINTS_CORRECT = 100;
const POINTS_SCANNED = 25;
const TINT = { real: "#a7f3d0", ai: "#fecdd3" };

type Bin = keyof typeof BINS;

function binUnder(p: THREE.Vector3): Bin | null {
  if (p.y > DESK_Y + 0.45) return null;
  for (const bin of Object.keys(BINS) as Bin[]) {
    const b = BINS[bin];
    if (Math.abs(p.x - b.x) < BIN_HALF.x && Math.abs(p.z - b.z) < BIN_HALF.z) return bin;
  }
  return null;
}

/** Draws the neutral "where to look" hints for one image onto a transparent canvas. */
function useClueTexture(ev: LabEvidence) {
  return useMemo(() => {
    const w = 1024;
    const h = Math.round(w * ev.aspect);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.font = "bold 30px 'Atkinson Hyperlegible', Arial, sans-serif";
    ctx.textBaseline = "middle";
    for (const c of ev.clues) {
      const x = c.x * w;
      const y = c.y * h;
      const r = c.r * w;
      ctx.lineWidth = 7;
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      ctx.arc(x, y, r + 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.setLineDash([20, 12]);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      const tw = ctx.measureText(c.label).width + 24;
      const below = y + r + 50 < h;
      const ly = below ? y + r + 28 : y - r - 28;
      const lx = Math.min(Math.max(x - tw / 2, 8), w - tw - 8);
      ctx.fillStyle = "rgba(15,23,42,0.86)";
      ctx.beginPath();
      ctx.roundRect(lx, ly - 21, tw, 42, 12);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(c.label, lx + 12, ly + 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [ev]);
}

/** Magnifier overlay: inside the lens the photo is enlarged and the hints appear; after answering all hints show. */
function makeLensMaterial(photo: THREE.Texture, clues: THREE.Texture, size: THREE.Vector2) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      photo: { value: photo },
      clues: { value: clues },
      size: { value: size },
      lensLocal: { value: new THREE.Vector2(0, -10) },
      radius: { value: LENS_RADIUS },
      lensActive: { value: 0 },
      reveal: { value: 0 },
      mag: { value: MAGNIFY },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec2 vLocal;
      void main() {
        vUv = uv;
        vLocal = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D photo;
      uniform sampler2D clues;
      uniform vec2 size;
      uniform vec2 lensLocal;
      uniform float radius;
      uniform float lensActive;
      uniform float reveal;
      uniform float mag;
      varying vec2 vUv;
      varying vec2 vLocal;
      void main() {
        float d = distance(vLocal, lensLocal);
        float inside = lensActive * (1.0 - smoothstep(radius * 0.93, radius * 0.96, d));
        float ring = lensActive * smoothstep(radius * 0.93, radius * 0.96, d) * (1.0 - smoothstep(radius * 0.98, radius, d));

        vec4 shown = texture2D(clues, vUv);
        shown.a *= reveal;

        vec2 lensUv = lensLocal / size + 0.5;
        vec2 zuv = clamp(lensUv + (vUv - lensUv) / mag, 0.0, 1.0);
        vec4 p = texture2D(photo, zuv);
        vec4 c = texture2D(clues, zuv);
        vec3 magnified = mix(p.rgb, c.rgb, c.a);

        vec3 rgb = mix(shown.rgb, magnified, inside);
        float a = max(shown.a, inside);
        rgb = mix(rgb, vec3(0.86, 0.96, 1.0), ring);
        a = max(a, ring);
        gl_FragColor = vec4(rgb, a);
        #include <colorspace_fragment>
      }`,
  });
}

interface Homing { pos: THREE.Vector3; quat: THREE.Quaternion }
interface HomingApi { get: () => Homing | null; clear: () => void }

function Evidence({
  ev, photoRef, lensRef, zoomRef, reveal, onDrop, onScanned, onHoverBin, homing, onHold,
}: {
  ev: LabEvidence;
  photoRef: React.RefObject<THREE.Group | null>;
  lensRef: React.RefObject<THREE.Group | null>;
  zoomRef: React.RefObject<number>;
  reveal: boolean;
  onDrop: (bin: Bin | null) => void;
  onScanned: () => void;
  onHoverBin: (bin: Bin | null) => void;
  homing: HomingApi;
  onHold: (hand: XRHandedness | null) => void;
}) {
  const photo = useTexture(ev.src, (t) => { t.colorSpace = THREE.SRGBColorSpace; });
  const clueTex = useClueTexture(ev);
  const height = PHOTO_WIDTH * ev.aspect;
  const material = useMemo(() => makeLensMaterial(photo, clueTex, new THREE.Vector2(PHOTO_WIDTH, height)), [photo, clueTex, height]);
  const innerRef = useRef<THREE.Group>(null);
  const overlayRef = useRef<THREE.Mesh>(null);
  const held = useRef(false);
  const grabbingHand = useRef<XRHandedness | null>(null);
  const lastHover = useRef<Bin | null>(null);
  const scanTime = useRef(0);
  const scannedSent = useRef(false);
  const tmp = useMemo(() => ({ world: new THREE.Vector3(), inner: new THREE.Vector3(), outer: new THREE.Vector3() }), []);

  useEffect(() => () => { material.dispose(); clueTex.dispose(); }, [material, clueTex]);

  useFrame((_, dt) => {
    const outer = photoRef.current;
    const inner = innerRef.current;
    const lens = lensRef.current;
    const overlay = overlayRef.current;
    if (!outer || !inner || !lens || !overlay) return;

    // Zoom (limited) and fly-home animation.
    inner.scale.setScalar(zoomRef.current);
    const home = homing.get();
    if (home && !held.current) {
      const k = 1 - Math.exp(-dt * 9);
      outer.position.lerp(home.pos, k);
      outer.quaternion.slerp(home.quat, k);
      if (outer.position.distanceTo(home.pos) < 0.002) homing.clear();
    }

    // Highlight the tray under a held photo.
    if (held.current) {
      const hover = binUnder(outer.getWorldPosition(tmp.world));
      if (hover !== lastHover.current) {
        lastHover.current = hover;
        onHoverBin(hover);
      }
    }

    // Lens position in the photo's own coordinates (independent of how the lens is rotated).
    const uniforms = (overlay.material as THREE.ShaderMaterial).uniforms;
    uniforms.reveal.value = reveal ? 1 : 0;
    lens.getWorldPosition(tmp.world);
    tmp.inner.copy(tmp.world);
    inner.worldToLocal(tmp.inner);
    tmp.outer.copy(tmp.world);
    outer.worldToLocal(tmp.outer);
    const inFront = tmp.outer.z > -0.02 && tmp.outer.z < 0.3;
    const zoom = zoomRef.current;
    const over = Math.abs(tmp.inner.x) < PHOTO_WIDTH / 2 + LENS_RADIUS / zoom && Math.abs(tmp.inner.y) < height / 2 + LENS_RADIUS / zoom;
    uniforms.lensActive.value = inFront && over ? 1 : 0;
    uniforms.lensLocal.value.set(tmp.inner.x, tmp.inner.y);
    uniforms.radius.value = LENS_RADIUS / zoom;

    if (inFront && Math.abs(tmp.inner.x) < PHOTO_WIDTH / 2 && Math.abs(tmp.inner.y) < height / 2) {
      scanTime.current += dt;
      if (scanTime.current > 0.5 && !scannedSent.current) {
        scannedSent.current = true;
        onScanned();
      }
    }
  });

  const apply = (state: HandleState<unknown>, target: THREE.Object3D) => {
    defaultApply(state, target);
    target.position.clamp(BOUNDS.min, BOUNDS.max);
    if (state.first) {
      held.current = true;
      homing.clear();
      onHold(grabbingHand.current);
    }
    if (state.last) {
      held.current = false;
      onHold(null);
      lastHover.current = null;
      onHoverBin(null);
      onDrop(binUnder(target.getWorldPosition(new THREE.Vector3())));
    }
  };

  return (
    <group ref={photoRef} position={STAND_POS} quaternion={STAND_QUAT}>
      <Handle targetRef={photoRef} scale={false} apply={apply}>
        {/* Remember which controller grabbed the photo: only that hand may zoom. */}
        <group
          ref={innerRef}
          onPointerDown={(e) => {
            const src = (e as unknown as { pointerState?: { inputSource?: XRInputSource } }).pointerState?.inputSource;
            grabbingHand.current = src?.handedness ?? null;
          }}
        >
          <mesh position-z={-0.004}>
            <boxGeometry args={[PHOTO_WIDTH + 0.02, height + 0.02, 0.006]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.5} />
          </mesh>
          <mesh>
            <planeGeometry args={[PHOTO_WIDTH, height]} />
            <meshBasicMaterial map={photo} toneMapped={false} />
          </mesh>
          <mesh ref={overlayRef} position-z={0.0015} material={material}>
            <planeGeometry args={[PHOTO_WIDTH, height]} />
          </mesh>
        </group>
      </Handle>
    </group>
  );
}

/** Magnifying glass: follows the controller's full pose, so it can be turned and tilted freely. */
function Magnifier({ lensRef }: { lensRef: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={lensRef} position={LENS_POS}>
      <Handle targetRef={lensRef} scale={false} projectRays={false}>
        <group>
          <mesh>
            <torusGeometry args={[LENS_RADIUS, 0.008, 14, 56]} />
            <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh>
            <circleGeometry args={[LENS_RADIUS, 48]} />
            <meshBasicMaterial color="#bae6fd" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          {/* Orientation ticks so turning the lens is visible */}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a) => (
            <mesh key={a} position={[Math.cos(a) * (LENS_RADIUS - 0.012), Math.sin(a) * (LENS_RADIUS - 0.012), 0]} rotation-z={a}>
              <boxGeometry args={[0.012, 0.002, 0.002]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          ))}
          <mesh position={[0, -LENS_RADIUS - 0.065, 0]}>
            <cylinderGeometry args={[0.013, 0.016, 0.12, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.3} roughness={0.5} />
          </mesh>
          <Text position={[0, LENS_RADIUS + 0.028, 0]} fontSize={0.02} color="#334155" anchorX="center" font={FONT_BOLD}>
            AI SCANNER
          </Text>
        </group>
      </Handle>
    </group>
  );
}

/** Open glass tray with a lit rim and a label plate that doubles as a button. */
function Tray({ bin, label, releaseLabel, hover, enabled, onPress }: { bin: Bin; label: string; releaseLabel: string; hover: boolean; enabled: boolean; onPress: () => void }) {
  const { x, z } = BINS[bin];
  const tint = TINT[bin];
  const w = 0.36;
  const d = 0.32;
  const h = 0.08;
  const wall = (pos: [number, number, number], size: [number, number, number]) => (
    <mesh position={pos}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#e2e8f0" transparent opacity={0.16} roughness={0.15} metalness={0.1} depthWrite={false} />
    </mesh>
  );
  return (
    <group position={[x, DESK_Y, z]}>
      {/* Base */}
      <mesh position-y={0.004}>
        <boxGeometry args={[w, 0.008, d]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>
      <mesh position-y={0.009} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[w - 0.03, d - 0.03]} />
        <meshBasicMaterial color={tint} transparent opacity={hover ? 0.6 : 0.25} toneMapped={false} />
      </mesh>
      {/* Frosted walls */}
      {wall([0, h / 2, -d / 2], [w, h, 0.006])}
      {wall([0, h / 2, d / 2], [w, h, 0.006])}
      {wall([-w / 2, h / 2, 0], [0.006, h, d])}
      {wall([w / 2, h / 2, 0], [0.006, h, d])}
      {/* Lit rim */}
      {[[0, -d / 2, w, 0.006], [0, d / 2, w, 0.006], [-w / 2, 0, 0.006, d], [w / 2, 0, 0.006, d]].map(([px, pz, sx, sz], i) => (
        <mesh key={i} position={[px, h, pz]}>
          <boxGeometry args={[sx, 0.004, sz]} />
          <meshBasicMaterial color={tint} transparent opacity={hover ? 1 : 0.6} toneMapped={false} />
        </mesh>
      ))}
      {/* Label plate / button behind the tray */}
      <group position={[0, h + 0.13, -d / 2 - 0.01]} rotation-x={-0.2}>
        <Button3D
          label={hover ? releaseLabel : label}
          onPress={onPress}
          position={[0, 0, 0]}
          width={0.34}
          height={0.085}
          fontSize={hover ? 0.026 : 0.034}
          color={hover ? tint : "#f1f5f9"}
          textColor="#0f172a"
          disabled={!enabled}
        />
      </group>
    </group>
  );
}

type Phase = "intro" | "play" | "feedback" | "done";

export default function ForensicLab() {
  const store = useXRStore();
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [scanned, setScanned] = useState(false);
  const [hoverBin, setHoverBin] = useState<Bin | null>(null);
  const [zoomLabel, setZoomLabel] = useState(1);
  const [last, setLast] = useState<{ correct: boolean; gained: number } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const photoRef = useRef<THREE.Group>(null);
  const lensRef = useRef<THREE.Group>(null);
  const zoomRef = useRef(1);
  const homing = useRef<Homing | null>(null);
  const homingApi = useMemo<HomingApi>(() => ({ get: () => homing.current, clear: () => { homing.current = null; } }), []);
  const right = useXRInputSourceState("controller", "right");
  const left = useXRInputSourceState("controller", "left");
  const holdingHand = useRef<XRHandedness | null>(null);
  const lang = useLang();
  const t = useT();
  const LAB_EVIDENCE = labEvidenceFor(lang);
  const ev = LAB_EVIDENCE[index];

  const setZoom = (z: number) => {
    zoomRef.current = THREE.MathUtils.clamp(z, ZOOM_MIN, ZOOM_MAX);
    setZoomLabel(Math.round(zoomRef.current * 10) / 10);
  };

  // Thumbstick up/down zooms the photo — only on the controller that is holding it.
  useFrame((_, dt) => {
    if (phase !== "play" && phase !== "feedback") return;
    const hand = holdingHand.current;
    const holder = hand === "right" ? right : hand === "left" ? left : undefined;
    const y = holder?.gamepad?.["xr-standard-thumbstick"]?.yAxis ?? 0;
    if (Math.abs(y) > 0.25) {
      const next = THREE.MathUtils.clamp(zoomRef.current - y * dt * 1.2, ZOOM_MIN, ZOOM_MAX);
      if (Math.abs(next - zoomRef.current) > 1e-4) {
        zoomRef.current = next;
        const rounded = Math.round(next * 10) / 10;
        if (rounded !== zoomLabel) setZoomLabel(rounded);
      }
    }
  });

  const sendHome = (pos = STAND_POS, quat = STAND_QUAT) => {
    homing.current = { pos: pos.clone(), quat: quat.clone() };
  };

  const resetLens = () => {
    lensRef.current?.position.copy(LENS_POS);
    lensRef.current?.rotation.set(0, 0, 0);
  };

  const answer = (bin: Bin) => {
    if (phase !== "play") return;
    const correct = bin === ev.answer;
    const gained = correct ? POINTS_CORRECT + (scanned ? POINTS_SCANNED : 0) : 0;
    setScore((s) => s + gained);
    if (correct) setCorrectCount((c) => c + 1);
    setLast({ correct, gained });
    setPhase("feedback");
    // Drop into the tray, then float back to the stand for review.
    sendHome(new THREE.Vector3(BINS[bin].x, DESK_Y + 0.05, BINS[bin].z), new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)));
    setTimeout(() => sendHome(), 700);
  };

  const drop = (bin: Bin | null) => {
    if (bin && phase === "play") answer(bin);
    else sendHome();
  };

  const startRound = (i: number) => {
    setIndex(i);
    setScanned(false);
    setLast(null);
    setZoom(1);
    setPhase("play");
    requestAnimationFrame(() => {
      photoRef.current?.position.copy(STAND_POS);
      photoRef.current?.quaternion.copy(STAND_QUAT);
      homing.current = null;
      resetLens();
    });
  };

  const next = () => {
    if (index + 1 >= LAB_EVIDENCE.length) {
      recordScore(LAB_MISSION_ID, Math.min(LAB_MAX_SCORE, score));
      setPhase("done");
      return;
    }
    startRound(index + 1);
  };

  const restart = () => {
    setScore(0);
    setCorrectCount(0);
    startRound(0);
  };

  return (
    <group>
      {/* Desk: rounded graphite top, light edge, two pedestals */}
      <RoundedBox args={[1.6, 0.04, 0.66]} radius={0.015} smoothness={3} position={[0, DESK_Y - 0.02, -0.55 + DESK_PUSH]}>
        <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.05} />
      </RoundedBox>
      <mesh position={[0, DESK_Y - 0.02, -0.219 + DESK_PUSH]}>
        <boxGeometry args={[1.56, 0.006, 0.004]} />
        <meshBasicMaterial color="#60a5fa" toneMapped={false} />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <RoundedBox key={x} args={[0.32, DESK_Y - 0.04, 0.5]} radius={0.02} smoothness={2} position={[x, (DESK_Y - 0.04) / 2, -0.58 + DESK_PUSH]}>
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </RoundedBox>
      ))}
      {/* Photo easel (only while there is a photo) */}
      {phase !== "intro" && phase !== "done" && (
        <mesh position={[0, DESK_Y + 0.13, -0.7 + DESK_PUSH]} rotation-x={-0.28}>
          <boxGeometry args={[0.05, 0.24, 0.012]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.5} />
        </mesh>
      )}

      {phase === "intro" && (
        <Panel3D
          position={[0, 1.42, -1.45]}
          width={1.3}
          height={0.84}
          bodySize={0.037}
          title={t("FORENSIC LAB", "LAB FORENSIK")}
          body={t(
            "Eight pieces of evidence. Some are real photos, some were made by AI.\n\n• Point and hold the TRIGGER to grab the photo or the AI Scanner.\n• While holding the photo, push that hand's THUMBSTICK up/down to zoom.\n• Hold the AI Scanner over the photo to reveal where to look (+25 pts).\n• Drop the photo into a tray, or press its label.",
            "Delapan barang bukti. Sebagian foto asli, sebagian dibuat oleh AI.\n\n• Arahkan dan tahan TRIGGER untuk mengambil foto atau Pemindai AI.\n• Sambil memegang foto, dorong THUMBSTICK tangan itu ke atas/bawah untuk zoom.\n• Arahkan Pemindai AI di atas foto untuk melihat bagian yang perlu dicek (+25 poin).\n• Jatuhkan foto ke salah satu baki, atau tekan labelnya.",
          )}
        >
          <Button3D label={t("START INVESTIGATION", "MULAI PENYELIDIKAN")} onPress={restart} position={[0, -0.33, 0.02]} width={0.56} height={0.11} fontSize={0.042} />
        </Panel3D>
      )}

      {(phase === "play" || phase === "feedback") && (
        <>
          <Evidence
            key={ev.id}
            ev={ev}
            photoRef={photoRef}
            lensRef={lensRef}
            zoomRef={zoomRef}
            reveal={phase === "feedback"}
            onDrop={drop}
            onScanned={() => setScanned(true)}
            onHoverBin={setHoverBin}
            homing={homingApi}
            onHold={(hand) => { holdingHand.current = hand; }}
          />
          <Magnifier lensRef={lensRef} />
          <Tray bin="real" label={t("REAL PHOTO", "FOTO ASLI")} releaseLabel={t("RELEASE TO FILE HERE", "LEPAS DI SINI")} hover={hoverBin === "real"} enabled={phase === "play"} onPress={() => answer("real")} />
          <Tray bin="ai" label={t("AI-GENERATED", "BUATAN AI")} releaseLabel={t("RELEASE TO FILE HERE", "LEPAS DI SINI")} hover={hoverBin === "ai"} enabled={phase === "play"} onPress={() => answer("ai")} />

          {/* Zoom controls (also on the thumbstick) */}
          <group position={[-0.17, DESK_Y + 0.05, -0.32 + DESK_PUSH]} rotation-x={-0.6}>
            <Button3D label="−" onPress={() => setZoom(zoomRef.current - 0.15)} position={[0, 0, 0]} width={0.07} height={0.07} fontSize={0.05} color="#e2e8f0" textColor="#0f172a" />
            <Text position={[0.045, 0.07, 0]} fontSize={0.022} color="#334155" anchorX="center" font={FONT_BOLD}>{`ZOOM ${zoomLabel.toFixed(1)}×`}</Text>
            <Button3D label="+" onPress={() => setZoom(zoomRef.current + 0.15)} position={[0.09, 0, 0]} width={0.07} height={0.07} fontSize={0.05} color="#e2e8f0" textColor="#0f172a" />
          </group>

          {/* HUD */}
          <group position={[0, 1.38, -1.3]}>
            <RoundedBox args={[0.7, 0.07, 0.01]} radius={0.02} smoothness={2}>
              <meshBasicMaterial color={COLORS.panel} transparent opacity={0.85} toneMapped={false} />
            </RoundedBox>
            <Text position={[0, 0, 0.008]} fontSize={0.028} color="#e2e8f0" anchorX="center" anchorY="middle" font={FONT_BOLD}>
              {`${t("EVIDENCE", "BUKTI")} ${index + 1}/${LAB_EVIDENCE.length}   ·   ${t("SCORE", "SKOR")} ${score}   ·   ${scanned ? t("SCANNED", "SUDAH DIPINDAI") : t("NOT SCANNED YET", "BELUM DIPINDAI")}`}
            </Text>
          </group>
        </>
      )}

      {phase === "feedback" && last && (
        <Panel3D
          position={[0.8, 1.3, -1.12]}
          rotation={[0, -0.55, 0]}
          width={0.52}
          height={0.6}
          title={last.correct ? `${t("CORRECT", "BENAR")}  +${last.gained}` : t("NOT QUITE", "BELUM TEPAT")}
          titleColor={last.correct ? COLORS.cyan : COLORS.amber}
        >
          <Text position={[0, 0.17, 0.012]} fontSize={0.026} color="#ffffff" anchorX="center" anchorY="top" font={FONT_BOLD}>
            {ev.answer === "ai" ? t("This image is AI-generated", "Gambar ini buatan AI") : t("This is a real photograph", "Ini foto asli")}
          </Text>
          <Text position={[0, 0.12, 0.012]} fontSize={0.021} color={COLORS.text} anchorX="center" anchorY="top" font={FONT} maxWidth={0.46} lineHeight={1.35} textAlign="left">
            {ev.explain}
          </Text>
          <Text position={[0, -0.2, 0.012]} fontSize={0.014} color="#94a3b8" anchorX="center" anchorY="top" font={FONT} maxWidth={0.46}>
            {ev.credit}
          </Text>
          <Button3D label={index + 1 >= LAB_EVIDENCE.length ? t("FINISH", "SELESAI") : t("NEXT EVIDENCE", "BUKTI BERIKUTNYA")} onPress={next} position={[0, -0.26, 0.02]} width={0.38} fontSize={0.032} />
        </Panel3D>
      )}

      {phase === "done" && (
        <Panel3D
          position={[0, 1.42, -1.45]}
          width={1.0}
          height={0.6}
          bodySize={0.036}
          title={t("CASE CLOSED", "KASUS DITUTUP")}
          body={`${t("Score", "Skor")}: ${Math.min(LAB_MAX_SCORE, score)} / ${LAB_MAX_SCORE}\n${t(`${correctCount} of ${LAB_EVIDENCE.length} correct`, `${correctCount} dari ${LAB_EVIDENCE.length} benar`)}\n\n${correctCount >= 7 ? t("Outstanding forensic work, detective.", "Kerja forensik yang luar biasa, detektif.") : correctCount >= 5 ? t("Good eye — a few fakes slipped past.", "Jeli — tapi beberapa yang palsu lolos.") : t("Review the hints and try again.", "Pelajari petunjuknya lalu coba lagi.")}`}
        >
          <Button3D label={t("PLAY AGAIN", "MAIN LAGI")} onPress={restart} position={[-0.2, -0.2, 0.02]} width={0.3} />
          <Button3D label={t("EXIT VR", "KELUAR VR")} onPress={() => store.getState().session?.end()} position={[0.2, -0.2, 0.02]} width={0.3} color="#334155" textColor="#fff" />
        </Panel3D>
      )}
    </group>
  );
}
