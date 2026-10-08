# Registrar medição

## Problem

Her record can hold Measurements since slice 1, and the Medidas page exists since slice 2, but
there is no way to put a Measurement in. Medidas says "Em breve você registra suas medidas aqui."
They are taking her first measurements now, and those become her baseline (design, Problem). Until
she can log them, every tape session at home and every weigh-in at the gym is lost, or lands on
paper again, which is how the old Excel sheet was abandoned.

This is slice 3 of 7 in `.design/body-measurements.md`. It replaces the placeholder with the
"Nova medição" card from mockup v6. When it ships, she logs any subset of the 11 measures on today
or an earlier day, a second entry on the same day merges into the first, and a typo like 680 for
68,0 is caught before it is stored. Histórico, the chart and the reminder come in later slices, so
after this one the form is the only thing on Medidas.

## Flow

This reuses `saveMeasurement` and `measurementsOf` for merge and validity, `MEASURES` for labels,
units and ranges, `App`'s toast, and `useRecord`'s write-back. Nothing new is stored and nothing
parses the record.

1. tap "Abrir" on Medidas -> `MeasureForm` (new, no door - placement per conventions) inside `App`'s Medidas section (exists), reading `record.measurements` through `measurementsOf` (exists) for the day's values and the placeholders
2. typed text per field -> parsed with a pt-BR comma, then checked by `isValidValue` (exists, `src/domain/measures.ts`) -> marks a bad field, enables or disables Save
3. Save -> `saveMeasurement(record, date, values, today)` (exists, `src/domain/measurements.ts`) -> `App` (exists) `setRecord` -> `useRecord` (exists) writes `treino:v1`
4. out: `App`'s toast "Medição salva" (exists), and the form closes

## Impact

| Front | What changes |
| --- | --- |
| screen Medidas | the placeholder "Em breve você registra suas medidas aqui." goes away, as Menu AC 13 planned ("while no later slice has filled it"). The test `Medidas placeholder` in `src/App.test.tsx` proved that conditional state and is retired with it. Menu's other tests query the region named "Medidas" and the bar, and keep passing unchanged |
| domain | new term: measure text - what she types in a field, digits with at most one decimal after a comma or a dot. Not `parseWeight`, which accepts any number of decimals and 0–500 and falls back to the previous value. Nothing else branches on it |
| domain | existing term: `saveMeasurement` - unchanged. This slice is its first caller |
| stored data | nothing to migrate. Saves go through the slice-1 shape: a new date adds an entry, a known date merges |

## Relations

None - no stored-data shape change. The shape was settled in the Measurement slice.

## Surface

None - nothing consumed outside.

## Landing

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| None | - | - |

- Nothing in this change is hard to reverse. The form is a component and CSS a redeploy changes, and every write goes through `saveMeasurement`, whose shape slice 1 fixed. Histórico's edit and Lembrete's "Medir agora" will reuse the form. Where its open state lives is a refactor, not a door

## Criteria

### S1: Log or merge a Measurement from Medidas (P1)

On Medidas she opens "Nova medição", fills any of the 11 measures for today or an earlier day,
and saves. A typo is caught first.

**Acceptance Criteria**

