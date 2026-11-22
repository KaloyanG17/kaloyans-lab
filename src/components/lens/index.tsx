"use client";

import dynamic from "next/dynamic";

/** WebGL hero, client-only. A paper-coloured block holds the space while it loads. */
const Hero = dynamic(() => import("./Hero"), {
  ssr: false,
  loading: () => <section className="hero" aria-hidden />,
});

export default Hero;
