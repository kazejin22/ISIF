"use client";

import { useRef, useState } from "react";
import {
  Bot, User, Shuffle, HelpCircle, ScanText, RefreshCw, XCircle, Info, CheckCircle2, Fingerprint as FingerprintIcon,
  Upload, Pencil, FileText, AlertTriangle, Sparkles,
} from "lucide-react";
import {
  countWords, MAX_CHARS, MIN_WORDS,
  type Fingerprint, type ScoredSentence, type TextConclusion, type TextDetectionResponse, type TextDetectionResult,
} from "@/lib/detect/text";
import { ACCEPTED_DOCS, cleanExtractedText, extractTextFromFile } from "@/lib/extractText";
import { TEXT_SAMPLES } from "@/data/textSamples";

const VERDICTS: Record<TextConclusion, { title: string; text: string; Icon: typeof Bot }> = {
  HUMAN: { title: "This text is likely human-written", text: "text-emerald-500", Icon: User },
  "AI-GENERATED": { title: "This text is likely AI-generated", text: "text-orange-500", Icon: Bot },
  "AI-REFINED": { title: "This text looks AI-paraphrased", text: "text-violet-500", Icon: Sparkles },
  MIXED: { title: "This text mixes human and AI writing", text: "text-violet-500", Icon: Shuffle },
  UNCERTAIN: { title: "We can't tell confidently", text: "text-amber-500", Icon: HelpCircle },
};

const COLORS = { ai: "#f97316", refined: "#a855f7", human: "#10b981" };

function confidenceLabel(c: number) {
  if (c >= 75) return "High confidence";
  if (c >= 50) return "Moderate confidence";
  return "Low confidence";
}

function sentenceClass(s: ScoredSentence, selected: boolean) {
  const base = "rounded-[3px] cursor-pointer transition-colors box-decoration-clone px-0.5 -mx-0.5";
  const ring = selected ? " outline outline-2 outline-offset-1 outline-primary" : "";
  if (s.label === "ai") return `${base}${ring} ${s.p >= 80 ? "bg-orange-500/35" : "bg-orange-500/20"} hover:bg-orange-500/45`;
  if (s.label === "refined") return `${base}${ring} bg-violet-500/20 hover:bg-violet-500/35`;
  return `${base}${ring} hover:bg-foreground/[0.06]`;
}

