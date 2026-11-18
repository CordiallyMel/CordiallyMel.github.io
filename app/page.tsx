import Link from "next/link";
import { ContactForm } from "@/app/components/ContactForm";
import { IridescentScene } from "@/app/components/IridescentScene";
import profile from "@/content/profile.json";

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="section-label">
      <span>{index}</span>
      {children}
    </p>
  );
}

function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const external = href.startsWith("http");
  return (
    <a
      className={className}
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export default function HomePage() {
  return (
    <main id="main">
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="kicker">
              <span className="status-dot" aria-hidden="true" />
              {profile.kicker}
            </p>
            <h1>
              I build full-stack systems with a <span className="iridescent-text">researcher&apos;s discipline.</span>
            </h1>
            <p className="hero-lede">{profile.intro}</p>
            <div className="hero-actions">
              <a className="button" href="#work">
                Explore selected work <span aria-hidden="true">↓</span>
              </a>
              <Link className="button button-ghost" href="/resume/">
                Read the résumé
              </Link>
            </div>
            <div className="hero-foot">
              <span>
                <b>Based in</b> {profile.location}
              </span>
              <span>
                <b>Now</b> building SkyQuant&apos;s research desk
              </span>
              <span>
                <b>Open to</b> software engineering, full-stack &amp; data roles
              </span>
            </div>
          </div>

          <div className="hero-art" aria-label="Illustrative 3D price-volume profile across time and price">
            <IridescentScene />

            <div className="glass console-card">
              <div className="console-top">
                <span>Selected system footprint</span>
                <span className="console-state">
                  <i aria-hidden="true" /> evidence first
                </span>
              </div>
              <div className="console-grid">
                {profile.heroStats.map((stat) => (
                  <div className="console-stat" key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                    <small>{stat.detail}</small>
                  </div>
                ))}
              </div>
              <div className="console-foot">
                <span>SPY / QQQ · 1-minute research</span>
                <span>NYC</span>
              </div>
            </div>

            <div className="glass floating-note note-one">
              <span className="note-dot" aria-hidden="true" />
              TypeScript · React · Node · Python
            </div>
            <div className="glass floating-note note-two">
              <span className="note-line" aria-hidden="true" />
              research → execution → evidence
            </div>
          </div>
        </div>

        <div className="shell hero-scroll" aria-hidden="true">
          <span />
          Scroll to the evidence
        </div>
      </section>

      <section className="strip">
        <div className="shell strip-inner">
          <span>Reproducible research</span>
          <i aria-hidden="true" />
          <span>Execution-aware testing</span>
          <i aria-hidden="true" />
          <span>Clear written evidence</span>
          <i aria-hidden="true" />
          <span>Teaching &amp; explanation</span>
        </div>
      </section>

      <section className="section" id="work">
        <div className="shell">
          <div className="section-head" data-reveal>
            <SectionLabel index="01">Selected work</SectionLabel>
            <h2>Systems with evidence behind them.</h2>
            <p>
              I care about the part after the demo: the costs, the edge cases, the failed
              cross-asset test, and the explanation someone else can reproduce.
            </p>
          </div>

          <div className="project-list">
            {profile.projects.map((project, index) => (
              <article
                className={`glass project-card ${index === 0 ? "project-featured" : ""}`}
                key={project.name}
                data-reveal
              >
                <div className="project-head">
                  <span className="project-number">{project.number}</span>
                  <span className="project-eyebrow">{project.eyebrow}</span>
                </div>
                {project.visual && (
                  <figure
                    className={`project-visual ${project.visual.fit === "contain" ? "is-chart" : ""}`}
                  >
                    <img
                      src={project.visual.src}
                      alt={project.visual.alt}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption>
                      <span>{project.visual.caption}</span>
                      <small>{project.visual.note}</small>
                    </figcaption>
                  </figure>
                )}
                <div className="project-body">
                  <div className="project-copy">
                    <h3>{project.name}</h3>
                    <p className="project-summary">{project.summary}</p>
                    <p className="project-description">{project.description}</p>
                    <div className="tag-row">
                      {project.stack.map((item) => (
                        <span className="tag" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="project-metrics">
                    {project.metrics.map((metric) => (
                      <div key={metric.label}>
                        <strong>{metric.value}</strong>
                        <span>{metric.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {project.caseStudy && (
                  <div className="case-study">
                    <div>
                      <span>Problem</span>
                      <p>{project.caseStudy.problem}</p>
                    </div>
                    <div>
                      <span>Built</span>
                      <p>{project.caseStudy.built}</p>
                    </div>
                    <div>
                      <span>Evidence</span>
                      <p>{project.caseStudy.evidence}</p>
                    </div>
                  </div>
                )}
                <div className="project-foot">
                  <ExternalLink className="text-link" href={project.href}>
                    {project.cta} <span aria-hidden="true">↗</span>
                  </ExternalLink>
                  <span className="project-note">
                    {index === 1 ? "Architecture walkthrough available" : "Public evidence"}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="lab-head" data-reveal>
            <h3>Also in the lab</h3>
            <span>Research systems · private parameters</span>
          </div>
          <div className="lab-grid">
            {profile.labProjects.map((project) => (
              <article className="glass lab-card" key={project.name} data-reveal>
                <span className="lab-label">{project.label}</span>
                <h4>{project.name}</h4>
                <p>{project.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-about" id="about">
        <div className="shell about-grid">
          <div className="about-copy" data-reveal>
            <SectionLabel index="02">The operator</SectionLabel>
            <h2>Self-taught by necessity. Rigorous by habit.</h2>
            <p>
              I am an economics student at CUNY and a self-taught engineer in New York. Physics,
              mathematics, economics, and code are the subjects I keep returning to — usually by
              building something that forces me to understand them.
            </p>
            <p>
              Before markets, I taught coding and robotics to K–12 students and designed literacy
              interventions at the New York Public Library. Those jobs taught me how to explain
              complex ideas, document carefully, and stay calm when the stakes are human.
            </p>
            <blockquote>
              My long-term goal is to teach economics. I want the classroom to be grounded in
              systems I have actually built, tested, and had to defend.
            </blockquote>
            <div className="about-actions">
              <Link className="text-link" href="/resume/">
                Full background <span aria-hidden="true">↗</span>
              </Link>
              <ExternalLink className="text-link" href={profile.links.linkedin}>
                LinkedIn <span aria-hidden="true">↗</span>
              </ExternalLink>
            </div>
          </div>

          <div className="glass path-card" data-reveal>
            <span className="path-title">The path so far</span>
            <ol className="path-list">
              <li>
                <span>Now</span>
                <div>
                  <strong>Building SkyQuant</strong>
                  <small>Research, execution, pilot operations</small>
                </div>
              </li>
              <li>
                <span>2024</span>
                <div>
                  <strong>STEM Instructor · CodeAdvantage</strong>
                  <small>Teaching code and robotics to K–12 students</small>
                </div>
              </li>
              <li>
                <span>2022</span>
                <div>
                  <strong>Maker Fellow · MakerState</strong>
                  <small>Scratch, Lego Mindstorms, web development</small>
                </div>
              </li>
              <li>
                <span>2016</span>
                <div>
                  <strong>Literacy Leader · NYPL</strong>
                  <small>Reading interventions and lesson design</small>
                </div>
              </li>
              <li>
                <span>Next</span>
                <div>
                  <strong>Economics professor</strong>
                  <small>Research software, teaching, and public explanation</small>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <div className="shell principles">
          {profile.principles.map((principle, index) => (
            <article className="glass principle" key={principle.title} data-reveal>
              <span className="principle-index">0{index + 1}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="direction">
        <div className="shell">
          <div className="glass direction-card" data-reveal>
            <div className="direction-main">
              <SectionLabel index="03">Direction</SectionLabel>
              <h2>Where I can help a team.</h2>
              <p>
                I am looking for a learning-dense early-career seat in software engineering —
                TypeScript and React in the interface, Python services and SQL behind it, and
                market data as the domain. I would rather own a hard, unglamorous problem than
                ship a shallow feature.
              </p>
              <div className="role-grid">
                {profile.roles.map((role) => (
                  <span className="role" key={role}>
                    {role}
                    <i aria-hidden="true">↗</i>
                  </span>
                ))}
              </div>
              <div className="direction-actions">
                <Link className="button" href="/resume/">
                  Open résumé
                </Link>
                <a className="button button-ghost" href={profile.links.email}>
                  Start a conversation
                </a>
              </div>
            </div>
            <aside className="direction-side">
              <span className="side-label">The long view</span>
              <p>{profile.careerGoal}</p>
              <div className="side-rule" />
              <span className="side-label">Currently</span>
              <ul>
                {profile.now.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="section section-venture" id="skyquant">
        <div className="shell">
          <div className="glass venture-card" data-reveal>
            <div className="venture-copy">
              <SectionLabel index="04">Venture</SectionLabel>
              <h2>Building SkyQuant in public.</h2>
              <p>
                SkyQuant is a research desk built in the right order: a small, company-funded
                pilot first; a clean record second; an anchor-led fund only after the evidence
                exists. No fund exists today.
              </p>
              <div className="venture-steps">
                <div>
                  <strong>01</strong>
                  <span>Pilot</span>
                  <small>$2k–$5k of saved capital, one SPY share, twelve months of statements.</small>
                </div>
                <div>
                  <strong>02</strong>
                  <span>Record</span>
                  <small>Monthly reconciliation, written rules, and a public operating standard.</small>
                </div>
                <div>
                  <strong>03</strong>
                  <span>Fund</span>
                  <small>A proposed $25M–$50M vehicle with 1/10 founders and 1.5/15 standard terms.</small>
                </div>
              </div>
              <div className="venture-actions">
                <ExternalLink className="button" href={profile.links.skyquant}>
                  Visit SkyQuant <span aria-hidden="true">↗</span>
                </ExternalLink>
                <ExternalLink className="button button-ghost" href={profile.links.skyquantInvest}>
                  For investors
                </ExternalLink>
              </div>
              <p className="fine-print">
                Hypothetical research is labeled as such. The pilot is company capital, not a fund
                track record. Nothing here is an offer to sell a security.
              </p>
            </div>
            <div className="venture-mark" aria-hidden="true">
              <span>SkyQ</span>
              <small>research · execution · evidence</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-contact" id="contact">
        <div className="shell contact-grid" data-reveal>
          <div>
            <SectionLabel index="05">Contact</SectionLabel>
            <h2>Let&apos;s build something that holds up.</h2>
            <p>
              For hiring teams, research conversations, or a walkthrough of the SkyQ systems:
              email is the fastest route. I answer personally.
            </p>
          </div>
          <div className="contact-card glass">
            <a className="contact-email" href={profile.links.email}>
              {profile.email}
            </a>
            <div className="contact-links">
              <ExternalLink href={profile.links.github}>GitHub ↗</ExternalLink>
              <ExternalLink href={profile.links.linkedin}>LinkedIn ↗</ExternalLink>
              <Link href="/resume/">Résumé ↗</Link>
              <ExternalLink href={`${profile.links.api}/api/projects`}>Live API ↗</ExternalLink>
            </div>
            <span className="contact-location">{profile.location}</span>
            <ContactForm apiBase={profile.links.api} email={profile.email} />
          </div>
        </div>
      </section>
    </main>
  );
}
