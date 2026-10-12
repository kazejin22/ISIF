import HeroScene from "@/components/HeroScene";
import MapPreview from "@/components/MapPreview";
import Link from "next/link";
import {
  ArrowRight, ChevronDown, Gamepad2, Globe2, GraduationCap, Glasses, ScanSearch, ShieldAlert, ShieldCheck, BookOpen, Search, Users,
  type LucideIcon,
} from "lucide-react";
import { deepfakeStats } from "@/data/stats";
import { crimeData } from "@/data/crimeData";
import { T } from "@/lib/i18n";

const homeStats = [deepfakeStats.fraudAttempts, deepfakeStats.fraudForecast];

const FEATURES: { href: string; Icon: LucideIcon; tint: string; title: [string, string]; body: [string, string]; cta: [string, string] }[] = [
  {
    href: "/detector", Icon: ScanSearch, tint: "var(--primary)",
    title: ["Neural Scanner", "Pemindai Neural"],
    body: ["Upload a photo, video, audio clip or text. AI inspects it and shows the evidence behind its verdict.", "Unggah foto, video, audio, atau teks. AI memeriksanya dan menunjukkan bukti di balik kesimpulannya."],
    cta: ["Scan media", "Pindai media"],
  },
  {
    href: "/learning", Icon: GraduationCap, tint: "#3b82f6",
    title: ["Learning Hub", "Pusat Belajar"],
    body: ["How deepfakes are made, the tells to look for, how to verify, and your rights under the law.", "Cara deepfake dibuat, tanda yang perlu dicari, cara verifikasi, dan hakmu menurut hukum."],
    cta: ["Start learning", "Mulai belajar"],
  },
  {
    href: "/map", Icon: Globe2, tint: "#ef4444",
    title: ["Global Case Map", "Peta Kasus Global"],
    body: [`${crimeData.length} real incidents on an interactive globe, each linked to a verified news report.`, `${crimeData.length} kasus nyata di globe interaktif, masing-masing tertaut ke berita terverifikasi.`],
    cta: ["Explore the map", "Jelajahi peta"],
  },
  {
    href: "/game", Icon: Gamepad2, tint: "#a855f7",
    title: ["Detective Missions", "Misi Detektif"],
    body: ["Four cases inspired by real deepfake crimes, plus two VR games for Meta Quest.", "Empat kasus dari kejahatan deepfake nyata, ditambah dua game VR untuk Meta Quest."],
    cta: ["Play a mission", "Main misi"],
  },
];

const HERO_PILLS: { Icon: LucideIcon; label: [string, string] }[] = [
  { Icon: Globe2, label: [`${crimeData.length} real cases mapped`, `${crimeData.length} kasus nyata dipetakan`] },
  { Icon: ScanSearch, label: ["Image · Video · Audio · Text", "Gambar · Video · Audio · Teks"] },
  { Icon: Glasses, label: ["2 VR games", "2 game VR"] },
];

