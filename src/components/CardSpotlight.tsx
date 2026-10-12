"use client";

import { useEffect } from "react";

/** Feeds the cursor position into every `.card-fx` card as --mx / --my (see globals.css). */
export default function CardSpotlight() {
  useEffect(() => {
    let frame = 0;
    let last: PointerEvent | null = null;
    const update = () => {
      frame = 0;
      const card = last?.target instanceof Element ? last.target.closest<HTMLElement>(".card-fx") : null;
      if (!card || !last) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${last.clientX - r.left}px`);
      card.style.setProperty("--my", `${last.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      last = e;
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
