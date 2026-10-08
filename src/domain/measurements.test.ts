import { describe, expect, it } from "vitest";
import { MEASURES, type MeasureId } from "./measures";
import {
  deleteMeasurement,
  lastTapeDate,
  measurementsOf,
  reminderDue,
  saveMeasurement,
  type Measurement,
  type ReminderSettings,
} from "./measurements";
import { freshRecord, type TreinoRecord } from "./store";

const TODAY = "2026-10-08";

const withEntries = (measurements: Measurement[]): TreinoRecord => ({ ...freshRecord(TODAY), measurements });

function saved(record: TreinoRecord, date: string, values: Partial<Record<MeasureId, number>>): TreinoRecord {
  const result = saveMeasurement(record, date, values, TODAY);
  if (!result.ok) throw new Error(`refused: ${result.reason}`);
  return result.record;
}

describe("measurements", () => {
  it("save on a new date adds one entry in date order", () => {
    const record = withEntries([
      { date: "2026-10-01", values: { peso: 63 } },
      { date: "2026-10-05", values: { quadril: 95 } },
    ]);
    const next = saved(record, "2026-10-03", { cintura: 70 });
    expect(measurementsOf(next)).toEqual([
      { date: "2026-10-01", values: { peso: 63 } },
      { date: "2026-10-03", values: { cintura: 70 } },
      { date: "2026-10-05", values: { quadril: 95 } },
    ]);
  });

  it("save onto an existing date merges", () => {
    const record = withEntries([{ date: "2026-10-05", values: { peso: 63, cintura: 70 } }]);
    const once = saved(record, "2026-10-05", { peso: 62.5, busto: 90 });
    expect(measurementsOf(once)).toEqual([{ date: "2026-10-05", values: { peso: 62.5, cintura: 70, busto: 90 } }]);
    const twice = saved(once, "2026-10-05", { peso: 62.5, busto: 90 });
    expect(measurementsOf(twice)).toEqual(measurementsOf(once));
  });

  it("save with no values is refused", () => {
    const record = withEntries([{ date: "2026-10-05", values: { peso: 63 } }]);
    for (const values of [{}, { peso: undefined }]) {
      const result = saveMeasurement(record, "2026-10-05", values, TODAY);
      expect(result).toEqual({ ok: false, reason: "empty", record });
      expect(result.record).toBe(record);
    }
  });

  it("invalid values refuse the whole save", () => {
    const record = withEntries([]);
    for (const { id, min, max } of MEASURES) {
      expect(saveMeasurement(record, TODAY, { [id]: min }, TODAY).ok, `${id} min`).toBe(true);
      expect(saveMeasurement(record, TODAY, { [id]: max }, TODAY).ok, `${id} max`).toBe(true);
      for (const bad of [Math.round((min - 0.1) * 10) / 10, Math.round((max + 0.1) * 10) / 10]) {
        const result = saveMeasurement(record, TODAY, { [id]: bad }, TODAY);
        expect(result, `${id} ${bad}`).toEqual({ ok: false, reason: "invalid", invalid: [id], record });
      }
    }
    expect(saveMeasurement(record, TODAY, { peso: 62.9 }, TODAY).ok).toBe(true);
    for (const bad of [62.95, NaN, Infinity]) {
      expect(saveMeasurement(record, TODAY, { peso: bad }, TODAY), String(bad)).toEqual({
        ok: false,
        reason: "invalid",
        invalid: ["peso"],
        record,
      });
    }
    const mixed = saveMeasurement(record, TODAY, { peso: 62, cintura: 680, quadril: 95, "coxa-e": 70.25 }, TODAY);
    expect(mixed.ok).toBe(false);
    expect(mixed.record).toBe(record);
    expect(mixed.ok === false && mixed.reason === "invalid" && [...mixed.invalid].sort()).toEqual(["cintura", "coxa-e"]);
  });

  it("invalid or future date is refused", () => {
    const record = withEntries([]);
    for (const date of ["", "2026-13-01", "2026-02-30", "08/10/2026", "2026-10-09"]) {
      expect(saveMeasurement(record, date, { peso: 62 }, TODAY), date).toEqual({ ok: false, reason: "date", record });
    }
    expect(measurementsOf(saved(record, "2026-10-08", { peso: 62 }))).toEqual([{ date: "2026-10-08", values: { peso: 62 } }]);
  });

  it("delete removes only that date", () => {
    const record = withEntries([
      { date: "2026-10-01", values: { peso: 63 } },
      { date: "2026-10-03", values: { cintura: 70 } },
      { date: "2026-10-05", values: { quadril: 95, peso: 62 } },
    ]);
    expect(measurementsOf(deleteMeasurement(record, "2026-10-03"))).toEqual([
      { date: "2026-10-01", values: { peso: 63 } },
      { date: "2026-10-05", values: { quadril: 95, peso: 62 } },
    ]);
  });

  it("last tape date ignores weight-only entries", () => {
    expect(lastTapeDate(freshRecord(TODAY))).toBeNull();
    expect(lastTapeDate(withEntries([]))).toBeNull();
    expect(lastTapeDate(withEntries([{ date: "2026-10-01", values: { peso: 63 } }]))).toBeNull();
    expect(
      lastTapeDate(
        withEntries([
          { date: "2026-10-01", values: { peso: 63, cintura: 70 } },
          { date: "2026-10-05", values: { peso: 62 } },
        ]),
      ),
    ).toBe("2026-10-01");
    const tape = MEASURES.filter((m) => m.id !== "peso");
    expect(tape).toHaveLength(10);
    for (const { id, min } of tape) {
      expect(lastTapeDate(withEntries([{ date: "2026-10-02", values: { [id]: min } }])), id).toBe("2026-10-02");
    }
  });

  it("deleting the last tape entry falls back to the previous one", () => {
    const record = withEntries([
      { date: "2026-10-01", values: { busto: 90 } },
      { date: "2026-10-05", values: { "coxa-d": 55 } },
    ]);
    expect(lastTapeDate(record)).toBe("2026-10-05");
    expect(lastTapeDate(deleteMeasurement(record, "2026-10-05"))).toBe("2026-10-01");
  });
});

