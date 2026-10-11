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
  const [open, setOpen] = useState<string | null>(null);
  const t = useT();

  return (
    <div className="flex flex-col">
      {curriculum.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id} className={`border-b transition-colors ${isOpen ? "border-primary/40" : "border-foreground/[0.05]"}`}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="group w-full flex gap-4 sm:gap-6 py-5 sm:py-6 text-left"
            >
              <span className={`text-sm font-mono pt-1 transition-colors ${isOpen ? "text-primary" : "text-primary/50 group-hover:text-primary"}`}>
                {item.id}
              </span>
              <span className="flex flex-col flex-1">
                <span className={`text-lg font-bold mb-1.5 transition-colors ${isOpen ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"}`}>
                  {t(item.title)}
                </span>
                <span className="text-sm text-foreground/50 leading-relaxed font-light">{t(item.desc)}</span>
              </span>
              <ChevronDown size={18} className={`shrink-0 mt-1.5 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <ul className="overflow-hidden pl-9 sm:pl-12 space-y-2.5">
                {item.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm text-foreground/70 leading-relaxed last:pb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                    {t(point)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
