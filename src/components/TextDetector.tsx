"use client";

import { useMemo, useState } from "react";
import { Bot, User, Shuffle, HelpCircle, ScanText, RefreshCw, XCircle, Info, Zap, CheckCircle2, BarChart3 } from "lucide-react";
import {
  countWords, MAX_CHARS, MIN_WORDS,
  type FlaggedPassage, type TextConclusion, type TextDetectionResponse, type TextDetectionResult,
} from "@/lib/detect/text";

const VERDICTS: Record<TextConclusion, { label: string; text: string; bg: string; border: string; Icon: typeof Bot }> = {
  HUMAN: { label: "LIKELY HUMAN-WRITTEN", text: "text-emerald-500", bg: "bg-emerald-500", border: "border-emerald-500/30", Icon: User },
  "AI-GENERATED": { label: "LIKELY AI-GENERATED", text: "text-red-500", bg: "bg-red-500", border: "border-red-500/30", Icon: Bot },
  MIXED: { label: "MIXED HUMAN + AI", text: "text-orange-500", bg: "bg-orange-500", border: "border-orange-500/30", Icon: Shuffle },
  UNCERTAIN: { label: "INCONCLUSIVE", text: "text-amber-500", bg: "bg-amber-500", border: "border-amber-500/30", Icon: HelpCircle },
};

type Segment = { text: string; flag?: FlaggedPassage; index?: number };

/** Splits the text into plain and highlighted segments for each flagged quote. */
function highlight(text: string, flags: FlaggedPassage[]): Segment[] {
  const ranges: { start: number; end: number; flag: FlaggedPassage; index: number }[] = [];
  flags.forEach((flag, index) => {
    const words = flag.quote.split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/["“”]/g, '["“”]').replace(/['‘’]/g, "['‘’]"));
    const match = new RegExp(words.join("\\s+"), "i").exec(text);
    if (match && !ranges.some((r) => match.index < r.end && match.index + match[0].length > r.start)) {
      ranges.push({ start: match.index, end: match.index + match[0].length, flag, index });
    }
  });
  ranges.sort((a, b) => a.start - b.start);

  const segments: Segment[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) segments.push({ text: text.slice(cursor, r.start) });
    segments.push({ text: text.slice(r.start, r.end), flag: r.flag, index: r.index });
    cursor = r.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}

