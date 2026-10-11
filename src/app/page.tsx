import HeroScene from "@/components/HeroScene";
import Link from "next/link";
import { ArrowRight, Globe, ShieldAlert, Users } from "lucide-react";
import { deepfakeStats } from "@/data/stats";
import { T } from "@/lib/i18n";

const homeStats = [deepfakeStats.fraudAttempts, deepfakeStats.fraudForecast];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        <HeroScene />
        <div className="relative z-20 container mx-auto px-4 flex flex-col items-center text-center mt-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8 backdrop-blur-md">
            <ShieldAlert size={16} />
            <span className="text-sm font-medium tracking-wide"><T en="Exposing the Illusion of AI" id="Membongkar Ilusi AI" /></span>
          </div>
          
          <h1 className="text-[2.75rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">
            <T en="Can You Trust" id="Masih Percaya" /> <br /> <T en="Your Own Eyes?" id="Mata Sendiri?" />
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-foreground/70 mb-10 font-light">
            <T
              en="Deepfakes are reshaping reality, fueling scams, and threatening digital trust. Step into the matrix, uncover the anatomy of digital deception, and learn how to defend the truth."
              id="Deepfake mengubah realitas, memicu penipuan, dan merusak kepercayaan digital. Masuki dunianya, bongkar anatomi tipuan digital, dan pelajari cara membela kebenaran."
            />
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/learning" 
              className="px-8 py-4 rounded-lg bg-foreground text-background font-bold text-lg hover:bg-primary hover:text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] flex items-center justify-center gap-2 group"
            >
              <T en="Start Learning" id="Mulai Belajar" />
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/detector" 
              className="px-8 py-4 rounded-lg bg-background/50 backdrop-blur-md border border-foreground/20 text-foreground font-bold text-lg hover:border-primary/50 transition-all flex items-center justify-center gap-2"
            >
              <T en="Try the Detector" id="Coba Detektor" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / Map Teaser Section */}
      <section className="py-16 md:py-24 bg-background relative z-20 border-t border-foreground/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
                <T en="A Global Epidemic of" id="Wabah Global" /> <span className="text-primary"><T en="Digital Forgery" id="Pemalsuan Digital" /></span>
              </h2>
              <p className="text-lg text-foreground/70 mb-8 font-light">
                <T
                  en="AI-generated voice scams, political deepfakes, and synthetic identity fraud are rising fast. The threat is not science fiction—it is happening right now, across the globe."
                  id="Penipuan suara AI, deepfake politik, dan pemalsuan identitas sintetis meningkat pesat. Ancaman ini bukan fiksi ilmiah—ini sedang terjadi sekarang, di seluruh dunia."
                />
              </p>
              
              <div className="grid grid-cols-2 gap-6 sm:gap-8 mb-8">
                {homeStats.map((stat, i) => (
                  <div key={stat.label}>
                    <div className={`text-3xl sm:text-4xl font-black mb-2 ${i === 0 ? "text-secondary" : "text-primary"}`}>{stat.value}</div>
                    <div className="text-sm text-foreground/60"><T en={stat.label} /></div>
                    <a href={stat.href} target="_blank" rel="noopener noreferrer" className="text-[11px] text-foreground/40 hover:text-primary hover:underline">
                      {stat.source} ↗
                    </a>
                  </div>
                ))}
              </div>
              
              <Link href="/map" className="inline-flex items-center gap-2 text-primary hover:text-secondary font-medium transition-colors">
                <T en="Explore the Interactive Crime Map" id="Jelajahi Peta Kasus Interaktif" /> <ArrowRight size={18} />
              </Link>
            </div>
            
            <Link href="/map" aria-label="Open the global deepfake case map" className="relative rounded-2xl overflow-hidden aspect-square border border-foreground/10 bg-foreground/5 flex items-center justify-center group">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50" />
              <Globe size={120} className="text-primary/40 group-hover:scale-110 group-hover:text-primary transition-all duration-700" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40 backdrop-blur-sm">
                <span className="px-6 py-3 rounded-full bg-foreground text-background font-bold shadow-2xl">
                  <T en="Open Global Map" id="Buka Peta Global" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-24 bg-foreground/5 relative z-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Users size={48} className="mx-auto mb-6 text-secondary" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6"><T en="About the Cyber Defenders" id="Tentang Cyber Defenders" /></h2>
          <p className="text-lg text-foreground/70 mb-8 font-light">
            <T
              en="We are a team of students passionate about technology and digital ethics. Created for the ISIF 2026 competition, our goal is to bridge the gap between advanced AI capabilities and public awareness, equipping the next generation with the tools to discern truth from fabrication."
              id="Kami adalah tim pelajar yang peduli pada teknologi dan etika digital. Dibuat untuk kompetisi ISIF 2026, tujuan kami adalah menjembatani kemampuan AI yang canggih dengan kesadaran publik, serta membekali generasi berikutnya untuk membedakan kebenaran dari rekayasa."
            />
          </p>
        </div>
      </section>

      {/* CTA / Footage Teaser */}
      <section className="relative py-32 overflow-hidden border-t border-foreground/10">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* Abstract pattern as B-Roll alternative for now */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-secondary/40 via-background to-background" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-8"><T en="Ready to Defend the Truth?" id="Siap Membela Kebenaran?" /></h2>
          <Link 
            href="/learning" 
            className="px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-foreground text-background font-black text-lg sm:text-xl hover:scale-105 transition-transform inline-block shadow-[0_0_40px_rgba(168,85,247,0.4)]"
          >
            <T en="Become a Cyber Defender" id="Jadilah Cyber Defender" />
          </Link>
        </div>
      </section>
    </div>
  );
}
