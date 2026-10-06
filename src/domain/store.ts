// Door 1: one localStorage key holding the whole record, versioned from day one.
import type { WorkoutId } from "./plan";

export const STORAGE_KEY = "treino:v1";

export interface Completion {
  date: string;
  workout: WorkoutId;
}

export interface TreinoRecord {
  version: 1;
  completions: Completion[];
  today: { date: string; workout: WorkoutId | null; checked: string[] };
  weights: Record<string, number>;
  restSeconds: 60 | 90;
}

export function freshRecord(today: string): TreinoRecord {
  return {
    version: 1,
    completions: [],
    today: { date: today, workout: null, checked: [] },
    weights: {},
    restSeconds: 90,
  };
}

/** A session belongs to one day: checks left from an earlier date are dropped, uncounted. */
export function rollOver(record: TreinoRecord, today: string): TreinoRecord {
  if (record.today.date === today) return record;
  return { ...record, today: { date: today, workout: null, checked: [] } };
}

const WORKOUTS = new Set(["A", "B", "C", "D"]);

/** Accepts only a door-1 record; anything else is null. */
export function parseRecord(text: string): TreinoRecord | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const r = data as Partial<TreinoRecord>;
  if (r.version !== 1) return null;
  if (!Array.isArray(r.completions) || !r.completions.every((c) => typeof c?.date === "string" && WORKOUTS.has(c?.workout))) {
    return null;
  }
  if (typeof r.weights !== "object" || r.weights === null || Array.isArray(r.weights)) return null;
  const today =
    r.today && typeof r.today.date === "string" && Array.isArray(r.today.checked)
      ? { date: r.today.date, workout: WORKOUTS.has(r.today.workout as string) ? r.today.workout! : null, checked: r.today.checked }
      : { date: "", workout: null, checked: [] };
  return {
    version: 1,
    completions: r.completions,
    today,
    weights: r.weights,
    restSeconds: r.restSeconds === 60 ? 60 : 90,
  };
}

/** Reads the stored record. `persistent` is false when localStorage cannot be read. */
export function loadRecord(today: string): { record: TreinoRecord; persistent: boolean } {
  let text: string | null;
  try {
    text = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { record: freshRecord(today), persistent: false };
  }
  const parsed = text ? parseRecord(text) : null;
  return { record: rollOver(parsed ?? freshRecord(today), today), persistent: true };
}

/** Returns false when the write failed (storage unavailable, full, or blocked). */
export function saveRecord(record: TreinoRecord): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

/** Toggles an exercise of `workout`. Checking on a different workout starts a new session. */
export function toggleCheck(record: TreinoRecord, workout: WorkoutId, exerciseId: string): TreinoRecord {
  const checked = record.today.workout === workout ? record.today.checked : [];
  const next = checked.includes(exerciseId) ? checked.filter((id) => id !== exerciseId) : [...checked, exerciseId];
  return { ...record, today: { ...record.today, workout, checked: next } };
}

export function addCompletion(record: TreinoRecord, date: string, workout: WorkoutId): TreinoRecord {
  if (record.completions.some((c) => c.date === date && c.workout === workout)) return record;
  return { ...record, completions: [...record.completions, { date, workout }] };
}

/** Parses a typed weight in kg. Empty clears it; anything outside 0–500 keeps `previous`. */
export function parseWeight(input: string, previous: number | undefined): number | undefined {
  const text = input.trim().replace(",", ".");
  if (text === "") return undefined;
  if (!/^\d+(\.\d+)?$/.test(text)) return previous;
  const value = Number(text);
  return value >= 0 && value <= 500 ? value : previous;
}
