# AIVENTURE

A learning platform about AI-generated media and deepfakes, built for **ISIF 2026**.

| Page | What it does |
|---|---|
| `/` | Landing page |
| `/learning` | Core modules, interactive "Anatomy of a Fake" slider, curated PDF modules, video explainers, AI text detector |
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

## How the text detector works

`POST /api/detect-text` (see `src/lib/detect/text.ts` and `textAnalysis.ts`) takes `{ text }` (40 words to 20,000 characters, any language). The UI also accepts `.txt`, `.docx` and `.pdf` files, which are read in the browser.

1. Splits the text into sentences (`Intl.Segmenter` plus abbreviation fixes) and computes a local **writing fingerprint**: burstiness, stock AI phrases (English + Indonesian), personal voice, and vocabulary diversity.
2. Asks Gemini to label **every sentence** as `ai`, `refined` (human ideas, AI paraphrasing) or `human`, with a probability. The prompt has fairness rules: formal, non-native and translated writing are not evidence of AI on their own.
3. Derives the word-weighted breakdown (AI-generated / AI-refined / Human) and the verdict (HUMAN, AI-GENERATED, AI-REFINED, MIXED, UNCERTAIN) from those labels, so the numbers always agree. Confidence is capped at 50% for texts under 150 words.
4. If every model is unavailable, it returns a clearly labeled **statistical estimate** from the fingerprint instead of an error.

### Model reliability

Free-tier Gemini quotas are **per model, per day**. The text detector therefore tries a chain of models (`GEMINI_TEXT_MODELS` to override) with low "thinking" for speed. Models that run out of daily quota are skipped until they reset, and overload (503) and per-minute limits (429) are retried once.

Never use the result alone to accuse someone of using AI.

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
