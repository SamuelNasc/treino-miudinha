# Histórico

## Problem

Since slice 3 she can log a Measurement, but once saved she can only see it again by opening the
form on that exact date. There is no way to look back over what she logged, to fix a typo she
saved (68 kg typed as 86), or to remove an entry made on the wrong day. A wrong entry today stays
in her record for good, moves the reminder (Lembrete counts from the last tape entry), and will
draw a false point on the chart in slice Gráfico. The design's success review on 2026-12-08 is
Samuel opening her Histórico and counting entries; today there is nothing to open.

This is slice 5 of 7 in `.design/body-measurements.md`. When it ships, Medidas shows a section
"Histórico" below "Nova medição": newest first, one collapsed row per entry ("30/09 · 11 medidas",
"23/09 · só peso · 62,9 kg"). A tapped row opens with every value it holds and "Editar" / "Apagar".
"Apagar" asks "Apagar a medição de 08/10?" first. "Editar" opens the form on that entry, where a
cleared field removes that measure. With nothing logged yet, the section says "Nenhuma medição
ainda." with a button to log the first.

## Flow

This reuses `measurementsOf`, `deleteMeasurement`, `reminderDue` (which already re-derives from
whatever tape entries remain), `MEASURES` for order, labels and units, `MeasureForm` with its
`openRequest` and its validation, `App`'s toast, and `useRecord`'s write-back. Nothing new is
stored.

1. Medidas renders -> `App` (exists) passes `measurementsOf(record)` to the Histórico section (new, no door - placement per conventions) -> rows, newest first, or the empty state
2. "Fazer a primeira" -> `App` bumps the form's open request -> `MeasureForm` (exists) opens on today, or stays as it is when already open
3. "Apagar" -> the row's inline confirm -> "Apagar" -> `App` calls `deleteMeasurement` (exists, `src/domain/measurements.ts`) -> `useRecord` (exists) writes `treino:v1`, toast "Medição apagada"
4. "Editar" -> `App` asks `MeasureForm` (exists) to open on that date in edit mode -> save -> `measurements.ts` (exists) replaces that entry's values with exactly the filled fields (new function, no door) -> `useRecord` writes `treino:v1`, toast "Medição atualizada"
5. out: Hoje's reminder card, Histórico and the form's placeholders re-derive from the new list on the next render

## Impact

| Front | What changes |
| --- | --- |
| screen Medidas | gains a section "Histórico" between "Nova medição" and "Lembrete". The Lembrete tests compare heading order (`indexOf` greater than "Nova medição") and still hold; a test that assumes Lembrete directly follows the form is fixed by asserting the new order, never by loosening it |
| component `MeasureForm` | gains an edit mode: its title reads "Editar dd/mm", a cleared field removes that measure, and saving replaces rather than merges. "Nova medição" keeps the confirmed rule that an emptied field on an existing day keeps the stored value (registrar-medicao) |
| domain | new term: edit - saving a Measurement's values as given, so a measure left blank is removed from it. Lives in `src/domain/measurements.ts` beside `saveMeasurement`, which keeps merging |
| domain | `deleteMeasurement` gets its first UI caller. Its rule and the reminder's re-derivation are unchanged (Measurement AC 11) |
| stored data | nothing to migrate. Edits and deletes write into the `measurements` list slice 1 fixed. The record stays `version: 1` |

## Relations

None - no stored-data shape change. Edit and delete keep one Measurement per date, ordered by date, with one or more values (Measurement doors 1 and 3).

## Surface

None - nothing consumed outside.

## Landing

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| None | - | - |

- Nothing in this change is hard to reverse. Both writes produce entries the Measurement slice already accepts, and every screen choice is a redeploy

## Criteria

### S1: The list (P1)

She sees every Measurement she logged, newest first, and can open one to read its values.

**Acceptance Criteria**

