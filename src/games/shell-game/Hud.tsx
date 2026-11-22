"use client";

import Link from "next/link";
import { useShellGame } from "./store";
import { SHUFFLE_SECONDS } from "./shuffle";

function useMessage() {
  const phase = useShellGame((s) => s.phase);
  const guesses = useShellGame((s) => s.guesses);
  switch (phase) {
    case "hide":
      return { title: "Choose a shell", sub: "Click the shell the pea should hide under — or press 1 · 2 · 3" };
    case "hiding":
      return { title: "Hiding the pea…", sub: "Watch where it goes" };
    case "ready":
      return { title: "Ready when you are", sub: "Shuffle for five seconds, then find the pea" };
    case "shuffling":
      return { title: "Eyes on the pea", sub: "Don't blink" };
    case "guess":
      return guesses === 0
        ? { title: "Where's the pea?", sub: "Click a shell to lift it" }
        : { title: "Not under that one", sub: "Keep looking — the pea is still here" };
    case "won":
      return guesses === 1
        ? { title: "First try. Sharp eyes!", sub: "That counts as a win. Pick a shell to play again" }
        : { title: `Found it in ${guesses} guesses`, sub: "Only first-try finds count as wins. Pick a shell to play again" };
  }
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="sg-stat">
      <span className="sg-stat-value">{value}</span>
      <span className="sg-stat-label">{label}</span>
    </div>
  );
}

export default function Hud() {
  const phase = useShellGame((s) => s.phase);
  const shuffle = useShellGame((s) => s.shuffle);
  const played = useShellGame((s) => s.played);
  const wins = useShellGame((s) => s.wins);
  const streak = useShellGame((s) => s.streak);
  const best = useShellGame((s) => s.bestStreak);
  const resetStats = useShellGame((s) => s.resetStats);
  const shuffleStartedAt = useShellGame((s) => s.shuffleStartedAt);
  const msg = useMessage();
  const rate = played ? Math.round((wins / played) * 100) + "%" : "—";

  return (
    <div className="sg-hud">
      <header className="sg-top">
        <div className="sg-left">
          <Link href="/" className="sg-back glass glass-pill">
            <span aria-hidden>←</span> Index
          </Link>
          <div className="sg-title">
            <span className="sg-index kinetic-index">01</span>
            <div>
              <span className="meta">Kaloyan&apos;s Lab / Games</span>
              <h1 className="kinetic" aria-label="Shell Game">
                {"Shell Game".split("").map((ch, i) => (
                  <span key={i} aria-hidden style={{ animationDelay: `${0.5 + i * 0.035}s` }}>
                    {ch === " " ? "\u00a0" : ch}
                  </span>
                ))}
                <span className="dot" aria-hidden style={{ animationDelay: "0.9s" }}>
                  .
                </span>
              </h1>
            </div>
          </div>
        </div>
        <section className="glass sg-stats" aria-label="Score">
          <Stat label="Played" value={played} />
          <Stat label="Wins" value={wins} />
          <Stat label="Win rate" value={rate} />
          <Stat label="Streak" value={`${streak}${best > streak ? ` / ${best}` : ""}`} />
          {played > 0 && (
            <button className="sg-reset" onClick={resetStats} title="Reset score">
              Reset
            </button>
          )}
        </section>
      </header>

      <footer className="sg-bottom">
        <div className={`glass sg-status ${phase === "won" ? "is-won" : ""}`} aria-live="polite" key={msg.title}>
          <h2>{msg.title}</h2>
          <p>{msg.sub}</p>
          {phase === "shuffling" && (
            <div className="sg-progress" key={shuffleStartedAt}>
              <span style={{ animationDuration: `${SHUFFLE_SECONDS}s` }} />
            </div>
          )}
        </div>
        <button className="sg-cta" onClick={shuffle} disabled={phase !== "ready"} data-visible={phase === "ready"}>
          Shuffle <kbd>Space</kbd>
        </button>
      </footer>
    </div>
  );
}
