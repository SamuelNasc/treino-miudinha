# Histórico checks

Profile: ui
Plan: `.specs/features/historico/plan.md`

35 checks in 4 slices · 0 one-way doors · 0 open

The edit rule is proven at its own layer in `src/domain/measurements.test.ts` (new
`describe("edit measurement")`). Behaviour proofs render `App` in jsdom (`src/App.test.tsx`, new
`describe("Histórico")`), with `setToday`, `seed` and `stored` as the existing tests use them.
Today is `THU` (2026-10-08) unless a check says otherwise. "Scrolled into view" is observed as a
spy on `Element.prototype.scrollIntoView` called with the form's section as `this`. Layout and
style proofs are Playwright at 360×740 (`e2e/historico.spec.ts`, new), seeding `treino:v1` before
load and fixing the clock at 2026-10-08 so the dates do not depend on the day the suite runs.
Binding source: mockup v6 (https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa), `renderHist`,
the edit path in `openForm`, `validate` and the form's submit, and the `.hist`, `.row-head`,
`.vals`, `.acts`, `.confirm`, `.empty` styles.

"The section" is the section headed "Histórico". "A row" is the button whose `aria-expanded`
opens an entry. `FULL` is the entry 2026-09-30 holding all 11 measures. `TWO` is 2026-09-30
holding `{ peso: 62.6, cintura: 71.6 }`. "Tape" is a Measurement holding a measure other than
`peso`.

## Checks

### S1 - The list · 5 files · ~93 KB · ~23k

**C1** - On Medidas the headings come in the order "Nova medição", "Histórico", "Lembrete" in document order, with no Measurement and with one (AC 1) — done
Proof: `pnpm vitest run src/App.test.tsx -t "historico sits between the form and lembrete"`

**C2** - With no `measurements` field, and again with `measurements: []`, the section holds the text "Nenhuma medição ainda." and a button "Fazer a primeira", and no `list` role (AC 2) — done
Proof: `pnpm vitest run src/App.test.tsx -t "historico empty state"`

**C3** - With the form closed, tapping "Fazer a primeira" shows the button "Fechar" and the field "Data" at `2026-10-08`, and `scrollIntoView` was called on the form's section. With the form opened, its date set to 2026-10-01 and Peso `62` typed, tapping "Fazer a primeira" leaves the date at `2026-10-01` and Peso at `62` (AC 3) — done
Proof: `pnpm vitest run src/App.test.tsx -t "fazer a primeira opens the form"`

**C4** - Seeded with 60 weekly Measurements from 2025-08-21 to 2026-10-08, the section's list holds exactly 60 rows, the first row's date reads "08/10" and the last "21/08/25", and every row's date is later than the next one's (AC 4) — done
Proof: `pnpm vitest run src/App.test.tsx -t "every entry newest first"`

**C5** - Table-driven, each entry on 2026-09-30, the closed row shows "30/09" and the summary: `FULL` → "11 medidas"; `TWO` → "2 medidas"; `{ cintura: 72 }` → "1 medida"; `{ peso: 62.9 }` → "só peso · 62,9 kg"; `{ peso: 64 }` → "só peso · 64 kg"; and no row shows any measure's value while closed (AC 5, AC 6) — done
Proof: `pnpm vitest run src/App.test.tsx -t "closed row summary"`

**C6** - Table-driven with today 2026-10-08: an entry on 2025-12-30 reads "30/12/25"; on 2026-01-02 reads "02/01"; on 2026-10-08 reads "08/10". With today 2027-01-05, an entry on 2026-12-30 reads "30/12/26" (AC 7) — done
Proof: `pnpm vitest run src/App.test.tsx -t "row date shows the year only when it differs"`

