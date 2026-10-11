import { missionsFor } from "../missions";
import type { ImageRound, RealOrFakeStage } from "../types";

// "Where to look" hints revealed by the AI Scanner in the VR Forensic Lab.
// Labels are deliberately neutral: they point at evidence without giving the
// answer away, so the player still has to decide. The explanation after each
// answer says what the evidence means.
// x / y are fractions of the image (from the top-left); r is a fraction of its width.

export interface Clue {
  x: number;
  y: number;
  r: number;
  label: string;
  labelId: string;
}

export interface LabEvidence extends ImageRound {
  /** height / width of the image */
  aspect: number;
  clues: Clue[];
}

const CLUES: Record<string, { aspect: number; clues: Clue[] }> = {
  r1: { aspect: 651 / 960, clues: [
    { x: 0.71, y: 0.64, r: 0.08, label: "Read the text on the sack", labelId: "Baca tulisan di karung" },
    { x: 0.41, y: 0.47, r: 0.1, label: "Look at the person and the dust", labelId: "Lihat orang dan debunya" },
    { x: 0.12, y: 0.42, r: 0.08, label: "Check the tyre tracks", labelId: "Periksa jejak ban" },
  ] },
  r2: { aspect: 731 / 960, clues: [
    { x: 0.62, y: 0.79, r: 0.07, label: "Read the licence plate", labelId: "Baca pelat nomornya" },
    { x: 0.62, y: 0.64, r: 0.05, label: "Look at the car's emblem", labelId: "Lihat logo mobilnya" },
    { x: 0.5, y: 0.13, r: 0.09, label: "Check the photo's texture", labelId: "Periksa tekstur fotonya" },
  ] },
  r3: { aspect: 1439 / 960, clues: [
    { x: 0.46, y: 0.3, r: 0.15, label: "Look closely at the flame", labelId: "Perhatikan apinya baik-baik" },
    { x: 0.57, y: 0.46, r: 0.06, label: "Check the hand and grip", labelId: "Periksa tangan dan genggamannya" },
    { x: 0.65, y: 0.66, r: 0.06, label: "Check the toes on the wood", labelId: "Periksa jari kaki di kayu" },
  ] },
  r4: { aspect: 538 / 960, clues: [
    { x: 0.465, y: 0.63, r: 0.05, label: "Try to read the badge", labelId: "Coba baca lencananya" },
    { x: 0.8, y: 0.42, r: 0.09, label: "Compare the faces at the back", labelId: "Bandingkan wajah di belakang" },
    { x: 0.64, y: 0.5, r: 0.07, label: "Look at the desks at the back", labelId: "Lihat meja-meja di belakang" },
  ] },
  r5: { aspect: 638 / 960, clues: [
    { x: 0.48, y: 0.41, r: 0.1, label: "Read the signs", labelId: "Baca papan petunjuknya" },
    { x: 0.17, y: 0.68, r: 0.09, label: "Follow the handrails", labelId: "Ikuti pegangan tangannya" },
    { x: 0.59, y: 0.62, r: 0.07, label: "Look at her pose and shadow", labelId: "Lihat pose dan bayangannya" },
  ] },
  r6: { aspect: 540 / 960, clues: [
    { x: 0.32, y: 0.81, r: 0.09, label: "What is he holding?", labelId: "Apa yang dia pegang?" },
    { x: 0.57, y: 0.27, r: 0.1, label: "Who is this, and when did he live?", labelId: "Siapa ini, dan kapan dia hidup?" },
  ] },
  r7: { aspect: 639 / 960, clues: [
    { x: 0.5, y: 0.49, r: 0.08, label: "Look at the teeth", labelId: "Lihat giginya" },
    { x: 0.47, y: 0.31, r: 0.09, label: "Look at the skin and wrinkles", labelId: "Lihat kulit dan kerutannya" },
    { x: 0.7, y: 0.76, r: 0.09, label: "Follow the shirt pattern", labelId: "Ikuti pola kemejanya" },
  ] },
  r8: { aspect: 1, clues: [
    { x: 0.48, y: 0.17, r: 0.09, label: "Look at the beam of light", labelId: "Lihat berkas cahayanya" },
    { x: 0.18, y: 0.68, r: 0.09, label: "Compare the two cabins", labelId: "Bandingkan kedua kabin" },
    { x: 0.75, y: 0.68, r: 0.09, label: "Compare the two cabins", labelId: "Bandingkan kedua kabin" },
  ] },
};

function build(lang: "en" | "id"): LabEvidence[] {
  const stage = missionsFor(lang).find((m) => m.id === "real-or-synthetic")!.stages[0] as RealOrFakeStage;
  return stage.rounds.map((round) => {
    const { aspect, clues } = CLUES[round.id];
    return { ...round, aspect, clues: clues.map((c) => ({ ...c, label: lang === "id" ? c.labelId : c.label })) };
  });
}

const BY_LANG = { en: build("en"), id: build("id") };

/** The evidence (photos, explanations and scanner hints) in the player's language. */
export function labEvidenceFor(lang: "en" | "id"): LabEvidence[] {
  return BY_LANG[lang];
}

export const LAB_MISSION_ID = "vr-forensic-lab";
export const LAB_MAX_SCORE = 1000;
