import Link from "next/link";
import profile from "@/content/profile.json";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link className="footer-brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              MS
            </span>
            <span>Mel Searles</span>
          </Link>
          <p>
            Market systems, software, and economics. Built in New York with a bias toward evidence.
          </p>
        </div>
        <div>
          <span className="footer-label">Elsewhere</span>
          <a href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
          <a href={profile.links.skyquant} target="_blank" rel="noreferrer">
            SkyQuant <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div>
          <span className="footer-label">Start here</span>
          <Link href="/resume/">Résumé</Link>
          <Link href="/#work">Selected work</Link>
          <a href={profile.links.email}>Email</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Melchezidek Searles</span>
        <span>Next.js · TypeScript · CSS · Python</span>
      </div>
    </footer>
  );
}
