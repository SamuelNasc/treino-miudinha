# Gráfico verification

**Verdict**: FAIL
**Profile**: ui
**Diff range**: 2974484..5bd6cf7 (HEAD). Commits fddbb94 (plan and checks), bec45c3 (feature), 5bd6cf7 (tests)
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier). Fresh context. It did not build the feature or write its checks, and it changed no file except this report

## Summary

The feature works and the whole suite is green at `5bd6cf7`, but the checks do not hold up as written. Five findings fail it.

- **35 of 36 checks are proven** with a located assertion. All 27 Vitest names and all 20 Playwright tests behind the 36 proofs ran and passed in two batched invocations. The full gate is green too: Vitest 210, Playwright 72.
- **C24 fails.** It claims "Each time the tip lies horizontally inside the card", for four pointer positions. The proof asserts it for two of them. Measured at HEAD, the tip for the `PAIR` fixture at the right edge spans x 210.5 to 345.5, but the card spans x 16 to 344. So the claim is false for a case its proof skips.
- **Two coverage sets have unproven members.** Neither is caught by any proof:
  - Pointer down and pointer move are never proven apart. Removing either handler leaves every proof green (Q3, Q4), because the test helper always sends a move and then a down. A tap on a phone sends only the down, so the touch path is unproven.
  - Two of the five tick step candidates are never pinned. Removing the ×1 or the ×5 candidate leaves C13 green (Q1, Q2).
- **Ten values mockup v6 decides for this card are neither asserted nor named out of reach.** `checks.md:179` says "Nothing else in the rules above is out of reach". The values:
  - the card's `box-shadow`, and its `display: flex; flex-direction: column` (P1, P6)
  - the crosshair's `y1`/`y2`
  - each hover dot's radius and per-side fill
  - the legend line's geometry and its svg `viewBox`
  - the transparent hit `rect`

  Probes on five of them all survive.
- **C17 / AC 16 spells the chart's accessible name differently from v6.** The app gives "Gráfico de abdômen" and "Gráfico de braço". v6 l.756 renders `Gráfico de ${chosen}`, which gives "Gráfico de abdomen" and "Gráfico de braco". The change is an improvement, but unlike the three other deviations it is not recorded as approved.
- **Faults.** 5 behaviour faults were injected, one per assertion surface, and all 5 were killed. A further 11 coverage and precision probes were run (Q1-Q4, P1-P7), and all 11 survived. They are the evidence for the findings above.

Lesson distillation (step 7) is left to the orchestrator.

## Binding sources

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| `.design/body-measurements.md`: `### Gráfico` (l.194-207), Key decision 3 (l.46) and Key decision 6 (l.49) | yes - read this round | none. Each state row has a check: no Measurement (C2), one entry (C8, C23), two or more (C9, C11), a D/E pair without colour (C19), a missing measure (C12), dark mode (C20, C32, C35). KD 3 (one point per date) holds because `seriesOf` is per Measurement (C12). KD 6 (pt-BR comma) is C34 | - |
| Mockup v6, https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa, version `1791496183-91de`. Opened with the Artifact tool (`read`); the local copy `artifact-1d35028d-1791496183-91de.html` (918 lines) was read in full. Rules: `.card` l.86, `.chips` l.162-163, `.chip` l.164-165, `.chart-card` l.167, `.headline` … `.first b` l.168-188, `.sr-title` l.243, tokens l.23-24/34/41. Markup: `#chartCard` l.356-360. Script: `CHIPS` l.652, `PAIRS` l.653, `series` l.719, `niceTicks` l.720-726, `renderChart` l.727-783 | yes - read this round | C17 / AC 16: the accessible name is "Gráfico de " plus the chip label in lower case ("Gráfico de abdômen", "Gráfico de braço"). v6 l.756 uses the chip key (`aria-label="Gráfico de ${chosen}"`), which gives "Gráfico de abdomen" and "Gráfico de braco". It is not among the approved deviations at `checks.md:177`, and the plan has no Assumption row for it (`plan.md:148-154`) | The card's `box-shadow: var(--shadow)` and `display: flex; flex-direction: column` (l.86). The crosshair's `y1="12"` / `y2="156"` (l.765). Each hover dot's `r="5"` and per-side `fill` (l.774). The legend line's `x1="1" y1="4" x2="21" y2="4"` and its svg's `viewBox="0 0 22 8"` (l.746-747). The transparent hit `rect` (l.766). See "Decided values" |

