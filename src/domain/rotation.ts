import { weekdayIndex } from "./dates";
import { WORKOUT_IDS, type WorkoutId } from "./plan";
import type { Completion } from "./store";

/** The workout after the most recent completion, in the order A→B→C→D→A. */
export function nextWorkout(completions: Completion[]): WorkoutId {
  if (completions.length === 0) return "A";
  // Latest date wins; on the same date, the one recorded last.
  const last = completions.reduce((a, b) => (b.date >= a.date ? b : a));
  return WORKOUT_IDS[(WORKOUT_IDS.indexOf(last.workout) + 1) % WORKOUT_IDS.length];
}

/** Wednesday, Saturday and Sunday are rest days in the trainer's plan. */
export function isRestDay(date: string): boolean {
  return [2, 5, 6].includes(weekdayIndex(date));
}
