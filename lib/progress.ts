"use client";

import { useSyncExternalStore } from "react";

// Client-side progress, kept in localStorage (mock persistence — no backend).

export type Progress = {
  xp: number;
  learned: string[]; // word ids marked "I know this"
  quizzesTaken: number;
  bestScores: Record<string, number>; // quiz key -> best percentage
  streak: number;
  lastActive: string | null; // YYYY-MM-DD
};

const KEY = "sanskrit-progress-v1";

const DEFAULT: Progress = {
  xp: 0,
  learned: [],
  quizzesTaken: 0,
  bestScores: {},
  streak: 0,
  lastActive: null,
};

let cache: Progress = DEFAULT;
let cacheRaw: string | null = null;
const listeners = new Set<() => void>();

function read(): Progress {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cache; // storage blocked: fall back to in-memory state
  }
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    cache = raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    cache = DEFAULT;
  }
  return cache;
}

// When XP last went up — lets the UI celebrate real gains but not page loads.
let xpGainedAt = 0;
export const msSinceXpGain = () => Date.now() - xpGainedAt;

function write(next: Progress) {
  if (next.xp > cache.xp) xpGainedAt = Date.now();
  const raw = JSON.stringify(next);
  cache = next;
  cacheRaw = raw;
  try {
    localStorage.setItem(KEY, raw);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Every rewarding action counts as activity for the daily streak.
function withActivity(p: Progress): Progress {
  const today = dayKey(new Date());
  if (p.lastActive === today) return p;
  const yesterday = dayKey(new Date(Date.now() - 86_400_000));
  return { ...p, lastActive: today, streak: p.lastActive === yesterday ? p.streak + 1 : 1 };
}

export const actions = {
  addXp(n: number) {
    const p = withActivity(read());
    write({ ...p, xp: p.xp + n });
  },
  setLearned(id: string, learned: boolean) {
    const p = read();
    const has = p.learned.includes(id);
    if (learned === has) return;
    const next = learned ? withActivity(p) : p;
    write({
      ...next,
      learned: learned ? [...p.learned, id] : p.learned.filter((x) => x !== id),
      xp: learned ? next.xp + 5 : next.xp,
    });
  },
  recordQuiz(key: string, correct: number, total: number) {
    const p = withActivity(read());
    const pct = Math.round((correct / total) * 100);
    write({
      ...p,
      xp: p.xp + correct * 10,
      quizzesTaken: p.quizzesTaken + 1,
      bestScores: { ...p.bestScores, [key]: Math.max(pct, p.bestScores[key] ?? 0) },
    });
  },
  reset() {
    write(DEFAULT);
  },
};

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, read, () => DEFAULT);
}

export const levelFor = (xp: number) => ({
  level: Math.floor(xp / 100) + 1,
  into: xp % 100,
});
