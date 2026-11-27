import type { NextConfig } from "next";

/**
 * The lab is served from kaloyan.vercel.app/lab: the portfolio project
 * rewrites /lab/* to this deployment, so every route and asset lives under it.
 */
const basePath = "/lab";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // lets a production build run alongside `next dev` without clobbering it
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async redirects() {
    // this project's own root (kaloyans-lab.vercel.app) goes to the lab
    return [{ source: "/", destination: "/lab", basePath: false, permanent: false }];
  },
};

export default nextConfig;
