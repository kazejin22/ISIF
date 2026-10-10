"use client";

import { useState } from "react";
import { Text, RoundedBox } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";

export const FONT = "/fonts/AtkinsonHyperlegible-Regular.ttf";
export const FONT_BOLD = "/fonts/AtkinsonHyperlegible-Bold.ttf";

export const COLORS = {
  cyan: "#00f3ff",
  green: "#34d399",
  red: "#ff4d4d",
  amber: "#fbbf24",
  panel: "#0b1220",
  text: "#e5e7eb",
};

type Vec3 = [number, number, number];

/** A pressable 3D button that works with mouse, touch and XR controller rays. */
export function Button3D({
  label, onPress, position, width = 0.32, height = 0.09, color = COLORS.cyan, textColor = "#001014", fontSize = 0.038, disabled = false,
}: {
  label: string; onPress: () => void; position: Vec3; width?: number; height?: number; color?: string; textColor?: string; fontSize?: number; disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const press = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!disabled) onPress();
  };
  return (
    <group position={position} scale={down ? 0.95 : hover ? 1.05 : 1}>
      <RoundedBox
        args={[width, height, 0.025]}
        radius={0.012}
        smoothness={2}
        onClick={press}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => { setHover(false); setDown(false); }}
        onPointerDown={() => setDown(true)}
        onPointerUp={() => setDown(false)}
      >
        <meshBasicMaterial color={disabled ? "#334155" : color} toneMapped={false} />
      </RoundedBox>
      <Text position={[0, 0, 0.014]} fontSize={fontSize} color={textColor} anchorX="center" anchorY="middle" font={FONT_BOLD} maxWidth={width * 0.92}>
        {label}
      </Text>
    </group>
  );
}

/** Dark rounded panel with a title and optional body text. */
export function Panel3D({
  position, rotation = [0, 0, 0], width = 1, height = 0.6, title, body, titleColor = COLORS.cyan, children,
}: {
  position: Vec3; rotation?: Vec3; width?: number; height?: number; title?: string; body?: string; titleColor?: string; children?: React.ReactNode;
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[width, height, 0.02]} radius={0.03} smoothness={2}>
        <meshBasicMaterial color={COLORS.panel} transparent opacity={0.92} toneMapped={false} />
      </RoundedBox>
      {title && (
        <Text position={[0, height / 2 - 0.07, 0.012]} fontSize={0.055} color={titleColor} anchorX="center" anchorY="top" font={FONT_BOLD} maxWidth={width * 0.9} textAlign="center">
          {title}
        </Text>
      )}
      {body && (
        <Text position={[0, title ? height / 2 - 0.17 : height / 2 - 0.06, 0.012]} fontSize={0.032} color={COLORS.text} anchorX="center" anchorY="top" font={FONT} maxWidth={width * 0.88} lineHeight={1.35} textAlign="center">
          {body}
        </Text>
      )}
      {children}
    </group>
  );
}
