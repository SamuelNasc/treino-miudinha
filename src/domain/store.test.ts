import { beforeEach, describe, expect, it } from "vitest";
import { parseRecord as parseRecordBefore } from "../../tests/fixtures/store-9e5a252";
import { measurementsOf, reminderOf } from "./measurements";
import { STORAGE_KEY, addCompletion, freshRecord, loadRecord, parseRecord, parseWeight, saveRecord, toggleCheck } from "./store";

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

// A stored record from the build before measurements: workouts only.
const WORKOUTS_ONLY = {
  version: 1,
  completions: [{ date: "2026-10-02", workout: "D" }],
  today: { date: "2026-10-08", workout: "A", checked: ["extensao"] },
  weights: { "leg-press-45": 40 },
  restSeconds: 60,
};

const parse = (extra: Record<string, unknown>) => {
  const record = parseRecord(JSON.stringify({ ...WORKOUTS_ONLY, ...extra }));
  if (!record) throw new Error("record rejected");
  return record;
};

function expectWorkoutsKept(record: object) {
  const { completions, today, weights, restSeconds } = record as typeof WORKOUTS_ONLY;
  expect({ version: 1, completions, today, weights, restSeconds }).toEqual(WORKOUTS_ONLY);
}

describe("store measurements", () => {
  it("record without measurement fields loads with defaults", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(WORKOUTS_ONLY));
    const { record } = loadRecord("2026-10-08");
    expect(measurementsOf(record)).toEqual([]);
    expect(reminderOf(record)).toEqual({ everyDays: 7, snoozedOn: null });
    expectWorkoutsKept(record);
  });

  it("absent measurement fields stay absent on save", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(WORKOUTS_ONLY));
    saveRecord(loadRecord("2026-10-08").record);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).not.toHaveProperty("measurements");
    expect(stored).not.toHaveProperty("reminder");
    expect(stored).toEqual(WORKOUTS_ONLY);
  });

  it("measurements are stored under treino:v1 version 1", () => {
    const measurements = [{ date: "2026-10-05", values: { peso: 62.9, cintura: 70 } }];
    saveRecord({ ...freshRecord("2026-10-08"), measurements });
    expect(localStorage.length).toBe(1);
    const stored = JSON.parse(localStorage.getItem("treino:v1")!);
    expect(stored.version).toBe(1);
    expect(stored.measurements).toEqual(measurements);
  });

  it("malformed measurement entries are dropped", () => {
    const good = [
      { date: "2026-09-28", values: { peso: 63 } },
      { date: "2026-10-05", values: { cintura: 70 } },
    ];
    const record = parse({
      measurements: [
        "x",
        null,
        good[0],
        { values: { peso: 63 } },
        { date: "2026-02-30", values: { peso: 63 } },
        { date: "x", values: { peso: 63 } },
        { date: 5, values: { peso: 63 } },
        { date: "2026-10-01", values: null },
        { date: "2026-10-02", values: [62] },
        { date: "2026-10-03", values: 62 },
        { date: "2026-10-04", values: { pescoco: 30, peso: 680 } },
        { date: "2026-10-06", values: {} },
        good[1],
      ],
    });
    expect(measurementsOf(record)).toEqual(good);
    expectWorkoutsKept(record);
  });

  it("unknown ids and invalid values are dropped from an entry", () => {
    const record = parse({
      measurements: [{ date: "2026-10-05", values: { pescoco: 30, peso: "62", cintura: 680, quadril: 95, "coxa-d": 70.25, busto: 90 } }],
    });
    expect(measurementsOf(record)).toEqual([{ date: "2026-10-05", values: { quadril: 95, busto: 90 } }]);
  });

  it("duplicate dates merge in file order", () => {
    const record = parse({
      measurements: [
        { date: "2026-10-05", values: { peso: 63, cintura: 70 } },
        { date: "2026-10-01", values: { peso: 64 } },
        { date: "2026-10-05", values: { peso: 62 } },
      ],
    });
    expect(measurementsOf(record)).toEqual([
      { date: "2026-10-01", values: { peso: 64 } },
      { date: "2026-10-05", values: { peso: 62, cintura: 70 } },
    ]);
  });

  it("measurements that is not a list reads as none", () => {
    for (const measurements of [{}, "x", null]) {
      const record = parse({ measurements });
      expect(measurementsOf(record), JSON.stringify(measurements)).toEqual([]);
      expectWorkoutsKept(record);
    }
  });

  it("reminder settings fall back to defaults", () => {
    const everyDays = (reminder: unknown) => reminderOf(parse({ reminder })).everyDays;
    const snoozedOn = (reminder: unknown) => reminderOf(parse({ reminder })).snoozedOn;
    expect(everyDays({ everyDays: 7, snoozedOn: null })).toBe(7);
    expect(everyDays({ everyDays: 14, snoozedOn: null })).toBe(14);
    expect(everyDays({ everyDays: 30, snoozedOn: null })).toBe(30);
    expect(everyDays({ everyDays: null, snoozedOn: null })).toBeNull();
    expect(everyDays({ everyDays: 10, snoozedOn: null })).toBe(7);
    expect(everyDays({ everyDays: "7", snoozedOn: null })).toBe(7);
    expect(everyDays({ snoozedOn: null })).toBe(7);
    expect(everyDays(5)).toBe(7);
    expect(snoozedOn({ everyDays: 14, snoozedOn: "2026-10-06" })).toBe("2026-10-06");
    expect(snoozedOn({ everyDays: 14, snoozedOn: "2026-02-30" })).toBeNull();
    expect(snoozedOn({ everyDays: 14, snoozedOn: 5 })).toBeNull();
    expect(snoozedOn({ everyDays: 14 })).toBeNull();
    expect(reminderOf(parse({ reminder: { everyDays: 14, snoozedOn: "2026-02-30" } }))).toEqual({ everyDays: 14, snoozedOn: null });
  });

  it("the build before measurements still reads the record", () => {
    const text = JSON.stringify({
      ...WORKOUTS_ONLY,
      measurements: [{ date: "2026-10-05", values: { peso: 62.9, cintura: 70 } }],
      reminder: { everyDays: 14, snoozedOn: "2026-10-06" },
    });
    const record = parseRecordBefore(text);
    expect(record).not.toBeNull();
    expectWorkoutsKept(record!);
  });
});
