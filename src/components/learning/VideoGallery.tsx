"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { useT } from "@/lib/i18n";

const videos = [
  { id: "s8IGWdkxM9E", title: ["What is AI?", "Apa itu AI?"] },
  { id: "02rVRwovRow", title: ["The Types of AI", "Jenis-Jenis AI"] },
  { id: "ch-CU5VG1fs", title: ["AI vs Human Works", "Karya AI vs Karya Manusia"] },
] satisfies { id: string; title: [string, string] }[];

/** Bento of the team's explainers: one featured, two beside it. Plays in place. */
export default function VideoGallery() {
  const t = useT();
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4 md:gap-5">
      {videos.map((vid, i) => {
        const featured = i === 0;
        return (
          <div key={vid.id} className={`group flex flex-col ${featured ? "md:col-span-2 lg:row-span-2" : ""}`}>
            <div className={`card-fx relative w-full rounded-3xl overflow-hidden bg-black border border-foreground/[0.08] aspect-video ${featured ? "lg:aspect-auto lg:flex-1 lg:min-h-0" : ""}`}>
              {playing === vid.id ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${vid.id}?autoplay=1&rel=0`}
                  title={t(...vid.title)}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <button type="button" onClick={() => setPlaying(vid.id)} className="absolute inset-0 w-full h-full text-left" aria-label={`${t("Play", "Putar")}: ${t(...vid.title)}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${vid.id}/${featured ? "maxresdefault" : "hqdefault"}.jpg`}
                    onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`; }}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all ${featured ? "w-20 h-20" : "w-14 h-14"}`}>
                    <Play size={featured ? 30 : 22} className="ml-1 fill-current" />
                  </span>
                  <span className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-[10px] font-mono uppercase tracking-widest text-white/60 mb-1">
                        {t("Episode", "Episode")} 0{i + 1}
                      </span>
                      <span className={`block font-bold text-white leading-tight ${featured ? "text-xl sm:text-3xl font-[family-name:var(--font-orbitron)]" : "text-base"}`}>
                        {t(...vid.title)}
                      </span>
                    </span>
                    <span className="shrink-0 px-2 py-0.5 rounded bg-black/60 border border-white/20 text-[10px] text-white/80 font-mono">YouTube</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
