import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { crimeData, type CrimeType } from "@/data/crimeData";
import { T } from "@/lib/i18n";

export const TYPE_COLORS: Record<CrimeType, string> = {
  "Financial Fraud": "#f97316",
  "Voice Scam": "#facc15",
  "Political Disinformation": "#ef4444",
  "Non-consensual Imagery": "#a855f7",
  Impersonation: "#22d3ee",
};

const latest = [...crimeData].sort((a, b) => b.year - a.year)[0];
const newestYear = latest.year;

/**
 * Flat world map teaser for the home page. The textures are equirectangular (2:1),
 * so a case's lat/lng maps straight to a percentage position — no WebGL needed.
 */
export default function MapPreview() {
  return (
    <Link
      href="/map"
      aria-label="Open the global deepfake case map"
      className="card-fx group block rounded-3xl overflow-hidden border border-foreground/10 bg-[#030712] shadow-2xl"
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-white/10 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex w-2 h-2 shrink-0">
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
            <span className="relative w-2 h-2 rounded-full bg-red-500" />
          </span>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] truncate">
            <T en="Global Case Map" id="Peta Kasus Global" />
          </span>
        </div>
        <span className="text-[11px] sm:text-xs text-white/60 shrink-0">
          {crimeData.length} <T en="cases" id="kasus" />
        </span>
      </div>

      <div className="relative aspect-[2/1] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/textures/earth-night.jpg" alt="" loading="lazy" className="absolute inset-0 w-full h-full object-fill brightness-[1.35] saturate-[1.2] transition-transform duration-[1500ms] group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.06)_1px,transparent_1px)] bg-[size:8.33%_16.66%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />

        {crimeData.map((c) => {
          const [lat, lng] = c.location;
          const color = TYPE_COLORS[c.type];
          return (
            <span
              key={c.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${((lng + 180) / 360) * 100}%`, top: `${((90 - lat) / 180) * 100}%` }}
              title={`${c.title} — ${c.country} (${c.year})`}
            >
              {c.year === newestYear && <span className="absolute inset-0 rounded-full animate-ping" style={{ background: color, opacity: 0.6 }} />}
              <span className="relative block w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full ring-2 ring-black/40" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
            </span>
          );
        })}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold shadow-2xl">
            <T en="Open Global Map" id="Buka Peta Global" /> <ArrowRight size={16} />
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-5 py-3 sm:py-4 text-white">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
          {(Object.keys(TYPE_COLORS) as CrimeType[]).map((type) => (
            <span key={type} className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/60">
              <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[type] }} />
              <T en={type} />
            </span>
          ))}
        </div>
        <div className="flex items-start gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
          <MapPin size={14} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-white/80 leading-snug min-w-0">
            <span className="text-white/50"><T en="Latest:" id="Terbaru:" /> </span>
            <T en={latest.title} /> <span className="text-white/50">· <T en={latest.country} /> {latest.year}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
