import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server be opened through an HTTPS tunnel (e.g. on a Meta Quest for WebXR testing).
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