### Arrangement and copy, enumerated per state

The card is v6's `#chartCard` (l.356-360). It holds a heading, the chip row, and one body block (`#chartBody`). The body holds the headline, then the legend (pair only), then the plot, with the tip overlaid on the plot.

The app matches that composition: `Evolution.tsx:44-59` wraps `ChartBody` in a single `div`.

| State | What v6 decides | Check |
| --- | --- | --- |
| Card placement | First section on Medidas, above Nova medição, Histórico and Lembrete (l.356, l.362, l.378, l.383) | C1, C31 |
| Card absent | Hidden when there are no entries (l.732) | C2 |
| Chip row | 8 chips in `CHIPS` order, in a group labelled "Escolher medida", on one scrolling line | C3, C29 |
| Chosen chip | "Cintura" at start; `aria-pressed` | C4, C5, C6 |
| Region order inside the card | heading, chips, headline, legend (pair only), plot; all left-aligned | C31 (`grafico.spec.ts:186-193`, `:207-214`) |
| Headline, single measure | value and unit in one block, with the change under it | C31 (`:194-198`), C9 |
| Headline, pair | D then E. They wrap at 360px with E under D | C18, C31 (`:220-224`) |
| No gap inside the body | headline, legend and plot touch | C31 (`:216-218`) |
| Legend | "Direita" with a solid line, "Esquerda" with a dashed line | C19 |
| Plot | grid, y and x labels, lines, last dot, D/E end labels | C11, C14, C16, C19 |
| Tip | date in bold (`<b>`), then values joined by " · " | C24 (`:79-80`) |
| One-entry panel | full content width, below the chips, centred | C31 (`:227-236`), C8, C23 |
| "Ainda sem" panel | the `.first` panel. The copy is an approved deviation | C7, C32 (`:348-349`) |
| "sem medida nesse dia" (l.776) | Cannot be reached in v6: `dates` comes from the drawn series, so every date has a hit. The app has no such branch either | n/a |

## Checks

Proof runs, both at `5bd6cf7` on the real tree:

- **Vitest (V).** `pnpm vitest run src/App.test.tsx src/domain/chart.test.ts -t "<all 27 names joined by |>" --reporter=verbose` exited 0. It ran 27 tests and skipped 113, and each of the 27 names appears individually in the output as ✓.
- **Playwright (P).** `pnpm exec playwright test e2e/grafico.spec.ts -g "pair colours|touching the chart shows the date|leaving the chart hides the tip|the chart lets the page scroll|touching the chart stores nothing|chips on one scrolling line|plot fills the card|card arrangement at 360|mockup v6 chart declarations|series tokens"` exited 0 with 20 passed. Each test is listed by name in the output.

