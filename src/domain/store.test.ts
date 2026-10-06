import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEY, addCompletion, freshRecord, loadRecord, parseWeight, saveRecord, toggleCheck } from "./store";

beforeEach(() => localStorage.clear());

describe("store", () => {
  it("stale checks are discarded on a later date", () => {
    const old = {
      ...freshRecord("2026-10-05"),
      completions: [{ date: "2026-10-02", workout: "D" as const }],
      today: { date: "2026-10-05", workout: "A" as const, checked: ["extensao", "agachamento"] },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
    const { record } = loadRecord("2026-10-06");
    expect(record.today.checked).toEqual([]);
    expect(record.today.date).toBe("2026-10-06");
    expect(record.completions).toEqual([{ date: "2026-10-02", workout: "D" }]);
  });

  it("no duplicate completion for same workout and date", () => {
    let r = freshRecord("2026-10-05");
    r = addCompletion(r, "2026-10-05", "A");
    r = addCompletion(r, "2026-10-05", "A");
    expect(r.completions).toEqual([{ date: "2026-10-05", workout: "A" }]);
    // A different workout the same day still counts (assumption: both count).
    r = addCompletion(r, "2026-10-05", "B");
    expect(r.completions).toHaveLength(2);
  });

  it("weight bounds", () => {
    expect(parseWeight("0", 10)).toBe(0);
    expect(parseWeight("0.5", 10)).toBe(0.5);
    expect(parseWeight("500", 10)).toBe(500);
    expect(parseWeight("42,5", 10)).toBe(42.5);
    expect(parseWeight("-1", 10)).toBe(10);
    expect(parseWeight("500.5", 10)).toBe(10);
    expect(parseWeight("abc", 10)).toBe(10);
    expect(parseWeight("abc", undefined)).toBeUndefined();
  });

  it("persists the door-1 record under one key", () => {
    let r = freshRecord("2026-10-05");
    r = toggleCheck(r, "A", "extensao");
    r = { ...r, weights: { "leg-press-45": 40 } };
    saveRecord(r);
    expect(localStorage.length).toBe(1);
    const stored = JSON.parse(localStorage.getItem("treino:v1")!);
    expect(stored).toEqual({
      version: 1,
      completions: [],
      today: { date: "2026-10-05", workout: "A", checked: ["extensao"] },
      weights: { "leg-press-45": 40 },
      restSeconds: 90,
    });
    expect(Object.keys(stored).sort()).toEqual(["completions", "restSeconds", "today", "version", "weights"]);
  });
});
