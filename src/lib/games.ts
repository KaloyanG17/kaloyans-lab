export type GameStatus = "live" | "soon";

export interface GameEntry {
  slug: string;
  title: string;
  tagline: string;
  tags: string[];
  status: GameStatus;
  /** Accent used for the card glow on the lab index. */
  accent: string;
  year: number;
}

/**
 * Every experiment in the lab. Add a new entry here and a route under
 * src/app/games/<slug> and it shows up on the index.
 */
export const games: GameEntry[] = [
  {
    slug: "shell-game",
    title: "Shell Game",
    tagline: "Hide the pea, watch the cups dance, and keep your eyes sharp. An honest table — the pea never cheats.",
    tags: ["3D", "React Three Fiber", "Observation"],
    status: "live",
    year: 2026,
    accent: "#ff3b1f",
  },
  {
    slug: "coming-soon-1",
    title: "Next experiment",
    tagline: "Something new is being built in the lab.",
    tags: ["WIP"],
    status: "soon",
    year: 2026,
    accent: "#3d5afe",
  },
  {
    slug: "coming-soon-2",
    title: "Next experiment",
    tagline: "Something new is being built in the lab.",
    tags: ["WIP"],
    status: "soon",
    year: 2026,
    accent: "#e8b94a",
  },
];