Every proof resolves to a test added in `5bd6cf7`.

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | headings in order, "Sua evolução" first | V ✓ "sua evolucao comes first on medidas" | `src/App.test.tsx:1935` - `expect(order).toEqual([...order].sort((a, b) => a - b))`. Also `:1936` - `expect(order[0]).toBe(0)` | PASS |
| C2 | no Measurement, no card; deleting the last one removes it | V ✓ "no measurement no evolucao" | `src/App.test.tsx:1942-1945` - the heading, the group and the chart are each `toBeNull()`, and "Nenhuma medição ainda." is in the document. Also `:1955` - the heading is null after the delete | PASS |
| C3 | 8 chips in order | V ✓ "eight chips in order" | `src/App.test.tsx:1960` - `expect(chips().map((b) => b.textContent)).toEqual(CHIP_NAMES)`. The list is at `:1887` | PASS |
| C4 | Cintura pressed first | V ✓ "cintura is chosen first" | `src/App.test.tsx:1965` - `toHaveAttribute("aria-pressed", b.textContent === "Cintura" ? "true" : "false")` | PASS |
| C5 | a tap chooses the measure | V ✓ "a chip tap chooses the measure" | `src/App.test.tsx:1971-1973` - Peso pressed and the others not; `{ value: "62,6", unit: "kg" }`; "Gráfico de peso". Also `:1975` - Quadril | PASS |
| C6 | the chip survives a page switch | V ✓ "the chosen chip survives a page switch" | `src/App.test.tsx:1983-1984` - Peso has `aria-pressed` `"true"` and the chart is "Gráfico de peso" | PASS |
| C7 | "Ainda sem medição de …" | V ✓ "a measure with no entry says so" | `src/App.test.tsx:1998-1999` - `evo().getByText(text)` and `expect(chart(), name).toBeNull()` over the 5 rows at `:1990-1994`. Also `:2002` - nothing matches `/^Ainda sem/` on Peso | PASS |
| C8 | one entry shows primeira medição | V ✓ "one entry shows primeira medicao" | `src/App.test.tsx:2009` - `toBe("71,6 cm" + FIRST_TEXT("08/10"))`. Also `:2013` - `"62,9 kg" + FIRST_TEXT("01/10")`, and `:2010`, `:2014` - chart null | PASS |
| C9 | latest value and change | V ✓ "latest value and change since the first" | `src/App.test.tsx:2020` - `toEqual({ letter: null, value: "71,6", unit: "cm", delta: "−2,4 cm desde 27/08" })`. Also `:2021` - `0x2212`, and `:2023` - "−1,6 kg desde 27/08" | PASS |
| C10 | the change rule | V ✓ "change since the first" | `src/domain/chart.test.ts:39` - `expect(change(first, last)).toBe(text)` over the 7 rows at `:30-36`. Also `:40` - `not.toContain("-")`, and `:42` - `charCodeAt(0)).toBe(0x2212)` | PASS |
| C11 | one line at v6's coordinates | V ✓ "one line through the measured dates" | `src/App.test.tsx:2029` - `near(coords(lines()[0]), [[34, 12], [218, 88.8], [310, 127.2]])`. Also `:2032` - Peso `[[34, 50.4], [264, 112.8], [310, 127.2]]`, and `:2028`/`:2031` - exactly one line | PASS |
| C12 | the series rule; a date without the measure | V ✓ "series of a measure", ✓ "a date without the measure has no point" | `src/domain/chart.test.ts:14-25` - `toEqual` against the exact cintura, reversed, peso and busto `[]` series. Also `src/App.test.tsx:2043-2044` - one line with 2 points | PASS |
| C13 | the tick rule | V ✓ "y ticks" | `src/domain/chart.test.ts:58` - `expect(ticks).toEqual(expected)` over `:47-52`. Also `:59-65` - 3 to 5 ticks, equal steps within 1e-9, the span covered, and the flat range strictly inside. Coverage gap: the step candidates ×1 and ×5 are never pinned (see Coverage, Q1, Q2) | PASS |
| C14 | x labels; axis texts through `App` | V ✓ "x labels", ✓ "axis labels" | `src/domain/chart.test.ts:70-73` - the 3, 4, 5 and 2 date cases. `src/App.test.tsx:2049-2053` - the y texts "71".."74" at y 160/112/64/16, filtered on `text-anchor` `end` and x `28` at `:1917`; the x texts with anchors `["start","middle","end"]` at x 34/218/310, filtered on y `174` at `:1918`. `:2058-2059` - the `PAIR` texts | PASS |
| C15 | year shown when it differs | V ✓ "chart dates show the year only when it differs" | `src/App.test.tsx:2065` - `"−1 cm desde 20/12/26"`. Also `:2066` - `["20/12/26", "03/01"]`, and `:2070` - `"74 cm" + FIRST_TEXT("20/12/26")` | PASS |
| C16 | the last dot; grid lines | V ✓ "latest point has a dot" | `src/App.test.tsx:2075-2079` - one dot, `r` `"5"`, at (310, 127.2). Also `:2081-2084` - 4 grid lines, each from `x1` "34" to `x2` "310" | PASS |
| C17 | the accessible name | V ✓ "chart accessible name" | `src/App.test.tsx:2098-2102` - the img named "Gráfico de cintura", "Gráfico de abdômen" and "Gráfico de braço". This proves the check, but the check itself contradicts v6 l.756 (see Binding sources) | PASS |
| C18 | the D and E headlines | V ✓ "a pair shows d and e headlines" | `src/App.test.tsx:2108-2111` - `toEqual([{ letter: "D", value: "28,5", unit: "cm", delta: "−0,5 cm desde 24/09" }, { letter: "E", … "−0,3 cm desde 24/09" }])` | PASS |
| C19 | solid D, dashed E, end labels, legend | V ✓ "a pair draws solid d and dashed e" | `src/App.test.tsx:2118-2139`: the stroke `var(--s-d)` with no dash; `var(--s-e)` with `"6 4"`; the points; the dot fills; the "D"/"E" texts at (319, 112) and (319, 150.4); the legend "Direita"/"Esquerda" with `stroke-width` `2.5` and dash `4 3`. `:2143-2144` - no legend and no end label on Cintura | PASS |
| C20 | pair colours in both schemes | P ✓ "pair colours - light", ✓ "- dark" | `e2e/grafico.spec.ts:245-252` - `expect(await css(d, "stroke")).toBe(rgb(S_D[scheme]))`, and the same for E, the dots and the legend lines | PASS |
| C21 | a side with one entry | V ✓ "a side with one entry shows primeira medicao" | `src/App.test.tsx:2151-2158` - D's delta; E `{ letter: "E", value: "28,3", unit: "cm", delta: "primeira medição" }`; one line, D's; one E dot at x 310. Also `:2168-2170` - a chart with 0 lines and the dots `["var(--s-d)","var(--s-e)"]` | PASS |
| C22 | a side with no entry | V ✓ "a side with no entry is left out" | `src/App.test.tsx:2181-2186` - the letters `["D"]`; one line; the legend `["Direita"]`; the end labels `["D"]`; `not.toMatch(/NaN\|undefined/)` | PASS |
| C23 | a pair on one date | V ✓ "a pair on one date shows primeira medicao" | `src/App.test.tsx:2193-2195` - `["D 29 cm", "E 28,6 cm"]`, the full text, and chart null | PASS |
| C24 | the tip, crosshair and hover dots, and the tip inside the card each time | P ✓ "touching the chart shows the date", "… - pair", "… - pair with one side missing" | `e2e/grafico.spec.ts:79-87` (`checkTip`) - the text, the `<b>` date, visibility, `x1`, `3px, 3px`, the dot count, and the tip inside the card. `:92-94` - the hover dot at (310, 127.2). `:105-106` and `:113-114` - the pair texts and dot counts. **Gap.** "Each time the tip lies horizontally inside the card" is asserted only for `CIN3` (via `checkTip`). The pair and one-side cases (`:101-115`) never call `checkTip`. Measured at HEAD in the scratch tree with the fonts loaded: the `PAIR` tip at the right edge spans x 210.5-345.5, and the card spans 16-344. The claim is false for that member | FAIL |
| C25 | leaving hides the tip, the line and the dots | P ✓ "leaving the chart hides the tip" | `e2e/grafico.spec.ts:122-124` - `toBeHidden()`, `visibility` `"hidden"`, and `toHaveCount(0)` | PASS |
| C26 | `touch-action: pan-y` | P ✓ "the chart lets the page scroll" | `e2e/grafico.spec.ts:129` - `expect(await css(chart(page), "touch-action")).toBe("pan-y")` | PASS |
| C27 | follows saves, edits and deletes | V ✓ "the chart follows saves edits and deletes" | `src/App.test.tsx:2207-2208` - `{ value: "62,2", delta: "−2 kg desde 27/08" }` with Peso pressed. Also `:2216` - "62,3", and `:2221-2222` - "62,6" with Peso pressed. It is one `render` with no remount (`:2200`) | PASS |
| C28 | stores nothing | V ✓ "choosing chips stores nothing"; P ✓ "touching the chart stores nothing" | `src/App.test.tsx:2237` - `expect(localStorage.getItem(STORAGE_KEY)).toBe(before)`. Also `e2e/grafico.spec.ts:140` - the same after pointer downs and moves | PASS |
| C29 | chips on one scrolling line; no page scroll | P ✓ "chips on one scrolling line" | `e2e/grafico.spec.ts:151-158`: the tops are within 1, each next left ≥ the previous right; `overflow-x` `auto`; `scrollbar-width` `none`; `sw > cw`; the page `scrollWidth` ≤ 360 | PASS |
| C30 | the plot fills the card at 340:180; the headline type | P ✓ "plot fills the card", ✓ "plot fills the card, pair" | `e2e/grafico.spec.ts:165-169` - the width within 1, the ratio within 0.01, `Fredoka`, `36px`. Also `:177` - `30px` for each side | PASS |
| C31 | the card's arrangement at 360 | P ✓ "card arrangement at 360", ", pair", ", one entry" | `e2e/grafico.spec.ts:190-198`, `:211-224` and `:233-236` - order, left alignment, the stacking of value and change, E under D, the no-gap body, and the one-entry panel's width and centring. The pair-wrap assertion (`:223`) holds only when the fontsource fonts load. In a worktree whose symlinked `node_modules` Vite would not serve, it failed with E at x +165. That is consistent with v6, which also wraps only because of Fredoka's width | PASS |
| C32 | v6's declarations in both schemes | P ✓ "mockup v6 chart declarations - light/dark", ", pair and one entry - light/dark" | `e2e/grafico.spec.ts:290-343`, `:349`, `:360-383` and `:393-401` - `expectCss(... ).toBe(value)` for each declaration the claim lists. Also `:343` - transform `e` within 0.5 of minus half the width | PASS |
| C33 | the other record fields untouched | V ✓ "the chart follows saves edits and deletes" | `src/App.test.tsx:2224-2230` - `version` 1, and `completions`, `today`, `weights` and `reminder` `toEqual(before.…)`, and `restSeconds` `toBe(60)` | PASS |
| C34 | no dot decimals | V ✓ "chart numbers use a decimal comma" | `src/App.test.tsx:2242` - `not.toMatch(/\d\.\d/)`. Also `:2244-2245` on Braço | PASS |
| C35 | the `--s-d` / `--s-e` tokens | P ✓ "series tokens - light/dark" | `e2e/grafico.spec.ts:269-271` - the resolved colours equal `rgb(S_D/S_E[scheme])`, and the `:root` property is non-empty | PASS |
| C36 | the tip clamp | P ✓ "touching the chart shows the date" | `e2e/grafico.spec.ts:95` - `rightCentre ≤ plot.width - 50 + 0.5`. Also `:98` - `leftCentre ≥ 50 - 0.5` | PASS |

