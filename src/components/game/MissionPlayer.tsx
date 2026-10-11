"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileWarning, RotateCcw, Trophy, Lightbulb, MapPin, Award } from "lucide-react";
import type { Mission, Stage, StageResult } from "@/game/types";
import { MAX_MISSION_SCORE, localizeMission, missionsFor } from "@/game/missions";
import { useLang, useT, type Translate } from "@/lib/i18n";
import { recordScore, signIn, useGameState } from "@/game/progress";
import { crimeData } from "@/data/crimeData";
import HuntStageView from "./HuntStageView";
import ObserveStageView from "./ObserveStageView";
import ChoiceStageView from "./ChoiceStageView";
import OrderStageView from "./OrderStageView";
import RealOrFakeView from "./RealOrFakeView";
import DialogueStageView from "./DialogueStageView";
import { FeedbackLine, PrimaryButton, panel } from "./ui";

function StageView({ stage, onDone }: { stage: Stage; onDone: (r: StageResult) => void }) {
  switch (stage.kind) {
    case "hunt": return <HuntStageView stage={stage} onDone={onDone} />;
    case "observe": return <ObserveStageView stage={stage} onDone={onDone} />;
    case "choice": return <ChoiceStageView stage={stage} onDone={onDone} />;
    case "order": return <OrderStageView stage={stage} onDone={onDone} />;
    case "real-or-fake": return <RealOrFakeView stage={stage} onDone={onDone} />;
    case "dialogue": return <DialogueStageView stage={stage} onDone={onDone} />;
  }
}

function grade(score: number, t: Translate) {
  if (score >= 900) return { label: "S", text: t("Outstanding work, detective.", "Kerja luar biasa, detektif."), tone: "text-emerald-500" };
  if (score >= 750) return { label: "A", text: t("Sharp eyes. Case closed.", "Mata yang tajam. Kasus ditutup."), tone: "text-emerald-500" };
  if (score >= 550) return { label: "B", text: t("Solid — a few clues slipped past you.", "Bagus — tapi ada beberapa petunjuk yang terlewat."), tone: "text-amber-500" };
  if (score >= 350) return { label: "C", text: t("The scammers almost won. Review the lessons.", "Penipunya hampir menang. Pelajari lagi pelajarannya."), tone: "text-orange-500" };
  return { label: "D", text: t("This one got away. Try again with the lessons below.", "Kasus ini lolos. Coba lagi dengan pelajaran di bawah."), tone: "text-red-500" };
}

