"use client";

import { useState, useMemo, useRef } from "react";
import CrimeGlobe from "@/components/CrimeGlobe";
import StrokeText from "@/components/StrokeText";
import { crimeData, CrimeData } from "@/data/crimeData";
import { Search, AlertTriangle, Globe, Filter, BarChart3, ExternalLink, Radio } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useT } from "@/lib/i18n";

// Cases in this dataset per year — computed, not invented.
const casesByYear = Object.entries(
  crimeData.reduce<Record<number, number>>((acc, c) => ({ ...acc, [c.year]: (acc[c.year] ?? 0) + 1 }), {}),
)
  .sort(([a], [b]) => Number(a) - Number(b))
  .map(([year, cases]) => ({ year, cases }));

const continents = ["All", ...Array.from(new Set(crimeData.map((c) => c.continent))).sort()];

const panel = "bg-white/60 dark:bg-black/40 lg:bg-white/30 lg:dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-2xl";

export default function MapPage() {
  const [selectedCrime, setSelectedCrime] = useState<CrimeData>(crimeData[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("All");
  const detailsRef = useRef<HTMLDivElement>(null);
  const t = useT();

  const filteredCrimes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return crimeData
      .filter((crime) => {
        const matchesSearch = !q || [crime.country, crime.type, crime.title].some((f) => f.toLowerCase().includes(q) || t(f).toLowerCase().includes(q));
        const matchesContinent = selectedContinent === "All" || crime.continent === selectedContinent;
        return matchesSearch && matchesContinent;
      })
      .sort((a, b) => b.year - a.year);
  }, [searchQuery, selectedContinent, t]);

  const select = (crime: CrimeData) => {
    setSelectedCrime(crime);
    // On small screens the details panel sits above the list — bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative w-full lg:h-[calc(100vh-4rem)] lg:overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-background to-background dark:from-[#0d1630] dark:via-[#020205] dark:to-[#000000]">

      {/* Background title (desktop only) */}
      <div className="hidden lg:flex absolute inset-0 z-0 items-start pt-[5vh] justify-center pointer-events-none overflow-hidden select-none">
        <div className="w-[80vw] max-w-[1200px] opacity-20 flex flex-col items-center">
          <StrokeText text="DEEPFAKE" strokeColor="url(#liquid-glass-stroke)" fillColor="url(#liquid-glass)" strokeWidth={1.5} drawDuration={2} fillDelay={0.5} stagger={0.1} ease="power2.out" trigger="mount" fillMode="wipe" fontSize={160} fontWeight={900} fontFamily="var(--font-orbitron)" letterSpacing={4} />
          <StrokeText text="CASE" strokeColor="url(#liquid-glass-stroke)" fillColor="url(#liquid-glass)" strokeWidth={1.5} drawDuration={2} fillDelay={0.8} stagger={0.1} ease="power2.out" trigger="mount" fillMode="wipe" fontSize={160} fontWeight={900} fontFamily="var(--font-orbitron)" letterSpacing={4} className="-mt-20" />
        </div>
      </div>

      {/* Mobile heading */}
      <div className="lg:hidden relative z-20 px-4 pt-8 text-center">
        <h1 className="text-3xl font-black font-[family-name:var(--font-orbitron)] tracking-tight">{t("Deepfake Case Map", "Peta Kasus Deepfake")}</h1>
        <p className="text-sm text-foreground/60 mt-2">{crimeData.length} {t("documented incidents. Tap a pin or pick a case below.", "kasus terdokumentasi. Ketuk pin atau pilih kasus di bawah.")}</p>
      </div>

      {/* Globe — square in flow on mobile, oversized and cropped on desktop */}
      <div className="relative z-10 w-full aspect-square max-w-[640px] mx-auto lg:max-w-none lg:aspect-auto lg:absolute lg:inset-0 lg:overflow-hidden lg:pointer-events-none">
        <div className="w-full h-full lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-[-10vh] lg:w-[120vw] lg:h-[120vw] lg:min-w-[1000px] lg:min-h-[1000px] lg:pointer-events-auto">
          <CrimeGlobe onMarkerClick={select} selectedCrime={selectedCrime} />
        </div>
      </div>

      {/* Panels: stacked on mobile, floating on desktop */}
      <div className="relative z-20 flex flex-col gap-4 px-4 pb-10 lg:contents">

        {/* Details */}
        <div ref={detailsRef} className="scroll-mt-20 lg:z-20 lg:absolute lg:top-12 lg:left-8 lg:w-[320px] lg:max-h-[52vh] lg:flex lg:flex-col">
          <div className={`${panel} p-5 lg:p-6 relative overflow-hidden flex flex-col lg:max-h-full`}>
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3 mb-4 shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-white/5 flex items-center justify-center border border-white/40 dark:border-white/10 shrink-0">
                <Globe className="text-primary" size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-black text-slate-800 dark:text-white truncate">{t(selectedCrime.country)}</h2>
                <div className="text-xs font-bold text-slate-600 dark:text-foreground/50">{t(selectedCrime.continent)} · {selectedCrime.year}</div>
              </div>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto pr-1 space-y-4 mb-4">
              <div>
                <h3 className="font-bold text-sm text-primary mb-2 leading-snug">{t(selectedCrime.title)}</h3>
                <p className="text-slate-700 dark:text-foreground/80 leading-relaxed text-xs">{t(selectedCrime.description)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10">
                  <div className="text-[10px] text-slate-500 dark:text-foreground/50 font-bold mb-1 uppercase tracking-wider">{t("Category", "Kategori")}</div>
                  <div className="font-bold text-xs flex items-center gap-1.5 text-slate-800 dark:text-white">
                    <AlertTriangle size={12} className="text-red-500 shrink-0" />
                    <span>{t(selectedCrime.type)}</span>
                  </div>
                </div>
                <div className="p-3 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10">
                  <div className="text-[10px] text-slate-500 dark:text-foreground/50 font-bold mb-1 uppercase tracking-wider">{t("Medium", "Media")}</div>
                  <div className="font-bold text-xs flex items-center gap-1.5 text-slate-800 dark:text-white">
                    <Radio size={12} className="text-primary shrink-0" />
                    <span>{t(selectedCrime.medium)}</span>
                  </div>
                </div>
              </div>
            </div>

            <a
              href={selectedCrime.newsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 shrink-0 w-full py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              {t("Read report", "Baca laporan")} · {selectedCrime.source} <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* List & filters */}
        <div className="lg:z-20 lg:absolute lg:top-12 lg:right-8 lg:w-[340px] lg:h-[75vh] flex flex-col">
          <div className={`${panel} h-[60vh] lg:h-full flex flex-col overflow-hidden`}>
            <div className="p-4 border-b border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/5 shrink-0">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                <Filter size={18} className="text-primary" /> {t("Global Cases", "Kasus Global")}
                <span className="ml-auto text-xs font-mono font-normal text-slate-500 dark:text-foreground/50">{filteredCrimes.length}/{crimeData.length}</span>
              </h3>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-foreground/40" size={16} />
                  <input
                    type="search"
                    placeholder={t("Search country, title, category...", "Cari negara, judul, kategori...")}
                    aria-label={t("Search cases", "Cari kasus")}
                    className="w-full pl-9 pr-4 py-2 text-base sm:text-sm rounded-xl bg-white/50 dark:bg-black/40 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-primary transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {continents.map((cont) => (
                    <button
                      key={cont}
                      onClick={() => setSelectedContinent(cont)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all ${
                        selectedContinent === cont
                          ? "bg-primary text-white dark:text-black"
                          : "bg-white/50 dark:bg-white/5 text-slate-600 dark:text-foreground/60 border border-white/40 dark:border-transparent hover:bg-white dark:hover:bg-white/10"
                      }`}
                    >
                      {t(cont)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredCrimes.length === 0 ? (
                <div className="text-center p-8 text-slate-500 dark:text-foreground/40 text-sm">{t("No cases found.", "Tidak ada kasus.")}</div>
              ) : (
                filteredCrimes.map((crime) => (
                  <button
                    key={crime.id}
                    onClick={() => select(crime)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      selectedCrime.id === crime.id
                        ? "bg-white/80 dark:bg-white/10 border-primary shadow-[0_4px_20px_rgba(0,243,255,0.2)]"
                        : "bg-white/40 dark:bg-black/20 border-white/40 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-slate-800 dark:text-white">{t(crime.country)}</div>
                      <div className={`font-medium text-xs truncate ${selectedCrime.id === crime.id ? "text-primary" : "text-slate-600 dark:text-foreground/60"}`}>
                        {t(crime.title)}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-foreground/40 mt-1">{t(crime.type)}</div>
                    </div>
                    <div className="text-[10px] font-bold px-2 py-1 rounded bg-slate-200/50 dark:bg-white/10 text-slate-600 dark:text-foreground/50 whitespace-nowrap">
                      {crime.year}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cases per year */}
        <div className={`${panel} p-4 lg:z-20 lg:absolute lg:left-8 lg:bottom-6 lg:w-[320px]`}>
          <div className="flex items-center gap-2 mb-2 px-1">
            <BarChart3 size={14} className="text-primary" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-foreground/70">{t("Cases in this map by year", "Kasus di peta ini per tahun")}</h3>
          </div>
          <div className="w-full h-[120px] text-slate-500 dark:text-foreground/50">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={casesByYear} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "currentColor" }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "currentColor" }} />
                <Tooltip
                  cursor={{ fill: "rgba(0,243,255,0.08)" }}
                  contentStyle={{ backgroundColor: "rgba(0,0,0,0.75)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  itemStyle={{ color: "#00f3ff", fontWeight: "bold" }}
                />
                <Bar dataKey="cases" fill="#00f3ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-foreground/40 px-1 mt-1">{t("A curated sample of reported incidents, not a global total.", "Contoh pilihan dari kasus yang dilaporkan, bukan total global.")}</p>
        </div>
      </div>
    </div>
  );
}
