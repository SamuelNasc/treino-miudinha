# Registrar medição verification

**Verdict**: PASS
**Profile**: ui
**Diff range**: d974129..b80a257
**Round**: 2 - scoped
**Verifier**: independent sub-agent (author != verifier) - fresh context, did not build the feature

Round 2 covers the fix commit `b80a257` (`test(medidas): prove the one-decimal rule and the form row arrangement`). It changes only `e2e/medidas.spec.ts`, `src/domain/measures.test.ts` and `checks.md`; no source file changed, so `git diff 745f3ed..b80a257 -- src` touches only `src/domain/measures.test.ts`. The two round-1 findings are closed:

1. **F1 surviving mutant, now killed.** New C26 (`src/domain/measures.test.ts:34-36`) rejects `62,90`, `74,00` and `62.90`. I re-injected the same `([.,]\d+)?` loosening and `a second decimal digit is rejected` failed.
2. **Uncovered mockup arrangement, now covered.** New C27 (`e2e/medidas.spec.ts:41-80`) checks five things against mockup v6:
   - the 5 single rows have the label beside a 120px field
   - "Data" sits beside its input
   - the heading sits beside the "Fechar" button
   - "onde medir", then the cue, then "Confira este valor" stack under the field, each starting at the row label's left edge
   - the message sits under the cue
   Two new faults against that surface were killed.

**The cue-box question.** The coordinator asked whether it is right for C27 to measure the cue's box rather than its text (`e2e/medidas.spec.ts:69-72`). It is. Mockup v6 puts the `.guide` box itself in the row grid (`grid-column: 1 / -1`, CSS line 213) and insets the text with `padding: 10px 12px`. So the mockup decides where the box starts, and the text sits 12px inside it by design. Measuring the text would hold the code to a position the mockup never draws. In round 1 I measured the box at HEAD: x=32, the same as the row label. Selecting the box through the button's `aria-controls` also ties the measurement to the element the button opens.

Small precision note: C27 asserts the cue box's left edge and its vertical order, but not its full-row width. A narrowed cue box would pass. It does not affect the verdict.

Proof runs at `b80a257` (HEAD), real tree, one invocation per runner, all 27 checks:

- `pnpm vitest run src/App.test.tsx src/domain/measures.test.ts --reporter=verbose -t "<the 23 round-1 names>|a second decimal digit is rejected"`: exit 0, 24 passed, 49 skipped. Each name is listed individually as `✓`, including `src/domain/measures.test.ts > measures > a second decimal digit is rejected`.
- `pnpm exec playwright test e2e/medidas.spec.ts -g "form arrangement at 360|bad value border colour|form rows at 360"`: exit 0, 4 passed (`form arrangement at 360`, `form rows at 360`, `bad value border colour - light`, `- dark`). The run reused the dev server on 5173 (pid 11452), and `/proc/11452/cwd` is `/home/samuel/projects/gym-exercices`.

C26 and C27 are new in `b80a257`. C1-C25 are new in `745f3ed`, as round 1 established.

## Binding sources