**C7** - Seeded with 2026-09-30 stored as `{ "braco-e": 28.3, peso: 62.6, cintura: 71.6 }` (keys out of order) and `{ peso: 62.9 }` on 2026-09-23: tapping the 30/09 row sets its `aria-expanded="true"` and shows, in order, the lines ["Peso", "62,6 kg"], ["Cintura", "71,6 cm"], ["Braço E", "28,3 cm"] and no other measure line, then the buttons "Editar" and "Apagar". Tapping the 23/09 row then sets 30/09's `aria-expanded="false"`, removes its lines and buttons, and opens 23/09 with only ["Peso", "62,9 kg"] (AC 8) — done
Proof: `pnpm vitest run src/App.test.tsx -t "opening a row shows its values"`

**C8** - Tapping an open row sets its `aria-expanded="false"` and removes its lines, "Editar" and "Apagar" (AC 9) — done
Proof: `pnpm vitest run src/App.test.tsx -t "tapping an open row closes it"`

### S2 - Delete · 3 files · ~73 KB · ~18k

**C9** - With `TWO` stored, opening its row and tapping "Apagar" shows inside that row the text "Apagar a medição de 30/09?" with the buttons "Apagar" and "Cancelar", and the stored record still deep-equals the seed (AC 10) — done
Proof: `pnpm vitest run src/App.test.tsx -t "apagar asks first"`

**C10** - Then tapping "Cancelar" removes the confirm text, keeps the row open with its lines, and the stored record still deep-equals the seed (AC 11) — done
Proof: `pnpm vitest run src/App.test.tsx -t "cancelar keeps the entry"`

**C11** - With 2026-09-23 and 2026-09-30 stored, confirming "Apagar" on 30/09 leaves `measurements` equal to just the 2026-09-23 entry, removes the 30/09 row, leaves 1 row, and shows a status "Medição apagada" (AC 12) — done
Proof: `pnpm vitest run src/App.test.tsx -t "confirmed apagar removes the entry"`

**C12** - With the confirm showing on 30/09: tapping the 30/09 row (closing it) and reopening it shows no confirm text; with the confirm showing again, opening the 23/09 row shows no confirm text anywhere in the section. Stored record unchanged throughout (AC 13) — done
Proof: `pnpm vitest run src/App.test.tsx -t "a row change dismisses the confirm"`

**C13** - With tape `{ cintura: 72 }` on 2026-09-28 and 2026-10-05 and the reminder absent: Hoje has no card; after deleting 05/10 on Medidas and switching to Hoje, the card says "A última com fita foi há 10 dias."; after also deleting 28/09, it says "Hora da primeira medição" (AC 14) — done
Proof: `pnpm vitest run src/App.test.tsx -t "deleting re-derives the reminder"`

**C14** - Deleting the only stored Measurement shows "Nenhuma medição ainda." and "Fazer a primeira", and the stored `measurements` is `[]` (AC 15) — done
Proof: `pnpm vitest run src/App.test.tsx -t "deleting the last entry shows the empty state"`

**C15** - With 2026-09-23 and 2026-09-30 stored and the form in edit mode on 30/09 ("Editar 30/09" shown): deleting 23/09 from its row leaves "Editar 30/09" and its values in the form; then deleting 30/09 from its row leaves no form, the button "Abrir", and the heading "Nova medição" (AC 16) — done
Proof: `pnpm vitest run src/App.test.tsx -t "deleting the edited entry closes the form"`

### S3 - Edit · 6 files · ~105 KB · ~26k

**C16** - The edit rule, table-driven over the stored list [2026-09-23 `{ peso: 62.9 }`, 2026-09-30 `TWO`], today 2026-10-08: edit 2026-09-30 with `{ peso: 62.4 }` → ok, that entry's values exactly `{ peso: 62.4 }`, 2026-09-23 untouched, order kept; with `{ peso: 62.6, cintura: 71.6, busto: 90 }` → values exactly those three; with `{ cintura: 680 }` → refused as invalid naming `cintura`, record unchanged; with `{}` → refused as empty, record unchanged; on 2026-09-24 (no entry) → refused, record unchanged; and `saveMeasurement` on 2026-09-30 with `{ peso: 62.4 }` still merges to `{ peso: 62.4, cintura: 71.6 }` (AC 20, AC 23) — done
Proof: `pnpm vitest run src/domain/measurements.test.ts -t "edit measurement"`

