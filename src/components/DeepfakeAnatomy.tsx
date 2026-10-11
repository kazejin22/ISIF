"use client";

import { useRef, useState } from "react";
import { useT } from "@/lib/i18n";

// Landmark coordinates in the 1200×800 space of /images/anatomy-portrait.jpg.
type Pt = [number, number];

const JAW: Pt[] = [[300, 330], [305, 430], [330, 520], [370, 610], [430, 690], [500, 750], [570, 775], [650, 750], [720, 690], [775, 610], [805, 520], [815, 430], [820, 330]];
const BROW_L: Pt[] = [[350, 280], [400, 262], [450, 262], [500, 278]];
const BROW_R: Pt[] = [[620, 275], [670, 255], [720, 252], [770, 268]];
const EYE_L: Pt[] = [[395, 330], [420, 315], [450, 312], [480, 320], [495, 333], [470, 342], [440, 345], [410, 340]];
const EYE_R: Pt[] = [[625, 330], [645, 312], [675, 305], [705, 312], [725, 322], [705, 335], [675, 338], [645, 336]];
const NOSE_BRIDGE: Pt[] = [[560, 300], [560, 360], [561, 420], [565, 490]];
const NOSTRILS: Pt[] = [[510, 480], [535, 500], [565, 505], [600, 500], [625, 480]];
const MOUTH: Pt[] = [[465, 570], [510, 560], [570, 565], [630, 560], [685, 565], [650, 620], [570, 650], [495, 620]];
const HAIRLINE: Pt[] = [[310, 230], [380, 130], [480, 85], [600, 75], [720, 95], [800, 170], [825, 240]];

// Cross-links that turn the feature outlines into a triangulated-looking mesh.
const MESH_LINKS: [Pt, Pt][] = [
  [JAW[0], BROW_L[0]], [JAW[12], BROW_R[3]], [BROW_L[3], NOSE_BRIDGE[0]], [BROW_R[0], NOSE_BRIDGE[0]],
  [EYE_L[4], NOSE_BRIDGE[1]], [EYE_R[0], NOSE_BRIDGE[1]], [EYE_L[6], NOSTRILS[0]], [EYE_R[7], NOSTRILS[4]],
  [JAW[2], NOSTRILS[0]], [JAW[10], NOSTRILS[4]], [JAW[3], MOUTH[0]], [JAW[9], MOUTH[4]],
  [NOSTRILS[0], MOUTH[0]], [NOSTRILS[4], MOUTH[4]], [NOSTRILS[2], MOUTH[2]], [MOUTH[6], JAW[6]],
  [MOUTH[7], JAW[4]], [MOUTH[5], JAW[8]], [JAW[1], EYE_L[0]], [JAW[11], EYE_R[4]],
  [HAIRLINE[1], BROW_L[1]], [HAIRLINE[3], NOSE_BRIDGE[0]], [HAIRLINE[5], BROW_R[2]],
];

const OUTLINES: { pts: Pt[]; closed?: boolean }[] = [
  { pts: JAW }, { pts: BROW_L }, { pts: BROW_R }, { pts: EYE_L, closed: true }, { pts: EYE_R, closed: true },
  { pts: NOSE_BRIDGE }, { pts: NOSTRILS }, { pts: MOUTH, closed: true }, { pts: HAIRLINE },
];

const ALL_POINTS = OUTLINES.flatMap((o) => o.pts);

// Where face-swap artifacts usually show up — positions in % of the frame.
const HOTSPOTS = [
  { x: 37, y: 41, label: "Eyes", note: "Odd blinking, mismatched catchlights" },
  { x: 47, y: 75, label: "Mouth & teeth", note: "Lip-sync drift, smeared teeth" },
  { x: 60, y: 86, label: "Jawline seam", note: "Blending halo where the mask ends" },
  { x: 67, y: 21, label: "Hairline", note: "Flicker when the head turns" },
];

const toPoints = (pts: Pt[]) => pts.map((p) => p.join(",")).join(" ");

export default function DeepfakeAnatomy() {
  const t = useT();
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const moveTo = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div
        ref={containerRef}
        className="relative w-full aspect-3/2 rounded-2xl overflow-hidden cursor-ew-resize bg-foreground/10 select-none touch-pan-y"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          moveTo(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
        onPointerUp={() => { dragging.current = false; }}
        onPointerCancel={() => { dragging.current = false; }}
      >
        {/* Layer 1: the original photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/anatomy-portrait.jpg" alt={t("Portrait of a smiling man", "Potret pria yang tersenyum")} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full font-bold text-[10px] sm:text-xs text-white border border-white/20">
          {t("Original photo", "Foto asli")}
        </span>

        {/* Layer 2: what a face-swap model "sees", revealed right of the handle */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/anatomy-portrait.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.45] contrast-125" draggable={false} />
          <svg viewBox="0 0 1200 800" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden>
            <g stroke="#00f3ff" strokeWidth="1.5" fill="none" opacity="0.55">
              {MESH_LINKS.map(([a, b], i) => <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />)}
            </g>
            <g stroke="#00f3ff" strokeWidth="2.5" fill="none">
              {OUTLINES.map((o, i) => o.closed
                ? <polygon key={i} points={toPoints(o.pts)} />
                : <polyline key={i} points={toPoints(o.pts)} />)}
            </g>
            <g fill="#ffffff">
              {ALL_POINTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.5" />)}
            </g>
          </svg>
          {HOTSPOTS.map((h) => (
            <div key={h.label} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
              <span className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/30 animate-pulse" />
              <span className="hidden sm:block mt-1 px-2 py-1 rounded-md bg-black/75 text-[10px] leading-tight text-white text-center whitespace-nowrap">
                <b className="text-red-400">{t(h.label)}</b><br />{t(h.note)}
              </span>
            </div>
          ))}
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full font-bold text-[10px] sm:text-xs text-cyan-300 border border-cyan-300/30">
            {t("Face-swap model's view", "Pandangan model face-swap")}
          </span>
        </div>

        {/* Handle */}
        <div
          role="slider"
          tabIndex={0}
          aria-label={t("Reveal the face-swap landmark mesh", "Tampilkan jaring titik wajah face-swap")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 5));
            if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 5));
          }}
          className="absolute top-0 bottom-0 w-1 -ml-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{ left: `${position}%` }}
        >
          <div className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center shadow-lg gap-1">
            <span className="w-0.5 h-3.5 bg-black/70 rounded-full" />
            <span className="w-0.5 h-3.5 bg-black/70 rounded-full" />
          </div>
        </div>
      </div>

      {/* Hotspot legend for small screens, where labels on the image would be too cramped */}
      <ul className="sm:hidden grid grid-cols-2 gap-2 text-[11px]">
        {HOTSPOTS.map((h) => (
          <li key={h.label} className="flex items-start gap-1.5 text-foreground/70">
            <span className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
            <span><b className="text-foreground/90">{t(h.label)}:</b> {t(h.note)}</span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-foreground/50 leading-relaxed">
        {t(
          "Face-swap tools first detect facial landmarks like these, then warp a generated face onto the mesh and blend the edges. The red markers show where that process most often leaves visible artifacts — the places to look first.",
          "Alat face-swap pertama-tama mendeteksi titik-titik wajah seperti ini, lalu menempelkan wajah buatan ke jaring tersebut dan menghaluskan tepinya. Penanda merah menunjukkan bagian yang paling sering meninggalkan jejak — tempat pertama yang perlu dicek.",
        )}
        <span className="block mt-1 text-foreground/40">{t("Photo: Unsplash.", "Foto: Unsplash.")}</span>
      </p>
    </div>
  );
}