## Coverage

Recomputed from the authority over each set. For sets the design decides, that authority is mockup v6 and the plan. For the code's own branches, it is `chart.ts` and `Evolution.tsx`.

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| Medidas sections (4) | v6 l.356/362/378/383 | all 4 C1 | - |
| card-absent sources (3) | plan AC 2 | absent C2 · `[]` C2 · last deleted C2 | - |
| chips (8) | v6 `CHIPS` l.652 | all 8 by order equality C3 | - |
| single-measure states (4) | v6 l.732-739 | hidden C2 · no entry C7 · one entry C8 · chart C9, C11 | - |
| pair states (5) | plan AC 17-22 | both ≥2 C18 · one side single C21 · one side none C22 · one date C23 · two singles on two dates C21 | - |
| change sign (3) and rounding (2) | `chart.ts:225-227` | `+`, `−`, `±` · round up, round to zero: C10 | - |
| y-tick step candidates (5) | `chart.ts:236`, v6 l.723. Named in the level evidence ("step choice over 5 candidates", `checks.md:197`) | ×2 C13 (35.6..36) · ×2.5 C13, C14 (28.3..29) · ×10 C13 (71.6..74, 30..200 and others) · ×1 none: no row has a raw step that is an exact power of ten, and removing it survives (Q1) · ×5 none exactly: only the flat rows reach it, and they assert properties, not values. Removing it survives (Q2) | ×1, ×5 |
| x-label counts (4) | `chart.ts:243-245` | 2, 3, 4 and 5 dates: C14 | - |
| date formats (2) | `History.tsx:8` | this year C9, C14 · other year C15 | - |
| pointer events (3) | `Evolution.tsx:153-155`, v6 l.782 | leave C25 · down none apart from move · move none apart from down. `pointAt` (`grafico.spec.ts:66-71`) always moves and then presses, so removing either handler alone survives (Q3, Q4). A touch tap sends no pointermove, so the touch path rests on an unproven handler | down, move |
| tip inside the card (4 positions C24 claims) | C24's text | `CIN3` right C24 (`:86-87`) · `CIN3` left C24 · `PAIR` right none: measured 210.5-345.5 against card 16-344, outside · one side single, left none: measured 49.5-114.5, inside but unasserted | `PAIR` right, one side single left |
| tip contents (3) | plan AC 23 | single · pair · one side: C24 | - |
| re-derive triggers (3) | plan AC 26 | save, edit, delete: C27 (delete also C2) | - |
| untouched record fields (5) | the record shape | all 5: C33 | - |
| colour schemes (2) | v6 l.29-42 | light and dark: C20, C32, C35 | - |
| mockup v6 decided values, Gráfico (see below) | v6, read in full | 10 members are neither asserted nor out of reach | `.card` box-shadow, `.card` display flex, `.card` flex-direction column, crosshair y1, crosshair y2, hover dot r, hover dot fill, legend line geometry, legend svg viewBox, hit rect |

