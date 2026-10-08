"use client";

import { useState, useMemo } from "react";
import CrimeGlobe from "@/components/CrimeGlobe";
import StrokeText from "@/components/StrokeText";
import { crimeData, CrimeData } from "@/data/crimeData";
import { Search, AlertTriangle, Globe, ChevronDown, Filter, TrendingUp, ExternalLink } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const trendData = [
  { year: "2019", cases: 15 },
  { year: "2020", cases: 42 },
  { year: "2021", cases: 120 },
  { year: "2022", cases: 350 },
  { year: "2023", cases: 890 },
  { year: "2024", cases: 2100 },
];

export default function MapPage() {
  const [selectedCrime, setSelectedCrime] = useState<CrimeData>(crimeData[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContinent, setSelectedContinent] = useState<string>("All");

  const continents = ["All", ...Array.from(new Set(crimeData.map(c => c.continent)))];

  const filteredCrimes = useMemo(() => {
    return crimeData.filter((crime) => {
      const matchesSearch = crime.country.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            crime.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesContinent = selectedContinent === "All" || crime.continent === selectedContinent;
      return matchesSearch && matchesContinent;
    });
  }, [searchQuery, selectedContinent]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-background to-background dark:from-[#0d1630] dark:via-[#020205] dark:to-[#000000]">
      
      {/* Background Title Layer (Behind Globe) */}
      <div className="absolute inset-0 z-0 flex items-start pt-[5vh] justify-center pointer-events-none overflow-hidden select-none">
        <div className="w-[80vw] max-w-[1200px] opacity-20 flex flex-col items-center">
          <StrokeText
            text="DEEPFAKE"
            strokeColor="url(#liquid-glass-stroke)"
            fillColor="url(#liquid-glass)"
            strokeWidth={1.5}
            drawDuration={2}
            fillDelay={0.5}
            stagger={0.1}
            ease="power2.out"
            trigger="mount"
            fillMode="wipe"
            fontSize={160}
            fontWeight={900}
            fontFamily="var(--font-orbitron)"
            letterSpacing={4}
          />
          <StrokeText
            text="CASE"
            strokeColor="url(#liquid-glass-stroke)"
            fillColor="url(#liquid-glass)"
            strokeWidth={1.5}
            drawDuration={2}
            fillDelay={0.8} // start slightly after the first one
            stagger={0.1}
            ease="power2.out"
            trigger="mount"
            fillMode="wipe"
            fontSize={160}
            fontWeight={900}
            fontFamily="var(--font-orbitron)"
            letterSpacing={4}
            className="-mt-20"
          />
        </div>
      </div>

      {/* Absolute Fullscreen Globe - Top is visible, bottom is cut off */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {/* Globe is huge, anchored near the top so the bottom overflows and cuts off */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[-15vh] md:top-[-10vh] w-[150vw] md:w-[120vw] h-[150vw] md:h-[120vw] min-w-[1000px] min-h-[1000px] pointer-events-auto">
          <CrimeGlobe onMarkerClick={setSelectedCrime} selectedCrime={selectedCrime} />
        </div>
      </div>

      {/* Floating Left Panel: Details & Charts */}
      <div className="absolute top-12 left-8 w-[320px] max-h-[85vh] z-20 pointer-events-none flex flex-col">
        <div className="bg-white/30 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-2xl pointer-events-auto relative overflow-hidden transition-all shrink-0">
          {/* Accent Glow */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-5 shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-white/50 dark:bg-white/5 flex items-center justify-center border border-white/40 dark:border-white/10 shadow-sm shrink-0">
                <Globe className="text-primary" size={20} />
              </div>
              <div className="overflow-hidden">
                <h2 className="text-xl font-black text-slate-800 dark:text-white drop-shadow-sm truncate">{selectedCrime.country}</h2>
                <div className="text-xs font-bold text-slate-600 dark:text-foreground/50">{selectedCrime.continent}</div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10 mb-4 space-y-4">
              <div>
                <div className="text-[10px] text-slate-500 dark:text-foreground/50 font-bold mb-1 uppercase tracking-wider">Case Title</div>
                <h3 className="font-bold text-sm text-primary mb-2 leading-snug">{selectedCrime.title}</h3>
                
                <div className="text-[10px] text-slate-500 dark:text-foreground/50 font-bold mb-1 uppercase tracking-wider">Description</div>
                <p className="text-slate-700 dark:text-foreground/80 leading-relaxed text-xs">
                  {selectedCrime.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm">
                  <div className="text-[10px] text-slate-500 dark:text-foreground/50 font-bold mb-1 uppercase tracking-wider">Classification</div>
                  <div className="font-bold text-xs flex items-center gap-1.5 text-slate-800 dark:text-white truncate">
                    <AlertTriangle size={12} className="text-red-500 shrink-0" />
                    <span className="truncate">{selectedCrime.type}</span>
                  </div>
                </div>

                <div className="p-3 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm">
                  <div className="text-[10px] text-slate-500 dark:text-foreground/50 font-bold mb-1 uppercase tracking-wider">Year</div>
                  <div className="font-bold text-sm text-slate-800 dark:text-white">{selectedCrime.year}</div>
                </div>
              </div>
            </div>

            <a 
              href={selectedCrime.newsLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-auto shrink-0 w-full py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              Read Full Story <ExternalLink size={14} />
            </a>
          </div>
        </div>
        
        {/* Futuristic Chart Panel */}
        <div className="mt-4 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-3xl p-4 shadow-lg pointer-events-auto flex-1 flex flex-col min-h-[160px]">
          <div className="flex items-center gap-2 mb-2 px-1">
            <TrendingUp size={14} className="text-primary" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-foreground/70">Global Trend</h3>
          </div>
          <div className="flex-1 w-full -ml-4">
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor' }} className="text-slate-500 dark:text-foreground/50" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor' }} className="text-slate-500 dark:text-foreground/50" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '12px' }} 
                  itemStyle={{ color: '#00f3ff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="cases" stroke="#00f3ff" strokeWidth={2} fillOpacity={1} fill="url(#colorCases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Floating Right Panel: List & Filters */}
      <div className="absolute top-12 right-8 w-[340px] max-h-[75vh] z-20 pointer-events-none flex flex-col">
        <div className="h-full bg-white/30 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-2xl pointer-events-auto flex flex-col overflow-hidden">
          
          {/* Header & Filters */}
          <div className="p-4 border-b border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/5 shrink-0">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-slate-800 dark:text-white drop-shadow-sm">
              <Filter size={18} className="text-primary" /> Global Cases
            </h3>
            
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-foreground/40" size={16} />
                <input 
                  type="text" 
                  placeholder="Search cases..." 
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white/50 dark:bg-black/40 border border-white/40 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:border-primary transition-colors shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {continents.map(cont => (
                  <button 
                    key={cont}
                    onClick={() => setSelectedContinent(cont)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all shadow-sm ${
                      selectedContinent === cont 
                        ? "bg-primary text-white shadow-primary/30" 
                        : "bg-white/50 dark:bg-white/5 text-slate-600 dark:text-foreground/60 border border-white/40 dark:border-transparent hover:bg-white hover:dark:bg-white/10"
                    }`}
                  >
                    {cont}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10">
            {filteredCrimes.length === 0 ? (
              <div className="text-center p-8 text-slate-500 dark:text-foreground/40 text-sm">No cases found.</div>
            ) : (
              filteredCrimes.map((crime) => (
                <button
                  key={crime.id}
                  onClick={() => setSelectedCrime(crime)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between group shadow-sm ${
                    selectedCrime.id === crime.id 
                      ? "bg-white/80 dark:bg-white/10 border-primary shadow-[0_4px_20px_rgba(0,243,255,0.2)]" 
                      : "bg-white/40 dark:bg-black/20 border-white/40 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-sm text-slate-800 dark:text-white">{crime.country}</span>
                    </div>
                    <div className={`font-medium text-xs truncate ${selectedCrime.id === crime.id ? "text-primary" : "text-slate-600 dark:text-foreground/60"}`}>
                      {crime.title}
                    </div>
                  </div>
                  <div className="text-[10px] font-bold px-2 py-1 rounded bg-slate-200/50 dark:bg-white/10 text-slate-600 dark:text-foreground/50 whitespace-nowrap border border-white/20 dark:border-transparent">
                    {crime.year}
                  </div>
                </button>
              ))
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
