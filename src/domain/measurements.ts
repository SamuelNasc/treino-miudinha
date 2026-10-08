// Measurement door 1: optional fields inside the version-1 record. Door 3: at most one entry per date.
import { daysBetween, isLocalDate } from "./dates";
import { isValidValue, type MeasureId } from "./measures";
import type { TreinoRecord } from "./store";

export type MeasureValues = Partial<Record<MeasureId, number>>;

export interface Measurement {
  date: string;
  values: MeasureValues;
}

export interface ReminderSettings {
  everyDays: 7 | 14 | 30 | null;
  snoozedOn: string | null;
}

export const DEFAULT_REMINDER: ReminderSettings = { everyDays: 7, snoozedOn: null };

export type SaveResult =
  | { ok: true; record: TreinoRecord }
  | { ok: false; reason: "empty" | "date"; record: TreinoRecord }
  | { ok: false; reason: "invalid"; invalid: MeasureId[]; record: TreinoRecord };

/** A missing field means none yet. */
export function measurementsOf(record: TreinoRecord): Measurement[] {
  return record.measurements ?? [];
}

export function reminderOf(record: TreinoRecord): ReminderSettings {
  return record.reminder ?? DEFAULT_REMINDER;
}

function byDate(a: Measurement, b: Measurement) {
  return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
}

/** Adds an entry for `date`, or merges into the one there: given values overwrite, the rest stay. */
export function saveMeasurement(record: TreinoRecord, date: string, values: MeasureValues, today: string): SaveResult {
  const given = Object.entries(values).filter(([, v]) => v !== undefined) as [MeasureId, number][];
  if (given.length === 0) return { ok: false, reason: "empty", record };
  if (!isLocalDate(date) || date > today) return { ok: false, reason: "date", record };
  const invalid = given.filter(([id, v]) => !isValidValue(id, v)).map(([id]) => id);
  if (invalid.length > 0) return { ok: false, reason: "invalid", invalid, record };

  const list = measurementsOf(record);
  const existing = list.find((m) => m.date === date);
  const entry = { date, values: { ...existing?.values, ...Object.fromEntries(given) } };
  const measurements = [...list.filter((m) => m.date !== date), entry].sort(byDate);
  return { ok: true, record: { ...record, measurements } };
}

export function deleteMeasurement(record: TreinoRecord, date: string): TreinoRecord {
  return { ...record, measurements: measurementsOf(record).filter((m) => m.date !== date) };
}

/** The latest date with a tape measure. A weight-only entry never counts. */
export function lastTapeDate(record: TreinoRecord): string | null {
  const tape = measurementsOf(record).filter((m) => Object.keys(m.values).some((id) => id !== "peso"));
  return tape.length > 0 ? tape[tape.length - 1].date : null;
}

export type ReminderDue = { first: true } | { days: number } | null;

/** Derived at render, never stored (Key decision 5): on, not snoozed today, and no tape yet or the interval has passed. */
export function reminderDue(record: TreinoRecord, today: string): ReminderDue {
  const { everyDays, snoozedOn } = reminderOf(record);
  if (everyDays === null || snoozedOn === today) return null;
  const last = lastTapeDate(record);
  if (last === null) return { first: true };
  const days = daysBetween(last, today);
  return days >= everyDays ? { days } : null;
}

/** Keeps the valid parts of stored entries: bad values and empty or undated entries are dropped. */
export function parseMeasurements(data: unknown): Measurement[] {
  if (!Array.isArray(data)) return [];
  const byDay = new Map<string, MeasureValues>();
  for (const item of data) {
    if (typeof item !== "object" || item === null) continue;
    const { date, values } = item as { date?: unknown; values?: unknown };
    if (!isLocalDate(date) || typeof values !== "object" || values === null || Array.isArray(values)) continue;
    const valid = Object.entries(values).filter(([id, v]) => isValidValue(id, v));
    if (valid.length === 0) continue;
    byDay.set(date, { ...byDay.get(date), ...Object.fromEntries(valid) });
  }
  return [...byDay].map(([date, values]) => ({ date, values })).sort(byDate);
}

export function parseReminder(data: unknown): ReminderSettings {
  const r = (typeof data === "object" && data !== null ? data : {}) as { everyDays?: unknown; snoozedOn?: unknown };
  const everyDays = r.everyDays === null || r.everyDays === 14 || r.everyDays === 30 ? r.everyDays : 7;
  return { everyDays, snoozedOn: isLocalDate(r.snoozedOn) ? r.snoozedOn : null };
}