export default function TextDetector() {
  const [text, setText] = useState("");
  const [analyzedText, setAnalyzedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TextDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const words = countWords(text);
  const tooShort = words < MIN_WORDS;
  const tooLong = text.length > MAX_CHARS;
  const segments = useMemo(() => (result ? highlight(analyzedText, result.flaggedPassages) : []), [result, analyzedText]);

  const analyze = async () => {
    if (tooShort || tooLong || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/detect-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      let data: TextDetectionResponse;
      try {
        data = await res.json();
      } catch {
        throw new Error(`The server returned an unexpected response (HTTP ${res.status}).`);
      }
      if (!data.success) throw new Error(data.error);
      setAnalyzedText(text.trim());
      setResult(data);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Network error — could not reach the analysis server.");
    } finally {
      setLoading(false);
    }
  };

  const verdict = result ? VERDICTS[result.conclusion] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
      {/* Input */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste an essay, article, message, or social media post here (at least 40 words)…"
            aria-label="Text to analyze"
            rows={12}
            className="w-full resize-y min-h-[240px] rounded-2xl bg-background/60 border border-foreground/10 focus:border-primary/60 focus:outline-none p-4 pb-10 text-base sm:text-sm leading-relaxed"
          />
          <div className={`absolute bottom-3 right-4 text-[11px] font-mono ${tooLong ? "text-red-500" : tooShort ? "text-foreground/40" : "text-primary"}`}>
            {words} words{tooShort && ` · min ${MIN_WORDS}`}{tooLong && ` · max ${MAX_CHARS.toLocaleString("en-US")} chars`}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setText(""); setResult(null); setError(null); }}
            disabled={loading || !text}
            className="px-5 py-3.5 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.08] hover:bg-foreground/[0.08] font-bold text-sm disabled:opacity-50 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={analyze}
            disabled={loading || tooShort || tooLong}
            className="flex-1 py-3.5 rounded-2xl bg-primary text-white dark:text-black font-bold flex items-center justify-center gap-2.5 hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            {loading ? <><RefreshCw size={18} className="animate-spin" /> Analyzing…</> : <><ScanText size={18} /> Analyze Text</>}
          </button>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-3 p-4 rounded-2xl border border-red-500/30 bg-red-500/5 text-sm">
            <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-500 mb-0.5">Analysis could not be completed</p>
              <p className="text-foreground/70">{error}</p>
            </div>
          </div>
        )}

        <p className="text-[11px] text-foreground/40 leading-relaxed">
          Text is sent to an AI model for analysis and is not stored. AI-text detection is unreliable — never use this result alone to accuse someone of using AI.
        </p>
      </div>

      {/* Result */}
      <div className="flex flex-col gap-4" aria-live="polite">
        {!result && !loading && (
          <div className="hidden lg:flex flex-col items-center justify-center text-center gap-3 min-h-[300px] rounded-3xl border border-dashed border-foreground/10 p-8 text-foreground/40">
            <ScanText size={40} />
            <p className="text-sm max-w-xs">Results appear here: a verdict, the passages that look machine-written, and the signals on both sides.</p>
          </div>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 min-h-[200px] lg:min-h-[300px] rounded-3xl border border-foreground/10 p-8 text-foreground/50">
            <RefreshCw size={32} className="animate-spin text-primary" />
            <p className="text-sm font-mono">Comparing writing patterns…</p>
          </div>
        )}

        {result && verdict && (
          <>
            <div className={`bg-background/40 border p-5 rounded-3xl flex items-center gap-4 ${verdict.border}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white ${verdict.bg}`}>
                <verdict.Icon size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-0.5">Verdict · {result.language}</div>
                <h3 className={`text-lg sm:text-xl font-black font-[family-name:var(--font-orbitron)] tracking-tight ${verdict.text}`}>{verdict.label}</h3>
              </div>
            </div>

            {/* Likelihood bar */}
            <div className="bg-background/40 border border-foreground/[0.08] rounded-3xl p-5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-2">
                <span>Human</span>
                <span className="text-foreground/80">AI likelihood {result.aiLikelihood}%</span>
                <span>AI</span>
              </div>
              <div className="relative h-3 rounded-full bg-gradient-to-r from-emerald-500/30 via-amber-500/30 to-red-500/30">
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-foreground border-4 border-background shadow transition-all duration-700"
                  style={{ left: `${result.aiLikelihood}%` }}
                />
              </div>
              <div className="text-xs text-foreground/50 mt-3">Evidence strength: <b className="text-foreground/80">{result.confidence}%</b></div>
            </div>

            {result.adjustment && (
              <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-xs text-foreground/80">
                <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p>{result.adjustment}</p>
              </div>
            )}

            <div className="bg-background/40 border border-foreground/[0.08] rounded-3xl p-5">
              <p className="text-sm text-foreground/80 leading-relaxed">{result.analysis}</p>
            </div>

            {/* Highlighted text */}
            {result.flaggedPassages.length > 0 && (
              <div className="bg-background/40 border border-foreground/[0.08] rounded-3xl p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/80 flex items-center gap-2 mb-3">
                  <Zap size={12} /> Passages that look AI-written ({result.flaggedPassages.length})
                </div>
                <div className="max-h-64 overflow-y-auto text-sm leading-relaxed text-foreground/70 whitespace-pre-wrap mb-4 pr-1">
                  {segments.map((s, i) => s.flag ? (
                    <mark key={i} className="bg-red-500/15 text-foreground rounded px-0.5 underline decoration-red-500/60 decoration-2 underline-offset-2">
                      {s.text}<sup className="text-[9px] font-bold text-red-500 ml-0.5">{(s.index ?? 0) + 1}</sup>
                    </mark>
                  ) : <span key={i}>{s.text}</span>)}
                </div>
                <ol className="flex flex-col gap-2">
                  {result.flaggedPassages.map((p, i) => (
                    <li key={i} className="flex gap-2.5 text-xs text-foreground/70 leading-relaxed">
                      <span className="w-4 h-4 rounded-full bg-red-500/15 text-red-500 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {p.reason}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Signals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SignalList title="AI signals" items={result.aiSignals} color="red" Icon={Bot} />
              <SignalList title="Human signals" items={result.humanSignals} color="emerald" Icon={CheckCircle2} />
            </div>

            {/* Stats */}
            <div className="bg-background/40 border border-foreground/[0.08] rounded-3xl p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 flex items-center gap-2 mb-3">
                <BarChart3 size={12} className="text-primary" /> Writing statistics
              </div>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  ["Words", result.stats.words],
                  ["Avg. sentence", `${result.stats.avgSentenceLength} w`],
                  ["Sentence variation", result.stats.sentenceLengthVariation],
                  ["Vocab. diversity", result.stats.vocabularyDiversity],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-foreground/[0.03] p-2.5">
                    <dt className="text-[9px] uppercase tracking-wider text-foreground/40">{label}</dt>
                    <dd className="text-sm font-bold font-mono">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-[10px] text-foreground/40 mt-3">Low sentence variation can hint at machine writing, but these numbers alone prove nothing.</p>
            </div>

            <p className="text-[11px] text-foreground/40 px-1">Analyzed by <span className="font-mono">{result.model}</span>.</p>
          </>
        )}
      </div>
    </div>
  );
}

function SignalList({ title, items, color, Icon }: { title: string; items: string[]; color: "red" | "emerald"; Icon: typeof Bot }) {
  const tone = color === "red" ? "text-red-500/80 border-red-500/20 bg-red-500/5" : "text-emerald-500/80 border-emerald-500/20 bg-emerald-500/5";
  const dot = color === "red" ? "bg-red-500" : "bg-emerald-500";
  return (
    <div className={`border rounded-3xl p-5 ${tone}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
        <Icon size={12} /> {title} ({items.length})
      </div>
      {items.length ? (
        <ul className="flex flex-col gap-2">
          {items.map((s, i) => (
            <li key={i} className="flex gap-2.5 text-xs text-foreground/75 leading-relaxed">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${dot}`} />
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-foreground/50">None found.</p>
      )}
    </div>
  );
}
