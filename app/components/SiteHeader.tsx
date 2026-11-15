import Link from "next/link";

const navItems = [
  { href: "/#work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/#direction", label: "Direction" },
  { href: "/#skyquant", label: "SkyQuant" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="Mel Searles home">
          <span className="brand-mark" aria-hidden="true">
            MS
          </span>
          <span className="brand-copy">
            <strong>Mel Searles</strong>
            <span>markets · code · economics</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="button button-small header-cta" href="/resume/">
          Résumé <span aria-hidden="true">↗</span>
        </Link>

        <details className="mobile-menu">
          <summary aria-label="Open menu">
            <span />
            <span />
          </summary>
          <nav aria-label="Mobile">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/resume/">Résumé</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
