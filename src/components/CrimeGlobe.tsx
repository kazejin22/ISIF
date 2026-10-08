"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { crimeData, CrimeData } from "@/data/crimeData";
import { useTheme } from "next-themes";
import * as THREE from "three";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function CrimeGlobe({ 
  onMarkerClick,
  selectedCrime 
}: { 
  onMarkerClick: (data: CrimeData) => void;
  selectedCrime?: CrimeData | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [globeWidth, setGlobeWidth] = useState(800);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const { resolvedTheme } = useTheme();

  // Fix hydration mismatch with next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === "light";

  const heatmapData = useMemo(() => {
    const groups: Record<string, { lat: number; lng: number; count: number; country: string; crimes: CrimeData[] }> = {};
    
    crimeData.forEach(crime => {
      const key = `${crime.location[0]},${crime.location[1]}`;
      if (!groups[key]) {
        groups[key] = { lat: crime.location[0], lng: crime.location[1], count: 0, country: crime.country, crimes: [] };
      }
      groups[key].count += 1;
      groups[key].crimes.push(crime);
    });

    return Object.values(groups);
  }, []);

  // Generate glowing arcs like in the photo, connecting random points to create a network
  const arcsData = useMemo(() => {
    if (heatmapData.length < 2) return [];
    const sorted = [...heatmapData].sort((a, b) => b.count - a.count);
    const hub = sorted[0]; // Central node
    
    return sorted.slice(1, 15).map(target => ({
      startLat: hub.lat,
      startLng: hub.lng,
      endLat: target.lat,
      endLng: target.lng,
      // Extremely bright colors for the arcs
      color: isLight ? ['#3b82f6', '#00f3ff'] : ['#ffffff', '#00f3ff']
    }));
  }, [heatmapData, isLight]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0] && entries[0].contentRect.width > 0) {
        setGlobeWidth(entries[0].contentRect.width);
      }
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
      setGlobeWidth(containerRef.current.offsetWidth);
    }
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!globeReady || !globeRef.current || typeof globeRef.current.globeMaterial !== 'function') return;

    try {
      if (globeRef.current.controls && typeof globeRef.current.controls === 'function') {
        // Need a slight delay to ensure controls aren't reset by internal react-globe.gl updates
        setTimeout(() => {
          const controls = globeRef.current.controls();
          if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
            controls.enableZoom = false;
            // Lock the physical distance to prevent any scroll zooming
            // Globe radius is typically 100, altitude 2.2 = distance ~220
            controls.minDistance = 200;
            controls.maxDistance = 250;
          }
        }, 50);
      }
      
      // Altitude adjusted so the globe fits perfectly
      if (typeof globeRef.current.pointOfView === 'function') {
        globeRef.current.pointOfView({ altitude: 2.2 });
      }

      // Stylize material based on theme
      const globeMaterial = globeRef.current.globeMaterial();
      if (globeMaterial) {
        globeMaterial.color = new THREE.Color(0xffffff); // Keep full texture visibility
        
        if (isLight) {
          // Daylight mode: no deep blue emissive because the texture is already bright
          globeMaterial.emissive = new THREE.Color(0x000000); 
          globeMaterial.emissiveIntensity = 0; 
        } else {
          // Night mode: Add strong blue emissive to prevent the globe from blending into the black background
          globeMaterial.emissive = new THREE.Color("#16285c"); 
          globeMaterial.emissiveIntensity = 0.6; 
        }
        
        globeMaterial.roughness = 0.7;
      }
    } catch (err) {
      console.warn("Globe controls/material error:", err);
    }
  }, [globeWidth, isLight, globeReady]);

  // Fly-to animation when a crime is selected
  useEffect(() => {
    if (!globeReady || !globeRef.current || !selectedCrime) return;
    
    try {
      if (typeof globeRef.current.pointOfView === 'function') {
        globeRef.current.pointOfView(
          { 
            lat: selectedCrime.location[0], 
            lng: selectedCrime.location[1], 
            altitude: 2.2 
          }, 
          1500 // Animation duration in ms
        );
      }
    } catch (e) {
      console.warn("FlyTo error", e);
    }
  }, [selectedCrime, globeReady]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative cursor-grab active:cursor-grabbing flex items-center justify-center"
    >
      <Globe
        ref={globeRef}
        width={globeWidth}
        height={globeWidth}
        onGlobeReady={() => setGlobeReady(true)}
        
        // Dynamic map based on theme
        globeImageUrl={isLight 
          ? "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg" 
          : "https://unpkg.com/three-globe/example/img/earth-night.jpg"}
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        
        showAtmosphere={true}
        atmosphereColor={isLight ? "#93c5fd" : "#3b82f6"} // Lighter blue for day mode
        atmosphereAltitude={isLight ? 0.15 : 0.2}
        backgroundColor="rgba(0,0,0,0)"

        // Arcs (Network lines)
        arcsData={arcsData}
        arcStartLat={(d: any) => d.startLat}
        arcStartLng={(d: any) => d.startLng}
        arcEndLat={(d: any) => d.endLat}
        arcEndLng={(d: any) => d.endLng}
        arcColor={(d: any) => d.color}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcAltitudeAutoScale={0.3}

        // Map Pins (HTML Markers)
        htmlElementsData={heatmapData}
        htmlElement={(d: any) => {
          const el = document.createElement('div');
          // Cyan Map Pin style from the reference photo
          el.innerHTML = `
            <div style="
              display: flex; 
              flex-direction: column;
              align-items: center; 
              transform: translate(-50%, -100%);
              pointer-events: auto;
              cursor: pointer;
            ">
              <div style="
                width: 24px;
                height: 24px;
                background-color: #00f3ff;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 15px rgba(0, 243, 255, 0.8);
              ">
                <div style="
                  width: 8px;
                  height: 8px;
                  background-color: white;
                  border-radius: 50%;
                  transform: rotate(45deg);
                "></div>
              </div>
              <div style="
                margin-top: 6px;
                color: white; 
                font-size: 13px; 
                font-weight: bold; 
                font-family: sans-serif;
                text-shadow: 0px 2px 5px rgba(0,0,0,0.9);
                background: rgba(0,0,0,0.3);
                padding: 2px 6px;
                border-radius: 4px;
              ">
                ${d.country}
              </div>
            </div>
          `;
          el.onclick = () => onMarkerClick(d.crimes[0]);
          return el;
        }}
      />
    </div>
  );
}
