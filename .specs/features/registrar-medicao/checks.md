# Registrar medição checks

Profile: ui
Plan: `.specs/features/registrar-medicao/plan.md`

25 checks in 1 slice · 0 one-way doors · 0 open

Behaviour proofs render `App` in jsdom (`src/App.test.tsx`, new `describe("Registrar medição")`),
with `setToday`, `seed` and `stored` as the existing tests use them. Today is `THU` (2026-10-08)
unless a check says otherwise. Measure-text parsing is proven at its own layer
(`src/domain/measures.test.ts`). Layout and colour proofs are Playwright (`e2e/medidas.spec.ts`,
new) at 360×740, per exercise-guides door 3. Binding source: mockup v6
(https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa), `#formCard`, `renderFields`, `read`,
`validate` and the `.num`, `.lr`, `.group-label`, `.err`, `.save` styles.

Each measure row is a group named after the row ("Peso", "Busto", …, "Braço", "Coxa",
"Panturrilha"), so a proof can find a row's field, cue button and message inside it.

## Checks

### S1 - Log or merge a Measurement from Medidas · 8 files · ~70 KB · ~18k

**C1** - On Medidas, the region "Medidas" holds a heading "Nova medição" and a button "Abrir" with `aria-expanded="false"`; there is no textbox named "Peso em kg" and no text "Em breve você registra suas medidas aqui." (AC 1)
Proof: `pnpm vitest run src/App.test.tsx -t "Nova medição starts closed"`

**C2** - Tapping "Abrir" shows the textbox "Peso em kg" and turns the button into "Fechar" with `aria-expanded="true"`; tapping "Fechar" removes the textbox and turns it back into "Abrir" with `aria-expanded="false"` (AC 2)
Proof: `pnpm vitest run src/App.test.tsx -t "Abrir and Fechar toggle the form"`

**C3** - Opened on 2026-10-08, the date field labelled "Data" has value `2026-10-08` and `max` `2026-10-08` (AC 3)
Proof: `pnpm vitest run src/App.test.tsx -t "form opens on today"`

**C4** - The form's textboxes, in document order, are named exactly: "Peso em kg", "Busto em cm", "Cintura em cm", "Abdômen em cm", "Quadril em cm", "Braço D em cm", "Braço E em cm", "Coxa D em cm", "Coxa E em cm", "Panturrilha D em cm", "Panturrilha E em cm". The text "Tronco" comes after the Peso field and before the Busto field, "Braços e pernas" after Quadril and before Braço D. Each of the 8 row groups holds its textboxes and the unit text (`kg` for Peso, `cm` otherwise) once per field; the groups "Braço", "Coxa", "Panturrilha" hold exactly two textboxes, D then E, labelled with the side texts "D" and "E" (AC 4)
Proof: `pnpm vitest run src/App.test.tsx -t "fields in order with units"`

**C5** - With Measurements on 2026-09-24 `{ peso: 63.1, cintura: 72.4, quadril: 101.5 }` and 2026-10-01 `{ peso: 62.9 }` and none on 2026-10-08: every field is empty; placeholders are Peso `62,9`, Cintura `72,4`, Quadril `101,5`, every other field `–`. After setting the date to 2026-09-30, Peso's placeholder is `63,1` (an entry after the form's date is not used) (AC 5)
Proof: `pnpm vitest run src/App.test.tsx -t "placeholders show the previous value"`

**C6** - With a Measurement on 2026-10-08 `{ peso: 62.4, quadril: 101.5 }` and 2026-10-01 `{ cintura: 72 }`: Peso's value is `62,4`, Quadril's `101,5`, Cintura is empty with placeholder `72`, and the hint "Já tem medição nesse dia. O que você preencher atualiza ela." is shown. With no Measurement on the form's date, the hint is absent (AC 6)
Proof: `pnpm vitest run src/App.test.tsx -t "a day with a measurement loads its values"`

