import { extractJson } from "./normalize";

// Shared model plumbing for the media and text detectors.

const list = (value: string | undefined, fallback: string) =>
  (value ?? fallback).split(",").map((m) => m.trim()).filter(Boolean);

// Free-tier quotas are per model per day, so a longer chain means more daily capacity.
// Overloaded or exhausted models fail fast, so falling through the list is cheap.
export const MEDIA_MODELS = list(process.env.GEMINI_MODELS, "gemini-3.5-flash,gemini-2.5-flash,gemini-flash-latest,gemini-3.1-flash-lite");
export const TEXT_MODELS = list(process.env.GEMINI_TEXT_MODELS, "gemini-3.5-flash,gemini-3.8-flash,gemini-2.5-flash,gemini-flash-latest,gemini-3.5-flash-lite,gemini-3.1-flash-lite");
export const OPENROUTER_MODELS = list(process.env.OPENROUTER_MODELS, "openrouter/free,google/gemma-4-31b-it:free,google/gemma-4-26b-a4b-it:free");

const MAX_CALL_MS = 60_000;
const MIN_CALL_MS = 15_000;

type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string }; video_metadata?: { fps: number } };
type OpenRouterPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

export interface AnalyzeRequest {
  system: string;
  geminiParts: GeminiPart[];
  /** Omit when the input can't be sent to OpenRouter (e.g. video/audio). */
  openRouterContent?: OpenRouterPart[];
  schema: object;
  /** Plain-text schema description for providers without structured output. */
  schemaText: string;
  /** Milliseconds available before the route's own deadline. */
  budgetMs: number;
  models?: string[];
  /** "low" trades a little depth for much faster, more reliable answers. */
  thinking?: "low" | "default";
  maxOutputTokens?: number;
  /** Return false to reject a parsed result and try the next model. */
  validate?: (raw: Record<string, unknown>) => boolean;
}

export class AllModelsFailedError extends Error {
  constructor(public readonly attempts: string[], public readonly configured: boolean) {
    super(configured ? "All analysis models failed" : "No AI API key configured");
  }
}

class ModelError extends Error {
  constructor(message: string, public readonly status: number, public readonly retryAfterMs = 0) {
    super(message);
  }
}

// Models whose daily free-tier quota is used up, until the time Google says it resets.
const exhaustedUntil = new Map<string, number>();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function thinkingConfig(model: string, thinking: AnalyzeRequest["thinking"]) {
  if (thinking !== "low") return undefined;
  return model.startsWith("gemini-2.5") ? { thinkingBudget: 1024 } : { thinkingLevel: "low" };
}

async function callGemini(model: string, req: AnalyzeRequest, timeoutMs: number) {
  const thinking = thinkingConfig(model, req.thinking);
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: req.system }] },
      contents: [{ role: "user", parts: req.geminiParts }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: req.schema,
        ...(req.maxOutputTokens && { maxOutputTokens: req.maxOutputTokens }),
        ...(thinking && { thinkingConfig: thinking }),
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    let retryAfterMs = 0;
    let daily = false;
    try {
      const details: { "@type"?: string; retryDelay?: string; violations?: { quotaId?: string }[] }[] = JSON.parse(body).error?.details ?? [];
      for (const d of details) {
        if (d.retryDelay) retryAfterMs = parseFloat(d.retryDelay) * 1000;
        if (d.violations?.some((v) => v.quotaId?.includes("PerDay"))) daily = true;
      }
    } catch { /* non-JSON error body */ }
    if (res.status === 429 && (daily || retryAfterMs > 60_000)) {
      exhaustedUntil.set(model, Date.now() + (retryAfterMs || 3_600_000));
      throw new ModelError(`${model}: daily free-tier quota exhausted`, 429);
    }
    throw new ModelError(`${model} returned ${res.status}: ${body.slice(0, 160)}`, res.status, retryAfterMs);
  }

  const data = await res.json();
  const text: string | undefined = data.candidates?.[0]?.content?.parts
    ?.filter((p: { thought?: boolean }) => !p.thought)
    .map((p: { text?: string }) => p.text ?? "").join("");
  const parsed = text ? extractJson(text) : null;
  if (!parsed) throw new ModelError(`${model} returned no usable JSON (finishReason: ${data.candidates?.[0]?.finishReason ?? "unknown"})`, 0);
  return parsed;
}

async function callOpenRouter(model: string, req: AnalyzeRequest, content: OpenRouterPart[], timeoutMs: number) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "X-Title": "AIVENTURE Forensic Scanner",
    },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: `${req.system}\n\nReturn ONLY a JSON object with this shape:\n${req.schemaText}` },
        { role: "user", content },
      ],
    }),
  });

  if (!res.ok) throw new ModelError(`${model} returned ${res.status}: ${(await res.text()).slice(0, 160)}`, res.status);
  const data = await res.json();
  const text: string | undefined = data.choices?.[0]?.message?.content;
  const parsed = text ? extractJson(text) : null;
  if (!parsed) throw new ModelError(`${model} returned no usable JSON`, 0);
  return parsed;
}

