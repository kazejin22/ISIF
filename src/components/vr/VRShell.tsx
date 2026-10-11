"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { XR, noEvents, PointerEvents, useXR, type XRStore } from "@react-three/xr";
import { ArrowLeft, Glasses, MousePointer2, RotateCcw, TriangleAlert } from "lucide-react";
import Environment from "./Environment";

// @react-three/fiber (up to 9.8.x) still creates a THREE.Clock, which three r185
// reports as deprecated on every load. It's harmless library noise, so drop only
// that one message instead of letting it pile up as a dev "issue".
if (typeof window !== "undefined") {
  const warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith("THREE.Clock: This module has been deprecated")) return;
    warn(...args);
  };
}

/** Can this browser create a WebGL context right now? (False when it has blocked 3D for the page.) */
function canUseWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Reports whether an immersive session is running, so the page can adapt its DOM UI. */
function SessionWatcher({ onChange }: { onChange: (inVR: boolean) => void }) {
  const mode = useXR((s) => s.mode);
  useEffect(() => onChange(mode === "immersive-vr"), [mode, onChange]);
  return null;
}

function GraphicsProblem({ blocked }: { blocked: boolean }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-[#0b1324]">
      <div className="max-w-md rounded-2xl border border-white/10 bg-black/50 p-6 text-white text-center">
        <TriangleAlert className="mx-auto mb-3 text-amber-400" size={32} />
        <h2 className="text-lg font-black mb-2">{blocked ? "3D graphics are blocked" : "The 3D view was interrupted"}</h2>
        <p className="text-sm text-white/70 mb-4">
          {blocked
            ? "The browser has turned off 3D graphics for this page, usually after a graphics reset. Close this tab completely and open the page again. On Meta Quest, if that does not help, fully quit and reopen the browser."
            : "The graphics chip reset while the game was running. Reloading usually fixes it."}
        </p>
        <button type="button" onClick={() => location.reload()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00f3ff] text-black font-bold">
          <RotateCcw size={16} /> Reload
        </button>
      </div>
    </div>
  );
}

export default function VRShell({
  store, title, subtitle, desktopHint, environment, children,
}: {
  store: XRStore; title: string; subtitle: string; desktopHint: string; environment: "lab" | "firewall"; children: React.ReactNode;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [inVR, setInVR] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // This component only renders in the browser (it is loaded with ssr: false), so probing here is safe.
  const [webgl] = useState(canUseWebGL);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const xr = (navigator as Navigator & { xr?: { isSessionSupported(mode: string): Promise<boolean> } }).xr;
    if (!xr) {
      // Without native WebXR the store injects a Quest emulator, but only on localhost.
      Promise.resolve().then(() => !cancelled && setSupported(location.hostname === "localhost"));
    } else {
      xr.isSessionSupported("immersive-vr").then((ok) => !cancelled && setSupported(ok)).catch(() => !cancelled && setSupported(false));
    }
    return () => { cancelled = true; };
  }, []);

  const enter = async () => {
    setError(null);
    try {
      await store.enterVR();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start VR.");
    }
  };

  return (
    <div className="relative w-full h-[calc(100dvh-4rem)] bg-[#0b1324] overflow-hidden">
      {webgl && (
        <Canvas
          events={noEvents}
          camera={{ position: [0, 1.42, 0.85], fov: 60, near: 0.01, far: 40 }}
          onCreated={({ camera, gl }) => {
            camera.lookAt(0, 1.15, -0.6);
            // Let the browser restore a lost context instead of failing for good.
            gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); setContextLost(true); });
            gl.domElement.addEventListener("webglcontextrestored", () => setContextLost(false));
          }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
        >
          <PointerEvents />
          <XR store={store}>
            <SessionWatcher onChange={setInVR} />
            <Environment variant={environment} />
            {children}
          </XR>
        </Canvas>
      )}

      {(!webgl || contextLost) && <GraphicsProblem blocked={!webgl} />}

      {!inVR && webgl && !contextLost && (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <Link href="/game" className="pointer-events-auto inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white bg-black/40 backdrop-blur px-3 py-2 rounded-xl">
              <ArrowLeft size={16} /> HQ
            </Link>
            <div className="text-right">
              <div className="text-white font-black font-[family-name:var(--font-orbitron)] text-lg sm:text-2xl [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">{title}</div>
              <div className="text-white/70 text-xs sm:text-sm [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">{subtitle}</div>
            </div>
          </div>

          <div className="pointer-events-auto w-full sm:w-80 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 p-3 text-white">
            {supported ? (
              <>
                <button type="button" onClick={enter} className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00f3ff] text-black font-black hover:brightness-110">
                  <Glasses size={22} /> Enter VR
                </button>
                <p className="text-[11px] text-white/50 mt-2 text-center">Best on Meta Quest. Put on the headset, then press Enter VR.</p>
              </>
            ) : (
              <p className="text-xs text-white/70 text-center">
                {supported === null ? "Checking for a VR headset…" : "No VR headset detected. Open this page in the Meta Quest Browser to play in VR."}
              </p>
            )}
            <p className="text-[11px] text-white/50 mt-2 flex items-center justify-center gap-1.5"><MousePointer2 size={12} /> {desktopHint}</p>
            {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
