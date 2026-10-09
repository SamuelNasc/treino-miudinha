# MeasureGuide

## Problem

Samuel measures her at home with a tape, and the numbers only compare from week to week if the
tape goes around the same spot every time. Today "onde medir" on the form opens one line of text
("Na parte mais fina, acima do umbigo. Fita reta, sem apertar."). For cintura, abdômen and quadril,
three bands a hand's width apart, a sentence alone is easy to misread, and a band 3 cm too high
shows up on the chart as change that never happened. The source gives no measured error. The
design ships the text cue first, on purpose: the drawings were left out until a contact sheet was
reviewed. Samuel approved the contact sheet of mockup v6's figure as it is on 2026-10-09.

This is slice 7 of 7 in `.design/body-measurements.md`. When it ships, tapping "onde medir" on a
tape row opens the same box as today, now with a small drawing on the left and the cue on the
right: a slim front-view figure with a green dashed tape band at the spot. All seven drawings use
one figure and only the band moves. Braço, Coxa and Panturrilha have one drawing for both sides.

## Flow

This reuses the form's "onde medir" toggle, its one-open-at-a-time state and its cue box, the
measure ids of `MEASURES` (Measurement door 2), and the theme tokens. Nothing is stored.

1. tap "onde medir" on a tape row -> `MeasureForm` (exists) - opens that row's box and closes any other, as today
2. `MeasureForm` (exists) looks up the row's first measure id in `MEASURE_GUIDES` (door 1) and gets its cue and band
3. the drawing component (new, no door - placement per conventions) draws the shared figure and the band from the theme tokens, beside the cue
4. out: the open box. Nothing is persisted, and closing, saving or switching page closes it as today

## Impact

| Front | What changes |
| --- | --- |
| screen Medidas · Nova medição | the open "onde medir" box changes from text only to a two-column box: the 96 px drawing, then the cue. The toggle, its label "onde medir" / "fechar", one box open at a time, and what closes it are unchanged |
| theme | one new colour token for the tape band, from mockup v6: `--tape` `#3f9a4a` light / `#6cc677` dark |
| domain | new term: `MeasureGuide` - the cue line and the tape band of one tape measure, static content keyed by measure id, never stored |
| domain | the seven cue lines move out of `MeasureForm`'s row list into `MEASURE_GUIDES`. Their text and the appended "Fita reta, sem apertar." are unchanged, so the existing cue tests keep passing as they are |
| exercise guides | nothing changes: `GUIDES`, `GuideDrawing` and AD-001 cover exercises only, and the `.draw` styles are not reused |
| stored data | nothing to migrate and nothing written. The record stays `version: 1` |

## Relations

None - no stored-data shape change. Guides are static content in the bundle, like the exercise guides.

## Surface

None - nothing consumed outside.

## Landing

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| 1. The measure-guide grammar: one shared front-view figure in a `0 0 120 200` frame, the band as data, keyed by every tape measure id with the D/E pair holding the same object | `type MeasureGuide = { cue: string; band: [Pt, Pt] }` and `MEASURE_GUIDES: Record<Exclude<MeasureId, "peso">, MeasureGuide>`, where `band` is the band's left and right ends at one height, drawn as a dashed ellipse centred between them, `rx` half their distance + 3, `ry` 4. `"braco-d"` and `"braco-e"` point to one object, and the same for coxa and panturrilha | the exercise `Pose` grammar (exercise-guides door 1) - it draws side-view stick poses with start and end, and cannot draw a filled front silhouette or a band. A hand-written SVG per measure - seven copies of the figure that drift apart, against the design's one figure. Keying by a group name ("braco") - not a measure id, so the compiler could not tell that a tape measure lost its guide |

- Nothing else in this change is hard to reverse. The figure's paths and the band positions are content, changed by a redeploy

## Criteria

### S1: Seeing where the tape goes (P1)

She taps "onde medir" on a tape row and sees the drawing next to the cue.

**Acceptance Criteria**

1. WHEN "onde medir" is tapped on the row Busto, Cintura, Abdômen, Quadril, Braço, Coxa or Panturrilha THEN the open box SHALL show that measure's drawing and, beside it, the cue line followed by "Fita reta, sem apertar."
2. The cue lines SHALL be exactly: busto "Na parte mais cheia do busto.", cintura "Na parte mais fina, acima do umbigo.", abdômen "Na linha do umbigo.", quadril "Na parte mais larga do bumbum.", braço "No meio do braço, relaxado.", coxa "No meio da coxa, em pé.", panturrilha "Na parte mais grossa da panturrilha."
3. The system SHALL draw each guide as mockup v6's figure in a `0 0 120 200` frame: the body fill path, the two arm lines, the four leg lines, the head (circle at 60,24, r 12) and the bun (circle at 60,9, r 6), with the same path data as v6's `figure()`
4. The system SHALL draw in each guide one tape band, a dashed ellipse drawn after the figure, with the band ends of mockup v6: busto (44,62)-(76,62), cintura (48,80)-(72,80), abdômen (47,92)-(73,92), quadril (44,108)-(76,108), braço (32,70)-(40,70), coxa (46,136)-(58,136), panturrilha (48,170)-(57,170), centred between its ends with `rx` half their distance + 3 and `ry` 4
5. The system SHALL give every tape measure id (`busto`, `cintura`, `abdomen`, `quadril`, `braco-d`, `braco-e`, `coxa-d`, `coxa-e`, `panturrilha-d`, `panturrilha-e`) a guide, with each D/E pair holding the same guide
6. The row Peso SHALL have no "onde medir" and no drawing
7. The drawing SHALL be announced as an image named "Onde medir: " followed by the row's name in lower case ("Onde medir: abdômen", "Onde medir: braço"), and the cue SHALL be read as text after it