1. WHILE Medidas is shown THEN the system SHALL show a section headed "Nova medição" with a button "Abrir" (`aria-expanded="false"`) and no measure field, in place of the text "Em breve você registra suas medidas aqui."
2. WHEN "Abrir" is tapped THEN the system SHALL show the form and change the button to "Fechar" with `aria-expanded="true"`, and WHEN "Fechar" is tapped THEN the system SHALL hide the form and change the button back to "Abrir"
3. WHEN the form opens THEN the system SHALL set the date field labelled "Data" to today and its maximum to today
4. The system SHALL show the 11 measure fields in this order: Peso; a group label "Tronco" then Busto, Cintura, Abdômen, Quadril; a group label "Braços e pernas" then Braço, Coxa and Panturrilha, each as one row with its D field then its E field. Each field SHALL be named "<label> em <unit>" (e.g. "Peso em kg", "Braço D em cm") and show its unit, kg or cm, next to it
5. WHEN the form shows a date with no Measurement THEN every field SHALL be empty, and each field's placeholder SHALL be that measure's value on the latest earlier date that has it, written with a comma (e.g. `62,9`), or "–" when no earlier date has it
6. WHEN the form shows a date that has a Measurement THEN each measure in it SHALL be filled in its field with a comma, every other field SHALL be empty with the placeholder of AC 5, and the system SHALL show the hint "Já tem medição nesse dia. O que você preencher atualiza ela."
7. WHEN the date is changed to another day THEN the system SHALL reload every field for that day by AC 5 and AC 6, dropping what was typed for the previous date
8. IF the date field is emptied or set after today THEN the system SHALL set it back to today
9. WHILE every field is empty THEN the system SHALL disable the button "Salvar medição"
10. The system SHALL accept as a field's value digits with at most one decimal after a comma or a dot, ignoring spaces around them (`62,9`, `62.9`, ` 74 `), and SHALL store it as that number (`62.9`)
11. IF a field holds text that AC 10 does not accept, or a number outside that measure's range, THEN, when she leaves the field, the system SHALL mark it (`aria-invalid="true"` and a `--berry` border) and show "Confira este valor" under it, once per D/E row
12. WHILE any field holds a value that AC 11 rejects THEN the system SHALL disable "Salvar medição", whether or not the field is marked yet
13. WHEN a marked field is corrected or emptied and she leaves it THEN the system SHALL remove its mark, and the row's "Confira este valor" once no field in that row is marked
14. WHEN "Salvar medição" is tapped on a date with no Measurement THEN the system SHALL store one Measurement on that date holding exactly the filled measures, show the toast "Medição salva", and close the form
15. WHEN only Peso is filled and saved THEN the system SHALL store a Measurement whose only measure is `peso`
16. WHEN "Salvar medição" is tapped on a date that has a Measurement THEN the system SHALL keep one entry on that date, with every filled field's value replacing the stored one and every empty field keeping the stored value, including a stored value whose field she emptied
17. WHEN the form is opened again after a save THEN the system SHALL show today's date and reload the fields by AC 5 and AC 6, the just-saved values included
18. WHEN "onde medir" under a tape measure's row is tapped THEN the system SHALL show that measure's cue line below the row, followed by "Fita reta, sem apertar.", and change the button to "fechar" with `aria-expanded="true"`. Busto, Cintura, Abdômen, Quadril, and each D/E row SHALL have one "onde medir" button. Peso SHALL have none
19. WHEN "onde medir" is tapped on another row while a cue is shown THEN the system SHALL hide the first cue and show the second, and WHEN "fechar" is tapped THEN the system SHALL hide the cue. Showing or hiding a cue SHALL keep every typed value
20. The cue lines SHALL be, per row: Busto "Na parte mais cheia do busto.", Cintura "Na parte mais fina, acima do umbigo.", Abdômen "Na linha do umbigo.", Quadril "Na parte mais larga do bumbum.", Braço "No meio do braço, relaxado.", Coxa "No meio da coxa, em pé.", Panturrilha "Na parte mais grossa da panturrilha."
21. WHILE the form is open with typed values, WHEN she switches to Hoje and back to Medidas THEN the system SHALL show the form still open with the same date and the same typed values
22. WHEN the form is open at a 360×740 viewport THEN each D/E row SHALL show its D field left of its E field with the same top edge, and "Salvar medição" SHALL span the form's width
23. WHEN "Salvar medição" is scrolled into view at a 360×740 viewport THEN it SHALL be entirely above the rest timer

