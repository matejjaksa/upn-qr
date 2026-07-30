import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: process.env.NEXT_BASE_PATH || undefined,
  experimental: {
    cpus: 1
  },
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
