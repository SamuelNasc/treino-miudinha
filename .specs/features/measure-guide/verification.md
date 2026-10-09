# MeasureGuide verification

**Verdict**: PASS
**Profile**: ui
**Diff range**: d89cb29..e780c6e (HEAD)
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier). Fresh context. It did not build the feature or write its checks, and it changed no file except this report

## Summary

- All 14 checks (C1-C14) are proven at `e780c6e`, each with a located assertion. Three proof batches ran on the real tree. Vitest ran 11 named tests in one invocation and all passed. Playwright ran 5 tests in one invocation (4 named proofs, with `guide colours` run for light and dark) and all passed. `pnpm tsc -b` exited 0.
- Mockup v6 (the saved copy of the full HTML) was opened and compared line by line. The checks contradict it nowhere, and every element and arrangement it decides for the "onde medir" box has a check.
- 5 behaviour faults were injected in a scratch worktree, and all 5 were killed. The real tree's `git status --porcelain` matched the baseline (`?? .playwright-mcp/`) afterwards.
- One non-blocking note: the v6 shorthand `gap: 12px` also sets `row-gap: 12px`. That value is neither asserted nor named out of reach. The box is a single-row grid, so `row-gap` cannot change the render, and any mutant of it is equivalent. Under L-008 this is a precision note for the checks, not a surviving mutant.

## Binding sources

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| mockup v6 `--tape` token (saved copy l.25 light; l.34 and l.41 dark) | yes - saved artifact HTML | none | - |
| mockup v6 `GUIDES` (l.656-664): 7 cues, 7 band ends | yes | none - C2 cues and the C4 table equal v6 values, with `rx = (x2-x1)/2 + 3`, `cx = x1 + rx`, `ry 4` (l.666, l.672) | - |
| mockup v6 `figure()` (l.665-673): `viewBox`, 4 paths, head, bun, ellipse, paint order | yes | none - the C3 path `d` strings are byte-equal to l.668-671. The head and bun use classes where v6 has inline `fill` (recorded in checks Handoff), and C9 asserts the computed fills | - |
| mockup v6 `where()` (l.793-797): button, then the `.guide` box holding the svg and then the `p` with "<cue> Fita reta, sem apertar." | yes | none | - |
| mockup v6 `where()` accessible name `Onde medir: ${g}` | yes | an approved deviation (plan Assumptions row 2, checks l.104): lower-case row name with accents. Not a contradiction | - |
| mockup v6 CSS `.guide`, `.guide svg`, `.guide p` (l.212-214) | yes | none | - |
| mockup v6 CSS `.body-fill`, `.body-line`, `.tape` (l.215-217) | yes | none | - |

Arrangement enumeration (Nova medição, open "onde medir" box). The box sits inside its row: C1 at `src/App.test.tsx:1179`. It spans the row's full width: C11 at `e2e/measure-guide.spec.ts:87-88`. It is a two-column grid with the drawing first and the cue second: C11 at `e2e/measure-guide.spec.ts:73-74`, `:98`, and C1 at `src/App.test.tsx:1184`. It holds exactly one image: C1 at `src/App.test.tsx:1181`. The svg's children are 7, in order: C3 at `src/App.test.tsx:1197`. Only one box is open at a time: C6 at `src/App.test.tsx:1227` and C8 at `src/App.test.tsx:1111`. Peso has no box: C6 at `src/App.test.tsx:1223`. The code renders nothing in the box that v6 does not draw.

