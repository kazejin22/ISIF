import type { Anomaly, Conclusion, DetectionResult, RiskLevel, Severity } from "./types";
import type { ProvenanceReport } from "./provenance";

const CONCLUSIONS: Conclusion[] = ["REAL", "AI-GENERATED", "DEEPFAKE", "UNCERTAIN"];
const SEVERITIES: Severity[] = ["strong", "moderate", "weak"];

function clampScore(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  // Some models answer on a 0-1 scale.
  const scaled = n > 0 && n <= 1 ? n * 100 : n;
  return Math.round(Math.min(100, Math.max(0, scaled)));
}

function parseConclusion(value: unknown): Conclusion {
  const s = String(value ?? "").toUpperCase();
  if (CONCLUSIONS.includes(s as Conclusion)) return s as Conclusion;
  if (s.includes("DEEPFAKE") || s.includes("MANIPULATED")) return "DEEPFAKE";
  if (s.includes("AI") || s.includes("SYNTHETIC") || s.includes("GENERATED")) return "AI-GENERATED";
  if (s.includes("REAL") || s.includes("AUTHENTIC")) return "REAL";
  return "UNCERTAIN";
}

function parseAnomalies(value: unknown): Anomaly[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((a): Anomaly | null => {
      if (typeof a === "string") return { finding: a, location: "", severity: "moderate" };
      if (!a || typeof a !== "object") return null;
      const o = a as Record<string, unknown>;
      const finding = String(o.finding ?? o.description ?? "").trim();
      if (!finding) return null;
      const sev = String(o.severity ?? "").toLowerCase() as Severity;
      return {
        finding,
        location: String(o.location ?? "").trim(),
        severity: SEVERITIES.includes(sev) ? sev : "moderate",
      };
    })
    .filter((a): a is Anomaly => a !== null);
}

function riskFor(conclusion: Conclusion, confidence: number): RiskLevel {
  if (conclusion === "REAL") return "Low";
  if (conclusion === "UNCERTAIN") return "Medium";
  return confidence >= 60 ? "High" : "Medium";
}

/**
 * Turns raw model output into a consistent result. The model's own numbers
 * are kept; the server only resolves contradictions (by downgrading to
 * UNCERTAIN) and applies hard provenance evidence.
 */
export function normalizeResult(
  raw: Record<string, unknown>,
  model: string,
  provenance: ProvenanceReport,
): DetectionResult {
  let conclusion = parseConclusion(raw.conclusion);
  let authenticityScore = clampScore(raw.authenticityScore, 50);
  const confidence = clampScore(raw.confidence ?? raw.confidenceScore, 50);
  const anomalies = parseAnomalies(raw.anomalies);
  const authenticSignals = Array.isArray(raw.authenticSignals)
    ? raw.authenticSignals.map(String).filter(Boolean)
    : [];
  let adjustment: string | null = null;

  // Contradiction guard: verdict and score must point the same way.
  const fakeVerdict = conclusion === "AI-GENERATED" || conclusion === "DEEPFAKE";
  if ((conclusion === "REAL" && authenticityScore < 50) || (fakeVerdict && authenticityScore > 50)) {
    adjustment = `The model's verdict (${conclusion}) contradicted its own authenticity score (${authenticityScore}%), so the result was marked as uncertain.`;
    conclusion = "UNCERTAIN";
  } else if (fakeVerdict && anomalies.length === 0) {
    adjustment = `The model returned ${conclusion} without citing any specific anomaly, so the result was marked as uncertain.`;
    conclusion = "UNCERTAIN";
  }

  // Hard evidence: the file itself declares it was AI-generated.
  if (provenance.declaresAI && conclusion !== "AI-GENERATED") {
    adjustment = `The file's embedded metadata declares it as AI-generated${provenance.generator ? ` (${provenance.generator})` : ""}, which overrides the visual verdict (${conclusion}).`;
    conclusion = "AI-GENERATED";
    authenticityScore = Math.min(authenticityScore, 10);
  } else if (provenance.declaresAIEdit && conclusion === "REAL") {
    adjustment = "The file's embedded metadata declares it was edited with generative AI, so it cannot be classified as unaltered.";
    conclusion = "DEEPFAKE";
    authenticityScore = Math.min(authenticityScore, 40);
  }

  return {
    success: true,
    conclusion,
    isReal: conclusion === "REAL",
    authenticityScore,
    confidence,
    riskLevel: riskFor(conclusion, confidence),
    mediaDescription: String(raw.mediaDescription ?? "").trim(),
    analysis: String(raw.analysis ?? "").trim() || "The model did not return a written analysis.",
    anomalies,
    authenticSignals,
    provenance: provenance.notes,
    adjustment,
    model,
  };
}

/** Extracts a JSON object from text that may be wrapped in markdown fences. */
export function extractJson(text: string): Record<string, unknown> | null {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}
