import { NextResponse } from "next/server";
import { buildSystemPrompt, buildUserPrompt, RESULT_SCHEMA, RESULT_SCHEMA_TEXT, type MediaKind } from "@/lib/detect/prompts";
import { scanProvenance, type ProvenanceReport } from "@/lib/detect/provenance";
import { extractJson, normalizeResult } from "@/lib/detect/normalize";
import { ACCEPTED_MIME_TYPES, MAX_UPLOAD_MB, type DetectionResponse } from "@/lib/detect/types";
import { rateLimit } from "@/lib/rateLimit";

// Video analysis can take a while on the model side.
export const maxDuration = 180;

// Primary: Gemini (handles image, video and audio). Override with GEMINI_MODELS="a,b".
// Overloaded models answer 503 quickly, so falling through the list is cheap.
const GEMINI_MODELS = (process.env.GEMINI_MODELS ?? "gemini-3.5-flash,gemini-2.5-flash,gemini-flash-latest")
  .split(",").map((m) => m.trim()).filter(Boolean);

// Fallback: OpenRouter free vision models (images only). Override with OPENROUTER_MODELS="a,b".
const OPENROUTER_MODELS = (process.env.OPENROUTER_MODELS ?? "google/gemma-4-31b-it:free,google/gemma-4-26b-a4b-it:free,openrouter/free")
  .split(",").map((m) => m.trim()).filter(Boolean);

const REQUEST_TIMEOUT_MS = 60_000;
const DEADLINE_MS = (maxDuration - 15) * 1000;

function fail(error: string, status: number, headers?: HeadersInit) {
  return NextResponse.json<DetectionResponse>({ success: false, error }, { status, headers });
}

function mediaKindOf(mime: string): MediaKind {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "image";
}

async function callGemini(model: string, kind: MediaKind, mime: string, base64: string, provenance: ProvenanceReport) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: buildSystemPrompt(kind) }] },
      contents: [{
        role: "user",
        parts: [
          { inline_data: { mime_type: mime, data: base64 } },
          { text: buildUserPrompt(kind, provenance.notes) },
        ],
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESULT_SCHEMA,
      },
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

async function callOpenRouter(model: string, mime: string, base64: string, provenance: ProvenanceReport) {
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
        { role: "system", content: `${buildSystemPrompt("image")}\n\nReturn ONLY a JSON object with this shape:\n${RESULT_SCHEMA_TEXT}` },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } },
            { type: "text", text: buildUserPrompt("image", provenance.notes) },
          ],
        },
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

export async function POST(request: Request) {
  const started = Date.now();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
  const limit = rateLimit(`detect:${ip}`, 8, 60_000);
  if (!limit.ok) {
    return fail(`Too many scans. Please wait ${limit.retryAfterSec}s and try again.`, 429, { "Retry-After": String(limit.retryAfterSec) });
  }

  let file: File;
  try {
    const entry = (await request.formData()).get("file");
    if (!(entry instanceof File) || entry.size === 0) return fail("No file uploaded.", 400);
    file = entry;
  } catch {
    return fail("Could not read the upload. Please try again.", 400);
  }

  const mime = file.type.toLowerCase();
  if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(mime)) {
    return fail(`Unsupported file type (${file.type || "unknown"}). Use JPG, PNG, WEBP, HEIC, MP4, WEBM, MOV, MP3, WAV, OGG, FLAC or M4A.`, 415);
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    return fail(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). The limit is ${MAX_UPLOAD_MB} MB.`, 413);
  }

  const kind = mediaKindOf(mime);
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const provenance = scanProvenance(buffer);

  const errors: string[] = [];
  const timeLeft = () => DEADLINE_MS - (Date.now() - started);

  if (process.env.GEMINI_API_KEY) {
    for (const model of GEMINI_MODELS) {
      if (timeLeft() < 20_000) break;
      try {
        const raw = await callGemini(model, kind, mime, base64, provenance);
        return NextResponse.json<DetectionResponse>(normalizeResult(raw, model, provenance));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(msg);
        console.warn(`[detect] ${msg}`);
      }
    }
  }

  // OpenRouter's free models only accept images.
  if (process.env.OPENROUTER_API_KEY && kind === "image") {
    for (const model of OPENROUTER_MODELS) {
      if (timeLeft() < 20_000) break;
      try {
        const raw = await callOpenRouter(model, mime, base64, provenance);
        return NextResponse.json<DetectionResponse>(normalizeResult(raw, `${model} (fallback)`, provenance));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(msg);
        console.warn(`[detect] ${msg}`);
      }
    }
  }

  if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    return fail("The scanner is not configured: no AI API key is set on the server.", 503);
  }
  console.error("[detect] all models failed", errors);
  return fail(
    kind === "image"
      ? "All analysis models are busy or unavailable right now. Please try again in a minute."
      : `The ${kind} analysis model is unavailable right now (only Gemini supports ${kind}). Please try again in a minute.`,
    502,
  );
}
