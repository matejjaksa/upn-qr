import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: process.env.NEXT_BASE_PATH || undefined,
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
