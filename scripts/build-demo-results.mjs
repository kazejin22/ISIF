// Scans the built-in detector samples once through a running dev server and saves
// the results to src/data/demoResults.json, so demos never depend on AI quota.
//   npm run dev   (in another terminal), then:   node scripts/build-demo-results.mjs
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = new URL("../src/data/demoResults.json", import.meta.url);
const sha = (d) => createHash("sha256").update(d).digest("hex");

const MEDIA = [
  ["public/game/rof/e1.jpg", "image/jpeg", "real"],
  ["public/game/rof/e8.jpg", "image/jpeg", "ai"],
  ["public/game/rof/e6.jpg", "image/jpeg", "ai"],
  ["public/game/rof/e7.jpg", "image/jpeg", "real"],
];

const out = JSON.parse(await readFile(OUT, "utf8"));

// English results use the bare hash; other languages add ":<lang>" (see the API routes).
const LANGS = ["en", "id"];
const keyOf = (hash, lang) => (lang === "en" ? hash : `${hash}:${lang}`);

for (const lang of LANGS) for (const [path, type, expected] of MEDIA) {
  const bytes = await readFile(new URL(`../${path}`, import.meta.url));
  const hash = keyOf(sha(bytes), lang);
  if (out.media[hash]) { console.log("skip (saved)", lang, path); continue; }
  const form = new FormData();
  form.append("file", new Blob([bytes], { type }), path.split("/").pop());
  const r = await (await fetch(`${BASE}/api/detect?lang=${lang}`, { method: "POST", body: form })).json();
  if (!r.success) { console.log("FAIL", lang, path, r.error); continue; }
  delete r.cached;
  const got = r.conclusion === "REAL" ? "real" : r.conclusion === "UNCERTAIN" ? "uncertain" : "ai";
  console.log(got === expected ? "ok  " : "MISS", lang, path, r.conclusion, r.authenticityScore, r.model);
  out.media[hash] = r;
}

const { TEXT_SAMPLES } = await import("../src/data/textSamples.ts").catch(async () => {
  // Node can't import .ts directly on older versions: pull the array out of the file.
  const src = await readFile(new URL("../src/data/textSamples.ts", import.meta.url), "utf8");
  return { TEXT_SAMPLES: Function(`return ${src.slice(src.indexOf("["), src.lastIndexOf("]") + 1)}`)() };
});

for (const lang of LANGS) for (const s of TEXT_SAMPLES) {
  const text = s.text.replace(/\r\n?/g, "\n").trim();
  const hash = keyOf(sha(text), lang);
  if (out.text[hash]) { console.log("skip (saved)", lang, s.label); continue; }
  const r = await (await fetch(`${BASE}/api/detect-text?lang=${lang}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }),
  })).json();
  if (!r.success || r.mode !== "model") { console.log("FAIL", lang, s.label, r.error ?? "statistical fallback only"); continue; }
  delete r.cached;
  console.log("done", lang, s.label, r.conclusion, JSON.stringify(r.breakdown), r.model);
  out.text[hash] = r;
}

await writeFile(OUT, JSON.stringify(out, null, 1) + "\n");
console.log("saved", Object.keys(out.media).length, "media +", Object.keys(out.text).length, "text results");
