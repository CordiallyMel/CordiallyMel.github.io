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
- A standalone edge Worker for the contact form and live project data

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

## Portfolio API

The contact form and live project endpoint run from `worker/index.js` on a
separate Cloudflare Worker. `content/profile.json` points the site at that API
through `links.api`, currently proxied at `https://api.skyquantcapital.com`.

| Route | Purpose |
| --- | --- |
| `GET /health` | Uptime check |
| `GET /api/projects` | Public project and evidence data |
| `POST /api/contact` | Validated contact submission stored in D1 |
| `GET /api/messages?token=…` | Private message inbox |
| `DELETE /api/messages?token=…&id=…` | Remove a message from the inbox |
| `GET /admin` | Private inbox page for reading and deleting messages |

The Worker needs a D1 binding named `DB` and a `CONTACT_ADMIN_TOKEN` secret.
The token is intentionally not committed. Open `/admin`, enter the token, and
load the inbox; the token is kept in `sessionStorage` for that tab only. Contact
submissions are always stored in D1 first, so a delivery failure never loses a
message.

### Email notifications

Email delivery is optional and uses [Resend](https://resend.com). Set
`RESEND_API_KEY` in the Sites Worker secrets to enable it. The notification goes
to `melsearles99@gmail.com` by default; override the recipient with
`CONTACT_NOTIFY_TO` (comma-separated addresses are accepted) and the sender with
`CONTACT_FROM`. Without `RESEND_API_KEY`, submissions still return success and
remain available in `/admin`.

The default sender, `onboarding@resend.dev`, is only for testing a Resend
account. For production delivery, verify a domain in Resend and set
`CONTACT_FROM` to an address on that domain.

CORS allows the GitHub Pages origin and the local Next.js preview.
