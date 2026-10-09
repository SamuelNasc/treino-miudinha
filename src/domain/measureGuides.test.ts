import { describe, expect, it } from "vitest";
import { MEASURE_GUIDES } from "./measureGuides";

describe("measure guides", () => {
  it("cue lines", () => {
    expect(MEASURE_GUIDES.busto.cue).toBe("Na parte mais cheia do busto.");
    expect(MEASURE_GUIDES.cintura.cue).toBe("Na parte mais fina, acima do umbigo.");
    expect(MEASURE_GUIDES.abdomen.cue).toBe("Na linha do umbigo.");
    expect(MEASURE_GUIDES.quadril.cue).toBe("Na parte mais larga do bumbum.");
    expect(MEASURE_GUIDES["braco-d"].cue).toBe("No meio do braço, relaxado.");
    expect(MEASURE_GUIDES["coxa-d"].cue).toBe("No meio da coxa, em pé.");
    expect(MEASURE_GUIDES["panturrilha-d"].cue).toBe("Na parte mais grossa da panturrilha.");
  });

  it("every tape measure has a guide", () => {
    expect(Object.keys(MEASURE_GUIDES).sort()).toEqual(
      ["busto", "cintura", "abdomen", "quadril", "braco-d", "braco-e", "coxa-d", "coxa-e", "panturrilha-d", "panturrilha-e"].sort(),
    );
    expect("peso" in MEASURE_GUIDES).toBe(false);
    expect(MEASURE_GUIDES["braco-d"]).toBe(MEASURE_GUIDES["braco-e"]);
    expect(MEASURE_GUIDES["coxa-d"]).toBe(MEASURE_GUIDES["coxa-e"]);
    expect(MEASURE_GUIDES["panturrilha-d"]).toBe(MEASURE_GUIDES["panturrilha-e"]);
    const distinct = new Set(Object.values(MEASURE_GUIDES));
    expect(distinct.size).toBe(7);
    expect(new Set([...distinct].map((g) => JSON.stringify(g.band))).size).toBe(7);
  });
});
