"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import TextDetector from "@/components/TextDetector";
import {
  ScanLine, AlertTriangle, RefreshCw, Crosshair, Activity, ShieldAlert, ShieldCheck,
  ShieldQuestion, Zap, Database, UploadCloud, FileAudio, CheckCircle2, Info, FileSearch, XCircle, ScanText, Images,
} from "lucide-react";
import {
  ACCEPTED_MIME_TYPES, MAX_UPLOAD_MB,
  type Conclusion, type DetectionResponse, type DetectionResult,
} from "@/lib/detect/types";
import { useLang, useT, type Translate } from "@/lib/i18n";

const SCAN_STEPS: [string, string][] = [
  ["> Uploading media to the analysis server...", "> Mengunggah media ke server analisis..."],
  ["> Reading file metadata & content credentials (C2PA / EXIF)...", "> Membaca metadata file & content credentials (C2PA / EXIF)..."],
  ["> Sending media to the Gemini vision model...", "> Mengirim media ke model visi Gemini..."],
  ["> Inspecting anatomy, text, lighting & physics...", "> Memeriksa anatomi, tulisan, cahaya & fisika..."],
  ["> Weighing evidence for and against authenticity...", "> Menimbang bukti asli dan palsu..."],
  ["> Compiling forensic verdict...", "> Menyusun kesimpulan forensik..."],
];

// Saved results come back almost instantly; the scan animation still plays for at
// least this long so every scan looks and reads the same.
const MIN_SCAN_MS = 5000;

const VERDICTS: Record<Conclusion, { label: [string, string]; text: string; bg: string; border: string; hex: string; Icon: typeof ShieldCheck }> = {
  REAL: { label: ["LIKELY AUTHENTIC", "KEMUNGKINAN ASLI"], text: "text-emerald-500", bg: "bg-emerald-500", border: "border-emerald-500/30", hex: "#10b981", Icon: ShieldCheck },
  "AI-GENERATED": { label: ["AI-GENERATED", "BUATAN AI"], text: "text-red-500", bg: "bg-red-500", border: "border-red-500/30", hex: "#ef4444", Icon: AlertTriangle },
  DEEPFAKE: { label: ["DEEPFAKE DETECTED", "DEEPFAKE TERDETEKSI"], text: "text-orange-500", bg: "bg-orange-500", border: "border-orange-500/30", hex: "#f97316", Icon: ShieldAlert },
  UNCERTAIN: { label: ["INCONCLUSIVE", "BELUM PASTI"], text: "text-amber-500", bg: "bg-amber-500", border: "border-amber-500/30", hex: "#f59e0b", Icon: ShieldQuestion },
};

const SEVERITY_HEX = { strong: "#ef4444", moderate: "#f97316", weak: "#fbbf24" };

/**
 * Numbered boxes over the photo, one per anomaly the model located. The SVG uses the
 * image's own pixel size as its viewBox with "meet", so it lines up exactly with an
 * object-contain image in the same box.
 */
