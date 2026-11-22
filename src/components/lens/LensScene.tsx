"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial, Text } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";

const INK = "#0d0d0d";
const RED = "#ff3b1f";
export const PAPER = "#efeeea";
const BOLD = "/fonts/InterTight-800.ttf";
const MEDIUM = "/fonts/InterTight-500.ttf";

/**
 * The Swiss composition. It lives inside the scene (not in HTML) so the
 * glass droplet can refract it.
 */
function Typography({ onDot }: { onDot: (p: THREE.Vector3, r: number) => void }) {
  const { viewport } = useThree();
  const w = viewport.width;
  const h = viewport.height;
  const portrait = w < h;
  const size = portrait ? w * 0.215 : Math.min(w * 0.175, h * 0.3);
  const left = -w / 2 + w * 0.045;
  const top = portrait ? h * 0.22 : h / 2 - h * 0.21;
  const meta = Math.max(size * 0.085, 0.07);
  const [labWidth, setLabWidth] = useState(0);

  useEffect(() => {
    if (!labWidth) return;
    const r = size * 0.11;
    onDot(new THREE.Vector3(left + labWidth + r * 1.25, top - size * 0.88 - size * 0.76 + r, 0.02), r);
  }, [labWidth, left, top, size, onDot]);

  const metaProps = { font: MEDIUM, fontSize: meta, color: INK, letterSpacing: 0.04, anchorY: "top" as const };

  return (
    <group>
      <Text
        font={BOLD}
        fontSize={size}
        letterSpacing={-0.065}
        lineHeight={0.82}
        color={INK}
        anchorX="left"
        anchorY="top"
        position={[left - size * 0.04, top, 0]}
      >
        {"Kaloyan's"}
      </Text>
      <Text
        font={BOLD}
        fontSize={size}
        letterSpacing={-0.065}
        color={INK}
        anchorX="left"
        anchorY="top"
        position={[left - size * 0.04, top - size * 0.88, 0]}
        onSync={(t) => {
          const info = (t as unknown as { textRenderInfo?: { blockBounds: number[] } }).textRenderInfo;
          if (info) setLabWidth(info.blockBounds[2] - size * 0.04);
        }}
      >
        Lab
      </Text>

      {/* Swiss grid furniture */}
      <Text {...metaProps} anchorX="left" position={[left, h / 2 - h * 0.13, 0]}>
        {"VOL. 01 — GAMES & INTERACTIVE STUDIES"}
      </Text>
      <Text {...metaProps} anchorX="right" position={[w / 2 - w * 0.045, h / 2 - h * 0.13, 0]}>
        {"EST. 2026"}
      </Text>
      <Text
        {...metaProps}
        anchorX="left"
        anchorY="bottom"
        maxWidth={portrait ? w * 0.85 : w * 0.38}
        lineHeight={1.35}
        letterSpacing={0}
        fontSize={meta * 1.35}
        position={[left, -h / 2 + h * 0.08, 0]}
      >
        Small games and interactive pieces, built with care. Each one is a study in motion, feel and finish.
      </Text>
      {!portrait && (
        <Text {...metaProps} anchorX="right" anchorY="bottom" position={[w / 2 - w * 0.045, -h / 2 + h * 0.08, 0]}>
          {"(SCROLL) ↓"}
        </Text>
      )}
      {/* hairline rules */}
      <mesh position={[0, -h / 2 + h * 0.08 + meta * (portrait ? 7.5 : 6.6), 0]}>
        <planeGeometry args={[w * 0.91, Math.max(0.004, h * 0.0012)]} />
        <meshBasicMaterial color={INK} />
      </mesh>
    </group>
  );
}

/** The pea: the full stop of "Lab." — a little red ball that the glass can scoop up. */
function Pea({ at }: { at: { p: THREE.Vector3; r: number } | null }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current || !at) return;
    const t = state.clock.elapsedTime;
    ref.current.position.set(at.p.x, at.p.y + Math.abs(Math.sin(t * 2.2)) * at.r * 0.12, at.p.z);
  });
  if (!at) return null;
  return (
    <mesh ref={ref} scale={at.r}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshPhysicalMaterial color={RED} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
    </mesh>
  );
}

