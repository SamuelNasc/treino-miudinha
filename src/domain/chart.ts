// Gráfico: the numbers behind the chart on Medidas, derived from the stored Measurements and never stored.
import type { Measurement } from "./measurements";
import type { MeasureId } from "./measures";

export interface Point {
  date: string;
  v: number;
}

/** The dated values of one measure, oldest first. A Measurement without it has no point. */
export function seriesOf(measurements: Measurement[], id: MeasureId): Point[] {
  return measurements
    .filter((m) => m.values[id] !== undefined)
    .map((m) => ({ date: m.date, v: m.values[id]! }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/** Signed change in tenths with a decimal comma: "+2,4", "−2,4" (U+2212) or "±0". */
export function change(first: number, last: number): string {
  // Counting in whole tenths keeps 62.05 - 62 from landing on 0.04999.
  const tenths = Math.round(last * 10) - Math.round(first * 10);
  const abs = String(Math.abs(tenths) / 10).replace(".", ",");
  return tenths > 0 ? `+${abs}` : tenths < 0 ? `−${abs}` : "±0";
}

/** 3 to 5 evenly spaced round values spanning `lo`..`hi`, as mockup v6 picks them. */
export function yTicks(lo: number, hi: number): number[] {
  // A flat line gets half a unit either side, so it sits between ticks instead of on a single one.
  if (lo === hi) return yTicks(lo - 0.5, hi + 0.5);
  const raw = (hi - lo) / 3;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= raw)!;
  const ticks: number[] = [];
  for (let t = Math.floor(lo / step) * step; t <= Math.ceil(hi / step) * step + 1e-9; t += step) ticks.push(+t.toFixed(2));
  return ticks;
}

/** The oldest, the middle and the newest date, each once. */
export function xLabels(dates: string[]): string[] {
  return [...new Set([dates[0], dates[Math.floor((dates.length - 1) / 2)], dates[dates.length - 1]])];
}
