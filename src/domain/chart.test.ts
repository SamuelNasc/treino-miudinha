import { describe, expect, it } from "vitest";
import { change, seriesOf, xLabels, yTicks } from "./chart";
import type { Measurement } from "./measurements";

const CIN3: Measurement[] = [
  { date: "2026-08-27", values: { cintura: 74, peso: 64.2 } },
  { date: "2026-09-24", values: { cintura: 72.4 } },
  { date: "2026-10-01", values: { peso: 62.9 } },
  { date: "2026-10-08", values: { cintura: 71.6, peso: 62.6 } },
];

describe("chart", () => {
  it("series of a measure", () => {
    expect(seriesOf(CIN3, "cintura")).toEqual([
      { date: "2026-08-27", v: 74 },
      { date: "2026-09-24", v: 72.4 },
      { date: "2026-10-08", v: 71.6 },
    ]);
    expect(seriesOf([...CIN3].reverse(), "cintura").map((p) => p.date)).toEqual(["2026-08-27", "2026-09-24", "2026-10-08"]);
    expect(seriesOf(CIN3, "peso")).toEqual([
      { date: "2026-08-27", v: 64.2 },
      { date: "2026-10-01", v: 62.9 },
      { date: "2026-10-08", v: 62.6 },
    ]);
    expect(seriesOf(CIN3, "busto")).toEqual([]);
  });

  it("change since the first", () => {
    const table: [number, number, string][] = [
      [74, 71.6, "−2,4"],
      [71.6, 74, "+2,4"],
      [72, 72, "±0"],
      [63.1, 62.9, "−0,2"],
      [28.3, 28.6, "+0,3"],
      [62, 62.05, "+0,1"],
      [62.04, 62, "±0"],
    ];
    for (const [first, last, text] of table) {
      expect(change(first, last), `${first} -> ${last}`).toBe(text);
      expect(change(first, last)).not.toContain("-");
    }
    expect(change(74, 71.6).charCodeAt(0)).toBe(0x2212);
  });

  it("y ticks", () => {
    const table: [number, number, number[] | null][] = [
      [71.6, 74, [71, 72, 73, 74]],
      [62.6, 64.2, [62, 63, 64, 65]],
      [28.3, 29, [28.25, 28.5, 28.75, 29]],
      [30, 200, [0, 100, 200]],
      [35.6, 36, [35.6, 35.8, 36]],
      [99.6, 101.5, [99, 100, 101, 102]],
      [72, 72, null],
      [62.9, 62.9, null],
    ];
    for (const [lo, hi, expected] of table) {
      const ticks = yTicks(lo, hi);
      if (expected) expect(ticks, `${lo}..${hi}`).toEqual(expected);
      expect(ticks.length, `${lo}..${hi}`).toBeGreaterThanOrEqual(3);
      expect(ticks.length, `${lo}..${hi}`).toBeLessThanOrEqual(5);
      const step = ticks[1] - ticks[0];
      for (let i = 1; i < ticks.length; i++) expect(Math.abs(ticks[i] - ticks[i - 1] - step), `${lo}..${hi}`).toBeLessThan(1e-9);
      expect(ticks[0]).toBeLessThanOrEqual(lo);
      expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(hi);
      if (lo === hi) expect(ticks[0] < lo || ticks[ticks.length - 1] > hi, `${lo} flat`).toBe(true);
    }
  });

  it("x labels", () => {
    expect(xLabels(["a", "b", "c"])).toEqual(["a", "b", "c"]);
    expect(xLabels(["a", "b", "c", "d"])).toEqual(["a", "b", "d"]);
    expect(xLabels(["a", "b", "c", "d", "e"])).toEqual(["a", "c", "e"]);
    expect(xLabels(["a", "b"])).toEqual(["a", "b"]);
  });
});
