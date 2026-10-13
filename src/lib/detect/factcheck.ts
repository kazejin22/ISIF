// Speech checks for video and audio.
// A lip-synced or voice-cloned clip often looks perfectly real, so the visual verdict
// alone is not enough. When a recognisable public figure says something, we ask Gemini
// with Google Search whether reliable sources have confirmed or debunked the quote,
// and fold that into the verdict — always explaining the change to the user.

import { askWithSearch } from "./llm";
import { msg, type Lang } from "./localize";
import type { DetectionResult, FactCheck, SpeechInfo } from "./types";

const LIP_SYNC = ["consistent", "inconsistent", "unclear", "not-visible"] as const;

export function parseSpeech(raw: Record<string, unknown>): SpeechInfo | undefined {
  const s = raw.speech;
  if (!s || typeof s !== "object") return undefined;
  const o = s as Record<string, unknown>;
  if (o.present === false) return undefined;
  const lip = String(o.lipSync ?? "unclear") as SpeechInfo["lipSync"];
  return {
    speaker: String(o.speaker ?? "").trim().slice(0, 80),
    quote: String(o.quote ?? "").trim().slice(0, 240),
    sensitive: o.sensitive === true,
    lipSync: LIP_SYNC.includes(lip) ? lip : "unclear",
  };
}

export async function checkClaim(speech: SpeechInfo, lang: Lang, timeoutMs: number): Promise<FactCheck | null> {
  const prompt = `Use Google Search to check this claim.

A video or audio clip circulating online shows ${speech.speaker} saying: "${speech.quote}"

Question: did ${speech.speaker} really say this? Look for fact-checks (e.g. Cek Fakta, Turn Back Hoax, Komdigi, AFP Fact Check, Reuters Fact Check), official clarifications, and reports by major news outlets.

Answer with JSON only, no other text:
{"verdict": "fabricated" | "authentic" | "unverified", "summary": string}

Rules:
- "fabricated": reliable sources say the person did not say this, or that the clip is AI-generated, a deepfake, edited, or a voice clone.
- "authentic": reliable outlets report that the person actually said this (in this sense, not out of context).
- "unverified": anything else, including when you find nothing relevant. Do not guess.
- "summary": 1-2 sentences in ${lang === "id" ? "Indonesian (Bahasa Indonesia)" : "English"} saying what the sources report.`;

  const answer = await askWithSearch(prompt, timeoutMs);
  if (!answer) return null;
  const v = String(answer.raw.verdict ?? "").toLowerCase();
  const verdict: FactCheck["verdict"] = v === "fabricated" || v === "authentic" ? v : "unverified";
  // A verdict that leans on the web must show where it came from.
  if (verdict !== "unverified" && answer.sources.length === 0) return { verdict: "unverified", summary: String(answer.raw.summary ?? ""), sources: [] };
  return { verdict, summary: String(answer.raw.summary ?? "").trim(), sources: answer.sources };
}

/** Combines the visual verdict with the speech evidence. */
export function applySpeechEvidence(result: DetectionResult, speech: SpeechInfo | undefined, factCheck: FactCheck | null, lang: Lang): DetectionResult {
  if (!speech) return result;
  const r: DetectionResult = { ...result, speech, ...(factCheck ? { factCheck } : {}) };
  const who = speech.speaker || msg(lang, "the speaker", "pembicara");

  if (factCheck?.verdict === "fabricated") {
    if (r.conclusion !== "DEEPFAKE" && r.conclusion !== "AI-GENERATED") {
      r.adjustment = msg(lang,
        `Reliable sources report that ${who} did not actually say this, so the clip is treated as manipulated even though the footage itself looks authentic.`,
        `Sumber tepercaya melaporkan bahwa ${who} tidak pernah mengatakan ini, jadi klip ini dianggap hasil manipulasi walaupun rekamannya tampak asli.`);
      r.conclusion = "DEEPFAKE";
    }
    r.authenticityScore = Math.min(r.authenticityScore, 10);
    r.confidence = Math.max(r.confidence, 80);
  } else if (r.conclusion === "REAL" && speech.lipSync === "inconsistent") {
    r.adjustment = msg(lang,
      "The footage looks real, but the mouth movements don't consistently match the audio — a common sign of AI lip-sync — so the result was marked as uncertain.",
      "Rekamannya tampak asli, tetapi gerak bibir tidak selalu cocok dengan suaranya — tanda umum lip-sync AI — jadi hasilnya ditandai belum pasti.");
    r.conclusion = "UNCERTAIN";
    r.authenticityScore = Math.min(r.authenticityScore, 45);
  } else if (r.conclusion === "REAL" && speech.speaker && speech.sensitive && factCheck?.verdict !== "authentic") {
    r.adjustment = msg(lang,
      `The footage looks real, but it shows a public figure (${who}) making a controversial claim that could not be confirmed by reliable sources. Cloned voices and AI lip-sync often look like this, so verify it with official channels before believing or sharing it.`,
      `Rekamannya tampak asli, tetapi menampilkan tokoh publik (${who}) dengan klaim kontroversial yang belum bisa dikonfirmasi sumber tepercaya. Suara kloning dan lip-sync AI sering terlihat seperti ini, jadi cek ke kanal resmi sebelum memercayai atau membagikannya.`);
    r.conclusion = "UNCERTAIN";
    r.authenticityScore = Math.min(r.authenticityScore, 50);
  }

  r.isReal = r.conclusion === "REAL";
  r.riskLevel = r.conclusion === "REAL" ? "Low" : r.conclusion === "UNCERTAIN" ? "Medium" : r.confidence >= 60 ? "High" : "Medium";
  return r;
}
