import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Ensure build output tracing uses this workspace (fixes multi-lockfile root detection)
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
