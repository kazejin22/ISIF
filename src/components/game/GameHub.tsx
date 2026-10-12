"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, Trophy, MapPin, ArrowRight, CheckCircle2, UserRound, LogOut, Crown, Medal, Globe2, Smartphone, Mail, Image as ImageIcon, PhoneCall, Vote, Glasses, ScanSearch, Swords } from "lucide-react";
import { MAX_MISSION_SCORE, SCORED_MISSION_IDS, missionsFor, rankFor } from "@/game/missions";
import { useLang, useT } from "@/lib/i18n";
import { leaderboard, signIn, signOut, syncCurrentAgent, totalScore, useGameState } from "@/game/progress";
import type { GlobalRow, LeaderboardResponse } from "@/app/api/leaderboard/route";
import { useMounted } from "@/lib/useMounted";
import { panel } from "./ui";

const ICONS = [Mail, ImageIcon, PhoneCall, Vote];
const MAX_TOTAL = SCORED_MISSION_IDS.length * MAX_MISSION_SCORE;
const REFRESH_MS = 20_000;

/** The online leaderboard: null while loading, "off" when the server has no database. */
function useGlobalBoard(): GlobalRow[] | "off" | null {
  const [rows, setRows] = useState<GlobalRow[] | "off" | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/leaderboard", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((data: LeaderboardResponse) => alive && setRows(data.enabled ? data.rows : "off"))
        .catch(() => alive && setRows((prev) => (Array.isArray(prev) ? prev : "off")));
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => { alive = false; clearInterval(id); };
  }, []);
  return rows;
}

const VR_MODES: { id: string; href: string; Icon: typeof Swords; title: [string, string]; text: [string, string] }[] = [
  {
    id: "vr-forensic-lab", href: "/game/vr/lab", Icon: ScanSearch,
    title: ["Forensic Lab", "Lab Forensik"],
    text: ["Grab evidence with your controllers and sweep the AI Scanner over it to reveal hidden clues.", "Ambil barang bukti dengan controller dan sapukan Pemindai AI di atasnya untuk mengungkap petunjuk tersembunyi."],
  },
  {
    id: "vr-firewall", href: "/game/vr/firewall", Icon: Swords,
    title: ["Misinformation Firewall", "Firewall Misinformasi"],
    text: ["Posts fly at you. Slash the fakes with laser sabers and let credible news pass.", "Unggahan melayang ke arahmu. Tebas yang palsu dengan pedang laser dan biarkan berita tepercaya lewat."],
  },
];