/**
 * A droplet of liquid glass on a spring. It chases the pointer, stretches
 * along its velocity, wobbles when it settles, and drifts on a Lissajous
 * path when left alone.
 */
function Droplet() {
  const { viewport, pointer, size } = useThree();
  const mesh = useRef<THREE.Mesh>(null);
  const pos = useRef(new THREE.Vector2(0.5, 0));
  const vel = useRef(new THREE.Vector2());
  const stretch = useRef(0);
  const angle = useRef(0);
  const lastPointer = useRef(new THREE.Vector2(9, 9));
  const idleFor = useRef(10);
  const pulse = useRef(0);
  const target = useMemo(() => new THREE.Vector2(), []);

  const radius = Math.min(viewport.width, viewport.height) * (size.width < size.height ? 0.22 : 0.2);

  useEffect(() => {
    const onDown = () => (pulse.current = 1);
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  useFrame((state, rawDt) => {
    const m = mesh.current;
    if (!m) return;
    const dt = Math.min(rawDt, 1 / 30);
    const t = state.clock.elapsedTime;

    if (lastPointer.current.distanceTo(pointer) > 0.0005) {
      idleFor.current = 0;
      lastPointer.current.copy(pointer);
    } else idleFor.current += dt;

    if (idleFor.current > 2.5) {
      target.set(Math.sin(t * 0.35) * viewport.width * 0.28, Math.sin(t * 0.5 + 1) * viewport.height * 0.18);
    } else {
      target.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2);
    }

    // critically-underdamped spring: overshoots a touch, like a drop of liquid
    const k = 38;
    const c = 7.5;
    const ax = k * (target.x - pos.current.x) - c * vel.current.x;
    const ay = k * (target.y - pos.current.y) - c * vel.current.y;
    vel.current.x += ax * dt;
    vel.current.y += ay * dt;
    pos.current.x += vel.current.x * dt;
    pos.current.y += vel.current.y * dt;

    const speed = vel.current.length();
    easing.damp(stretch, "current", Math.min(speed / (radius * 6), 0.45), 0.12, dt);
    if (speed > 0.05) {
      const a = Math.atan2(vel.current.y, vel.current.x);
      // shortest-path angle easing
      let d = a - angle.current;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      angle.current += d * Math.min(1, dt * 10);
    }

    easing.damp(pulse, "current", 0, 0.25, dt);
    const breathe = 1 + Math.sin(t * 1.7) * 0.015;
    const s = stretch.current;
    const p = pulse.current;
    m.position.set(pos.current.x, pos.current.y, 1.2);
    m.rotation.set(0, 0, angle.current);
    m.scale.set(
      radius * breathe * (1 + s) * (1 + p * 0.18),
      radius * breathe * (1 - s * 0.45) * (1 + p * 0.18),
      radius * breathe * (1 - s * 0.2),
    );
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 96, 96]} />
      <MeshTransmissionMaterial
        background={new THREE.Color(PAPER)}
        samples={6}
        resolution={768}
        transmission={1}
        roughness={0.02}
        thickness={0.9}
        ior={1.3}
        chromaticAberration={0.35}
        anisotropicBlur={0.05}
        distortion={0.18}
        distortionScale={0.3}
        temporalDistortion={0.08}
        envMapIntensity={0.6}
        clearcoat={1}
        attenuationDistance={2}
        attenuationColor="#ffffff"
        color="#ffffff"
      />
    </mesh>
  );
}

export default function LensScene() {
  const [dot, setDot] = useState<{ p: THREE.Vector3; r: number } | null>(null);
  const onDot = useMemo(
    () => (p: THREE.Vector3, r: number) =>
      setDot((d) => (d && d.p.equals(p) && d.r === r ? d : { p, r })),
    [],
  );
  return (
    <>
      <color attach="background" args={[PAPER]} />
      <Typography onDot={onDot} />
      <Pea at={dot} />
      <Droplet />
      <ambientLight intensity={1} />
      <directionalLight position={[3, 4, 5]} intensity={2} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 2]} scale={[10, 1, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 0, 3]} scale={[1, 6, 1]} />
        <Lightformer form="ring" intensity={2} position={[4, 2, 4]} scale={1.2} />
        
      </Environment>
    </>
  );
}