### Decided values in mockup v6, recomputed

- **Rules.** Every declaration in the rules below is asserted, with these exceptions:
  - `.card` l.86: `box-shadow` and `display: flex; flex-direction: column` are not asserted.
  - `.chips::-webkit-scrollbar` l.163 is named out of reach at `checks.md:179`.

  The asserted rules and their checks:
  - `.chips` and `.chip`: C29, C32
  - `.chip[aria-pressed]`: C32
  - `.chart-card`: C32
  - `.sr-title` and the global `h2` rule: C32
  - `.headline`, `.now`, `.now small`, `.delta` and `.delta b`: C30, C32
  - `.pair` and `.pair .now`: C30, C31, C32
  - `.legend`, `.legend span` and `.legend svg`: C32
  - `.plot` and `.plot svg`: C26, C30, C32
  - `.grid`, `.tick`, `.series`, `.dot`, `.end-label` and `.cross`: C32
  - `.tip`: C32, C36
  - `.first` and `.first b`: C32
  - the tokens: C35

  C32 asserts the `.card`'s `row-gap: 14px` as declared. P6 shows that the gap's effect is not asserted: with `display: block` the 14px gaps vanish, and every proof stays green.
- **SVG and markup.** These are asserted:
  - the viewBox ratio: C30
  - the grid's x1/x2: C16
  - the tick texts at x L−6 and y+4: C14
  - the x texts at y H−6 with their anchors: C14
  - the polyline points: C11, C19
  - the `6 4` dash: C19
  - the last dot's `r` 5 and its fill: C16, C19
  - the end labels at +9/+4: C19
  - the legend lines' stroke, width and dash: C19
  - the crosshair's x and visibility: C24, C25
  - the hover dot centre: C24, on `CIN3` only
  - the tip's `<b>` date: C24

  These are not asserted (the Unproven members above):
  - the crosshair's `y1` T=12 and `y2` H−B=156 (l.765). P2 survives
  - the hover dots' `r="5"` (P4 survives) and their per-side `fill` (l.774). P3, which makes both dots D-coloured, survives
  - the legend line's coordinates and its svg `viewBox="0 0 22 8"` (l.746-747). P5 survives
  - the transparent hit `rect` (l.766). P7 survives. It has no visible effect in Chromium, because the outer svg receives the pointer anyway. The remedy is to name it out of reach, not to assert it

