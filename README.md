# AIVENTURE

A learning platform about AI-generated media and deepfakes, built for **ISIF 2026**.

| Page | What it does |
|---|---|
| `/` | Landing page |
| `/learning` | Core modules, interactive "Anatomy of a Fake" slider, curated PDF modules, video explainers |
| `/detector` | Upload an image, video or audio clip; an AI model analyzes it and explains its evidence |
| `/map` | 3D globe of documented deepfake incidents, each linked to a news report or fact-check |
| `/game` | Interactive mission (coming soon) |

## Tech stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · three.js / react-three-fiber · react-globe.gl · recharts · Prisma 7 (PostgreSQL, reserved for the upcoming game leaderboard)

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the keys
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Yes (for the detector) | Google Gemini — analyzes images, video and audio |
| `OPENROUTER_API_KEY` | No | Fallback for **images only** when Gemini is unavailable |
| `GEMINI_MODELS` | No | Comma-separated override of the Gemini model order |
| `OPENROUTER_MODELS` | No | Comma-separated override of the OpenRouter fallback models |
| `DATABASE_URL` | Only for Prisma | PostgreSQL connection string (read by `prisma.config.ts`) |

## How the detector works

`POST /api/detect` (see `src/app/api/detect/route.ts` and `src/lib/detect/`):

1. Validates file type and size (12 MB max) and rate-limits each IP (8 scans/minute).
2. Scans the file bytes for provenance metadata: C2PA content credentials, IPTC "AI-generated" tags, generator signatures (Stable Diffusion, ComfyUI, Midjourney, …) and camera EXIF.
3. Sends the media to Gemini with an evidence-first forensic prompt and a strict JSON schema. The model must cite specific locations for every anomaly and may answer **UNCERTAIN** instead of guessing.
4. Normalizes the result without inventing numbers: a verdict that contradicts its own score, or a "fake" verdict with no cited anomaly, is downgraded to UNCERTAIN; metadata that explicitly declares an AI generator overrides the visual verdict. Any adjustment is shown to the user.

AI detection is probabilistic — the UI says so, and failures are shown as errors, never as a verdict.

## Data

- `src/data/crimeData.ts` — map incidents. Every entry has a working source link; keep it that way when adding cases.
- `src/data/stats.ts` — statistics shown on the site, each with its source.
- `public/modules/` — curated PDF learning modules.

## Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run lint    # ESLint
npx prisma validate
```
