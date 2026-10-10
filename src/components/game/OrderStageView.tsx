"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { OrderStage, StageResult } from "@/game/types";
import { ContinueButton, PointsBadge, PrimaryButton, StageIntro, panel } from "./ui";

/** Deterministic shuffle that never returns the solved order. */
function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.every((x, i) => x === items[i]) ? [...out.slice(1), out[0]] : out;
}

/** Share of pairs that are in the correct relative order (1 = perfect). */
function pairAccuracy(order: string[], correct: string[]) {
  const pos = new Map(correct.map((id, i) => [id, i]));
  let good = 0;
  let total = 0;
  for (let i = 0; i < order.length; i++)
    for (let j = i + 1; j < order.length; j++) {
      total++;
      if (pos.get(order[i])! < pos.get(order[j])!) good++;
    }
  return total ? good / total : 1;
}

export default function OrderStageView({ stage, onDone }: { stage: OrderStage; onDone: (r: StageResult) => void }) {
  const correct = stage.steps.map((s) => s.id);
  const [order, setOrder] = useState(() => shuffled(correct));
  const [submitted, setSubmitted] = useState(false);
  const byId = Object.fromEntries(stage.steps.map((s) => [s.id, s]));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  };

  const accuracy = pairAccuracy(order, correct);
  const points = Math.round(stage.maxPoints * accuracy);

  return (
    <div className="max-w-3xl">
      <StageIntro title={stage.title} brief="Use the arrows to put these steps in the best order, first to last." maxPoints={stage.maxPoints} />
      <ol className="space-y-2">
        {(submitted ? correct : order).map((id, i) => {
          const placedRight = order[i] === id;
          return (
            <li key={id} className={`${panel} flex items-center gap-3 p-3 sm:p-4 ${submitted ? (placedRight ? "border-emerald-500/40" : "border-amber-500/40") : ""}`}>
              <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-sm font-black flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="flex-1 text-sm sm:text-base">
                {byId[id].text}
                {submitted && <span className="block text-xs text-foreground/60 mt-1">{byId[id].why}{!placedRight && " (you placed this elsewhere)"}</span>}
              </span>
              {!submitted && (
                <span className="flex flex-col gap-1">
                  <button type="button" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 rounded-lg hover:bg-foreground/10 disabled:opacity-20"><ArrowUp size={16} /></button>
                  <button type="button" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === order.length - 1} className="p-1.5 rounded-lg hover:bg-foreground/10 disabled:opacity-20"><ArrowDown size={16} /></button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
        {submitted ? (
          <>
            <div className="flex items-center gap-3 text-sm text-foreground/60"><PointsBadge points={points} maxPoints={stage.maxPoints} /> {Math.round(accuracy * 100)}% of steps in the right relative order</div>
            <ContinueButton onClick={() => onDone({
              points,
              maxPoints: stage.maxPoints,
              feedback: [{ good: accuracy >= 0.8, text: `Correct order: ${correct.map((id) => byId[id].text.split(" — ")[0].replace(/\.$/, "")).join(" → ")}.` }],
            })} />
          </>
        ) : (
          <PrimaryButton onClick={() => setSubmitted(true)}>Lock in my plan</PrimaryButton>
        )}
      </div>
    </div>
  );
}