## Test policy rows

| Row | Files it classifies | Required proof | Expectation met |
| --- | --- | --- | --- |
| The chart rules (series, change, ticks, x labels) | `src/domain/chart.ts` | own layer `chart.test.ts:13-74` · through `App`: C11, C14, C9 and C18 render `CIN3` and `PAIR` | yes. Every row of C10, C12, C13 and C14 is in the tables, and `CIN3`/`PAIR` are rendered through `App`. The ×1/×5 gap is recorded under Coverage, because the expectation as written ("every row of …") is satisfied |
| The card's state through `App` | `src/components/Evolution.tsx`, `src/App.tsx` | jsdom C7, C8, C9, C18, C21, C22 and C23 | yes. Each single-measure state and each pair state has a proof through `App` |
| Pointer, layout, type and colour | `src/index.css`, `Evolution.tsx` | Playwright at 360×740 (`grafico.spec.ts:4`) | yes. C20, C32 and C35 run in both schemes. The pointer proofs run at 360×740 |

## Swept existing

| Row | Re-read | Holds |
| --- | --- | --- |
| failure modes: the storage warning (Menu C8) | `src/App.tsx:137-141`. "Seus dados não estão sendo salvos neste navegador" renders above the Menu for every page. The chart only reads `measurementsOf(record)` (`App.tsx:181`) | yes |
| validation: stored values validated on parse | `src/domain/measurements.ts:88` (`parseMeasurements`), called from `src/domain/store.ts:68` | yes |

