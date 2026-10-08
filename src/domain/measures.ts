// Measurement door 2: measure ids are stable identities with fixed units. Renaming one orphans its history.

export const MEASURES = [
  { id: "peso", label: "Peso", unit: "kg", min: 30, max: 200 },
  { id: "busto", label: "Busto", unit: "cm", min: 50, max: 160 },
  { id: "cintura", label: "Cintura", unit: "cm", min: 40, max: 150 },
  { id: "abdomen", label: "Abdômen", unit: "cm", min: 40, max: 160 },
  { id: "quadril", label: "Quadril", unit: "cm", min: 60, max: 170 },
  { id: "braco-d", label: "Braço D", unit: "cm", min: 15, max: 60 },
  { id: "braco-e", label: "Braço E", unit: "cm", min: 15, max: 60 },
  { id: "coxa-d", label: "Coxa D", unit: "cm", min: 30, max: 90 },
  { id: "coxa-e", label: "Coxa E", unit: "cm", min: 30, max: 90 },
  { id: "panturrilha-d", label: "Panturrilha D", unit: "cm", min: 20, max: 60 },
  { id: "panturrilha-e", label: "Panturrilha E", unit: "cm", min: 20, max: 60 },
] as const;

export type MeasureId = (typeof MEASURES)[number]["id"];

const BY_ID = new Map<string, (typeof MEASURES)[number]>(MEASURES.map((m) => [m.id, m]));

export function isMeasureId(id: string): id is MeasureId {
  return BY_ID.has(id);
}

/** A known id with a finite number inside its range and at most one decimal. */
export function isValidValue(id: string, value: unknown): value is number {
  const measure = BY_ID.get(id);
  if (!measure || typeof value !== "number" || !Number.isFinite(value)) return false;
  // 62.9 * 10 is not exactly 629 in floating point, so allow a tiny error.
  const tenths = value * 10;
  return value >= measure.min && value <= measure.max && Math.abs(tenths - Math.round(tenths)) < 1e-9;
}

/** What she typed in a field: digits with at most one decimal after a comma or a dot, inside the range. */
export function parseMeasure(id: MeasureId, text: string): number | "blank" | "bad" {
  const trimmed = text.trim();
  if (trimmed === "") return "blank";
  if (!/^\d+([.,]\d)?$/.test(trimmed)) return "bad";
  const value = Number(trimmed.replace(",", "."));
  return isValidValue(id, value) ? value : "bad";
}
