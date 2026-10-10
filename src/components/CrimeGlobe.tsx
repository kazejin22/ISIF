"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { GlobeMethods } from "react-globe.gl";
import { crimeData, CrimeData } from "@/data/crimeData";
import { useTheme } from "next-themes";
import { useMediaQuery, useMounted } from "@/lib/useMounted";
import * as THREE from "three";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

interface Marker {
  lat: number;
  lng: number;
  crime: CrimeData;
}

interface Arc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string[];
}

export default function CrimeGlobe({
  onMarkerClick,
  selectedCrime,
}: {
  onMarkerClick: (data: CrimeData) => void;
  selectedCrime?: CrimeData | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [globeWidth, setGlobeWidth] = useState(0);
  const [globeReady, setGlobeReady] = useState(false);
  const mounted = useMounted();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { resolvedTheme } = useTheme();
  const isLight = mounted && resolvedTheme === "light";

  // Keep the latest click handler without re-creating every HTML marker.
  const clickRef = useRef(onMarkerClick);
  useEffect(() => { clickRef.current = onMarkerClick; }, [onMarkerClick]);

  const markers = useMemo<Marker[]>(
    () => crimeData.map((crime) => ({ lat: crime.location[0], lng: crime.location[1], crime })),
    [],
  );

  // Arcs link the selected case to every other case of the same type.
  const arcsData = useMemo<Arc[]>(() => {
    if (!selectedCrime) return [];
    return crimeData
      .filter((c) => c.type === selectedCrime.type && c.id !== selectedCrime.id)
      .map((c) => ({
        startLat: selectedCrime.location[0],
        startLng: selectedCrime.location[1],
        endLat: c.location[0],
        endLng: c.location[1],
        color: isLight ? ["#3b82f6", "#00f3ff"] : ["#ffffff", "#00f3ff"],
      }));
  }, [selectedCrime, isLight]);

  // Night mode gets a blue glow so the dark texture doesn't vanish into the background.
  const globeMaterial = useMemo(
    () => new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(isLight ? 0x000000 : "#16285c"),
      emissiveIntensity: isLight ? 0 : 0.6,
    }),
    [isLight],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setGlobeWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globeReady || !globe) return;

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = false;
    // On touch screens, dragging the globe would trap page scrolling, so rotation is desktop-only.
    controls.enableRotate = isDesktop;
    globe.renderer().domElement.style.touchAction = isDesktop ? "none" : "pan-y";
  }, [globeReady, isDesktop]);

  // Fly to the selected case.
  useEffect(() => {
    if (!globeReady || !globeRef.current || !selectedCrime) return;
    globeRef.current.pointOfView({ lat: selectedCrime.location[0], lng: selectedCrime.location[1], altitude: 2.2 }, 1500);
  }, [selectedCrime, globeReady]);

  return (
    <div ref={containerRef} className="w-full h-full relative lg:cursor-grab lg:active:cursor-grabbing flex items-center justify-center">
      {globeWidth > 0 && (
        <Globe
          ref={globeRef}
          width={globeWidth}
          height={globeWidth}
          onGlobeReady={() => setGlobeReady(true)}
          globeImageUrl={isLight ? "/textures/earth-blue-marble.jpg" : "/textures/earth-night.jpg"}
          bumpImageUrl="/textures/earth-topology.png"
          globeMaterial={globeMaterial}
          showAtmosphere
          atmosphereColor={isLight ? "#93c5fd" : "#3b82f6"}
          atmosphereAltitude={isLight ? 0.15 : 0.2}
          backgroundColor="rgba(0,0,0,0)"
          arcsData={arcsData}
          arcColor={(d: object) => (d as Arc).color}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={2000}
          arcAltitudeAutoScale={0.3}
          htmlElementsData={markers}
          htmlElement={(d: object) => {
            const { crime } = d as Marker;
            const el = document.createElement("button");
            el.type = "button";
            el.setAttribute("aria-label", `${crime.country}: ${crime.title}`);
            el.style.cssText = "pointer-events:auto;cursor:pointer;background:none;border:0;padding:0;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;";
            el.innerHTML = `
              <span style="width:22px;height:22px;background:#00f3ff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(0,243,255,0.8);">
                <span style="width:7px;height:7px;background:#fff;border-radius:50%;"></span>
              </span>
              <span class="globe-pin-label" style="margin-top:6px;color:#fff;font-size:12px;font-weight:700;font-family:sans-serif;text-shadow:0 2px 5px rgba(0,0,0,.9);background:rgba(0,0,0,.35);padding:2px 6px;border-radius:4px;white-space:nowrap;"></span>`;
            el.querySelector(".globe-pin-label")!.textContent = crime.country;
            el.onclick = () => clickRef.current(crime);
            return el;
          }}
        />
      )}
    </div>
  );
}
