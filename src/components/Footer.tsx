import Link from "next/link";
import { Activity, ShieldCheck, Mail, ArrowRight, Globe, Share2, Hexagon } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full border-t border-foreground/[0.08] bg-background/50 overflow-hidden mt-auto">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      <div className="absolute -bottom-[200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto px-6 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08] flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300">
                <Activity size={20} className="text-primary animate-pulse" />
              </div>
              <span className="text-xl font-black font-[family-name:var(--font-orbitron)] tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
                AIVENTURE
              </span>
            </Link>
            <p className="text-sm text-foreground/60 leading-relaxed max-w-xs">
              Pioneering digital authenticity. We empower users with advanced neural forensics to navigate the era of synthetic media.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-9 h-9 rounded-full bg-foreground/[0.03] border border-foreground/[0.08] flex items-center justify-center text-foreground/50 hover:text-primary hover:border-primary/50 hover:scale-110 transition-all duration-300">
                <Share2 size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-foreground/[0.03] border border-foreground/[0.08] flex items-center justify-center text-foreground/50 hover:text-primary hover:border-primary/50 hover:scale-110 transition-all duration-300">
                <Globe size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-foreground/[0.03] border border-foreground/[0.08] flex items-center justify-center text-foreground/50 hover:text-primary hover:border-primary/50 hover:scale-110 transition-all duration-300">
                <Hexagon size={16} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/90 font-[family-name:var(--font-orbitron)]">Platform</h4>
            <ul className="flex flex-col gap-3">
              {[
                { name: "Forensic Scanner", href: "/detector" },
                { name: "Learning", href: "/learning" },
                { name: "Global Threat Map", href: "/map" },
                { name: "Interactive Mission", href: "/game" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/90 font-[family-name:var(--font-orbitron)]">Legal & Support</h4>
            <ul className="flex flex-col gap-3">
              {[
                { name: "Documentation", href: "#" },
                { name: "Privacy Policy", href: "#" },
                { name: "Terms of Service", href: "#" },
                { name: "Contact Us", href: "#" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/90 font-[family-name:var(--font-orbitron)]">Stay Updated</h4>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Join our newsletter for the latest deepfake alerts and AI forensic updates.
            </p>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative flex items-center bg-background rounded-xl border border-foreground/10 overflow-hidden">
                <div className="pl-4 text-foreground/40">
                  <Mail size={16} />
                </div>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-transparent border-none outline-none px-3 py-3 text-sm text-foreground placeholder:text-foreground/30"
                />
                <button className="h-full px-4 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-foreground/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-foreground/50">
            <span>© {currentYear} AIVENTURE. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/[0.03] border border-foreground/[0.08] backdrop-blur-md">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-foreground/70">
              Built for ISIF 2026
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