## Faults injected

The faults were injected in a scratch `git worktree add --detach` of `5bd6cf7` under the session scratchpad, with the real `node_modules` symlinked in.

Two edits were made to the scratch only:

- The Playwright port moved to 5199, so the scratch run could never reuse a server built from the real tree.
- `server.fs.strict` was set to false, so Vite would serve the fontsource fonts through the symlink.

The scratch baseline was 20/20 Playwright and 4/4 domain. The real tree's porcelain was ` M .specs/STATE.md` and `?? .playwright-mcp/` before the run. After `git worktree remove` it was identical (diffed, no output). The real `node_modules` is intact.

**Behaviour faults: 5, one per distinct assertion surface, all killed.**

| Mutation | Location | Killed |
| --- | --- | --- |
| F1 - the change's minus U+2212 changed to a hyphen | `src/domain/chart.ts:227` | yes - "change since the first" × |
| F2 - the x-label middle index `floor` changed to `ceil` | `src/domain/chart.ts:244` | yes - "x labels" × |
| F3 - the 2.5 step candidate dropped | `src/domain/chart.ts:236` | yes - "y ticks" × |
| F4 - the one-entry state decided per side, as v6 does (`sides.every(s => s.pts.length === 1)`) | `src/components/Evolution.tsx:74` | yes - "a side with one entry shows primeira medicao" × |
| F5 - pointer leave no longer clears the hover | `src/components/Evolution.tsx:155` | yes - "leaving the chart hides the tip" × (the tip stayed visible) |

**Coverage and precision probes.** These run beyond the five-fault cap. They are the evidence for the Coverage and Binding-sources findings, not further behaviour faults. Each was run against the whole of `e2e/grafico.spec.ts` plus `App.test.tsx -t Gráfico`, or against the named proof.

