import { NextResponse } from "next/server";
import { buildSystemPrompt, buildUserPrompt, RESULT_SCHEMA, RESULT_SCHEMA_TEXT, type MediaKind } from "@/lib/detect/prompts";
import { scanProvenance } from "@/lib/detect/provenance";
import { normalizeResult } from "@/lib/detect/normalize";
import { analyzeWithFallback, AllModelsFailedError } from "@/lib/detect/llm";
import { ACCEPTED_MIME_TYPES, MAX_UPLOAD_MB, type DetectionResponse } from "@/lib/detect/types";
import { rateLimit } from "@/lib/rateLimit";
import { getCached, hashOf, setCached } from "@/lib/detect/cache";

// Video analysis can take a while on the model side.
export const maxDuration = 180;

function fail(error: string, status: number, headers?: HeadersInit) {
  return NextResponse.json<DetectionResponse>({ success: false, error }, { status, headers });
}

function mediaKindOf(mime: string): MediaKind {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "image";
}

export async function POST(request: Request) {
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
  const hash = hashOf(buffer);
  const cached = getCached<DetectionResponse>("media", hash);
  if (cached) return NextResponse.json<DetectionResponse>(cached);

  const base64 = buffer.toString("base64");
  const provenance = scanProvenance(buffer);
  const userPrompt = buildUserPrompt(kind, provenance.notes);

  try {
    const { raw, model } = await analyzeWithFallback({
      system: buildSystemPrompt(kind),
      geminiParts: [{ inline_data: { mime_type: mime, data: base64 } }, { text: userPrompt }],
      // OpenRouter's free models only accept images.
      openRouterContent: kind === "image"
        ? [{ type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } }, { type: "text", text: userPrompt }]
        : undefined,
      schema: RESULT_SCHEMA,
      schemaText: RESULT_SCHEMA_TEXT,
      budgetMs: (maxDuration - 15) * 1000,
    });
    const result = normalizeResult(raw, model, provenance);
    setCached("media", hash, result);
    return NextResponse.json<DetectionResponse>(result);
  } catch (e) {
    if (e instanceof AllModelsFailedError && !e.configured) {
      return fail("The scanner is not configured: no AI API key is set on the server.", 503);
    }
    console.error("[detect] all models failed", e instanceof AllModelsFailedError ? e.attempts : e);
    return fail(
      kind === "image"
        ? "All analysis models are busy or unavailable right now. Please try again in a minute."
        : `The ${kind} analysis model is unavailable right now (only Gemini supports ${kind}). Please try again in a minute.`,
      502,
    );
  }
}
