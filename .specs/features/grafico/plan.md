# Gráfico

## Problem

She logs her measurements every week, but the only way to see whether anything changed is to open
Histórico rows one at a time and compare the numbers in her head. Seeing her progress is the reason
the feature exists ("she is back at the gym and wants to see progress"), and today the app shows
none of it: not the trend, and not how far she has come since her first entry. The source gives no
figure beyond that. The design orders this slice after Histórico because a chart has nothing to
show until there are a few entries. Her entries started on 2026-10-08.

This is slice 6 of 7 in `.design/body-measurements.md`. When it ships, Medidas opens with a card
"Sua evolução": a row of chips (Peso, Busto, Cintura, Abdômen, Quadril, Braço, Coxa, Panturrilha),
the latest value large with "−2,4 cm desde 26/08" under it, and a line over the dates she measured.
Braço, Coxa and Panturrilha draw right and left on one chart, a solid line and a dashed one ending
in "D" and "E". Touching the chart shows that date's value. With one entry the card shows the
value and "primeira medição" instead of a line. With no Measurement at all the card is not there.

## Flow

This reuses `measurementsOf` for the data, `MEASURES` for order, labels, units and the D/E pairs'
ids, `shortDate` from Histórico for every date shown, and the pt-BR decimal comma the form and
Histórico already show. Nothing new is stored. The chosen chip lives in React state.

1. Medidas renders -> `App` (exists) passes `measurementsOf(record)` and `today` to the Gráfico card (new, no door - placement per conventions), placed above "Nova medição"
2. the card turns the chosen chip into one series per side, keeping only the Measurements that hold that measure, oldest first, and from them the headline, the change since the first entry, the axis ticks and the points
3. a chip tap -> the card's state -> step 2 again. Storing nothing
4. a touch or pointer over the plot -> the card's state -> crosshair and tip at the nearest measured date
5. out: after any save, edit or delete, `App` re-renders and the card re-derives from the new list. Nothing is persisted by this slice

## Impact

| Front | What changes |
| --- | --- |
| screen Medidas | gains a first section "Sua evolução" above "Nova medição". Histórico's AC 1 (after "Nova medição", before "Lembrete") and the Lembrete heading-order tests still hold. A test that assumes "Nova medição" is the first heading on Medidas is fixed by asserting the new order, never by loosening it |
| theme | two new colour tokens for the D and E lines, in the light and the dark scheme, taken from mockup v6: `--s-d` `#e8304a` / `#e8364f` and `--s-e` `#8a3fb0` / `#a87ae0` |
| domain | new term: series - the dated values of one measure, oldest first, skipping Measurements that do not hold it. Built from `Measurement`, never stored |
| domain | `shortDate` (`src/components/History.tsx`) gains a second caller. Its rule is unchanged |
| stored data | nothing to migrate and nothing written. The record stays `version: 1` |

## Relations

None - no stored-data shape change. The chart reads the `measurements` list slice 1 fixed and writes nothing.

## Surface

None - nothing consumed outside.

## Landing

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| None | - | - |

- Nothing in this change is hard to reverse. The chart is a hand-drawn SVG, as mockup v6 draws it, so no chart dependency is added; every choice here is a redeploy

## Criteria

### S1: Picking a measure (P1)

She opens Medidas and chooses which measure the card shows.

**Acceptance Criteria**

1. WHILE at least one Measurement is stored the system SHALL show on Medidas a section headed "Sua evolução", before the section "Nova medição"
2. WHILE no Measurement is stored the system SHALL NOT show the section "Sua evolução", and Histórico's empty state stays as it is
3. The section SHALL show 8 chips in this order: "Peso", "Busto", "Cintura", "Abdômen", "Quadril", "Braço", "Coxa", "Panturrilha", in a group labelled "Escolher medida"
4. WHEN Medidas is first shown since the app opened THEN the chip "Cintura" SHALL be chosen, with `aria-pressed="true"` and every other chip `aria-pressed="false"`
5. WHEN a chip is tapped THEN the system SHALL choose it, mark it `aria-pressed="true"`, unmark the others, and show that measure, storing nothing
6. WHEN she leaves Medidas for Hoje and comes back without reloading THEN the chosen chip SHALL still be chosen
7. WHILE the chosen measure is held by no stored Measurement the card SHALL show "Ainda sem medição de cintura." with the chip's label in lower case, and no chart

**Independent test:** seed Measurements, open Medidas: "Sua evolução" sits first, "Cintura" pressed; tap "Peso", it is pressed and the card shows weight; go to Hoje and back, "Peso" still pressed.

### S2: One measure over time (P1)

She sees the latest value, the change since her first entry, and the line between.

**Acceptance Criteria**

