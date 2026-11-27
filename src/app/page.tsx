import Hero from "@/components/Hero";
import GameIndex from "@/components/GameIndex";

/** The main portfolio; the lab is served at its /lab path. */
const PORTFOLIO_URL = "https://kaloyan.vercel.app";

export default function LabIndex() {
  return (
    <>
      <header className="topbar grid">
        <span className="mark">
          K<span className="dot">.</span>L
        </span>
        <nav className="topbar-links">
          <a className="meta" href={PORTFOLIO_URL}>
            ← Portfolio
          </a>
          <a className="meta" href="https://github.com/KaloyanG17/kaloyans-lab" target="_blank" rel="noreferrer">
            Source ↗
          </a>
        </nav>
      </header>
      <main>
        <Hero />
        <GameIndex />
      </main>
      <footer className="foot grid">
        <span className="meta c1">
          © {new Date().getFullYear()} <a href={PORTFOLIO_URL}>Kaloyan Gaydarov</a>
        </span>
        <span className="meta c4">
          3D models — <a href="https://polyfork.dev" target="_blank" rel="noreferrer">Polyfork</a>, CC BY 4.0
        </span>
      </footer>
    </>
  );
}