**C17** - With `TWO` stored and today's 2026-10-08 entry `{ peso: 63 }` also stored: tapping "Editar" on 30/09 shows the heading "Editar 30/09" and no heading "Nova medição", Peso `62,6`, Cintura `71,6` and the other 9 fields empty, no text "Já tem medição nesse dia. O que você preencher atualiza ela.", and `scrollIntoView` was called on the form's section (AC 17) — done
Proof: `pnpm vitest run src/App.test.tsx -t "editar opens the form on the entry"`

**C18** - With the form opened as "Nova medição" and Peso `70` typed, tapping "Editar" on 30/09 shows Peso `62,6`; then tapping "Editar" on 23/09 shows "Editar 23/09" with Peso `62,9` and Cintura empty (AC 18) — done
Proof: `pnpm vitest run src/App.test.tsx -t "editar replaces what the form holds"`

**C19** - In edit mode on 30/09 the field "Data" has value `2026-09-30` and is `disabled` or `readonly`; firing a change to `2026-09-20` leaves it at `2026-09-30` and the heading at "Editar 30/09" (AC 19) — done
Proof: `pnpm vitest run src/App.test.tsx -t "the date is locked while editing"`

**C20** - In edit mode on `TWO`, clearing Cintura, typing Peso `62,4` and Busto `90` and saving stores the 2026-09-30 entry's values exactly `{ peso: 62.4, busto: 90 }`, shows a status "Medição atualizada", leaves no form open, and the heading "Nova medição" with the button "Abrir"; the 30/09 row then reads "2 medidas" (AC 20) — done
Proof: `pnpm vitest run src/App.test.tsx -t "saving an edit replaces the values"`

**C21** - In edit mode on `TWO`, clearing Peso and Cintura makes the submit button read "Apagar medição" and be enabled; typing Peso `62` makes it read "Salvar medição" again. In "Nova medição" with every field blank the button reads "Salvar medição" and is disabled (AC 21) — done
Proof: `pnpm vitest run src/App.test.tsx -t "a cleared edit offers to delete"`

**C22** - In edit mode on `TWO` with every field cleared, tapping "Apagar medição" shows inside the form "Apagar a medição de 30/09?" with "Apagar" and "Cancelar", stored record unchanged; "Cancelar" removes that text and leaves "Editar 30/09" with the fields still empty and the button "Apagar medição"; tapping "Apagar medição" and then "Apagar" leaves `measurements` without 2026-09-30, a status "Medição apagada", no form open, and no 30/09 row (AC 22) — done
Proof: `pnpm vitest run src/App.test.tsx -t "deleting from the form asks first"`

**C23** - In edit mode on `TWO`, typing Cintura `680` and leaving the field shows "Confira este valor" with Cintura `aria-invalid="true"`, and the submit button is disabled; stored record unchanged (AC 23) — done
Proof: `pnpm vitest run src/App.test.tsx -t "a bad value in an edit is marked"`

**C24** - In edit mode on `TWO`, clearing Cintura and tapping "Fechar" leaves the stored record equal to the seed; tapping "Abrir" then shows the heading "Nova medição", "Data" at `2026-10-08`, and an editable date field (AC 24) — done
Proof: `pnpm vitest run src/App.test.tsx -t "fechar leaves the edit unsaved"`

**C25** - With `{ cintura: 72 }` on 2026-09-28 and `{ peso: 62, cintura: 71 }` on 2026-10-05: Hoje has no card; after editing 05/10 to clear Cintura and saving, Hoje's card says "A última com fita foi há 10 dias." (AC 25) — done
Proof: `pnpm vitest run src/App.test.tsx -t "an edit that drops the tape re-derives the reminder"`

