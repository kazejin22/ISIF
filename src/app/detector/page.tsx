"use client";

import { useState, useRef, useEffect } from "react";
import { ScanLine, CheckCircle, AlertTriangle, RefreshCw, Crosshair, Fingerprint, Activity, Shield, ShieldAlert, ShieldCheck, Zap, Database, UploadCloud } from "lucide-react";

interface DetectionResult {
  isReal: boolean;
  authenticityScore: number;
  confidence: number;
  riskLevel: "Low" | "Medium" | "High";
  analysis: string;
  anomalies: string[];
  conclusion: "REAL" | "DEEPFAKE" | "AI-GENERATED";
}

const TypewriterText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + (text[i] || ""));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);
  return <span className="font-mono">{displayed}</span>;
};

// Half-circle Gauge Component
const GaugeMeter = ({ value, label, color, isDanger }: { value: number, label: string, color: string, isDanger: boolean }) => {
  const radius = 60;
  const circumference = Math.PI * radius; // Half circle
  const dashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg className="w-32 h-20 overflow-hidden" viewBox="0 0 140 70">
        <path
          d={`M 10,70 A 60,60 0 0,1 130,70`}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className="text-foreground/10"
        />
        <path
          d={`M 10,70 A 60,60 0 0,1 130,70`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          className="transition-all duration-1500 ease-out"
        />
      </svg>
      <div className="absolute top-8 flex flex-col items-center">
        <span className={`text-2xl font-black font-[family-name:var(--font-orbitron)] ${isDanger ? 'text-red-500 animate-pulse' : ''}`}>
          {Math.round(value)}<span className="text-sm opacity-50">%</span>
        </span>
      </div>
      <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mt-2">{label}</span>
    </div>
  );
};