function AnomalyOverlay({ anomalies, size, active, onHover }: {
  anomalies: DetectionResult["anomalies"];
  size: { w: number; h: number };
  active: number | null;
  onHover: (i: number | null) => void;
}) {
  const { w, h } = size;
  const stroke = Math.max(2, w / 260);
  const font = Math.max(12, w / 32);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
      {anomalies.map((a, i) => {
        if (!a.box) return null;
        const [y0, x0, y1, x1] = a.box;
        const x = (x0 / 1000) * w, y = (y0 / 1000) * h, bw = ((x1 - x0) / 1000) * w, bh = ((y1 - y0) / 1000) * h;
        const color = SEVERITY_HEX[a.severity];
        const dim = active !== null && active !== i;
        const badge = font * 1.5;
        return (
          <g key={i} opacity={dim ? 0.3 : 1} className="pointer-events-auto cursor-pointer transition-opacity" onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)}>
            <rect x={x} y={y} width={bw} height={bh} rx={stroke * 2} fill={color} fillOpacity={active === i ? 0.18 : 0.06} stroke="#000" strokeOpacity={0.5} strokeWidth={stroke * 2.2} />
            <rect x={x} y={y} width={bw} height={bh} rx={stroke * 2} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${stroke * 6} ${stroke * 3}`} className="anomaly-box" />
            <g transform={`translate(${Math.max(0, x - badge / 2)} ${Math.max(0, y - badge / 2)})`}>
              <rect width={badge} height={badge} rx={badge / 2} fill={color} stroke="#000" strokeOpacity={0.4} strokeWidth={stroke / 2} />
              <text x={badge / 2} y={badge / 2} fontSize={font} fontWeight={800} fill="#fff" textAnchor="middle" dominantBaseline="central">{i + 1}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

const SEVERITY_STYLE = {
  strong: "bg-red-500/15 text-red-500 border-red-500/30",
  moderate: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  weak: "bg-foreground/5 text-foreground/60 border-foreground/10",
};

// Built-in demo images (the same verified photos as the "Real or Fake" mission).
// Their results are saved in src/data/demoResults.json, so they scan instantly.
const MEDIA_SAMPLES: { src: string; label: [string, string]; type: string }[] = [
  { src: "/game/rof/e1.jpg", label: ["Volcanic ash, Yogyakarta", "Abu vulkanik, Yogyakarta"], type: "image/jpeg" },
  { src: "/game/rof/e8.jpg", label: ["Mountain cabins", "Kabin gunung"], type: "image/jpeg" },
  { src: "/game/rof/e6.jpg", label: ["Lincoln selfie", "Swafoto Lincoln"], type: "image/jpeg" },
  { src: "/game/rof/e7.jpg", label: ["Fishmonger portrait", "Potret penjual ikan"], type: "image/jpeg" },
];

type MediaKind = "image" | "video" | "audio";

function kindOf(file: File): MediaKind {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "image";
}

function validateFile(file: File, t: Translate): string | null {
  if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type.toLowerCase())) {
    return t(
      `Unsupported file type (${file.type || "unknown"}). Use an image, video or audio file.`,
      `Jenis file tidak didukung (${file.type || "tidak diketahui"}). Gunakan file gambar, video, atau audio.`,
    );
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return t(
      `File is ${mb} MB — the limit is ${MAX_UPLOAD_MB} MB. Please trim or compress it.`,
      `File berukuran ${mb} MB — batasnya ${MAX_UPLOAD_MB} MB. Potong atau kompres dulu.`,
    );
  }
  return null;
}

/**
 * Re-encodes an oversized photo as a JPEG that fits the upload limit. This drops the
 * file's metadata (EXIF / C2PA), so the UI tells the user. Returns null if it can't.
 */
async function shrinkImage(file: File, maxBytes: number): Promise<File | null> {
  try {
    const bitmap = await createImageBitmap(file);
    for (const side of [3072, 2560, 2048, 1600]) {
      const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      if (blob && blob.size <= maxBytes) {
        bitmap.close();
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
      }
    }
    bitmap.close();
  } catch {
    // Formats the browser can't decode (e.g. HEIC on most browsers) fall through.
  }
  return null;
}

const TypewriterText = ({ text }: { text: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCount(i);
      if (i >= text.length) clearInterval(interval);
    }, 20);
    return () => { clearInterval(interval); setCount(0); };
  }, [text]);
  return <span className="font-mono">{text.slice(0, count)}</span>;
};

// Half-circle gauge
const GaugeMeter = ({ value, label, color }: { value: number; label: string; color: string }) => {
  const circumference = Math.PI * 60;
  const dashoffset = circumference - (value / 100) * circumference;
  return (
    <div className="relative flex flex-col items-center">
      <svg className="w-28 h-16 sm:w-32 sm:h-20 overflow-hidden" viewBox="0 0 140 75">
        <path d="M 10,70 A 60,60 0 0,1 130,70" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" className="text-foreground/10" />
        <path
          d="M 10,70 A 60,60 0 0,1 130,70" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashoffset} className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute top-6 sm:top-8 flex flex-col items-center">
        <span className="text-xl sm:text-2xl font-black font-[family-name:var(--font-orbitron)]">
          {Math.round(value)}<span className="text-sm opacity-50">%</span>
        </span>
      </div>
      <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mt-2 text-center">{label}</span>
    </div>
  );
};

function MediaScanner({ header }: { header: React.ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [fastSteps, setFastSteps] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [glitch, setGlitch] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [resized, setResized] = useState(false);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [activeBox, setActiveBox] = useState<number | null>(null);
  const [showBoxes, setShowBoxes] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lang = useLang();
  const t = useT();

  // Release the object URL whenever the preview changes or the page unmounts.
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => setStepIndex((i) => Math.min(i + 1, SCAN_STEPS.length - 1)), fastSteps ? MIN_SCAN_MS / SCAN_STEPS.length : 2500);
    return () => clearInterval(interval);
  }, [isScanning, fastSteps]);

  const status = isScanning
    ? t(...SCAN_STEPS[stepIndex])
    : error ? t("> Scan failed. See the message below.", "> Pemindaian gagal. Lihat pesan di bawah.")
    : result ? t("> Analysis complete.", "> Analisis selesai.")
    : file ? t("> Media loaded. Ready to scan.", "> Media dimuat. Siap dipindai.")
    : t("Awaiting media input...", "Menunggu media...");

  const selectFile = async (selected: File | undefined) => {
    if (!selected) return;
    setResult(null);
    setResized(false);
    let chosen = selected;
    const limit = MAX_UPLOAD_MB * 1024 * 1024;
    if (selected.size > limit && selected.type.startsWith("image/")) {
      const smaller = await shrinkImage(selected, limit);
      if (smaller) {
        chosen = smaller;
        setResized(true);
      }
    }
    const problem = validateFile(chosen, t);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setImgSize(null);
    setActiveBox(null);
    setShowBoxes(true);
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  };

  const loadSample = async (sample: (typeof MEDIA_SAMPLES)[number]) => {
    try {
      const blob = await (await fetch(sample.src)).blob();
      selectFile(new File([blob], sample.src.split("/").pop()!, { type: sample.type }));
    } catch {
      setError(t("Could not load the sample image.", "Gambar contoh tidak bisa dimuat."));
    }
  };

  const reset = () => {
    setResized(false);
    setPreview(null);
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startScan = async () => {
    if (!file) return;
    setStepIndex(0);
    setIsScanning(true);
    setFastSteps(false);
    const started = Date.now();
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/detect?lang=${lang}`, { method: "POST", body: formData });

      let data: DetectionResponse;
      try {
        data = await response.json();
      } catch {
        throw new Error(
          response.status === 413
            ? t("The file is too large for the server to accept. Please use a smaller file.", "File terlalu besar untuk diterima server. Gunakan file yang lebih kecil.")
            : t(`The server returned an unexpected response (HTTP ${response.status}).`, `Server memberi respons yang tidak terduga (HTTP ${response.status}).`),
        );
      }
      if (!data.success) throw new Error(data.error);

      const remaining = MIN_SCAN_MS - (Date.now() - started);
      if (remaining > 0) {
        setFastSteps(true);
        await new Promise((r) => setTimeout(r, remaining));
      }
      setResult(data);
      if (data.conclusion === "AI-GENERATED" || data.conclusion === "DEEPFAKE") {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 800);
      }
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : t("Network error — could not reach the analysis server.", "Gangguan jaringan — tidak bisa terhubung ke server analisis."));
    } finally {
      setIsScanning(false);
    }
  };

  const kind = file ? kindOf(file) : "image";
  const verdict = result ? VERDICTS[result.conclusion] : null;
  const mediaClass = `w-full h-full object-contain transition-all duration-1000 ${isScanning ? "opacity-60 blur-[2px] brightness-75" : ""}`;

  return (
    <div className={`min-h-screen bg-background text-foreground overflow-x-hidden ${glitch ? "animate-glitch" : ""}`}>
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-24 relative z-10 flex flex-col">
        {header}

        <div className={`w-full mx-auto transition-all duration-700 ${result ? "max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-6 lg:gap-8 items-start" : "max-w-3xl flex flex-col items-center"}`}>
          {/* LEFT: Upload & Preview */}
          <div className="w-full flex flex-col gap-4 md:gap-6">
            <div className="card-fx w-full bg-background/40 backdrop-blur-2xl border border-foreground/[0.08] rounded-[1.5rem] md:rounded-[2rem] p-2 md:p-3 relative overflow-hidden shadow-2xl">
              {!preview ? (
                <button
                  type="button"
                  className={`w-full aspect-[4/3] rounded-2xl md:rounded-3xl border border-dashed flex flex-col items-center justify-center text-center px-6 transition-all duration-500 cursor-pointer group relative overflow-hidden ${dragOver ? "border-primary bg-primary/5" : "border-foreground/20 hover:bg-primary/[0.02] hover:border-primary/50"}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); selectFile(e.dataTransfer.files?.[0]); }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 mb-6 rounded-full bg-foreground/[0.03] border border-foreground/[0.08] flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500">
                    <UploadCloud size={36} className="text-foreground/40 group-hover:text-primary transition-colors duration-500" />
                  </div>
                  <span className="text-lg md:text-xl font-bold mb-2 font-[family-name:var(--font-orbitron)] text-foreground/80 group-hover:text-foreground transition-colors">{t("Target Acquisition", "Pilih Target")}</span>
                  <span className="text-foreground/50 text-sm max-w-[280px]">{t("Tap to choose or drop a file here", "Ketuk untuk memilih atau seret file ke sini")}</span>
                  <span className="text-foreground/40 text-xs mt-3">{t("Image · Video · Audio", "Gambar · Video · Audio")} — max {MAX_UPLOAD_MB} MB</span>
                </button>
              ) : (
                <div className="relative w-full aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden bg-black/80 flex items-center justify-center">
                  {kind === "image" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt={t("Uploaded media", "Media yang diunggah")}
                      className={mediaClass}
                      onLoad={(e) => setImgSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                    />
                  )}
                  {kind === "image" && result && !isScanning && showBoxes && imgSize && (
                    <AnomalyOverlay anomalies={result.anomalies} size={imgSize} active={activeBox} onHover={setActiveBox} />
                  )}
                  {kind === "image" && result && !isScanning && result.anomalies.some((a) => a.box) && (
                    <button
                      type="button"
                      onClick={() => setShowBoxes((v) => !v)}
                      className="absolute bottom-3 right-3 md:bottom-auto md:top-3 z-30 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur text-white text-[11px] font-bold border border-white/15 hover:bg-black/85"
                    >
                      {showBoxes ? t("Hide marked areas", "Sembunyikan area") : t("Show marked areas", "Tampilkan area")}
                    </button>
                  )}
                  {kind === "video" && <video src={preview} controls playsInline className={mediaClass} />}
                  {kind === "audio" && (
                    <div className="flex flex-col items-center gap-6 px-6 w-full">
                      <FileAudio size={64} className={`text-primary ${isScanning ? "animate-pulse" : ""}`} />
                      <p className="text-white/80 text-sm font-mono truncate max-w-full">{file?.name}</p>
                      <audio src={preview} controls className="w-full max-w-sm" />
                    </div>
                  )}

                  {isScanning && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_20px_5px_rgba(0,243,255,0.6)] animate-[radar_3s_ease-in-out_infinite]" />
                    </div>
                  )}

                  {/* Terminal Logger */}
                  <div className="absolute top-3 left-3 right-3 md:top-auto md:bottom-4 md:left-4 md:right-4 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-2.5 md:p-3 flex items-center justify-between gap-3 z-20 pointer-events-none">
                    <div className={`text-[11px] md:text-sm font-mono truncate ${isScanning ? "text-cyan-300" : "text-white/70"}`}>
                      {isScanning ? <TypewriterText text={status} /> : status}
                    </div>
                    {isScanning ? <ScanLine size={16} className="text-cyan-300 animate-spin shrink-0" /> : <Database size={16} className="text-white/40 shrink-0" />}
                  </div>
                </div>
              )}
              <input
                type="file" ref={fileInputRef} className="hidden"
                accept="image/*,video/*,audio/*" onChange={(e) => selectFile(e.target.files?.[0])}
              />
            </div>

            {!preview && (
              <div className="w-full">
                <p className="text-xs text-foreground/50 mb-2 text-center">{t("No file at hand? Try a sample:", "Tidak punya file? Coba contoh:")}</p>
                <div className="grid grid-cols-4 gap-2">
                  {MEDIA_SAMPLES.map((s) => (
                    <button
                      key={s.src}
                      type="button"
                      onClick={() => loadSample(s)}
                      title={t(...s.label)}
                      className="card-fx group relative aspect-square rounded-xl overflow-hidden border border-foreground/10 hover:border-primary/60 transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.src} alt={t(...s.label)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] sm:text-[10px] px-1 py-0.5 truncate">{t(...s.label)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {resized && !error && (
              <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-xs text-foreground/80">
                <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p>{t(
                  `This photo was larger than ${MAX_UPLOAD_MB} MB, so it was resized in your browser before scanning. Resizing removes the file's metadata (EXIF / content credentials), so only the image itself is analyzed.`,
                  `Foto ini lebih dari ${MAX_UPLOAD_MB} MB, jadi diperkecil di browsermu sebelum dipindai. Pengecilan menghapus metadata file (EXIF / content credentials), jadi hanya gambarnya yang dianalisis.`,
                )}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div role="alert" className="flex items-start gap-3 p-4 rounded-2xl border border-red-500/30 bg-red-500/5 text-sm">
                <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-500 mb-0.5">{t("Scan could not be completed", "Pemindaian tidak bisa diselesaikan")}</p>
                  <p className="text-foreground/70">{error}</p>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className={`flex gap-3 md:gap-4 w-full transition-opacity ${!file ? "opacity-50 pointer-events-none" : ""}`}>
              <button
                onClick={reset}
                disabled={isScanning}
                className="px-5 md:px-6 py-4 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.08] hover:bg-foreground/[0.08] font-bold transition-all text-sm disabled:opacity-50"
              >
                {t("Reset", "Ulang")}
              </button>
              <button
                onClick={startScan}
                disabled={isScanning || !file}
                className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-70 ${result ? "bg-foreground/5 border border-foreground/10 hover:bg-foreground/10 text-foreground/80" : "bg-primary text-white dark:text-black hover:bg-primary/90"}`}
              >
                {isScanning ? (
                  <><RefreshCw size={20} className="animate-spin" /><span>{t("Analyzing…", "Menganalisis…")}</span></>
                ) : result ? (
                  <><RefreshCw size={20} /> {t("Rescan", "Pindai ulang")}</>
                ) : (
                  <><ScanLine size={20} /><span className="font-[family-name:var(--font-orbitron)] tracking-wider">{t("INITIATE SCAN", "MULAI PINDAI")}</span></>
                )}
              </button>
            </div>

            {isScanning && (
              <p className="text-xs text-center text-foreground/40">
                {kind === "image"
                  ? t("This usually takes 10–30 seconds.", "Biasanya butuh 10–30 detik.")
                  : kind === "video"
                    ? t("Videos can take up to a minute or two.", "Video bisa butuh satu sampai dua menit.")
                    : t("Audio clips can take up to a minute or two.", "Klip audio bisa butuh satu sampai dua menit.")}
              </p>
            )}
          </div>

          {/* RIGHT: Forensic Dashboard */}
          {result && verdict && (
            <div className="w-full flex flex-col gap-4 md:gap-5 animate-in slide-in-from-right-8 fade-in duration-700">
              {/* Verdict Banner */}
              <div style={{ "--fx-tint": verdict.hex } as React.CSSProperties} className={`card-fx w-full bg-background/40 backdrop-blur-2xl border p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl relative overflow-hidden flex items-center gap-4 md:gap-6 ${verdict.border}`}>
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 blur-[50px] rounded-full pointer-events-none ${verdict.bg}`} />
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white ${verdict.bg}`}>
                  <verdict.Icon size={30} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1 flex items-center gap-2">
                    {t("System Verdict · Risk", "Kesimpulan Sistem · Risiko")} {t(result.riskLevel, { Low: "Rendah", Medium: "Sedang", High: "Tinggi" }[result.riskLevel])}
                  </div>
                  <h2 className={`text-xl sm:text-2xl lg:text-3xl font-black font-[family-name:var(--font-orbitron)] tracking-tight ${verdict.text}`}>
                    {t(...verdict.label)}
                  </h2>
                </div>
              </div>

              {/* Gauges */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="card-fx bg-background/40 backdrop-blur-2xl border border-foreground/[0.08] rounded-3xl p-4 md:p-5 flex items-center justify-center">
                  <GaugeMeter value={result.authenticityScore} label={t("Authenticity", "Keaslian")} color={verdict.hex} />
                </div>
                <div className="card-fx bg-background/40 backdrop-blur-2xl border border-foreground/[0.08] rounded-3xl p-4 md:p-5 flex items-center justify-center">
                  <GaugeMeter value={result.confidence} label={t("Evidence Strength", "Kekuatan Bukti")} color="var(--primary)" />
                </div>
              </div>

              {/* Server adjustment notice */}
              {result.adjustment && (
                <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-xs text-foreground/80">
                  <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p>{result.adjustment}</p>
                </div>
              )}

              {/* Analysis */}
              <div className="card-fx bg-background/40 backdrop-blur-2xl border border-foreground/[0.08] rounded-3xl p-5 md:p-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 flex items-center gap-2 mb-3">
                  <Crosshair size={12} className="text-primary" /> {t("Forensic Analysis Report", "Laporan Analisis Forensik")}
                </div>
                {result.mediaDescription && (
                  <p className="text-xs text-foreground/50 italic mb-3">{result.mediaDescription}</p>
                )}
                <p className="text-sm text-foreground/80 leading-relaxed">{result.analysis}</p>
              </div>

              {/* Anomalies */}
              {result.anomalies.length > 0 && (
                <div className="card-fx [--fx-tint:#ef4444] [--fx-tint-2:#f97316] bg-red-500/5 backdrop-blur-2xl border border-red-500/20 rounded-3xl p-5 md:p-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/80 flex items-center gap-2 mb-4">
                    <Zap size={12} /> {t("Suspicious Findings", "Temuan Mencurigakan")} ({result.anomalies.length})
                  </div>
                  <ul className="flex flex-col gap-3">
                    {result.anomalies.map((a, idx) => (
                      <li
                        key={idx}
                        onMouseEnter={() => a.box && setActiveBox(idx)}
                        onMouseLeave={() => setActiveBox(null)}
                        className={`flex items-start gap-3 rounded-xl -mx-2 px-2 py-1 transition-colors ${a.box ? "cursor-pointer" : ""} ${activeBox === idx ? "bg-red-500/10" : ""}`}
                      >
                        {a.box && (
                          <span className="w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center shrink-0 mt-0.5" style={{ background: SEVERITY_HEX[a.severity] }}>
                            {idx + 1}
                          </span>
                        )}
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${SEVERITY_STYLE[a.severity]}`}>
                          {t(a.severity, { strong: "kuat", moderate: "sedang", weak: "lemah" }[a.severity])}
                        </span>
                        <div className="text-xs text-foreground/80 leading-relaxed">
                          {a.finding}
                          {a.location && <span className="block text-foreground/50 mt-0.5">↳ {a.location}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Authenticity signals */}
              {result.authenticSignals.length > 0 && (
                <div className="card-fx [--fx-tint:#10b981] [--fx-tint-2:#22d3ee] bg-emerald-500/5 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-5 md:p-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/80 flex items-center gap-2 mb-4">
                    <CheckCircle2 size={12} /> {t("Signs of Authenticity", "Tanda Keaslian")} ({result.authenticSignals.length})
                  </div>
                  <ul className="flex flex-col gap-2.5">
                    {result.authenticSignals.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-foreground/80 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Provenance */}
              <div className="card-fx bg-background/40 backdrop-blur-2xl border border-foreground/[0.08] rounded-3xl p-5 md:p-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50 flex items-center gap-2 mb-3">
                  <FileSearch size={12} className="text-primary" /> {t("File Metadata", "Metadata File")}
                </div>
                {result.provenance.length > 0 ? (
                  <ul className="flex flex-col gap-2 text-xs text-foreground/70">
                    {result.provenance.map((p, idx) => <li key={idx}>• {p}</li>)}
                  </ul>
                ) : (
                  <p className="text-xs text-foreground/50">{t("No provenance or camera metadata found. Most social apps strip it, so this alone proves nothing.", "Tidak ada metadata asal-usul atau kamera. Kebanyakan aplikasi sosial menghapusnya, jadi ini saja tidak membuktikan apa pun.")}</p>
                )}
              </div>

              <p className="text-[11px] text-foreground/40 leading-relaxed px-1">
                {t("Analyzed by", "Dianalisis oleh")} <span className="font-mono">{result.model}</span>.
                {result.cached === "demo" && t(" This is a saved result for a built-in sample, so it loaded instantly.", " Ini hasil tersimpan untuk contoh bawaan, jadi langsung muncul.")}
                {result.cached === "recent" && t(" This file was scanned recently, so the saved result was reused.", " File ini baru saja dipindai, jadi hasil sebelumnya dipakai lagi.")}{" "}
                {t(
                  "AI detection is probabilistic and can be wrong — treat this as one signal and verify important media with trusted sources.",
                  "Deteksi AI bersifat probabilistik dan bisa salah — anggap ini sebagai satu petunjuk dan verifikasi media penting dengan sumber tepercaya.",
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes radar {
          0% { top: 0%; opacity: 1; }
          90% { top: 100%; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0) }
          20% { transform: translate(-4px, 4px) }
          40% { transform: translate(-4px, -4px) }
          60% { transform: translate(4px, 4px) }
          80% { transform: translate(4px, -4px) }
        }
        .animate-glitch { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both 2; }
      `}</style>
    </div>
  );
}

// ─── Page: header with tabs for the media and text scanners ─────────

type Tab = "media" | "text";

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

function useTab(): [Tab, (t: Tab) => void] {
  const tab = useSyncExternalStore(subscribeHash, () => (window.location.hash === "#text" ? "text" : "media"), () => "media" as Tab);
  const setTab = (t: Tab) => {
    history.replaceState(null, "", t === "text" ? "#text" : window.location.pathname);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };
  return [tab, setTab];
}

const TABS: { id: Tab; label: [string, string]; sub: [string, string]; Icon: typeof Images }[] = [
  { id: "media", label: ["Media Scanner", "Pemindai Media"], sub: ["Image · Video · Audio", "Gambar · Video · Audio"], Icon: Images },
  { id: "text", label: ["Text Scanner", "Pemindai Teks"], sub: ["AI-written text", "Teks tulisan AI"], Icon: ScanText },
];

function Header({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const t = useT();
  return (
    <div className="mb-8 md:mb-12 text-center max-w-2xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/[0.03] border border-foreground/[0.08] backdrop-blur-md mb-6">
        <Activity size={14} className="text-primary animate-pulse" />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/70">AIVENTURE FORENSICS</span>
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 font-[family-name:var(--font-orbitron)] tracking-tight">
        Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-secondary">Scanner</span>
      </h1>
      <p className="text-sm md:text-base text-foreground/60 mb-8">
        {tab === "media"
          ? t(
            "Upload an image, video, or audio clip. An AI model inspects it for signs of generation or manipulation and explains its evidence.",
            "Unggah gambar, video, atau klip audio. Model AI memeriksanya untuk mencari tanda buatan AI atau manipulasi, lalu menjelaskan buktinya.",
          )
          : t(
            "Paste text or upload a document to see how much of it reads as AI-generated, AI-refined, or human-written — sentence by sentence.",
            "Tempel teks atau unggah dokumen untuk melihat berapa banyak yang tampak buatan AI, dipoles AI, atau tulisan manusia — kalimat demi kalimat.",
          )}
      </p>
      <div role="tablist" aria-label={t("Scanner type", "Jenis pemindai")} className="inline-grid grid-cols-2 gap-1 p-1 rounded-2xl bg-foreground/[0.04] border border-foreground/[0.08] w-full max-w-md">
        {TABS.map(({ id, label, sub, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${tab === id ? "bg-primary text-white dark:text-black shadow-lg shadow-primary/20" : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"}`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="leading-tight">
              <span className="block text-sm font-bold">{t(...label)}</span>
              <span className={`block text-[10px] ${tab === id ? "opacity-80" : "opacity-60"}`}>{t(...sub)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DetectorPage() {
  const [tab, setTab] = useTab();
  const header = <Header tab={tab} setTab={setTab} />;
  if (tab === "media") return <MediaScanner header={header} />;
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/10 blur-[120px]" />
      </div>
      <div className="container mx-auto px-4 py-12 md:py-24 relative z-10 max-w-7xl">
        {header}
        <TextDetector />
      </div>
    </div>
  );
}
