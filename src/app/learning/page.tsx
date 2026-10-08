"use client";

import Link from "next/link";
import DeepfakeAnatomy from "@/components/DeepfakeAnatomy";
import { 
  Sparkles, ArrowRight, TrendingUp, AlertTriangle, 
  DollarSign, Users, ChevronRight, PlayCircle
} from "lucide-react";

const stats = [
  { value: "500%", label: "Deepfake increase since 2023", icon: TrendingUp },
  { value: "96%", label: "Non-consensual content", icon: AlertTriangle },
  { value: "$25B", label: "Estimated fraud by 2027", icon: DollarSign },
  { value: "1 in 4", label: "Exposed unknowingly", icon: Users },
];

const curriculum = [
  {
    id: "01",
    title: "The Architecture of Deception",
    desc: "Understanding Generative Adversarial Networks (GANs) and how AI synthesizes hyper-realistic media from noise."
  },
  {
    id: "02",
    title: "Forensic Indicators",
    desc: "Identifying micro-anomalies: unnatural blinking, erratic catchlights, and digital quantization artifacts."
  },
  {
    id: "03",
    title: "Defense & Verification",
    desc: "Mastering digital hygiene, cryptographic watermarking, and reverse image search techniques."
  },
  {
    id: "04",
    title: "Legal & Ethical Framework",
    desc: "Navigating international AI regulations, consent laws, and the future of digital identity."
  }
];

export default function LearningPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">

      {/* ━━━ HERO & STATS ━━━ */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/[0.03] border border-foreground/[0.05] text-xs font-medium text-foreground/60 tracking-widest uppercase mb-6">
            <Sparkles size={14} className="text-primary" /> Learning Hub
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 font-[family-name:var(--font-orbitron)] tracking-tight">
            Synthetics <span className="text-foreground/30">Mastery</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/60 max-w-2xl font-light mb-16">
            Arm yourself with the knowledge to navigate, analyze, and survive the era of generative media.
          </p>

          {/* Minimalist Stats */}
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 max-w-4xl border-y border-foreground/[0.05] py-8 w-full">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <span className="text-3xl font-black font-[family-name:var(--font-orbitron)] text-primary mb-1">
                  {stat.value}
                </span>
                <span className="text-xs text-foreground/50 tracking-wide uppercase">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ SPLIT LAYOUT: CURRICULUM & ANATOMY ━━━ */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
            
            {/* Left: Curriculum List */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] mb-8 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-primary"></span> Core Modules
              </h2>
              
              <div className="flex flex-col">
                {curriculum.map((item, i) => (
                  <div key={i} className="group flex gap-6 py-6 border-b border-foreground/[0.05] hover:border-primary/30 transition-colors cursor-pointer">
                    <span className="text-sm font-mono text-primary/50 group-hover:text-primary transition-colors pt-1">
                      {item.id}
                    </span>
                    <div className="flex flex-col flex-1">
                      <h3 className="text-lg font-bold mb-2 text-foreground/80 group-hover:text-foreground transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-foreground/50 leading-relaxed font-light">
                        {item.desc}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all">
                      <ChevronRight size={18} className="text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Interactive Anatomy (Sticky on Desktop) */}
            <div className="lg:sticky lg:top-24 flex flex-col bg-foreground/[0.02] border border-foreground/[0.05] rounded-3xl p-6 md:p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold font-[family-name:var(--font-orbitron)] mb-2">Anatomy of a Fake</h3>
                <p className="text-sm text-foreground/50">Interact with the slider to reveal generative anomalies mapping over organic structures.</p>
              </div>
              <div className="w-full shadow-2xl rounded-2xl overflow-hidden border border-foreground/[0.08]">
                <DeepfakeAnatomy />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ━━━ VIDEO RESOURCES ━━━ */}
      <section className="py-16 md:py-24 bg-foreground/[0.02] border-t border-foreground/[0.05]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] mb-2">Field Recordings</h2>
              <p className="text-sm text-foreground/50">Essential visual studies on synthetic generation.</p>
            </div>
            <PlayCircle className="text-foreground/20 w-12 h-12 hidden md:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                url: "https://www.youtube.com/embed/ch-CU5VG1fs",
                title: "The Danger of Deepfakes",
              },
              {
                url: "https://www.youtube.com/embed/02rVRwovRow",
                title: "How AI Clones Voices & Faces",
              },
              {
                url: "https://www.youtube.com/embed/s8IGWdkxM9E",
                title: "Spotting AI Generated Media",
              },
            ].map((vid, i) => (
              <div key={i} className="flex flex-col group cursor-pointer">
                <div className="aspect-video w-full rounded-2xl bg-black border border-foreground/[0.08] overflow-hidden relative mb-4 group-hover:border-primary/50 transition-colors">
                  <iframe
                    width="100%" height="100%"
                    src={vid.url} title={vid.title} frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen className="absolute inset-0"
                  />
                </div>
                <h3 className="text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors line-clamp-1">{vid.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <section className="py-24 relative border-t border-foreground/[0.05]">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl font-black mb-6 font-[family-name:var(--font-orbitron)]">
            Ready to apply your knowledge?
          </h2>
          <p className="text-foreground/50 mb-10">
            Switch from theory to practice. Use the forensic scanner to evaluate real media samples.
          </p>
          <Link
            href="/detector"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-bold text-sm hover:scale-105 transition-transform"
          >
            Launch Scanner <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
