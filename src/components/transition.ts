"use client";

/**
 * Liquid page transition: a red disc floods out from the click point,
 * the route changes underneath, and the next page drains it away.
 */
const KEY = "lab:wipe";

export function startWipe(x: number, y: number, go: () => void) {
  const el = document.createElement("div");
  el.className = "wipe";
  el.style.setProperty("--x", `${x}px`);
  el.style.setProperty("--y", `${y}px`);
  document.body.appendChild(el);
  sessionStorage.setItem(KEY, JSON.stringify({ x, y }));
  requestAnimationFrame(() => el.classList.add("is-in"));
  setTimeout(go, 620);
  // the incoming page removes it; this is a safety net
  setTimeout(() => el.remove(), 4000);
}

/** Was this page reached through a wipe? Read-only, so it is safe under StrictMode double effects. */
export function peekWipe(): boolean {
  return sessionStorage.getItem(KEY) !== null;
}

export function clearWipe() {
  sessionStorage.removeItem(KEY);
  document.querySelectorAll(".wipe").forEach((n) => n.remove());
}