1. The system SHALL show on Medidas a section headed "Histórico", after the section "Nova medição" and before the section "Lembrete"
2. WHILE no Measurement is stored THEN the section SHALL show the text "Nenhuma medição ainda." and a button "Fazer a primeira", and no list
3. WHEN "Fazer a primeira" is tapped THEN the system SHALL open the form "Nova medição" on today's date and scroll it into view, and IF the form is already open THEN SHALL leave its date and typed values as they were
4. WHILE Measurements are stored THEN the section SHALL show one row per Measurement, every one of them with no paging, ordered newest date first
5. The closed row of a Measurement holding a tape measure SHALL show its date as `dd/mm` and "N medidas", N counting every measure it holds including `peso`, singular "1 medida" (2026-09-30 with all 11: "30/09" and "11 medidas")
6. The closed row of a Measurement holding only `peso` SHALL show its date and "só peso · V kg" with a decimal comma (2026-09-23 with 62.9: "23/09" and "só peso · 62,9 kg")
7. IF a Measurement's year differs from today's year THEN its row SHALL show the date as `dd/mm/aa` (2025-12-30 seen in 2026: "30/12/25")
8. WHEN a closed row is tapped THEN the system SHALL open it, with `aria-expanded="true"`, showing each measure it holds on its own line in `MEASURES` order, the label then the value with a decimal comma and its unit ("Cintura" "71,6 cm"), then the buttons "Editar" and "Apagar", and SHALL close any other open row
9. WHEN an open row is tapped THEN the system SHALL close it

**Independent test:** seed three Measurements across two dates and a weight-only one, open Medidas: rows newest first with the right summaries; tap one, its values show; tap another, the first closes.

### S2: Delete (P1)

She removes a wrong entry, after one confirm.

**Acceptance Criteria**

10. WHEN "Apagar" is tapped in an open row THEN the system SHALL show inside that row the text "Apagar a medição de 08/10?" with the buttons "Apagar" and "Cancelar", and store nothing
11. WHEN "Cancelar" is tapped THEN the system SHALL hide the confirm and keep the Measurement
12. WHEN the confirm's "Apagar" is tapped THEN the system SHALL remove that Measurement from the stored record, remove its row, and show the toast "Medição apagada"
13. WHEN a row's open state changes, that row or another, THEN the system SHALL hide any confirm that was showing
14. WHEN the deleted Measurement was the last one with a tape measure THEN Hoje SHALL derive the reminder from the previous tape Measurement (tape on 2026-09-28 and 2026-10-05, interval 7, today 2026-10-08: deleting 2026-10-05 shows "Hora de medir" with "A última com fita foi há 10 dias.")
15. WHEN the last stored Measurement is deleted THEN the section SHALL show the empty state of AC 2
16. IF the form is open in edit mode on the deleted date THEN the system SHALL close the form

**Independent test:** seed one tape Measurement, open its row, "Apagar", "Cancelar": still there; "Apagar", "Apagar": gone, toast shown, empty state shown, Hoje shows "Hora da primeira medição".

### S3: Edit (P1)

She corrects a saved entry, including taking a measure out of it.

**Acceptance Criteria**

17. WHEN "Editar" is tapped in an open row THEN the system SHALL open the form titled "Editar 08/10" with that Measurement's values in their fields and the other fields blank, show no "Já tem medição nesse dia" hint, and scroll the form into view
18. WHEN "Editar" is tapped while the form is open THEN the system SHALL replace what the form holds with that Measurement, dropping any typed values
19. WHILE the form is in edit mode THEN its date SHALL show the edited date and SHALL NOT be editable
20. WHEN the form is saved in edit mode with at least one value THEN the system SHALL store that Measurement's values as exactly the filled fields, a cleared field removing that measure, show the toast "Medição atualizada", close the form, and title it "Nova medição" again
21. WHILE the form is in edit mode with every field blank THEN its save button SHALL read "Apagar medição" and be enabled
22. WHEN "Apagar medição" is tapped THEN the system SHALL show inside the form the confirm "Apagar a medição de 08/10?" with "Apagar" and "Cancelar", whose "Apagar" removes the Measurement as in AC 12 and closes the form, and whose "Cancelar" leaves the form as it was
23. IF a field holds a bad value in edit mode THEN the system SHALL mark it with "Confira este valor" and keep the save button disabled, as the form "Nova medição" does
24. WHEN "Fechar" is tapped in edit mode THEN the system SHALL close the form storing nothing, and the next "Abrir" SHALL open "Nova medição" on today
25. WHEN an edit removes the only tape measure of the last tape Measurement THEN Hoje SHALL derive the reminder from the previous tape Measurement, as in AC 14

**Independent test:** seed 2026-09-30 with peso and cintura, open its row, "Editar", clear cintura, save: the row reads "só peso · …", the stored entry has no `cintura`, toast "Medição atualizada".

### S4: Record and arrangement (P1)

**Acceptance Criteria**

