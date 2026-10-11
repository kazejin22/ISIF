"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Two cheap, Quest 2-friendly environments:
//  • "lab"      — a bright, clean photo studio with a curved backdrop.
//  • "firewall" — a neon data tunnel with a flowing grid floor and moving rings.

function GradientSky({ top, horizon }: { top: string; horizon: string }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { top: { value: new THREE.Color(top) }, horizon: { value: new THREE.Color(horizon) } },
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
            gl_FragColor = vec4(mix(horizon, top, smoothstep(-0.05, 0.6, vHeight)), 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [top, horizon],
  );
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[40, 32, 16]} />
    </mesh>
  );
}

function radialTexture(stops: [number, string][], rings?: string) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  if (rings) {
    ctx.strokeStyle = rings;
    ctx.lineWidth = 2;
    for (let r = 44; r < size / 2; r += 52) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ─── Bright lab studio ───────────────────────────────────────────────

function LabStudio() {
  const floor = useMemo(() => radialTexture([[0, "#ffffff"], [0.5, "#eef2f7"], [1, "#d5deea"]], "rgba(15,23,42,0.05)"), []);
  // Soft vertical light panels set into the curved backdrop.
  const panels = useMemo(() => Array.from({ length: 9 }, (_, i) => (i - 4) * 0.34), []);

  return (
    <>
      <color attach="background" args={["#eef2f7"]} />
      <fog attach="fog" args={["#e9eef5", 9, 30]} />
      <hemisphereLight args={["#ffffff", "#c7d2e0", 1.35]} />
      <directionalLight position={[1.5, 4, 2]} intensity={1.1} />
      <GradientSky top="#c9d8ea" horizon="#f5f8fc" />

      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[16, 64]} />
        <meshBasicMaterial map={floor} toneMapped={false} />
      </mesh>

      {/* Player platform */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.005}>
        <circleGeometry args={[1.1, 64]} />
        <meshBasicMaterial color="#e2e8f0" toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.007}>
        <ringGeometry args={[1.1, 1.125, 96]} />
        <meshBasicMaterial color="#94a3b8" toneMapped={false} />
      </mesh>

      {/* Curved backdrop (cyclorama) behind the desk */}
      <mesh position={[0, 1.6, 0]} rotation-y={Math.PI}>
        <cylinderGeometry args={[4.2, 4.2, 3.2, 64, 1, true, -1.15, 2.3]} />
        <meshStandardMaterial color="#f1f5f9" side={THREE.BackSide} roughness={0.9} />
      </mesh>
      {panels.map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * 4.15, 1.9, -Math.cos(a) * 4.15]} rotation-y={-a}>
          <planeGeometry args={[0.035, 1.6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.75} toneMapped={false} />
        </mesh>
      ))}
      {/* Skirting light where the backdrop meets the floor */}
      <mesh position={[0, 0.01, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[4.05, 4.15, 96, 1, Math.PI / 2 - 1.15, 2.3]} />
        <meshBasicMaterial color="#bfdbfe" toneMapped={false} />
      </mesh>
    </>
  );
}

// ─── Neon data tunnel ────────────────────────────────────────────────

const RING_COUNT = 14;
const RING_SPACING = 2.4;
const TUNNEL_SPEED = 3;

function makeGridMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { time: { value: 0 }, color: { value: new THREE.Color("#38bdf8") } },
    vertexShader: /* glsl */ `
      varying vec2 vPos;
      void main() {
        vPos = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float time;
      uniform vec3 color;
      varying vec2 vPos;
      float line(float v, float w) { float f = abs(fract(v) - 0.5); return smoothstep(0.5 - w, 0.5, f); }
      void main() {
        // Plane is rotated flat: x = world x, y = -world z. Lines flow toward the player.
        float gx = line(vPos.x / 1.2 + 0.5, 0.03);
        float gz = line((vPos.y + time * ${TUNNEL_SPEED.toFixed(1)}) / 1.2, 0.03);
        float fade = 1.0 - smoothstep(4.0, 24.0, length(vPos));
        float a = max(gx, gz) * fade * 0.55;
        gl_FragColor = vec4(color, a);
        #include <colorspace_fragment>
      }`,
  });
}

