"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { games } from "@/lib/games";
import { startWipe } from "./transition";

const pad = (n: number) => String(n).padStart(2, "0");

/** Swiss index of games, with a liquid-glass lens that rides the cursor over live rows. */
export default function GameIndex() {
  const router = useRouter();
  const lens = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const el = lens.current;
    if (!el) return;
    let x = 0,
      y = 0,
      tx = 0,
      ty = 0,
      raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      const vx = tx - x;
      const vy = ty - y;
      const s = Math.min(Math.hypot(vx, vy) / 300, 0.35);
      const a = Math.atan2(vy, vx);
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${a}rad) scale(${1 + s}, ${1 - s * 0.5})`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

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
        {games.map((g, i) => {
          const live = g.status === "live";
          return (
            <li key={g.slug}>
              <a
                href={live ? `/games/${g.slug}` : undefined}
                className={`row ${live ? "is-live" : "is-soon"}`}
                aria-disabled={!live}
                onPointerEnter={() => live && setActive(g.slug)}
                onPointerLeave={() => setActive(null)}
                onClick={(e) => {
                  e.preventDefault();
                  if (!live) return;
                  startWipe(e.clientX, e.clientY, () => router.push(`/games/${g.slug}`));
                }}
              >
                <span className="row-fill" aria-hidden />
                <span className="row-spacer" aria-hidden />
                <span className="row-no">{pad(i + 1)}</span>
                <span className="row-title">{live ? g.title : "In the lab"}</span>
                <span className="row-meta hide-sm">{g.tags.join(" / ")}</span>
                <span className="row-meta hide-sm">{g.year}</span>
                <span className="row-status">{live ? "Play" : "Soon"}</span>
              </a>
            </li>
          );
        })}
      </ol>
      <div ref={lens} className={`lens-cursor ${active ? "is-on" : ""}`} aria-hidden>
        <span>Play ↗</span>
      </div>
    </section>
  );
}
