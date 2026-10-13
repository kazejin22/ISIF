import { NextResponse } from "next/server";
import { buildSystemPrompt, buildUserPrompt, RESULT_SCHEMA, RESULT_SCHEMA_TEXT, type MediaKind } from "@/lib/detect/prompts";
import { scanProvenance } from "@/lib/detect/provenance";
import { normalizeResult } from "@/lib/detect/normalize";
import { analyzeWithFallback, AllModelsFailedError } from "@/lib/detect/llm";
import { ACCEPTED_MIME_TYPES, MAX_UPLOAD_MB, type DetectionResponse } from "@/lib/detect/types";
import { rateLimit } from "@/lib/rateLimit";
import { getCached, hashOf, setCached } from "@/lib/detect/cache";
import { languageInstruction, localizeResult, msg, parseLang } from "@/lib/detect/localize";
import { applySpeechEvidence, checkClaim, parseSpeech } from "@/lib/detect/factcheck";

// Video analysis can take a while on the model side.
export const maxDuration = 180;

// Lip-sync checks need more than Gemini's default 1 frame per second.
const VIDEO_FPS = 3;
// Time kept free after the main analysis for the web fact-check of a quoted claim.
const FACT_CHECK_MS = 30_000;

function fail(error: string, status: number, headers?: HeadersInit) {
  return NextResponse.json<DetectionResponse>({ success: false, error }, { status, headers });
}

function mediaKindOf(mime: string): MediaKind {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "image";
}

export async function POST(request: Request) {
  const started = Date.now();
  const lang = parseLang(new URL(request.url).searchParams.get("lang"));
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
  const limit = rateLimit(`detect:${ip}`, 8, 60_000);
  if (!limit.ok) {
    return fail(msg(lang, `Too many scans. Please wait ${limit.retryAfterSec}s and try again.`, `Terlalu banyak pemindaian. Tunggu ${limit.retryAfterSec} detik lalu coba lagi.`), 429, { "Retry-After": String(limit.retryAfterSec) });
  }

  let file: File;
  try {
    const entry = (await request.formData()).get("file");
    if (!(entry instanceof File) || entry.size === 0) return fail(msg(lang, "No file uploaded.", "Tidak ada file yang diunggah."), 400);
    file = entry;
  } catch {
    return fail(msg(lang, "Could not read the upload. Please try again.", "Unggahan tidak bisa dibaca. Coba lagi."), 400);
  }

  const mime = file.type.toLowerCase();
  if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(mime)) {
    return fail(msg(lang,
      `Unsupported file type (${file.type || "unknown"}). Use JPG, PNG, WEBP, HEIC, MP4, WEBM, MOV, MP3, WAV, OGG, FLAC or M4A.`,
      `Jenis file tidak didukung (${file.type || "tidak diketahui"}). Gunakan JPG, PNG, WEBP, HEIC, MP4, WEBM, MOV, MP3, WAV, OGG, FLAC, atau M4A.`,
    ), 415);
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return fail(msg(lang, `File is too large (${mb} MB). The limit is ${MAX_UPLOAD_MB} MB.`, `File terlalu besar (${mb} MB). Batasnya ${MAX_UPLOAD_MB} MB.`), 413);
  }

  const kind = mediaKindOf(mime);
  const buffer = Buffer.from(await file.arrayBuffer());
  // English results keep the bare hash so the saved demo results match.
  const hash = hashOf(buffer) + (lang === "id" ? ":id" : "");
  const cached = getCached<DetectionResponse>("media", hash);
  if (cached) return NextResponse.json<DetectionResponse>(cached);

  const base64 = buffer.toString("base64");
  const provenance = scanProvenance(buffer);
  const userPrompt = buildUserPrompt(kind, provenance.notes) + languageInstruction(lang);

  try {
    const { raw, model } = await analyzeWithFallback({
      system: buildSystemPrompt(kind),
      geminiParts: [
        kind === "video"
          ? { inline_data: { mime_type: mime, data: base64 }, video_metadata: { fps: VIDEO_FPS } }
          : { inline_data: { mime_type: mime, data: base64 } },
        { text: userPrompt },
      ],
      // OpenRouter's free models only accept images.
      openRouterContent: kind === "image"
        ? [{ type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } }, { type: "text", text: userPrompt }]
        : undefined,
      schema: RESULT_SCHEMA,
      schemaText: RESULT_SCHEMA_TEXT,
      budgetMs: (maxDuration - 15) * 1000 - (kind === "image" ? 0 : FACT_CHECK_MS),
    });
    let result = normalizeResult(raw, model, provenance);

    // Video/audio: check the words, not just the picture.
    if (kind !== "image") {
      const speech = parseSpeech(raw);
      const timeLeft = (maxDuration - 8) * 1000 - (Date.now() - started);
      const factCheck = speech?.speaker && speech.quote && timeLeft > 8_000
        ? await checkClaim(speech, lang, Math.min(FACT_CHECK_MS, timeLeft))
        : null;
      result = applySpeechEvidence(result, speech, factCheck, lang);
    }
    result = localizeResult(result, lang);
    setCached("media", hash, result);
    return NextResponse.json<DetectionResponse>(result);
  } catch (e) {
    if (e instanceof AllModelsFailedError && !e.configured) {
      return fail(msg(lang, "The scanner is not configured: no AI API key is set on the server.", "Pemindai belum diatur: belum ada API key AI di server."), 503);
    }
    console.error("[detect] all models failed", e instanceof AllModelsFailedError ? e.attempts : e);
    return fail(
      kind === "image"
        ? msg(lang, "All analysis models are busy or unavailable right now. Please try again in a minute.", "Semua model analisis sedang sibuk atau tidak tersedia. Coba lagi sebentar lagi.")
        : msg(lang,
          `The ${kind} analysis model is unavailable right now (only Gemini supports ${kind}). Please try again in a minute.`,
          `Model analisis ${kind} sedang tidak tersedia (hanya Gemini yang mendukung ${kind}). Coba lagi sebentar lagi.`,
        ),
      502,
    );
  }
}
