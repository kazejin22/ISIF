"use client";

import dynamic from "next/dynamic";

// WebXR and three.js need the browser, so the experience is client-only.
const LabExperience = dynamic(() => import("@/components/vr/LabExperience"), {
  ssr: false,
  loading: () => <div className="h-[calc(100dvh-4rem)] flex items-center justify-center text-sm text-foreground/50">Loading the lab…</div>,
});

export default function LabLoader() {
  return <LabExperience />;
}
