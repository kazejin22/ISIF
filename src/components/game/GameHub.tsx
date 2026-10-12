"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Award, BadgeCheck, Crown, FolderLock, Gamepad2, Globe2, Headset, Layers, LogOut, MapPin, Medal, MousePointerClick,
  RotateCcw, ScanSearch, ShieldAlert, Smartphone, Sparkles, Swords, Target, Timer, Trophy, UserRound,
} from "lucide-react";
import { MAX_MISSION_SCORE, RANKS, SCORED_MISSION_IDS, missionsFor, rankFor } from "@/game/missions";
import type { Mission } from "@/game/types";
import { useLang, useT, type Translate } from "@/lib/i18n";
import { leaderboard, signIn, signOut, syncCurrentAgent, totalScore, useGameState, type AgentProfile } from "@/game/progress";
import type { GlobalRow, LeaderboardResponse } from "@/app/api/leaderboard/route";
import { useMounted } from "@/lib/useMounted";
import Reveal from "@/components/Reveal";
import CaseArt, { CASE_ACCENTS } from "./CaseArt";
import { panel } from "./ui";

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

/** Animates a number from its previous value to `target`. */
function useCountUp(target: number, ms = 1200) {
  const [value, setValue] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const begin = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      const eased = 1 - (1 - k) ** 3;
      setValue(Math.round(begin + (target - begin) * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

const VR_MODES: {
  id: string; href: string; Icon: typeof Swords; accent: string;
  title: [string, string]; text: [string, string]; controls: [string, string][];
}[] = [
  {
    id: "vr-forensic-lab", href: "/game/vr/lab", Icon: ScanSearch, accent: "#22d3ee",
    title: ["Forensic Lab", "Lab Forensik"],
    text: ["Grab evidence with your controllers and sweep the AI Scanner over it to reveal hidden clues.", "Ambil barang bukti dengan controller dan sapukan Pemindai AI di atasnya untuk mengungkap petunjuk tersembunyi."],
    controls: [["Trigger: grab", "Trigger: ambil"], ["Thumbstick: zoom", "Thumbstick: zoom"], ["Drop in a tray", "Jatuhkan ke baki"]],
  },
  {
    id: "vr-firewall", href: "/game/vr/firewall", Icon: Swords, accent: "#e879f9",
    title: ["Misinformation Firewall", "Firewall Misinformasi"],
    text: ["Posts fly at you. Slash the fakes with laser sabers and let credible news pass.", "Unggahan melayang ke arahmu. Tebas yang palsu dengan pedang laser dan biarkan berita tepercaya lewat."],
    controls: [["Swing to slash", "Ayun untuk tebas"], ["Let credible pass", "Biarkan yang valid lewat"], ["3 waves", "3 gelombang"]],
  },
];

function isTimed(m: Mission) {
  return m.stages.some((s) => s.kind === "real-or-fake" || s.kind === "dialogue");
}

// ─── Agent status (hero, right) ─────────────────────────────────────

function AgentCard({ agent, mounted, t }: { agent: AgentProfile | undefined; mounted: boolean; t: Translate }) {
  const [name, setName] = useState("");
  const total = totalScore(agent);
  const shown = useCountUp(total);
  const { current: rank, next } = rankFor(total);
  const progressToNext = next ? ((total - rank.min) / (next.min - rank.min)) * 100 : 100;
  const solved = SCORED_MISSION_IDS.filter((id) => agent?.best[id] !== undefined).length;
  const rankIndex = RANKS.indexOf(rank);

  return (
    <div className="border-beam relative rounded-[1.75rem]">
      <div className={`${panel} rounded-[1.75rem] p-5 sm:p-6`}>
        {!mounted ? (
          <div className="h-56 rounded-2xl bg-foreground/[0.03] animate-pulse" />
        ) : agent ? (
          <>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white dark:text-black flex items-center justify-center font-black text-lg shrink-0">
                  {agent.name.slice(0, 1).toUpperCase()}
                  <BadgeCheck size={16} className="absolute -bottom-1 -right-1 text-emerald-400 bg-background rounded-full" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/40">{t("Agent", "Agen")}</div>
                  <div className="font-black truncate text-lg leading-tight">{agent.name}</div>
                </div>
              </div>
              <button type="button" onClick={signOut} className="p-2 rounded-xl hover:bg-foreground/10 text-foreground/50" aria-label={t("Switch agent", "Ganti agen")} title={t("Switch agent", "Ganti agen")}><LogOut size={16} /></button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Award size={16} className="text-amber-400" />
              <span className="text-sm font-bold text-primary">{t(rank.title, rank.titleId)}</span>
              <span className="ml-auto flex gap-1" aria-label={t(`Rank ${rankIndex + 1} of ${RANKS.length}`, `Pangkat ${rankIndex + 1} dari ${RANKS.length}`)}>
                {RANKS.map((r, i) => <span key={r.title} className={`w-4 h-1.5 rounded-full ${i <= rankIndex ? "bg-amber-400" : "bg-foreground/10"}`} />)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-2xl bg-foreground/[0.04] border border-foreground/[0.06] p-3">
                <div className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">{t("Total score", "Skor total")}</div>
                <div className="font-mono font-black text-2xl tabular-nums">{shown}<span className="text-xs text-foreground/40"> / {MAX_TOTAL}</span></div>
              </div>
              <div className="rounded-2xl bg-foreground/[0.04] border border-foreground/[0.06] p-3">
                <div className="text-[10px] uppercase tracking-widest text-foreground/40 mb-1">{t("Cases solved", "Kasus selesai")}</div>
                <div className="font-mono font-black text-2xl">{solved}<span className="text-xs text-foreground/40"> / {SCORED_MISSION_IDS.length}</span></div>
              </div>
            </div>

            <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-1000" style={{ width: `${progressToNext}%` }} />
            </div>
            <div className="text-[11px] text-foreground/50 mt-2">
              {next ? t(`${next.min - total} pts to ${next.title}`, `${next.min - total} poin lagi menuju ${next.titleId}`) : t("Highest rank reached!", "Pangkat tertinggi tercapai!")}
            </div>
          </>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); signIn(name); setName(""); }}>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-4"><UserRound size={24} /></div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary mb-1">{t("Clearance required", "Butuh izin akses")}</div>
            <div className="font-black text-xl mb-1">{t("Register as an agent", "Daftar sebagai agen")}</div>
            <p className="text-sm text-foreground/55 mb-4">{t("Your scores are saved on this device and appear on the leaderboard.", "Skormu disimpan di perangkat ini dan muncul di papan peringkat.")}</p>
            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder={t("Agent name", "Nama agen")} aria-label={t("Agent name", "Nama agen")} className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-background border border-foreground/15 focus:border-primary focus:outline-none text-base sm:text-sm" />
              <button type="submit" disabled={!name.trim()} className="px-5 rounded-xl bg-primary text-white dark:text-black font-bold text-sm disabled:opacity-40 hover:brightness-110 transition">{t("Join", "Gabung")}</button>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-[11px] text-foreground/40">
              {RANKS.map((r, i) => (
                <span key={r.title} className="flex items-center gap-1.5">
                  {i > 0 && <span className="w-3 h-px bg-foreground/20" />}
                  <span className={i === 0 ? "text-primary font-bold" : ""}>{i + 1}</span>
                </span>
              ))}
              <span className="ml-1">{t(`${RANKS.length} ranks to earn`, `${RANKS.length} pangkat untuk diraih`)}</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Case file card ─────────────────────────────────────────────────

function CaseCard({ m, best, t }: { m: Mission; best: number | undefined; t: Translate }) {
  const accent = CASE_ACCENTS[m.id] ?? "#38bdf8";
  const solved = best !== undefined;
  return (
    <Link
      href={`/game/${m.id}`}
      style={{ "--fx-tint": accent, "--tint": accent } as React.CSSProperties}
      className={`${panel} group h-full flex flex-col overflow-hidden`}
    >
      <div className="relative h-44 sm:h-48 border-b border-foreground/10">
        <CaseArt missionId={m.id} />
        <span className="absolute z-20 top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/70 backdrop-blur text-[10px] font-mono font-bold text-white/90 border border-white/10">
          <FolderLock size={12} /> {t("CASE FILE", "BERKAS KASUS")} {String(m.number).padStart(2, "0")}
        </span>
        {solved && (
          <span className="stamp-in absolute z-20 bottom-3 right-4 px-3 py-1 rounded-md border-2 border-emerald-400 text-emerald-400 font-black text-sm tracking-[0.2em] bg-black/40 backdrop-blur-sm">
            {t("SOLVED", "SELESAI")}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="tint-text text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{m.codename}</div>
        <h3 className="text-xl font-black mb-1.5 leading-tight">{m.title}</h3>
        <p className="text-sm text-foreground/60 leading-relaxed mb-4">{m.tagline}</p>

        <div className="flex flex-wrap gap-1.5 mb-4 text-[11px] text-foreground/60">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-foreground/[0.05]"><MapPin size={11} /> {m.location} · {m.year}</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-foreground/[0.05]"><Layers size={11} /> {m.stages.length} {m.stages.length === 1 ? t("stage", "tahap") : t("stages", "tahap")}</span>
          {isTimed(m) && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500"><Timer size={11} /> {t("Timed", "Berwaktu")}</span>}
        </div>

        <div className="mt-auto flex items-center gap-1.5 text-xs text-foreground/50 mb-4">
          <Target size={13} className="tint-text shrink-0" /> <span className="truncate">{m.skill}</span>
        </div>

        <div className="pt-4 border-t border-foreground/10">
          {solved ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(best / MAX_MISSION_SCORE) * 100}%` }} />
              </div>
              <span className="font-mono font-black text-sm text-emerald-500">{best}</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground/60 group-hover:text-foreground"><RotateCcw size={12} /> {t("Replay", "Main lagi")}</span>
            </div>
          ) : (
            <span className="tint-text flex items-center justify-between text-sm font-bold">
              {t("Open case file", "Buka berkas kasus")}
              <span className="w-8 h-8 rounded-full flex items-center justify-center border transition-all group-hover:translate-x-1" style={{ borderColor: `${accent}66` }}>
                <ArrowRight size={15} />
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Leaderboard with podium ────────────────────────────────────────

interface BoardRow { key: string; name: string; total: number; missions: number; mine: boolean }

const PODIUM = [
  { place: 1, order: "order-2", height: "h-28 sm:h-32", tone: "from-amber-400/40 to-amber-400/5 border-amber-400/40", Icon: Crown, icon: "text-amber-400" },
  { place: 2, order: "order-1", height: "h-20 sm:h-24", tone: "from-slate-300/30 to-slate-300/5 border-slate-300/30", Icon: Medal, icon: "text-slate-300" },
  { place: 3, order: "order-3", height: "h-16 sm:h-20", tone: "from-orange-400/30 to-orange-400/5 border-orange-400/30", Icon: Medal, icon: "text-orange-400" },
];

function Leaderboard({ rows, loading, t }: { rows: BoardRow[]; loading: boolean; t: Translate }) {
  if (loading) return <div className="h-64 rounded-2xl bg-foreground/[0.03] animate-pulse" />;
  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-10 items-end">
      <div>
        <div className="flex items-end justify-center gap-2 sm:gap-3">
          {PODIUM.map(({ place, order, height, tone, Icon, icon }) => {
            const row = rows[place - 1];
            return (
              <div key={place} className={`${order} flex-1 max-w-[150px] flex flex-col items-center`}>
                <Icon size={place === 1 ? 26 : 20} className={`${icon} mb-1.5 ${place === 1 ? "float-slow" : ""}`} />
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-lg mb-2 border ${row ? "bg-foreground/[0.06] border-foreground/15" : "border-dashed border-foreground/20 text-foreground/30"} ${row?.mine ? "ring-2 ring-primary" : ""}`}>
                  {row ? row.name.slice(0, 1).toUpperCase() : "?"}
                </div>
                <div className="text-xs font-bold truncate max-w-full mb-0.5">{row ? row.name : t("Open spot", "Kosong")}</div>
                <div className="text-[11px] font-mono text-foreground/50 mb-2">{row ? row.total : "—"}</div>
                <div className={`w-full ${height} rounded-t-2xl bg-gradient-to-b border border-b-0 ${tone} flex items-start justify-center pt-2`}>
                  <span className="font-black font-[family-name:var(--font-orbitron)] text-2xl text-foreground/70">{place}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="h-px bg-foreground/15" />
      </div>

      <div>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-foreground/15 p-6 text-center">
            <Trophy size={28} className="mx-auto mb-3 text-amber-400" />
            <p className="font-bold mb-1">{t("The board is empty", "Papan masih kosong")}</p>
            <p className="text-sm text-foreground/50">{t("Complete a case to claim the top spot.", "Selesaikan satu kasus untuk merebut posisi teratas.")}</p>
          </div>
        ) : (
          <ol className="space-y-1.5 max-h-[18rem] overflow-y-auto pr-1">
            {rows.map((row, i) => (
              <li key={row.key} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${row.mine ? "bg-primary/10 ring-1 ring-primary/30" : "bg-foreground/[0.03]"}`}>
                <span className="w-6 text-center font-mono font-bold text-foreground/40">{i + 1}</span>
                <span className="flex-1 truncate font-bold">{row.name}{row.mine && <span className="ml-1.5 text-[10px] font-bold text-primary">{t("YOU", "KAMU")}</span>}</span>
                <span className="text-[10px] text-foreground/40">{row.missions}/{SCORED_MISSION_IDS.length}</span>
                <span className="font-mono font-black tabular-nums">{row.total}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────

export default function GameHub() {
  const mounted = useMounted();
  const state = useGameState();
  const agent = state.current ? state.agents[state.current] : undefined;
  const board = leaderboard(state);
  const global = useGlobalBoard();
  const [scope, setScope] = useState<"global" | "device">("global");
  const showGlobal = scope === "global" && global !== "off";

  // Make sure this agent's saved scores are on the online board.
  const current = state.current;
  useEffect(() => { if (current) syncCurrentAgent(); }, [current]);
  const lang = useLang();
  const t = useT();
  const missions = missionsFor(lang);
  const nextCase = missions.find((m) => !(mounted && agent?.best[m.id] !== undefined)) ?? missions[0];

  const rows: BoardRow[] = showGlobal
    ? (Array.isArray(global) ? global : []).map((r) => ({ key: r.playerId, name: r.name, total: r.total, missions: r.missions, mine: r.playerId === agent?.id }))
    : board.map((r) => ({ key: r.name, name: r.name, total: r.total, missions: r.missions, mine: r.name === state.current }));

  return (
    <div className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-x-0 top-0 h-[720px] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,black,transparent)]" />
        <div className="absolute top-[-15%] left-[10%] w-[520px] h-[520px] rounded-full bg-red-500/10 blur-[130px]" />
        <div className="absolute top-[5%] right-[5%] w-[480px] h-[480px] rounded-full bg-primary/10 blur-[130px]" />
      </div>

      <div className="relative container mx-auto px-4 py-10 md:py-16 max-w-6xl">
        {/* Hero */}
        <section className="grid lg:grid-cols-[1.25fr_1fr] gap-8 lg:gap-12 items-center mb-16 md:mb-24">
          <Reveal>
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
                <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-red-500 animate-ping" /><span className="relative w-2 h-2 rounded-full bg-red-500" /></span>
                {t("Active investigations", "Penyelidikan aktif")}
              </div>
              <h1 className="text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl font-black font-[family-name:var(--font-orbitron)] tracking-tight mb-5">
                <span className="glitch block" data-text="Deepfake">Deepfake</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-secondary pb-1">Detective</span>
              </h1>
              <p className="text-foreground/60 md:text-lg max-w-xl mx-auto lg:mx-0 mb-8">
                {t(
                  "Four cases inspired by real deepfake crimes, plus two VR missions. Inspect the evidence, make the call under pressure, and earn your rank.",
                  "Empat kasus dari kejahatan deepfake nyata, ditambah dua misi VR. Periksa barang bukti, ambil keputusan di bawah tekanan, dan raih pangkatmu.",
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href={`/game/${nextCase.id}`} className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-white dark:text-black font-bold shadow-lg shadow-primary/25 hover:brightness-110 transition">
                  <Gamepad2 size={18} /> {t(`Start case ${String(nextCase.number).padStart(2, "0")}`, `Mulai kasus ${String(nextCase.number).padStart(2, "0")}`)}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#vr" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-foreground/15 bg-background/50 backdrop-blur font-bold hover:border-primary/50 hover:text-primary transition-colors">
                  <Headset size={18} /> {t("VR missions", "Misi VR")}
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <AgentCard agent={agent} mounted={mounted} t={t} />
          </Reveal>
        </section>

        {/* Leaderboard */}
        <section className="mb-16 md:mb-24">
          <Reveal>
            <div className={`${panel} p-5 sm:p-8`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-amber-500 mb-2"><Trophy size={14} /> {t("Hall of fame", "Hall of fame")}</p>
                  <h2 className="text-2xl md:text-3xl font-black font-[family-name:var(--font-orbitron)] tracking-tight">{t("Leaderboard", "Papan Peringkat")}</h2>
                </div>
                {global !== "off" && (
                  <div role="tablist" className="grid grid-cols-2 gap-0.5 p-1 rounded-full bg-foreground/[0.06] text-xs font-bold self-start sm:self-auto">
                    {(["global", "device"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        role="tab"
                        aria-selected={scope === s}
                        onClick={() => setScope(s)}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full transition-colors ${scope === s ? "bg-primary text-white dark:text-black" : "text-foreground/60 hover:text-foreground"}`}
                      >
                        {s === "global" ? <><Globe2 size={13} /> {t("Global", "Global")}</> : <><Smartphone size={13} /> {t("This device", "Perangkat ini")}</>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Leaderboard rows={rows} loading={!mounted || (showGlobal && global === null)} t={t} />
              <p className="text-[11px] text-foreground/40 mt-6">
                {showGlobal
                  ? t("Live scores from every player, all six missions (web + VR). Updates every 20 seconds.", "Skor langsung dari semua pemain, keenam misi (web + VR). Diperbarui setiap 20 detik.")
                  : t("Scores are stored on this device.", "Skor disimpan di perangkat ini.")}
              </p>
            </div>
          </Reveal>
        </section>

        {/* Case files */}
        <section className="mb-16 md:mb-24">
          <Reveal>
            <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary mb-2"><ShieldAlert size={14} /> {t("Case files", "Berkas kasus")}</p>
                <h2 className="text-3xl md:text-4xl font-black font-[family-name:var(--font-orbitron)] tracking-tight">{t("Pick your case", "Pilih kasusmu")}</h2>
              </div>
              <span className="hidden sm:inline text-xs font-mono text-foreground/40">{missions.length} {t("open cases", "kasus terbuka")}</span>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            {missions.map((m, i) => (
              <Reveal key={m.id} delay={i * 90} className="h-full">
                <CaseCard m={m} best={mounted ? agent?.best[m.id] : undefined} t={t} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* VR */}
        <section id="vr" className="scroll-mt-24">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 md:mb-8">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-secondary mb-2"><Headset size={14} /> {t("Immersive", "Imersif")} · Meta Quest</p>
                <h2 className="text-3xl md:text-4xl font-black font-[family-name:var(--font-orbitron)] tracking-tight">{t("VR Missions", "Misi VR")}</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-foreground/50"><MousePointerClick size={14} /> {t("No headset? Play with a mouse.", "Tidak punya headset? Main pakai mouse.")}</span>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-4 md:gap-5">
            {VR_MODES.map(({ id, href, title, text, Icon, accent, controls }, i) => {
              const best = mounted ? agent?.best[id] : undefined;
              return (
                <Reveal key={id} delay={i * 120} className="h-full">
                  <Link
                    href={href}
                    style={{ "--fx-tint": accent, "--tint": accent } as React.CSSProperties}
                    className="card-fx group relative h-full flex flex-col rounded-[1.75rem] overflow-hidden border border-foreground/10 p-6 sm:p-8 min-h-[300px]"
                  >
                    <div className="bg-pan absolute inset-0 opacity-60" style={{ backgroundImage: `linear-gradient(120deg, ${accent}33, transparent 40%, #6366f122 70%, ${accent}22)` }} />
                    <div className="absolute -right-10 -bottom-10 opacity-[0.08] group-hover:opacity-[0.14] group-hover:rotate-6 transition-all duration-700">
                      <Icon size={220} style={{ color: accent }} />
                    </div>
                    <div className="relative flex items-start justify-between gap-3 mb-6">
                      <div className="tint-text w-14 h-14 rounded-2xl flex items-center justify-center border float-slow" style={{ background: `${accent}22`, borderColor: `${accent}55` }}>
                        <Icon size={28} />
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/60 backdrop-blur border border-foreground/10 text-[10px] font-bold uppercase tracking-wider">
                        <Sparkles size={11} className="tint-text" /> VR
                      </span>
                    </div>
                    <h3 className="relative text-2xl sm:text-3xl font-black font-[family-name:var(--font-orbitron)] mb-2">{t(...title)}</h3>
                    <p className="relative text-sm text-foreground/65 leading-relaxed mb-5 max-w-md">{t(...text)}</p>
                    <div className="relative flex flex-wrap gap-1.5 mb-6">
                      {controls.map((c) => (
                        <span key={c[0]} className="px-2.5 py-1 rounded-lg bg-background/60 backdrop-blur border border-foreground/10 text-[11px] font-mono text-foreground/70">{t(...c)}</span>
                      ))}
                    </div>
                    <div className="relative mt-auto flex items-center justify-between gap-3">
                      {best !== undefined
                        ? <span className="inline-flex items-center gap-1.5 text-sm font-mono font-bold text-emerald-500"><Trophy size={14} /> {t("Best", "Terbaik")} {best}</span>
                        : <span className="text-xs text-foreground/50">{t("Not played yet", "Belum dimainkan")}</span>}
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-black transition-transform group-hover:scale-105" style={{ background: accent }}>
                        {t("Launch", "Mulai")} <ArrowRight size={15} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
