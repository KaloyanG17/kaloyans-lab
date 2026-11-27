import Hero from "@/components/Hero";
import GameIndex from "@/components/GameIndex";

export default function LabIndex() {
  return (
    <>
      <header className="topbar grid">
        <span className="mark">
          K<span className="dot">.</span>L
        </span>
        <a className="meta topbar-link" href="https://github.com/KaloyanG17/kaloyans-lab" target="_blank" rel="noreferrer">
          Source ↗
        </a>
      </header>
      <main>
        <Hero />
        <GameIndex />
      </main>
      <footer className="foot grid">
        <span className="meta c1">© {new Date().getFullYear()} Kaloyan</span>
        <span className="meta c4">
          3D models — <a href="https://polyfork.dev" target="_blank" rel="noreferrer">Polyfork</a>, CC BY 4.0
        </span>
      </footer>
    </>
  );
}
