import { MISSIONS } from "../missions";
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
}

export interface LabEvidence extends ImageRound {
  /** height / width of the image */
  aspect: number;
  clues: Clue[];
}

const CLUES: Record<string, { aspect: number; clues: Clue[] }> = {
  r1: { aspect: 651 / 960, clues: [
    { x: 0.71, y: 0.64, r: 0.08, label: "Read the text on the sack" },
    { x: 0.41, y: 0.47, r: 0.1, label: "Look at the person and the dust" },
    { x: 0.12, y: 0.42, r: 0.08, label: "Check the tyre tracks" },
  ] },
  r2: { aspect: 731 / 960, clues: [
    { x: 0.62, y: 0.79, r: 0.07, label: "Read the licence plate" },
    { x: 0.62, y: 0.64, r: 0.05, label: "Look at the car's emblem" },
    { x: 0.5, y: 0.13, r: 0.09, label: "Check the photo's texture" },
  ] },
  r3: { aspect: 1439 / 960, clues: [
    { x: 0.46, y: 0.3, r: 0.15, label: "Look closely at the flame" },
    { x: 0.57, y: 0.46, r: 0.06, label: "Check the hand and grip" },
    { x: 0.65, y: 0.66, r: 0.06, label: "Check the toes on the wood" },
  ] },
  r4: { aspect: 538 / 960, clues: [
    { x: 0.465, y: 0.63, r: 0.05, label: "Try to read the badge" },
    { x: 0.8, y: 0.42, r: 0.09, label: "Compare the faces at the back" },
    { x: 0.64, y: 0.5, r: 0.07, label: "Look at the desks at the back" },
  ] },
  r5: { aspect: 638 / 960, clues: [
    { x: 0.48, y: 0.41, r: 0.1, label: "Read the signs" },
    { x: 0.17, y: 0.68, r: 0.09, label: "Follow the handrails" },
    { x: 0.59, y: 0.62, r: 0.07, label: "Look at her pose and shadow" },
  ] },
  r6: { aspect: 540 / 960, clues: [
    { x: 0.32, y: 0.81, r: 0.09, label: "What is he holding?" },
    { x: 0.57, y: 0.27, r: 0.1, label: "Who is this, and when did he live?" },
  ] },
  r7: { aspect: 639 / 960, clues: [
    { x: 0.5, y: 0.49, r: 0.08, label: "Look at the teeth" },
    { x: 0.47, y: 0.31, r: 0.09, label: "Look at the skin and wrinkles" },
    { x: 0.7, y: 0.76, r: 0.09, label: "Follow the shirt pattern" },
  ] },
  r8: { aspect: 1, clues: [
    { x: 0.48, y: 0.17, r: 0.09, label: "Look at the beam of light" },
    { x: 0.18, y: 0.68, r: 0.09, label: "Compare the two cabins" },
    { x: 0.75, y: 0.68, r: 0.09, label: "Compare the two cabins" },
  ] },
};

const stage = MISSIONS.find((m) => m.id === "real-or-synthetic")!.stages[0] as RealOrFakeStage;

export const LAB_EVIDENCE: LabEvidence[] = stage.rounds.map((round) => ({ ...round, ...CLUES[round.id] }));

export const LAB_MISSION_ID = "vr-forensic-lab";
export const LAB_MAX_SCORE = 1000;
