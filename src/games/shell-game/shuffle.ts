import { SLOT_X, SLOT_Z } from "./config";

export interface Swap {
  /** seconds from shuffle start */
  start: number;
  duration: number;
  /** slot indices being exchanged */
  a: number;
  b: number;
}

export const SHUFFLE_SECONDS = 5;

/**
 * Builds an honest shuffle: a list of pairwise slot swaps that fills
 * SHUFFLE_SECONDS, starting slow and accelerating.
 */
export function makeSchedule(rand: () => number = Math.random): Swap[] {
  const swaps: Swap[] = [];
  let t = 0.15;
  let last = "";
  while (true) {
    const progress = t / SHUFFLE_SECONDS;
    const duration = 0.62 - 0.36 * Math.min(1, progress * 1.4);
    if (t + duration > SHUFFLE_SECONDS) break;
    let a = 0;
    let b = 0;
    let key = "";
    // avoid repeating the exact same swap twice in a row (it would look like a no-op)
    do {
      a = Math.floor(rand() * 3);
      b = (a + 1 + Math.floor(rand() * 2)) % 3;
      key = [a, b].sort().join();
    } while (key === last);
    last = key;
    swaps.push({ start: t, duration, a, b });
    t += duration + 0.02;
  }
  return swaps;
}

const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

export interface CupPose {
  x: number;
  z: number;
  /** -1..1 lean in the direction of travel, for a touch of physicality */
  lean: number;
}

/**
 * Pure function of time: where every cup is at `t` seconds into the
 * shuffle. `slotOf[cup]` is the slot each cup started in.
 */
export function poseAt(slotOf: number[], schedule: Swap[], t: number): { poses: CupPose[]; slotOf: number[] } {
  const slots = [...slotOf];
  const poses: CupPose[] = slots.map((s) => ({ x: SLOT_X[s], z: SLOT_Z, lean: 0 }));

  for (const sw of schedule) {
    const end = sw.start + sw.duration;
    if (t >= end) {
      for (let c = 0; c < 3; c++) {
        if (slots[c] === sw.a) slots[c] = sw.b;
        else if (slots[c] === sw.b) slots[c] = sw.a;
      }
      continue;
    }
    if (t < sw.start) break;

    const raw = (t - sw.start) / sw.duration;
    const p = easeInOut(raw);
    for (let c = 0; c < 3; c++) {
      const from = slots[c];
      if (from !== sw.a && from !== sw.b) continue;
      const to = from === sw.a ? sw.b : sw.a;
      const x0 = SLOT_X[from];
      const x1 = SLOT_X[to];
      const span = Math.abs(x1 - x0);
      const dir = Math.sign(x1 - x0);
      // the cup travelling right passes in front, the other behind
      const depth = 0.11 * (span / (SLOT_X[1] - SLOT_X[0]));
      poses[c] = {
        x: x0 + (x1 - x0) * p,
        z: SLOT_Z + dir * depth * Math.sin(Math.PI * p),
        lean: dir * Math.sin(Math.PI * raw),
      };
    }
    break;
  }

  // poses for cups not mid-swap must reflect swaps already applied
  for (let c = 0; c < 3; c++) {
    const active = schedule.find((sw) => t >= sw.start && t < sw.start + sw.duration);
    const moving = active && (slots[c] === active.a || slots[c] === active.b);
    if (!moving) poses[c] = { x: SLOT_X[slots[c]], z: SLOT_Z, lean: 0 };
  }

  return { poses, slotOf: slots };
}