export default function MissionPlayer({ mission: baseMission }: { mission: Mission }) {
  const lang = useLang();
  const t = useT();
  const mission = localizeMission(baseMission, lang);
  const state = useGameState();
  const [phase, setPhase] = useState<"briefing" | "playing" | "debrief">("briefing");
  const [stageIndex, setStageIndex] = useState(0);
  const [results, setResults] = useState<StageResult[]>([]);
  const [newBest, setNewBest] = useState(false);
  const [run, setRun] = useState(0);
  const [nameInput, setNameInput] = useState("");

  const total = results.reduce((a, r) => a + r.points, 0);
  const realCase = crimeData.find((c) => c.id === mission.caseId);
  const nextMission = missionsFor(lang).find((m) => m.number === mission.number + 1);

  const start = () => {
    if (!state.current && nameInput.trim()) signIn(nameInput);
    setPhase("playing");
    setStageIndex(0);
    setResults([]);
    setNewBest(false);
    setRun((r) => r + 1);
  };

  const stageDone = (r: StageResult) => {
    const all = [...results, r];
    setResults(all);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (stageIndex + 1 < mission.stages.length) {
      setStageIndex(stageIndex + 1);
    } else {
      const score = Math.min(MAX_MISSION_SCORE, all.reduce((a, x) => a + x.points, 0));
      setNewBest(recordScore(mission.id, score));
      setPhase("debrief");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      {/* Mission header */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <Link href="/game" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-primary"><ArrowLeft size={16} /> {t("Detective HQ", "Markas Detektif")}</Link>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">{mission.codename}</span>
          {phase === "playing" && <span className="text-foreground/60">{t("Stage", "Tahap")} {stageIndex + 1}/{mission.stages.length} · {total} {t("pts", "poin")}</span>}
        </div>
      </div>

      {phase === "briefing" && (
        <div className="max-w-3xl mx-auto">
          <div className={`${panel} p-6 sm:p-8`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-red-500 mb-3"><FileWarning size={14} /> {t("Classified briefing · Case", "Briefing rahasia · Kasus")} {String(mission.number).padStart(2, "0")}</div>
            <h1 className="text-3xl sm:text-4xl font-black font-[family-name:var(--font-orbitron)] mb-2">{mission.title}</h1>
            <p className="text-foreground/60 mb-5">{mission.tagline}</p>
            <div className="flex flex-wrap gap-2 mb-6 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/5"><MapPin size={12} /> {mission.location} · {mission.year}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/5"><Award size={12} /> {mission.skill}</span>
              <span className="px-2.5 py-1 rounded-full bg-foreground/5">{mission.stages.length} {t(mission.stages.length > 1 ? "stages" : "stage", "tahap")} · {MAX_MISSION_SCORE} {t("pts", "poin")}</span>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-foreground/80 leading-relaxed mb-8">
              {mission.briefing.map((p) => <p key={p}>{p}</p>)}
            </div>

            {!state.current && (
              <div className="mb-5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/50" htmlFor="agent-name">{t("Agent name (to save your score)", "Nama agen (untuk menyimpan skormu)")}</label>
                <input
                  id="agent-name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={24}
                  placeholder={t("e.g. Agent Nova", "mis. Agen Nova")}
                  className="mt-1.5 w-full px-4 py-3 rounded-xl bg-background border border-foreground/15 focus:border-primary focus:outline-none text-base"
                />
              </div>
            )}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-foreground/50">{state.current ? <>{t("Playing as", "Bermain sebagai")} <b className="text-foreground">{state.current}</b></> : nameInput.trim() ? "" : t("Leave empty to play as guest (score not saved).", "Kosongkan untuk bermain sebagai tamu (skor tidak disimpan).")}</span>
              <PrimaryButton onClick={start}>{t("Accept mission", "Terima misi")}</PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {phase === "playing" && <StageView key={`${run}-${stageIndex}`} stage={mission.stages[stageIndex]} onDone={stageDone} />}

      {phase === "debrief" && (() => {
        const g = grade(total, t);
        return (
          <div className="max-w-3xl mx-auto space-y-5">
            <div className={`${panel} p-6 sm:p-8 text-center`}>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/50 mb-2">{t("Mission debrief", "Laporan akhir misi")}</div>
              <div className={`text-7xl font-black font-[family-name:var(--font-orbitron)] ${g.tone}`}>{g.label}</div>
              <div className="text-3xl font-black font-mono mt-2">{total}<span className="text-base text-foreground/40"> / {MAX_MISSION_SCORE}</span></div>
              <p className="text-foreground/70 mt-2">{g.text}</p>
              {newBest && <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-sm font-bold"><Trophy size={15} /> {t("New personal best!", "Rekor pribadi baru!")}</div>}
              {!state.current && <p className="text-xs text-foreground/40 mt-3">{t("Playing as guest — this score wasn't saved.", "Bermain sebagai tamu — skor ini tidak disimpan.")}</p>}
            </div>

            <div className={`${panel} p-5 sm:p-6`}>
              <h2 className="font-black mb-4">{t("Your decisions", "Keputusanmu")}</h2>
              <div className="space-y-5">
                {results.map((r, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm font-bold mb-2">
                      <span>{mission.stages[i].title}</span>
                      <span className="font-mono">{r.points}/{r.maxPoints}</span>
                    </div>
                    <ul className="space-y-1.5">{r.feedback.map((f, j) => <FeedbackLine key={j} entry={f} />)}</ul>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${panel} p-5 sm:p-6 border-primary/30`}>
              <h2 className="font-black mb-3 flex items-center gap-2"><Lightbulb size={18} className="text-amber-500" /> {t("Key lessons", "Pelajaran utama")}</h2>
              <ul className="space-y-2">{mission.lessons.map((l) => <FeedbackLine key={l} entry={{ good: true, text: l }} />)}</ul>
              {realCase && (
                <a href={realCase.newsLink} target="_blank" rel="noopener noreferrer" className="mt-5 flex items-center justify-between gap-3 p-4 rounded-2xl bg-foreground/5 hover:bg-foreground/10 transition-colors">
                  <span className="text-sm"><span className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50">{t("The real case", "Kasus aslinya")}</span>{t(realCase.title)} — {t(realCase.country)}, {realCase.year}</span>
                  <ExternalLink size={16} className="shrink-0 text-primary" />
                </a>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button type="button" onClick={start} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-foreground/15 hover:bg-foreground/5 font-bold">
                <RotateCcw size={17} /> {t("Replay", "Main lagi")}
              </button>
              {nextMission ? (
                <Link href={`/game/${nextMission.id}`} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-white dark:text-black font-bold hover:bg-primary/90">
                  {t("Next case", "Kasus berikutnya")}: {nextMission.title}
                </Link>
              ) : (
                <Link href="/game" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-white dark:text-black font-bold hover:bg-primary/90">
                  {t("Back to HQ", "Kembali ke Markas")}
                </Link>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

