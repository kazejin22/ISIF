"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { XR, noEvents, PointerEvents, useXR, type XRStore } from "@react-three/xr";
import { ArrowLeft, Glasses, MousePointer2 } from "lucide-react";

/** Dark lab room: floor grid, glowing ring and soft lights. Cheap enough for Quest 2. */
function Room() {
  return (
    <>
      <color attach="background" args={["#04060c"]} />
      <fog attach="fog" args={["#04060c", 4, 14]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[1.5, 3, 1]} intensity={1.2} />
      <mesh rotation-x={-Math.PI / 2} position-y={0}>
        <circleGeometry args={[8, 48]} />
        <meshStandardMaterial color="#0a1020" roughness={0.9} />
      </mesh>
      <gridHelper args={[16, 32, "#0e7490", "#10213a"]} position-y={0.002} />
      <mesh rotation-x={-Math.PI / 2} position-y={0.004}>
        <ringGeometry args={[2.9, 3, 64]} />
        <meshBasicMaterial color="#00f3ff" transparent opacity={0.35} toneMapped={false} />
      </mesh>
    </>
  );
}

/** Reports whether an immersive session is running, so the page can adapt its DOM UI. */
function SessionWatcher({ onChange }: { onChange: (inVR: boolean) => void }) {
  const mode = useXR((s) => s.mode);
  useEffect(() => onChange(mode === "immersive-vr"), [mode, onChange]);
  return null;
}

export default function VRShell({
  store, title, subtitle, desktopHint, children,
}: {
  store: XRStore; title: string; subtitle: string; desktopHint: string; children: React.ReactNode;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [inVR, setInVR] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const xr = (navigator as Navigator & { xr?: { isSessionSupported(mode: string): Promise<boolean> } }).xr;
    if (!xr) {
      // The store injects an emulator on localhost, so XR may still work there.
      Promise.resolve().then(() => !cancelled && setSupported(location.hostname === "localhost"));
    } else {
      xr.isSessionSupported("immersive-vr").then((ok) => !cancelled && setSupported(ok || location.hostname === "localhost")).catch(() => !cancelled && setSupported(false));
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
    <div className="relative w-full h-[calc(100dvh-4rem)] bg-[#04060c] overflow-hidden">
      <Canvas
        events={noEvents}
        camera={{ position: [0, 1.42, 0.85], fov: 60, near: 0.01, far: 40 }}
        onCreated={({ camera }) => camera.lookAt(0, 1.15, -0.6)}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
      >
        <PointerEvents />
        <XR store={store}>
          <SessionWatcher onChange={setInVR} />
          <Room />
          {children}
        </XR>
      </Canvas>

      {!inVR && (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <Link href="/game" className="pointer-events-auto inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white bg-black/40 backdrop-blur px-3 py-2 rounded-xl">
              <ArrowLeft size={16} /> HQ
            </Link>
            <div className="text-right">
              <div className="text-white font-black font-[family-name:var(--font-orbitron)] text-lg sm:text-2xl">{title}</div>
              <div className="text-white/60 text-xs sm:text-sm">{subtitle}</div>
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
