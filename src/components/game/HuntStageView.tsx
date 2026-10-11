"use client";

import { useState } from "react";
import { Lightbulb, Mail, Paperclip } from "lucide-react";
import type { HuntSegment, HuntStage, StageResult } from "@/game/types";
import { ContinueButton, FeedbackLine, PointsBadge, PrimaryButton, StageIntro, panel } from "./ui";
import { useT } from "@/lib/i18n";

const WRONG_CLICK_PENALTY = 40;

export default function HuntStageView({ stage, onDone }: { stage: HuntStage; onDone: (r: StageResult) => void }) {
  const segments = [stage.email.from, stage.email.subject, ...stage.email.body, ...(stage.email.attachment ? [stage.email.attachment] : [])];
  const flags = segments.filter((s) => s.flag);
  const perFlag = stage.maxPoints / flags.length;

  const [found, setFound] = useState<Record<string, "found" | "hinted">>({});
  const [wrong, setWrong] = useState<string[]>([]);
  const [last, setLast] = useState<HuntSegment | null>(null);
  const [finished, setFinished] = useState(false);
  const t = useT();

  const foundCount = Object.keys(found).length;
  const points = Math.max(0, Math.round(
    Object.values(found).reduce((a, v) => a + (v === "found" ? perFlag : perFlag / 2), 0) - wrong.length * WRONG_CLICK_PENALTY,
  ));

  const click = (s: HuntSegment) => {
    if (finished || found[s.id] || wrong.includes(s.id)) return;
    setLast(s);
    if (s.flag) {
      const next = { ...found, [s.id]: "found" as const };
      setFound(next);
      if (Object.keys(next).length === flags.length) setFinished(true);
    } else {
      setWrong([...wrong, s.id]);
    }
  };

  const hint = () => {
    const target = flags.find((f) => !found[f.id]);
    if (!target) return;
    const next = { ...found, [target.id]: "hinted" as const };
    setFound(next);
    setLast(target);
    if (Object.keys(next).length === flags.length) setFinished(true);
  };

  const finish = () => {
    const feedback = [
      ...flags.map((f) => ({
        good: Boolean(found[f.id]),
        text: found[f.id] ? `${t("Found", "Ditemukan")}: ${f.explain}` : `${t("Missed", "Terlewat")}: ${f.explain}`,
      })),
      ...wrong.map((id) => ({ good: false, text: `${t("Not a red flag", "Bukan tanda bahaya")} (−${WRONG_CLICK_PENALTY}): ${segments.find((s) => s.id === id)!.explain}` })),
    ];
    onDone({ points, maxPoints: stage.maxPoints, feedback });
  };

  const seg = (s: HuntSegment, className = "") => {
    const state = found[s.id] ? "found" : wrong.includes(s.id) ? "wrong" : finished && s.flag ? "missed" : "idle";
    const tone = {
      idle: "hover:bg-primary/10 hover:outline-primary/40 cursor-pointer",
      found: "bg-emerald-500/15 outline-emerald-500/60",
      wrong: "bg-red-500/10 outline-red-500/50 line-through decoration-red-500/60",
      missed: "bg-amber-500/15 outline-amber-500/60",
    }[state];
    return (
      <button
        type="button"
        onClick={() => click(s)}
        className={`text-left rounded-md px-1.5 py-0.5 -mx-1.5 outline outline-1 outline-transparent transition-colors ${tone} ${className}`}
      >
        {s.text}
      </button>
    );
  };

  return (
    <div>
      <StageIntro title={stage.title} brief={stage.brief} maxPoints={stage.maxPoints} />

      <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
        {/* Email client */}
        <div className={`${panel} overflow-hidden`}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-foreground/10 bg-foreground/[0.03] text-xs font-bold text-foreground/60">
            <Mail size={14} className="text-primary" /> {t("Inbox", "Kotak masuk")} — Meridian Engineering
          </div>
          <div className="p-4 sm:p-6 space-y-3 text-sm">
            <div className="flex gap-2 flex-wrap items-baseline"><span className="text-foreground/40 w-16 shrink-0">{t("From", "Dari")}</span>{seg(stage.email.from, "font-semibold")}</div>
            <div className="flex gap-2 flex-wrap items-baseline"><span className="text-foreground/40 w-16 shrink-0">{t("To", "Kepada")}</span><span>you@meridian-engineering.com</span></div>
            <div className="flex gap-2 flex-wrap items-baseline"><span className="text-foreground/40 w-16 shrink-0">{t("Subject", "Subjek")}</span>{seg(stage.email.subject, "font-bold")}</div>
            <hr className="border-foreground/10" />
            <div className="space-y-3 leading-relaxed">
              {stage.email.body.map((b) => <p key={b.id}>{seg(b)}</p>)}
            </div>
            {stage.email.attachment && (
              <div className="pt-2 flex items-center gap-2 text-foreground/70">
                <Paperclip size={14} /> {seg(stage.email.attachment, "font-mono text-xs")}
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <div className={`${panel} p-5`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">{t("Red flags found", "Tanda bahaya ditemukan")}</span>
              <span className="font-mono font-black text-lg">{foundCount}/{flags.length}</span>
            </div>
            <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(foundCount / flags.length) * 100}%` }} />
            </div>
            <div className="text-xs text-foreground/50 mt-3">{t("Score so far", "Skor sementara")}: <b className="text-foreground">{points}</b> · {t("wrong clicks", "klik salah")} −{WRONG_CLICK_PENALTY} {t("each", "per klik")}</div>
          </div>

          {last && (
            <div className={`${panel} p-5 text-sm ${last.flag ? "border-emerald-500/30" : "border-red-500/30"}`}>
              <div className={`font-bold mb-1 ${last.flag ? "text-emerald-500" : "text-red-500"}`}>{last.flag ? t("Red flag!", "Tanda bahaya!") : t("Not a red flag", "Bukan tanda bahaya")}</div>
              <p className="text-foreground/75 leading-relaxed">{last.explain}</p>
            </div>
          )}

          {!finished ? (
            <div className="flex gap-3">
              <button type="button" onClick={hint} className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-foreground/10 hover:bg-foreground/5 text-sm font-bold">
                <Lightbulb size={16} className="text-amber-500" /> {t("Hint (½ points)", "Petunjuk (½ poin)")}
              </button>
              <PrimaryButton onClick={() => setFinished(true)}>{t("I'm done", "Selesai")}</PrimaryButton>
            </div>
          ) : (
            <div className={`${panel} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold">{t("Stage complete", "Tahap selesai")}</span>
                <PointsBadge points={points} maxPoints={stage.maxPoints} />
              </div>
              <ul className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
                {flags.filter((f) => !found[f.id]).map((f) => <FeedbackLine key={f.id} entry={{ good: false, text: `${t("Missed", "Terlewat")}: ${f.explain}` }} />)}
                {flags.every((f) => found[f.id]) && <FeedbackLine entry={{ good: true, text: t("You found every red flag.", "Kamu menemukan semua tanda bahaya.") }} />}
              </ul>
              <ContinueButton onClick={finish} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