**Independent test:** `pnpm test` for the form states, parsing, validation, merge and the stored
record, and `pnpm e2e` for the D/E arrangement, the Save width, the mark colour in both schemes
and Save clearing the rest timer at 360×740.

## Out of scope

Product capabilities only. Process and harness rules live in AGENTS.md or as Observable `n/a`.

| Excluded | Why |
| --- | --- |
| The "onde medir" drawings | slice MeasureGuide. The design says the guides start out as text cues, so this slice ships the cue and the drawing slots in later |
| Editing an entry, where an emptied field removes the measure, and "Apagar medição" | slice Histórico. Its replace semantics differ from the merge here (AC 16) |
| Histórico, the chart, the reminder setting on Medidas | their own slices |
| "Medir agora" on the reminder card opening this form | slice Lembrete |
| Prefilling a field with the previous value | the design rejected it: saved unchanged it records a measurement she didn't take |

## Assumptions

Defaults that are not already a numbered criterion. Drop a row once it is.

| Assumption | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| "onde medir" in this slice (AC 18–20) | shipped now with the cue text only, no drawing | the design: "The guides start out as text cues if the drawings aren't ready yet." MeasureGuide is the last slice | y - Samuel, 2026-10-08 |
| When a bad value gets marked (AC 11–12) | marked when she leaves the field. Save is disabled at once | mockup v6 marks on every keystroke, which flags "6" while she is still typing "62" for Peso. Tapping Save on a phone leaves the field first, so the mark still shows before anything could save | y - Samuel, 2026-10-08 |
| An emptied field on a day that already has a Measurement (AC 16) | keeps the stored value. Removing a measure is Histórico's edit | Key decision 3 ("Measures left blank keep what was there"), and mockup v6 does the same | y - Samuel, 2026-10-08 |
| An emptied or future date (AC 8) | resets to today | mockup v6 does this. The picker's maximum stops most future dates already | y - Samuel, 2026-10-08 |
| Pushing to her phone | Menu and this slice ship together at the earliest, after Samuel's go-ahead | Samuel, 2026-10-08. Push is never part of an approved plan | y - Samuel, 2026-10-08 |

**Open questions:** none - all resolved or logged above. Still open from the Measurement slice and
not touched here: "a stored or imported Measurement dated after today is kept".

## Observable

Worksheet, not the review. `n/a` needs its reason. One row may group the same decision
across several routes.

| Surface | Decision | Landing |
| --- | --- | --- |
| screen Medidas · Nova medição | empty state (no Measurement yet) | AC 5 - placeholders "–", form otherwise the same |
| screen Medidas · Nova medição | closed vs open | AC 1, AC 2 |
| screen Medidas · Nova medição | loading, unauthorised | n/a - reads the in-memory record, single user |
| screen Medidas · Nova medição | error state: a bad value | AC 11, AC 12, AC 13 |
| screen Medidas · Nova medição | error state: storage not saving | existing - the "Seus dados não estão sendo salvos neste navegador" warning shows on both destinations (Menu AC 6) |
| screen Medidas · Nova medição | density and ordering | AC 4, AC 22 |
| screen Medidas · Nova medição | a date that already has data | AC 6, AC 16 |
| screen Medidas · Nova medição | what happens after Save | AC 14, AC 17 |
| screen Medidas · Nova medição | destructive action confirms | n/a - nothing here deletes. A merge only overwrites the measures she filled (AC 16) |
| screen Medidas · Nova medição | state kept across a page switch | AC 21 |
| screen Medidas · Nova medição | content not hidden behind the bar and timer | AC 23 |
| copy "onde medir" cues | structure and tone | AC 20, the design's cue lines |

## Sources

- `.design/body-measurements.md`, slice Registrar medição and Key decisions 3, 4, 6 - confirmed by Samuel 2026-10-08
- Mockup https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa version 6 - `#formCard`, `renderFields`, `read`, `validate`, the `.num`, `.lr`, `.group-label`, `.err` and `.save` styles
