"use client";

import { Suspense } from "react";
import { createXRStore } from "@react-three/xr";
import VRShell from "./VRShell";
import ForensicLab from "./ForensicLab";

// One store per page. Controllers keep their default ray (point + trigger) and
// grab pointers; Quest 2 is emulated on localhost when no headset is present.
const store = createXRStore({
  emulate: { type: "metaQuest2", syntheticEnvironment: false },
  foveation: 1,
  frameRate: "mid",
  hand: false,
});

// Lets automated tests drive the emulated headset during development.
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as unknown as { __xrStore: typeof store }).__xrStore = store;
}

export default function LabExperience() {
  return (
    <VRShell
      store={store}
      environment="lab"
      title="Forensic Lab VR"
      subtitle="Deepfake Detective · VR mission"
      desktopHint="No headset? Drag the photo and the scanner with your mouse, then click REAL or AI."
    >
      <Suspense fallback={null}>
        <ForensicLab />
      </Suspense>
    </VRShell>
  );
}