26. The system SHALL keep the record at `version: 1` under `treino:v1` after any delete or edit, with `completions`, `today`, `weights`, `restSeconds`, `reminder` and every other Measurement unchanged by it
27. WHEN the section is shown at a 360×740 viewport THEN a closed row SHALL show the date at its left, the summary after it, and a chevron at its right on one line, the row at least 44 px tall
28. WHEN a row is open at a 360×740 viewport THEN its values SHALL sit in one panel with label left and value right on each line, and "Editar" and "Apagar" SHALL sit right-aligned on one row below it, each at least 44 px tall
29. The open row's values panel SHALL use the `--blush` background, and the confirm's "Apagar" a `--cherry` fill, in the light and the dark colour scheme

**Independent test:** at 360×740 in both schemes, open a row and its confirm; compare against mockup v6.

## Out of scope

Product capabilities only. Process and harness rules live in AGENTS.md or as Observable `n/a`.

| Excluded | Why |
| --- | --- |
| Moving an entry to another date | not asked for. Delete it and log it again on the right day (AC 19) |
| Undo after delete | the confirm is the guard, as the design asks. A wrong delete is re-typed from the row she just read |
| Paging, search or filtering the list | the design's default: about 50 rows a year |
| The chart and "onde medir" drawings | slices Gráfico and MeasureGuide |

## Assumptions

Defaults that are not already a numbered criterion. Drop a row once it is.

| Assumption | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Every entry shown, no paging (AC 4) | no paging | the design's default 1 | y - design confirmed by Samuel, 2026-10-08 |
| Clearing every field in edit mode (AC 21, 22) | the save button becomes "Apagar medição" and asks the same confirm as a row's "Apagar" | the design says "clearing all of them asks to delete". Mockup v6 renames the button but deletes on the tap with no confirm, which makes the form the only delete without one | y - Samuel, 2026-10-08 |
| The date in edit mode (AC 19) | fixed to the edited date | mockup v6 leaves it editable, and changing it there saves onto a date with no entry and breaks. Moving entries is not asked for || y - Samuel, 2026-10-08 |
| The year in the row's date (AC 7) | `dd/mm`, plus `/aa` when the year is not this year | the design shows `dd/mm`. From October 2027 two rows would both read "08/10" | n |
| "Editar" with the form open (AC 18) | the form switches to the entry, dropping typed values | "Editar" names the entry to change, so it wins over a half-typed new one. The opposite of "Medir agora", which only means "take me there" | n |
| The edit toast (AC 20) | "Medição atualizada" | mockup v6 | n |
| Pushing to her phone | ships with Menu, Registrar medição and Lembrete at the earliest, after Samuel's go-ahead | push is never part of an approved plan | y - Samuel, 2026-10-08 |

**Open questions:** none - all resolved or logged above.

## Observable

Worksheet, not the review. `n/a` needs its reason. One row may group the same decision
across several routes.

| Surface | Decision | Landing |
| --- | --- | --- |
| screen Medidas · Histórico | empty state | AC 2, AC 3, AC 15 |
| screen Medidas · Histórico | loading, unauthorised | n/a - reads the in-memory record, single user |
| screen Medidas · Histórico | error state: storage not saving | existing - the "Seus dados não estão sendo salvos neste navegador" warning (Menu AC 6). A delete or edit then lasts until reload |
| screen Medidas · Histórico | density and ordering | AC 1, AC 4, AC 5, AC 6, AC 7, AC 27 |
| screen Medidas · Histórico | destructive action confirms | AC 10, AC 11, AC 22 |
| screen Medidas · Histórico | what happens after each action | AC 12, AC 15, AC 16, AC 20 |
| screen Medidas · Histórico | colour in both schemes | AC 29 |
| screen Medidas · form in edit mode | empty state (every field cleared) | AC 21 |
| screen Medidas · form in edit mode | error state: a bad value | AC 23 |
| screen Medidas · form in edit mode | leaving without saving | AC 24 |
| copy rows, confirm, toasts | structure and tone | AC 5, AC 6, AC 10, AC 12, AC 17, AC 20 - pt-BR, short, mockup v6 |

## Sources

- `.design/body-measurements.md`, slice Histórico and Key decisions 3, 4, 5 - confirmed by Samuel 2026-10-08
- Mockup https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa version 6 - `#hist`, `renderHist`, the edit path in `openForm`, `validate` and the form's submit, and the `.hist`, `.row-head`, `.vals`, `.acts`, `.confirm` and `.empty` styles
