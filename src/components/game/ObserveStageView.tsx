"use client";

import { useState } from "react";
import { CheckSquare, Square, Video, MicOff, Heart, Repeat2, Play } from "lucide-react";
import type { ObserveStage, StageResult } from "@/game/types";
import { ContinueButton, FeedbackLine, PointsBadge, PrimaryButton, StageIntro, panel } from "./ui";

function VideoCallScene() {
  const tiles = [
    { name: "David Chen (CFO)", speaking: true },
    { name: "Legal adviser", speaking: false },
    { name: "Finance — London", speaking: false },
    { name: "You", speaking: false, self: true },
  ];
  return (
    <div className="rounded-2xl bg-neutral-950 p-2 grid grid-cols-2 gap-2">
      {tiles.map((t) => (
        <div key={t.name} className={`relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 ${t.speaking ? "ring-2 ring-emerald-400" : ""}`}>
          {/* Stylised head; the remote ones are slightly blurred and jittery to hint at low-quality deepfake video */}
          <div className={`absolute inset-0 flex items-end justify-center ${t.self ? "" : "blur-[1.5px]"}`}>
            <div className={`relative w-[38%] aspect-[3/4] mb-[-6%] ${t.speaking ? "animate-[jitter_2.4s_steps(2)_infinite]" : ""}`}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[62%] aspect-square rounded-full bg-amber-200/80" />
              <div className="absolute bottom-0 inset-x-0 h-[48%] rounded-t-[45%] bg-slate-400/70" />
            </div>
          </div>
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white">
            {!t.speaking && !t.self && <MicOff size={10} className="text-red-400" />}{t.name}
          </div>
          {t.speaking && <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-amber-300">LOW QUALITY</div>}
        </div>
      ))}
      <style>{`@keyframes jitter { 0%,100% { transform: translate(0,0) } 50% { transform: translate(0.6px,-0.6px) } }`}</style>
    </div>
  );
}

function SocialPostScene({ transcript }: { transcript: ObserveStage["transcript"] }) {
  const [account, audio, stats] = transcript;
  return (
    <div className="rounded-2xl bg-background border border-foreground/10 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-400" />
        <div className="text-sm"><b>{account.speaker.split(" · ")[0]}</b><div className="text-xs text-foreground/50">{account.speaker.split(" · ")[1]}</div></div>
      </div>
      <p className="text-sm">{account.line}</p>
      <div className="flex items-center gap-3 rounded-xl bg-foreground/5 p-3">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center"><Play size={16} className="text-primary ml-0.5" /></div>
        <div className="flex-1 flex items-end gap-[3px] h-8" aria-hidden>
          {Array.from({ length: 36 }, (_, i) => (
            <span key={i} className="flex-1 rounded-full bg-primary/60" style={{ height: `${25 + ((i * 37) % 60)}%` }} />
          ))}
        </div>
        <span className="text-xs font-mono text-foreground/50">0:58</span>
      </div>
      <p className="text-xs italic text-foreground/60">{audio.line}</p>
      <div className="flex items-center gap-4 text-xs text-foreground/50">
        <span className="inline-flex items-center gap-1"><Heart size={13} /> 52K</span>
        <span className="inline-flex items-center gap-1"><Repeat2 size={13} /> 18K</span>
        <span>{stats.line.split(" · ").slice(2).join(" · ")}</span>
      </div>
    </div>
  );
}

export default function ObserveStageView({ stage, onDone }: { stage: ObserveStage; onDone: (r: StageResult) => void }) {
  const [ticked, setTicked] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const suspicious = stage.items.filter((i) => i.suspicious);
  const unit = stage.maxPoints / suspicious.length;
  const correctTicks = suspicious.filter((i) => ticked[i.id]).length;
  const wrongTicks = stage.items.filter((i) => !i.suspicious && ticked[i.id]).length;
  const points = Math.max(0, Math.round(correctTicks * unit - wrongTicks * (unit / 2)));

  const finish = () =>
    onDone({
      points,
      maxPoints: stage.maxPoints,
      feedback: stage.items
        .filter((i) => i.suspicious || ticked[i.id])
        .map((i) => ({ good: i.suspicious === Boolean(ticked[i.id]), text: i.explain })),
    });

  return (
    <div>
      <StageIntro title={stage.title} brief={stage.brief} maxPoints={stage.maxPoints} />
      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <div className={`${panel} p-4 space-y-4`}>
          <div className="flex items-center gap-2 text-xs font-bold text-foreground/60">
            <Video size={14} className="text-primary" /> {stage.scene === "video-call" ? "Video call · 15:00 HKT" : "Trending post"}
          </div>
          {stage.scene === "video-call" ? <VideoCallScene /> : <SocialPostScene transcript={stage.transcript} />}
          {stage.scene === "video-call" && (
            <ul className="space-y-2 text-sm">
              {stage.transcript.map((t, i) => (
                <li key={i} className="flex gap-2"><b className="shrink-0 text-foreground/80">{t.speaker}:</b><span className="text-foreground/70">{t.line}</span></li>
              ))}
            </ul>
          )}
        </div>

        <div className={`${panel} p-4 sm:p-5`}>
          <div className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-3">What&apos;s suspicious?</div>
          <ul className="space-y-2">
            {stage.items.map((item) => {
              const on = Boolean(ticked[item.id]);
              const verdict = submitted ? (item.suspicious === on ? "right" : "wrong") : null;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={submitted}
                    onClick={() => setTicked({ ...ticked, [item.id]: !on })}
                    className={`w-full text-left flex gap-3 p-3 rounded-xl border transition-colors ${
                      verdict === "right" ? "border-emerald-500/40 bg-emerald-500/5" : verdict === "wrong" ? "border-red-500/40 bg-red-500/5" : on ? "border-primary/50 bg-primary/5" : "border-foreground/10 hover:bg-foreground/5"
                    }`}
                  >
                    {on ? <CheckSquare size={18} className="text-primary shrink-0 mt-0.5" /> : <Square size={18} className="text-foreground/40 shrink-0 mt-0.5" />}
                    <span className="text-sm">
                      {item.text}
                      {submitted && <span className={`block text-xs mt-1 ${verdict === "right" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>{item.suspicious ? "Suspicious — " : "Not evidence — "}{item.explain}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
            {submitted ? (
              <>
                <PointsBadge points={points} maxPoints={stage.maxPoints} />
                <ContinueButton onClick={finish} />
              </>
            ) : (
              <PrimaryButton onClick={() => setSubmitted(true)}>Submit observations</PrimaryButton>
            )}
          </div>
          {submitted && wrongTicks > 0 && <ul className="mt-3"><FeedbackLine entry={{ good: false, text: `${wrongTicks} item(s) ticked that aren't real evidence (−${Math.round(unit / 2)} each).` }} /></ul>}
        </div>
      </div>
    </div>
  );
}
