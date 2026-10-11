"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Phone, PhoneOff, User, ShieldCheck, ShieldX } from "lucide-react";
import type { DialogueChoice, DialogueStage, FeedbackEntry, StageResult } from "@/game/types";
import { ContinueButton, PointsBadge, StageIntro, panel } from "./ui";
import { useT } from "@/lib/i18n";

/** Highest total achievable from a node (for normalising the score to maxPoints). */
function bestFrom(stage: DialogueStage, id: string, seen = new Set<string>()): number {
  const node = stage.nodes[id];
  if (!node?.choices || seen.has(id)) return 0;
  const next = new Set(seen).add(id);
  return Math.max(...node.choices.map((c) => c.points + bestFrom(stage, c.next, next)));
}

/** Short synthetic ringtone with the Web Audio API (no audio files needed). */
function useRingtone(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let ctx: AudioContext | null = null;
    try {
      ctx = new AudioContext();
    } catch {
      return;
    }
    const ring = () => {
      if (!ctx) return;
      for (const [offset, freq] of [[0, 880], [0.25, 660]] as const) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.06, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.22);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.24);
      }
    };
    ring();
    const id = setInterval(ring, 1600);
    return () => {
      clearInterval(id);
      ctx?.close();
    };
  }, [active]);
}

const SPEAKER: Record<string, { label: [string, string]; tone: string }> = {
  voice: { label: ["“Emma”", "“Emma”"], tone: "bg-pink-500/15 border-pink-500/30" },
  caller: { label: ["Unknown man", "Pria tak dikenal"], tone: "bg-red-500/15 border-red-500/30" },
  daughter: { label: ["Emma (her own phone)", "Emma (dari ponselnya sendiri)"], tone: "bg-emerald-500/15 border-emerald-500/30" },
  narrator: { label: ["", ""], tone: "bg-foreground/5 border-foreground/10 italic" },
};