## Checks

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | 7 rows: one img in the row's box, then "<cue> Fita reta, sem apertar." | `pnpm vitest run ... -t "onde medir shows the drawing"` passed | `src/App.test.tsx:1181` - `expect(imgs, name).toHaveLength(1)`; `:1182` - `getByText(\`${cue} Fita reta, sem apertar.\`)`; `:1184` - `compareDocumentPosition(text) & DOCUMENT_POSITION_FOLLOWING` | PASS |
| C2 | 7 cue lines exact, at own layer and through App | `-t "cue lines"` and `-t "every cue line"` passed | `src/domain/measureGuides.test.ts:6-12` - `expect(MEASURE_GUIDES.busto.cue).toBe("Na parte mais cheia do busto.")` and 6 more; `src/App.test.tsx:1134` - `row(name).getByText(\`${cue} Fita reta, sem apertar.\`)` over 7 CUES (l.1121-1129) | PASS |
| C3 | svg `0 0 120 200`, 4 paths with class and d, head, bun, ellipse.tape last | `-t "drawing is the v6 figure"` passed | `src/App.test.tsx:1195` - `toBe("0 0 120 200")`; `:1197` - `toEqual(["path","path","path","path","circle","circle","ellipse"])`; `:1199-1200` - class and `d` against FIGURE; `:1203` - `toEqual([60, 24, 12])`; `:1204` - `toEqual([60, 9, 6])`; `:1205` - `toBe("tape")` | PASS |
| C4 | ellipse cx, cy, rx, ry per row as in the table | `-t "tape band matches v6"` passed | `src/App.test.tsx:1215` - `[cx,cy,rx,ry].map(Number) ... toEqual(ellipse)`, with the table at `:1151-1158` equal to checks l.22-28 | PASS |
| C5 | 10 keys, no peso, D/E share one object, 7 distinct bands | `-t "every tape measure has a guide"` passed | `src/domain/measureGuides.test.ts:16` - keys `toEqual` the 10 ids; `:19` - `"peso" in ... toBe(false)`; `:20-22` - `toBe` identity; `:25` - 7 distinct bands | PASS |
| C6 | Peso has no button; at most one "Onde medir" img; none in Peso | `-t "peso has no guide"` passed | `src/App.test.tsx:1223` - Peso `queryByRole("button", {name:"onde medir"})).toBeNull()`; `:1227` - `toHaveLength(1)`; `:1228` - `row("Peso").queryByRole("img")).toBeNull()` | PASS |
| C7 | role img, exact names, no text in svg, cue a `p` outside | `-t "drawing names"` passed | `src/App.test.tsx:1238` - `toHaveAccessibleName(\`Onde medir: ${lower}\`)`, with lower = "abdômen" and "braço" at `:1151-1158`; `:1239` - `textContent toBe("")`; `:1241` - `toBe("p")`; `:1242` - `svg.contains(p) toBe(false)` | PASS |
| C8 | toggle unchanged: 7 collapsed, one at a time, fechar closes, values stay | `-t "onde medir shows the cue"` and `-t "one cue at a time and typed values stay"` passed | `src/App.test.tsx:1088` - `toHaveLength(7)`; `:1092` - `aria-expanded "false"`; `:1111` - one "Fita reta" visible; `:1115` - after fechar `queryByText(/Fita reta/)).toBeNull()`; `:1116-1117` - values `"62"`, `"56"` | PASS |
| C9 | light/dark: --tape, pad, fig, cherry, tape stroke, blush | `pnpm playwright test ... -g "guide colours"` passed (light and dark) | `e2e/measure-guide.spec.ts:41` - `--tape` `toBe(TAPE[scheme])`; `:42` - path0 fill `PAD`; `:43` - lines stroke `FIG`; `:44` - head fill `FIG`; `:45` - bun fill `CHERRY`; `:46` - ellipse stroke `TAPE`; `:47` - box background `BLUSH`; hex values at `:13-17` equal checks C9 | PASS |
| C10 | line fill none, 2.5px, round, round; tape none, 3.5px, `5px, 3px`, round | `-g "drawing strokes"` passed | `e2e/measure-guide.spec.ts:56-59` - `"none"`, `"2.5px"`, `"round"`, `"round"`; `:62-65` - `"none"`, `"3.5px"`, `"5px, 3px"`, `"round"` | PASS |
| C11 | 7 rows at 360: grid, 96px column, gap 12, center, radii 18, padding 10/12, full row width, svg 96x160 block, p offset, centred, margin 0, 14px/19.6px | `-g "guide box arrangement at 360"` passed | `e2e/measure-guide.spec.ts:73-76` - `"grid"`, `"96px"`, `"12px"`, `"center"`; `:78` - `"18px"`; `:80-83` - padding; `:87-88` - row width ±1; `:92-94` - 96, 160, `"block"`; `:98` - `t.x >= d.x + 96 + 12 - 1`; `:99` - centres ±1; `:100` - `"0px"`; `:101-102` - `"14px"`, `"19.6px"` | PASS |
| C12 | 7 rows at 360: scrollWidth <= clientWidth | `-g "no horizontal scroll with a guide open"` passed | `e2e/measure-guide.spec.ts:111` - `expect(scroll, name).toBeLessThanOrEqual(client)` over ROWS (`:18`, 7 rows) | PASS |
| C13 | stored record byte-identical after opening and closing all 7 guides | `-t "opening guides stores nothing"` passed | `src/App.test.tsx:1254` - `expect(localStorage.getItem(STORAGE_KEY)).toBe(before)`, with one Measurement seeded at `:1247` | PASS |
| C14 | `MEASURE_GUIDES` typed `Record<Exclude<MeasureId,"peso">, MeasureGuide>`, tsc green | `pnpm tsc -b` exit 0 | `src/domain/measureGuides.ts:18` - `export const MEASURE_GUIDES: Record<Exclude<MeasureId, "peso">, MeasureGuide> = {` | PASS |

