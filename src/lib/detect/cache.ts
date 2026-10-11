// Result cache for the detectors, keyed by a SHA-256 of the exact input.
//  • Demo results: verified answers for the built-in samples, saved in
//    src/data/demoResults.json, so a demo never depends on the AI quota.
//  • Recent results: an in-memory LRU per server instance, so scanning the
//    same file twice doesn't spend the quota again.

import { createHash } from "node:crypto";
import demoResults from "@/data/demoResults.json";

type Kind = "media" | "text";

const MAX_ENTRIES = 300;
const TTL_MS = 24 * 60 * 60 * 1000;
const recent = new Map<string, { at: number; value: unknown }>();

const demo = demoResults as Record<Kind, Record<string, unknown>>;

export function hashOf(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

export function getCached<T extends object>(kind: Kind, hash: string): (T & { cached: "demo" | "recent" }) | null {
  const fromDemo = demo[kind]?.[hash];
  if (fromDemo) return { ...(fromDemo as T), cached: "demo" };

  const key = `${kind}:${hash}`;
  const hit = recent.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    recent.delete(key);
    return null;
  }
  // Refresh its place in the LRU order.
  recent.delete(key);
  recent.set(key, hit);
  return { ...(hit.value as T), cached: "recent" };
}

export function setCached(kind: Kind, hash: string, value: object): void {
  const key = `${kind}:${hash}`;
  recent.delete(key);
  recent.set(key, { at: Date.now(), value });
  while (recent.size > MAX_ENTRIES) recent.delete(recent.keys().next().value!);
}