**C7** - With a Measurement on 2026-10-01 `{ peso: 62.9 }`: after typing `70` into Cintura and setting the date to 2026-10-01, Cintura is empty and Peso's value is `62,9` (AC 7)
Proof: `pnpm vitest run src/App.test.tsx -t "changing the date reloads the fields"`

**C8** - Setting the date field to empty, and to 2026-10-09, each leaves its value at `2026-10-08` (AC 8)
Proof: `pnpm vitest run src/App.test.tsx -t "an empty or future date resets to today"`

**C9** - With every field empty, "Salvar medição" is disabled; after typing `62` into Peso it is enabled; after clearing Peso again it is disabled (AC 9)
Proof: `pnpm vitest run src/App.test.tsx -t "save is disabled while every field is empty"`

**C10** - The measure-text parser, table-driven: `62,9` → 62.9, `62.9` → 62.9, ` 74 ` → 74, `74` → 74, `101,5` → 101.5, `` and `   ` → empty; `62,95`, `62.`, `,5`, `abc`, `6 2`, `-5`, `62,9,1`, `1e2`, `62,a` → rejected. A number outside the measure's range is rejected: Peso `29,9` and `200,1` rejected, `30` and `200` accepted (AC 10, AC 11)
Proof: `pnpm vitest run src/domain/measures.test.ts -t "measure text"`

**C11** - Typing `62,9` into Peso and saving stores `values.peso` as the number `62.9` in `treino:v1` (AC 10)
Proof: `pnpm vitest run src/App.test.tsx -t "comma decimal is stored as a number"`

**C12** - Table-driven over Peso `abc`, Peso `680`, Peso `6`, Peso `62,95`: right after typing, the field has no `aria-invalid="true"` and the Peso group shows no "Confira este valor"; after leaving the field (tab), it has `aria-invalid="true"` and the Peso group shows "Confira este valor" exactly once (AC 11)
Proof: `pnpm vitest run src/App.test.tsx -t "a bad value is marked on leaving the field"`

**C13** - With Braço D `5` and Braço E `500`, both left: both fields have `aria-invalid="true"` and the group "Braço" shows "Confira este valor" exactly once (AC 11)
Proof: `pnpm vitest run src/App.test.tsx -t "one message per D/E row"`

**C14** - With Peso `62` typed and then Cintura `680` typed and not yet left, "Salvar medição" is disabled (AC 12)
Proof: `pnpm vitest run src/App.test.tsx -t "save is disabled while a value is bad"`

**C15** - With Braço D `5` and Braço E `500` marked: correcting D to `29` and leaving it removes D's `aria-invalid` while "Confira este valor" stays in "Braço"; emptying E and leaving it removes E's mark and the message. A marked Peso `680` corrected to `62` and left loses its mark and message (AC 13)
Proof: `pnpm vitest run src/App.test.tsx -t "correcting a value clears its mark"`

**C16** - With no Measurement stored, filling Peso `62,9` and Cintura `72` on 2026-10-08 and tapping "Salvar medição" stores `measurements` equal to `[{ date: "2026-10-08", values: { peso: 62.9, cintura: 72 } }]`, shows a status "Medição salva", and the button reads "Abrir" with no textbox "Peso em kg" (AC 14)
Proof: `pnpm vitest run src/App.test.tsx -t "saving a new day stores it and closes the form"`

**C17** - Filling only Peso `62,4` and saving stores a Measurement whose `values` is exactly `{ peso: 62.4 }` (AC 15)
Proof: `pnpm vitest run src/App.test.tsx -t "weight only is saved"`

**C18** - With a Measurement on 2026-10-08 `{ peso: 62.4, cintura: 72, quadril: 101.5 }` and on 2026-10-01 `{ peso: 63 }`: changing Peso to `62`, emptying Cintura and typing Busto `91`, then saving, stores exactly two entries, 2026-10-01 unchanged and 2026-10-08 with values `{ peso: 62, cintura: 72, quadril: 101.5, busto: 91 }` (AC 16)
Proof: `pnpm vitest run src/App.test.tsx -t "saving onto a day with a measurement merges"`

