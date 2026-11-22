/** World layout, in metres (Polyfork assets are real-world scale, Y-up, resting on y = 0). */
export const TABLE_TOP = 0.76;

/** The dice cup is 8 cm across; scale it up to a readable shell. */
export const CUP_SCALE = 2.7;
export const CUP_HEIGHT = 0.09 * CUP_SCALE;
export const CUP_LIFT = 0.22;

export const SLOT_X = [-0.4, 0, 0.4] as const;
export const SLOT_Z = 0.06;

export const PEA_RADIUS = 0.034;
/** Where the pea waits before it is hidden. */
export const PEA_HOME = { x: 0, z: 0.36 } as const;

export const MODELS = {
  cup: "/models/leather-dice-cup-f99a7e.glb",
  table: "/models/gaming-table-5ca9d5.glb",
  coins: "/models/gold-coin-stack-a9ef52.glb",
} as const;
