"use client";

// Lightweight English / Indonesian switch.
//  • UI copy is written inline:      t("Scan now", "Pindai sekarang")
//  • Data copy (missions, cases…) is looked up by its English text in the
//    dictionaries under src/i18n/ — t(item.title) — and falls back to English.
// The choice is saved per browser; the first visit follows the device language.

import { useSyncExternalStore } from "react";
import { ID_DICTIONARY } from "@/i18n";

export type Lang = "en" | "id";

const KEY = "aiventure-lang";
const EVENT = "aiventure-lang-change";

function read(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "en" || saved === "id") return saved;
  } catch {
    // Storage blocked: fall through to the device language.
  }
  return navigator.language?.toLowerCase().startsWith("id") ? "id" : "en";
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function setLang(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // Not persisted, but still switch for this page view.
  }
  document.documentElement.lang = lang;
  window.dispatchEvent(new Event(EVENT));
}

/** The current language. English during SSR and hydration, then the saved choice. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, read, () => "en");
}

export type Translate = (en: string, id?: string) => string;

export function translator(lang: Lang): Translate {
  return (en, id) => (lang === "id" ? (id ?? ID_DICTIONARY[en] ?? en) : en);
}

/** `t(en, id?)` for the current language. Without `id`, the dictionary is used. */
export function useT(): Translate {
  return translator(useLang());
}

/** Translated text for server components: <T en="Learning" id="Belajar" />. */
export function T({ en, id }: { en: string; id?: string }) {
  return useT()(en, id);
}
