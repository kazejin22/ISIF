// Indonesian output for the detectors.
//  • languageInstruction(): tells the model to write its free text in Indonesian.
//  • localizeResult(): translates the notes the server writes itself (verdict
//    adjustments, metadata findings, the statistical fallback), so a result
//    never mixes languages.

export type Lang = "en" | "id";

export function parseLang(value: unknown): Lang {
  return value === "id" ? "id" : "en";
}

export function msg(lang: Lang, en: string, id: string): string {
  return lang === "id" ? id : en;
}

export function languageInstruction(lang: Lang): string {
  if (lang !== "id") return "";
  return "\n\nOUTPUT LANGUAGE: Write every free-text value (descriptions, analysis, findings, locations, reasons, signals, and the language name) in Indonesian (Bahasa Indonesia). Keep JSON keys and enum values exactly as specified, in English.";
}

const VERDICT_ID: Record<string, string> = {
  REAL: "ASLI", "AI-GENERATED": "BUATAN AI", DEEPFAKE: "DEEPFAKE", UNCERTAIN: "BELUM PASTI",
};
const v = (c: string) => VERDICT_ID[c] ?? c;

const RULES: [RegExp, (...m: string[]) => string][] = [
  // Media verdict adjustments (normalize.ts)
  [/The model's verdict \(([^)]+)\) contradicted its own authenticity score \((\d+)%\), so the result was marked as uncertain\./g,
    (_, c, s) => `Kesimpulan model (${v(c)}) bertentangan dengan skor keasliannya sendiri (${s}%), jadi hasilnya ditandai belum pasti.`],
  [/The model returned (\S+) without citing any specific anomaly, so the result was marked as uncertain\./g,
    (_, c) => `Model menyimpulkan ${v(c)} tanpa menyebut kejanggalan yang spesifik, jadi hasilnya ditandai belum pasti.`],
  [/The file's embedded metadata declares it as AI-generated( \([^)]*\))?, which overrides the visual verdict \(([^)]+)\)\./g,
    (_, gen = "", c) => `Metadata di dalam file menyatakan file ini buatan AI${gen}, sehingga mengalahkan kesimpulan visual (${v(c)}).`],
  [/The file's embedded metadata declares it was edited with generative AI, so it cannot be classified as unaltered\./g,
    () => "Metadata di dalam file menyatakan file ini diedit dengan AI generatif, jadi tidak bisa dianggap belum diubah."],
  [/The model did not return a written analysis\./g, () => "Model tidak memberikan analisis tertulis."],

  // Metadata findings (provenance.ts)
  [/IPTC\/C2PA metadata declares the image was edited with generative AI \(compositeWithTrainedAlgorithmicMedia\)\./g,
    () => "Metadata IPTC/C2PA menyatakan gambar ini diedit dengan AI generatif (compositeWithTrainedAlgorithmicMedia)."],
  [/IPTC\/C2PA metadata declares the file as AI-generated \(trainedAlgorithmicMedia\)\./g,
    () => "Metadata IPTC/C2PA menyatakan file ini buatan AI (trainedAlgorithmicMedia)."],
  [/Embedded metadata names an AI generator: (.+?)\.$/g, (_, n) => `Metadata di dalam file menyebut generator AI: ${n}.`],
  [/A C2PA content-credentials manifest is present\./g, () => "Ada manifest content credentials C2PA."],
  [/Camera EXIF metadata present \(device: ([^)]+)\)\. EXIF can be forged, so treat it as weak evidence of a real capture\./g,
    (_, d) => `Ada metadata EXIF kamera (perangkat: ${d}). EXIF bisa dipalsukan, jadi anggap ini bukti lemah bahwa foto diambil langsung.`],
  [/EXIF metadata present, but no camera make\/model was recognized\./g, () => "Ada metadata EXIF, tetapi merek/model kamera tidak dikenali."],

  // Text notes (textAnalysis.ts)
  [/(\d+) sentence\(s\) were not scored by the model and are counted as human\./g,
    (_, n) => `${n} kalimat tidak dinilai oleh model dan dihitung sebagai tulisan manusia.`],
  [/The main models are out of daily quota, so a lighter backup model was used\. It misses more AI text \(especially casual or paraphrased writing\) — scan again later for a stronger check\./g,
    () => "Kuota harian model utama habis, jadi dipakai model cadangan yang lebih ringan. Model ini lebih sering melewatkan teks AI (terutama tulisan santai atau hasil parafrase) — pindai lagi nanti untuk pengecekan yang lebih kuat."],
  [/The text is short \((\d+) words\), so confidence was capped at 50%\. Longer samples give more reliable results\./g,
    (_, n) => `Teksnya pendek (${n} kata), jadi keyakinan dibatasi 50%. Teks yang lebih panjang memberi hasil lebih akurat.`],
  [/The evidence is weak \(confidence (\d+)%\), so no firm verdict is given\./g,
    (_, n) => `Buktinya lemah (keyakinan ${n}%), jadi tidak ada kesimpulan pasti.`],
  [/Contains stock phrases common in AI writing\./g, () => "Mengandung frasa umum yang sering dipakai AI."],
  [/Uniform sentence rhythm\./g, () => "Ritme kalimat seragam."],
  [/The AI analysis models are unavailable right now, so this is a quick statistical estimate based on sentence rhythm, stock phrases, and personal voice\. It is much less reliable than a full analysis — please try again in a few minutes for a real verdict\./g,
    () => "Model analisis AI sedang tidak tersedia, jadi ini perkiraan statistik cepat berdasarkan ritme kalimat, frasa umum, dan suara pribadi. Hasil ini jauh kurang akurat dibanding analisis lengkap — coba lagi beberapa menit lagi untuk kesimpulan yang sebenarnya."],
  [/Uniform sentence lengths \(burstiness (\d+)%\)\./g, (_, n) => `Panjang kalimat seragam (variasi ${n}%).`],
  [/Stock phrases: (.+?)\.$/g, (_, p) => `Frasa umum: ${p}.`],
  [/Varied sentence lengths \(burstiness (\d+)%\)\./g, (_, n) => `Panjang kalimat beragam (variasi ${n}%).`],
  [/Personal voice: first-person words appear ([\d.]+)× per 100 words\./g, (_, n) => `Suara pribadi: kata orang pertama muncul ${n}× per 100 kata.`],
  [/Statistical estimate only — /g, () => "Hanya perkiraan statistik — "],
  [/all AI analysis models are busy or out of quota right now\./g, () => "semua model analisis AI sedang sibuk atau kuotanya habis."],
  [/no AI API key is configured on the server\./g, () => "belum ada API key AI yang diatur di server."],
];

function tr(text: string): string {
  return RULES.reduce((s, [re, fn]) => s.replace(re, (...m) => fn(...(m.slice(0, -2) as string[]))), text);
}

type Localizable = {
  adjustment?: string | null;
  analysis?: string;
  provenance?: string[];
  aiSignals?: string[];
  humanSignals?: string[];
  sentences?: { reason: string }[];
};

/** Translates server-written notes into Indonesian; a no-op for English. */
export function localizeResult<T extends object>(result: T, lang: Lang): T {
  if (lang !== "id") return result;
  const r = { ...result } as T & Localizable;
  if (r.adjustment) r.adjustment = tr(r.adjustment);
  if (r.analysis) r.analysis = tr(r.analysis);
  if (r.provenance) r.provenance = r.provenance.map(tr);
  if (r.aiSignals) r.aiSignals = r.aiSignals.map(tr);
  if (r.humanSignals) r.humanSignals = r.humanSignals.map(tr);
  if (r.sentences) r.sentences = r.sentences.map((s) => ({ ...s, reason: tr(s.reason) }));
  return r;
}
