// ─────────────────────────────────────────────────────────────
// AI TEXT DETECTION — shared types and client-safe utilities.
// Server-only prompt/normalization code lives in textAnalysis.ts.
// ─────────────────────────────────────────────────────────────

export type TextConclusion = "HUMAN" | "AI-GENERATED" | "AI-REFINED" | "MIXED" | "UNCERTAIN";
export type SentenceLabel = "ai" | "refined" | "human";

export interface Sentence {
  i: number;
  text: string;
  /** Offsets into the original (trimmed) input. */
  start: number;
  end: number;
  words: number;
}

export interface ScoredSentence extends Sentence {
  label: SentenceLabel;
  /** Probability (0-100) that this sentence was written by AI. */
  p: number;
  reason: string;
}

export interface Breakdown {
  /** Word-weighted percentages; sum to 100. */
  ai: number;
  refined: number;
  human: number;
}

export interface PhraseHit {
  phrase: string;
  count: number;
}

export interface Fingerprint {
  words: number;
  sentences: number;
  avgSentenceLength: number;
  /** Coefficient of variation of sentence length, in % — humans vary more. */
  burstiness: number;
  /** Moving-average type-token ratio (window of 50 words), 0-1. */
  vocabularyDiversity: number;
  /** First-person pronouns per 100 words. */
  firstPersonRate: number;
  /** Stock AI phrases per 100 words. */
  phraseDensity: number;
  phraseHits: PhraseHit[];
}

export interface TextDetectionResult {
  success: true;
  /** "model" = AI model analysis; "statistical" = local fallback when every model failed. */
  mode: "model" | "statistical";
  conclusion: TextConclusion;
  breakdown: Breakdown;
  /** Document-level confidence (0-100). */
  confidence: number;
  language: string;
  analysis: string;
  sentences: ScoredSentence[];
  aiSignals: string[];
  humanSignals: string[];
  fingerprint: Fingerprint;
  adjustment: string | null;
  model: string;
  /** Set when the result came from the cache instead of a fresh model call. */
  cached?: "demo" | "recent";
}

export type TextDetectionResponse = TextDetectionResult | { success: false; error: string };

