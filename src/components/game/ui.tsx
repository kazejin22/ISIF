"use client";

import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import type { FeedbackEntry } from "@/game/types";
import { useT } from "@/lib/i18n";

export const panel = "rounded-3xl border border-foreground/10 bg-background/60 backdrop-blur-xl";

export function StageIntro({ title, brief, maxPoints }: { title: string; brief: string; maxPoints: number }) {
  const t = useT();
  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">{t(`Up to ${maxPoints} points`, `Maksimal ${maxPoints} poin`)}</div>
      <h2 className="text-xl sm:text-2xl font-black font-[family-name:var(--font-orbitron)]">{title}</h2>
      <p className="text-sm text-foreground/60 mt-1">{brief}</p>
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-white dark:text-black font-bold hover:bg-primary/90 disabled:opacity-40 transition-all w-full sm:w-auto"
    >
      {children}
    </button>
  );
}

export function ContinueButton({ onClick, label }: { onClick: () => void; label?: string }) {
  const t = useT();
  return (
    <PrimaryButton onClick={onClick}>
      {label ?? t("Continue", "Lanjut")} <ArrowRight size={18} />
    </PrimaryButton>
  );
}

export function FeedbackLine({ entry }: { entry: FeedbackEntry }) {
  return (
    <li className="flex gap-2.5 text-sm leading-relaxed">
      {entry.good ? <CheckCircle2 size={17} className="text-emerald-500 shrink-0 mt-0.5" /> : <XCircle size={17} className="text-red-500 shrink-0 mt-0.5" />}
      <span className="text-foreground/80">{entry.text}</span>
    </li>
  );
}

export function PointsBadge({ points, maxPoints }: { points: number; maxPoints: number }) {
  const ratio = points / maxPoints;
  const tone = ratio >= 0.8 ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" : ratio >= 0.4 ? "text-amber-500 border-amber-500/30 bg-amber-500/10" : "text-red-500 border-red-500/30 bg-red-500/10";
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-black font-mono ${tone}`}>
      +{points} <span className="text-[10px] font-bold opacity-70">/ {maxPoints}</span>
    </span>
  );
}
