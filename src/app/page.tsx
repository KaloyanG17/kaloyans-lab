import Link from "next/link";
import { games } from "@/lib/games";

const pad = (n: number) => String(n).padStart(2, "0");

export default function LabIndex() {
  const live = games.filter((g) => g.status === "live").length;
  return (
    <>
      <div className="backdrop" aria-hidden>
        <span className="blob blob-a" />
        <span className="blob blob-b" />
        <span className="blob blob-c" />
      </div>
      <div className="gridlines" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} />
        ))}
      </div>

      <main className="lab">
        <header className="lab-header glass glass-pill">
          <span className="lab-mark">
            K<span className="dot">.</span>L
          </span>
          <span className="meta hide-sm">Games &amp; interactive studies</span>
          <a className="meta" href="https://github.com/KaloyanG17/kaloyans-lab" target="_blank" rel="noreferrer">
            Source ↗
          </a>
        </header>

        <section className="lab-hero">
          <div className="hero-meta">
            <span className="meta">Vol. 01</span>
            <span className="meta">
              {pad(live)} live / {pad(games.length)} total
            </span>
          </div>
          <h1>
            Kaloyan&apos;s
            <br />
            Lab<span className="dot">.</span>
          </h1>
          <div className="hero-foot">
            <p className="lab-lede">
              Small games and interactive pieces, built with care. Each one is a study in motion, feel and finish.
            </p>
            <span className="meta scroll-cue">↓ Index</span>
          </div>
        </section>

        <section className="index" aria-label="Games">
          <div className="index-head">
            <span className="meta">Index</span>
            <span className="rule" />
          </div>
          <div className="lab-grid">
            {games.map((g, i) => {
              const body = (
                <>
                  <div className="card-top">
                    <span className="card-index">{pad(i + 1)}</span>
                    <span className={`card-status is-${g.status}`}>{g.status === "live" ? "Play ↗" : "Soon"}</span>
                  </div>
                  <div className="card-body">
                    <h2>{g.title}</h2>
                    <p>{g.tagline}</p>
                  </div>
                  <dl className="card-specs">
                    <div>
                      <dt>Type</dt>
                      <dd>{g.tags.join(" · ")}</dd>
                    </div>
                    <div>
                      <dt>Year</dt>
                      <dd>{g.year}</dd>
                    </div>
                  </dl>
                </>
              );
              const style = { "--accent": g.accent } as React.CSSProperties;
              return g.status === "live" ? (
                <Link key={g.slug} href={`/games/${g.slug}`} className="card glass" style={style}>
                  {body}
                </Link>
              ) : (
                <div key={g.slug} className="card glass is-soon" style={style} aria-disabled>
                  {body}
                </div>
              );
            })}
          </div>
        </section>

        <footer className="lab-footer">
          <span className="meta">© {new Date().getFullYear()} Kaloyan</span>
          <span className="meta">
            3D models — <a href="https://polyfork.dev" target="_blank" rel="noreferrer">Polyfork</a>, CC BY 4.0
          </span>
        </footer>
      </main>
    </>
  );
}
