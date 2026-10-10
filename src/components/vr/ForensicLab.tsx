"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture, RoundedBox } from "@react-three/drei";
import { Handle, defaultApply, type HandleState } from "@react-three/handle";
import { useXRStore } from "@react-three/xr";
import * as THREE from "three";
import { LAB_EVIDENCE, LAB_MAX_SCORE, LAB_MISSION_ID, type LabEvidence } from "@/game/vr/labData";
import { recordScore } from "@/game/progress";
import { Button3D, COLORS, FONT, FONT_BOLD, Panel3D } from "./ui3d";

const PHOTO_WIDTH = 0.42;
const LENS_RADIUS = 0.07;
const DESK_Y = 0.85;
const STAND_POS = new THREE.Vector3(0, 1.17, -0.62);
const STAND_ROT = new THREE.Euler(-0.28, 0, 0);
const LENS_POS = new THREE.Vector3(0.24, 0.98, -0.34);
const BIN_X = 0.5;
const POINTS_CORRECT = 100;
const POINTS_SCANNED = 25;

/** Draws the scanner clues for one image onto a transparent canvas. */
function useClueTexture(ev: LabEvidence) {
  return useMemo(() => {
    const w = 1024;
    const h = Math.round(w * ev.aspect);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const color = ev.answer === "ai" ? COLORS.red : COLORS.green;
    ctx.lineWidth = 9;
    ctx.font = "bold 42px 'Atkinson Hyperlegible', Arial, sans-serif";
    ctx.textBaseline = "middle";
    for (const c of ev.clues) {
      const x = c.x * w;
      const y = c.y * h;
      const r = c.r * w;
      ctx.strokeStyle = color;
      ctx.setLineDash([22, 12]);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // Label pill below (or above, near the bottom edge) the circle.
      const tw = ctx.measureText(c.label).width + 28;
      const below = y + r + 62 < h;
      const ly = below ? y + r + 36 : y - r - 36;
      const lx = Math.min(Math.max(x - tw / 2, 8), w - tw - 8);
      ctx.fillStyle = "rgba(0,0,0,0.78)";
      ctx.beginPath();
      ctx.roundRect(lx, ly - 28, tw, 56, 16);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillText(c.label, lx + 14, ly + 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [ev]);
}

/** Shows the clue overlay only inside the scanner lens beam (or everywhere once revealed). */
function makeLensMaterial(map: THREE.Texture) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      map: { value: map },
      lensPos: { value: new THREE.Vector3(0, -10, 0) },
      lensNormal: { value: new THREE.Vector3(0, 0, 1) },
      radius: { value: LENS_RADIUS },
      reveal: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vWorld;
      void main() {
        vUv = uv;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      uniform vec3 lensPos;
      uniform vec3 lensNormal;
      uniform float radius;
      uniform float reveal;
      varying vec2 vUv;
      varying vec3 vWorld;
      void main() {
        vec3 d = vWorld - lensPos;
        float along = dot(d, lensNormal);
        float perp = length(d - along * lensNormal);
        float inside = (1.0 - smoothstep(radius * 0.92, radius, perp)) * step(abs(along), 0.35);
        vec4 c = texture2D(map, vUv);
        float a = max(inside, reveal);
        vec3 tint = vec3(0.0, 0.95, 1.0);
        float tintA = inside * (1.0 - reveal) * 0.14;
        gl_FragColor = vec4(mix(tint, c.rgb, c.a), max(c.a * a, tintA));
      }`,
  });
}

function Evidence({
  ev, photoRef, lensRef, reveal, onDrop, onScanned,
}: {
  ev: LabEvidence;
  photoRef: React.RefObject<THREE.Group | null>;
  lensRef: React.RefObject<THREE.Group | null>;
  reveal: boolean;
  onDrop: (bin: "real" | "ai") => void;
  onScanned: () => void;
}) {
  const photo = useTexture(ev.src, (t) => { t.colorSpace = THREE.SRGBColorSpace; });
  const clueTex = useClueTexture(ev);
  const material = useMemo(() => makeLensMaterial(clueTex), [clueTex]);
  const height = PHOTO_WIDTH * ev.aspect;
  const overlayRef = useRef<THREE.Mesh>(null);
  const scanTime = useRef(0);
  const scannedSent = useRef(false);
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), normal: new THREE.Vector3(), q: new THREE.Quaternion(), local: new THREE.Vector3() }), []);

  useEffect(() => () => { material.dispose(); clueTex.dispose(); }, [material, clueTex]);

  useFrame((_, dt) => {
    const lens = lensRef.current;
    const photoGroup = photoRef.current;
    const overlay = overlayRef.current;
    if (!lens || !photoGroup || !overlay) return;
    const uniforms = (overlay.material as THREE.ShaderMaterial).uniforms;
    uniforms.reveal.value = reveal ? 1 : 0;
    lens.getWorldPosition(tmp.pos);
    lens.getWorldQuaternion(tmp.q);
    tmp.normal.set(0, 0, 1).applyQuaternion(tmp.q);
    uniforms.lensPos.value.copy(tmp.pos);
    uniforms.lensNormal.value.copy(tmp.normal);

    // Count time the lens spends over the photo.
    tmp.local.copy(tmp.pos);
    photoGroup.worldToLocal(tmp.local);
    if (Math.abs(tmp.local.z) < 0.3 && Math.abs(tmp.local.x) < PHOTO_WIDTH / 2 + 0.02 && Math.abs(tmp.local.y) < height / 2 + 0.02) {
      scanTime.current += dt;
      if (scanTime.current > 0.5 && !scannedSent.current) {
        scannedSent.current = true;
        onScanned();
      }
    }
  });

  const apply = (state: HandleState<unknown>, target: THREE.Object3D) => {
    defaultApply(state, target);
    if (!state.last) return;
    const p = target.getWorldPosition(new THREE.Vector3());
    const overBins = p.y < DESK_Y + 0.35 && p.z > -0.9 && p.z < -0.2;
    if (overBins && p.x < -BIN_X + 0.2) onDrop("real");
    else if (overBins && p.x > BIN_X - 0.2) onDrop("ai");
  };

  return (
    <group ref={photoRef} position={STAND_POS} rotation={STAND_ROT}>
      <Handle targetRef={photoRef} scale={false} apply={apply}>
        <group>
          {/* Frame */}
          <mesh position-z={-0.004}>
            <boxGeometry args={[PHOTO_WIDTH + 0.02, height + 0.02, 0.006]} />
            <meshStandardMaterial color="#111827" roughness={0.6} />
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

function Scanner({ lensRef }: { lensRef: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={lensRef} position={LENS_POS}>
      <Handle targetRef={lensRef} scale={false}>
        <group>
          <mesh>
            <torusGeometry args={[LENS_RADIUS, 0.007, 12, 48]} />
            <meshBasicMaterial color={COLORS.cyan} toneMapped={false} />
          </mesh>
          <mesh>
            <circleGeometry args={[LENS_RADIUS, 40]} />
            <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh position={[0, -LENS_RADIUS - 0.06, 0]}>
            <cylinderGeometry args={[0.012, 0.014, 0.12, 12]} />
            <meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.4} />
          </mesh>
          <Text position={[0, LENS_RADIUS + 0.03, 0]} fontSize={0.022} color={COLORS.cyan} anchorX="center" font={FONT_BOLD}>
            AI SCANNER
          </Text>
        </group>
      </Handle>
    </group>
  );
}

function Bin({ x, label, color }: { x: number; label: string; color: string }) {
  return (
    <group position={[x, DESK_Y + 0.06, -0.52]}>
      <mesh>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color={color} transparent opacity={0.25} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      <mesh position-y={0.051} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.11, 0.135, 4, 1, Math.PI / 4]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <Text position={[0, 0.02, 0.152]} fontSize={0.045} color={color} anchorX="center" anchorY="middle" font={FONT_BOLD}>
        {label}
      </Text>
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
  const [last, setLast] = useState<{ correct: boolean; gained: number } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const photoRef = useRef<THREE.Group>(null);
  const lensRef = useRef<THREE.Group>(null);
  const ev = LAB_EVIDENCE[index];

  const resetObjects = () => {
    photoRef.current?.position.copy(STAND_POS);
    photoRef.current?.rotation.copy(STAND_ROT);
    lensRef.current?.position.copy(LENS_POS);
    lensRef.current?.rotation.set(0, 0, 0);
  };

  const answer = (bin: "real" | "ai") => {
    if (phase !== "play") return;
    const correct = bin === ev.answer;
    const gained = correct ? POINTS_CORRECT + (scanned ? POINTS_SCANNED : 0) : 0;
    setScore((s) => s + gained);
    if (correct) setCorrectCount((c) => c + 1);
    setLast({ correct, gained });
    setPhase("feedback");
    // Put the photo back on its stand so the revealed clues are easy to read.
    requestAnimationFrame(resetObjects);
  };

  const next = () => {
    if (index + 1 >= LAB_EVIDENCE.length) {
      recordScore(LAB_MISSION_ID, Math.min(LAB_MAX_SCORE, score));
      setPhase("done");
      return;
    }
    setIndex(index + 1);
    setScanned(false);
    setLast(null);
    setPhase("play");
    requestAnimationFrame(resetObjects);
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setCorrectCount(0);
    setScanned(false);
    setLast(null);
    setPhase("play");
    requestAnimationFrame(resetObjects);
  };

  const exitVR = () => store.getState().session?.end();

  return (
    <group>
      {/* Desk */}
      <mesh position={[0, DESK_Y - 0.025, -0.55]}>
        <boxGeometry args={[1.5, 0.05, 0.62]} />
        <meshStandardMaterial color="#111a2e" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, DESK_Y + 0.001, -0.24]}>
        <boxGeometry args={[1.5, 0.004, 0.01]} />
        <meshBasicMaterial color={COLORS.cyan} toneMapped={false} />
      </mesh>
      <mesh position={[0, DESK_Y / 2, -0.55]}>
        <boxGeometry args={[1.3, DESK_Y - 0.05, 0.5]} />
        <meshStandardMaterial color="#0b1222" />
      </mesh>

      {phase === "intro" && (
        <Panel3D
          position={[0, 1.42, -0.95]}
          width={1.05}
          height={0.66}
          title="FORENSIC LAB"
          body={"Eight pieces of evidence. Some are real photos, some were made by AI.\n\n• Point at an object and hold the TRIGGER to grab it.\n• Hold the AI SCANNER over a photo to reveal hidden clues (+25 pts).\n• Drop the photo in the REAL or AI bin, or press the buttons."}
        >
          <Button3D label="START INVESTIGATION" onPress={restart} position={[0, -0.25, 0.02]} width={0.5} height={0.1} />
        </Panel3D>
      )}

      {phase !== "intro" && phase !== "done" && (
        <>
          <Evidence
            key={ev.id}
            ev={ev}
            photoRef={photoRef}
            lensRef={lensRef}
            reveal={phase === "feedback"}
            onDrop={answer}
            onScanned={() => setScanned(true)}
          />
          <Scanner lensRef={lensRef} />
          <Bin x={-BIN_X} label="REAL" color={COLORS.green} />
          <Bin x={BIN_X} label="AI" color={COLORS.red} />

          {/* HUD */}
          <group position={[0, 1.52, -0.95]}>
            <RoundedBox args={[0.62, 0.075, 0.01]} radius={0.02} smoothness={2}>
              <meshBasicMaterial color={COLORS.panel} transparent opacity={0.85} toneMapped={false} />
            </RoundedBox>
            <Text position={[0, 0, 0.008]} fontSize={0.032} color={COLORS.text} anchorX="center" anchorY="middle" font={FONT_BOLD}>
              {`EVIDENCE ${index + 1}/${LAB_EVIDENCE.length}   ·   SCORE ${score}   ·   ${scanned ? "SCANNED" : "NOT SCANNED YET"}`}
            </Text>
          </group>
        </>
      )}

      {phase === "play" && (
        <>
          <Button3D label="REAL PHOTO" onPress={() => answer("real")} position={[-BIN_X, DESK_Y + 0.22, -0.52]} width={0.3} fontSize={0.034} color={COLORS.green} />
          <Button3D label="AI-GENERATED" onPress={() => answer("ai")} position={[BIN_X, DESK_Y + 0.22, -0.52]} width={0.3} fontSize={0.034} color={COLORS.red} textColor="#fff" />
        </>
      )}

      {phase === "feedback" && last && (
        <Panel3D
          position={[0.62, 1.32, -0.72]}
          rotation={[0, -0.55, 0]}
          width={0.5}
          height={0.58}
          title={last.correct ? `CORRECT  +${last.gained}` : "WRONG"}
          titleColor={last.correct ? COLORS.green : COLORS.red}
        >
          <Text position={[0, 0.17, 0.012]} fontSize={0.026} color={ev.answer === "ai" ? COLORS.red : COLORS.green} anchorX="center" anchorY="top" font={FONT_BOLD}>
            {ev.answer === "ai" ? "It's AI-generated" : "It's a real photo"}
          </Text>
          <Text position={[0, 0.12, 0.012]} fontSize={0.021} color={COLORS.text} anchorX="center" anchorY="top" font={FONT} maxWidth={0.44} lineHeight={1.35} textAlign="left">
            {ev.explain}
          </Text>
          <Text position={[0, -0.19, 0.012]} fontSize={0.014} color="#94a3b8" anchorX="center" anchorY="top" font={FONT} maxWidth={0.44}>
            {ev.credit}
          </Text>
          <Button3D label={index + 1 >= LAB_EVIDENCE.length ? "FINISH" : "NEXT EVIDENCE"} onPress={next} position={[0, -0.25, 0.02]} width={0.38} fontSize={0.032} />
        </Panel3D>
      )}

      {phase === "done" && (
        <Panel3D
          position={[0, 1.42, -0.95]}
          width={0.9}
          height={0.56}
          title="CASE CLOSED"
          body={`Score: ${Math.min(LAB_MAX_SCORE, score)} / ${LAB_MAX_SCORE}\n${correctCount} of ${LAB_EVIDENCE.length} correct\n\n${correctCount >= 7 ? "Outstanding forensic work, detective." : correctCount >= 5 ? "Good eye — a few fakes slipped past." : "Review the clues and try again."}`}
        >
          <Button3D label="PLAY AGAIN" onPress={restart} position={[-0.2, -0.2, 0.02]} width={0.3} />
          <Button3D label="EXIT VR" onPress={exitVR} position={[0.2, -0.2, 0.02]} width={0.3} color="#334155" textColor="#fff" />
        </Panel3D>
      )}
    </group>
  );
}