**C19** - After saving Peso `61` on 2026-10-01 (date changed), opening the form again shows date `2026-10-08` with Peso empty and placeholder `61`; after saving Peso `60` on 2026-10-08, opening again shows Peso's value `60` (AC 17)
Proof: `pnpm vitest run src/App.test.tsx -t "reopening after a save starts on today"`

**C20** - The form holds exactly 7 buttons "onde medir", one each in the groups Busto, Cintura, Abdômen, Quadril, Braço, Coxa, Panturrilha, and none in Peso; each starts with `aria-expanded="false"`. Tapping Cintura's shows the text "Na parte mais fina, acima do umbigo. Fita reta, sem apertar." in the group "Cintura", and that button reads "fechar" with `aria-expanded="true"` (AC 18)
Proof: `pnpm vitest run src/App.test.tsx -t "onde medir shows the cue"`

**C21** - With values typed in Peso (`62`) and Coxa D (`56`): opening Cintura's cue and then Coxa's leaves only Coxa's cue shown and Cintura's button at "onde medir"; tapping "fechar" hides Coxa's cue; Peso still reads `62` and Coxa D `56` throughout (AC 19)
Proof: `pnpm vitest run src/App.test.tsx -t "one cue at a time and typed values stay"`

**C22** - Table-driven over the 7 rows, each cue reads exactly: Busto "Na parte mais cheia do busto.", Cintura "Na parte mais fina, acima do umbigo.", Abdômen "Na linha do umbigo.", Quadril "Na parte mais larga do bumbum.", Braço "No meio do braço, relaxado.", Coxa "No meio da coxa, em pé.", Panturrilha "Na parte mais grossa da panturrilha.", each followed by " Fita reta, sem apertar." (AC 20)
Proof: `pnpm vitest run src/App.test.tsx -t "every cue line"`

**C23** - With the form open, date set to 2026-10-01 and Peso `62` typed, switching to Hoje and back to Medidas shows "Fechar", date `2026-10-01` and Peso `62` (AC 21)
Proof: `pnpm vitest run src/App.test.tsx -t "form survives a page switch"`

**C24** - At 360×740 with the form open: in each of Braço, Coxa, Panturrilha, D's box right edge ≤ E's box left edge and their tops differ by ≤ 1px; "Salvar medição"'s left and right edges are within 1px of the form's; with the page scrolled to its end, "Salvar medição"'s bottom ≤ the "Descanso" group's top (AC 22, AC 23)
Proof: `pnpm exec playwright test e2e/medidas.spec.ts -g "form arrangement at 360"`