8. WHILE the chosen single measure is held by exactly one stored Measurement the card SHALL show its value with a decimal comma and unit ("71,6 cm") and the text "primeira medição, 08/10. A linha aparece a partir da segunda.", and no chart
9. WHILE the chosen single measure is held by two or more stored Measurements the card SHALL show the latest value with a decimal comma and its unit, and under it the change from the oldest to the latest value as sign, absolute value with a decimal comma and unit, then "desde" and the oldest date (cintura 74 on 2026-08-27 and 71,6 on 2026-10-08, today 2026-10-09: "71,6 cm" and "−2,4 cm desde 27/08")
10. The change SHALL be rounded to one decimal and signed "+" when it grew, "−" (U+2212) when it shrank, and "±" when it is 0 ("±0 cm")
11. WHILE two or more stored Measurements hold the chosen measure the chart SHALL draw one line through one point per such Measurement, oldest to newest, placed left to right in proportion to the days between them
12. IF a stored Measurement does not hold the chosen measure THEN the chart SHALL draw no point for its date and the line SHALL join the dates on either side (weight-only 2026-10-01 between tape entries on 2026-09-24 and 2026-10-08: the cintura line has 2 points)
13. The chart SHALL label the y axis with 3 to 5 evenly spaced values with a decimal comma that span every drawn value, and the x axis with the oldest, the middle and the newest measured date, each date shown once
14. Every date the card shows SHALL be `dd/mm`, plus `/aa` when its year is not today's year, as Histórico shows it ("30/12/25")
15. The chart SHALL mark the latest point with a dot
16. The chart SHALL have the accessible name "Gráfico de cintura", with the chosen chip's label in lower case

**Independent test:** seed cintura on three dates and one weight-only date between them; "Cintura" shows the latest value, the signed change since the first date, 3 points on one line, and the x labels first/middle/last.

### S3: Right and left together (P1)

Braço, Coxa and Panturrilha show both sides on one chart, told apart without colour.

**Acceptance Criteria**

17. WHILE "Braço", "Coxa" or "Panturrilha" is chosen and the pair's measures are held on two or more distinct stored dates the card SHALL show a headline per side, "D" then "E", each with that side's latest value and its change since that side's oldest entry as in AC 9 and AC 10
18. WHILE a pair is chosen and drawn the chart SHALL draw the right side as a solid line and the left side as a dashed line, end each line's latest point with the letter "D" or "E" beside it, and show a legend "Direita" with a solid line and "Esquerda" with a dashed line
19. WHILE a pair is chosen and drawn the right line SHALL use `--s-d` and the left line `--s-e`, in the light and the dark scheme
20. IF one side of a drawn pair is held by exactly one stored Measurement THEN that side SHALL show its value and "primeira medição" in place of its change, and the chart SHALL draw its single point with no line
21. IF one side of a pair is held by no stored Measurement THEN the card SHALL show only the other side's headline, line and legend entry
22. WHILE a pair is chosen and every value of the pair was measured on one single date the card SHALL show "D 29 cm" and "E 28,6 cm" and the text "primeira medição, 08/10. A linha aparece a partir da segunda.", and no chart

**Independent test:** seed braço D and E on two dates; "Braço" shows two headlines, a solid line ending "D" and a dashed one ending "E", and the legend; remove E from the older entry and E shows "primeira medição".

### S4: Reading a point (P2)

She touches the chart and reads the value of one date.

**Acceptance Criteria**

23. WHEN a pointer goes down on or moves over the chart THEN the system SHALL show a vertical dashed line at the measured date nearest to it, a dot on each line that has a value on that date, and a tip with the date and each value with a decimal comma and unit, prefixed "D " and "E " and joined by " · " for a pair ("08/10" and "D 29 cm · E 28,6 cm")
24. WHEN the pointer leaves the chart THEN the system SHALL hide the dashed line, those dots and the tip
25. The chart SHALL let a vertical swipe that starts on it scroll the page

**Independent test:** at 360×740, tap on the right edge of the chart: the tip shows the newest date and value; move the pointer away: the tip is gone; swipe up from the chart: the page scrolls.

### S5: Staying true and arrangement (P1)

**Acceptance Criteria**

26. WHEN a Measurement is saved, edited or deleted THEN the card SHALL show the new values on the next render without a reload, keeping the chosen chip
27. The system SHALL store nothing when the card is used: the record under `treino:v1` SHALL be byte-identical before and after choosing chips and touching the chart
28. WHEN the section is shown at a 360×740 viewport THEN the chips SHALL sit on one line that scrolls sideways with no visible scrollbar, and the page SHALL have no horizontal scroll
29. WHEN the chart is shown at a 360×740 viewport THEN its plot SHALL fill the card's width and keep its 340:180 proportion, and the headline value SHALL be in the display font at 36 px (30 px per side for a pair)
30. The section's card, chips, chosen chip, grid lines, axis labels and tip SHALL use the tokens mockup v6 gives them (`--surface` card, `--blush` and `--cherry` chosen chip, `--line` grid, `--muted` labels, `--ink` tip), in the light and the dark scheme

