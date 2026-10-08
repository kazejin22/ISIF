"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md bg-background/80 border-b border-foreground/10">
      <Link href="/" className="flex items-center gap-3">
        <span className="text-xl font-bold tracking-tighter font-[family-name:var(--font-orbitron)]">AIVENTURE</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/map" className="text-sm font-medium hover:text-primary transition-colors">
          Crime Map
        </Link>
        <Link href="/learning" className="text-sm font-medium hover:text-primary transition-colors">
          Learning
        </Link>
        <Link href="/detector" className="text-sm font-medium hover:text-primary transition-colors">
          Detector
        </Link>
        <Link href="/game" className="text-sm font-medium hover:text-primary transition-colors">
          VR Game
        </Link>

        {mounted && (
          <AnimatedThemeToggler
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            onThemeChange={setTheme}
          />
        )}
      </div>
    </nav>
  );
}
