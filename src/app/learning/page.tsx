import Link from "next/link";
import DeepfakeAnatomy from "@/components/DeepfakeAnatomy";
import CurriculumList from "@/components/CurriculumList";
import { deepfakeStats } from "@/data/stats";
import { T } from "@/lib/i18n";
import {
  Sparkles, ArrowRight, PlayCircle,
  FileText, Download, ExternalLink, BookOpen, Play, ScanText
} from "lucide-react";

const videos = [
  { id: "s8IGWdkxM9E", title: "What is AI?", titleId: "Apa itu AI?" },
  { id: "02rVRwovRow", title: "The Types of AI", titleId: "Jenis-Jenis AI" },
  { id: "ch-CU5VG1fs", title: "AI vs Human Works", titleId: "Karya AI vs Karya Manusia" },
];

const learningModules = [
  {
    id: "MOD-01",
    title: "AI Competency Framework for Students",
    organization: "UNESCO / Global Standard",
    description: "Pedagogical guidelines and core competencies needed by students to navigate artificial intelligence critically and safely.",
    descriptionId: "Pedoman pedagogis dan kompetensi inti yang dibutuhkan pelajar untuk menghadapi kecerdasan buatan secara kritis dan aman.",
    filename: "/modules/ai-competency-framework.pdf",
    tag: "Competency",
    size: "563 KB"
  },
  {
    id: "MOD-02",
    title: "AI and Education: Guidance for Policymakers",
    organization: "Policy & Strategy",
    description: "Strategic advice for educational leaders on mitigating deepfakes, ethical risks, and algorithmic manipulation in school environments.",
    descriptionId: "Saran strategis bagi pemimpin pendidikan untuk menekan deepfake, risiko etis, dan manipulasi algoritma di lingkungan sekolah.",
    filename: "/modules/ai-education-policymakers.pdf",
    tag: "Policy",
    size: "1.1 MB"
  },
  {
    id: "MOD-03",
    title: "AI Literacy Starter Pack",
    organization: "Practical Curriculum",
    description: "Hands-on fundamentals to deconstruct how deep generative models work, fact-checking workflows, and verification hygiene.",
    descriptionId: "Dasar-dasar praktis untuk memahami cara kerja model generatif, alur cek fakta, dan kebiasaan verifikasi yang baik.",
    filename: "/modules/ai-literacy-starter-pack.pdf",
    tag: "Starter Pack",
    size: "1.7 MB"
  },
  {
    id: "MOD-04",
    title: "A Mapping of Government-Endorsed AI",
    organization: "Global Governance",
    description: "A comprehensive comparative study on how international governments formulate laws against deceptive synthetics.",
    descriptionId: "Studi perbandingan menyeluruh tentang cara pemerintah di berbagai negara menyusun hukum melawan konten sintetis yang menipu.",
    filename: "/modules/mapping-government-endorsed-ai.pdf",
    tag: "Governance",
    size: "3.6 MB"
  },
  {
    id: "MOD-05",
    title: "Recommendation on the Ethics of AI",
    organization: "UNESCO Ethics Council",
    description: "The global normative instrument addressing human rights, digital integrity, and accountability in generative systems.",
    descriptionId: "Instrumen normatif global tentang hak asasi manusia, integritas digital, dan akuntabilitas dalam sistem generatif.",
    filename: "/modules/ethics-artificial-intelligence.pdf",
    tag: "Ethics",
    size: "374 KB"
  },
  {
    id: "MOD-06",
    title: "Guidance for Generative AI in Education & Research",
    organization: "Academic Research",
    description: "Standards for responsible deployment of AI, intellectual honesty, and combating synthetic misinformation in academia.",
    descriptionId: "Standar penggunaan AI yang bertanggung jawab, kejujuran akademik, dan cara melawan misinformasi sintetis di dunia akademik.",
    filename: "/modules/generative-ai-education-research.pdf",
    tag: "Research",
    size: "1.7 MB"
  }
];

const stats = [deepfakeStats.detectedDeepfakes, deepfakeStats.nonConsensual, deepfakeStats.fraudForecast, deepfakeStats.voiceScams];