**Independent test:** open Nova medição, tap "onde medir" on Quadril: the box shows the figure with the band at the widest point and "Na parte mais larga do bumbum. Fita reta, sem apertar."; tap it on Braço: Quadril's box closes and Braço's shows the band on the arm.

### S2: Look in both schemes (P1)

**Acceptance Criteria**

8. The figure's body fill SHALL use `--pad`, its arm and leg lines and its head `--fig`, its bun `--cherry`, and the band `--tape`, in the light and the dark scheme
9. The theme SHALL define `--tape` as `#3f9a4a` in the light scheme and `#6cc677` in the dark scheme
10. The figure lines SHALL have no fill, a stroke width of 2.5 and round caps and joins. The band SHALL have no fill, a stroke width of 3.5, a dash of `5 3` and round caps
11. WHEN the box is open at a 360×740 viewport THEN it SHALL lay out as two columns, the drawing 96 px wide on the left and the cue on the right, with a 12 px gap and both vertically centred, on `--blush` with an 18 px radius and 10 px 12 px padding, and the cue in 14 px text at line height 1.4
12. WHEN the box is open at a 360×740 viewport THEN the page SHALL have no horizontal scroll

**Independent test:** at 360×740, open Cintura's box in the light and in the dark scheme and compare it with mockup v6's form.

### S3: Staying static (P1)

**Acceptance Criteria**

13. The system SHALL store nothing when a guide is opened or closed: the record under `treino:v1` SHALL be byte-identical before and after

**Independent test:** read `treino:v1`, open and close every guide, read it again: identical.

## Out of scope

Product capabilities only. Process and harness rules live in AGENTS.md or as Observable `n/a`.

| Excluded | Why |
| --- | --- |
| A drawing for Peso | she weighs at the gym on a scale. There is no tape spot to show |
| A drawing per side for the D/E pairs | the design shares one drawing per pair, and the spot is the same on both sides |
| The drawing in Histórico or Gráfico | the design opens the guide only from the form |
| Filled limbs or a wider cintura/abdômen gap (a v7 figure) | Samuel approved v6 as it is. A band she misreads is moved by a redeploy |

## Assumptions

Defaults that are not already a numbered criterion. Drop a row once it is.

| Assumption | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| The figure, the seven bands, the colours and the box layout (AC 3, 4, 8-11) | as mockup v6 draws them | Samuel reviewed the contact sheet of the seven v6 drawings in both schemes | y - Samuel, 2026-10-09 |
| The drawing's accessible name (AC 7) | "Onde medir: " plus the row's name in lower case, with accents: "Onde medir: abdômen" | v6 uses the guide key, which reads "Onde medir: abdomen" and "Onde medir: braco" to a screen reader. Same deviation Samuel approved for Gráfico's name | y - Samuel, 2026-10-09 |
| The cue box's id and what closes it | unchanged from Registrar medição | that slice proved them, and this slice only adds the drawing inside | n |
| Pushing to her phone | after Samuel's go-ahead, never as part of the plan | push is never part of an approved plan | y - Samuel, 2026-10-08 |

**Open questions:** one, below.

| # | Kind | Question | Until answered |
| --- | --- | --- | --- |
| 1 | blocks go-live | Has she seen the drawings too? The design asks Samuel and her to approve them before release | nothing in the build waits on it. The push waits for Samuel's go-ahead anyway |

## Observable

Worksheet, not the review. `n/a` needs its reason. One row may group the same decision
across several routes.

| Surface | Decision | Landing |
| --- | --- | --- |
| screen Medidas · Nova medição · onde medir | empty state | AC 6 - Peso has no guide. Every other row has one (AC 5) |
| screen Medidas · Nova medição · onde medir | loading, unauthorised | n/a - static content in the bundle, single user |
| screen Medidas · Nova medição · onde medir | error state: storage not saving | n/a - the guide reads and writes nothing (AC 13) |
| screen Medidas · Nova medição · onde medir | density and ordering | AC 1, AC 11, AC 12 |
| screen Medidas · Nova medição · onde medir | destructive action confirms | n/a - the box changes nothing |
| screen Medidas · Nova medição · onde medir | colour in both schemes | AC 8, AC 9 |
| screen Medidas · Nova medição · onde medir | assistive tech | AC 7 |
| copy cue lines | structure and tone | AC 2 - pt-BR, one line, a reminder of the landmark |

## Sources

- `.design/body-measurements.md`, slice MeasureGuide and its cue lines - confirmed by Samuel 2026-10-08
- Mockup https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa version 6 - `GUIDES`, `figure()`, `where()`, and the `.guide`, `.body-fill`, `.body-line`, `.tape` styles and the `--tape` token; the seven drawings approved as-is by Samuel 2026-10-09
