import { describe, expect, it } from "vitest";
import { MEASURES } from "./measures";

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
});