const VALUES: { Icon: LucideIcon; title: [string, string]; body: [string, string] }[] = [
  { Icon: BookOpen, title: ["Educate", "Edukasi"], body: ["Make deepfake literacy easy to understand for everyone.", "Membuat literasi deepfake mudah dipahami semua orang."] },
  { Icon: Search, title: ["Verify", "Verifikasi"], body: ["Give people practical tools to check what they see.", "Memberi alat praktis untuk mengecek apa yang dilihat."] },
  { Icon: ShieldCheck, title: ["Protect", "Lindungi"], body: ["Help people avoid scams and stop fakes from spreading.", "Membantu orang menghindari penipuan dan menghentikan penyebaran hoaks."] },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[92svh] flex flex-col items-center justify-center overflow-hidden pt-24 pb-16">
        <HeroScene />
        <div className="absolute inset-0 z-[5] pointer-events-none">
          <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[min(90vw,780px)] aspect-square rounded-full bg-primary/15 blur-[120px]" />
          <div className="absolute right-[8%] bottom-[12%] w-[min(50vw,380px)] aspect-square rounded-full bg-secondary/15 blur-[120px]" />
        </div>

        <div className="relative z-20 container mx-auto px-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 sm:mb-8 backdrop-blur-md">
            <ShieldAlert size={16} />
            <span className="text-xs sm:text-sm font-medium tracking-wide"><T en="Exposing the Illusion of AI" id="Membongkar Ilusi AI" /></span>
          </div>

          <h1 className="text-[2.6rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60"><T en="Can You Trust" id="Masih Percaya" /></span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-secondary"><T en="Your Own Eyes?" id="Mata Sendiri?" /></span>
          </h1>

          <p className="max-w-2xl text-base sm:text-lg md:text-xl text-foreground/70 mb-8 sm:mb-10 font-light">
            <T
              en="Deepfakes are reshaping reality, fueling scams, and threatening digital trust. Step into the matrix, uncover the anatomy of digital deception, and learn how to defend the truth."
              id="Deepfake mengubah realitas, memicu penipuan, dan merusak kepercayaan digital. Masuki dunianya, bongkar anatomi tipuan digital, dan pelajari cara membela kebenaran."
            />
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto max-w-sm sm:max-w-none">
            <Link
              href="/learning"
              className="px-8 py-4 rounded-xl bg-foreground text-background font-bold text-base sm:text-lg hover:bg-primary hover:text-white dark:hover:text-black transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] flex items-center justify-center gap-2 group"
            >
              <T en="Start Learning" id="Mulai Belajar" />
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/detector"
              className="px-8 py-4 rounded-xl bg-background/50 backdrop-blur-md border border-foreground/20 text-foreground font-bold text-base sm:text-lg hover:border-primary/60 hover:text-primary transition-all flex items-center justify-center gap-2"
            >
              <ScanSearch size={20} /> <T en="Try the Detector" id="Coba Detektor" />
            </Link>
          </div>

          <ul className="mt-10 sm:mt-12 flex flex-wrap justify-center gap-2 sm:gap-3">
            {HERO_PILLS.map(({ Icon, label }) => (
              <li key={label[0]} className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-foreground/10 bg-background/40 backdrop-blur-md text-xs sm:text-sm text-foreground/70">
                <Icon size={14} className="text-primary" /> <T en={label[0]} id={label[1]} />
              </li>
            ))}
          </ul>
        </div>

        <a href="#features" aria-label="Scroll down" className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-foreground/40 hover:text-primary animate-bounce">
          <ChevronDown size={28} />
        </a>
      </section>

      {/* Features */}
      <section id="features" className="relative z-20 py-16 md:py-24 scroll-mt-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-3"><T en="Your toolkit" id="Perlengkapanmu" /></p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4"><T en="Learn it. Practice it. Verify it." id="Pelajari. Latih. Verifikasi." /></h2>
            <p className="text-base md:text-lg text-foreground/60 font-light">
              <T en="Everything you need to recognize a deepfake, in one place." id="Semua yang kamu butuhkan untuk mengenali deepfake, dalam satu tempat." />
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {FEATURES.map(({ href, Icon, tint, title, body, cta }) => (
              <Link
                key={href}
                href={href}
                style={{ "--fx-tint": tint, "--tint": tint } as React.CSSProperties}
                className="card-fx group relative flex flex-col rounded-3xl border border-foreground/10 bg-background/60 backdrop-blur-xl p-6 overflow-hidden"
              >
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none" style={{ background: tint }} />
                <div className="tint-text relative w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border" style={{ background: `color-mix(in srgb, ${tint} 10%, transparent)`, borderColor: `color-mix(in srgb, ${tint} 25%, transparent)` }}>
                  <Icon size={24} />
                </div>
                <h3 className="relative text-lg font-bold mb-2"><T en={title[0]} id={title[1]} /></h3>
                <p className="relative text-sm text-foreground/60 leading-relaxed mb-6 flex-1"><T en={body[0]} id={body[1]} /></p>
                <span className="tint-text relative inline-flex items-center gap-1.5 text-sm font-bold">
                  <T en={cta[0]} id={cta[1]} /> <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats + map teaser */}
      <section className="py-16 md:py-24 relative z-20 border-t border-foreground/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-14 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-secondary mb-3"><T en="The threat is real" id="Ancamannya nyata" /></p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
                <T en="A Global Epidemic of" id="Wabah Global" /> <span className="text-primary"><T en="Digital Forgery" id="Pemalsuan Digital" /></span>
              </h2>
              <p className="text-base md:text-lg text-foreground/70 mb-8 font-light">
                <T
                  en="AI-generated voice scams, political deepfakes, and synthetic identity fraud are rising fast. The threat is not science fiction—it is happening right now, across the globe."
                  id="Penipuan suara AI, deepfake politik, dan pemalsuan identitas sintetis meningkat pesat. Ancaman ini bukan fiksi ilmiah—ini sedang terjadi sekarang, di seluruh dunia."
                />
              </p>

              <div className="grid grid-cols-2 gap-3 sm:gap-5 mb-8">
                {homeStats.map((stat, i) => (
                  <div key={stat.label} data-lift className="card-fx rounded-2xl border border-foreground/10 bg-background/60 p-4 sm:p-5 flex flex-col">
                    <div className={`text-3xl sm:text-4xl font-black mb-2 ${i === 0 ? "text-secondary" : "text-primary"}`}>{stat.value}</div>
                    <div className="text-xs sm:text-sm text-foreground/60 mb-2 flex-1"><T en={stat.label} /></div>
                    <a href={stat.href} target="_blank" rel="noopener noreferrer" className="text-[10px] sm:text-[11px] text-foreground/40 hover:text-primary hover:underline">
                      {stat.source} ↗
                    </a>
                  </div>
                ))}
              </div>

              <Link href="/map" className="inline-flex items-center gap-2 text-primary hover:text-secondary font-medium transition-colors">
                <T en="Explore the Interactive Crime Map" id="Jelajahi Peta Kasus Interaktif" /> <ArrowRight size={18} />
              </Link>
            </div>

            <MapPreview />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 md:py-24 bg-foreground/[0.03] relative z-20 border-y border-foreground/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
              <Users size={28} className="text-secondary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-5"><T en="About the Cyber Defenders" id="Tentang Cyber Defenders" /></h2>
            <p className="text-base md:text-lg text-foreground/70 font-light">
              <T
                en="We are a team of students passionate about technology and digital ethics. Created for the ISIF 2026 competition, our goal is to bridge the gap between advanced AI capabilities and public awareness, equipping the next generation with the tools to discern truth from fabrication."
                id="Kami adalah tim pelajar yang peduli pada teknologi dan etika digital. Dibuat untuk kompetisi ISIF 2026, tujuan kami adalah menjembatani kemampuan AI yang canggih dengan kesadaran publik, serta membekali generasi berikutnya untuk membedakan kebenaran dari rekayasa."
              />
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {VALUES.map(({ Icon, title, body }) => (
              <div key={title[0]} className="card-fx rounded-2xl border border-foreground/10 bg-background/60 p-5 text-center sm:text-left">
                <Icon size={22} className="text-primary mb-3 mx-auto sm:mx-0" />
                <h3 className="font-bold mb-1"><T en={title[0]} id={title[1]} /></h3>
                <p className="text-sm text-foreground/60"><T en={body[0]} id={body[1]} /></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-radial from-secondary/25 via-background to-background" />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(color-mix(in_srgb,var(--foreground)_4%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_4%,transparent)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4"><T en="Ready to Defend the Truth?" id="Siap Membela Kebenaran?" /></h2>
          <p className="text-base md:text-lg text-foreground/60 font-light max-w-xl mx-auto mb-8 md:mb-10">
            <T en="Start with a short lesson, then test yourself on a real case." id="Mulai dari pelajaran singkat, lalu uji dirimu di kasus nyata." />
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/learning"
              className="w-full sm:w-auto max-w-sm px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-foreground text-background font-black text-lg sm:text-xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(168,85,247,0.4)]"
            >
              <T en="Become a Cyber Defender" id="Jadilah Cyber Defender" />
            </Link>
            <Link
              href="/game"
              className="w-full sm:w-auto max-w-sm px-8 py-4 sm:py-5 rounded-full border border-foreground/20 bg-background/50 backdrop-blur-md font-bold text-base sm:text-lg hover:border-secondary/60 hover:text-secondary transition-colors inline-flex items-center justify-center gap-2"
            >
              <Gamepad2 size={20} /> <T en="Play a Mission" id="Main Misi" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
