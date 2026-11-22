"use client";

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";
import Scene from "./Scene";
import Hud from "./Hud";
import { useShellGame } from "./store";
import WipeOut from "@/components/WipeOut";

function Loader() {
  const { progress, active } = useProgress();
  if (!active && progress === 100) return null;
  return (
    <div className="sg-loader" aria-live="polite">
      <div className="sg-loader-bar">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      <p>Setting the table… {Math.round(progress)}%</p>
    </div>
  );
}

function useKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "BUTTON"].includes(e.target.tagName) && e.key === " ")
        return;
      const s = useShellGame.getState();
      if (["1", "2", "3"].includes(e.key)) {
        // keys map to the slot on screen, not the cup id
        const slot = Number(e.key) - 1;
        const cup = s.slotOf.indexOf(slot);
        s.pickCup(cup);
      } else if (e.key === " " || e.key === "Enter") {
        if (s.phase === "ready") {
          e.preventDefault();
          s.shuffle();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

export default function ShellGame() {
  useKeyboard();
  return (
    <div className="sg-root">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ fov: 38, near: 0.05, far: 30, position: [0, 1.6, 1.55] }}
        gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <Suspense fallback={null}>
          <Scene />
          <EffectComposer multisampling={0}>
            <SMAA />
            <Bloom mipmapBlur intensity={0.4} luminanceThreshold={0.95} luminanceSmoothing={0.2} />
            <Vignette eskil={false} offset={0.22} darkness={0.35} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      <Loader />
      <Hud />
      <WipeOut />
    </div>
  );
}
