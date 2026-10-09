// Door 1 (measure-guide): one shared front-view figure, only the tape band moves. Guides key on every
// tape measure id (Measurement door 2), and each D/E pair holds the same object, so a tape measure
// with no guide fails the type check.
import type { MeasureId } from "./measures";
import type { Pt } from "./guides";

export interface MeasureGuide {
  /** One line of pt-BR, a reminder of the landmark. "Fita reta, sem apertar." is added when shown. */
  cue: string;
  /** The band's left and right ends, at one height, in the 120x200 figure frame. */
  band: [left: Pt, right: Pt];
}

const braco: MeasureGuide = { cue: "No meio do braço, relaxado.", band: [[32, 70], [40, 70]] };
const coxa: MeasureGuide = { cue: "No meio da coxa, em pé.", band: [[46, 136], [58, 136]] };
const panturrilha: MeasureGuide = { cue: "Na parte mais grossa da panturrilha.", band: [[48, 170], [57, 170]] };

export const MEASURE_GUIDES: Record<Exclude<MeasureId, "peso">, MeasureGuide> = {
  busto: { cue: "Na parte mais cheia do busto.", band: [[44, 62], [76, 62]] },
  cintura: { cue: "Na parte mais fina, acima do umbigo.", band: [[48, 80], [72, 80]] },
  abdomen: { cue: "Na linha do umbigo.", band: [[47, 92], [73, 92]] },
  quadril: { cue: "Na parte mais larga do bumbum.", band: [[44, 108], [76, 108]] },
  "braco-d": braco,
  "braco-e": braco,
  "coxa-d": coxa,
  "coxa-e": coxa,
  "panturrilha-d": panturrilha,
  "panturrilha-e": panturrilha,
};
