import { NextResponse } from "next/server";
import { analyzeWithFallback, AllModelsFailedError } from "@/lib/detect/llm";
import {
  buildTextUserPrompt, computeTextStats, countWords, normalizeTextResult,
  MAX_CHARS, MIN_WORDS, TEXT_RESULT_SCHEMA, TEXT_RESULT_SCHEMA_TEXT, TEXT_SYSTEM_PROMPT,
  type TextDetectionResponse,
} from "@/lib/detect/text";
import { rateLimit } from "@/lib/rateLimit";

export const maxDuration = 90;

function fail(error: string, status: number, headers?: HeadersInit) {
  return NextResponse.json<TextDetectionResponse>({ success: false, error }, { status, headers });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
  const limit = rateLimit(`detect-text:${ip}`, 10, 60_000);
  if (!limit.ok) {
    return fail(`Too many checks. Please wait ${limit.retryAfterSec}s and try again.`, 429, { "Retry-After": String(limit.retryAfterSec) });
  }

  let text: string;
  try {
    const body = await request.json();
    text = typeof body?.text === "string" ? body.text.trim() : "";
  } catch {
    return fail("Invalid request body.", 400);
  }

  const words = countWords(text);
  if (words < MIN_WORDS) return fail(`Please enter at least ${MIN_WORDS} words (you entered ${words}).`, 400);
  if (text.length > MAX_CHARS) return fail(`Text is too long. The limit is ${MAX_CHARS.toLocaleString("en-US")} characters.`, 413);

  const stats = computeTextStats(text);
  const userPrompt = buildTextUserPrompt(text, stats);

  try {
    const { raw, model } = await analyzeWithFallback({
      system: TEXT_SYSTEM_PROMPT,
      geminiParts: [{ text: userPrompt }],
      openRouterContent: [{ type: "text", text: userPrompt }],
      schema: TEXT_RESULT_SCHEMA,
      schemaText: TEXT_RESULT_SCHEMA_TEXT,
      budgetMs: (maxDuration - 10) * 1000,
    });
    return NextResponse.json<TextDetectionResponse>(normalizeTextResult(raw, model, text, stats));
  } catch (e) {
    if (e instanceof AllModelsFailedError && !e.configured) {
      return fail("The text detector is not configured: no AI API key is set on the server.", 503);
    }
    console.error("[detect-text] all models failed", e instanceof AllModelsFailedError ? e.attempts : e);
    return fail("All analysis models are busy or unavailable right now. Please try again in a minute.", 502);
  }
}
