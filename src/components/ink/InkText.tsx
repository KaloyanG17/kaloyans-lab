"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Ink: the lab's one typographic effect.
 *
 * Every letter is an inline-block locked to its own advance width, so
 * swapping glyphs never reflows the line. "Inking" a letter decodes it
 * through a few glyphs while red sweeps through it in the direction of
 * travel; "drying" sweeps it back to black.
 *
 * - brush: letters near the pointer ink, then dry after a hold
 * - active: the whole word inks left to right (index rows)
 * - intro: one left-to-right pass when it first appears
 */

const UPPER = "ABCDEFGHJKLMNPRSTUVWXYZ";
const LOWER = "abcdeghknopqrsuvxyz";
const DIGIT = "0123456789";

function glyphFor(c: string) {
  const set = /[A-Z]/.test(c) ? UPPER : /[a-z]/.test(c) ? LOWER : /\d/.test(c) ? DIGIT : "";
  return set ? set[Math.floor(Math.random() * set.length)] : c;
}

type Dir = "r" | "l";

interface Props {
  text: string;
  className?: string;
  /** ink letters near the pointer */
  brush?: boolean;
  /** ink the whole word, left to right */
  active?: boolean;
  /** play one pass on mount */
  intro?: boolean;
  /** ms before the intro pass starts */
  introDelay?: number;
  /** ms between letters for word-level passes */
  stagger?: number;
  /** how long a brushed letter stays red, ms */
  hold?: number;
}

export default function InkText({ text, className, brush, active, intro, introDelay = 0, stagger = 28, hold = 1400 }: Props) {
  const root = useRef<HTMLSpanElement>(null);
  const chars = useRef<HTMLSpanElement[]>([]);
  const timers = useRef(new Map<HTMLSpanElement, ReturnType<typeof setTimeout>[]>());
  const dryTimers = useRef(new Map<HTMLSpanElement, ReturnType<typeof setTimeout>>());
  const reduced = useRef(false);

  const clearTimers = (el: HTMLSpanElement) => {
    timers.current.get(el)?.forEach(clearTimeout);
    timers.current.set(el, []);
  };
  const later = (el: HTMLSpanElement, ms: number, fn: () => void) => {
    const list = timers.current.get(el) ?? [];
    list.push(setTimeout(fn, ms));
    timers.current.set(el, list);
  };

  const scheduleDry = (el: HTMLSpanElement, ms: number, fn: () => void) => {
    clearTimeout(dryTimers.current.get(el));
    dryTimers.current.set(el, setTimeout(fn, ms));
  };

  const dry = useCallback((el: HTMLSpanElement, dir: Dir) => {
    el.dataset.dir = dir;
    el.classList.remove("is-inked");
  }, []);

  const ink = useCallback(
    (el: HTMLSpanElement, dir: Dir, holdMs: number | null) => {
      const original = el.dataset.c ?? "";
      clearTimers(el);
      clearTimeout(dryTimers.current.get(el));
      el.textContent = original === " " ? "\u00a0" : original;
      el.dataset.dir = dir;
      el.classList.add("is-inked");
      if (!reduced.current && original.trim()) {
        // decode: three quick glyphs, then lock
        [0, 45, 90].forEach((t) => later(el, t, () => (el.textContent = glyphFor(original))));
        later(el, 140, () => (el.textContent = original));
      }
      if (holdMs !== null) scheduleDry(el, holdMs, () => dry(el, dir));
    },
    [dry],
  );

  // lock each letter to its natural width so decoding never reflows the line
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const measure = () => {
      chars.current.forEach((c) => {
        c.style.width = "";
        c.textContent = c.dataset.c === " " ? "\u00a0" : (c.dataset.c ?? "");
      });
      chars.current.forEach((c) => (c.style.width = `${c.getBoundingClientRect().width}px`));
    };
    let ro: ResizeObserver | undefined;
    document.fonts.ready.then(() => {
      measure();
      ro = new ResizeObserver(() => measure());
      ro.observe(el.parentElement ?? el);
    });
    const all = timers.current;
    const drying = dryTimers.current;
    return () => {
      ro?.disconnect();
      all.forEach((list) => list.forEach(clearTimeout));
      drying.forEach(clearTimeout);
    };
  }, [text]);

  // one-time intro pass
  useEffect(() => {
    if (!intro) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      chars.current.forEach((c, i) => {
        setTimeout(() => !cancelled && ink(c, "r", 650 + (chars.current.length - i) * 18), 300 + i * 55);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [intro, introDelay, ink]);

  // word-level pass for index rows
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      if (!active) return;
    }
    const list = chars.current;
    const ids = list.map((c, i) =>
      setTimeout(() => (active ? ink(c, "r", null) : dry(c, "r")), (active ? i : i * 0.6) * stagger),
    );
    return () => ids.forEach(clearTimeout);
  }, [active, stagger, ink, dry]);

  // brush: ink letters the pointer passes over
  useEffect(() => {
    if (!brush) return;
    let lastX = 0;
    let raf = 0;
    let px = 0;
    let py = 0;
    const tick = () => {
      raf = 0;
      const dir: Dir = px >= lastX ? "r" : "l";
      lastX = px;
      for (const c of chars.current) {
        if (!c.dataset.c?.trim()) continue;
        const b = c.getBoundingClientRect();
        const reach = Math.max(b.height * 0.32, 24);
        const dx = Math.max(b.left - px, 0, px - b.right);
        const dy = Math.max(b.top + b.height * 0.15 - py, 0, py - (b.bottom - b.height * 0.1));
        if (Math.hypot(dx, dy) < reach && !c.classList.contains("is-inked")) ink(c, dir, hold);
        else if (c.classList.contains("is-inked") && Math.hypot(dx, dy) < reach) {
          // keep it wet while the brush stays on it
          scheduleDry(c, hold, () => dry(c, dir));
        }
      }
    };
    const move = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
      cancelAnimationFrame(raf);
    };
  }, [brush, hold, ink, dry]);

  chars.current = [];
  return (
    <span ref={root} className={`ink ${className ?? ""}`}>
      <span className="sr-only">{text}</span>
      {[...text].map((c, i) => (
        <span
          key={i}
          aria-hidden
          className="ink-ch"
          data-c={c}
          ref={(el) => {
            if (el) chars.current[i] = el;
          }}
        >
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}
