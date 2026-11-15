"""Build the ATS-friendly PDF résumé from the shared profile content.

Run from the portfolio directory:
    py -3.12 scripts/build_resume.py

The generated PDF is committed so the static site can serve it without a
runtime. This keeps résumé facts in one place: ``content/profile.json``.
"""

from __future__ import annotations

import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
PROFILE_PATH = ROOT / "content" / "profile.json"
OUTPUT_PATH = ROOT / "public" / "Mel-Searles-Resume.pdf"

INK = colors.HexColor("#18151f")
MUTED = colors.HexColor("#5f586d")
ACCENT = colors.HexColor("#5b3fc4")
RULE = colors.HexColor("#d8d2df")


def load_profile() -> dict:
    return json.loads(PROFILE_PATH.read_text(encoding="utf-8"))


def ascii_text(value: str) -> str:
    """Keep the generated PDF searchable with the standard PDF fonts."""
    return (
        value.replace("\u00b7", " | ")
        .replace("\u2014", "-")
        .replace("\u2013", "-")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
    )


def p(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(escape(ascii_text(text)), style)


def section(title: str, styles: dict) -> list:
    return [
        Spacer(1, 7),
        Paragraph(title.upper(), styles["section"]),
        HRFlowable(width="100%", thickness=0.7, color=RULE, spaceBefore=1, spaceAfter=5),
    ]


def build() -> None:
    profile = load_profile()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=letter,
        rightMargin=0.52 * inch,
        leftMargin=0.52 * inch,
        topMargin=0.42 * inch,
        bottomMargin=0.38 * inch,
        title=f"{profile['name']} — Résumé",
        author=profile["name"],
        subject="Software engineering, market systems, and economics",
    )

    sample = getSampleStyleSheet()
    styles = {
        "name": ParagraphStyle(
            "Name",
            parent=sample["Normal"],
            fontName="Helvetica-Bold",
            fontSize=23,
            leading=24,
            textColor=INK,
            spaceAfter=2,
        ),
        "title": ParagraphStyle(
            "Title",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=11,
            textColor=MUTED,
        ),
        "contact": ParagraphStyle(
            "Contact",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=8.1,
            leading=10.2,
            textColor=MUTED,
            alignment=TA_RIGHT,
        ),
        "section": ParagraphStyle(
            "Section",
            parent=sample["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.9,
            leading=10,
            textColor=ACCENT,
            spaceAfter=1,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=8.45,
            leading=10.35,
            textColor=INK,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=7.9,
            leading=9.7,
            textColor=MUTED,
        ),
        "job": ParagraphStyle(
            "Job",
            parent=sample["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8.65,
            leading=10.4,
            textColor=INK,
        ),
        "jobsub": ParagraphStyle(
            "JobSub",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=7.9,
            leading=9.6,
            textColor=MUTED,
        ),
        "period": ParagraphStyle(
            "Period",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=7.9,
            leading=9.6,
            textColor=MUTED,
            alignment=TA_RIGHT,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=8.2,
            leading=10,
            leftIndent=10,
            bulletIndent=2,
            textColor=INK,
            spaceAfter=1,
        ),
    }

    story: list = []
    contact = [
        profile["email"],
        "linkedin.com/in/melchezidek-searles",
        "github.com/CordiallyMel",
        profile["phone"],
        profile["location"],
    ]
    header = Table(
        [
            [
                [
                    Paragraph(escape(profile["name"]), styles["name"]),
                    Paragraph(
                        "Software engineer | market systems | economics student",
                        styles["title"],
                    ),
                ],
                Paragraph("<br/>".join(escape(item) for item in contact), styles["contact"]),
            ]
        ],
        colWidths=[4.15 * inch, 2.31 * inch],
    )
    header.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(header)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.1, color=INK, spaceAfter=1))

    story += section("Summary", styles)
    story.append(p(profile["resumeSummary"], styles["body"]))

    story += section("Skills", styles)
    for group in profile["skills"]:
        story.append(
            Paragraph(
                f"<b>{escape(group['group'])}:</b> {escape(' | '.join(group['items']))}",
                styles["body"],
            )
        )

    story += section("Selected projects", styles)
    for project in profile["projects"]:
        metrics = "  |  ".join(f"{item['value']} {item['label']}" for item in project["metrics"])
        story.append(
            Paragraph(
                f"<b>{escape(project['name'])}</b> <font color='#6d667b'>"
                f"| {escape(ascii_text(project['eyebrow']))}</font>",
                styles["job"],
            )
        )
        story.append(p(project["summary"], styles["body"]))
        story.append(Paragraph(escape(metrics), styles["small"]))
        story.append(Paragraph(escape(" | ".join(project["stack"])), styles["small"]))
        story.append(Spacer(1, 3))

    story += section("Experience", styles)
    resume_jobs = [
        job
        for job in profile["experience"]
        if job["company"] in {"CodeAdvantage", "MakerState", "The New York Public Library"}
    ]
    for job in resume_jobs:
        left = [
            Paragraph(escape(job["role"]), styles["job"]),
            Paragraph(
                f"{escape(ascii_text(job['company']))} | {escape(ascii_text(job['location']))}", styles["jobsub"]
            ),
        ]
        table = Table(
            [[left, Paragraph(escape(ascii_text(job["period"])), styles["period"])]],
            colWidths=[5.25 * inch, 1.21 * inch],
            hAlign="LEFT",
        )
        table.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
                ]
            )
        )
        story.append(table)
        for bullet in job["bullets"]:
            story.append(Paragraph(escape(bullet), styles["bullet"], bulletText="•"))
        story.append(Spacer(1, 3))

    story.append(
        Paragraph(
            "<b>Additional experience:</b> Home Health Aide, EZ Living Home Care of NY "
            "(05/2023-05/2025) - direct client care, family coordination, and careful documentation.",
            styles["small"],
        )
    )

    story += section("Education", styles)
    for school in profile["education"]:
        left = [
            Paragraph(escape(school["school"]), styles["job"]),
            Paragraph(escape(school["credential"]), styles["jobsub"]),
        ]
        table = Table(
            [[left, Paragraph(escape(ascii_text(school["period"])), styles["period"])]],
            colWidths=[5.25 * inch, 1.21 * inch],
            hAlign="LEFT",
        )
        table.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
                ]
            )
        )
        story.append(table)
        story.append(p(school["detail"], styles["small"]))
        story.append(Spacer(1, 3))

    story += section("Direction", styles)
    story.append(p(profile["careerGoal"], styles["body"]))
    story.append(Spacer(1, 3))
    story.append(p("Open to: " + " | ".join(profile["roles"]), styles["small"]))

    doc.build(story)
    print(f"wrote {OUTPUT_PATH} ({OUTPUT_PATH.stat().st_size:,} bytes)")


if __name__ == "__main__":
    build()
