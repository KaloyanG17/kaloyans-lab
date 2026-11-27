"use client";

import { useEffect, useRef } from "react";
import InkText from "./ink/InkText";
import { games } from "@/lib/games";

const pad = (n: number, l = 2) => String(Math.max(0, Math.round(n))).padStart(l, "0");

/** Registration crosshair with a live coordinate readout, for fine pointers only. */
function Crosshair({ area }: { area: React.RefObject<HTMLElement | null> }) {
  const h = useRef<HTMLDivElement>(null);
  const v = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = area.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      const x = e.clientX - b.left;
      const y = e.clientY - b.top;
      el.dataset.cursor = "on";
      if (h.current) h.current.style.transform = `translate3d(0, ${y}px, 0)`;
      if (v.current) v.current.style.transform = `translate3d(${x}px, 0, 0)`;
      if (tag.current) {
        const flip = x > b.width - 140;
        tag.current.style.transform = `translate3d(${flip ? x - 12 : x + 12}px, ${y + 10}px, 0) translateX(${flip ? "-100%" : "0"})`;
        tag.current.textContent = `X ${pad(x, 4)}  Y ${pad(y, 4)}`;
      }
    };
    const leave = () => (el.dataset.cursor = "off");
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", leave, { passive: true });
    return () => {
      window.removeEventListener("scroll", leave);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [area]);

  return (
    <div className="xh" aria-hidden>
      <div ref={h} className="xh-h" />
      <div ref={v} className="xh-v" />
      <div ref={tag} className="xh-tag" />
    </div>
  );
}

export default function Hero() {
  const area = useRef<HTMLElement>(null);
  const live = games.filter((g) => g.status === "live").length;

  return (
    <section ref={area} className="hero" aria-label="Introduction">
      <div className="grid hero-meta">
        <span className="meta c1">Kaloyan&apos;s Lab</span>
        <span className="meta c2">Games &amp; interactive studies</span>
        <span className="meta c3">Vol. 01 — 2026</span>
        <span className="meta c4">
          ({pad(live)}) Live / ({pad(games.length)}) Index
        </span>
      </div>

      <h1 className="hero-title">
        <span className="hero-line">
          <InkText text="Kaloyan's" brush intro />
        </span>
        <span className="hero-line">
          <InkText text="Lab" brush intro introDelay={420} />
          <span className="pea" aria-hidden />
        </span>
      </h1>

      <div className="grid hero-foot">
        <p className="hero-lede c1">
          Small games and interactive pieces, built with care. Each one a study in motion, feel and finish.
        </p>
        <dl className="spec c3">
          <div>
            <dt>Type</dt>
            <dd>Inter Tight 700</dd>
          </div>
          <div>
            <dt>Grid</dt>
            <dd>12 col / 28 gutter</dd>
          </div>
          <div>
            <dt>Ink</dt>
            <dd>
              <i className="swatch" /> #FF3B1F
            </dd>
          </div>
        </dl>
        <a className="meta c4 hero-down" href="#index">
          Index ↓
        </a>
      </div>

      <Crosshair area={area} />
    </section>
  );
}