**Independent test:** at 360×740 in both schemes, open "Cintura" and "Braço" with the six-week sample of mockup v6; compare against mockup v6.

## Out of scope

Product capabilities only. Process and harness rules live in AGENTS.md or as Observable `n/a`.

| Excluded | Why |
| --- | --- |
| Remembering the chosen chip across reloads | it would add a stored field for a convenience. Cintura is one tap away |
| Choosing a date range, or zooming | not asked for. At weekly entries a year is about 50 points, which the chart draws |
| More than one measure on a chart, apart from D and E | not asked for. The design draws one measure at a time |
| Goals, targets or a trend line | out of the design's boundary |
| The "onde medir" drawings | slice MeasureGuide |

## Assumptions

Defaults that are not already a numbered criterion. Drop a row once it is.

| Assumption | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| The card's look and behaviour: chips, one chart at a time, Cintura first, the headline and change, x labels first/middle/last, the D/E line styles and labels, the touch tip, the card above the form (AC 1-30 where they follow v6) | as mockup v6 draws it | Samuel approved v6's Gráfico as-is | y - Samuel, 2026-10-09 |
| The copy when the chosen measure has no entry (AC 7) | "Ainda sem medição de cintura." | v6 writes "Ainda sem cintura medido.", which does not agree with the feminine nouns (cintura, coxa, panturrilha). Same idea, correct for all 8 | | y - Samuel approved the plan, 2026-10-09 |
| A pair whose sides were measured on different dates (AC 20, AC 21, AC 22) | the one-entry text only when every value of the pair is on one date; otherwise the chart, a side with one value showing "primeira medição" and a lone point, a side with none left out | v6 crashes on a side with no value and dates the one-entry text by the right side only. She usually measures both sides together, so this is an edge | | y - Samuel approved the plan, 2026-10-09 |
| Chip tap size (AC 3) | v6's pill size, about 34 px tall, as Lembrete's interval buttons | Lembrete set that precedent from the same mockup. Raising both to 44 px is one CSS rule if she misses a tap | | y - Samuel approved the plan, 2026-10-09 |
| The chart's accessible name (AC 16) | the chip's label in lower case: "Gráfico de abdômen", "Gráfico de braço" | v6 l.756 uses the chip key, which reads "Gráfico de abdomen" and "Gráfico de braco" to a screen reader. Same idea, spelled as she reads it | y - Samuel, 2026-10-09 (verification round 1) |
| Where the tip sits at the chart's edges (AC 23) | its centre kept at least half its own width, and never less than v6's 50px, from each side of the plot | v6 clamps at 50px, which fits the single tip (~65px) but lets a pair's tip (~135px) stick out of the card at the right edge | y - Samuel, 2026-10-09 (verification round 1) |
| Pushing to her phone | after Samuel's go-ahead, never as part of the plan | push is never part of an approved plan | y - Samuel, 2026-10-08 |

**Open questions:** none - all resolved or logged above.

## Observable

Worksheet, not the review. `n/a` needs its reason. One row may group the same decision
across several routes.

| Surface | Decision | Landing |
| --- | --- | --- |
| screen Medidas · Sua evolução | empty state: no Measurement | AC 2 |
| screen Medidas · Sua evolução | empty state: the chosen measure has none | AC 7 |
| screen Medidas · Sua evolução | one-entry state | AC 8, AC 20, AC 22 |
| screen Medidas · Sua evolução | loading, unauthorised | n/a - reads the in-memory record, single user |
| screen Medidas · Sua evolução | error state: storage not saving | existing - the "Seus dados não estão sendo salvos neste navegador" warning (Menu AC 6). The chart still draws what is in memory |
| screen Medidas · Sua evolução | density and ordering | AC 1, AC 3, AC 11, AC 13, AC 28, AC 29 |
| screen Medidas · Sua evolução | destructive action confirms | n/a - the card changes nothing |
| screen Medidas · Sua evolução | colour in both schemes, and without colour | AC 18, AC 19, AC 30 |
| screen Medidas · Sua evolução | assistive tech | AC 3, AC 4, AC 16 |
| copy headline, change, one-entry, tip | structure and tone | AC 7, AC 8, AC 9, AC 10, AC 23 - pt-BR, short, mockup v6 |

## Sources

- `.design/body-measurements.md`, slice Gráfico and Key decisions 3 and 6 - confirmed by Samuel 2026-10-08
- Mockup https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa version 6 - `#chartCard`, `renderChart`, `series`, `niceTicks`, `CHIPS`, `PAIRS`, and the `.chips`, `.chip`, `.chart-card`, `.headline`, `.pair`, `.legend`, `.plot`, `.tip`, `.first` styles and the `--s-d` / `--s-e` tokens; Gráfico approved as-is by Samuel 2026-10-09
