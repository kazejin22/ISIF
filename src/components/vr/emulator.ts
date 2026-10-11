// The Quest 2 emulator (IWER) is only for testing on machines without WebXR.
// On a real headset — or any browser that already has navigator.xr — it must stay
// off: it would add a second WebGL context and its dev UI on top of the game.
const hasNativeXR = typeof navigator !== "undefined" && Boolean((navigator as Navigator & { xr?: unknown }).xr);

export const EMULATOR = hasNativeXR ? false : ({ type: "metaQuest2", syntheticEnvironment: false } as const);