describe("reminder due", () => {
  const tape = (date: string): Measurement => ({ date, values: { cintura: 72 } });
  const peso = (date: string): Measurement => ({ date, values: { peso: 62 } });
  const every = (everyDays: ReminderSettings["everyDays"], snoozedOn: string | null = null): ReminderSettings => ({ everyDays, snoozedOn });

  // [case, reminder (undefined = absent), measurements, expected]
  const cases: [string, ReminderSettings | undefined, Measurement[], ReturnType<typeof reminderDue>][] = [
    ["7, none", every(7), [], { first: true }],
    ["7, weight only", every(7), [peso("2026-09-01"), peso("2026-10-07")], { first: true }],
    ["7, tape 7 days ago", every(7), [tape("2026-10-01")], { days: 7 }],
    ["7, tape 6 days ago", every(7), [tape("2026-10-02")], null],
    ["14, tape 13 days ago", every(14), [tape("2026-09-25")], null],
    ["14, tape 14 days ago", every(14), [tape("2026-09-24")], { days: 14 }],
    ["30, tape 30 days ago", every(30), [tape("2026-09-08")], { days: 30 }],
    ["30, tape 29 days ago", every(30), [tape("2026-09-09")], null],
    ["7, weight after tape", every(7), [tape("2026-09-28"), peso("2026-10-07")], { days: 10 }],
    ["7, future tape", every(7), [tape("2026-10-10")], null],
    ["off, none", every(null), [], null],
    ["off, old tape", every(null), [tape("2026-08-01")], null],
    ["7, none, snoozed today", every(7, TODAY), [], null],
    ["7, due, snoozed yesterday", every(7, "2026-10-07"), [tape("2026-10-01")], { days: 7 }],
    ["7, none, snoozed tomorrow", every(7, "2026-10-09"), [], { first: true }],
    ["absent, none", undefined, [], { first: true }],
  ];

  it.each(cases)("%s", (_, reminder, measurements, expected) => {
    const record: TreinoRecord = { ...withEntries(measurements), ...(reminder ? { reminder } : {}) };
    expect(reminderDue(record, TODAY)).toEqual(expected);
  });
});
