"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, SoftShadows, Sparkles, useCursor, useGLTF } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";
import {
  CUP_HEIGHT,
  CUP_LIFT,
  CUP_SCALE,
  MODELS,
  PEA_HOME,
  PEA_RADIUS,
  SLOT_X,
  SLOT_Z,
  TABLE_TOP,
} from "./config";
import { poseAt, SHUFFLE_SECONDS, type CupPose } from "./shuffle";
import { isRaised, useShellGame } from "./store";

/** Live cup poses written once per frame by <ShuffleDriver/>, read by cups and the pea. */
const live: CupPose[] = SLOT_X.map((x) => ({ x, z: SLOT_Z, lean: 0 }));
/** Lift above the felt, on a spring. Cups start high and drop in when the page opens. */
const liveLift = [0, 1, 2].map(() => ({ v: 2.4, vel: 0 }));
const DROP_DELAY = 0.9;

function enableShadows(root: THREE.Object3D) {
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return root;
}

function ShuffleDriver() {
  const finishShuffle = useShellGame((s) => s.finishShuffle);
  useFrame(() => {
    const s = useShellGame.getState();
    if (s.phase === "shuffling") {
      const t = performance.now() / 1000 - s.shuffleStartedAt;
      const { poses, slotOf } = poseAt(s.slotOf, s.schedule, t);
      poses.forEach((p, i) => Object.assign(live[i], p));
      if (t >= SHUFFLE_SECONDS) finishShuffle(slotOf);
    } else {
      s.slotOf.forEach((slot, i) => Object.assign(live[i], { x: SLOT_X[slot], z: SLOT_Z, lean: 0 }));
    }
  });
  return null;
}

function Table() {
  const { scene } = useGLTF(MODELS.table);
  const table = useMemo(() => enableShadows(scene.clone(true)), [scene]);
  return <primitive object={table} />;
}

function Coins() {
  const { scene } = useGLTF(MODELS.coins);
  const stacks = useMemo(
    () =>
      [
        { p: [0.68, TABLE_TOP, -0.34], r: 0.4, s: 1 },
        { p: [0.76, TABLE_TOP, -0.24], r: 1.2, s: 1.2 },
        { p: [-0.72, TABLE_TOP, -0.3], r: 2.1, s: 1.1 },
      ].map((c) => ({ ...c, obj: enableShadows(scene.clone(true)) })),
    [scene],
  );
  return (
    <>
      {stacks.map((c, i) => (
        <primitive key={i} object={c.obj} position={c.p} rotation-y={c.r} scale={c.s} />
      ))}
    </>
  );
}

function Cup({ index }: { index: number }) {
  const { scene } = useGLTF(MODELS.cup);
  const cup = useMemo(() => enableShadows(scene.clone(true)), [scene]);
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);

  const phase = useShellGame((s) => s.phase);
  const raised = useShellGame((s) => isRaised(s, index));
  const peaCup = useShellGame((s) => s.peaCup);
  const pickCup = useShellGame((s) => s.pickCup);
  const revealed = useShellGame((s) => s.revealed.includes(index));

  const bornAt = useRef(-1);
  // re-arm the drop-in every time the game opens
  useEffect(() => {
    liveLift[index].v = 2.4;
    liveLift[index].vel = 0;
  }, [index]);

  const clickable =
    phase === "hide" || phase === "won" || (phase === "guess" && !revealed);
  const isWinner = phase === "won" && peaCup === index;
  useCursor(hovered && clickable);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const pose = live[index];
    const hoverLift = hovered && clickable && !raised ? 0.035 : 0;
    const targetLift = raised ? CUP_LIFT + (isWinner ? 0.1 : 0) : hoverLift;
    const L = liveLift[index];
    if (bornAt.current < 0) bornAt.current = state.clock.elapsedTime;
    if (state.clock.elapsedTime - bornAt.current > DROP_DELAY + index * 0.14) {
      // underdamped spring: lands with a small bounce. Fixed substeps keep it
      // stable and on time even when the frame rate drops.
      let left = Math.min(dt, 0.25);
      while (left > 0) {
        const h = Math.min(left, 1 / 240);
        L.vel += (170 * (targetLift - L.v) - 13 * L.vel) * h;
        L.v = Math.max(0, L.v + L.vel * h);
        left -= h;
      }
    }
    const lift = L.v;

    g.position.set(pose.x, TABLE_TOP + CUP_HEIGHT + lift, pose.z);
    // a little tilt while sliding, and a tip back toward the player when lifted
    const tiltX = -Math.min(lift / CUP_LIFT, 1) * 0.32;
    easing.damp(g.rotation, "z", -pose.lean * 0.12, 0.08, dt);
    easing.damp(g.rotation, "x", Math.PI + tiltX, 0.1, dt);
    if (isWinner) g.rotation.y += dt * 1.6;
    else easing.damp(g.rotation, "y", index * 0.7, 0.3, dt);

    if (glow.current) {
      const pulse = isWinner ? 0.35 + Math.sin(state.clock.elapsedTime * 5) * 0.15 : hovered && clickable ? 0.25 : 0;
      easing.damp(glow.current, "intensity", pulse, 0.15, dt);
    }
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  };

  return (
    <group
      ref={group}
      onPointerOver={onOver}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (clickable) pickCup(index);
      }}
    >
      {/* flipped dice cup: model origin sits on its base, so it hangs below the group once rotated */}
      <primitive object={cup} scale={CUP_SCALE} />
      <pointLight ref={glow} color="#ffd98a" intensity={0} distance={0.9} position={[0, CUP_HEIGHT * 0.3, 0.2]} />
    </group>
  );
}