export default function LearningPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">

      {/* ━━━ HERO & STATS ━━━ */}
      <section className="pt-12 md:pt-24 pb-12 md:pb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/[0.03] border border-foreground/[0.05] text-xs font-medium text-foreground/60 tracking-widest uppercase mb-6">
            <Sparkles size={14} className="text-primary" /> <T en="Learning Hub" id="Pusat Belajar" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 font-[family-name:var(--font-orbitron)] tracking-tight">
            <T en="Synthetics" id="Kuasai" /> <span className="text-foreground/30"><T en="Mastery" id="Media Sintetis" /></span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/60 max-w-2xl font-light mb-10 md:mb-16">
            <T en="Arm yourself with the knowledge to navigate, analyze, and survive the era of generative media." id="Bekali dirimu dengan pengetahuan untuk memahami, menganalisis, dan bertahan di era media generatif." />
          </p>

          {/* Minimalist Stats */}
          <div className="flex flex-wrap justify-center gap-x-8 sm:gap-x-12 gap-y-8 max-w-4xl border-y border-foreground/[0.05] py-8 w-full">
            {stats.map((stat) => (
              <a
                key={stat.label}
                href={stat.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center max-w-[180px]"
              >
                <span className="text-3xl font-black font-[family-name:var(--font-orbitron)] text-primary mb-1">
                  {stat.value}
                </span>
                <span className="text-xs text-foreground/60 leading-snug"><T en={stat.label} /></span>
                <span className="text-[10px] text-foreground/40 mt-1 group-hover:text-primary group-hover:underline">{stat.source} ↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ SPLIT LAYOUT: CURRICULUM & ANATOMY ━━━ */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-start">
            
            {/* Left: Curriculum List */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] mb-8 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-primary"></span> <T en="Core Modules" id="Modul Inti" />
              </h2>
              
              <CurriculumList />
            </div>

            {/* Right: Interactive Anatomy (Sticky on Desktop) */}
            <div className="lg:sticky lg:top-24 flex flex-col bg-foreground/[0.02] border border-foreground/[0.05] rounded-3xl p-4 sm:p-6 md:p-8">
              <div className="mb-5">
                <h3 className="text-xl font-bold font-[family-name:var(--font-orbitron)] mb-2"><T en="Anatomy of a Fake" id="Anatomi Sebuah Palsu" /></h3>
                <p className="text-sm text-foreground/50"><T en="Drag the slider (or use the arrow keys) to see the face the way a face-swap model does." id="Geser slider (atau pakai tombol panah) untuk melihat wajah seperti cara model face-swap melihatnya." /></p>
              </div>
              <DeepfakeAnatomy />
            </div>

          </div>
        </div>
      </section>

      {/* ━━━ OFFICIAL CURATED MODULES & POLICY FRAMEWORKS ━━━ */}
      <section className="py-16 md:py-24 bg-foreground/[0.015] border-t border-foreground/[0.05]">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3">
                <BookOpen size={13} /> <T en="Official Document Repository" id="Kumpulan Dokumen Resmi" />
              </div>
              <h2 className="text-3xl font-black font-[family-name:var(--font-orbitron)] mb-2">
                <T en="Curated Modules & Research" id="Modul & Riset Pilihan" />
              </h2>
              <p className="text-sm text-foreground/50 max-w-xl">
                <T en="Global policy guides, AI literacy curricula, and ethical frameworks published by leading institutions." id="Panduan kebijakan global, kurikulum literasi AI, dan kerangka etika dari lembaga-lembaga terkemuka." />
              </p>
            </div>
            <span className="text-xs font-mono text-foreground/40 mt-4 md:mt-0">
              {learningModules.length} <T en="DOCUMENTS READY FOR REVIEW" id="DOKUMEN SIAP DIBACA" />
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningModules.map((doc) => (
              <div 
                key={doc.id}
                className="group flex flex-col justify-between p-6 rounded-3xl bg-background/50 border border-foreground/[0.07] hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
                
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-lg bg-foreground/[0.04] text-foreground/60 border border-foreground/[0.05]">
                      {doc.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {doc.tag}
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground/90 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {doc.title}
                      </h3>
                      <p className="text-[11px] font-medium text-foreground/40 mt-0.5">
                        {doc.organization}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-foreground/60 leading-relaxed line-clamp-3 mb-6">
                    <T en={doc.description} id={doc.descriptionId} />
                  </p>
                </div>

                <div className="pt-4 border-t border-foreground/[0.05] flex items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-foreground/40">
                    PDF • {doc.size}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={doc.filename}
                      download
                      className="p-2 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/70 hover:text-foreground border border-foreground/[0.06] transition-colors"
                      title="Download PDF"
                    >
                      <Download size={15} />
                    </a>
                    <a
                      href={doc.filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm hover:shadow-primary/20"
                    >
                      <span><T en="Read PDF" id="Baca PDF" /></span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ VIDEO RESOURCES WITH HD THUMBNAIL ━━━ */}
      <section className="py-16 md:py-24 border-t border-foreground/[0.05]">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] mb-2"><T en="Field Recordings" id="Video Penjelasan" /></h2>
              <p className="text-sm text-foreground/50"><T en="Short explainers on AI basics, made by the AIVENTURE team." id="Video singkat tentang dasar-dasar AI, dibuat oleh tim AIVENTURE." /></p>
            </div>
            <PlayCircle className="text-foreground/20 w-12 h-12 hidden md:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((vid) => (
              <div key={vid.id} className="flex flex-col group">
                <div className="aspect-video w-full rounded-2xl bg-black border border-foreground/[0.08] overflow-hidden relative mb-4 group-hover:border-primary/50 transition-all shadow-md group-hover:shadow-primary/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Play Button Overlay */}
                  <a
                    href={`https://www.youtube.com/watch?v=${vid.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center group/btn"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg shadow-primary/40 group-hover/btn:scale-110 group-hover/btn:bg-primary transition-all">
                      <Play size={22} className="ml-1 fill-white" />
                    </div>
                  </a>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/80 font-mono">
                    <span className="truncate">AIVENTURE</span>
                    <span className="px-2 py-0.5 rounded bg-black/60 border border-white/20 text-[10px]">YouTube</span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors line-clamp-1">
                  <T en={vid.title} id={vid.titleId} />
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <section className="py-24 relative border-t border-foreground/[0.05]">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-2xl">
          <h2 className="text-3xl font-black mb-6 font-[family-name:var(--font-orbitron)]">
            <T en="Ready to apply your knowledge?" id="Siap mempraktikkan ilmumu?" />
          </h2>
          <p className="text-foreground/50 mb-10">
            <T en="Switch from theory to practice. Scan photos, videos, audio — or check whether a text was written by AI." id="Dari teori ke praktik. Pindai foto, video, audio — atau cek apakah sebuah teks ditulis oleh AI." />
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/detector" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-bold text-sm hover:scale-105 transition-transform">
              <T en="Media Scanner" id="Pemindai Media" /> <ArrowRight size={16} />
            </Link>
            <Link href="/detector#text" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-foreground/20 font-bold text-sm hover:bg-foreground/5 transition-colors">
              <ScanText size={16} /> <T en="AI Text Detector" id="Detektor Teks AI" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
