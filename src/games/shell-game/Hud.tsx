"use client";

import Link from "next/link";
import InkText from "@/components/ink/InkText";
import { useShellGame, type Phase } from "./store";
import { SHUFFLE_SECONDS } from "./shuffle";

const pad = (n: number) => String(n).padStart(2, "0");

function useMessage() {
  const phase = useShellGame((s) => s.phase);
  const guesses = useShellGame((s) => s.guesses);
  switch (phase) {
    case "hide":
      return { title: "Choose a shell", sub: "Pick the shell the pea should hide under." };
    case "hiding":
      return { title: "Hiding the pea", sub: "Watch where it goes." };
    case "ready":
      return { title: "Ready", sub: "Five seconds of shuffling. The pea always travels with its shell." };
    case "shuffling":
      return { title: "Eyes on the pea", sub: "Don't blink." };
    case "guess":
      return guesses === 0
        ? { title: "Where is it?", sub: "Pick a shell to lift it." }
        : { title: "Not there", sub: "Keep looking. The pea is still on the table." };
    case "won":
      return guesses === 1
        ? { title: "First try", sub: "Counted as a win. Pick a shell to play again." }
        : { title: `Found in ${guesses}`, sub: "Only first-try finds count as wins. Pick a shell to play again." };
  }
}

const STEPS: { label: string; phases: Phase[] }[] = [
  { label: "Hide", phases: ["hide", "hiding"] },
  { label: "Shuffle", phases: ["ready", "shuffling"] },
  { label: "Find", phases: ["guess", "won"] },
];

export function HudTop() {
  const phase = useShellGame((s) => s.phase);
  const played = useShellGame((s) => s.played);
  const wins = useShellGame((s) => s.wins);
  const streak = useShellGame((s) => s.streak);
  const best = useShellGame((s) => s.bestStreak);
  const resetStats = useShellGame((s) => s.resetStats);
  const rate = played ? `${Math.round((wins / played) * 100)}%` : "—";

  const stats = [
    { label: "Played", value: pad(played) },
    { label: "Wins", value: pad(wins) },
    { label: "Win rate", value: rate },
    { label: "Streak", value: best > streak ? `${streak}/${best}` : pad(streak) },
  ];

  return (
    <header className="sg-head">
      <div className="grid sg-meta">
        <Link href="/" className="meta sg-back">
          ← Index
        </Link>
        <span className="meta sg-crumb">Keys 1 · 2 · 3 / Space</span>
        <ol className="sg-steps" aria-label="Round">
          {STEPS.map((s, i) => (
            <li key={s.label} className={`meta ${s.phases.includes(phase) ? "is-now" : ""}`}>
              {pad(i + 1)} {s.label}
            </li>
          ))}
        </ol>
        <button className="meta sg-reset" onClick={resetStats} disabled={played === 0}>
          Reset score
        </button>
      </div>

      <div className="grid sg-titlebar">
        <h1 className="sg-title">
          <InkText text="Shell Game" brush intro introDelay={500} />
          <span className="pea" aria-hidden />
        </h1>
        <dl className="sg-stats" aria-label="Score">
          {stats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}

export function HudBottom() {
  const phase = useShellGame((s) => s.phase);
  const shuffle = useShellGame((s) => s.shuffle);
  const shuffleStartedAt = useShellGame((s) => s.shuffleStartedAt);
  const msg = useMessage();

  return (
    <footer className={`sg-foot ${phase === "won" ? "is-won" : ""}`}>
      <div className="sg-rule" aria-hidden>
        {phase === "shuffling" && <span key={shuffleStartedAt} style={{ animationDuration: `${SHUFFLE_SECONDS}s` }} />}
      </div>
      <div className="grid sg-foot-row">
        <div className="sg-status" aria-live="polite">
          <h2 key={msg.title}>
            <InkText text={msg.title} intro />
          </h2>
          <p>{msg.sub}</p>
        </div>
        <button className="sg-cta" onClick={shuffle} disabled={phase !== "ready"} data-visible={phase === "ready"}>
          <span>Shuffle</span>
          <kbd>Space</kbd>
        </button>
      </div>
    </footer>
  );
}

/** Registration marks and a figure caption around the 3D stage. */
export function StageFrame() {
  return (
    <div className="sg-frame" aria-hidden>
      <span className="mark tl" />
      <span className="mark tr" />
      <span className="mark bl" />
      <span className="mark br" />
      <span className="meta sg-fig">Fig. 01 — Table, three shells, one pea</span>
    </div>
  );
}
