"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useT } from "@/lib/i18n";

const curriculum = [
  {
    id: "01",
    title: "How Deepfakes Are Made",
    desc: "The generative models behind synthetic faces, voices, and videos.",
    points: [
      "GANs pit two networks against each other: a generator makes fakes and a discriminator tries to catch them, until the fakes get convincing.",
      "Diffusion models (Midjourney, DALL·E, Stable Diffusion) start from random noise and refine it step by step to match a text prompt.",
      "Face-swap tools learn two faces, then map one onto the other frame by frame using facial landmarks.",
      "Voice cloning needs very little material — researchers have shown a few seconds of audio can be enough.",
    ],
  },
  {
    id: "02",
    title: "Spotting the Tells",
    desc: "Where generated and manipulated media most often slips up.",
    points: [
      "Images: malformed hands, teeth, ears, and jewelry; garbled background text; shadows and reflections that disagree.",
      "Video: lip movements drifting from the audio, odd blinking, and flicker around the jaw or hairline when the head turns.",
      "Audio: no breathing, flat emotion, metallic 's' sounds, and suspiciously clean recordings with no room noise.",
      "Important: the best fakes show none of these. No visible tell does not prove something is real.",
    ],
  },
  {
    id: "03",
    title: "Verify Before You Share",
    desc: "A practical routine for checking suspicious media and calls.",
    points: [
      "Pause. Urgency and strong emotion are a scammer's main tools.",
      "Trace the source: who posted it first? Is it on an official account or reported by trusted outlets?",
      "Run a reverse image search (Google Lens, TinEye) to find the original photo or video.",
      "Look for Content Credentials (C2PA) or platform 'AI-generated' labels.",
      "If a call asks for money, hang up and call back on a number you already know. Agree on a family code word.",
    ],
  },
  {
    id: "04",
    title: "Law, Ethics & Your Rights",
    desc: "How rules are catching up, and what to do if you are targeted.",
    points: [
      "A growing number of countries, including South Korea and the UK, now treat sexual deepfakes made without consent as a crime.",
      "The EU AI Act requires deepfakes and other AI-generated content to be clearly disclosed.",
      "In 2024 the US FCC ruled that AI-generated voices in robocalls fall under its ban on artificial voices.",
      "If you are targeted: save evidence (screenshots, links), report it to the platform, and tell a trusted adult or the police.",
    ],
  },
];

export default function CurriculumList() {
  const [open, setOpen] = useState<string | null>(curriculum[0].id);
  const t = useT();

  return (
    <div className="flex flex-col gap-3">
      {curriculum.map((item) => {
        const isOpen = open === item.id;
        return (
          <div
            key={item.id}
            className={`card-fx rounded-3xl border transition-colors ${isOpen ? "border-primary/40 bg-primary/[0.04]" : "border-foreground/[0.07] bg-background/40 hover:border-foreground/20"}`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="group w-full flex items-start gap-4 sm:gap-6 p-5 sm:p-6 text-left"
            >
              <span
                aria-hidden
                className={`text-4xl sm:text-5xl font-black leading-none font-[family-name:var(--font-orbitron)] transition-colors ${isOpen ? "text-primary" : "text-transparent [-webkit-text-stroke:1px_color-mix(in_srgb,var(--foreground)_35%,transparent)] group-hover:[-webkit-text-stroke-color:var(--primary)]"}`}
              >
                {item.id}
              </span>
              <span className="flex flex-col flex-1 min-w-0 pt-0.5">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/40 mb-1">
                  {t("Chapter", "Bab")} {item.id} · {item.points.length} {t("key points", "poin penting")}
                </span>
                <span className={`text-lg sm:text-xl font-bold mb-1 transition-colors ${isOpen ? "text-foreground" : "text-foreground/85 group-hover:text-foreground"}`}>
                  {t(item.title)}
                </span>
                <span className="text-sm text-foreground/50 leading-relaxed font-light">{t(item.desc)}</span>
              </span>
              <span className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${isOpen ? "bg-primary border-primary text-white dark:text-black rotate-180" : "border-foreground/15 text-foreground/60 group-hover:border-primary group-hover:text-primary"}`}>
                <ChevronDown size={16} />
              </span>
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <ol className="overflow-hidden px-5 sm:px-6 sm:pl-[6.5rem] space-y-3">
                {item.points.map((point, i) => (
                  <li key={point} className="flex gap-3 text-sm text-foreground/75 leading-relaxed last:pb-6">
                    <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{t(point)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        );
      })}
    </div>
  );
}
