"use client";

import { Suspense } from "react";
import { createXRStore } from "@react-three/xr";
import VRShell from "./VRShell";
import { useT } from "@/lib/i18n";
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
  const t = useT();
  return (
    <VRShell
      store={store}
      environment="firewall"
      title={t("Misinformation Firewall", "Firewall Misinformasi")}
      subtitle={t("Deepfake Detective · VR arcade", "Deepfake Detective · arkade VR")}
      desktopHint={t("No headset? Click a card to slash it — let credible posts pass.", "Tidak punya headset? Klik kartu untuk menebasnya — biarkan unggahan tepercaya lewat.")}
    >
      <Suspense fallback={null}>
        <Firewall />
      </Suspense>
    </VRShell>
  );
}