export default function TextDetector() {
  const [text, setText] = useState("");
  const [analyzedText, setAnalyzedText] = useState("");
  const [view, setView] = useState<"edit" | "result">("edit");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [result, setResult] = useState<TextDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const words = countWords(text);
  const tooShort = words < MIN_WORDS;
  const tooLong = text.length > MAX_CHARS;

  const analyze = async () => {
    if (tooShort || tooLong || loading) return;
    setLoading(true);
    setError(null);
    setSelected(null);
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
      setAnalyzedText(text.replace(/\r\n?/g, "\n").trim());
      setResult(data);
      setView("result");
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Network error — could not reach the analysis server.");
    } finally {
      setLoading(false);
    }
  };

  const loadText = (value: string) => {
    setText(value);
    setResult(null);
    setError(null);
    setView("edit");
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setFileLoading(true);
    setError(null);
    try {
      const extracted = cleanExtractedText(await extractTextFromFile(file));
      if (!extracted) throw new Error("The file contains no readable text.");
      loadText(extracted.slice(0, MAX_CHARS));
      if (extracted.length > MAX_CHARS) setError(`Only the first ${MAX_CHARS.toLocaleString("en-US")} characters were loaded.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that file.");
    } finally {
      setFileLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const selectedSentence = result?.sentences.find((s) => s.i === selected) ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 lg:gap-8 items-start">
      {/* ── Document panel ── */}
      <div className="flex flex-col gap-4 min-w-0">
        <div className="rounded-3xl border border-foreground/10 bg-background/60 overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-foreground/[0.08] bg-foreground/[0.02]">
            {view === "result" ? (
              <>
                <span className="text-xs font-bold text-foreground/70 flex items-center gap-1.5"><FileText size={14} className="text-primary" /> Scanned document</span>
                <button type="button" onClick={() => setView("edit")} className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-foreground/[0.05] hover:bg-foreground/10 transition-colors">
                  <Pencil size={13} /> Edit text
                </button>
              </>
            ) : (
              <>
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/40 mr-1">Try:</span>
                {TEXT_SAMPLES.map((s) => (
                  <button key={s.label} type="button" onClick={() => loadText(s.text)} disabled={loading} className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-foreground/10 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50">
                    {s.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={loading || fileLoading}
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-foreground/[0.05] hover:bg-foreground/10 transition-colors disabled:opacity-50"
                >
                  {fileLoading ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />} Upload file
                </button>
                <input ref={fileRef} type="file" accept={ACCEPTED_DOCS} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              </>
            )}
          </div>

          {view === "result" && result ? (
            <>
              <div className="max-h-[28rem] overflow-y-auto p-4 sm:p-5 text-[15px] sm:text-sm leading-7 whitespace-pre-wrap text-foreground/85">
                {result.sentences.map((s, idx) => (
                  <span key={s.i}>
                    {analyzedText.slice(idx === 0 ? 0 : result.sentences[idx - 1].end, s.start)}
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Sentence ${s.i}: ${s.p}% AI`}
                      onClick={() => setSelected(selected === s.i ? null : s.i)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(selected === s.i ? null : s.i); } }}
                      className={sentenceClass(s, selected === s.i)}
                    >
                      {analyzedText.slice(s.start, s.end)}
                    </span>
                  </span>
                ))}
              </div>
              {/* Legend + selected sentence */}
              <div className="border-t border-foreground/[0.08] px-4 py-3 flex flex-col gap-3">
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-foreground/60">
                  <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-500/40" /> AI-generated</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-violet-500/30" /> AI-refined</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm border border-foreground/20" /> Human</span>
                  <span className="text-foreground/40">· Tap a sentence for details</span>
                </div>
                {selectedSentence && (
                  <div className="rounded-xl bg-foreground/[0.04] p-3 text-xs">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="font-bold">Sentence {selectedSentence.i}</span>
                      <span className="font-mono font-bold" style={{ color: COLORS[selectedSentence.label] }}>
                        {selectedSentence.p}% AI · {selectedSentence.label === "ai" ? "AI-generated" : selectedSentence.label === "refined" ? "AI-refined" : "Human"}
                      </span>
                    </div>
                    <p className="text-foreground/60">{selectedSentence.reason || "No AI patterns flagged in this sentence."}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
                placeholder="Paste an essay, article, assignment, or post here — or upload / drop a .txt, .docx or .pdf file (min 40 words)…"
                aria-label="Text to analyze"
                rows={14}
                className="block w-full resize-y min-h-[300px] bg-transparent focus:outline-none p-4 sm:p-5 pb-10 text-base sm:text-sm leading-relaxed"
              />
              <div className={`absolute bottom-3 right-4 text-[11px] font-mono ${tooLong ? "text-red-500" : tooShort ? "text-foreground/40" : "text-primary"}`}>
                {words} words{tooShort && ` · min ${MIN_WORDS}`}{tooLong && ` · max ${MAX_CHARS.toLocaleString("en-US")} chars`}
              </div>
            </div>
          )}
        </div>

        {view === "edit" && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => loadText("")}
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
              {loading ? <><RefreshCw size={18} className="animate-spin" /> Analyzing…</> : <><ScanText size={18} /> Scan for AI</>}
            </button>
          </div>
        )}

        {error && (
          <div role="alert" className="flex items-start gap-3 p-4 rounded-2xl border border-red-500/30 bg-red-500/5 text-sm">
            <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-foreground/80">{error}</p>
          </div>
        )}

        <p className="text-[11px] text-foreground/40 leading-relaxed">
          Uploaded files are read in your browser; only the text is sent for analysis and it is not stored.
          AI detectors — including this one — can be wrong. Never use the result alone to accuse someone of using AI.
        </p>
      </div>

      {/* ── Results panel ── */}
      <div className="flex flex-col gap-4 min-w-0" aria-live="polite">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 min-h-[260px] rounded-3xl border border-foreground/10 p-8 text-foreground/50">
            <RefreshCw size={32} className="animate-spin text-primary" />
            <p className="text-sm font-mono text-center">Scoring every sentence…<br /><span className="text-xs opacity-70">This usually takes 10–40 seconds.</span></p>
          </div>
        ) : result && view === "result" ? (
          <ResultPanel result={result} />
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-center text-center gap-3 min-h-[360px] rounded-3xl border border-dashed border-foreground/10 p-8 text-foreground/40">
            <ScanText size={40} />
            <p className="text-sm max-w-xs">
              Results appear here: the share of AI-generated, AI-refined and human text, a sentence-by-sentence highlight, and the evidence on both sides.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultPanel({ result }: { result: TextDetectionResult }) {
  const verdict = VERDICTS[result.conclusion];
  const { ai, refined, human } = result.breakdown;
  const flagged = result.sentences.filter((s) => s.label !== "human").length;

  return (
    <>
      {result.mode === "statistical" && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-xs text-foreground/80">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p><b>Quick statistical estimate.</b> The AI models are busy or out of quota, so this result is based only on writing statistics and is much less reliable. Try again in a few minutes for a full analysis.</p>
        </div>
      )}

      {/* Headline */}
      <div className="rounded-3xl border border-foreground/10 bg-background/40 p-5 sm:p-6">
        <div className="flex items-center gap-5">
          <Donut ai={ai} refined={refined} human={human} />
          <div className="min-w-0">
            <div className={`flex items-center gap-2 ${verdict.text}`}>
              <verdict.Icon size={18} className="shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{confidenceLabel(result.confidence)} · {result.confidence}%</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black leading-tight mt-1">{verdict.title}</h3>
            <p className="text-xs text-foreground/50 mt-1.5">
              {result.sentences.length} sentences · {flagged} flagged · {result.language}
            </p>
          </div>
        </div>

        <div className="mt-5 flex h-2.5 rounded-full overflow-hidden bg-foreground/10" aria-hidden>
          <div style={{ width: `${ai}%`, background: COLORS.ai }} />
          <div style={{ width: `${refined}%`, background: COLORS.refined }} />
          <div style={{ width: `${human}%`, background: COLORS.human }} />
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ["AI-generated", ai, COLORS.ai],
            ["AI-refined", refined, COLORS.refined],
            ["Human", human, COLORS.human],
          ].map(([label, value, color]) => (
            <div key={label as string}>
              <dd className="text-xl font-black font-mono" style={{ color: color as string }}>{value}%</dd>
              <dt className="text-[10px] uppercase tracking-wider text-foreground/50">{label}</dt>
            </div>
          ))}
        </dl>
      </div>

      {result.adjustment && result.mode === "model" && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-xs text-foreground/80">
          <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p>{result.adjustment}</p>
        </div>
      )}

      <div className="rounded-3xl border border-foreground/[0.08] bg-background/40 p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 flex items-center gap-2 mb-2">
          <Sparkles size={12} className="text-primary" /> Analysis
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{result.analysis}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SignalList title="AI signals" items={result.aiSignals} tone="ai" />
        <SignalList title="Human signals" items={result.humanSignals} tone="human" />
      </div>

      <FingerprintPanel fp={result.fingerprint} />

      <p className="text-[11px] text-foreground/40 px-1">
        Analyzed by <span className="font-mono">{result.model}</span>. Percentages are weighted by word count.
        {result.cached === "demo" && " This is a saved result for a built-in sample, so it loaded instantly."}
        {result.cached === "recent" && " This text was checked recently, so the saved result was reused."}
      </p>
    </>
  );
}

