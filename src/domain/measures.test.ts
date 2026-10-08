import { describe, expect, it } from "vitest";
import { MEASURES, parseMeasure } from "./measures";

describe("measures", () => {
  it("lists exactly the 11 measures", () => {
    expect(MEASURES.map(({ id, unit, min, max }) => [id, unit, min, max])).toEqual([
      ["peso", "kg", 30, 200],
      ["busto", "cm", 50, 160],
      ["cintura", "cm", 40, 150],
      ["abdomen", "cm", 40, 160],
      ["quadril", "cm", 60, 170],
      ["braco-d", "cm", 15, 60],
      ["braco-e", "cm", 15, 60],
      ["coxa-d", "cm", 30, 90],
      ["coxa-e", "cm", 30, 90],
      ["panturrilha-d", "cm", 20, 60],
      ["panturrilha-e", "cm", 20, 60],
    ]);
  });

  it("measure text", () => {
    const accepted: [string, number][] = [["62,9", 62.9], ["62.9", 62.9], [" 74 ", 74], ["74", 74], ["101,5", 101.5]];
    for (const [text, value] of accepted) expect(parseMeasure("peso", text), text).toBe(value);
    for (const text of ["", "   "]) expect(parseMeasure("peso", text), `"${text}"`).toBe("blank");
    for (const text of ["62,95", "62.", ",5", "abc", "6 2", "-5", "62,9,1", "1e2", "62,a"]) {
      expect(parseMeasure("peso", text), text).toBe("bad");
    }
    expect(parseMeasure("peso", "29,9")).toBe("bad");
    expect(parseMeasure("peso", "200,1")).toBe("bad");
    expect(parseMeasure("peso", "30")).toBe(30);
    expect(parseMeasure("peso", "200")).toBe(200);
  });
});
