# Mel Searles — Portfolio

Personal portfolio and résumé for Melchezidek “Mel” Searles: market systems,
software, economics, and the SkyQuant research desk.

Live site: [cordiallymel.github.io](https://cordiallymel.github.io/)

## Stack

- Next.js 16 with a static export
- React 19 + TypeScript
- Hand-built CSS (iridescent glass / holographic visual system)
- Python scripts for the ATS-friendly PDF résumé and the social card
- GitHub Pages deployment through GitHub Actions

## Content

`content/profile.json` is the single source of truth for the site, the web
résumé, and the PDF. Update that file first, then regenerate the PDF and social
card if the facts or copy change.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

The static site is written to `out/`. The GitHub Actions workflow in
`.github/workflows/pages.yml` builds and publishes that directory to Pages on
every push to `main`.

## Generated assets

```bash
python -m pip install -r requirements.txt
python scripts/build_resume.py
python scripts/build_og.py
```

The generated PDF is `public/Mel-Searles-Resume.pdf`; the social card is
`public/og.png`. The social-card script uses the Windows font directory; the
committed image can be replaced independently on another platform.
