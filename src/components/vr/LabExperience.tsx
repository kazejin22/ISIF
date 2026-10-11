"use client";

import { Suspense } from "react";
import { createXRStore } from "@react-three/xr";
import VRShell from "./VRShell";
import { useT } from "@/lib/i18n";
import { EMULATOR } from "./emulator";
import ForensicLab from "./ForensicLab";

// One store per page. Controllers keep their default ray (point + trigger) and
// grab pointers; Quest 2 is emulated on localhost when no headset is present.
const store = createXRStore({
  emulate: EMULATOR,
  foveation: 1,
  frameRate: "mid",
  hand: false,
});

// Lets automated tests drive the emulated headset during development.
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as unknown as { __xrStore: typeof store }).__xrStore = store;
}

export default function LabExperience() {
  const t = useT();
  return (
    <VRShell
      store={store}
      environment="lab"
      title={t("Forensic Lab VR", "Lab Forensik VR")}
      subtitle={t("Deepfake Detective · VR mission", "Deepfake Detective · misi VR")}
      desktopHint={t("No headset? Drag the photo and the scanner with your mouse, then click REAL or AI.", "Tidak punya headset? Seret foto dan pemindai dengan mouse, lalu klik ASLI atau AI.")}
    >
      <Suspense fallback={null}>
        <ForensicLab />
      </Suspense>
    </VRShell>
  );
}
