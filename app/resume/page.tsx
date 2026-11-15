import type { Metadata } from "next";
import Link from "next/link";
import profile from "@/content/profile.json";

export const metadata: Metadata = {
  title: "Résumé",
  description:
    "Melchezidek Searles — self-taught software engineer and economics student in New York. Python, SQL, TypeScript, market systems, and research.",
  alternates: {
    canonical: "/resume/",
  },
};

export default function ResumePage() {
  return (
    <main id="main" className="resume-page">
      <div className="shell resume-toolbar">
        <Link className="back-link" href="/">
          ← Back to portfolio
        </Link>
        <div className="resume-toolbar-actions">
          <span>Single-page PDF · ATS-friendly text</span>
          <a className="button button-small" href="/Mel-Searles-Resume.pdf" download>
            Download PDF <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      <article className="resume-sheet">
        <header className="resume-header">
          <div>
            <p className="resume-kicker">New York, NY · Open to early-career roles</p>
            <h1>{profile.name}</h1>
            <p className="resume-title">
              Software engineer · market systems · economics student
            </p>
          </div>
          <div className="resume-contact">
            <a href={profile.links.email}>{profile.email}</a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
              linkedin.com/in/melchezidek-searles
            </a>
            <a href={profile.links.github} target="_blank" rel="noreferrer">
              github.com/CordiallyMel
            </a>
            <span>{profile.phone}</span>
          </div>
        </header>

        <section className="resume-section">
          <h2>Summary</h2>
          <p>{profile.resumeSummary}</p>
        </section>

        <section className="resume-section">
          <h2>Skills</h2>
          <div className="resume-skills">
            {profile.skills.map((group) => (
              <div key={group.group}>
                <h3>{group.group}</h3>
                <p>{group.items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="resume-section">
          <h2>Selected projects</h2>
          <div className="resume-projects">
            {profile.projects.map((project) => (
              <article key={project.name}>
                <div className="resume-project-head">
                  <h3>{project.name}</h3>
                  <span>{project.eyebrow}</span>
                </div>
                <p>{project.summary}</p>
                <p className="resume-project-metrics">
                  {project.metrics.map((metric) => `${metric.value} ${metric.label}`).join("  ·  ")}
                </p>
                <p className="resume-project-stack">{project.stack.join(" · ")}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="resume-section">
          <h2>Experience</h2>
          <div className="resume-experience">
            {profile.experience.map((job) => (
              <article key={`${job.company}-${job.role}`}>
                <div className="resume-role-head">
                  <div>
                    <h3>
                      {job.role} <span>· {job.company}</span>
                    </h3>
                    <p className="resume-place">{job.location}</p>
                  </div>
                  <span className="resume-period">{job.period}</span>
                </div>
                <ul>
                  {job.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="resume-section">
          <h2>Education</h2>
          <div className="resume-education">
            {profile.education.map((school) => (
              <article key={school.school}>
                <div className="resume-role-head">
                  <div>
                    <h3>{school.school}</h3>
                    <p className="resume-place">{school.credential}</p>
                  </div>
                  <span className="resume-period">{school.period}</span>
                </div>
                <p>{school.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="resume-section resume-direction">
          <h2>Direction</h2>
          <p>{profile.careerGoal}</p>
          <div className="resume-role-list">
            {profile.roles.map((role) => (
              <span key={role}>{role}</span>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
