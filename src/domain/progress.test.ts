import { describe, expect, it } from "vitest";
import { streak, weekCount } from "./progress";
import type { Completion } from "./store";
import type { WorkoutId } from "./plan";

const c = (date: string, workout: WorkoutId = "A"): Completion => ({ date, workout });

// Weeks (Mon..Sun): 2026-09-21, 2026-09-28, 2026-10-05 (current; today Thu 2026-10-08)
const TODAY = "2026-10-08";

describe("progress", () => {
  it("week count uses Mon-Sun week", () => {
    expect(weekCount([], TODAY)).toBe(0);
    expect(weekCount([c("2026-10-04")], TODAY)).toBe(0); // Sunday before
    expect(weekCount([c("2026-10-05")], TODAY)).toBe(1); // this Monday
    expect(weekCount([c("2026-10-11")], TODAY)).toBe(1); // this Sunday
    expect(weekCount([c("2026-10-04"), c("2026-10-05"), c("2026-10-07", "B"), c("2026-10-12")], TODAY)).toBe(2);
  });

  it("streak counts past weeks with 3+", () => {
    const completions = [
      c("2026-09-21", "A"), c("2026-09-22", "B"), c("2026-09-24", "C"), // 3
      c("2026-09-28", "D"), c("2026-09-29", "A"), c("2026-10-01", "B"), c("2026-10-02", "C"), // 4
      c("2026-10-05", "D"), c("2026-10-06", "A"), // 2, current week
    ];
    expect(streak(completions, TODAY)).toBe(2);
    expect(weekCount(completions, TODAY)).toBe(2);
  });

  it("current week with 3+ adds one", () => {
    const completions = [
      c("2026-09-28", "A"), c("2026-09-29", "B"), c("2026-10-01", "C"), // 3
      c("2026-10-05", "D"), c("2026-10-06", "A"), c("2026-10-08", "B"), // 3, current
    ];
    expect(streak(completions, TODAY)).toBe(2);
    expect(streak(completions.slice(3), TODAY)).toBe(1);
  });

  it("streak stops at first non-qualifying past week", () => {
    // Last week qualifies, the week before has none, the one before that qualifies.
    const gap = [
      c("2026-09-14"), c("2026-09-15"), c("2026-09-16"),
      c("2026-09-28"), c("2026-09-29"), c("2026-09-30"),
    ];
    expect(streak(gap, TODAY)).toBe(1);
    // Last week has only 2: streak is 0 even though earlier weeks qualified.
    const broken = [
      c("2026-09-21"), c("2026-09-22"), c("2026-09-23"),
      c("2026-09-28"), c("2026-09-29"),
    ];
    expect(streak(broken, TODAY)).toBe(0);
  });
});