export default function DialogueStageView({ stage, onDone }: { stage: DialogueStage; onDone: (r: StageResult) => void }) {
  const best = useMemo(() => bestFrom(stage, stage.start), [stage]);
  const [ringing, setRinging] = useState(true);
  const [nodeId, setNodeId] = useState(stage.start);
  const [shown, setShown] = useState(0);
  const [log, setLog] = useState<{ node: string; picked?: DialogueChoice }[]>([{ node: stage.start }]);
  const [earned, setEarned] = useState(0);
  const [left, setLeft] = useState(stage.secondsPerChoice);
  const feedback = useRef<FeedbackEntry[]>([]);
  const bottom = useRef<HTMLDivElement>(null);
  const node = stage.nodes[nodeId];
  const t = useT();

  useRingtone(ringing);

  // Reveal the current node's lines one by one.
  useEffect(() => {
    if (ringing || shown >= node.lines.length) return;
    const id = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 300 : 1300);
    return () => clearTimeout(id);
  }, [ringing, shown, node]);

  const choicesVisible = !ringing && shown >= node.lines.length && Boolean(node.choices);

  const choose = (c: DialogueChoice) => {
    feedback.current.push({ good: c.points > 0, text: c.feedback });
    setEarned((e) => e + c.points);
    setLog((l) => [...l.slice(0, -1), { ...l[l.length - 1], picked: c }, { node: c.next }]);
    setNodeId(c.next);
    setShown(0);
    setLeft(stage.secondsPerChoice);
  };

  // Countdown for each decision.
  useEffect(() => {
    if (!choicesVisible) return;
    const started = Date.now();
    const id = setInterval(() => {
      const remaining = Math.max(0, stage.secondsPerChoice - (Date.now() - started) / 1000);
      setLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        choose(stage.timeoutChoice);
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choicesVisible, nodeId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [shown, nodeId]);

  const points = Math.min(stage.maxPoints, Math.round((earned / best) * stage.maxPoints));

  if (ringing) {
    return (
      <div className="max-w-sm mx-auto">
        <StageIntro title={stage.title} brief={stage.brief} maxPoints={stage.maxPoints} />
        <div className="rounded-[2.5rem] bg-neutral-950 text-white p-8 flex flex-col items-center gap-6 shadow-2xl border border-white/10">
          <div className="text-xs uppercase tracking-[0.3em] text-white/50">{t("Incoming call", "Panggilan masuk")}</div>
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center animate-pulse"><User size={44} /></div>
          <div className="text-center">
            <div className="text-xl font-bold">{t("Unknown number", "Nomor tidak dikenal")}</div>
            <div className="text-sm text-white/50">+1 (520) 555-01··</div>
          </div>
          <div className="flex gap-10 pt-4">
            <button type="button" onClick={() => setRinging(false)} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center opacity-40 cursor-not-allowed" aria-label={t("Decline (disabled in this simulation)", "Tolak (dinonaktifkan di simulasi ini)")} disabled>
              <PhoneOff size={26} />
            </button>
            <button type="button" onClick={() => setRinging(false)} className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center animate-bounce" aria-label={t("Answer call", "Angkat telepon")}>
              <Phone size={26} />
            </button>
          </div>
          <p className="text-[11px] text-white/40 text-center">{t("Tap the green button to answer.", "Ketuk tombol hijau untuk mengangkat.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StageIntro title={stage.title} brief={stage.brief} maxPoints={stage.maxPoints} />
      <div className={`${panel} p-4 sm:p-5`}>
        <div className="flex items-center justify-between text-xs text-foreground/50 mb-4">
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {t("Call in progress", "Panggilan berlangsung")}</span>
          <span className="font-mono">{t("Score", "Skor")} {points}</span>
        </div>

        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {log.map((entry, li) => {
            const n = stage.nodes[entry.node];
            const visible = li === log.length - 1 ? n.lines.slice(0, shown) : n.lines;
            return (
              <div key={li} className="space-y-2">
                {visible.map((line, i) => (
                  <div key={i} className={`rounded-2xl border px-4 py-3 text-sm ${SPEAKER[line.speaker].tone}`}>
                    {SPEAKER[line.speaker].label[0] && <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-0.5">{t(...SPEAKER[line.speaker].label)}</div>}
                    {line.text}
                  </div>
                ))}
                {entry.picked && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-primary/15 border border-primary/30 px-4 py-3 text-sm">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">{t("You", "Kamu")}</div>
                      {entry.picked.text}
                      <div className="text-xs text-foreground/60 mt-1.5">{entry.picked.feedback}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottom} />
        </div>

        {choicesVisible && node.choices && (
          <div className="mt-4 space-y-2">
            <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
              <div className={`h-full transition-[width] duration-100 ease-linear ${left < 5 ? "bg-red-500" : "bg-primary"}`} style={{ width: `${(left / stage.secondsPerChoice) * 100}%` }} />
            </div>
            {node.choices.map((c) => (
              <button key={c.text} type="button" onClick={() => choose(c)} className="w-full text-left p-3.5 rounded-2xl border border-foreground/10 hover:border-primary/50 hover:bg-primary/5 text-sm transition-colors">
                {c.text}
              </button>
            ))}
          </div>
        )}

        {node.ending && shown >= node.lines.length && (
          <div className={`mt-5 rounded-2xl p-5 border ${node.ending.good ? "border-emerald-500/40 bg-emerald-500/10" : "border-red-500/40 bg-red-500/10"}`}>
            <div className="flex items-center gap-2 font-black text-lg mb-3">
              {node.ending.good ? <ShieldCheck className="text-emerald-500" /> : <ShieldX className="text-red-500" />} {node.ending.title}
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <PointsBadge points={points} maxPoints={stage.maxPoints} />
              <ContinueButton onClick={() => onDone({ points, maxPoints: stage.maxPoints, feedback: [{ good: node.ending!.good, text: `${t("Ending", "Akhir")}: ${node.ending!.title}.` }, ...feedback.current] })} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
