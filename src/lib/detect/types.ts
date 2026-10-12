// Shared between the /api/detect route and the detector page.

export type Conclusion = "REAL" | "AI-GENERATED" | "DEEPFAKE" | "UNCERTAIN";
export type RiskLevel = "Low" | "Medium" | "High";
export type Severity = "strong" | "moderate" | "weak";

export interface Anomaly {
  finding: string;
  location: string;
  severity: Severity;
  /** Images only: where the finding is, as [ymin, xmin, ymax, xmax] normalized to 0-1000. */
  box?: [number, number, number, number];
}

export interface DetectionResult {
  success: true;
  conclusion: Conclusion;
  isReal: boolean;
  /** Estimated probability (0-100) that the media is authentic. */
  authenticityScore: number;
  /** How strong the evidence is (0-100). */
  confidence: number;
  riskLevel: RiskLevel;
  mediaDescription: string;
  analysis: string;
  anomalies: Anomaly[];
  authenticSignals: string[];
  provenance: string[];
  /** Set when the server adjusted the model's verdict, explaining why. */
  adjustment: string | null;
  model: string;
  /** Set when the result came from the cache instead of a fresh model call. */
  cached?: "demo" | "recent";
}

export interface DetectionError {
  success: false;
  error: string;
}

export type DetectionResponse = DetectionResult | DetectionError;

// Set in next.config.ts: Vercel rejects request bodies over 4.5 MB, so deployed
// builds accept a little less than that; local runs allow 12 MB.
export const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB) || 12;

export const ACCEPTED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif",
  "video/mp4", "video/webm", "video/quicktime", "video/mpeg", "video/x-msvideo", "video/3gpp",
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave", "audio/ogg", "audio/flac",
  "audio/aac", "audio/mp4", "audio/x-m4a", "audio/webm",
] as const;
