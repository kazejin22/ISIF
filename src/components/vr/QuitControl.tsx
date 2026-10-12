"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import { useXRInputSourceState } from "@react-three/xr";
import * as THREE from "three";
import { useT } from "@/lib/i18n";
import { FONT, FONT_BOLD } from "./ui3d";

const HOLD_SECONDS = 5;
const BAR_W = 0.36;
// Where the notice floats, relative to the headset: ahead and a little low.
const OFFSET = new THREE.Vector3(0, -0.12, -0.75);

/**
 * Hidden quit: hold B (right) and Y (left) together. While both are held a notice
 * appears in front of the player and fills over five seconds; letting go of either
 * cancels it. Nothing is shown otherwise, so it never gets in the way of play.
 */
export default function QuitControl({ onQuit }: { onQuit: () => void }) {
  const t = useT();
  const right = useXRInputSourceState("controller", "right");
  const left = useXRInputSourceState("controller", "left");
  const held = useRef(0);
  const notice = useRef<THREE.Group>(null);
  const bar = useRef<THREE.Mesh>(null);
  const pos = useRef(new THREE.Vector3());
  const quat = useRef(new THREE.Quaternion());

  useFrame(({ camera }, dt) => {
    const both = right?.gamepad?.["b-button"]?.state === "pressed" && left?.gamepad?.["y-button"]?.state === "pressed";
    held.current = both ? held.current + dt : 0;
    const k = Math.min(1, held.current / HOLD_SECONDS);

    const g = notice.current;
    if (g) {
      g.visible = k > 0;
      if (g.visible) {
        // Head-locked: follow the headset so the notice is always in view.
        camera.getWorldPosition(pos.current);
        camera.getWorldQuaternion(quat.current);
        g.position.copy(OFFSET).applyQuaternion(quat.current).add(pos.current);
        g.quaternion.copy(quat.current);
      }
    }
    if (bar.current) {
      bar.current.scale.x = Math.max(0.001, k);
      bar.current.position.x = (-BAR_W / 2) * (1 - k);
    }
    if (k >= 1) {
      held.current = 0;
      onQuit();
    }
  });

  return (
    <group ref={notice} visible={false} renderOrder={1000}>
      <RoundedBox args={[0.44, 0.13, 0.005]} radius={0.02} smoothness={2} renderOrder={1000}>
        <meshBasicMaterial color="#0f172a" transparent opacity={0.92} depthTest={false} toneMapped={false} />
      </RoundedBox>
      <Text position={[0, 0.03, 0.004]} fontSize={0.026} color="#fecaca" anchorX="center" anchorY="middle" font={FONT_BOLD} renderOrder={1001} material-depthTest={false}>
        {t("Quitting game…", "Keluar dari game…")}
      </Text>
      <Text position={[0, -0.006, 0.004]} fontSize={0.016} color="#94a3b8" anchorX="center" anchorY="middle" font={FONT} renderOrder={1001} material-depthTest={false}>
        {t("Keep holding B + Y · release to cancel", "Tahan terus B + Y · lepas untuk batal")}
      </Text>
      <mesh position={[0, -0.04, 0.004]} renderOrder={1001}>
        <planeGeometry args={[BAR_W, 0.012]} />
        <meshBasicMaterial color="#334155" depthTest={false} toneMapped={false} />
      </mesh>
      <mesh ref={bar} position={[0, -0.04, 0.005]} renderOrder={1002}>
        <planeGeometry args={[BAR_W, 0.012]} />
        <meshBasicMaterial color="#f87171" depthTest={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
