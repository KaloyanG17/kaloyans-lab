import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makeSchedule, type Swap } from "./shuffle";

export type Phase =
  | "hide" //      cups up, waiting for the player to pick where the pea goes
  | "hiding" //    pea rolling under the chosen cup, cups coming down
  | "ready" //     cups down, waiting for Shuffle
  | "shuffling" // 5 s of swaps
  | "guess" //     player picks cups until the pea is found
  | "won"; //      pea found

interface Stats {
  played: number;
  wins: number;
  streak: number;
  bestStreak: number;
}

interface GameState extends Stats {
  phase: Phase;
  /** which cup (0..2) the pea is under, null while it waits on the felt */
  peaCup: number | null;
  /** slotOf[cup] = slot index 0..2 the cup currently stands in */
  slotOf: number[];
  /** cups lifted during the guessing phase */
  revealed: number[];
  guesses: number;
  cupsDown: boolean;
  schedule: Swap[];
  shuffleStartedAt: number;

  pickCup: (cup: number) => void;
  shuffle: () => void;
  finishShuffle: (slotOf: number[]) => void;
  resetStats: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | undefined;

export const useShellGame = create<GameState>()(
  persist(
    (set, get) => ({
      played: 0,
      wins: 0,
      streak: 0,
      bestStreak: 0,

      phase: "hide",
      peaCup: null,
      slotOf: [0, 1, 2],
      revealed: [],
      guesses: 0,
      cupsDown: false,
      schedule: [],
      shuffleStartedAt: 0,

      pickCup: (cup) => {
        const s = get();
        if (s.phase === "hide" || s.phase === "won") {
          // Hiding the pea starts a new game.
          clearTimeout(hideTimer);
          set({
            phase: "hiding",
            peaCup: cup,
            revealed: [],
            guesses: 0,
            cupsDown: false,
            played: s.played + 1,
          });
          hideTimer = setTimeout(() => {
            set({ cupsDown: true });
            hideTimer = setTimeout(() => set({ phase: "ready" }), 550);
          }, 850);
          return;
        }

        if (s.phase === "guess") {
          if (s.revealed.includes(cup)) return;
          const guesses = s.guesses + 1;
          const revealed = [...s.revealed, cup];
          if (cup === s.peaCup) {
            const firstTry = guesses === 1;
            const streak = firstTry ? s.streak + 1 : 0;
            set({
              phase: "won",
              revealed,
              guesses,
              wins: s.wins + (firstTry ? 1 : 0),
              streak,
              bestStreak: Math.max(s.bestStreak, streak),
            });
          } else {
            set({ revealed, guesses });
          }
        }
      },

      shuffle: () => {
        if (get().phase !== "ready") return;
        set({
          phase: "shuffling",
          schedule: makeSchedule(),
          shuffleStartedAt: performance.now() / 1000,
        });
      },

      finishShuffle: (slotOf) => {
        if (get().phase !== "shuffling") return;
        set({ phase: "guess", slotOf, schedule: [] });
      },

      resetStats: () => set({ played: 0, wins: 0, streak: 0, bestStreak: 0 }),
    }),
    {
      name: "kaloyans-lab:shell-game",
      partialize: (s) => ({ played: s.played, wins: s.wins, streak: s.streak, bestStreak: s.bestStreak }),
    },
  ),
);

/** Is this cup lifted off the felt right now? */
export function isRaised(s: Pick<GameState, "phase" | "cupsDown" | "revealed">, cup: number) {
  if (s.phase === "hide" || s.phase === "won") return true;
  if (s.phase === "hiding") return !s.cupsDown;
  return s.revealed.includes(cup);
}
