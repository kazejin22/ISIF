"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";

export const LEARNING_SECTIONS: { id: string; label: [string, string] }[] = [
  { id: "chapters", label: ["Chapters", "Bab"] },
  { id: "anatomy", label: ["Anatomy", "Anatomi"] },
  { id: "library", label: ["Library", "Pustaka"] },
  { id: "videos", label: ["Videos", "Video"] },
];

/** Sticky chapter bar that highlights the section being read. */
export default function SectionNav() {
  const t = useT();
  const [active, setActive] = useState<string>(LEARNING_SECTIONS[0].id);

  useEffect(() => {
    const els = LEARNING_SECTIONS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav aria-label={t("Page sections", "Bagian halaman")} className="sticky top-[4.5rem] z-30 flex justify-center px-4 pointer-events-none">
      <ul className="pointer-events-auto flex gap-1 p-1 rounded-full bg-background/70 backdrop-blur-xl border border-foreground/10 shadow-lg shadow-black/10 max-w-full overflow-x-auto [scrollbar-width:none]">
        {LEARNING_SECTIONS.map((s, i) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors ${active === s.id ? "bg-primary text-white dark:text-black" : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"}`}
            >
              <span className="hidden sm:inline font-mono text-[10px] opacity-60">0{i + 1}</span> {t(...s.label)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