export default function DetectorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanText, setScanText] = useState("Awaiting media input...");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Glitch effect state
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    if (!isScanning) return;
    const phrases = [
      "> Initializing FORENSIC-NET OMEGA engine...",
      "> Analyzing pixel distribution & quantization...",
      "> Running frequency domain analysis (DCT)...",
      "> Checking generative noise fingerprints...",
      "> Scanning facial micro-anatomy & topology...",
      "> Evaluating lighting physics & catchlights...",
      "> Cross-referencing GAN/Diffusion artifact database...",
      "> Calculating authenticity tensor probability...",
      "> Compiling final forensic verdict..."
    ];
    let i = 0;
    setScanText(phrases[0]);
    const interval = setInterval(() => {
      i++;
      if (i < phrases.length) {
        setScanText(phrases[i]);
      }
    }, 1800);
    return () => clearInterval(interval);
  }, [isScanning]);

  // Trigger glitch when deepfake detected
  useEffect(() => {
    if (result && !result.isReal) {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 800);
    }
  }, [result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setScanText("> System ready. Target acquired.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setPreview(URL.createObjectURL(dropped));
      setResult(null);
      setScanText("> System ready. Target acquired.");
    }
  };

  const startScan = async () => {
    if (!file) return;
    setIsScanning(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to analyze");
      }

      setResult({
        isReal: data.isReal,
        authenticityScore: data.authenticityScore,
        confidence: data.confidence,
        riskLevel: data.riskLevel,
        analysis: data.analysis,
        anomalies: data.anomalies,
        conclusion: data.conclusion,
      });
    } catch (error: any) {
      console.error("Error scanning file", error);
      const errMsg = error.message || "Network Error";
      setResult({
        isReal: false,
        authenticityScore: 5,
        confidence: 0,
        riskLevel: "High",
        analysis: `API Error: ${errMsg}`,
        anomalies: ["Could not establish neural link to main server."],
        conclusion: "AI-GENERATED",
      });
    } finally {
      setIsScanning(false);
      setScanText("> Analysis complete. Rendering results.");
    }
  };

  const colors = {
    REAL: { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500/30", glow: "shadow-emerald-500/40", hex: "#10b981" },
    DEEPFAKE: { bg: "bg-orange-500", text: "text-orange-500", border: "border-orange-500/30", glow: "shadow-orange-500/40", hex: "#f97316" },
    "AI-GENERATED": { bg: "bg-red-500", text: "text-red-500", border: "border-red-500/30", glow: "shadow-red-500/40", hex: "#ef4444" },
  };

  const currentTheme = result ? colors[result.conclusion] : { bg: "bg-primary", text: "text-primary", border: "border-primary/30", glow: "shadow-primary/40", hex: "var(--primary)" };

  return (
    <div className={`min-h-screen bg-background text-foreground overflow-x-hidden ${glitch ? 'animate-glitch bg-red-900/10' : ''}`}>
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10 flex flex-col min-h-screen">
        
        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/[0.03] border border-foreground/[0.08] backdrop-blur-md mb-6">
            <Activity size={14} className="text-primary animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/70">AIVENTURE FORENSICS</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 font-[family-name:var(--font-orbitron)] tracking-tight">
            Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-secondary">Scanner</span>
          </h1>
        </div>

        {/* Main Interface Layout */}
        <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${result ? 'max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-8 items-start' : 'max-w-3xl w-full mx-auto flex flex-col items-center'}`}>
          
          {/* LEFT: Upload & Preview Area */}
          <div className={`w-full flex flex-col gap-6 ${result ? 'order-1' : ''}`}>
            <div className="w-full bg-background/40 backdrop-blur-2xl border border-foreground/[0.08] rounded-[2rem] p-3 relative overflow-hidden shadow-2xl">
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-[2rem] m-3 pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/40 rounded-tr-[2rem] m-3 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/40 rounded-bl-[2rem] m-3 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-[2rem] m-3 pointer-events-none" />

              {!preview ? (
                // HOLOGRAPHIC UPLOAD ZONE
                <div 
                  className="aspect-square md:aspect-[4/3] rounded-3xl border border-dashed border-foreground/20 flex flex-col items-center justify-center text-center hover:bg-primary/[0.02] hover:border-primary/50 transition-all duration-500 cursor-pointer group relative overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="w-24 h-24 mb-6 rounded-full bg-foreground/[0.03] border border-foreground/[0.08] flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/0 group-hover:border-primary/50 group-hover:animate-[spin_4s_linear_infinite]" border-style="dashed" />
                    <UploadCloud size={40} className="text-foreground/40 group-hover:text-primary transition-colors duration-500 relative z-10" />
                    <div className="absolute w-full h-1 bg-primary/80 blur-[2px] top-0 opacity-0 group-hover:opacity-100 group-hover:animate-[radar_2s_ease-in-out_infinite] z-20" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 font-[family-name:var(--font-orbitron)] text-foreground/80 group-hover:text-foreground transition-colors">Target Acquisiton</h3>
                  <p className="text-foreground/40 text-sm max-w-[250px]">Drop image, video, or audio file here to commence forensic scan</p>
                  
                  <input 
                    type="file" ref={fileInputRef} className="hidden" 
                    accept="image/*,video/*,audio/*" onChange={handleFileChange}
                  />
                </div>
              ) : (
                // PREVIEW ZONE
                <div className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-black/80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Target" className={`w-full h-full object-contain transition-all duration-1000 ${isScanning ? 'scale-110 opacity-60 blur-sm brightness-75 sepia-[0.2] hue-rotate-180' : 'scale-100 opacity-100'}`} />
                  
                  {isScanning && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_20px_5px_rgba(0,243,255,0.6)] animate-[radar_3s_ease-in-out_infinite]" />
                      <div className="absolute top-1/4 left-1/4 w-12 h-12 border border-primary/50 animate-ping opacity-50" />
                      <div className="absolute bottom-1/3 right-1/4 w-8 h-8 rounded-full border border-secondary/50 animate-ping opacity-50 delay-700" />
                      
                      {/* Matrix rain text */}
                      <div className="absolute top-4 right-4 text-[8px] font-mono text-primary/70 text-right leading-tight opacity-50">
                        HASH: 0x8F92A1<br/>
                        FREQ: 44.1kHz<br/>
                        QNTZ: DCT_MAT<br/>
                        NODE: OMEGA_09
                      </div>
                    </div>
                  )}

                  {/* Terminal Logger */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-xl border border-foreground/10 p-3 flex items-center justify-between z-20">
                    <div className={`text-xs md:text-sm font-mono truncate mr-4 ${isScanning ? 'text-primary' : 'text-foreground/60'}`}>
                      {isScanning ? <TypewriterText text={scanText} /> : scanText}
                    </div>
                    {isScanning ? (
                      <ScanLine size={16} className="text-primary animate-spin shrink-0" />
                    ) : (
                      <Database size={16} className="text-foreground/40 shrink-0" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className={`flex gap-4 w-full transition-all duration-500 delay-300 ${!preview ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <button 
                onClick={() => { setPreview(null); setFile(null); setResult(null); setScanText("Awaiting media input..."); }}
                className="px-6 py-4 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.08] hover:bg-foreground/[0.08] font-bold transition-all text-sm backdrop-blur-sm"
                disabled={isScanning}
              >
                Reset
              </button>
              
              {!result ? (
                <button 
                  onClick={startScan}
                  disabled={isScanning}
                  className="flex-1 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] disabled:opacity-70 flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                  {isScanning ? (
                    <><RefreshCw size={20} className="animate-spin relative z-10" /><span className="relative z-10">Processing Data...</span></>
                  ) : (
                    <><ScanLine size={20} className="relative z-10" /><span className="relative z-10 font-[family-name:var(--font-orbitron)] tracking-wider">INITIATE SCAN</span></>
                  )}
                </button>
              ) : (
                <button 
                  onClick={startScan}
                  disabled={isScanning}
                  className="flex-1 rounded-2xl bg-foreground/5 border border-foreground/10 font-bold hover:bg-foreground/10 transition-all flex items-center justify-center gap-3 text-foreground/80"
                >
                  <RefreshCw size={20} /> Rescan Media
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Forensic Dashboard (Only visible when result exists) */}
          {result && (
            <div className="w-full flex flex-col gap-6 order-2 animate-in slide-in-from-right-8 fade-in duration-700 h-full">
              
              {/* Verdict Banner */}
              <div className={`w-full bg-background/40 backdrop-blur-2xl border p-6 rounded-[2rem] shadow-2xl relative overflow-hidden flex items-center gap-6 ${currentTheme.border}`}>
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 blur-[50px] rounded-full pointer-events-none ${currentTheme.bg}`} />
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${currentTheme.bg} ${currentTheme.glow} text-white`}>
                  {result.conclusion === "REAL" ? <ShieldCheck size={32} /> : result.conclusion === "DEEPFAKE" ? <ShieldAlert size={32} /> : <AlertTriangle size={32} />}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1 flex items-center gap-2">
                    System Verdict {result.riskLevel === "High" && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  </div>
                  <h3 className={`text-2xl lg:text-3xl font-black font-[family-name:var(--font-orbitron)] tracking-tight ${currentTheme.text}`}>
                    {result.conclusion === "REAL" ? "AUTHENTIC MEDIA" : result.conclusion === "DEEPFAKE" ? "DEEPFAKE DETECTED" : "AI-GENERATED"}
                  </h3>
                </div>
              </div>

              {/* Data Cards Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/40 backdrop-blur-2xl border border-foreground/[0.08] rounded-3xl p-5 flex flex-col items-center justify-center">
                  <GaugeMeter value={result.authenticityScore} label="Authenticity Score" color={result.isReal ? "#10b981" : "#ef4444"} isDanger={!result.isReal} />
                </div>
                <div className="bg-background/40 backdrop-blur-2xl border border-foreground/[0.08] rounded-3xl p-5 flex flex-col items-center justify-center">
                  <GaugeMeter value={result.confidence} label="Detection Certainty" color="var(--primary)" isDanger={false} />
                </div>
              </div>

              {/* Analysis Text */}
              <div className="bg-background/40 backdrop-blur-2xl border border-foreground/[0.08] rounded-3xl p-6 flex flex-col flex-1">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 flex items-center gap-2 mb-4">
                  <Crosshair size={12} className="text-primary" /> Forensic Analysis Report
                </div>
                <div className="text-sm text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap flex-1 overflow-y-auto max-h-[150px] pr-2 scrollbar-thin scrollbar-thumb-foreground/10 scrollbar-track-transparent">
                  {result.analysis}
                </div>
              </div>

              {/* Anomalies Highlight */}
              {result.anomalies && result.anomalies.length > 0 && !result.isReal && (
                <div className="bg-red-500/5 backdrop-blur-2xl border border-red-500/20 rounded-3xl p-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/70 flex items-center gap-2 mb-4">
                    <Zap size={12} /> Detected Anomalies ({result.anomalies.length})
                  </div>
                  <div className="flex flex-col gap-3">
                    {result.anomalies.slice(0, 3).map((anomaly, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5 animate-pulse" />
                        <p className="text-xs text-foreground/80 leading-relaxed">{anomaly}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes radar {
          0% { top: 0%; opacity: 1; }
          90% { top: 100%; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-5px, 5px) }
          40% { transform: translate(-5px, -5px) }
          60% { transform: translate(5px, 5px) }
          80% { transform: translate(5px, -5px) }
          100% { transform: translate(0) }
        }
        .animate-glitch {
          animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
        }
      `}} />
    </div>
  );
}
