"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { GlobeMethods } from "react-globe.gl";
import { useTheme } from "next-themes";
import * as THREE from "three";
import { crimeData, type CrimeData } from "@/data/crimeData";
import { useMounted } from "@/lib/useMounted";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

// Pulse the cases from the two most recent years.
const newestYear = Math.max(...crimeData.map((c) => c.year));
const latestCases = crimeData.filter((c) => c.year >= newestYear - 1);
const isRecent = (c: CrimeData) => c.year >= newestYear - 1;

// Theme colours (match --primary / --secondary in globals.css).
const COLORS = {
  dark: { point: "#00f3ff", recent: "#a855f7" },
  light: { point: "#3b82f6", recent: "#7c3aed" },
};

// Soft round glow: a white core fading to transparent, tinted per sprite.
let glowTexture: THREE.Texture | null = null;
function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.3, "rgba(255,255,255,0.85)");
  grad.addColorStop(0.6, "rgba(255,255,255,0.25)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  glowTexture = new THREE.CanvasTexture(c);
  return glowTexture;
}

interface GlowDot { lat: number; lng: number; color: string; size: number }

/**
 * A small, non-interactive version of the Crime Map globe for the home page:
 * same textures and lighting per theme, glowing case dots in the theme colour, and
 * pulsing rings (in the secondary colour) on the most recent cases. Dots are unlit
 * sprites so the globe's shading never dims them. It only loads once it is near the
 * viewport and pauses while scrolled away.
 */
export default function MiniGlobe() {
  const box = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();
  const isLight = mounted && resolvedTheme === "light";
  const palette = isLight ? COLORS.light : COLORS.dark;

  // New objects per theme so the layer rebuilds its sprites in the new colours.
  const dots = useMemo<GlowDot[]>(
    () => crimeData.map((c) => ({
      lat: c.location[0],
      lng: c.location[1],
      color: isRecent(c) ? palette.recent : palette.point,
      size: isRecent(c) ? 11 : 9,
    })),
    [palette],
  );

  const globeMaterial = useMemo(
    () => new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(isLight ? 0x000000 : "#16285c"),
      emissiveIntensity: isLight ? 0 : 0.6,
    }),
    [isLight],
  );

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const resize = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    resize.observe(el);
    // Load when close to the viewport; afterwards pause/resume rendering with visibility.
    const seen = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setNear(true);
      const g = globeRef.current;
      if (g) {
        if (e.isIntersecting) g.resumeAnimation();
        else g.pauseAnimation();
      }
    }, { rootMargin: "200px" });
    seen.observe(el);
    return () => { resize.disconnect(); seen.disconnect(); };
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!ready || !g) return;
    const controls = g.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.enableZoom = false;
    controls.enableRotate = false;
    // Start over Asia, where most of the dataset sits. The camera's field of view is
    // vertical, so pull back on boxes taller than they are wide to keep the globe whole.
    const aspect = size.w && size.h ? size.h / size.w : 1;
    g.pointOfView({ lat: 18, lng: 95, altitude: 1.85 * Math.max(1, aspect) }, 0);
  }, [ready, size.w, size.h]);

  const side = Math.min(size.w, size.h) || 0;

  return (
    <div ref={box} className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Placeholder disc until the globe is drawn */}
      {!ready && (
        <div
          className="absolute rounded-full bg-gradient-to-br from-blue-200 to-blue-400 dark:from-[#16285c] dark:to-[#050b1f] animate-pulse"
          style={{ width: side * 0.78, height: side * 0.78 }}
        />
      )}
      {near && size.w > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          onGlobeReady={() => setReady(true)}
          globeImageUrl={isLight ? "/textures/earth-blue-marble.jpg" : "/textures/earth-night.jpg"}
          bumpImageUrl="/textures/earth-topology.png"
          globeMaterial={globeMaterial}
          showAtmosphere
          atmosphereColor={isLight ? "#93c5fd" : "#3b82f6"}
          atmosphereAltitude={isLight ? 0.15 : 0.2}
          backgroundColor="rgba(0,0,0,0)"
          customLayerData={dots}
          customThreeObject={(d: object) => {
            // A coloured halo with a small white-hot core, so each case reads as a lit light.
            const { color, size } = d as GlowDot;
            const sprite = (tint: string, scale: number) => {
              const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlowTexture(), color: tint, transparent: true, depthWrite: false }));
              s.scale.set(scale, scale, 1);
              return s;
            };
            const group = new THREE.Group();
            group.add(sprite(color, size), sprite("#ffffff", size * 0.32));
            return group;
          }}
          customThreeObjectUpdate={(obj: THREE.Object3D, d: object) => {
            const { lat, lng } = d as GlowDot;
            const p = globeRef.current?.getCoords(lat, lng, 0.012);
            if (p) obj.position.set(p.x, p.y, p.z);
          }}
          ringsData={latestCases}
          ringLat={(d: object) => (d as CrimeData).location[0]}
          ringLng={(d: object) => (d as CrimeData).location[1]}
          ringColor={() => (t: number) => `${palette.recent}${Math.round((1 - t) * 255).toString(16).padStart(2, "0")}`}
          ringMaxRadius={5}
          ringPropagationSpeed={2.5}
          ringRepeatPeriod={1400}
        />
      )}
    </div>
  );
}
