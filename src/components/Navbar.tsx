"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Menu, X, ChevronDown, Globe2, GraduationCap, ScanSearch, Images, ScanText,
  Gamepad2, Glasses, Swords, ArrowRight, type LucideIcon,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useMounted } from "@/lib/useMounted";

interface SubLink { href: string; label: string; desc: string; Icon: LucideIcon }
interface NavItem { label: string; href: string; Icon: LucideIcon; match: (path: string) => boolean; children?: SubLink[] }

const NAV: NavItem[] = [
  { label: "Crime Map", href: "/map", Icon: Globe2, match: (p) => p.startsWith("/map") },
  { label: "Learning", href: "/learning", Icon: GraduationCap, match: (p) => p.startsWith("/learning") },
  {
    label: "Detector", href: "/detector", Icon: ScanSearch, match: (p) => p.startsWith("/detector"),
    children: [
      { href: "/detector", label: "Media Scanner", desc: "Check images, video and audio", Icon: Images },
      { href: "/detector#text", label: "Text Scanner", desc: "Spot AI-written text, sentence by sentence", Icon: ScanText },
    ],
  },
  {
    label: "Mission", href: "/game", Icon: Gamepad2, match: (p) => p.startsWith("/game"),
    children: [
      { href: "/game", label: "Detective HQ", desc: "Four cases inspired by real deepfake crimes", Icon: Gamepad2 },
      { href: "/game/vr/lab", label: "Forensic Lab VR", desc: "Inspect evidence with an AI scanner", Icon: Glasses },
      { href: "/game/vr/firewall", label: "Firewall VR", desc: "Slash fake posts with laser sabers", Icon: Swords },
    ],
  },
];

// Scroll position as an external store (no setState-in-effect).
function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  window.addEventListener("resize", cb);
  return () => {
    window.removeEventListener("scroll", cb);
    window.removeEventListener("resize", cb);
  };
}
const scrollSnapshot = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  // Rounded so the snapshot only changes in 1% steps.
  return max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
};
const scrolledSnapshot = () => window.scrollY > 8;

function DesktopItem({ item, active }: { item: NavItem; active: boolean }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const show = () => { clearTimeout(closeTimer.current); setOpen(true); };
  const hide = () => { closeTimer.current = setTimeout(() => setOpen(false), 120); };
  const base = `relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${active ? "text-primary" : "text-foreground/70 hover:text-foreground"}`;

  const pill = active && <span className="absolute inset-0 -z-10 rounded-full bg-primary/12 ring-1 ring-primary/25" />;

  if (!item.children) {
    return (
      <Link href={item.href} className={base} aria-current={active ? "page" : undefined}>
        {pill}<item.Icon size={15} /> {item.label}
      </Link>
    );
  }

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      <Link href={item.href} className={base} aria-haspopup="true" aria-expanded={open} aria-current={active ? "page" : undefined}>
        {pill}<item.Icon size={15} /> {item.label}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </Link>
      <div className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 transition-all duration-200 ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"}`}>
        <div className="w-72 rounded-2xl border border-foreground/10 bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/20 p-2">
          {item.children.map((c) => (
            <Link key={c.href} href={c.href} onClick={() => setOpen(false)} className="group flex items-start gap-3 rounded-xl p-3 hover:bg-foreground/5 transition-colors">
              <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white dark:group-hover:text-black transition-colors"><c.Icon size={18} /></span>
              <span>
                <span className="block text-sm font-bold">{c.label}</span>
                <span className="block text-xs text-foreground/55 leading-snug">{c.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname; // closes itself on navigation
  const scrolled = useSyncExternalStore(subscribeScroll, scrolledSnapshot, () => false);
  const progress = useSyncExternalStore(subscribeScroll, scrollSnapshot, () => 0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenPath(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggler = mounted && (
    <AnimatedThemeToggler
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onThemeChange={setTheme}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/70 hover:text-primary hover:bg-foreground/5 transition-colors [&_svg]:w-[18px] [&_svg]:h-[18px]"
    />
  );

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 font-[family-name:var(--font-space-grotesk)]">
      {/* Reading progress */}
      <div className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-[width] duration-150" style={{ width: `${progress}%` }} />

      <div className="h-full px-3 sm:px-6 flex items-center">
        <nav
          aria-label="Main"
          data-scrolled={scrolled || open}
          className="nav-shell w-full max-w-6xl mx-auto h-12 flex items-center justify-between gap-3 rounded-full pl-5 pr-2"
        >
          <Link href="/" className="shrink-0 group" aria-label="AIVENTURE home">
            <span className="text-[15px] sm:text-lg font-extrabold tracking-[0.06em] font-[family-name:var(--font-unbounded)] bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent bg-[length:200%_100%] bg-left group-hover:bg-right transition-[background-position] duration-700">
              AIVENTURE
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {NAV.map((item) => <DesktopItem key={item.label} item={item} active={item.match(pathname)} />)}
          </div>

          <div className="flex items-center gap-1.5">
            {toggler}
            <Link href="/detector" className="hidden sm:inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-primary text-white dark:text-black text-sm font-bold hover:brightness-110 shadow-md shadow-primary/30 transition-all">
              <ScanSearch size={16} /> Scan now
            </Link>
            <button
              type="button"
              onClick={() => setOpenPath(open ? null : pathname)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-foreground/5"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile / tablet menu */}
      <div className={`lg:hidden fixed inset-x-0 top-16 bottom-0 transition-all duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setOpenPath(null)} />
        <div className={`relative mx-3 sm:mx-6 rounded-3xl border border-foreground/10 bg-background/95 backdrop-blur-xl shadow-2xl p-3 max-h-[calc(100dvh-5.5rem)] overflow-y-auto transition-transform duration-300 ${open ? "translate-y-0" : "-translate-y-3"}`}>
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <div key={item.label} className="py-1">
                <Link href={item.href} className={`flex items-center gap-3 px-3 py-3 rounded-2xl font-bold ${active ? "bg-primary/10 text-primary" : "hover:bg-foreground/5"}`}>
                  <item.Icon size={20} /> {item.label}
                </Link>
                {item.children && (
                  <div className="grid gap-1 pl-4 mt-1">
                    {item.children.filter((c) => c.href !== item.href).map((c) => (
                      <Link key={c.href} href={c.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5">
                        <c.Icon size={17} className="text-primary shrink-0" />
                        <span>
                          <span className="block text-sm font-semibold">{c.label}</span>
                          <span className="block text-xs text-foreground/55">{c.desc}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <Link href="/detector" className="mt-2 flex items-center justify-center gap-2 h-12 rounded-2xl bg-primary text-white dark:text-black font-bold">
            <ScanSearch size={18} /> Scan media now <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
