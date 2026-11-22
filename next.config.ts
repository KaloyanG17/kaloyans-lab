import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // lets a production build run alongside `next dev` without clobbering it
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
