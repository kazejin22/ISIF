import Link from "next/link";
import { T } from "@/lib/i18n";
import { Activity, ShieldCheck, ExternalLink } from "lucide-react";

const PLATFORM_LINKS = [
  { name: "Forensic Scanner", id: "Pemindai Forensik", href: "/detector" },
  { name: "Learning Hub", id: "Pusat Belajar", href: "/learning" },
  { name: "Global Case Map", id: "Peta Kasus Global", href: "/map" },
  { name: "Interactive Mission", id: "Misi Interaktif", href: "/game" },
];

const VERIFY_LINKS = [
  { name: "Content Credentials Verify", id: "Content Credentials Verify", href: "https://contentcredentials.org/verify" },
  { name: "Google Lens (reverse image search)", id: "Google Lens (pencarian gambar)", href: "https://lens.google/" },
  { name: "TinEye (reverse image search)", id: "TinEye (pencarian gambar)", href: "https://tineye.com/" },
];

const HELP_LINKS = [
  { name: "StopNCII.org — intimate image abuse", id: "StopNCII.org — penyalahgunaan foto intim", href: "https://stopncii.org/" },
  { name: "Take It Down — for under-18s", id: "Take It Down — untuk di bawah 18 tahun", href: "https://takeitdown.ncmec.org/" },
];

const linkClass = "text-sm text-foreground/60 hover:text-primary transition-colors inline-flex items-center gap-1.5";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full border-t border-foreground/[0.08] bg-background/50 overflow-hidden mt-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      <div className="absolute -bottom-[200px] left-1/2 -translate-x-1/2 w-[600px] max-w-full h-[400px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 pt-12 md:pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12 md:mb-16">

          {/* Brand & Mission */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08] flex items-center justify-center group-hover:border-primary/50 transition-all duration-300">
                <Activity size={20} className="text-primary animate-pulse" />
              </div>
              <span className="text-xl font-black font-[family-name:var(--font-orbitron)] tracking-widest">AIVENTURE</span>
            </Link>
            <p className="text-sm text-foreground/60 leading-relaxed max-w-xs">
              <T
                en="A student project helping people recognize deepfakes, verify what they see, and stay safe in the era of synthetic media."
                id="Proyek pelajar yang membantu orang mengenali deepfake, memverifikasi apa yang mereka lihat, dan tetap aman di era media sintetis."
              />
            </p>
          </div>

          <FooterColumn title={<T en="Platform" id="Platform" />}>
            {PLATFORM_LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className={linkClass}><T en={l.name} id={l.id} /></Link></li>
            ))}
          </FooterColumn>

          <FooterColumn title={<T en="Verify Media" id="Verifikasi Media" />}>
            {VERIFY_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <T en={l.name} id={l.id} /> <ExternalLink size={12} className="shrink-0" />
                </a>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title={<T en="Get Help" id="Cari Bantuan" />}>
            {HELP_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <T en={l.name} id={l.id} /> <ExternalLink size={12} className="shrink-0" />
                </a>
              </li>
            ))}
            <li className="text-xs text-foreground/40 leading-relaxed pt-1">
              <T
                en="Targeted by a deepfake? Save the evidence, report it to the platform, and tell someone you trust or the police."
                id="Jadi korban deepfake? Simpan buktinya, laporkan ke platform, dan ceritakan ke orang yang kamu percaya atau ke polisi."
              />
            </li>
          </FooterColumn>
        </div>

        <div className="pt-8 border-t border-foreground/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-foreground/50">© {currentYear} AIVENTURE.</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/[0.03] border border-foreground/[0.08]">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-foreground/70"><T en="Built for ISIF 2026" id="Dibuat untuk ISIF 2026" /></span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/90 font-[family-name:var(--font-orbitron)]">{title}</h4>
      <ul className="flex flex-col gap-3">{children}</ul>
    </div>
  );
}
