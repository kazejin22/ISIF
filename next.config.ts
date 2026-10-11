import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server be opened through an HTTPS tunnel (e.g. on a Meta Quest for WebXR testing).
  allowedDevOrigins: ["*.trycloudflare.com"],
  // Strict Mode mounts every component twice in development. For the WebGL/WebXR
  // pages that means creating and force-losing a GPU context on every visit, which
  // can make browsers (notably Meta Quest Browser) block WebGL for the page.
  // Production builds are unaffected either way.
  reactStrictMode: false,
  env: {
    // Vercel Functions reject request bodies over 4.5 MB (VERCEL=1 during Vercel builds).
    MAX_UPLOAD_MB: process.env.VERCEL ? "4.4" : "12",
  },
};

export default nextConfig;
