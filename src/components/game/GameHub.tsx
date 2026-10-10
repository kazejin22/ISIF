"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, Trophy, MapPin, ArrowRight, CheckCircle2, UserRound, LogOut, Crown, Mail, Image as ImageIcon, PhoneCall, Vote } from "lucide-react";
import { MISSIONS, MAX_MISSION_SCORE, rankFor } from "@/game/missions";
import { leaderboard, signIn, signOut, totalScore, useGameState } from "@/game/progress";
import { useMounted } from "@/lib/useMounted";
import { panel } from "./ui";

const ICONS = [Mail, ImageIcon, PhoneCall, Vote];
const MAX_TOTAL = MISSIONS.length * MAX_MISSION_SCORE;

export default function GameHub() {
  const mounted = useMounted();
  const state = useGameState();
  const [name, setName] = useState("");
  const agent = state.current ? state.agents[state.current] : undefined;
  const total = totalScore(agent);
  const { current: rank, next } = rankFor(total);
  const board = leaderboard(state);
  const progressToNext = next ? ((total - rank.min) / (next.min - rank.min)) * 100 : 100;

  return (
    <div className="container mx-auto px-4 py-10 md:py-16 max-w-6xl">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-5">
          <ShieldAlert size={14} /> Interactive mission
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-[family-name:var(--font-orbitron)] tracking-tight mb-4">
          Deepfake <span className="text-primary">Detective</span>
        </h1>
        <p className="text-foreground/60 md:text-lg">
          Four cases inspired by real deepfake crimes. Inspect the evidence, make the call under pressure, and earn your rank.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Missions */}
        <div className="grid sm:grid-cols-2 gap-4">
          {MISSIONS.map((m, i) => {
            const Icon = ICONS[i] ?? ShieldAlert;
            const best = mounted ? agent?.best[m.id] : undefined;
            return (
              <Link key={m.id} href={`/game/${m.id}`} className={`${panel} group p-5 flex flex-col hover:border-primary/50 hover:-translate-y-0.5 transition-all`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Icon size={22} /></div>
                  <span className="text-[10px] font-mono font-bold text-foreground/40">CASE {String(m.number).padStart(2, "0")}</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 mb-1">{m.codename}</div>
                <h2 className="text-lg font-black mb-1.5 group-hover:text-primary transition-colors">{m.title}</h2>
                <p className="text-sm text-foreground/60 leading-relaxed flex-1">{m.tagline}</p>
                <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-foreground/10 text-xs">
                  <span className="inline-flex items-center gap-1 text-foreground/50"><MapPin size={12} /> {m.location} · {m.year}</span>
                  {best !== undefined ? (
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-500"><CheckCircle2 size={13} /> {best}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-primary">Start <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" /></span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Agent + leaderboard */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <div className={`${panel} p-5`}>
            {!mounted ? (
              <div className="h-28" />
            ) : agent ? (
              <>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0"><UserRound size={22} /></div>
                    <div className="min-w-0">
                      <div className="font-black truncate">{agent.name}</div>
                      <div className="text-xs text-primary font-bold">{rank.title}</div>
                    </div>
                  </div>
                  <button type="button" onClick={signOut} className="p-2 rounded-lg hover:bg-foreground/10 text-foreground/50" aria-label="Switch agent" title="Switch agent"><LogOut size={16} /></button>
                </div>
                <div className="flex items-baseline justify-between text-sm mb-1.5">
                  <span className="text-foreground/50">Total score</span>
                  <span className="font-mono font-black text-lg">{total}<span className="text-xs text-foreground/40"> / {MAX_TOTAL}</span></span>
                </div>
                <div className="h-2 rounded-full bg-foreground/10 overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${progressToNext}%` }} /></div>
                <div className="text-[11px] text-foreground/50 mt-1.5">{next ? `${next.min - total} pts to ${next.title}` : "Highest rank reached!"}</div>
              </>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); signIn(name); setName(""); }}>
                <div className="font-black mb-1">Register as an agent</div>
                <p className="text-xs text-foreground/50 mb-3">Your scores are saved on this device and appear on the leaderboard.</p>
                <div className="flex gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="Agent name" aria-label="Agent name" className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-background border border-foreground/15 focus:border-primary focus:outline-none text-base sm:text-sm" />
                  <button type="submit" disabled={!name.trim()} className="px-4 rounded-xl bg-primary text-white dark:text-black font-bold text-sm disabled:opacity-40">Join</button>
                </div>
              </form>
            )}
          </div>

          <div className={`${panel} p-5`}>
            <div className="flex items-center gap-2 font-black mb-3"><Trophy size={17} className="text-amber-500" /> Leaderboard</div>
            {mounted && board.length ? (
              <ol className="space-y-1.5">
                {board.map((row, i) => (
                  <li key={row.name} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${row.name === state.current ? "bg-primary/10" : "bg-foreground/[0.03]"}`}>
                    <span className="w-5 text-center font-mono font-bold text-foreground/50">{i === 0 ? <Crown size={15} className="text-amber-500 inline" /> : i + 1}</span>
                    <span className="flex-1 truncate font-bold">{row.name}</span>
                    <span className="text-[10px] text-foreground/40">{row.missions}/{MISSIONS.length}</span>
                    <span className="font-mono font-black">{row.total}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-foreground/50">No scores yet. Complete a case to claim the top spot.</p>
            )}
            <p className="text-[10px] text-foreground/40 mt-3">Scores are stored on this device.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
