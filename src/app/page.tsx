import Hero from "@/components/lens";
import GameIndex from "@/components/GameIndex";

export default function LabIndex() {
  return (
    <>
      <div className="grain" aria-hidden />
      <header className="topbar">
        <span className="mark">
          K<span className="dot">.</span>L
        </span>
        <a className="meta" href="https://github.com/KaloyanG17/kaloyans-lab" target="_blank" rel="noreferrer">
          Source ↗
        </a>
      </header>
      <main>
        <Hero />
        <GameIndex />
      </main>
      <footer className="foot">
        <span className="meta">© {new Date().getFullYear()} Kaloyan</span>
        <span className="meta">
          3D models — <a href="https://polyfork.dev" target="_blank" rel="noreferrer">Polyfork</a>, CC BY 4.0
        </span>
      </footer>
    </>
  );
}
