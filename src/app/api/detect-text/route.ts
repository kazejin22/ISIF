import { NextResponse } from "next/server";
import { analyzeWithFallback, AllModelsFailedError, TEXT_MODELS } from "@/lib/detect/llm";
import { computeFingerprint, countWords, MAX_CHARS, MIN_WORDS, splitSentences, type TextDetectionResponse } from "@/lib/detect/text";
import {
  buildTextUserPrompt, isUsableTextResult, normalizeTextResult, statisticalTextResult,
  TEXT_RESULT_SCHEMA, TEXT_RESULT_SCHEMA_TEXT, TEXT_SYSTEM_PROMPT,
} from "@/lib/detect/textAnalysis";
import { rateLimit } from "@/lib/rateLimit";
import { getCached, hashOf, setCached } from "@/lib/detect/cache";
import { languageInstruction, localizeResult, msg, parseLang } from "@/lib/detect/localize";

export const maxDuration = 120;

function fail(error: string, status: number, headers?: HeadersInit) {
  return NextResponse.json<TextDetectionResponse>({ success: false, error }, { status, headers });
}

export async function POST(request: Request) {
  const lang = parseLang(new URL(request.url).searchParams.get("lang"));
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
  const limit = rateLimit(`detect-text:${ip}`, 10, 60_000);
  if (!limit.ok) {
    return fail(msg(lang, `Too many checks. Please wait ${limit.retryAfterSec}s and try again.`, `Terlalu banyak pengecekan. Tunggu ${limit.retryAfterSec} detik lalu coba lagi.`), 429, { "Retry-After": String(limit.retryAfterSec) });
  }

  let text: string;
  try {
    const body = await request.json();
    text = typeof body?.text === "string" ? body.text.replace(/\r\n?/g, "\n").trim() : "";
  } catch {
    return fail(msg(lang, "Invalid request body.", "Isi permintaan tidak valid."), 400);
  }

  const words = countWords(text);
  if (words < MIN_WORDS) return fail(msg(lang, `Please enter at least ${MIN_WORDS} words (you entered ${words}).`, `Masukkan minimal ${MIN_WORDS} kata (kamu memasukkan ${words}).`), 400);
  if (text.length > MAX_CHARS) {
    return fail(msg(lang, `Text is too long. The limit is ${MAX_CHARS.toLocaleString("en-US")} characters.`, `Teks terlalu panjang. Batasnya ${MAX_CHARS.toLocaleString("id-ID")} karakter.`), 413);
  }

  // English results keep the bare hash so the saved demo results match.
  const hash = hashOf(text) + (lang === "id" ? ":id" : "");
  const cached = getCached<TextDetectionResponse>("text", hash);
  if (cached) return NextResponse.json<TextDetectionResponse>(cached);

  const sentences = splitSentences(text);
  const fingerprint = computeFingerprint(text, sentences);
  const userPrompt = buildTextUserPrompt(sentences, fingerprint) + languageInstruction(lang);

  try {
    const { raw, model } = await analyzeWithFallback({
      system: TEXT_SYSTEM_PROMPT,
      geminiParts: [{ text: userPrompt }],
      openRouterContent: [{ type: "text", text: userPrompt }],
      schema: TEXT_RESULT_SCHEMA,
      schemaText: TEXT_RESULT_SCHEMA_TEXT,
      budgetMs: (maxDuration - 10) * 1000,
      models: TEXT_MODELS,
      thinking: "low",
      maxOutputTokens: 16_384,
      validate: (r) => isUsableTextResult(r, sentences.length),
    });
    const result = localizeResult(normalizeTextResult(raw, model, sentences, fingerprint), lang);
    setCached("text", hash, result);
    return NextResponse.json<TextDetectionResponse>(result);
  } catch (e) {
    if (!(e instanceof AllModelsFailedError)) throw e;
    console.error("[detect-text] all models failed", e.attempts);
    // Still give the user something useful — clearly labeled as a rough estimate.
    const reason = e.configured
      ? "all AI analysis models are busy or out of quota right now."
      : "no AI API key is configured on the server.";
    return NextResponse.json<TextDetectionResponse>(localizeResult(statisticalTextResult(sentences, fingerprint, reason), lang));
  }
}