export const MIN_WORDS = 40;
export const MAX_CHARS = 20_000;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const ABBREVIATION_END = /(?:^|[\s(])(?:St|Dr|Mr|Mrs|Ms|Jr|Sr|Prof|No|Vol|vs|e\.g|i\.e|approx|Bpk|Yth|Jl|Tn|Ny|Sdr|Ir|H)\.$/i;

/** Deterministic sentence split (same result in the browser and on the server). */
export function splitSentences(text: string): Sentence[] {
  const out: Sentence[] = [];
  const segmenter = new Intl.Segmenter(undefined, { granularity: "sentence" });
  for (const { segment, index } of segmenter.segment(text)) {
    // A segment may hold several lines (e.g. a heading without a full stop) — split those too.
    let offset = 0;
    for (const line of segment.split(/(\n+)/)) {
      const lineStart = index + offset;
      offset += line.length;
      const lead = line.length - line.trimStart().length;
      const trimmed = line.trim();
      if (!trimmed) continue;
      const words = countWords(trimmed);
      const start = lineStart + lead;
      const prev = out[out.length - 1];
      // Re-join false breaks on the same line: tiny fragments ("1."), abbreviations ("St. Louis",
      // "Dr.", "dll."), and fragments that continue in lowercase.
      const sameLine = prev && !text.slice(prev.end, start).includes("\n");
      if (prev && sameLine && ((words < 2 && !ABBREVIATION_END.test(trimmed)) || ABBREVIATION_END.test(prev.text) || /^\p{Ll}/u.test(trimmed))) {
        prev.end = start + trimmed.length;
        prev.text = text.slice(prev.start, prev.end);
        prev.words += words;
        continue;
      }
      out.push({ i: out.length + 1, text: trimmed, start, end: start + trimmed.length, words });
    }
  }
  return out;
}

// Stock phrases that language models overuse. Humans use them too, so they are weak hints only.
const AI_PHRASES: string[] = [
  // English
  "delve", "delves", "delving", "tapestry", "a testament to", "in today's fast-paced", "in today's digital age",
  "it is important to note", "it's important to note", "it is worth noting", "furthermore", "moreover",
  "in conclusion", "navigate the complexities", "navigating the complexities", "plays a crucial role",
  "plays a pivotal role", "a pivotal role", "in the realm of", "ever-evolving", "ever-changing landscape",
  "multifaceted", "harness the power", "unlock the potential", "seamless", "seamlessly", "paramount",
  "holistic", "game-changer", "embark on", "a myriad of", "foster", "fostering", "underscores",
  "it is essential to", "in summary", "overall,", "ultimately,", "navigate", "landscape of",
  "not only", "but also", "a double-edged sword", "strike a balance", "shed light on",
  // Indonesian
  "di era", "tidak hanya", "melainkan juga", "selain itu", "oleh karena itu", "dengan demikian",
  "secara keseluruhan", "penting untuk dicatat", "perlu diingat bahwa", "memainkan peran penting",
  "peran krusial", "peran yang sangat penting", "lanskap", "pada akhirnya", "tak dapat dipungkiri",
  "tidak dapat dipungkiri", "bukan sekadar", "seiring dengan", "kunci utama", "memberdayakan",
  "esensial", "krusial", "transformasi digital", "abad ke-21", "di tengah arus", "pedang bermata dua",
  "secara signifikan", "sangat penting untuk", "mari kita", "dalam konteks ini",
];

const FIRST_PERSON = /\b(i|me|my|mine|i'm|i've|i'd|we|our|aku|saya|gue|gw|kami|kita|ku)\b/gi;

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const PHRASE_PATTERNS = AI_PHRASES.map((phrase) => ({
  phrase,
  re: new RegExp(`(?<![\\p{L}])${escapeRegex(phrase)}(?![\\p{L}])`, "giu"),
}));

export function findPhraseHits(text: string): PhraseHit[] {
  return PHRASE_PATTERNS
    .map(({ phrase, re }) => ({ phrase, count: text.match(re)?.length ?? 0 }))
    .filter((h) => h.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function computeFingerprint(text: string, sentences = splitSentences(text)): Fingerprint {
  const tokens = text.toLowerCase().match(/[\p{L}\p{N}'-]+/gu) ?? [];
  const words = tokens.length;
  const lengths = sentences.map((s) => s.words);
  const avg = lengths.reduce((a, b) => a + b, 0) / Math.max(1, lengths.length);
  const sd = Math.sqrt(lengths.reduce((a, b) => a + (b - avg) ** 2, 0) / Math.max(1, lengths.length));

  // Moving-average TTR is stable across text lengths, unlike plain TTR.
  const window = Math.min(50, words);
  let ttrSum = 0;
  let windows = 0;
  for (let i = 0; i + window <= words && window > 0; i += 10) {
    ttrSum += new Set(tokens.slice(i, i + window)).size / window;
    windows++;
  }

  const phraseHits = findPhraseHits(text);
  const phraseCount = phraseHits.reduce((a, h) => a + h.count, 0);
  const firstPerson = text.match(FIRST_PERSON)?.length ?? 0;
  const per100 = (n: number) => Math.round((n / Math.max(1, words)) * 1000) / 10;

  return {
    words,
    sentences: sentences.length,
    avgSentenceLength: Math.round(avg * 10) / 10,
    burstiness: Math.round((sd / Math.max(1, avg)) * 100),
    vocabularyDiversity: windows ? Math.round((ttrSum / windows) * 100) / 100 : 0,
    firstPersonRate: per100(firstPerson),
    phraseDensity: per100(phraseCount),
    phraseHits,
  };
}
