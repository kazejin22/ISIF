"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Bot, Flame, Timer } from "lucide-react";
import type { RealOrFakeStage, StageResult, FeedbackEntry } from "@/game/types";
import { ContinueButton, PointsBadge, StageIntro, panel } from "./ui";

type Answer = "real" | "ai" | "timeout";

export default function RealOrFakeView({ stage, onDone }: { stage: RealOrFakeStage; onDone: (r: StageResult) => void }) {
  const perRound = stage.maxPoints / stage.rounds.length;
  const base = Math.round(perRound * 0.8);
  const speedMax = perRound - base;

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [left, setLeft] = useState(stage.secondsPerRound);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gained, setGained] = useState(0);
  const feedback = useRef<FeedbackEntry[]>([]);
  const round = stage.rounds[index];

  const answerWith = (a: Answer, secondsLeft: number) => {
    const correct = a === round.answer;
    const gain = correct ? base + Math.round(speedMax * (secondsLeft / stage.secondsPerRound)) : 0;
    setAnswer(a);
    setGained(gain);
    setPoints((p) => p + gain);
    setStreak((s) => (correct ? s + 1 : 0));
    feedback.current.push({ good: correct, text: `Image ${index + 1}: ${round.explain}` });
  };

  // Countdown; a timeout counts as a wrong answer.
  useEffect(() => {
    if (answer) return;
    const started = Date.now();
    const id = setInterval(() => {
      const remaining = Math.max(0, stage.secondsPerRound - (Date.now() - started) / 1000);
      setLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        answerWith("timeout", 0);
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, answer]);

  const next = () => {
    if (index + 1 >= stage.rounds.length) {
      onDone({ points: Math.min(stage.maxPoints, points), maxPoints: stage.maxPoints, feedback: feedback.current });
      return;
    }
    setIndex(index + 1);
    setAnswer(null);
    setLeft(stage.secondsPerRound);
  };

  const correct = answer === round.answer;

  return (
    <div className="max-w-4xl">
      <StageIntro title={stage.title} brief={stage.brief} maxPoints={stage.maxPoints} />

      <div className="flex items-center justify-between gap-3 mb-3 text-sm">
        <span className="font-bold">Image {index + 1} / {stage.rounds.length}</span>
        <span className="flex items-center gap-4">
          {streak >= 2 && <span className="inline-flex items-center gap-1 text-orange-500 font-bold"><Flame size={15} /> {streak} streak</span>}
          <span className="font-mono font-black">{points} pts</span>
        </span>
      </div>

      <div className={`${panel} overflow-hidden`}>
        <div className="relative bg-black flex items-center justify-center aspect-[4/3] sm:aspect-[16/10]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={round.id} src={round.src} alt={`Evidence image ${index + 1}`} className="max-w-full max-h-full object-contain" draggable={false} />
          {!answer && (
            <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 text-white text-xs font-mono">
              <Timer size={13} /> {Math.ceil(left)}s
            </div>
          )}
          {answer && (
            <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-sm font-black text-white ${correct ? "bg-emerald-500" : "bg-red-500"}`}>
              {answer === "timeout" ? "Time's up!" : correct ? "Correct!" : "Wrong"} — it&apos;s {round.answer === "ai" ? "AI-generated" : "a real photo"}
            </div>
          )}
        </div>
        {!answer && (
          <div className="h-1 bg-foreground/10"><div className="h-full bg-primary transition-[width] duration-100 ease-linear" style={{ width: `${(left / stage.secondsPerRound) * 100}%` }} /></div>
        )}

        <div className="p-4 sm:p-5">
          {!answer ? (
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => answerWith("real", left)} className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 font-black text-emerald-600 dark:text-emerald-400 transition-colors">
                <Camera size={20} /> REAL PHOTO
              </button>
              <button type="button" onClick={() => answerWith("ai", left)} className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 font-black text-red-600 dark:text-red-400 transition-colors">
                <Bot size={20} /> AI-GENERATED
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-foreground/80">{round.explain}</p>
              <p className="text-[11px] text-foreground/40">{round.credit}</p>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <PointsBadge points={gained} maxPoints={Math.round(perRound)} />
                <ContinueButton onClick={next} label={index + 1 >= stage.rounds.length ? "Finish" : "Next image"} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
