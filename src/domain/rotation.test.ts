import { describe, expect, it } from "vitest";
import { isRestDay, nextWorkout } from "./rotation";
import type { WorkoutId } from "./plan";

describe("rotation", () => {
  it("next workout follows A-B-C-D-A", () => {
    expect(nextWorkout([])).toBe("A");
    const cases: [WorkoutId, WorkoutId][] = [
      ["A", "B"],
      ["B", "C"],
      ["C", "D"],
      ["D", "A"],
    ];
    for (const [last, next] of cases) {
      // An older completion first, so "most recent" is what decides.
      const completions = [
        { date: "2026-09-01", workout: "C" as WorkoutId },
        { date: "2026-10-02", workout: last },
      ];
      expect(nextWorkout(completions)).toBe(next);
      // Order in the array must not matter, only the date.
      expect(nextWorkout([...completions].reverse())).toBe(next);
    }
  });

  it("rest days are Wed, Sat, Sun", () => {
    // 2026-10-05 is a Monday.
    expect(isRestDay("2026-10-05")).toBe(false); // Mon
    expect(isRestDay("2026-10-06")).toBe(false); // Tue
    expect(isRestDay("2026-10-07")).toBe(true); // Wed
    expect(isRestDay("2026-10-08")).toBe(false); // Thu
    expect(isRestDay("2026-10-09")).toBe(false); // Fri
    expect(isRestDay("2026-10-10")).toBe(true); // Sat
    expect(isRestDay("2026-10-11")).toBe(true); // Sun
  });
});
