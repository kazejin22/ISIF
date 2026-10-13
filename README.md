# AIVENTURE

A learning platform about AI-generated media and deepfakes, built for **ISIF 2026**.

| Page | What it does |
|---|---|
| `/` | Landing page |
| `/learning` | Core modules, interactive "Anatomy of a Fake" slider, curated PDF modules, video explainers |
| `/detector` | Media scanner (image, video, audio) and AI text scanner (`/detector#text`), each explaining its evidence |
| `/map` | 3D globe of documented deepfake incidents, each linked to a news report or fact-check |
| `/game` | Deepfake Detective: four missions inspired by real cases, with an online leaderboard |
| `/game/vr/lab`, `/game/vr/firewall` | WebXR missions for Meta Quest (also playable with a mouse) |

The whole site is available in **English and Indonesian** (EN/ID switch in the navbar; the first visit follows the device language).

## Tech stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · three.js / react-three-fiber · @react-three/xr · react-globe.gl · recharts · Prisma 7 + node-postgres (online leaderboard)

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
| `DATABASE_URL` | For the online leaderboard | A `postgres://` connection string. With Supabase, use the **Transaction pooler** URI (port 6543). Without it the leaderboard shows scores saved on the device. |
| `DIRECT_URL` | Recommended with Supabase | The **Session pooler** URI (port 5432), used only at build time to create the table. |

## How the detector works

`POST /api/detect` (see `src/app/api/detect/route.ts` and `src/lib/detect/`):

1. Validates file type and size (12 MB locally, 4.4 MB on Vercel — larger photos are resized in the browser first) and rate-limits each IP (8 scans/minute).
2. Scans the file bytes for provenance metadata: C2PA content credentials, IPTC "AI-generated" tags, generator signatures (Stable Diffusion, ComfyUI, Midjourney, …) and camera EXIF.
3. Sends the media to Gemini with an evidence-first forensic prompt and a strict JSON schema. The model must cite specific locations for every anomaly and may answer **UNCERTAIN** instead of guessing.
4. Normalizes the result without inventing numbers: a verdict that contradicts its own score, or a "fake" verdict with no cited anomaly, is downgraded to UNCERTAIN; metadata that explicitly declares an AI generator overrides the visual verdict. Any adjustment is shown to the user.

AI detection is probabilistic — the UI says so, and failures are shown as errors, never as a verdict.

### Cache and demo results

Both detectors cache results by a SHA-256 of the exact input (in memory, per server instance), so scanning the same file twice doesn't spend quota again. The built-in samples (four photos and three texts, in English and Indonesian) ship with saved results in `src/data/demoResults.json`, so they load instantly even when every model is out of quota. After changing a prompt, delete the affected entries and rebuild them with the dev server running:

```bash
npm run demo:results
```

### Video and audio: checking the words

A lip-synced or voice-cloned clip of a real person usually looks authentic, so speech is judged separately from the picture. Videos are sampled at 3 frames per second for lip-sync checks, and the model reports who speaks, the key quote, whether it is controversial, and whether the mouth matches the audio (`speech`). When a public figure is quoted, `src/lib/detect/factcheck.ts` asks Gemini with Google Search whether reliable sources confirmed or debunked the quote, using the sources Google actually returned:

- debunked → the verdict becomes DEEPFAKE,
- mouth/audio mismatch, or a controversial claim that can't be confirmed → a REAL verdict becomes UNCERTAIN,

and the result shows a Fact Check panel with its sources. Every change is explained in the result.

### Suspicious areas

For images the model also returns a `box_2d` (`[ymin, xmin, ymax, xmax]`, 0-1000) for each anomaly it can locate. The scanner draws these as numbered boxes over the photo, linked to the findings list. Boxes covering more than 40% of the frame are dropped, since they don't point anywhere useful.

Saved results still play the scan animation for at least 5 seconds, so every scan looks the same.

### Languages

Requests carry `?lang=en|id`. In Indonesian the model writes its explanations in Indonesian, and the notes the server adds itself are translated in `src/lib/detect/localize.ts`.

## How the text detector works