export default function GameHub() {
  const mounted = useMounted();
  const state = useGameState();
  const [name, setName] = useState("");
  const agent = state.current ? state.agents[state.current] : undefined;
  const total = totalScore(agent);
  const { current: rank, next } = rankFor(total);
  const board = leaderboard(state);
  const global = useGlobalBoard();
  const [scope, setScope] = useState<"global" | "device">("global");
  const showGlobal = scope === "global" && global !== "off";

  // Make sure this agent's saved scores are on the online board.
  const current = state.current;
  useEffect(() => { if (current) syncCurrentAgent(); }, [current]);
  const progressToNext = next ? ((total - rank.min) / (next.min - rank.min)) * 100 : 100;
  const lang = useLang();
  const t = useT();
  const missions = missionsFor(lang);

  return (
    <div className="container mx-auto px-4 py-10 md:py-16 max-w-6xl">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-5">
          <ShieldAlert size={14} /> {t("Interactive mission", "Misi interaktif")}
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-[family-name:var(--font-orbitron)] tracking-tight mb-4">
          Deepfake <span className="text-primary">Detective</span>
        </h1>
        <p className="text-foreground/60 md:text-lg">
          {t(
            "Four cases inspired by real deepfake crimes. Inspect the evidence, make the call under pressure, and earn your rank.",
            "Empat kasus dari kejahatan deepfake nyata. Periksa barang bukti, ambil keputusan di bawah tekanan, dan raih pangkatmu.",
          )}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Missions */}
        <div className="grid sm:grid-cols-2 gap-4">
          {missions.map((m, i) => {
            const Icon = ICONS[i] ?? ShieldAlert;
            const best = mounted ? agent?.best[m.id] : undefined;
            return (
              <Link key={m.id} href={`/game/${m.id}`} className={`${panel} group p-5 flex flex-col hover:border-primary/50 hover:-translate-y-0.5 transition-all`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Icon size={22} /></div>
                  <span className="text-[10px] font-mono font-bold text-foreground/40">{t("CASE", "KASUS")} {String(m.number).padStart(2, "0")}</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 mb-1">{m.codename}</div>
                <h2 className="text-lg font-black mb-1.5 group-hover:text-primary transition-colors">{m.title}</h2>
                <p className="text-sm text-foreground/60 leading-relaxed flex-1">{m.tagline}</p>
                <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-foreground/10 text-xs">
                  <span className="inline-flex items-center gap-1 text-foreground/50"><MapPin size={12} /> {m.location} · {m.year}</span>
                  {best !== undefined ? (
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-500"><CheckCircle2 size={13} /> {best}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-primary">{t("Start", "Mulai")} <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" /></span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* VR missions */}
        <div className="sm:col-span-2 lg:col-span-1 lg:row-start-2">
          <div className="flex items-center gap-2 mb-3 mt-2">
            <Glasses size={18} className="text-primary" />
            <h2 className="font-black">{t("VR Missions", "Misi VR")}</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">Meta Quest</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {VR_MODES.map(({ id, href, title, text, Icon }) => {
              const best = mounted ? agent?.best[id] : undefined;
              return (
                <Link key={id} href={href} className={`${panel} group p-5 flex gap-4 hover:border-primary/50 transition-all`}>
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 text-primary flex items-center justify-center shrink-0"><Icon size={22} /></div>
                  <div className="min-w-0">
                    <div className="font-black group-hover:text-primary transition-colors">{t(...title)}</div>
                    <p className="text-xs text-foreground/60 leading-relaxed mt-1">{t(...text)}</p>
                    <div className="text-[11px] mt-2 font-bold">{best !== undefined ? <span className="text-emerald-500 font-mono">{t("Best", "Terbaik")} {best}</span> : <span className="text-primary">{t("Play in VR or with a mouse →", "Main di VR atau pakai mouse →")}</span>}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Agent + leaderboard */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:row-span-2 lg:col-start-2 lg:row-start-1">
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
                      <div className="text-xs text-primary font-bold">{t(rank.title, rank.titleId)}</div>
                    </div>
                  </div>
                  <button type="button" onClick={signOut} className="p-2 rounded-lg hover:bg-foreground/10 text-foreground/50" aria-label={t("Switch agent", "Ganti agen")} title={t("Switch agent", "Ganti agen")}><LogOut size={16} /></button>
                </div>
                <div className="flex items-baseline justify-between text-sm mb-1.5">
                  <span className="text-foreground/50">{t("Total score", "Skor total")}</span>
                  <span className="font-mono font-black text-lg">{total}<span className="text-xs text-foreground/40"> / {MAX_TOTAL}</span></span>
                </div>
                <div className="h-2 rounded-full bg-foreground/10 overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${progressToNext}%` }} /></div>
                <div className="text-[11px] text-foreground/50 mt-1.5">{next ? t(`${next.min - total} pts to ${next.title}`, `${next.min - total} poin lagi menuju ${next.titleId}`) : t("Highest rank reached!", "Pangkat tertinggi tercapai!")}</div>
              </>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); signIn(name); setName(""); }}>
                <div className="font-black mb-1">{t("Register as an agent", "Daftar sebagai agen")}</div>
                <p className="text-xs text-foreground/50 mb-3">{t("Your scores are saved on this device and appear on the leaderboard.", "Skormu disimpan di perangkat ini dan muncul di papan peringkat.")}</p>
                <div className="flex gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder={t("Agent name", "Nama agen")} aria-label={t("Agent name", "Nama agen")} className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-background border border-foreground/15 focus:border-primary focus:outline-none text-base sm:text-sm" />
                  <button type="submit" disabled={!name.trim()} className="px-4 rounded-xl bg-primary text-white dark:text-black font-bold text-sm disabled:opacity-40">{t("Join", "Gabung")}</button>
                </div>
              </form>
            )}
          </div>

          <div className={`${panel} p-5`}>
            <div className="flex items-center gap-2 font-black mb-3">
              <Trophy size={17} className="text-amber-500" /> {t("Leaderboard", "Papan Peringkat")}
            </div>
            {global !== "off" && (
                <div role="tablist" className="grid grid-cols-2 gap-0.5 p-0.5 mb-3 rounded-full bg-foreground/[0.06] text-[11px] font-bold">
                  {(["global", "device"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="tab"
                      aria-selected={scope === s}
                      onClick={() => setScope(s)}
                      className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-full transition-colors ${scope === s ? "bg-primary text-white dark:text-black" : "text-foreground/60 hover:text-foreground"}`}
                    >
                      {s === "global" ? <><Globe2 size={12} /> {t("Global", "Global")}</> : <><Smartphone size={12} /> {t("This device", "Perangkat ini")}</>}
                    </button>
                  ))}
                </div>
            )}
            {(() => {
              const rows = showGlobal
                ? (Array.isArray(global) ? global : []).map((r) => ({ key: r.playerId, name: r.name, total: r.total, missions: r.missions, mine: r.playerId === agent?.id }))
                : board.map((r) => ({ key: r.name, name: r.name, total: r.total, missions: r.missions, mine: r.name === state.current }));
              if (!mounted || (showGlobal && global === null)) return <div className="h-24 rounded-xl bg-foreground/[0.03] animate-pulse" />;
              if (!rows.length) return <p className="text-xs text-foreground/50">{t("No scores yet. Complete a case to claim the top spot.", "Belum ada skor. Selesaikan satu kasus untuk merebut posisi teratas.")}</p>;
              return (
                <ol className="space-y-1.5 max-h-[22rem] overflow-y-auto pr-1">
                  {rows.map((row, i) => (
                    <li key={row.key} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${row.mine ? "bg-primary/10 ring-1 ring-primary/30" : i < 3 ? "bg-amber-500/[0.06]" : "bg-foreground/[0.03]"}`}>
                      <span className="w-5 text-center font-mono font-bold text-foreground/50">
                        {i === 0 ? <Crown size={15} className="text-amber-500 inline" /> : i < 3 ? <Medal size={15} className={`inline ${i === 1 ? "text-slate-400" : "text-orange-400"}`} /> : i + 1}
                      </span>
                      <span className="flex-1 truncate font-bold">{row.name}{row.mine && <span className="ml-1.5 text-[10px] font-bold text-primary">{t("YOU", "KAMU")}</span>}</span>
                      <span className="text-[10px] text-foreground/40">{row.missions}/{SCORED_MISSION_IDS.length}</span>
                      <span className="font-mono font-black">{row.total}</span>
                    </li>
                  ))}
                </ol>
              );
            })()}
            <p className="text-[10px] text-foreground/40 mt-3">
              {showGlobal
                ? t("Live scores from every player, all six missions (web + VR). Updates every 20 seconds.", "Skor langsung dari semua pemain, keenam misi (web + VR). Diperbarui setiap 20 detik.")
                : t("Scores are stored on this device.", "Skor disimpan di perangkat ini.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