### S4 - Record and arrangement · 3 files · ~40 KB · ~10k

**C26** - Seeded with completions, `today.checked`, `weights`, `restSeconds: 60`, `reminder: { everyDays: 14, snoozedOn: "2026-10-07" }` and Measurements on 2026-09-23, 2026-09-30 and 2026-10-05: after editing 30/09 and then deleting 23/09, the stored record has `version: 1` under `treino:v1`, and its `completions`, `today`, `weights`, `restSeconds`, `reminder` and the 2026-10-05 entry deep-equal the seed (AC 26) — done
Proof: `pnpm vitest run src/App.test.tsx -t "historico writes keep the rest of the record"`

**C27** - At 360×740 with `TWO` and `{ peso: 62.9 }` on 2026-09-23 stored: in each closed row the date's right edge ≤ the summary's left edge, the summary's right edge ≤ the chevron's left edge, the chevron's right edge is within 1px of the row's right edge, the three vertical centres are within 2px of each other, and the row is ≥ 44px tall; the 30/09 row's top < the 23/09 row's top (AC 4, AC 27) — done
Proof: `pnpm exec playwright test e2e/historico.spec.ts -g "closed row arrangement at 360"`

**C28** - At 360×740 with the 30/09 row open: each value line's label right edge ≤ its value's left edge, the value's right edge is within 16px of the panel's right edge, and each line's top ≥ the previous line's bottom; "Editar"'s right edge ≤ "Apagar"'s left edge with tops within 1px, "Apagar"'s right edge within 1px of the row's right edge, both tops ≥ the panel's bottom, each ≥ 44px tall; with the confirm open, its top ≥ the "Apagar" action's bottom and its "Apagar" right edge ≤ "Cancelar"'s left edge (AC 28) — done
Proof: `pnpm exec playwright test e2e/historico.spec.ts -g "open row arrangement at 360"`

**C29** - In each scheme (light / dark): the values panel `background-color` `#ffe1e6` / `#3a141c`; a label (`dt`) `color` `#8d5a63` / `#d59aa4`; the summary `color` `#8d5a63` / `#d59aa4`; the chevron `color` `#b3122e` / `#ff5c75`; "Editar" and "Apagar" actions `color` `#b3122e` / `#ff5c75` with a transparent background; the confirm `background-color` `#ffe1e6` / `#3a141c`; the confirm's "Apagar" `background-color` `#b3122e` / `#ff5c75` and `color` `#ffffff` / `#1c0a0e`; "Cancelar" `color` `#8d5a63` / `#d59aa4` with `border-top-color` `#f6d3d9` / `#45202a`; each row's `border-top-color` `#f6d3d9` / `#45202a`; the empty text `color` `#8d5a63` / `#d59aa4` and "Fazer a primeira" `background-color` `#b3122e` / `#ff5c75` (AC 29) — done
Proof: `pnpm exec playwright test e2e/historico.spec.ts -g "historico colours"`

**C30** - Type and box values from mockup v6: the heading "Histórico" `font-size` `22px`; the row date `font-family` starting with `Fredoka`, `font-weight` `600`, `font-size` `17px`; the summary `font-size` `14px`; the chevron 16×16px, with a computed `transform` other than `none` when the row is open and `none` when closed; the values panel `border-radius` `14px` and padding `12px` top / `14px` left; a value line `font-size` `15px`, the value (`dd`) `font-weight` `700`, the first line `border-top-width` `0px` and the second `1px`; the actions `font-size` `14px`, `font-weight` `500`, `border-top-width` `0px`; the confirm `border-radius` `14px` and `font-size` `14px`; its "Apagar" `font-weight` `500` and `border-radius` ≥ half its height; "Cancelar"'s border width as declared by the last matching rule in cascade order, `.ghost`, is `1.5px` (Chromium computes a 1.5px border as `1px`; Samuel chose the declared value, 2026-10-08); each row `border-top-width` `1px` (AC 27, AC 28, AC 29) — done
Proof: `pnpm exec playwright test e2e/historico.spec.ts -g "historico type and boxes"`

