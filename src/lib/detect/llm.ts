import { extractJson } from "./normalize";

// Shared model plumbing for the media and text detectors.

// Primary: Gemini. Override with GEMINI_MODELS="a,b".
// Overloaded models answer 503 quickly, so falling through the list is cheap.
export const GEMINI_MODELS = (process.env.GEMINI_MODELS ?? "gemini-3.5-flash,gemini-2.5-flash,gemini-flash-latest")
  .split(",").map((m) => m.trim()).filter(Boolean);

// Fallback: OpenRouter free models (text + images). Override with OPENROUTER_MODELS="a,b".
export const OPENROUTER_MODELS = (process.env.OPENROUTER_MODELS ?? "google/gemma-4-31b-it:free,google/gemma-4-26b-a4b-it:free,openrouter/free")
  .split(",").map((m) => m.trim()).filter(Boolean);

const REQUEST_TIMEOUT_MS = 60_000;

type GeminiPart = { text: string } | { inline_data: { mime_type: string; data: string } };
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
}

export class AllModelsFailedError extends Error {
  constructor(public readonly attempts: string[], public readonly configured: boolean) {
    super(configured ? "All analysis models failed" : "No AI API key configured");
  }
}

async function callGemini(model: string, req: AnalyzeRequest) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: req.system }] },
      contents: [{ role: "user", parts: req.geminiParts }],
      generationConfig: { responseMimeType: "application/json", responseSchema: req.schema },
    }),
  });

  if (!res.ok) throw new Error(`${model} returned ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text: string | undefined = data.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "").join("");
  const parsed = text ? extractJson(text) : null;
  if (!parsed) throw new Error(`${model} returned no usable JSON (finishReason: ${data.candidates?.[0]?.finishReason ?? "unknown"})`);
  return parsed;
}

async function callOpenRouter(model: string, req: AnalyzeRequest, content: OpenRouterPart[]) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "X-Title": "AIVENTURE Forensic Scanner",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: `${req.system}\n\nReturn ONLY a JSON object with this shape:\n${req.schemaText}` },
        { role: "user", content },
      ],
    }),
  });

  if (!res.ok) throw new Error(`${model} returned ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text: string | undefined = data.choices?.[0]?.message?.content;
  const parsed = text ? extractJson(text) : null;
  if (!parsed) throw new Error(`${model} returned no usable JSON`);
  return parsed;
}

/** Tries Gemini models, then OpenRouter models, returning the first parsed JSON result. */
export async function analyzeWithFallback(req: AnalyzeRequest): Promise<{ raw: Record<string, unknown>; model: string }> {
  const started = Date.now();
  const timeLeft = () => req.budgetMs - (Date.now() - started);
  const attempts: string[] = [];

  const attempt = async (model: string, label: string, run: () => Promise<Record<string, unknown>>) => {
    try {
      return { raw: await run(), model: label };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      attempts.push(msg);
      console.warn(`[detect] ${msg}`);
      return null;
    }
  };

  if (process.env.GEMINI_API_KEY) {
    for (const model of GEMINI_MODELS) {
      if (timeLeft() < 20_000) break;
      const result = await attempt(model, model, () => callGemini(model, req));
      if (result) return result;
    }
  }

  const content = req.openRouterContent;
  if (process.env.OPENROUTER_API_KEY && content) {
    for (const model of OPENROUTER_MODELS) {
      if (timeLeft() < 20_000) break;
      const result = await attempt(model, `${model} (fallback)`, () => callOpenRouter(model, req, content));
      if (result) return result;
    }
  }

  throw new AllModelsFailedError(attempts, Boolean(process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY));
}
