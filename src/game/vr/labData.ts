import { MISSIONS } from "../missions";
import type { ImageRound, RealOrFakeStage } from "../types";

// Clues revealed by the AI Scanner in the VR Forensic Lab.
// x / y are fractions of the image (from the top-left); r is a fraction of its width.

export interface Clue {
  x: number;
  y: number;
  r: number;
  label: string;
}

export interface LabEvidence extends ImageRound {
  /** height / width of the image */
  aspect: number;
  clues: Clue[];
}

const CLUES: Record<string, { aspect: number; clues: Clue[] }> = {
  r1: { aspect: 651 / 960, clues: [
    { x: 0.71, y: 0.64, r: 0.08, label: "Real brand text: BERAS BULOG" },
    { x: 0.41, y: 0.47, r: 0.1, label: "Natural pose, dust & motion" },
    { x: 0.12, y: 0.42, r: 0.08, label: "Consistent tyre tracks" },
  ] },
  r2: { aspect: 731 / 960, clues: [
    { x: 0.62, y: 0.79, r: 0.07, label: "Gibberish plate: 1107ES 6119" },
    { x: 0.62, y: 0.64, r: 0.05, label: "Emblem of no real brand" },
    { x: 0.5, y: 0.13, r: 0.09, label: "Even, filter-like 'vintage' texture" },
  ] },
  r3: { aspect: 1439 / 960, clues: [
    { x: 0.46, y: 0.3, r: 0.15, label: "Chaotic, physically real flame" },
    { x: 0.57, y: 0.46, r: 0.06, label: "Correct hand & grip" },
    { x: 0.65, y: 0.66, r: 0.06, label: "Toes rest naturally on the wood" },
  ] },
  r4: { aspect: 538 / 960, clues: [
    { x: 0.465, y: 0.63, r: 0.05, label: "Unreadable badge text" },
    { x: 0.8, y: 0.42, r: 0.09, label: "Repeated faces & poses" },
    { x: 0.64, y: 0.5, r: 0.07, label: "Desks melt together" },
  ] },
  r5: { aspect: 638 / 960, clues: [
    { x: 0.48, y: 0.41, r: 0.1, label: "Readable real place names" },
    { x: 0.17, y: 0.68, r: 0.09, label: "Handrails keep true perspective" },
    { x: 0.59, y: 0.62, r: 0.07, label: "Natural pose & shadow" },
  ] },
  r6: { aspect: 540 / 960, clues: [
    { x: 0.32, y: 0.81, r: 0.09, label: "Smartphone: invented ~140 years later" },
    { x: 0.57, y: 0.27, r: 0.1, label: "Lincoln died in 1865" },
  ] },
  r7: { aspect: 639 / 960, clues: [
    { x: 0.5, y: 0.49, r: 0.08, label: "Natural, uneven teeth" },
    { x: 0.47, y: 0.31, r: 0.09, label: "Deep, irregular wrinkles" },
    { x: 0.7, y: 0.76, r: 0.09, label: "Check pattern stays consistent" },
  ] },
  r8: { aspect: 1, clues: [
    { x: 0.48, y: 0.17, r: 0.09, label: "Impossible beam of light" },
    { x: 0.18, y: 0.68, r: 0.09, label: "Duplicated cabin" },
    { x: 0.75, y: 0.68, r: 0.09, label: "Duplicated cabin" },
  ] },
};

const stage = MISSIONS.find((m) => m.id === "real-or-synthetic")!.stages[0] as RealOrFakeStage;

export const LAB_EVIDENCE: LabEvidence[] = stage.rounds.map((round) => ({ ...round, ...CLUES[round.id] }));

export const LAB_MISSION_ID = "vr-forensic-lab";
export const LAB_MAX_SCORE = 1000;