function Pea() {
  const mesh = useRef<THREE.Mesh>(null);
  const pos = useRef(new THREE.Vector3(PEA_HOME.x, TABLE_TOP + PEA_RADIUS, PEA_HOME.z));
  const target = useMemo(() => new THREE.Vector3(), []);
  const last = useMemo(() => new THREE.Vector3(), []);
  const won = useShellGame((s) => s.phase === "won");

  useFrame((state, dt) => {
    const m = mesh.current;
    if (!m) return;
    const s = useShellGame.getState();
    const y = TABLE_TOP + PEA_RADIUS;
    if (s.peaCup === null) target.set(PEA_HOME.x, y, PEA_HOME.z);
    else target.set(live[s.peaCup].x, y, live[s.peaCup].z);

    last.copy(pos.current);
    if (s.phase === "shuffling") pos.current.copy(target);
    else easing.damp3(pos.current, target, 0.22, dt);

    // roll: rotate around the axis perpendicular to travel
    const dx = pos.current.x - last.x;
    const dz = pos.current.z - last.z;
    m.rotation.z -= dx / PEA_RADIUS;
    m.rotation.x += dz / PEA_RADIUS;

    const bounce = won ? Math.abs(Math.sin(state.clock.elapsedTime * 5)) * 0.06 : 0;
    m.position.set(pos.current.x, pos.current.y + bounce, pos.current.z);
  });

  return (
    <mesh ref={mesh} castShadow>
      <sphereGeometry args={[PEA_RADIUS, 48, 48]} />
      <meshPhysicalMaterial
        color="#e8d9a8"
        roughness={0.18}
        metalness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.08}
        emissive="#ffcf6b"
        emissiveIntensity={won ? 0.55 : 0.04}
      />
    </mesh>
  );
}

function WinSparkles() {
  const won = useShellGame((s) => s.phase === "won");
  const peaCup = useShellGame((s) => s.peaCup);
  const slotOf = useShellGame((s) => s.slotOf);
  if (!won || peaCup === null) return null;
  return (
    <Sparkles
      position={[SLOT_X[slotOf[peaCup]], TABLE_TOP + 0.22, SLOT_Z]}
      count={36}
      scale={[0.32, 0.3, 0.32]}
      size={2.5}
      speed={0.6}
      color="#ffd98a"
    />
  );
}

/** Gentle parallax that follows the pointer, keeping the table framed. */
function CameraRig() {
  const { camera, pointer, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(0, TABLE_TOP + 0.02, 0.04), []);

  // Fit the play area (three cups + margin) to the screen width on any aspect ratio.
  const base = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    cam.fov = aspect < 1 ? 52 : 36;
    cam.updateProjectionMatrix();
    const halfH = Math.atan(Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * aspect);
    const dist = Math.max(2.25, 0.68 / Math.tan(halfH));
    const dir = new THREE.Vector3(0, 0.62, 1).normalize();
    return look.clone().addScaledVector(dir, dist);
  }, [camera, size.width, size.height, look]);

  useEffect(() => {
    camera.position.copy(base);
  }, [camera, base]);
  useFrame((_, dt) => {
    easing.damp3(camera.position, [base.x + pointer.x * 0.18, base.y + pointer.y * 0.08, base.z], 0.6, dt);
    camera.lookAt(look);
  });
  return null;
}

export default function Scene() {
  return (
    <>
      <color attach="background" args={["#e4e2dc"]} />
      <fog attach="fog" args={["#e4e2dc", 3.6, 9]} />

      <SoftShadows size={18} samples={8} focus={0.6} />
      <ShuffleDriver />
      <CameraRig />

      <hemisphereLight args={["#ffffff", "#cfc8bb", 1.1]} />
      <ambientLight intensity={0.15} />
      <spotLight
        position={[0.3, 3.2, 0.9]}
        angle={0.55}
        penumbra={0.85}
        intensity={30}
        color="#fff1d6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      <pointLight position={[-1.6, 1.4, -1]} intensity={2} color="#ff6a4d" />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.5} position={[0, 4, 1]} scale={[4, 1, 1]} color="#fff3dc" />
        <Lightformer form="rect" intensity={1.2} position={[-3, 1.5, 2]} scale={[2, 2, 1]} color="#ffd9a0" />
        <Lightformer form="ring" intensity={1.5} position={[3, 2, -2]} scale={1.5} color="#8fa2ff" />
      </Environment>

      <group>
        <Table />
        <Coins />
        {[0, 1, 2].map((i) => (
          <Cup key={i} index={i} />
        ))}
        <Pea />
        <WinSparkles />
      </group>

      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#dddad3" roughness={1} />
      </mesh>
      <ContactShadows position={[0, 0.001, 0]} opacity={0.45} scale={5} blur={2.8} far={1} />
    </>
  );
}

useGLTF.preload(MODELS.cup);
useGLTF.preload(MODELS.table);
useGLTF.preload(MODELS.coins);
