import Link from "next/link";
import DeepfakeAnatomy from "@/components/DeepfakeAnatomy";
import CurriculumList from "@/components/CurriculumList";
import Reveal from "@/components/Reveal";
import SectionNav from "@/components/learning/SectionNav";
import ModuleLibrary from "@/components/learning/ModuleLibrary";
import { MODULE_COUNT } from "@/data/learningModules";
import VideoGallery from "@/components/learning/VideoGallery";
import { deepfakeStats } from "@/data/stats";
import { T } from "@/lib/i18n";
import {
  Sparkles, ArrowRight, ArrowDown, BookOpen, ScanFace, Library, PlayCircle, ScanText, Gamepad2, ScanSearch,
  type LucideIcon,
} from "lucide-react";

const stats = [deepfakeStats.detectedDeepfakes, deepfakeStats.nonConsensual, deepfakeStats.fraudForecast, deepfakeStats.voiceScams];

const PATH: { href: string; Icon: LucideIcon; title: [string, string]; body: [string, string] }[] = [
  { href: "#chapters", Icon: BookOpen, title: ["Understand", "Pahami"], body: ["4 short chapters", "4 bab singkat"] },
  { href: "#anatomy", Icon: ScanFace, title: ["Inspect", "Periksa"], body: ["See what a face-swap sees", "Lihat cara face-swap melihat"] },
  { href: "#library", Icon: Library, title: ["Go deeper", "Perdalam"], body: [`${MODULE_COUNT} official documents`, `${MODULE_COUNT} dokumen resmi`] },
  { href: "#videos", Icon: PlayCircle, title: ["Watch", "Tonton"], body: ["Explainers by our team", "Video dari tim kami"] },
];

// Tells from the chapters, scrolled as a ticker between the hero and the content.
const TELLS: [string, string][] = [
  ["Malformed hands", "Tangan janggal"],
  ["Lip-sync drift", "Gerak bibir tak sinkron"],
  ["Garbled background text", "Tulisan latar acak"],
  ["No breathing in the voice", "Suara tanpa napas"],
  ["Flicker at the hairline", "Kedipan di garis rambut"],
  ["Shadows that disagree", "Bayangan tak konsisten"],
  ["Urgent money requests", "Minta uang mendesak"],
  ["Odd blinking", "Kedipan mata aneh"],
];

function SectionHeader({ index, eyebrow, title, body, aside }: {
  index: string; eyebrow: [string, string]; title: [string, string]; body?: [string, string]; aside?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
      <div className="max-w-2xl">
        <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-primary mb-3">
          <span className="font-mono text-foreground/40">{index}</span>
          <span className="w-8 h-px bg-primary" />
          <T en={eyebrow[0]} id={eyebrow[1]} />
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-[family-name:var(--font-orbitron)] mb-3">
          <T en={title[0]} id={title[1]} />
        </h2>
        {body && <p className="text-sm md:text-base text-foreground/55 leading-relaxed"><T en={body[0]} id={body[1]} /></p>}
      </div>
      {aside}
    </div>
  );
}

