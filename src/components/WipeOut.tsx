"use client";

import { useEffect, useState } from "react";
import { clearWipe, peekWipe } from "./transition";

/** Drains the red wipe away when a page is reached through a transition. */
export default function WipeOut() {
  const [state, setState] = useState<"idle" | "full" | "out">("idle");
  useEffect(() => {
    if (!peekWipe()) return;
    setState("full");
    document.querySelectorAll(".wipe").forEach((n) => n.remove());
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setState("out")));
    const done = setTimeout(() => {
      clearWipe();
      setState("idle");
    }, 1200);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(done);
    };
  }, []);
  if (state === "idle") return null;
  return <div className={`wipe-out ${state === "out" ? "is-out" : ""}`} aria-hidden />;
}
