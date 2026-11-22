"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { games } from "@/lib/games";
import { startWipe } from "./transition";

const pad = (n: number) => String(n).padStart(2, "0");
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/<>01_";

/** Scrambles through glyphs and locks in left to right, like a value being decoded. */
function useDecode(text: string) {
  const [shown, setShown] = useState(text);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  const run = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    clearInterval(timer.current);
    let frame = 0;
    const total = text.length * 2;
    timer.current = setInterval(() => {
      frame++;
      if (frame > total) {
        clearInterval(timer.current);
        setShown(text);
        return;
      }
      setShown(
        [...text]
          .map((c, i) => (c === " " || i < frame / 2 ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(""),
      );
    }, 32);
  };

  useEffect(() => () => clearInterval(timer.current), []);
  return [shown, run] as const;
}

function Row({ index, slug, title, tags, year, live }: { index: number; slug: string; title: string; tags: string[]; year: number; live: boolean }) {
  const router = useRouter();
  const [shown, decode] = useDecode(title);
  return (
    <li>
      <a
        href={live ? `/games/${slug}` : undefined}
        className={`row ${live ? "is-live" : "is-soon"}`}
        aria-disabled={!live}
        aria-label={live ? `Play ${title}` : undefined}
        onPointerEnter={() => live && decode()}
        onFocus={() => live && decode()}
        onClick={(e) => {
          e.preventDefault();
          if (!live) return;
          startWipe(e.clientX, e.clientY, () => router.push(`/games/${slug}`));
        }}
      >
        <span className="row-spacer" aria-hidden />
        <span className="row-no">{pad(index + 1)}</span>
        <span className="row-title" aria-hidden={live}>
          {live ? shown : "In the lab"}
        </span>
        <span className="row-meta hide-sm">{tags.join(" / ")}</span>
        <span className="row-meta hide-sm">{year}</span>
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

/** Swiss index of games. Hover decodes the title while red ink sweeps through it. */
export default function GameIndex() {
  return (
    <section className="index" aria-label="Games">
      <header className="index-head">
        <span className="meta">Index</span>
        <span className="meta">No.</span>
        <span className="meta">Title</span>
        <span className="meta hide-sm">Discipline</span>
        <span className="meta hide-sm">Year</span>
        <span className="meta">Status</span>
      </header>
      <ol className="rows">
        {games.map((g, i) => (
          <Row
            key={g.slug}
            index={i}
            slug={g.slug}
            title={g.title}
            tags={g.tags}
            year={g.year}
            live={g.status === "live"}
          />
        ))}
      </ol>
    </section>
  );
}
