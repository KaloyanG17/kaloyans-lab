"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";

import LensScene from "./LensScene";

export default function Hero() {
  return (
    <section className="hero" aria-label="Kaloyan's Lab">
      <h1 className="sr-only">Kaloyan&apos;s Lab — games and interactive studies</h1>
      <Canvas
        className="hero-canvas"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 10], fov: 30 }}
        gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
        eventSource={document.body}
        eventPrefix="client"
      >
        <Suspense fallback={null}>
          <LensScene />
        </Suspense>
      </Canvas>
    </section>
  );
}