**C31** - At 360×740 with no Measurement: "Nenhuma medição ainda." sits above "Fazer a primeira" (its bottom ≤ the button's top), the horizontal centres of both are within 2px of the section's centre, and the text's computed `text-align` is `center`; "Fazer a primeira" is ≥ 44px tall (AC 2) — done
Proof: `pnpm exec playwright test e2e/historico.spec.ts -g "empty state arrangement at 360"`

**C32** - At 360×740 with `TWO` and `PESO` stored, as mockup v6 pins the list to the card: the list has computed `list-style-type` `none`, margins `0px` and padding `0px`; each row's left edge is within 1px of the heading "Histórico"'s left edge and its right edge within 1px of the section's content right edge (the section's right minus its `padding-right`); each row's `border-top-style` is `solid`; each row button has `text-align` `left`, a transparent `background-color`, `border-top-left-radius` `10px`, and its date's left edge within 1px of the row's left edge (AC 27). Added after round 1 of verification: probes P1 and P4 survived and these values were neither checked nor named out of reach — done
Proof: `pnpm exec playwright test e2e/historico.spec.ts -g "list pinned to the card"`

**C33** - With the 30/09 row of `TWO` open, in each scheme (light / dark): the chevron's computed `transform` is a 180° rotation (matrix `a` and `d` within 0.001 of `-1`, `b` and `c` within 0.001 of `0`); the values panel has margins `0px` and `row-gap` `0px` (`normal` counts as 0); each value line has `column-gap` `8px`; the second line's `border-top-style` is `solid` and `border-top-color` `#f6d3d9` / `#45202a`; each value (`dd`) has `margin-left` `0px` (AC 28, AC 29). Added after round 1 of verification: probes P2, P5 and P8 survived — done
Proof: `pnpm exec playwright test e2e/historico.spec.ts -g "values panel and chevron"`

**C34** - In each scheme (light / dark): the row confirm has `align-items` `center`; its "Apagar" has `border-top-width` `0px`; "Cancelar" has `border-top-style` `solid`, `background-color` `#ffffff` / `#2a1016` and `font-size` `14px`; with no Measurement, "Fazer a primeira" has `border-top-width` `0px`, `color` `#ffffff` / `#1c0a0e`, a `border-top-left-radius` ≥ half its height, padding `9px` top / `18px` left, `font-family` starting with `Fredoka`, `font-weight` `600`, `font-size` `16px` and margins `0px` (AC 2, AC 29). Added after round 1 of verification: probes P3 and P6 survived — done
Proof: `pnpm exec playwright test e2e/historico.spec.ts -g "confirm and empty buttons"`

