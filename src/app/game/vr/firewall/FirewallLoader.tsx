"use client";

import dynamic from "next/dynamic";

const FirewallExperience = dynamic(() => import("@/components/vr/FirewallExperience"), {
  ssr: false,
  loading: () => <div className="h-[calc(100dvh-4rem)] flex items-center justify-center text-sm text-foreground/50">Loading the firewall…</div>,
});

export default function FirewallLoader() {
  return <FirewallExperience />;
}
