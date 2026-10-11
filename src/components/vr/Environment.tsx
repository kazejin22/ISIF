"use client";

import { useMemo } from "react";
import * as THREE from "three";

// A clean, elegant "studio" space: gradient sky dome, softly lit floor,
// a slim platform under the player and a few distant light columns.
// Everything is unlit or cheap-lit so it stays smooth on Quest 2.

const SKY_TOP = new THREE.Color("#0b1324");
const SKY_HORIZON = new THREE.Color("#1c2a45");
const FLOOR_CENTER = "#1a2438";
const FLOOR_EDGE = "#070b14";

function Sky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { top: { value: SKY_TOP }, horizon: { value: SKY_HORIZON } },
        vertexShader: /* glsl */ `
          varying float vHeight;
          void main() {
            vHeight = normalize(position).y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 top;
          uniform vec3 horizon;
          varying float vHeight;
          void main() {
            float t = smoothstep(-0.05, 0.6, vHeight);
            gl_FragColor = vec4(mix(horizon, top, t), 1.0);
          }`,
      }),
    [],
  );
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[30, 32, 16]} />
    </mesh>
  );
}

function useFloorTexture() {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, FLOOR_CENTER);
    g.addColorStop(0.55, "#0e1626");
    g.addColorStop(1, FLOOR_EDGE);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    // Faint concentric guide rings.
    ctx.strokeStyle = "rgba(120, 200, 255, 0.06)";
    ctx.lineWidth = 2;
    for (let r = 40; r < size / 2; r += 48) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

export default function Environment() {
  const floor = useFloorTexture();
  const columns = useMemo(
    () => Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return { a, x: Math.sin(a) * 7, z: Math.cos(a) * 7, h: 2.6 + (i % 3) * 0.5 };
    })
      // Keep the view in front of the player (-Z) clear.
      .filter((c) => Math.abs(c.a - Math.PI) > 0.9),
    [],
  );

  return (
    <>
      <color attach="background" args={["#0b1324"]} />
      <fog attach="fog" args={["#16223a", 6, 22]} />
      <hemisphereLight args={["#cfe3ff", "#0a0f1a", 0.9]} />
      <directionalLight position={[2, 4, 2]} intensity={0.8} />
      <Sky />

      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[14, 64]} />
        <meshBasicMaterial map={floor} toneMapped={false} />
      </mesh>

      {/* Player platform with a soft rim */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.006}>
        <circleGeometry args={[1.1, 64]} />
        <meshBasicMaterial color="#1e2a42" transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.008}>
        <ringGeometry args={[1.1, 1.13, 96]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.55} toneMapped={false} />
      </mesh>

      {/* Distant light columns */}
      {columns.map((c, i) => (
        <group key={i} position={[c.x, 0, c.z]}>
          <mesh position-y={c.h / 2}>
            <boxGeometry args={[0.05, c.h, 0.05]} />
            <meshBasicMaterial color="#bae6fd" transparent opacity={0.5} toneMapped={false} />
          </mesh>
          <mesh position-y={0.01} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[0.35, 24]} />
            <meshBasicMaterial color="#7dd3fc" transparent opacity={0.08} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Halo overhead */}
      <mesh position-y={3.4} rotation-x={Math.PI / 2}>
        <torusGeometry args={[2.4, 0.008, 6, 96]} />
        <meshBasicMaterial color="#e0f2fe" transparent opacity={0.35} toneMapped={false} />
      </mesh>
    </>
  );
}