function makeStreamMaterial(tint: string) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { time: { value: 0 }, color: { value: new THREE.Color(tint) } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float time;
      uniform vec3 color;
      varying vec2 vUv;
      float hash(float n) { return fract(sin(n) * 43758.5453); }
      void main() {
        float col = floor(vUv.x * 60.0);
        float speed = 0.15 + hash(col) * 0.35;
        float y = fract(vUv.y * 3.0 + time * speed + hash(col * 7.0));
        float drop = smoothstep(0.0, 0.05, y) * (1.0 - smoothstep(0.05, 0.35, y));
        float lane = step(0.55, hash(col * 3.1));
        float edge = smoothstep(0.0, 0.2, vUv.y) * (1.0 - smoothstep(0.8, 1.0, vUv.y));
        gl_FragColor = vec4(color, drop * lane * edge * 0.5);
        #include <colorspace_fragment>
      }`,
  });
}

function DataTunnel() {
  const grid = useMemo(() => makeGridMaterial(), []);
  const streamL = useMemo(() => makeStreamMaterial("#22d3ee"), []);
  const streamR = useMemo(() => makeStreamMaterial("#a78bfa"), []);
  const rings = useRef<THREE.Group>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    for (const m of [floorRef.current, leftRef.current, rightRef.current]) {
      if (m) (m.material as THREE.ShaderMaterial).uniforms.time.value = t;
    }
    const g = rings.current;
    if (!g) return;
    for (const ring of g.children) {
      ring.position.z += TUNNEL_SPEED * dt;
      if (ring.position.z > 1) ring.position.z -= RING_COUNT * RING_SPACING;
      const near = THREE.MathUtils.clamp((ring.position.z + 30) / 28, 0, 1);
      ((ring as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.15 + near * 0.45;
    }
  });

  return (
    <>
      <color attach="background" args={["#060a1f"]} />
      <fog attach="fog" args={["#0a1033", 8, 34]} />
      <hemisphereLight args={["#a5b4fc", "#0b1027", 0.9]} />
      <GradientSky top="#0b1033" horizon="#1e1b4b" />

      {/* Glowing floor and flowing grid */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial color="#0b1230" toneMapped={false} />
      </mesh>
      <mesh ref={floorRef} rotation-x={-Math.PI / 2} position-y={0.004} material={grid}>
        <planeGeometry args={[40, 40]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.006}>
        <ringGeometry args={[0.95, 1.0, 96]} />
        <meshBasicMaterial color="#67e8f9" toneMapped={false} />
      </mesh>

      {/* Data-stream walls */}
      <mesh ref={leftRef} position={[-3.2, 2, -10]} rotation-y={Math.PI / 2} material={streamL}>
        <planeGeometry args={[26, 4]} />
      </mesh>
      <mesh ref={rightRef} position={[3.2, 2, -10]} rotation-y={-Math.PI / 2} material={streamR}>
        <planeGeometry args={[26, 4]} />
      </mesh>

      {/* Tunnel rings flowing toward the player */}
      <group ref={rings}>
        {Array.from({ length: RING_COUNT }, (_, i) => (
          <mesh key={i} position={[0, 1.6, -2 - i * RING_SPACING]}>
            <torusGeometry args={[2.6, 0.012, 6, 64]} />
            <meshBasicMaterial color={i % 2 ? "#a78bfa" : "#22d3ee"} transparent opacity={0.4} toneMapped={false} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function Environment({ variant }: { variant: "lab" | "firewall" }) {
  return variant === "lab" ? <LabStudio /> : <DataTunnel />;
}