export interface GroundedAnswer {
  raw: Record<string, unknown>;
  /** Pages Google Search actually returned for the answer (not URLs the model typed). */
  sources: { title: string; url: string }[];
  model: string;
}

/**
 * One question answered with Google Search grounding. Grounding can't be combined
 * with a response schema on every model, so the JSON is requested in the prompt.
 * Returns null when no model could answer in time.
 */
export async function askWithSearch(prompt: string, timeoutMs: number, models = TEXT_MODELS): Promise<GroundedAnswer | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  const deadline = Date.now() + timeoutMs;
  // An answer that didn't actually search is kept only as a last resort.
  let unsourced: GroundedAnswer | null = null;
  for (const model of models) {
    const until = exhaustedUntil.get(model);
    if (until && until > Date.now()) continue;
    const left = deadline - Date.now();
    if (left < 5_000) break;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        signal: AbortSignal.timeout(left),
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          ...(thinkingConfig(model, "low") && { generationConfig: { thinkingConfig: thinkingConfig(model, "low") } }),
        }),
      });
      if (!res.ok) {
        if (res.status === 429) exhaustedUntil.set(model, Date.now() + 60_000);
        console.warn(`[factcheck] ${model} returned ${res.status}`);
        continue;
      }
      const data = await res.json();
      const candidate = data.candidates?.[0];
      const text: string = candidate?.content?.parts?.filter((p: { thought?: boolean }) => !p.thought).map((p: { text?: string }) => p.text ?? "").join("") ?? "";
      const raw = extractJson(text);
      if (!raw) continue;
      const chunks: { web?: { uri?: string; title?: string } }[] = candidate?.groundingMetadata?.groundingChunks ?? [];
      const seen = new Set<string>();
      const sources = chunks
        .map((c) => ({ title: c.web?.title ?? "", url: c.web?.uri ?? "" }))
        .filter((s) => s.url.startsWith("https://") && !seen.has(s.title) && seen.add(s.title))
        .slice(0, 4);
      if (sources.length) return { raw, sources, model };
      unsourced ??= { raw, sources, model };
    } catch (e) {
      console.warn(`[factcheck] ${model} failed: ${e instanceof Error ? e.message : e}`);
    }
  }
  return unsourced;
}

/** Tries Gemini models, then OpenRouter models, returning the first valid parsed JSON result. */
export async function analyzeWithFallback(req: AnalyzeRequest): Promise<{ raw: Record<string, unknown>; model: string }> {
  const started = Date.now();
  const timeLeft = () => req.budgetMs - (Date.now() - started);
  const attempts: string[] = [];

  // One retry for transient failures (overload / per-minute limits) when there's time for it.
  const attempt = async (label: string, run: (timeoutMs: number) => Promise<Record<string, unknown>>) => {
    for (let tries = 0; tries < 2; tries++) {
      const timeoutMs = Math.min(MAX_CALL_MS, timeLeft() - 3_000);
      if (timeoutMs < MIN_CALL_MS) return null;
      try {
        const raw = await run(timeoutMs);
        if (req.validate && !req.validate(raw)) throw new ModelError(`${label} returned an incomplete result`, 0);
        return { raw, model: label };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        attempts.push(msg);
        console.warn(`[detect] ${msg}`);
        const status = e instanceof ModelError ? e.status : 0;
        const wait = e instanceof ModelError && e.retryAfterMs ? e.retryAfterMs + 500 : 1_500;
        const transient = status === 503 || status === 500 || (status === 429 && !exhaustedUntil.has(label));
        if (!transient || wait > 20_000 || timeLeft() - wait < MIN_CALL_MS + 3_000) return null;
        await sleep(wait);
      }
    }
    return null;
  };

  if (process.env.GEMINI_API_KEY) {
    for (const model of req.models ?? MEDIA_MODELS) {
      const until = exhaustedUntil.get(model);
      if (until && until > Date.now()) {
        attempts.push(`${model}: skipped (daily quota exhausted)`);
        continue;
      }
      const result = await attempt(model, (t) => callGemini(model, req, t));
      if (result) return result;
    }
  }

  const content = req.openRouterContent;
  if (process.env.OPENROUTER_API_KEY && content) {
    for (const model of OPENROUTER_MODELS) {
      const result = await attempt(`${model} (fallback)`, (t) => callOpenRouter(model, req, content, t));
      if (result) return result;
    }
  }

  throw new AllModelsFailedError(attempts, Boolean(process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY));
}