**C35** - With no Measurement, in each scheme (light / dark): the empty state's `border-top-width` is `1px`, `border-top-style` `solid` and `border-top-color` `#f6d3d9` / `#45202a`, with padding `4px` top and `8px` bottom, as a row of mockup v6's list; its top is ≥ the heading "Histórico"'s bottom (AC 30). Added after round 1 of verification: Samuel chose the mockup's divider, 2026-10-09 — done
Proof: `pnpm exec playwright test e2e/historico.spec.ts -g "empty state divider"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| section order (3) | after "Nova medição" C1 · before "Lembrete" C1 · present when empty C1, C2 | - |
| empty-state sources (3) | field absent C2 · `[]` stored C2 · last entry deleted C14 | - |
| "Fazer a primeira" (2) | form closed opens on today C3 · form open left as is C3 | - |
| row summary kinds (5) | many with tape C5 · two C5 · one, singular C5 · peso-only with decimal C5 · peso-only whole C5 | - |
| row date formats (3) | this year `dd/mm` C5, C6 · earlier year `dd/mm/aa` C4, C6 · year rollover C6 | - |
| row open states (3) | open shows values in `MEASURES` order C7 · opening another closes the first C7 · tapping open closes C8 | - |
| row actions (2) | "Editar" C17, C18 · "Apagar" C9 | - |
| confirm outcomes (4) | "Apagar" C11, C22 · "Cancelar" C10, C22 · dismissed by closing the row C12 · dismissed by opening another C12 | - |
| delete triggers (2) | row confirm C11 · form confirm C22 | - |
| edit outcomes (5) | replace dropping a cleared field C16, C20 · add a field C16, C20 · every field blank → delete C21, C22 · bad value C16, C23 · "Fechar" unsaved C24 | - |
| edit rule refusals (3) | invalid C16 · empty C16 · no entry on that date C16 | - |
| form already open (4) | "Fazer a primeira" C3 · "Editar" over "Nova medição" C18 · "Editar" over another edit C18 · delete of another date C15 | - |
| delete of the edited date (1) | form closes C15 | - |
| reminder re-derives (3) | delete newest tape C13 · delete every tape C13 · edit drops the tape C25 | - |
| untouched record fields (6) | `completions` C26 · `today` C26 · `weights` C26 · `restSeconds` C26 · `reminder` C26 · other Measurements C11, C16, C26 | - |
| colour schemes (2) | light C29, C33, C34, C35 · dark C29, C33, C34, C35 | - |
| mockup v6 elements (25) | heading "Histórico" C1, C30 · empty text and button C2, C31 · rows newest first C4, C27 · date `dd/mm` C5 · summary copy C5 · date / summary / chevron in one line C27 · chevron rotates open C30 · date type C30 · summary type and colour C29, C30 · row divider C29, C30 · values panel blush C29 · panel radius and padding C30 · label / value lines C7, C28 · label colour, value weight C29, C30 · line dividers C30 · "Editar" / "Apagar" right-aligned C28 · action text style C29, C30 · confirm copy C9, C22 · confirm blush panel C29, C30 · confirm "Apagar" filled C29, C30 · "Cancelar" ghost C29, C30 · form title "Editar dd/mm" C17 · "Apagar medição" button C21 · toast "Medição apagada" C11 · toast "Medição atualizada" C20 | - |
| mockup v6 values left unaccounted in round 1 (28) | `.hist` list-style C32 · `.hist` margin C32 · `.hist` padding C32 · row border style C32 · row button background C32 · row button text-align C32 · row button radius C32 · chevron `rotate(180deg)` C33 · panel margin C33 · panel gap C33 · line gap C33 · line border style C33 · line border colour C33 · value margin C33 · confirm `align-items` C34 · confirm "Apagar" border C34 · "Cancelar" border style C34 · "Cancelar" background C34 · "Cancelar" font size C34 · empty divider C35 · "Fazer a primeira" border C34 · "Fazer a primeira" colour C34 · "Fazer a primeira" radius C34 · "Fazer a primeira" padding C34 · "Fazer a primeira" font family C34 · "Fazer a primeira" weight C34 · "Fazer a primeira" size C34 · "Fazer a primeira" margin C34 | - |

- Claims naming layout, type or colour: C27-C35 - each proof runs in Chromium at 360×740
- Deviation from mockup v6, approved in the plan: actions ≥ 44px tall (AC 28) where the mockup's padding gives about 33px; the form confirms before deleting (AC 22) where the mockup deletes on the tap; the date is locked in edit mode (AC 19)
- No other check claims more than the cases its proof exercises
- Out of reach, enumerated per screen against mockup v6. Histórico: each row's padding (4px 0 8px) and inner gap (10px); the row button's grid gap (12px) and padding (10px 0 2px); the date's `tabular-nums`; the chevron's rotation transition (0.2s); the panel's line padding (6px 0) and the value's `tabular-nums`; the actions' gap (4px), padding (6px 8px, overridden by the 44px floor) and radius (8px); the confirm's padding (10px 12px), gap (8px) and wrapping; the confirm "Apagar"'s padding (6px 14px); "Cancelar"'s padding (8px 16px) and radius; the `.vals` grid template (one column); the empty state's gap (10px); its padding is the row's (4px 0 8px, C35). Form in edit mode: nothing beyond the form slice's styles, which it reuses

## Test policy

The repo answers the level for screens: app behaviour through `App` in jsdom, applied CSS and
layout in Playwright (exercise-guides door 3). It leaves the coverage expectation open for the
edit rule, so this row records it for this slice and stays in this file.

| Code | Required proofs | Coverage expectation |
| --- | --- | --- |
| The edit rule (replaces, or refuses invalid / empty / no entry) | one at its own layer in `measurements.test.ts` **and** one through `App` | at its own layer: each outcome and each refusal, plus `saveMeasurement` still merging; through `App`: replace and the all-blank delete path |
| Histórico and edit-mode state through `App` (decides summary, date format, which row is open, confirm, title, button label) | one through `App` in jsdom | each summary kind, each date format, each action and confirm outcome |
| Histórico layout, type and colour (CSS) | one in Playwright at 360×740 | both colour schemes where colour is claimed |

Evidence:

- the edit rule: empty, invalid, no entry on date, else replace -> 3 branch points, 4 outcomes, decides
- the row summary: has tape → count with singular/plural, else peso-only -> 2 branch points, decides
- the row date: same year or not -> 1 branch point, decides
- closest analogue: `saveMeasurement` and `deleteMeasurement` proven table-driven in `src/domain/measurements.test.ts`; the reminder hint through `App` (lembrete C19)

Cost: 1 domain proof, 25 `App` proofs, 5 Playwright proofs across 3 test files.

## Swept

- validation: C16, C23 - an edit refuses an out-of-range value, an empty set and a date with no entry, and the form marks the bad field
- failure modes: existing - storage failing shows "Seus dados não estão sendo salvos neste navegador" (Menu C8); then a delete or edit lasts until reload, recorded in the plan's Observable
- idempotency: C16 - an edit stores exactly the given values, so saving the same edit twice gives the same record; C14 - after a delete there is no row left to delete again
- authorization: n/a - no accounts, one user on one device
- concurrency: n/a - one tab, one thread; each write is a single synchronous record update
- data lifecycle: C11, C14, C22, C26 - delete removes only that entry and touches no other field
- dependency failure: n/a - no external dependency
- state transitions: C7, C8, C12, C15, C18, C21, C22, C24 - row closed ↔ open, confirm shown → dismissed / confirmed, form new ↔ edit ↔ closed
- observability: n/a - personal app, no logging requirement

## Handoff

- S1 ≈ `App.tsx` 6.9 KB, `App.test.tsx` 62.2 KB, `index.css` 16.1 KB, `measurements.ts` 4.4 KB + new Histórico section ≈ 4 KB → ~93 KB / 4 ≈ 23k
- S2 and S4 touch the same files plus `e2e/historico.spec.ts` (new, ≈ 8 KB); S3 adds `MeasureForm.tsx` 7.2 KB and `measurements.test.ts` 7.3 KB → S1-S4 ≈ 116 KB / 4 ≈ 29k, under the 150k budget - one builder

- **Boundary:** C1-C31 closed at the `test(historico)` commit (one builder, no handoff)
- **Settled mid-build:** C30's "Cancelar" border width is read from the declared rule, since Chromium computes a 1.5px border as `1px` (Samuel, 2026-10-08)
- **Abandoned:** reading the longhand `border-top-width` alone - a shorthand holding `var()` leaves it empty
- **Round 1 fix:** C32-C35 added for the verifier's surviving probes P1-P6 and P8 and the 28 unaccounted mockup v6 values; P7 (`list-style`) is asserted by C32. The empty state gains the mockup's row divider (AC 30, the only `src` change). "Fazer a primeira" keeping typed values recorded as confirmed. Samuel chose both, 2026-10-09
