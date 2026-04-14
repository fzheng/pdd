import { BeadPattern } from "@/types";

export interface PatternHistory {
  past: BeadPattern[];
  present: BeadPattern | null;
  future: BeadPattern[];
}

export function emptyHistory(): PatternHistory {
  return { past: [], present: null, future: [] };
}

/** Replace the current pattern, discarding redo stack. Keep past bounded. */
export function pushPattern(
  history: PatternHistory,
  pattern: BeadPattern,
  limit = 40,
): PatternHistory {
  const past =
    history.present === null
      ? history.past
      : [...history.past, history.present].slice(-limit);
  return { past, present: pattern, future: [] };
}

export function undo(history: PatternHistory): PatternHistory {
  if (history.past.length === 0 || history.present === null) return history;
  const prev = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present: prev,
    future: [history.present, ...history.future],
  };
}

export function redo(history: PatternHistory): PatternHistory {
  if (history.future.length === 0) return history;
  const next = history.future[0];
  return {
    past: history.present === null ? history.past : [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}

export const canUndo = (h: PatternHistory) => h.past.length > 0 && h.present !== null;
export const canRedo = (h: PatternHistory) => h.future.length > 0;