Re-run for the screens the fix touched (the form's arrangement). Everything else is carried from 745f3ed.

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| mockup v6 (local copy `artifact-1d35028d-...-91de.html`): `#formCard` markup 360-376, form CSS 190-215, `MEASURES` 638-649, `PAIRS` 653, `GUIDES` 656-664, `fmtN` 682, form JS 785-851 | yes - read at the lines named (round 1). Arrangement rows re-checked at b80a257 | none | - |
| `.design/body-measurements.md`, slice Registrar medição (130-143), Key decisions 3, 4, 6 (46-49) | yes | none | - |

Here is what mockup v6 decides for this form, set against the checks:

- **Controls and copy.** Heading "Nova medição" with a ghost button "Abrir"/"Fechar" and `aria-expanded` (365, 819, 824): C1, C2. Date field "Data" with `max` = today (369-370, 820): C3. Merge hint "Já tem medição nesse dia. O que você preencher atualiza ela." (372, 796): C6. "Salvar medição", disabled when empty or bad (374, 815): C9, C14. Toast "Medição salva" (841-842): C16.
- **Fields.** The 11 fields, each named "<label> em <unit>" with its unit beside it, in mockup order: Peso, the group label "Tronco", Busto, Cintura, Abdômen, Quadril, the group label "Braços e pernas", then the Braço, Coxa and Panturrilha pairs with side labels D and E (794-795, 638-649): C4. The labels and ranges in `src/domain/measures.ts:4-14` are the same as mockup 638-649.
- **Values on load.** The stored value written with a comma, the previous value as placeholder, otherwise "–" (782-784, 780, 682): C5, C6. Reload when the date changes (826): C7. A future date resets to today (826): C8. The plan also resets an empty date, a confirmed assumption.
- **Validation.** The rule is `^\d+(\.\d)?$` after a comma becomes a dot, plus the range (806). It is proven by C10, plus C26 for a second decimal digit that only the pattern rejects (added after round 1). One `.err` "Confira este valor" per D/E pair (793, 814): C13. The `.num.bad` border is `--berry` (205): C25. Marking on blur instead of on each input is a confirmed deviation (plan Assumptions), not a contradiction.
- **Save.** Merge with `Object.assign` keeps blank fields' stored values (841): C18. The form closes after a save (843): C16. Reopening starts on today (820, `date || TODAY`): C19.
- **"onde medir".** One button per tape row, none on Peso (`m.g` 792, `PAIRS` 793): C20. Toggles between "onde medir" and "fechar" with `aria-expanded`, one open at a time, typed values kept (788, 828-832): C20, C21. The cue text plus " Fita reta, sem apertar." (789, `GUIDES` 657-663): C22. All 7 strings in the test equal the mockup's. Text only, no drawing: a confirmed assumption, and the MeasureGuide slice adds the drawing.
- **Arrangement** (verified at b80a257). D left of E on one line (`.lr` 1fr 1fr, CSS 200): C24. Save full width (`.save` stretch, 211): C24. Single rows (label beside a 120px field), the date row, the header row, and the stack under each field ("onde medir", then the cue box, then the message, all starting at the label's left edge): C27. Round 1 measured the 745f3ed render, and no source changed since:
  - Peso/Busto/Cintura/Abdômen/Quadril label x=32, w=166; field x=208, w=120, on the same line
  - "Data" x=32; its input x=193
  - heading x=32, y=106; "Abrir" x=264, y=103
  - Busto's "onde medir" y=351, below its field (306+39)
  - the open Cintura cue y=454, below its button (429+19), w=296, full width

  C27 now asserts it.
- **Elements the code renders that the mockup does not draw:** none. Out of scope and not enumerated: editing mode ("Editar", "Apagar medição", "Medição atualizada"), the chart card, Histórico.

## Checks

All 27 proofs re-run at b80a257 and passing (see the header). Citations refreshed in the files the fix touched: `e2e/medidas.spec.ts` (C25 moved) and `src/domain/measures.test.ts` (unchanged for C10). `src/App.test.tsx` is untouched by the fix, so its citations are carried from 745f3ed.

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | starts closed: heading, "Abrir" `aria-expanded=false`, no Peso field, no placeholder text | vitest batch, `Nova medição starts closed` passed | `src/App.test.tsx:852` - `getByRole("heading", { name: "Nova medição" })).toBeInTheDocument()`; `:853` - "Abrir" `toHaveAttribute("aria-expanded", "false")`; `:854` - Peso `toBeNull()`; `:855` - placeholder text `toBeNull()` | PASS |
| C2 | Abrir shows Peso, "Fechar" true; Fechar hides it, back to "Abrir" false | vitest batch, `Abrir and Fechar toggle the form` passed | `src/App.test.tsx:861` - Peso `toBeVisible()`; `:863` - "Fechar" `aria-expanded` `"true"`; `:865` - Peso `toBeNull()`; `:866` - "Abrir" `aria-expanded` `"false"` | PASS |
| C3 | date value and max are 2026-10-08 | vitest batch, `form opens on today` passed | `src/App.test.tsx:872` - `expect(dateField().value).toBe("2026-10-08")`; `:873` - `expect(dateField().max).toBe("2026-10-08")` | PASS |
| C4 | 11 names in order, group labels placed, units per row, D/E pairs labelled | vitest batch, `fields in order with units` passed | `src/App.test.tsx:880` - `expect(boxes.map((b) => b.getAttribute("aria-label"))).toEqual(FIELDS)` (FIELDS literal at `:822-825`); `:884-885` - "Tronco" and "Braços e pernas" placed with `compareDocumentPosition`; `:889-890` - unit count `toHaveLength(inRow.length)` and the other unit 0; `:894-898` - 2 textboxes, names `${name} D/E em cm`, labels `/^D/`, `/^E/` | PASS |
| C5 | empty fields, placeholders 62,9 / 72,4 / 101,5 / "–"; 63,1 on 2026-09-30 | vitest batch, `placeholders show the previous value` passed | `src/App.test.tsx:910` - `.value` `toBe("")`; `:911` - `toHaveAttribute("placeholder", expected[name] ?? "–")` over all 11 (`:908`); `:914` - `toHaveAttribute("placeholder", "63,1")` | PASS |
| C6 | day's values filled with a comma, Cintura placeholder 72, hint shown, absent on another day | vitest batch, `a day with a measurement loads its values` passed | `src/App.test.tsx:923-924` - `toBe("62,4")`, `toBe("101,5")`; `:925-926` - Cintura `""`, placeholder `"72"`; `:928` - hint `toBeVisible()`; `:930` - hint `toBeNull()` on 2026-10-02 | PASS |
| C7 | changing date drops typed Cintura, loads Peso 62,9 | vitest batch, `changing the date reloads the fields` passed | `src/App.test.tsx:938` - Cintura `.value` `toBe("")`; `:939` - Peso `toBe("62,9")` | PASS |
| C8 | empty and 2026-10-09 reset to 2026-10-08 | vitest batch, `an empty or future date resets to today` passed | `src/App.test.tsx:947` - `expect(dateField().value, ...).toBe("2026-10-08")` over `["", "2026-10-09"]` (`:945`) | PASS |
| C9 | Save disabled empty, enabled with 62, disabled after clear | vitest batch, `save is disabled while every field is empty` passed | `src/App.test.tsx:954` - `toBeDisabled()`; `:956` - `toBeEnabled()`; `:958` - `toBeDisabled()` | PASS |
| C10 | parser table: accepted, blank, rejected, Peso range edges | vitest batch, `measure text` passed | `src/domain/measures.test.ts:23` - `expect(parseMeasure("peso", text), text).toBe(value)` over the 5 accepted; `:24` - `toBe("blank")`; `:26` - `toBe("bad")` over the 9 rejected; `:28-31` - `29,9`/`200,1` `"bad"`, `30`/`200` numbers. The round-1 precision gap is closed by C26 | PASS |
| C11 | `62,9` stored as number 62.9 | vitest batch, `comma decimal is stored as a number` passed | `src/App.test.tsx:966` - `expect(measurementsOf(stored())[0].values.peso).toBe(62.9)` | PASS |
| C12 | abc/680/6/62,95 not marked while typing, marked once after tab | vitest batch, `a bad value is marked on leaving the field` passed | `src/App.test.tsx:974-975` - `not.toHaveAttribute("aria-invalid", "true")`, message `toBeNull()`; `:977-978` - `toHaveAttribute("aria-invalid", "true")`, `getAllByText("Confira este valor")).toHaveLength(1)`; table at `:970` | PASS |
| C13 | Braço D 5 / E 500 both marked, one message | vitest batch, `one message per D/E row` passed | `src/App.test.tsx:990-991` - both `aria-invalid` `"true"`; `:992` - `toHaveLength(1)` | PASS |
| C14 | Peso 62 then Cintura 680 not yet left: Save disabled | vitest batch, `save is disabled while a value is bad` passed | `src/App.test.tsx:1001` - `expect(save()).toBeDisabled()` (no tab after `:1000`) | PASS |
| C15 | correcting D keeps row message; emptying E clears it; Peso 680 to 62 clears | vitest batch, `correcting a value clears its mark` passed | `src/App.test.tsx:1013-1014` - D not invalid, message `toHaveLength(1)`; `:1017-1018` - E not invalid, message `toBeNull()`; `:1026-1027` - Peso not invalid, message `toBeNull()` | PASS |
| C16 | new day stored exactly, status "Medição salva", form closed | vitest batch, `saving a new day stores it and closes the form` passed | `src/App.test.tsx:1036` - `expect(stored().measurements).toEqual([{ date: "2026-10-08", values: { peso: 62.9, cintura: 72 } }])`; `:1037` - `getByRole("status")).toHaveTextContent("Medição salva")`; `:1038-1039` - "Abrir" present, Peso `toBeNull()` | PASS |
| C17 | only Peso: values exactly `{ peso: 62.4 }` | vitest batch, `weight only is saved` passed | `src/App.test.tsx:1047` - `expect(measurementsOf(stored())[0].values).toEqual({ peso: 62.4 })` | PASS |
| C18 | merge: two entries, 10-01 unchanged, 10-08 `{ peso: 62, cintura: 72, quadril: 101.5, busto: 91 }` | vitest batch, `saving onto a day with a measurement merges` passed | `src/App.test.tsx:1061-1064` - `expect(stored().measurements).toEqual([{ date: "2026-10-01", values: { peso: 63 } }, { date: "2026-10-08", values: { peso: 62, cintura: 72, quadril: 101.5, busto: 91 } }])` (Cintura emptied at `:1058`) | PASS |
| C19 | reopen: today, Peso empty placeholder 61; then value 60 | vitest batch, `reopening after a save starts on today` passed | `src/App.test.tsx:1074` - `toBe("2026-10-08")`; `:1075-1076` - `""`, placeholder `"61"`; `:1081` - `toBe("60")` | PASS |
| C20 | 7 "onde medir", one per tape group, none in Peso, false; Cintura cue text, "fechar" true | vitest batch, `onde medir shows the cue` passed | `src/App.test.tsx:1088` - `toHaveLength(7)`; `:1091-1092` - 1 per row, `aria-expanded` `"false"`; `:1094` - Peso `toBeNull()`; `:1097` - `getByText("Na parte mais fina, acima do umbigo. Fita reta, sem apertar.")).toBeVisible()`; `:1098` - "fechar" `aria-expanded` `"true"`. Precision gap: "below the row" (AC 18) not asserted | PASS |
| C21 | one cue at a time, fechar hides, Peso 62 and Coxa D 56 kept | vitest batch, `one cue at a time and typed values stay` passed | `src/App.test.tsx:1108-1111` - Coxa cue visible, Cintura cue `toBeNull()`, Cintura button `"false"`, `/Fita reta/` `toHaveLength(1)`; `:1112-1113`, `:1116-1117` - `toBe("62")`, `toBe("56")`; `:1115` - `queryByText(/Fita reta/)).toBeNull()` | PASS |
| C22 | each of 7 cues exact plus " Fita reta, sem apertar." | vitest batch, `every cue line` passed | `src/App.test.tsx:1134` - `expect(row(name).getByText(`${cue} Fita reta, sem apertar.`), name).toBeVisible()` over the literal table `:1121-1129` (equal to mockup 657-663) | PASS |
| C23 | page switch keeps "Fechar", date 10-01, Peso 62 | vitest batch, `form survives a page switch` passed | `src/App.test.tsx:1145` - "Fechar" `toBeInTheDocument()`; `:1146` - `toBe("2026-10-01")`; `:1147` - `toBe("62")` | PASS |
| C24 | D left of E, tops within 1px (×3); Save edges within 1px of form; Save bottom ≤ "Descanso" top | playwright batch, `form arrangement at 360` passed | `e2e/medidas.spec.ts:25` - `expect(d.x + d.width, name).toBeLessThanOrEqual(e.x)`; `:26` - `Math.abs(d.y - e.y)` `toBeLessThanOrEqual(1)` over the 3 rows (`:22`); `:32-33` - Save left/right edges `toBeLessThanOrEqual(1)`; `:38` - `expect(after.y + after.height).toBeLessThanOrEqual(timer.y)` | PASS |
| C25 | marked border `#e8304a` light / `#ff4a64` dark, unmarked transparent | playwright batch, `bad value border colour - light` and `- dark` passed | `e2e/medidas.spec.ts:92` - `toHaveCSS("border-top-color", rgb(BERRY[scheme]))` (literals `:82`); `:93` - Busto `toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)")` | PASS |
| C26 | `62,90`, `74,00`, `62.90` rejected for Peso | vitest batch, `a second decimal digit is rejected` passed | `src/domain/measures.test.ts:35` - `for (const text of ["62,90", "74,00", "62.90"]) expect(parseMeasure("peso", text), text).toBe("bad")` | PASS |
| C27 | single rows: label beside a 120px field (×5); "Data" beside its input; heading beside "Fechar"; in Cintura: field, then "onde medir", then cue, then message, each starting at the label's left edge | playwright batch, `form rows at 360` passed | `e2e/medidas.spec.ts:50-52` - `beside`: `left.x + left.width` `toBeLessThanOrEqual(right.x)`, `mid(left)` between `right.y` and `right.y + right.height`, applied at `:58` per row; `:59` - `Math.abs(field.width - 120)` `toBeLessThanOrEqual(1)`; `:62` Data, `:63` header; `:74-76` - `field.y + field.height <= where.y`, `where.y + where.height <= cue.y`, `cue.y + cue.height <= err.y`; `:78` - `Math.abs(b.x - label.x)` `toBeLessThanOrEqual(1)` for each of the three; `:71` - cue box `toContainText("Fita reta, sem apertar.")` | PASS |

## Coverage

The rows the fix touched (rejected text, arrangement) were recomputed at b80a257. Every other row is carried from 745f3ed.

Recomputed. Authority per row: mockup v6 for what the form must satisfy (fields, rows, pairs, cues, load rules, arrangement), AC 10-11 and mockup 806 for the text rules, the plan's ACs for date and save behaviour. I took the code's members from `src/components/MeasureForm.tsx:10-19` (ROWS) and `src/domain/measures.ts:4-14,35-41`.

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| measure fields (11) | mockup 638-649 | all 11 names and units C4 (literal list `src/App.test.tsx:822-825`) | - |
| row groups (8) | mockup 794-795 | Peso, Busto, Cintura, Abdômen, Quadril, Braço, Coxa, Panturrilha C4 (loop `:886`) | - |
| D/E pairs (3) | mockup `PAIRS` 653 | Braço, Coxa, Panturrilha C4, C24 | - |
| cue lines (7) | mockup `GUIDES` 657-663 | all 7, exact text, C22 | - |
| field on load (3) | mockup `field()` 782-784 | stored value C6 · previous value C5 · "–" C5 | - |
| accepted text (4 shapes) | AC 10 | comma C10, C11 · dot C10 · whole C10 · spaces around C10 | - |
| rejected text (5 kinds) | AC 10-11, mockup 806 | not a number C10, C12 · above range C10, C12 · below range C10, C12 · blank C10, C9 · two decimals C10 (`62,95`), C12, C26 (`62,90`, `74,00`, `62.90`, which only the pattern rejects; R2-F1 killed) | - |
| Peso range edges (4) | `src/domain/measures.ts:4` | 29,9 · 30 · 200 · 200,1 C10 | - |
| mark lifecycle (3) | AC 11, 13 | not marked while typing C12 · marked on leave C12, C13 · cleared C15 | - |
| Save enabled states (3) | mockup 815, AC 9, 12 | all empty C9 · bad value C14 · valid C9 | - |
| save outcomes (3) | mockup 841-842, AC 14-17 | new date C16, C17 · existing date merges, blank keeps C18 · earlier date then reopen C19 | - |
| date inputs (3) | AC 3, 8, mockup 826 | today C3 · empty C8 · future C8 | - |
| form open states (4) | mockup 819-825, AC 1, 2, 21 | closed C1 · open C2 · closed after save C16 · kept across switch C23 | - |
| colour schemes (2) | mockup tokens 15, 33 | light C25 · dark C25 | - |
| mockup v6 form arrangement (7) | mockup CSS 190-213, `renderFields` 799-801 | D beside E C24 · Save full width C24 · Save above timer C24 · single rows, label beside a 120px field (×5) C27 (R2-F2, R2-F4 killed) · date row C27 · header row C27 · "onde medir", then cue, then message below the field C27 (R2-F3 killed) | - |

Swept for sets without a row: Relations, Surface and Landing are `None`. Plan Impact names the retired placeholder test, and C1 `:855` proves its absence. There are no routes or statuses.

## Test policy rows

The unmet row and the layout row (its file gained C27) were re-judged at b80a257. The form-state row is carried from 745f3ed.

| Row | Files it classifies | Required proof | Expectation met |
| --- | --- | --- | --- |
| Measure-text parsing | `src/domain/measures.ts` (`parseMeasure`) | own layer `src/domain/measures.test.ts:21,34` - C10, C26 | yes - each accepted shape and range edge (C10), and each rejected kind with an input that only that rule rejects (C26 for two decimals). R2-F1 killed |
| Form state through `App` | `src/components/MeasureForm.tsx`, `src/App.tsx` | through `App` in jsdom - C1-C9, C11-C23 | yes - each load row (C5, C6), each mark state (C12, C13, C15), each Save state (C9, C14), each save outcome (C16-C19). F2-F4 killed |
| Form layout and mark colour | `src/index.css`, `src/components/MeasureForm.tsx` (element order) | Playwright at 360×740 - C24, C25, C27 | yes - each D/E row (C24), each single row (C27), both schemes (C25) |

Swept rows that resolve to existing:

- failure modes: the storage warning sits outside both pages at `src/App.tsx:105`, before the Medidas section at `:145`, and Menu C8 (`src/App.test.tsx:770`) proves it shows on Medidas. The constraint is there.
- idempotency, data lifecycle: C18, which `saveMeasurement`'s merge backs (`src/domain/measurements.ts:46-50`). The constraint is there.

## Faults injected

### Round 2 (verified at b80a257)

Isolated in a fresh `git worktree add --detach <scratchpad>/wt2 HEAD` at b80a257, with `node_modules` symlinked. Playwright ran under a scratch config on port 5174 with `reuseExistingServer: false`. The worktree baseline was green first (`form rows at 360` passed). I restored each mutation with `git checkout -- src`. The real tree's `git status --porcelain` was recorded before (`M .specs/LESSONS.md`, `M .specs/lessons.json`, `?? .playwright-mcp/`, `?? .specs/features/registrar-medicao/verification.md`) and was identical after `git worktree remove --force`. Port 5174 was free afterwards.

| Mutation | Location | Killed |
| --- | --- | --- |
| R2-F1: round-1 F1 re-injected: regex `/^\d+([.,]\d)?$/` -> `/^\d+([.,]\d+)?$/`. At 745f3ed it passed every proof; this was the round-1 finding | `src/domain/measures.ts:38` | yes - C26 `a second decimal digit is rejected` failed (C10 still passes, as expected) |
| R2-F2: `.row` `grid-template-columns: 1fr auto` -> `1fr` (single-row label stacked above the field) | `src/index.css:78` | yes - C27 `form rows at 360` failed at `e2e/medidas.spec.ts:58` (`beside`, "Peso") |
| R2-F3: "Confira este valor" rendered before the cue box (cue moved after the message) | `src/components/MeasureForm.tsx:122-131` | yes - C27 failed at `e2e/medidas.spec.ts:76` (`cue.y + cue.height <= err.y`) |
| R2-F4: single-row label forced to its own grid line (`.single > label:first-child { grid-column: 1 / -1 }`), so the field keeps its 120px width but sits under the label | `src/index.css` after `:79` | yes - C27 failed at `e2e/medidas.spec.ts:58` (`beside`, "Peso"), so the label-beside assertion catches this without help from the width assertion |

### Round 1 (carried from 745f3ed - the fix touched no source, so these mutants and proofs are unchanged)

| Mutation | Location | Killed |
| --- | --- | --- |
| F2: placeholder takes the earliest earlier value (`before[0]`) instead of the latest | `src/components/MeasureForm.tsx:31` | yes - C5 `placeholders show the previous value` failed |
| F3: `canSave` drops the "no bad value" condition | `src/components/MeasureForm.tsx:68` | yes - C14 `save is disabled while a value is bad` failed |
| F4: a field is marked as soon as its text is bad, not on leaving it | `src/components/MeasureForm.tsx:84` | yes - C12 `a bad value is marked on leaving the field` failed |
| F5: `.lr` `grid-template-columns: 1fr 1fr` -> `1fr` (D above E) | `src/index.css:84` | yes - C24 `form arrangement at 360` failed at `e2e/medidas.spec.ts:25` ("Braço") |

Round 1's F1 was not caught at 745f3ed. It is re-injected above as R2-F1 and is now killed. Over both rounds: 9 faults injected, all 9 caught by the final proofs.

## Findings

Round 1's two findings are closed (header). Remaining notes, none of which affects the verdict:

1. **Precision note (C27).** The cue box's left edge and its vertical order are asserted, but its full-row width (mockup `.guide` `grid-column: 1 / -1`) is not. A narrowed cue box would pass.
2. **`previous()` relies on order** (`src/components/MeasureForm.tsx:30-31`). It takes the last earlier entry and assumes `measurements` is sorted by date. Every writer sorts (`src/domain/measurements.ts:49,75`), so this holds today.
3. **The empty-date reset** (AC 8) differs from the mockup's render-only fallback (mockup 782, 837). The plan's Assumptions record this as confirmed, so it is not a contradiction.
4. **Lessons.** Round 1 recorded L-006 (`surviving_mutant`) and L-007 (`spec_precision_gap`). Round 2 found no new failure and records nothing.

## Gate

Verified at b80a257: `pnpm test` - 121 passed, 0 failed (10 files). `pnpm test:e2e` - 23 passed, 0 failed.

Step 5 (walk the flow with the user) was skipped: no user was present.
