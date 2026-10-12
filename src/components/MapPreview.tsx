import Link from "next/link";
import { ArrowUpRight, MapPin, Radar } from "lucide-react";
import { crimeData } from "@/data/crimeData";
import { T } from "@/lib/i18n";
import MiniGlobe from "./MiniGlobe";

const latest = [...crimeData].sort((a, b) => b.year - a.year)[0];

// Radar blips around the globe: [left %, top %, delay s, use the secondary colour].
const BLIPS: [number, number, number, boolean][] = [
  [11, 20, 0, false], [87, 24, 0.6, true], [7, 46, 1.2, false], [93, 44, 1.8, false],
  [16, 62, 0.9, true], [83, 60, 2.4, false], [31, 12, 1.5, false], [69, 11, 2.1, false],
  [4, 30, 2.7, true], [95, 64, 0.3, false], [24, 40, 2.2, false], [76, 38, 1.1, false],
];

const CORNERS = ["top-3 left-3 border-t-2 border-l-2 rounded-tl-lg", "top-3 right-3 border-t-2 border-r-2 rounded-tr-lg", "bottom-3 left-3 border-b-2 border-l-2 rounded-bl-lg", "bottom-3 right-3 border-b-2 border-r-2 rounded-br-lg"];

/** Home-page teaser for the Crime Map: the rotating globe on a radar screen, in the site's theme. */
export default function MapPreview() {
  return (
    <Link
      href="/map"
      aria-label="Open the global deepfake case map"
      className="card-fx group relative block rounded-[1.75rem] overflow-hidden border border-foreground/10 shadow-2xl shadow-primary/10 aspect-[4/5] sm:aspect-square bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-[#071029] dark:via-[#040816] dark:to-[#0b0620]"
    >
      {/* Dot grid, fading out towards the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(color-mix(in_srgb,var(--primary)_38%,transparent)_1px,transparent_1.6px)] bg-[size:18px_18px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]" />

      {/* Blips */}
      {BLIPS.map(([x, y, delay, alt], i) => (
        <span
          key={i}
          aria-hidden
          className={`radar-blip absolute w-1.5 h-1.5 rounded-full ${alt ? "bg-secondary shadow-[0_0_10px_var(--secondary)]" : "bg-primary shadow-[0_0_10px_var(--primary)]"}`}
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s` }}
        />
      ))}

      {/* Stage: radar and globe share one centre, above the bottom panel */}
      <div className="absolute inset-x-0 top-[8%] bottom-[34%] sm:top-[7%] sm:bottom-[25%]">
        {/* Radar: rings, crosshair and a rotating sweep, centred behind the globe */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[150%] aspect-square pointer-events-none">
          {[100, 80, 62].map((s) => (
            <div key={s} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20" style={{ width: `${s}%`, height: `${s}%` }} />
          ))}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/25 to-transparent" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
          <div className="radar-sweep absolute inset-[10%] rounded-full bg-[conic-gradient(from_0deg,color-mix(in_srgb,var(--primary)_32%,transparent),transparent_70deg)] [mask-image:radial-gradient(circle,black_55%,transparent_71%)]" />
        </div>
        <MiniGlobe />
      </div>

      {/* HUD corners */}
      {CORNERS.map((c) => <span key={c} aria-hidden className={`absolute w-5 h-5 border-primary/50 ${c}`} />)}

      {/* Top bar */}
      <div className="absolute top-5 left-5 right-5 flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/70 backdrop-blur-md border border-foreground/10 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em]">
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
            <span className="relative w-2 h-2 rounded-full bg-red-500" />
          </span>
          <T en="Live case map" id="Peta kasus live" />
        </span>
        <span className="flex flex-col items-end gap-0.5">
          <span className="font-black font-[family-name:var(--font-orbitron)] text-2xl sm:text-3xl leading-none text-primary">{crimeData.length}</span>
          <span className="text-[10px] uppercase tracking-widest text-foreground/50"><T en="cases tracked" id="kasus dipantau" /></span>
        </span>
      </div>

      {/* Bottom glass panel */}
      <div className="absolute left-3 right-3 bottom-3 sm:left-4 sm:right-4 sm:bottom-4 rounded-2xl bg-background/75 backdrop-blur-xl border border-foreground/10 p-3 sm:p-4 shadow-lg">
        <div className="flex items-start gap-3 mb-2.5">
          <span className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
            <MapPin size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-widest text-foreground/45 mb-0.5"><T en="Latest case" id="Kasus terbaru" /> · {latest.year}</div>
            <div className="text-sm font-bold truncate"><T en={latest.title} /> <span className="font-normal text-foreground/50">· <T en={latest.country} /></span></div>
          </div>
          <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 transition-transform group-hover:rotate-45 group-hover:scale-110" aria-hidden>
            <ArrowUpRight size={16} />
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2.5 border-t border-foreground/10">
          <Radar size={12} className="text-primary mt-px" aria-hidden />
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] text-foreground/60">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" />
            <T en="Reported case" id="Kasus terlapor" />
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] text-foreground/60">
            <span className="relative w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_6px_var(--secondary)]"><span className="absolute -inset-1 rounded-full border border-secondary/60" /></span>
            <T en={`Recent (${latest.year - 1}–${latest.year})`} id={`Terbaru (${latest.year - 1}–${latest.year})`} />
          </span>
        </div>
      </div>
    </Link>
  );
}