export default function LearningPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">

      {/* ━━━ HERO ━━━ */}
      <section className="relative pt-12 md:pt-20 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[min(100vw,900px)] h-[420px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center max-w-6xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary tracking-widest uppercase mb-6 backdrop-blur-md">
            <Sparkles size={14} /> <T en="Learning Hub" id="Pusat Belajar" />
          </div>

          <h1 className="text-[2.6rem] leading-[1] sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 font-[family-name:var(--font-orbitron)] tracking-tight">
            <span className="block"><T en="Synthetics" id="Kuasai" /></span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-secondary pb-2"><T en="Mastery" id="Media Sintetis" /></span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-foreground/60 max-w-2xl font-light mb-10 md:mb-12">
            <T en="Arm yourself with the knowledge to navigate, analyze, and survive the era of generative media." id="Bekali dirimu dengan pengetahuan untuk memahami, menganalisis, dan bertahan di era media generatif." />
          </p>

          {/* Learning path */}
          <ol className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full mb-10 md:mb-14">
            {PATH.map(({ href, Icon, title, body }, i) => (
              <li key={href}>
                <a href={href} className="card-fx group h-full flex flex-col items-start text-left gap-3 p-4 sm:p-5 rounded-2xl border border-foreground/10 bg-background/60 backdrop-blur-md">
                  <span className="w-full flex items-center justify-between">
                    <span className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center"><Icon size={20} /></span>
                    <span className="font-mono text-xs text-foreground/30">0{i + 1}</span>
                  </span>
                  <span>
                    <span className="block font-bold text-sm sm:text-base"><T en={title[0]} id={title[1]} /></span>
                    <span className="block text-xs text-foreground/50"><T en={body[0]} id={body[1]} /></span>
                  </span>
                  <ArrowDown size={14} className="text-foreground/30 group-hover:text-primary group-hover:translate-y-0.5 transition-all mt-auto" />
                </a>
              </li>
            ))}
          </ol>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 w-full rounded-3xl border border-foreground/10 overflow-hidden bg-background/40 backdrop-blur-md">
            {stats.map((stat, i) => (
              <a
                key={stat.label}
                href={stat.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-start text-left p-5 sm:p-6 hover:bg-primary/[0.04] transition-colors border-foreground/10 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b lg:border-b-0" : ""} ${i === 1 ? "lg:border-r" : ""}`}
              >
                <span className="text-3xl sm:text-4xl font-black font-[family-name:var(--font-orbitron)] text-primary mb-2">{stat.value}</span>
                <span className="text-xs sm:text-sm text-foreground/60 leading-snug mb-2 flex-1"><T en={stat.label} /></span>
                <span className="text-[10px] text-foreground/40 group-hover:text-primary group-hover:underline">{stat.source} ↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ TICKER ━━━ */}
      <div className="relative border-y border-foreground/[0.07] bg-foreground/[0.02] py-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]" aria-hidden>
        <div className="marquee-track flex w-max gap-8">
          {[...TELLS, ...TELLS].map(([en, id], i) => (
            <span key={i} className="flex items-center gap-8 text-sm sm:text-base font-bold uppercase tracking-widest text-foreground/50 whitespace-nowrap font-[family-name:var(--font-orbitron)]">
              <T en={en} id={id} />
              <span className="w-2 h-2 rotate-45 bg-primary/60" />
            </span>
          ))}
        </div>
      </div>

      {/* Direct child of the page so it stays stuck for the whole scroll. */}
      <div className="h-6" />
      <SectionNav />

      {/* ━━━ CHAPTERS & ANATOMY ━━━ */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-14 items-start">
            <div id="chapters" className="scroll-mt-32">
              <Reveal>
                <SectionHeader
                  index="01"
                  eyebrow={["Core chapters", "Bab inti"]}
                  title={["The Essentials", "Dasar-Dasarnya"]}
                  body={["Four short chapters, from how fakes are made to what to do if you are targeted.", "Empat bab singkat, dari cara deepfake dibuat sampai apa yang harus dilakukan jika kamu jadi korban."]}
                />
              </Reveal>
              <Reveal delay={100}>
                <CurriculumList />
              </Reveal>
            </div>

            <div id="anatomy" className="scroll-mt-32 lg:sticky lg:top-32">
              <Reveal delay={150}>
                <div className="card-fx flex flex-col bg-foreground/[0.02] border border-foreground/[0.08] rounded-3xl p-4 sm:p-6 md:p-8">
                  <div className="mb-5">
                    <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-primary mb-2">
                      <span className="font-mono text-foreground/40">02</span>
                      <span className="w-8 h-px bg-primary" />
                      <T en="Interactive" id="Interaktif" />
                    </p>
                    <h3 className="text-xl sm:text-2xl font-black font-[family-name:var(--font-orbitron)] mb-2"><T en="Anatomy of a Fake" id="Anatomi Sebuah Palsu" /></h3>
                    <p className="text-sm text-foreground/50"><T en="Drag the slider (or use the arrow keys) to see the face the way a face-swap model does." id="Geser slider (atau pakai tombol panah) untuk melihat wajah seperti cara model face-swap melihatnya." /></p>
                  </div>
                  <DeepfakeAnatomy />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ LIBRARY ━━━ */}
      <section id="library" className="scroll-mt-32 py-14 md:py-20 bg-foreground/[0.015] border-y border-foreground/[0.05]">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <Reveal>
            <SectionHeader
              index="03"
              eyebrow={["Official document repository", "Kumpulan dokumen resmi"]}
              title={["Curated Modules & Research", "Modul & Riset Pilihan"]}
              body={["Global policy guides, AI literacy curricula, and ethical frameworks published by leading institutions.", "Panduan kebijakan global, kurikulum literasi AI, dan kerangka etika dari lembaga-lembaga terkemuka."]}
              aside={
                <span className="inline-flex items-center gap-2 self-start md:self-auto px-3 py-1.5 rounded-full border border-foreground/10 text-xs font-mono text-foreground/50">
                  <BookOpen size={13} className="text-primary" /> {MODULE_COUNT} <T en="PDF documents" id="dokumen PDF" />
                </span>
              }
            />
          </Reveal>
          <Reveal delay={100}>
            <ModuleLibrary />
          </Reveal>
        </div>
      </section>

      {/* ━━━ VIDEOS ━━━ */}
      <section id="videos" className="scroll-mt-32 py-14 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <Reveal>
            <SectionHeader
              index="04"
              eyebrow={["Field recordings", "Video penjelasan"]}
              title={["Watch & Learn", "Tonton & Pelajari"]}
              body={["Short explainers on AI basics, made by the AIVENTURE team.", "Video singkat tentang dasar-dasar AI, dibuat oleh tim AIVENTURE."]}
            />
          </Reveal>
          <Reveal delay={100}>
            <VideoGallery />
          </Reveal>
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <section className="pb-20 md:pb-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <Reveal>
            <div className="card-fx relative overflow-hidden rounded-[2rem] border border-foreground/10 p-8 sm:p-12 md:p-16 text-center">
              <div className="absolute inset-0 pointer-events-none bg-radial from-primary/15 via-transparent to-transparent" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-4"><T en="From theory to practice" id="Dari teori ke praktik" /></p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 font-[family-name:var(--font-orbitron)] tracking-tight">
                  <T en="Ready to apply your knowledge?" id="Siap mempraktikkan ilmumu?" />
                </h2>
                <p className="text-foreground/55 mb-8 md:mb-10 max-w-xl mx-auto">
                  <T en="Scan photos, videos, audio — or check whether a text was written by AI. Then put your eye to the test on a real case." id="Pindai foto, video, audio — atau cek apakah sebuah teks ditulis oleh AI. Lalu uji ketelitianmu di kasus nyata." />
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
                  <Link href="/detector" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-foreground text-background font-bold text-sm hover:scale-105 transition-transform">
                    <ScanSearch size={16} /> <T en="Media Scanner" id="Pemindai Media" /> <ArrowRight size={16} />
                  </Link>
                  <Link href="/detector#text" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-foreground/20 bg-background/50 font-bold text-sm hover:border-primary/60 hover:text-primary transition-colors">
                    <ScanText size={16} /> <T en="AI Text Detector" id="Detektor Teks AI" />
                  </Link>
                  <Link href="/game" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-foreground/20 bg-background/50 font-bold text-sm hover:border-secondary/60 hover:text-secondary transition-colors">
                    <Gamepad2 size={16} /> <T en="Play a Mission" id="Main Misi" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