`POST /api/detect-text` (see `src/lib/detect/text.ts` and `textAnalysis.ts`) takes `{ text }` (40 words to 20,000 characters, any language). The UI also accepts `.txt`, `.docx` and `.pdf` files, which are read in the browser.

1. Splits the text into sentences (`Intl.Segmenter` plus abbreviation fixes) and computes a local **writing fingerprint**: burstiness, stock AI phrases (English + Indonesian), personal voice, and vocabulary diversity.
2. Asks Gemini to label **every sentence** as `ai`, `refined` (human ideas, AI paraphrasing) or `human`, with a probability. The prompt has fairness rules: formal, non-native and translated writing are not evidence of AI on their own.
3. Derives the word-weighted breakdown (AI-generated / AI-refined / Human) and the verdict (HUMAN, AI-GENERATED, AI-REFINED, MIXED, UNCERTAIN) from those labels, so the numbers always agree. Confidence is capped at 50% for texts under 150 words.
4. If every model is unavailable, it returns a clearly labeled **statistical estimate** from the fingerprint instead of an error.

### Model reliability

Free-tier Gemini quotas are **per model, per day**. The text detector therefore tries a chain of models (`GEMINI_TEXT_MODELS` to override) with low "thinking" for speed. Models that run out of daily quota are skipped until they reset, and overload (503) and per-minute limits (429) are retried once.

Never use the result alone to accuse someone of using AI.

## Online leaderboard

`GET/POST /api/leaderboard` (`src/app/api/leaderboard/route.ts`, Prisma model `Leaderboard`). Each agent gets a random id stored on the device; the server keeps the best score per agent per mission (web + VR) and ranks agents by the sum. Scores are validated (known mission, 0-1000, rate-limited) but come from the browser, so treat it as a fun leaderboard, not proof.

`npm run build` runs `scripts/prepare-db.mjs` first, which creates the table with `prisma db push` when a `postgres://` URL is set, and skips it otherwise. Locally, run a database with `npx prisma dev -d` and put its `postgres://…:51214/…` URL in `.env.local` as `DATABASE_URL`.

## Translations

- UI copy is written inline with both languages: `t("Scan now", "Pindai sekarang")` (`src/lib/i18n.ts`; `<T en id />` in server components).
- Data copy is translated by its English text in `src/i18n/` (stats, learning, map cases), or by a parallel file with the same ids: `src/game/missions.id.ts` and `src/game/vr/firewallData.id.ts`. Keep these in sync when you edit the English data.

## Data

- `src/data/crimeData.ts` — map incidents. Every entry has a working source link; keep it that way when adding cases (and add the Indonesian text to `src/i18n/cases.ts`).
- `src/data/stats.ts` — statistics shown on the site, each with its source.
- `public/modules/` — curated PDF learning modules.

## Scripts

```bash
npm run dev           # development server
npm run build         # production build
npm run lint          # ESLint
npm run demo:results  # rebuild saved detector results for the samples (needs npm run dev)
npx prisma validate
```

## Deploying to Vercel

1. Push the repository to GitHub, then on [vercel.com](https://vercel.com) choose **Add New → Project** and import it. The defaults for Next.js are correct.
2. Under **Settings → Environment Variables**, add `GEMINI_API_KEY` (and optionally `OPENROUTER_API_KEY`).
3. For the online leaderboard with **Supabase**: in the Supabase dashboard press **Connect**, copy the *Transaction pooler* URI into `DATABASE_URL` and the *Session pooler* URI into `DIRECT_URL` (replace `[YOUR-PASSWORD]` with the database password). The next build creates the table. (Vercel's Supabase or Neon integration sets `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` instead, which also work.) The Supabase publishable/anon key is not needed: the site talks to Postgres from the server only.
4. Deploy (or **Redeploy** after adding variables). The site is served over HTTPS, so the VR missions work directly in the Meta Quest Browser.

Notes: uploads are limited to 4.4 MB on Vercel (`next.config.ts`), the detector routes need up to 180 s (`maxDuration`), and the result cache and rate limiter live in memory per function instance.