Every named test was shown to exist and to have run. Each appeared as its own `✓` line in the Vitest verbose output and the Playwright list output, so no proof passed on an empty filter. All new proofs are inside the diff range. The two C8 proofs are earlier tests that the diff leaves untouched, and they still prove the unchanged behaviour that C8 claims.

## Coverage

Recomputed. Each set's members were taken from the source that holds authority over it: mockup v6 for rows, figure, rules and colours, and `src/domain/measures.ts` for measure ids.

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| tape rows (7) | v6 `GUIDES` keys l.656-664 | the 7 rows of TAPE `src/App.test.tsx:1151-1158` drive C1, C3, C4, C7 and C13; the 7 ROWS `e2e/measure-guide.spec.ts:18` drive C11 and C12 | - |
| tape measure ids (10) | `src/domain/measures.ts:4-14` (11 ids less peso) | C5 `measureGuides.test.ts:16`, all 10 | - |
| D/E pairs (3) | `measures.ts:9-14` | C5 `measureGuides.test.ts:20-22` | - |
| cue lines (7) | v6 `GUIDES` | C2 `measureGuides.test.ts:6-12`, `App.test.tsx:1121-1134` | - |
| rows without a guide (1) | v6 `renderFields` l.799 (peso has no `g`) | C6 `App.test.tsx:1223`, `:1228` | - |
| v6 figure elements (7) | v6 `figure()` l.667-672 | C3 `App.test.tsx:1197-1205`; band C4 `:1215` | - |
| colour schemes (2) | v6 l.25, l.30-42 | C9 light and dark, both run | - |
| v6 CSS rules (6) and their declarations | v6 l.212-217 | `.guide`: grid-column (C11 full width), display, columns, gap (column), align, background, radius, padding - C9, C11. `.guide svg`: width, display - C11; `height:auto` named out of reach (checks l.106), observed as 160px. `.guide p`: margin, font-size, line-height - C11. `.body-fill` fill - C9. `.body-line` 5 declarations - C9, C10. `.tape` 5 declarations - C9, C10 | - |
| v6 inline fills (2) | v6 l.672 | head and bun - C9 `e2e/measure-guide.spec.ts:44-45` | - |
| one-way doors (1) | plan Landing | door 1 - C5, C14 | - |

Note (non-blocking): `gap: 12px` also sets `row-gap`. Only `column-gap` is asserted (`e2e/measure-guide.spec.ts:75`). The box always has one grid row, so `row-gap` has no rendered effect, and a mutant of it is equivalent. This is a precision note for the checks and is not counted as an unproven member.

## Test policy rows

| Row | Files it classifies | Required proof | Expectation met |
| --- | --- | --- | --- |
| `MEASURE_GUIDES` static table | `src/domain/measureGuides.ts` | own layer: C2, C5 in `measureGuides.test.ts` | yes - every key (l.16) and every cue (l.6-12) |
| drawing component | `src/components/MeasureDrawing.tsx` | through App: C3, C4 | yes - every row's geometry, 7 of 7 |
| layout, stroke, colour | `src/index.css` (l.21, l.45, l.104-111) | Playwright at 360x740: C9-C12 | yes - both schemes for colour (C9) |

## Faults injected

Run in a scratch `git worktree` at HEAD with `node_modules` symlinked, and discarded afterwards. The real tree's porcelain before and after was `?? .playwright-mcp/`.

| Mutation | Location | Killed |
| --- | --- | --- |
| busto cue "do busto." -> "do peito." | `src/domain/measureGuides.ts:19` | yes - `cue lines`, `every cue line`, `onde medir shows the drawing` failed |
| ellipse `rx={rx + 3}` -> `rx={rx + 2}` | `src/components/MeasureDrawing.tsx:15` | yes - `tape band matches v6` failed |
| accessible name `name.toLowerCase()` -> `name` | `src/components/MeasureForm.tsx:171` | yes - `drawing names` failed |
| dark `--tape: #6cc677` -> `#3f9a4a` | `src/index.css:45` | yes - `guide colours - dark` failed, light passed |
| `.guide` padding `10px 12px` -> `10px 14px` | `src/index.css:104` | yes - `guide box arrangement at 360` failed (expected 12px, got 14px) |

The cap of five was reached. Not injected: C3, C5, C6, C8, C10, C12 and C13. Their assertions are each exact-value (`toEqual`, `toBe`, `toBeNull`, `toBeLessThanOrEqual`) and were read at the cited lines.

## Gate

- `pnpm vitest run src/App.test.tsx src/domain/measureGuides.test.ts -t "<11 names>"` - 11 passed, 0 failed
- `pnpm playwright test e2e/measure-guide.spec.ts -g "<4 names>"` - 5 passed, 0 failed
- `pnpm tsc -b` - exit 0
