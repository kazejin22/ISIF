"use client";

import { useSyncExternalStore } from "react";
import { SCORED_MISSION_IDS } from "./missions";

// Agent profiles and best scores, kept in localStorage. Several people can play
// on one device (e.g. at an exhibition booth), so each agent has a profile.

export interface AgentProfile {
  /** Random id that identifies this agent on the online leaderboard. */
  id?: string;
  name: string;
  best: Record<string, number>;
  updatedAt: number;
}

interface GameState {
  current: string | null;
  agents: Record<string, AgentProfile>;
}

const KEY = "aiventure.detective.v1";
const EMPTY: GameState = { current: null, agents: {} };
const listeners = new Set<() => void>();
let cache: GameState | null = null;

function read(): GameState {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache!;
}

function write(next: GameState) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked — keep the in-memory state */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useGameState(): GameState {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** Sum of the agent's best scores over every web and VR mission. */
export function totalScore(agent: AgentProfile | undefined) {
  return agent ? SCORED_MISSION_IDS.reduce((sum, id) => sum + (agent.best[id] ?? 0), 0) : 0;
}

function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    // randomUUID needs a secure context (https or localhost).
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  }
}

/** Sends one best score to the online leaderboard. Failures are ignored: the score stays on the device. */
function submit(agent: AgentProfile, missionId: string, score: number) {
  if (!agent.id) return;
  fetch("/api/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId: agent.id, name: agent.name, missionId, score }),
    keepalive: true,
  }).catch(() => {});
}

const synced = new Set<string>();

/**
 * Uploads every best score of the current agent once per page load, so scores
 * earned before the online leaderboard existed (or while offline) still appear.
 */
export function syncCurrentAgent() {
  const state = read();
  const agent = state.current ? state.agents[state.current] : undefined;
  if (!agent) return;
  const withId = agent.id ? agent : { ...agent, id: newId() };
  if (withId !== agent) write({ ...state, agents: { ...state.agents, [agent.name]: withId } });
  if (synced.has(withId.id!)) return;
  synced.add(withId.id!);
  for (const [missionId, score] of Object.entries(withId.best)) submit(withId, missionId, score);
}

export function signIn(rawName: string) {
  const name = rawName.trim().replace(/\s+/g, " ").slice(0, 24);
  if (!name) return;
  const state = read();
  const existing = state.agents[name];
  write({
    current: name,
    agents: { ...state.agents, [name]: existing ? { ...existing, id: existing.id ?? newId() } : { id: newId(), name, best: {}, updatedAt: Date.now() } },
  });
}

export function signOut() {
  write({ ...read(), current: null });
}

/** Records a mission score; returns true when it's a new personal best. */
export function recordScore(missionId: string, score: number): boolean {
  const state = read();
  const name = state.current;
  if (!name) return false;
  const stored = state.agents[name] ?? { name, best: {}, updatedAt: Date.now() };
  const agent = stored.id ? stored : { ...stored, id: newId() };
  const previous = agent.best[missionId] ?? -1;
  if (score <= previous) return false;
  const next = { ...agent, best: { ...agent.best, [missionId]: score }, updatedAt: Date.now() };
  write({ ...state, agents: { ...state.agents, [name]: next } });
  submit(next, missionId, score);
  return true;
}

export function leaderboard(state: GameState, limit = 10) {
  return Object.values(state.agents)
    .map((a) => ({ name: a.name, total: totalScore(a), missions: Object.keys(a.best).filter((id) => SCORED_MISSION_IDS.includes(id)).length, updatedAt: a.updatedAt }))
    .filter((a) => a.missions > 0)
    .sort((a, b) => b.total - a.total || a.updatedAt - b.updatedAt)
    .slice(0, limit);
}
