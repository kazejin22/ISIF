// @react-three/fiber (up to 9.8.x) still creates a THREE.Clock, which three r185
// reports as deprecated on every load. It's harmless library noise, so drop only
// that one message instead of letting it pile up as a dev "issue".
// Import this module (for its side effect) from any component that renders a <Canvas>.
if (typeof window !== "undefined") {
  const warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith("THREE.Clock: This module has been deprecated")) return;
    warn(...args);
  };
}

export {};
