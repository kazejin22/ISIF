import HeroScene from "@/components/HeroScene";
import Link from "next/link";
import { ArrowRight, Globe, ShieldAlert, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        <HeroScene />
        <div className="relative z-20 container mx-auto px-4 flex flex-col items-center text-center mt-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8 backdrop-blur-md">
            <ShieldAlert size={16} />
            <span className="text-sm font-medium tracking-wide">Exposing the Illusion of AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">
            Can You Trust <br /> Your Own Eyes?
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-foreground/70 mb-10 font-light">
            Deepfakes are reshaping reality, fueling scams, and threatening digital trust. 
            Step into the matrix, uncover the anatomy of digital deception, and learn how to defend the truth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/learning" 
              className="px-8 py-4 rounded-lg bg-foreground text-background font-bold text-lg hover:bg-primary hover:text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] flex items-center justify-center gap-2 group"
            >
              Start Learning
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/detector" 
              className="px-8 py-4 rounded-lg bg-background/50 backdrop-blur-md border border-foreground/20 text-foreground font-bold text-lg hover:border-primary/50 transition-all flex items-center justify-center gap-2"
            >
              Test Detector API
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / Map Teaser Section */}
      <section className="py-24 bg-background relative z-20 border-t border-foreground/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                A Global Epidemic of <span className="text-primary">Digital Forgery</span>
              </h2>
              <p className="text-lg text-foreground/70 mb-8 font-light">
                AI-generated voice scams, political deepfakes, and synthetic identity theft are rising exponentially. The threat is not science fiction—it is happening right now, across the globe.
              </p>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-4xl font-black text-secondary mb-2">+3000%</div>
                  <div className="text-sm text-foreground/60">Increase in deepfake fraud attempts globally since 2022.</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-primary mb-2">$5.3B</div>
                  <div className="text-sm text-foreground/60">Estimated financial loss due to AI voice cloning.</div>
                </div>
              </div>
              
              <Link href="/map" className="inline-flex items-center gap-2 text-primary hover:text-secondary font-medium transition-colors">
                Explore the Interactive Crime Map <ArrowRight size={18} />
              </Link>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden aspect-square border border-foreground/10 bg-foreground/5 flex items-center justify-center group cursor-pointer">
              {/* Dummy globe representation - will be actual 3D on /map */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50" />
              <Globe size={120} className="text-primary/40 group-hover:scale-110 group-hover:text-primary transition-all duration-700" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/40 backdrop-blur-sm">
                <span className="px-6 py-3 rounded-full bg-foreground text-background font-bold shadow-2xl">
                  Open Global Map
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-24 bg-foreground/5 relative z-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Users size={48} className="mx-auto mb-6 text-secondary" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">About the Cyber Defenders</h2>
          <p className="text-lg text-foreground/70 mb-8 font-light">
            We are a team of students passionate about technology and digital ethics. 
            Created for the ISIF 2026 competition, our goal is to bridge the gap between advanced AI capabilities and public awareness, equipping the next generation with the tools to discern truth from fabrication.
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
          <h2 className="text-4xl md:text-6xl font-black mb-8">Ready to Defend the Truth?</h2>
          <Link 
            href="/learning" 
            className="px-10 py-5 rounded-full bg-foreground text-background font-black text-xl hover:scale-105 transition-transform inline-block shadow-[0_0_40px_rgba(168,85,247,0.4)]"
          >
            Become a Cyber Defender
          </Link>
        </div>
      </section>
    </div>
  );
}