function Donut({ ai, refined, human }: { ai: number; refined: number; human: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const segments = [
    { value: ai, color: COLORS.ai },
    { value: refined, color: COLORS.refined },
    { value: human, color: COLORS.human },
  ];
  let offset = 0;
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="9" className="text-foreground/10" />
        {segments.map((s, i) => {
          const len = (s.value / 100) * c;
          const el = <circle key={i} cx="40" cy="40" r={r} fill="none" stroke={s.color} strokeWidth="9" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black font-mono leading-none">{ai + refined}%</span>
        <span className="text-[8px] uppercase tracking-wider text-foreground/50 mt-0.5">AI-involved</span>
      </div>
    </div>
  );
}

function SignalList({ title, items, tone }: { title: string; items: string[]; tone: "ai" | "human" }) {
  const box = tone === "ai" ? "text-orange-500/90 border-orange-500/20 bg-orange-500/5" : "text-emerald-500/90 border-emerald-500/20 bg-emerald-500/5";
  const dot = tone === "ai" ? "bg-orange-500" : "bg-emerald-500";
  const Icon = tone === "ai" ? Bot : CheckCircle2;
  return (
    <div className={`border rounded-3xl p-5 ${box}`}>
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

/** A metric shown on a human ↔ AI-like scale. `aiAt` / `humanAt` mark the ends of the scale. */
function Meter({ label, value, display, aiAt, humanAt, hint }: { label: string; value: number; display: string; aiAt: number; humanAt: number; hint: string }) {
  const pos = Math.min(100, Math.max(0, ((value - humanAt) / (aiAt - humanAt)) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-xs font-bold text-foreground/80">{label}</span>
        <span className="text-xs font-mono font-bold">{display}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-gradient-to-r from-emerald-500/40 via-amber-500/30 to-orange-500/50">
        <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-background" style={{ left: `${pos}%` }} />
      </div>
      <p className="text-[10px] text-foreground/40 mt-1">{hint}</p>
    </div>
  );
}

function FingerprintPanel({ fp }: { fp: Fingerprint }) {
  return (
    <div className="rounded-3xl border border-foreground/[0.08] bg-background/40 p-5">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 flex items-center gap-2 mb-1">
        <FingerprintIcon size={12} className="text-primary" /> Writing fingerprint
      </div>
      <p className="text-[10px] text-foreground/40 mb-4">Computed directly from the text. Left = more human-like, right = more AI-like. Weak hints on their own.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <Meter label="Burstiness" value={fp.burstiness} display={`${fp.burstiness}%`} humanAt={70} aiAt={20} hint="How much sentence length varies" />
        <Meter label="Stock AI phrases" value={fp.phraseDensity} display={`${fp.phraseDensity}/100w`} humanAt={0} aiAt={3} hint="“delve”, “di era…”, “furthermore”…" />
        <Meter label="Personal voice" value={fp.firstPersonRate} display={`${fp.firstPersonRate}/100w`} humanAt={3} aiAt={0} hint="First-person words (I, my, saya, aku…)" />
        <Meter label="Vocabulary diversity" value={fp.vocabularyDiversity} display={fp.vocabularyDiversity.toFixed(2)} humanAt={0.9} aiAt={0.7} hint="Unique words per 50-word window" />
      </div>
      {fp.phraseHits.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {fp.phraseHits.slice(0, 10).map((h) => (
            <span key={h.phrase} className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
              {h.phrase}{h.count > 1 && ` ×${h.count}`}
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-foreground/50">
        <div><b className="block text-sm text-foreground/80 font-mono">{fp.words}</b>words</div>
        <div><b className="block text-sm text-foreground/80 font-mono">{fp.sentences}</b>sentences</div>
        <div><b className="block text-sm text-foreground/80 font-mono">{fp.avgSentenceLength}</b>avg. words/sentence</div>
      </div>
    </div>
  );
}
