import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <div className="shell">
        <p className="section-label">
          <span>404</span>
          Off the map
        </p>
        <h1>This page is not part of the system.</h1>
        <p>The useful paths are still here: selected work, the résumé, and a way to get in touch.</p>
        <div className="hero-actions">
          <Link className="button" href="/">
            Return home
          </Link>
          <Link className="button button-ghost" href="/resume/">
            Read the résumé
          </Link>
        </div>
      </div>
    </main>
  );
}
