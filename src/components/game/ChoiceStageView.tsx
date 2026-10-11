"use client";

import { useState } from "react";
import type { ChoiceStage, StageResult } from "@/game/types";
import { ContinueButton, PointsBadge, StageIntro, panel } from "./ui";
import { useT } from "@/lib/i18n";

export default function ChoiceStageView({ stage, onDone }: { stage: ChoiceStage; onDone: (r: StageResult) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const choice = stage.options.find((o) => o.id === picked);
  const best = stage.options.reduce((a, b) => (b.points > a.points ? b : a));
  const t = useT();

  return (
    <div className="max-w-3xl">
      <StageIntro title={stage.title} brief={stage.brief} maxPoints={stage.maxPoints} />
      <div className="space-y-3">
        {stage.options.map((o) => {
          const state = !picked ? "idle" : o.id === picked ? (o.points === best.points ? "best" : "picked") : o.id === best.id ? "answer" : "dim";
          return (
            <button
              key={o.id}
              type="button"
              disabled={Boolean(picked)}
              onClick={() => setPicked(o.id)}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all text-sm sm:text-base ${
                state === "idle" ? "border-foreground/10 bg-background/60 hover:border-primary/50 hover:bg-primary/5" :
                state === "best" ? "border-emerald-500/60 bg-emerald-500/10" :
                state === "picked" ? "border-amber-500/60 bg-amber-500/10" :
                state === "answer" ? "border-emerald-500/40 bg-emerald-500/5" : "border-foreground/5 opacity-50"
              }`}
            >
              {o.text}
              {picked && (o.id === picked || o.id === best.id) && (
                <span className="block text-xs sm:text-sm mt-2 text-foreground/70">{o.id === best.id && o.id !== picked ? t("Best answer — ", "Jawaban terbaik — ") : ""}{o.feedback}</span>
              )}
            </button>
          );
        })}
      </div>
      {choice && (
        <div className={`${panel} p-4 mt-5 flex items-center justify-between gap-3 flex-wrap`}>
          <PointsBadge points={choice.points} maxPoints={stage.maxPoints} />
          <ContinueButton onClick={() => onDone({ points: choice.points, maxPoints: stage.maxPoints, feedback: [{ good: choice.points === best.points, text: choice.feedback }] })} />
        </div>
      )}
    </div>
  );
}