**C25** - A field marked by AC 11 has a border colour `#e8304a` in the light scheme and `#ff4a64` in the dark scheme, and an unmarked field's border is transparent (AC 11)
Proof: `pnpm exec playwright test e2e/medidas.spec.ts -g "bad value border colour"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| measure fields (11) | C4, table-driven over all 11 names and units | - |
| row groups (8) | `Peso` C4, C12 · `Busto` C4, C20 · `Cintura` C4, C20 · `Abdômen` C4, C20 · `Quadril` C4, C20 · `Braço` C4, C13 · `Coxa` C4, C21 · `Panturrilha` C4, C20 | - |
| D/E rows for layout (3) | `Braço` C24 · `Coxa` C24 · `Panturrilha` C24 | - |
| cue lines (7) | C22, table-driven over all 7 | - |
| field value on load (3) | stored value on the day C6 · previous value as placeholder C5 · `–` with no earlier value C5 | - |
| accepted text (4 shapes) | comma decimal C10, C11 · dot decimal C10 · whole number C10 · spaces around C10 | - |
| rejected text (5 kinds) | not a number C10, C12 · two decimals C10, C12 · above range C10, C12 · below range C10, C12 · empty-means-blank C10, C9 | - |
| Peso range edges (4) | 29,9 C10 · 30 C10 · 200 C10 · 200,1 C10 | - |
| mark lifecycle (3) | not marked while typing C12 · marked on leaving C12, C13 · cleared on fixing C15 | - |
| Save enabled states (3) | all empty C9 · a bad value C14 · valid values C9 | - |
| save outcomes (3) | new date C16, C17 · existing date merges C18 · earlier date C19 | - |
| date inputs (3) | today default C3 · empty C8 · future C8 | - |
| form open states (3) | closed C1 · open C2 · closed after save C16 | - |
| colour schemes (2) | light C25 · dark C25 | - |
| mockup v6 form elements (12) | heading "Nova medição" C1 · Abrir/Fechar C2 · "Data" C3 · merge hint C6 · group labels C4 · units C4 · D/E side labels C4 · D/E side by side C24 · "onde medir"/"fechar" C20 · "Confira este valor" C12, C13 · full-width "Salvar medição" C24 · toast "Medição salva" C16 | - |

- Claims naming layout or colour: C24, C25 - each proof runs in Chromium at 360×740
- No other check claims more than the cases its proof exercises
- Out of reach, enumerated for the form: the card's padding and shadow, the field box's radius, padding and `--blush` background, the placeholder colour, the group-label letter spacing and size, the hint and message font size and colour, the "onde medir" chevron rotation, and the Save button's disabled opacity

## Test policy

The repo answers the level for screens: app behaviour through `App` in jsdom, applied CSS and
layout in Playwright (exercise-guides door 3). It leaves the coverage expectation open for text
parsing and form validation, so this row records it for this slice and stays in this file.

| Code | Required proofs | Coverage expectation |
| --- | --- | --- |
| Measure-text parsing (decides accept, reject, blank) | one at its own layer in `measures.test.ts` | each accepted shape, each rejected kind, the range edges of one measure |
| Form state in `MeasureForm` through `App` (decides marks, Save enabled, load per date, merge) | one through `App` in jsdom | each row of the load table, each mark state, each Save state, each save outcome |
| Form layout and the mark colour (CSS) | one in Playwright at 360×740 | each D/E row, both colour schemes where colour is claimed |

Evidence:

- measure-text parsing: one regex, one range check, one blank case -> 3 outcomes, decides
- `MeasureForm` (new): load per date (3 cases), mark on blur, Save enabled (3 states), cue open (1 of 7) -> decides
- closest analogue: `parseWeight` is proven table-driven in `src/domain/store.test.ts`; the "como faz" toggle is proven through `App` in `App.test.tsx`

Cost: 1 parser proof, 22 `App` proofs, 2 Playwright proofs across 3 test files.

## Swept

- validation: C10, C12, C13, C14, C8
- failure modes: existing - storage failing shows "Seus dados não estão sendo salvos neste navegador" on Medidas (Menu C8); a refused save cannot happen because Save is disabled (C9, C14)
- idempotency: C18 - saving onto a day again merges into the one entry
- authorization: n/a - no accounts, one user on one device
- concurrency: n/a - one tab, one thread; the save is a single synchronous record update
- data lifecycle: C18 - a merge never removes a stored measure; deleting is slice Histórico
- dependency failure: n/a - no external dependency; storage failure is the existing warning
- state transitions: C2, C16, C19, C23
- observability: n/a - personal app, no logging requirement

## Handoff

- S1 ≈ existing `App.tsx` 5.6 KB, `index.css` 12.7 KB, `App.test.tsx` 36 KB, `measures.ts` 1.6 KB, `measures.test.ts` 0.6 KB, `measurements.ts` 3.8 KB + new `MeasureForm.tsx` and `e2e/medidas.spec.ts` ≈ 10 KB → ~70 KB / 4 ≈ 18k, one domain - one builder, under the 150k budget
