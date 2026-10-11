"use client";

import { Suspense } from "react";
import { createXRStore } from "@react-three/xr";
import VRShell from "./VRShell";
import { EMULATOR } from "./emulator";
import Firewall, { SaberController } from "./Firewall";

// Sabers replace the default controllers (no laser pointers in this game).
const store = createXRStore({
  emulate: EMULATOR,
  controller: SaberController,
  foveation: 1,
  frameRate: "mid",
  hand: false,
});

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as unknown as { __xrStore: typeof store }).__xrStore = store;
}

export default function FirewallExperience() {
  return (
    <VRShell
      store={store}
      environment="firewall"
      title="Misinformation Firewall"
      subtitle="Deepfake Detective · VR arcade"
      desktopHint="No headset? Click a card to slash it — let credible posts pass."
    >
      <Suspense fallback={null}>
        <Firewall />
      </Suspense>
    </VRShell>
  );
}
