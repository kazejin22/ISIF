"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useXRInputSourceState } from "@react-three/xr";
import * as THREE from "three";
import { useT } from "@/lib/i18n";
import { Button3D, FONT, Panel3D } from "./ui3d";

const HOLD_SECONDS = 1;
const BAR_W = 0.3;

type Vec3 = [number, number, number];

/**
 * Leaves the game mid-round. The button works with controller rays and the mouse;
 * holding B or Y for a second works in any game, including the saber one, which has
 * no rays.
 */
export default function QuitControl({ onQuit, position, rotation = [0, 0, 0], scale = 1 }: {
  onQuit: () => void; position: Vec3; rotation?: Vec3; scale?: number;
}) {
  const t = useT();
  const right = useXRInputSourceState("controller", "right");
  const left = useXRInputSourceState("controller", "left");
  const held = useRef(0);
  const bar = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    const pressed = right?.gamepad?.["b-button"]?.state === "pressed" || left?.gamepad?.["y-button"]?.state === "pressed";
    held.current = pressed ? held.current + dt : 0;
    const k = Math.min(1, held.current / HOLD_SECONDS);
    if (bar.current) {
      bar.current.visible = k > 0;
      bar.current.scale.x = Math.max(0.001, k);
      bar.current.position.x = (-BAR_W / 2) * (1 - k);
    }
    if (k >= 1) {
      held.current = 0;
      onQuit();
    }
  });

  return (
    <Panel3D position={position} rotation={rotation} scale={scale} width={0.4} height={0.2}>
      <Button3D label={t("QUIT GAME", "KELUAR GAME")} onPress={onQuit} position={[0, 0.03, 0.02]} width={0.3} height={0.075} fontSize={0.03} color="#f87171" textColor="#1f0505" />
      <Text position={[0, -0.04, 0.012]} fontSize={0.019} color="#94a3b8" anchorX="center" anchorY="middle" font={FONT}>
        {t("or hold B / Y", "atau tahan B / Y")}
      </Text>
      <mesh ref={bar} position={[0, -0.072, 0.012]} visible={false}>
        <planeGeometry args={[BAR_W, 0.01]} />
        <meshBasicMaterial color="#f87171" toneMapped={false} />
      </mesh>
    </Panel3D>
  );
}
