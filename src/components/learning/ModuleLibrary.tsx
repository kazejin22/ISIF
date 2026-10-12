"use client";

import { useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { useT } from "@/lib/i18n";
import { learningModules } from "@/data/learningModules";

const ALL = "all";

/** The PDF library, with a filter by category. */
export default function ModuleLibrary() {
  const t = useT();
  const [filter, setFilter] = useState(ALL);
  const tags = learningModules.map((m) => m.tag);
  const shown = filter === ALL ? learningModules : learningModules.filter((m) => m.tag[0] === filter);

  const chip = (value: string, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setFilter(value)}
      aria-pressed={filter === value}
      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filter === value ? "bg-foreground text-background border-foreground" : "border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/30"}`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap [scrollbar-width:none]">
        {chip(ALL, t("All", "Semua"))}
        {tags.map(([en, id]) => chip(en, t(en, id)))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {shown.map((doc) => (
          <article
            key={doc.id}
            data-lift
            className="card-fx group flex flex-col p-6 rounded-3xl bg-background/60 border border-foreground/[0.07] relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 mb-6">
              <span className="text-[10px] font-mono tracking-wider text-foreground/40">{doc.id}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {t(...doc.tag)}
              </span>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-bold leading-snug mb-1 group-hover:text-primary transition-colors">{doc.title}</h3>
            <p className="text-[11px] font-medium text-foreground/40 mb-3">{doc.organization}</p>
            <p className="text-sm text-foreground/60 leading-relaxed mb-6 flex-1">{t(doc.description, doc.descriptionId)}</p>

            <div className="pt-4 border-t border-foreground/[0.06] flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-foreground/40">PDF · {doc.size}</span>
              <div className="flex items-center gap-2">
                <a
                  href={doc.filename}
                  download
                  aria-label={t("Download PDF", "Unduh PDF")}
                  title={t("Download PDF", "Unduh PDF")}
                  className="p-2 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.08] text-foreground/70 hover:text-foreground border border-foreground/[0.06] transition-colors"
                >
                  <Download size={15} />
                </a>
                <a
                  href={doc.filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white dark:text-black text-xs font-bold hover:brightness-110 transition-all"
                >
                  {t("Read PDF", "Baca PDF")} <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
