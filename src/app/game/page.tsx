"use client";

import { LockKeyhole, Trophy, ShieldAlert, Crosshair, Sparkles } from "lucide-react";

export default function GameDashboard() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[85vh]">
      
      <div className="w-full max-w-4xl relative">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-[3rem] blur-3xl pointer-events-none" />
        
        <div className="relative z-10 bg-background/60 backdrop-blur-xl border border-foreground/10 p-8 md:p-16 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center overflow-hidden">
          
          {/* Locked Overlay */}
          <div className="absolute inset-0 bg-background/40 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(0,243,255,0.3)]">
              <LockKeyhole size={48} className="text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Access Restricted</h2>
            <p className="text-lg text-foreground/80 max-w-lg mb-8 font-medium">
              The Deepfake Investigation Simulation is currently locked. We are fine-tuning the training module.
            </p>
            <div className="px-6 py-2 border border-foreground/20 rounded-full bg-background/80 text-sm font-bold tracking-widest uppercase text-foreground/50">
              Coming Soon
            </div>
          </div>

          {/* Background UI preview (Blurred) */}
          <div className="opacity-30 blur-sm pointer-events-none w-full">
            <div className="flex items-center justify-between mb-12 border-b border-foreground/10 pb-6">
              <div className="flex items-center gap-3 text-2xl font-bold">
                <ShieldAlert className="text-secondary" /> 
                <span>Simulation Dashboard</span>
              </div>
              <div className="px-4 py-2 bg-foreground/5 rounded-full flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" />
                <span className="font-bold">Global Rank: #---</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 bg-foreground/5 rounded-2xl border border-foreground/5">
                <Crosshair size={24} className="mb-4 text-primary" />
                <div className="text-sm text-foreground/60 mb-1">Accuracy</div>
                <div className="text-3xl font-black">--%</div>
              </div>
              <div className="p-6 bg-foreground/5 rounded-2xl border border-foreground/5">
                <Sparkles size={24} className="mb-4 text-secondary" />
                <div className="text-sm text-foreground/60 mb-1">Total Score</div>
                <div className="text-3xl font-black">0</div>
              </div>
              <div className="p-6 bg-foreground/5 rounded-2xl border border-foreground/5">
                <ShieldAlert size={24} className="mb-4 text-red-500" />
                <div className="text-sm text-foreground/60 mb-1">Threats Neutralized</div>
                <div className="text-3xl font-black">0</div>
              </div>
            </div>

            <div className="w-full aspect-[21/9] bg-foreground/5 rounded-2xl border border-foreground/10 flex items-center justify-center">
              <span className="text-4xl font-black tracking-widest text-foreground/20 uppercase">
                Launch Simulation
              </span>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
