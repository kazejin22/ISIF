"use client";

import { useSyncExternalStore } from "react";
import { MISSIONS } from "./missions";

// Agent profiles and best scores, kept in localStorage. Several people can play
// on one device (e.g. at an exhibition booth), so each agent has a profile.

export interface AgentProfile {
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

export function totalScore(agent: AgentProfile | undefined) {
  return agent ? MISSIONS.reduce((sum, m) => sum + (agent.best[m.id] ?? 0), 0) : 0;
}

export function signIn(rawName: string) {
  const name = rawName.trim().replace(/\s+/g, " ").slice(0, 24);
  if (!name) return;
  const state = read();
  const existing = state.agents[name];
  write({
    current: name,
    agents: { ...state.agents, [name]: existing ?? { name, best: {}, updatedAt: Date.now() } },
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
  const agent = state.agents[name] ?? { name, best: {}, updatedAt: Date.now() };
  const previous = agent.best[missionId] ?? -1;
  if (score <= previous) return false;
  write({
    ...state,
    agents: { ...state.agents, [name]: { ...agent, best: { ...agent.best, [missionId]: score }, updatedAt: Date.now() } },
  });
  return true;
}

export function leaderboard(state: GameState, limit = 10) {
  return Object.values(state.agents)
    .map((a) => ({ name: a.name, total: totalScore(a), missions: Object.keys(a.best).length, updatedAt: a.updatedAt }))
    .filter((a) => a.missions > 0)
    .sort((a, b) => b.total - a.total || a.updatedAt - b.updatedAt)
    .slice(0, limit);
}