| Mutation | Location | Killed |
| --- | --- | --- |
| Q1 - the ×1 step candidate dropped | `src/domain/chart.ts:236` | no - survived (24 Vitest green) |
| Q2 - the ×5 step candidate dropped | `src/domain/chart.ts:236` | no - survived |
| Q3 - `onPointerMove` removed | `src/components/Evolution.tsx:154` | no - survived (20 Playwright green) |
| Q4 - `onPointerDown` removed | `src/components/Evolution.tsx:153` | no - survived |
| P1 - `box-shadow: none` on the chart card | `src/index.css:124` | no - survived |
| P2 - crosshair `y1={0} y2={H}` | `src/components/Evolution.tsx:184` | no - survived |
| P3 - hover dots all `var(--s-d)` | `src/components/Evolution.tsx:187` | no - survived |
| P4 - hover dot `r="3"` | `src/components/Evolution.tsx:187` | no - survived |
| P5 - legend line `x1="11" y1="1" x2="21" y2="7"` | `src/components/Evolution.tsx:140` | no - survived |
| P6 - `display: block` on the chart card | `src/index.css:124` | no - survived |
| P7 - the transparent hit `rect` removed | `src/components/Evolution.tsx:190` | no - survived (no visible effect; it only needs naming out of reach) |

## Notes, not failing

- **C10's row "62 → 62.05 is +0,1" differs from v6.** v6's `+(0.0499…).toFixed(1)` gives "±0" here. That input cannot be stored, because Key decision 6 allows one decimal. v6 decides nothing for it, so this is not a contradiction.
- **Two pair-chart results depend on the fonts loading.**
  - C31's pair wrap (`grafico.spec.ts:223`) holds only when Fredoka loads. It needs a `node_modules` that Vite will serve.
  - The tip overflow measured for C24 likewise depends on DM Sans loading.
- **The approved deviations are in place.** These are the "Ainda sem medição de …" copy, the side with one or no value, the flat ticks, and the one-date text for a pair. Each matches its Assumption row (`plan.md:151-152`).

## Ranked gaps

1. **C24 is false for a member its proof skips.** The `PAIR` tip at the right edge overflows the card by 1.5px (210.5-345.5 against 16-344), and the one-side-single case is not asserted. The tip-in-card assertion is only in `checkTip`, `e2e/grafico.spec.ts:86-87`. The pair tests at `:101-115` skip it. To fix: either clamp the tip to the card (the v6 clamp of 50px is too small for a pair tip about 135px wide), or narrow the claim and record the deviation. Then assert it for every position C24 names.
2. **Pointer down and move are not proven apart.** This affects C24 and the Coverage row "pointer events". `pointAt` at `e2e/grafico.spec.ts:66-71` always moves before pressing, so Q3 and Q4 both survive. A touch tap, the phone case, fires only the down.
3. **The ×1 and ×5 tick step candidates are never pinned (C13).** The flat rows at `src/domain/chart.test.ts:53-54` have `expected` `null`, and no row has a raw step that is an exact power of ten. Q1 and Q2 survive.
4. **Ten mockup v6 values are neither asserted nor named out of reach.** The blanket "Nothing else … is out of reach" at `checks.md:179` is wrong about them. They are:
   - the `.card`'s box-shadow and its flex column (P1, P6), v6 l.86
   - the crosshair's y1/y2 (P2), l.765
   - the hover dots' r and fill (P3, P4), l.774
   - the legend line's geometry and viewBox (P5), l.746-747
   - the hit rect (P7), l.766
5. **C17 / AC 16 contradicts v6 l.756 on the accessible name, and the deviation is not recorded.** The name is "Gráfico de abdômen"/"braço" where v6 gives "abdomen"/"braco". To fix: add an Assumption row and list it at `checks.md:177`.

## Gate

- `pnpm vitest run` - 210 passed, 0 failed (11 files)
- `pnpm exec playwright test` - 72 passed, 0 failed
- `python3 .claude/skills/tlc-spec-lean/scripts/validate_verification.py grafico` - exit code recorded in the hand-off. A FAIL verdict exits 1 by design
