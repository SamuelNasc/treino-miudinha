import { addDays, weekStart } from "./dates";
import type { WorkoutId } from "./plan";
import type { Completion } from "./store";

const WEEK_GOAL = 3;

function countInWeek(completions: Completion[], monday: string): number {
  const sunday = addDays(monday, 6);
  return completions.filter((c) => c.date >= monday && c.date <= sunday).length;
}

export function weekCount(completions: Completion[], today: string): number {
  return countInWeek(completions, weekStart(today));
}

/**
 * Consecutive Mon–Sun weeks with 3+ completions, ending with last week, plus 1 when the
 * current week already reached 3. A current week still below 3 never breaks the streak.
 */
export function streak(completions: Completion[], today: string): number {
  const current = weekStart(today);
  let n = 0;
  for (let monday = addDays(current, -7); countInWeek(completions, monday) >= WEEK_GOAL; monday = addDays(monday, -7)) {
    n++;
  }
  return countInWeek(completions, current) >= WEEK_GOAL ? n + 1 : n;
}

export interface StripDay {
  date: string;
  label: string;
  letters: WorkoutId[];
  isToday: boolean;
  isFuture: boolean;
}

const LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function weekStrip(completions: Completion[], today: string): StripDay[] {
  const monday = weekStart(today);
  return LABELS.map((label, i) => {
    const date = addDays(monday, i);
    return {
      date,
      label,
      letters: completions.filter((c) => c.date === date).map((c) => c.workout),
      isToday: date === today,
      isFuture: date > today,
    };
  });
}
