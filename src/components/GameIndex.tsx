"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { games, type GameEntry } from "@/lib/games";
import InkText from "./ink/InkText";
import { startWipe } from "./transition";

const pad = (n: number) => String(n).padStart(2, "0");

function Row({ game, index }: { game: GameEntry; index: number }) {
  const router = useRouter();
  const [hot, setHot] = useState(false);
  const live = game.status === "live";

  return (
    <li>
      <a
        href={live ? `/games/${game.slug}` : undefined}
        className={`row grid ${live ? "is-live" : "is-soon"} ${hot ? "is-hot" : ""}`}
        aria-disabled={!live}
        onPointerEnter={() => live && setHot(true)}
        onPointerLeave={() => setHot(false)}
        onFocus={() => live && setHot(true)}
        onBlur={() => setHot(false)}
        onClick={(e) => {
          e.preventDefault();
          if (!live) return;
          startWipe(e.clientX, e.clientY, () => router.push(`/games/${game.slug}`));
        }}
      >
        <span className="row-no">{pad(index + 1)}</span>
        <span className="row-title">
          {live ? <InkText text={game.title} active={hot} stagger={30} /> : "In the lab"}
        </span>
        <span className="row-meta row-disc hide-sm">{game.tags.join(" / ")}</span>
        <span className="row-meta row-year hide-sm">{game.year}</span>
        <span className="row-status">
          {live ? (
            <>
              Play <span className="row-arrow">→</span>
            </>
          ) : (
            "Soon"
          )}
        </span>
        <span className="row-rule" aria-hidden />
      </a>
    </li>
  );
}

/** Swiss index of games. Rows share the hero's ink: the title decodes and inks left to right. */
export default function GameIndex() {
  return (
    <section id="index" className="index" aria-label="Games">
      <header className="index-head grid">
        <span className="meta row-no">No.</span>
        <span className="meta row-title">Title</span>
        <span className="meta row-disc hide-sm">Discipline</span>
        <span className="meta row-year hide-sm">Year</span>
        <span className="meta row-status">Status</span>
      </header>
      <ol className="rows">
        {games.map((g, i) => (
          <Row key={g.slug} game={g} index={i} />
        ))}
      </ol>
    </section>
  );
}
