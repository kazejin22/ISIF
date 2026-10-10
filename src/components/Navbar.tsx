"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useMounted } from "@/lib/useMounted";

const LINKS = [
  { href: "/map", label: "Crime Map" },
  { href: "/learning", label: "Learning" },
  { href: "/detector", label: "Detector" },
  { href: "/game", label: "Mission" },
];

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  // The menu closes itself whenever the route changes.
  const open = openPath === pathname;

  const toggler = mounted && (
    <AnimatedThemeToggler
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onThemeChange={setTheme}
      className="p-2 -m-2 rounded-lg hover:text-primary transition-colors [&_svg]:w-5 [&_svg]:h-5"
    />
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-foreground/10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-8">
        <Link href="/" className="text-xl font-bold tracking-tighter font-[family-name:var(--font-orbitron)]">
          AIVENTURE
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === l.href ? "text-primary" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          {toggler}
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-4">
          {toggler}
          <button
            type="button"
            onClick={() => setOpenPath(open ? null : pathname)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="p-2 -m-2"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-foreground/10 bg-background/95 backdrop-blur-md px-4 py-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block py-3 text-base font-medium border-b border-foreground/5 last:border-0 ${pathname === l.href ? "text-primary" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
