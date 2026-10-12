"use client";

import { AudioLines, Megaphone, PhoneCall, Play, ScanEye, UserRound, Video } from "lucide-react";
import { useT } from "@/lib/i18n";

/** Accent colour per mission, used by the case card and its art. */
export const CASE_ACCENTS: Record<string, string> = {
  "video-call-heist": "#38bdf8",
  "real-or-synthetic": "#a855f7",
  "mom-help-me": "#f43f5e",
  "election-eve": "#f59e0b",
};

const BARS = [0.5, 0.9, 0.6, 1, 0.7, 0.4, 0.85, 0.55, 0.95, 0.65, 0.45, 0.8, 0.6, 0.9, 0.5, 0.75];

function Wave({ color, count = BARS.length, className = "" }: { color: string; count?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-[3px] h-10 ${className}`} aria-hidden>
      {BARS.slice(0, count).map((h, i) => (
        <span key={i} className="wave-bar w-[3px] rounded-full" style={{ height: `${h * 100}%`, background: color, animationDelay: `${(i % 7) * 0.12}s` }} />
      ))}
    </div>
  );
}

/** Video call with four tiles; the "CFO" tile is being scanned. */
function VideoCallArt({ accent }: { accent: string }) {
  const t = useT();
  const people = [t("CFO", "CFO"), t("Legal", "Hukum"), t("Partner", "Mitra"), t("You", "Kamu")];
  return (
    <div className="absolute inset-0 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between text-[10px] font-mono text-white/70">
        <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE · 4</span>
        <Video size={13} />
      </div>
      <div className="grid grid-cols-2 gap-1.5 flex-1">
        {people.map((p, i) => (
          <div key={p} className="relative rounded-lg overflow-hidden bg-white/[0.06] border border-white/10 flex items-center justify-center">
            <UserRound size={26} className={i === 0 ? "" : "text-white/40"} style={i === 0 ? { color: accent } : undefined} />
            <span className="absolute bottom-1 left-1.5 text-[9px] text-white/70">{p}</span>
            {i === 0 && (
              <>
                <span className="scan-sweep absolute left-0 right-0 h-px" style={{ background: accent, boxShadow: `0 0 10px 2px ${accent}` }} />
                <span className="absolute inset-0 rounded-lg ring-1" style={{ ["--tw-ring-color" as string]: accent }} />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Three tilted photos, one under a scanner frame. */
function PhotoArt({ accent }: { accent: string }) {
  const photos = ["/game/rof/e6.jpg", "/game/rof/e1.jpg", "/game/rof/e7.jpg"];
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {photos.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          className="absolute w-[34%] aspect-[3/4] object-cover rounded-lg border-2 border-white/80 shadow-2xl transition-transform duration-500 group-hover:scale-105"
          style={{ transform: `translateX(${(i - 1) * 62}%) rotate(${(i - 1) * 9}deg)`, zIndex: i === 1 ? 2 : 1 }}
        />
      ))}
      <div className="relative z-10 w-[38%] aspect-[3/4] rounded-xl border-2 border-dashed overflow-hidden" style={{ borderColor: accent }}>
        <span className="scan-sweep absolute left-0 right-0 h-0.5" style={{ background: accent, boxShadow: `0 0 12px 3px ${accent}` }} />
        <span className="absolute -top-px left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-b-md text-[9px] font-black text-black" style={{ background: accent }}>AI?</span>
      </div>
      <ScanEye size={18} className="absolute top-3 right-3 text-white/70" />
    </div>
  );
}

/** Incoming call from an unknown number, with a pulsing avatar and a cloned voice. */
function CallArt({ accent }: { accent: string }) {
  const t = useT();
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-5 px-5">
      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
        <span className="ring-pulse absolute inset-0 rounded-full" style={{ background: accent }} />
        <span className="ring-pulse absolute inset-0 rounded-full" style={{ background: accent, animationDelay: "1.2s" }} />
        <span className="relative w-14 h-14 rounded-full flex items-center justify-center text-white" style={{ background: accent }}>
          <PhoneCall size={24} />
        </span>
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-mono text-white/60 uppercase tracking-widest">{t("Incoming call", "Panggilan masuk")}</div>
        <div className="text-white font-bold text-sm mb-1">{t("Unknown number", "Nomor tak dikenal")}</div>
        <Wave color={accent} count={12} />
      </div>
    </div>
  );
}

/** A viral audio post with a share counter. */
function ViralAudioArt({ accent }: { accent: string }) {
  const t = useT();
  return (
    <div className="absolute inset-0 flex items-center justify-center px-5">
      <div className="float-slow w-full max-w-[260px] rounded-xl bg-black/50 backdrop-blur border border-white/15 p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black text-black" style={{ background: accent }}>{t("VIRAL", "VIRAL")}</span>
          <Megaphone size={12} className="text-white/60" />
          <span className="ml-auto text-[10px] font-mono text-white/60">12.4K ↗</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: accent }}>
            <Play size={14} className="ml-0.5 fill-black text-black" />
          </span>
          <Wave color={accent} className="flex-1 overflow-hidden" />
          <AudioLines size={14} className="text-white/50 shrink-0" />
        </div>
      </div>
    </div>
  );
}

const ART: Record<string, (p: { accent: string }) => React.ReactElement> = {
  "video-call-heist": VideoCallArt,
  "real-or-synthetic": PhotoArt,
  "mom-help-me": CallArt,
  "election-eve": ViralAudioArt,
};

export default function CaseArt({ missionId }: { missionId: string }) {
  const accent = CASE_ACCENTS[missionId] ?? "#38bdf8";
  const Art = ART[missionId];
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: `radial-gradient(120% 90% at 20% 0%, ${accent}40, transparent 60%), linear-gradient(160deg, #0b1220, #05070d)` }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:22px_22px]" />
      {Art && <Art accent={accent} />}
    </div>
  );
}
