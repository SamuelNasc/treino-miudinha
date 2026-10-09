# Gráfico verification

**Verdict**: PASS
**Profile**: ui
**Diff range**: 2974484..32aa089 (HEAD). The fix under review is 5bd6cf7..32aa089: commit 02b207a (code and tests) and commit 32aa089 (specs)
**Round**: 2 - scoped
**Verifier**: independent sub-agent (author != verifier). Fresh context. It did not build the feature, write its checks or write the round-1 fix, and it changed no file except this report

## Summary

Round 2 closes all five round-1 findings. The scoped review found no new failure.

- **All 42 checks are proven at `32aa089`**, each with a located assertion. Both proof batches ran on the real tree: Vitest ran 28 named tests and Playwright ran 21, all green.
- **C24 now holds.** The tip is clamped by `max(half its own width, 50px)` (`src/components/Evolution.tsx:69-74`), and "inside the card" is asserted at every position C24 names. Measured at HEAD, the CIN3 tip spans x 248.5-307.5 at the right edge and x 56.5-107.5 at the left. The plot spans 32-328 and the card 16-344.
- **Pointer down and pointer move are now proven apart (C37).** Removing either handler is killed (M4, M5).
- **The ×1 and ×5 tick steps are now pinned (C39).** Dropping either is killed (M6, M7). The flat ranges are exact.
- **The ten mockup v6 values left unaccounted in round 1 are now all accounted for.** Nine are asserted (C40, C41, C42), and each was made to fail by a fault. The hit `rect` is named out of reach at `checks.md:200`.
- **The C17 accessible-name deviation is now recorded.** It is an Assumption row at `plan.md:154` and listed as approved at `checks.md:198`.
- **Faults.** 18 mutations were run on the surfaces the fix touched or created, and all 18 were killed.
- **The fix keeps the rules of hooks and the jsdom path.** The new `useLayoutEffect` runs unconditionally, before the early returns at `Evolution.tsx:83-84`. A jsdom probe went from one entry to a chart and back with 0 `console.error` calls. A pointer down in jsdom did not throw.

Lesson distillation (step 7) is left to the orchestrator.

## Round 1 record (carried from 5bd6cf7, summary)

Round 1 ran on `2974484..5bd6cf7` and returned **FAIL**.

- **What passed.** 35 of 36 checks (C1-C36) were proven with located evidence. All 5 behaviour faults F1-F5 were killed: the minus sign, the x-label middle index, the 2.5 tick step, the one-entry state per side, and pointer leave. The gate was green: Vitest 210, Playwright 72.
- **Finding 1.** C24 claimed the tip lies inside the card at four positions but asserted it for two. The `PAIR` tip at the right edge overflowed the card (x 210.5-345.5 against 16-344).
- **Finding 2.** Pointer down and pointer move were not proven apart. Probes Q3 and Q4 survived.
- **Finding 3.** The ×1 and ×5 tick step candidates were never pinned. Probes Q1 and Q2 survived.
- **Finding 4.** Ten mockup v6 values were neither asserted nor named out of reach:
  - the card's `box-shadow`, `display: flex` and `flex-direction: column`
  - the crosshair's `y1` and `y2`
  - each hover dot's `r` and its per-side fill
  - the legend line's coordinates and its svg `viewBox`
  - the transparent hit `rect`

  Probes P1-P7 survived.
- **Finding 5.** The C17 / AC 16 accessible name contradicted v6 l.756, and the deviation was not recorded.
- **Notes carried, not failing.**
  - C10's row "62 → 62.05 is +0,1" differs from v6, but that input cannot be stored.
  - C31's pair wrap depends on the fontsource fonts loading.

## Scope of this round

The scope follows `verify.md` "Re-verifying after a fix". It is set by the fix's diff and by the five non-PASS findings above.

The diff (`git diff --stat 5bd6cf7..HEAD`) touches these files:

- `src/components/Evolution.tsx` (+14/-4). It adds the clamp in a `useLayoutEffect` and a `tipRef`. `hover` now carries the plot `width` instead of a clamped `left`.
- `e2e/grafico.spec.ts` (+43). It adds `SHADOW`, the `tipInside` and `dotsAt` helpers, the pair and one-side assertions, the C37 test, and the C42 declarations.
- `src/App.test.tsx` (+16). It adds the "legend and crosshair geometry" test at `:2147`. Everything after it shifts by 16 lines.
- `src/domain/chart.test.ts` (+6/-4). It adds the ×1, ×5 and exact flat rows.
- `plan.md` gains two Assumption rows. `checks.md` gains C37-C42, Coverage rows, the deviations and the out-of-reach list.
- `.specs/LESSONS.md` and `.specs/lessons.json` are touched by the specs commit. They are not inputs to any check.

| Step | This round |
| --- | --- |
| Step 1 (binding sources) | Re-done for what the fix touched: the tip's position, the pointer, the hover dots, the crosshair, the legend svg, the `.card` rule, and the accessible name. Verified at `32aa089` |
| Proofs | All 42 re-run at `32aa089` in 2 batched invocations |
| Citations | Refreshed for every check in a touched file: `App.test.tsx` from `:2147` on, all of `e2e/grafico.spec.ts`, and `chart.test.ts` C13 and C14. C1-C20's `App.test.tsx` lines (before `:2147`) and C10/C12's `chart.test.ts` lines (before the `@@ -43` hunk) are unchanged and carried |
| Coverage | Recomputed: pointer events, tip positions, y-tick step candidates and ranges, mockup v6 elements and rules, v6 SVG geometry, and round 1's ten unaccounted values. Other rows are carried from 5bd6cf7 |
| Test policy | All three rows classify a touched file, so all three are re-judged |
| Faults | Re-injected on every surface the fix touched or created (M1-M18). F1-F5 are carried from 5bd6cf7 |
| Swept existing | Carried from 5bd6cf7. The fix touches no swept constraint |

## Binding sources

Verified at `32aa089`, for the surfaces in scope.

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| Mockup v6, https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa, version `1791496183-91de`. Opened this round with the Artifact tool (`read`). The rules are in the returned head, and the local copy `artifact-1d35028d-1791496183-91de.html` was read for l.720-918. The parts the fix touched: `.card` l.86, the legend l.745-747, `aria-label` l.756, the crosshair and hit rect l.765-766, the hover dots l.774, the tip clamp l.778, and the handlers l.782 | yes - read this round | none. The two deviations the fix touches are now approved Assumptions. The tip clamp (`max(half width, 50)` vs v6's fixed 50, l.778) is at `plan.md:155` and `checks.md:198`. The accessible name (chip label vs chip key, l.756) is at `plan.md:154` and `checks.md:198`. The app's legend svg adds `aria-hidden="true"`, which v6 omits. That has no visual effect, and the svg carries no name in either | none |
| `.design/body-measurements.md` `### Gráfico` (l.194-207) | yes - re-read this round. It decides nothing about the tip's position or the pointer | none | - |

### What the fix touched, against v6

| v6 decides | Line | App | Check |
| --- | --- | --- | --- |
| `.card` `box-shadow: var(--shadow)` (light `0 6px 20px rgba(179,18,46,.10)`, dark `rgba(0,0,0,.35)`) | l.86, l.25, l.31 | `index.css:201`, `:21`, `:44` | C42 `e2e/grafico.spec.ts:335` |
| `.card` `display: flex; flex-direction: column` | l.86 | `index.css:201` | C42 `:335` |
| legend svg `viewBox="0 0 22 8"` | l.746-747 | `Evolution.tsx:149` | C40 `src/App.test.tsx:2153` |
| legend line `x1=1 y1=4 x2=21 y2=4` | l.746-747 | `Evolution.tsx:150` | C40 `:2155` |
| crosshair `y1=T (12)`, `y2=H-B (156)`, hidden at rest | l.765 | `Evolution.tsx:194` | C40 `:2158-2160` |
| hit `rect` transparent | l.766 | `Evolution.tsx:200` | out of reach, `checks.md:200` |
| hover dot `r=5`, `fill=colors[i]` per side, at `(x(d), y(v))` | l.774 | `Evolution.tsx:197` | C41 `e2e/grafico.spec.ts:126-130`, `:143` |
| handlers on pointermove, pointerdown, pointerleave | l.782 | `Evolution.tsx:163-165` | C37 (down, move), C25 (leave) |
| tip centre clamped to [50, width-50] | l.778 | `Evolution.tsx:69-74`: `max(offsetWidth/2, 50)` | C36, C38 (approved deviation) |
| accessible name `Gráfico de ${chosen}` | l.756 | `Evolution.tsx:162` (`label.toLowerCase()`) | C17 (approved deviation) |

## Checks

All proofs ran at `32aa089` on the real tree, in two batched invocations.

- **Vitest (V).** `pnpm vitest run src/App.test.tsx src/domain/chart.test.ts -t "<the 28 distinct proof names from checks.md joined by |>" --reporter=verbose` exited 0. It ran 28 tests and skipped 113, and each of the 28 appears individually as ✓: the 4 under `chart > …` and the 24 under `Gráfico > …`, including the new `Gráfico > legend and crosshair geometry`.
- **Playwright (P).** `pnpm exec playwright test e2e/grafico.spec.ts -g "a tap alone and a move alone each show the tip|card arrangement at 360|chips on one scrolling line|leaving the chart hides the tip|mockup v6 chart declarations|pair colours|plot fills the card|series tokens|the chart lets the page scroll|touching the chart shows the date|touching the chart stores nothing"` exited 0 with 21 passed. Each test is listed by name. The new one is `:147` "a tap alone and a move alone each show the tip".
- **Every name exists and is the feature's own.** The 11 Playwright patterns resolve to tests in `e2e/grafico.spec.ts`, which the feature created. The 28 Vitest names resolve to `describe("Gráfico")` in `src/App.test.tsx` (from `:1929`) and to `src/domain/chart.test.ts`. Both were added in 5bd6cf7 or 02b207a.

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | headings in order | V ✓ | `src/App.test.tsx:1935-1936` (carried from 5bd6cf7, lines unchanged) | PASS |
| C2 | no Measurement, no card | V ✓ | `src/App.test.tsx:1942-1945`, `:1955` (carried) | PASS |
| C3 | 8 chips in order | V ✓ | `src/App.test.tsx:1960` (carried) | PASS |
| C4 | Cintura pressed first | V ✓ | `src/App.test.tsx:1965` (carried) | PASS |
| C5 | a tap chooses | V ✓ | `src/App.test.tsx:1971-1975` (carried) | PASS |
| C6 | survives a page switch | V ✓ | `src/App.test.tsx:1983-1984` (carried) | PASS |
| C7 | "Ainda sem medição de …" | V ✓ | `src/App.test.tsx:1998-1999`, `:2002` (carried) | PASS |
| C8 | one entry | V ✓ | `src/App.test.tsx:2009-2014` (carried) | PASS |
| C9 | latest value and change | V ✓ | `src/App.test.tsx:2020-2023` (carried) | PASS |
| C10 | change rule | V ✓ | `src/domain/chart.test.ts:39-42` (carried, above the fix's hunk) | PASS |
| C11 | one line at v6's coordinates | V ✓ | `src/App.test.tsx:2028-2032` (carried) | PASS |
| C12 | series rule | V ✓ ×2 | `src/domain/chart.test.ts:14-25`; `src/App.test.tsx:2043-2044` (carried) | PASS |
| C13 | tick rule | V ✓ "y ticks" | `src/domain/chart.test.ts:60` `expect(ticks, …).toEqual(expected)`, now unconditional over every row at `:47-56`. Also `:61-67` - 3 to 5 ticks, equal steps, span covered, flat strictly inside. Refreshed | PASS |
| C14 | x labels; axis texts | V ✓ ×2 | `src/domain/chart.test.ts:72-75` (refreshed, +2); `src/App.test.tsx:2049-2059` (carried) | PASS |
| C15 | year when it differs | V ✓ | `src/App.test.tsx:2065-2070` (carried) | PASS |
| C16 | last dot; grid | V ✓ | `src/App.test.tsx:2075-2084` (carried) | PASS |
| C17 | accessible name | V ✓ | `src/App.test.tsx:2098-2102` (carried). Now backed by the Assumption at `plan.md:154` | PASS |
| C18 | D and E headlines | V ✓ | `src/App.test.tsx:2108-2111` (carried) | PASS |
| C19 | solid D, dashed E, legend | V ✓ | `src/App.test.tsx:2118-2144` (carried) | PASS |
| C20 | pair colours, both schemes | P ✓ ×2 | `e2e/grafico.spec.ts:287-294` `expect(await css(d, "stroke")).toBe(rgb(S_D[scheme]))`, and E, the dots and the legend lines. Refreshed | PASS |
| C21 | a side with one entry | V ✓ | `src/App.test.tsx:2167-2174` - D's delta, `e` `toEqual({ letter: "E", value: "28,3", unit: "cm", delta: "primeira medição" })`, one line, one E dot at 310. `:2184-2186` - 0 lines, dots `["var(--s-d)","var(--s-e)"]`. Refreshed | PASS |
| C22 | a side with no entry | V ✓ | `src/App.test.tsx:2197-2202` - letters `["D"]`, one line, legend `["Direita"]`, end labels `["D"]`, and the region text not matching "NaN" or "undefined" (`not.toMatch`). Refreshed | PASS |
| C23 | pair on one date | V ✓ | `src/App.test.tsx:2209-2211`. Refreshed | PASS |
| C24 | tip, crosshair, hover dots; tip inside the card each time | P ✓ "touching the chart shows the date", "- pair", "- pair with one side missing" | `e2e/grafico.spec.ts:79-85` (`checkTip`: text, `<b>`, visibility, `x1`, `3px, 3px`, dot count), `:87-88` tip in card for CIN3 right and left, `:94-95` hover dot at (310, 127.2). `:123-124` pair text and 2 dots, `:131` → `:109-110` pair right in card. `:141-142` one-side text and 1 dot, `:144` → `:109-110` in card. Refreshed. Round 1's gap is closed | PASS |
| C25 | leaving hides | P ✓ | `e2e/grafico.spec.ts:164-166` `toBeHidden()`, `visibility` `"hidden"`, `toHaveCount(0)`. Refreshed | PASS |
| C26 | `touch-action: pan-y` | P ✓ | `e2e/grafico.spec.ts:171`. Refreshed | PASS |
| C27 | follows saves, edits, deletes | V ✓ | `src/App.test.tsx:2223-2224`, `:2232`, `:2237-2238`. One `onMedidas` render at `:2216`. Refreshed | PASS |
| C28 | stores nothing | V ✓, P ✓ | `src/App.test.tsx:2253` `toBe(before)`; `e2e/grafico.spec.ts:182` `toBe(before)`. Refreshed | PASS |
| C29 | chips on one scrolling line | P ✓ | `e2e/grafico.spec.ts:193-200`. Refreshed | PASS |
| C30 | plot fills the card; headline type | P ✓ ×2 | `e2e/grafico.spec.ts:207-211`, `:219`. Refreshed | PASS |
| C31 | card arrangement | P ✓ ×3 | `e2e/grafico.spec.ts:232-240`, `:253-266`, `:275-278`. Refreshed | PASS |
| C32 | v6 declarations, both schemes | P ✓ ×4 | `e2e/grafico.spec.ts:332-386` (`expectCss … toBe(value)` at `:320`), `:391-392`, `:403-444`. `:386` - transform `e` within 0.5 of minus half the width. Refreshed | PASS |
| C33 | other record fields untouched | V ✓ | `src/App.test.tsx:2240-2246`. Refreshed | PASS |
| C34 | decimal comma | V ✓ | `src/App.test.tsx:2258`, `:2260-2261`. Refreshed | PASS |
| C35 | `--s-d` / `--s-e` tokens | P ✓ ×2 | `e2e/grafico.spec.ts:311-313`. Refreshed | PASS |
| C36 | the clamp at CIN3's edges | P ✓ | `e2e/grafico.spec.ts:96` `expect(rightCentre).toBeLessThanOrEqual(plot.width - 50 + 0.5)`; `:99` `expect(leftCentre).toBeGreaterThanOrEqual(50 - 0.5)`. Refreshed | PASS |
| C37 | a tap alone, a move alone | P ✓ "a tap alone and a move alone each show the tip" | `e2e/grafico.spec.ts:152` dispatches only `pointerdown` (`pointerType: "touch"`), then `:153` `toHaveText("08/1071,6 cm")`. `:155` `page.mouse.move` with no button, then `:156` `toHaveText("27/0874 cm")`. New | PASS |
| C38 | tip inside the plot and card at every position; centre ≥ 50 from each side | P ✓ "touching the chart shows the date" ×3 | `tipInside` at `e2e/grafico.spec.ts:107-113`: `t.x ≥ plot.x - 0.5`, `t.x + t.width ≤ plot.x + plot.width + 0.5`, the same against the card, and centre in [49.5, width - 49.5]. It is called at `:131` (PAIR right), `:133` (PAIR left) and `:144` (one side, left). CIN3 right and left go through `:87-88` (in card) plus `:96`/`:99` (centre bound). See note 1. New | PASS |
| C39 | ×1, ×5 and exact flat ticks | V ✓ "y ticks" | `src/domain/chart.test.ts:53` `[0, 30, [0, 10, 20, 30]]`, `:54` `[0, 12, [0, 5, 10, 15]]`, `:55` `[72, 72, [71.5, 72, 72.5]]`, `:56` `[62.9, 62.9, [62, 62.5, 63, 63.5]]`, all asserted at `:60` `toEqual(expected)`. New | PASS |
| C40 | legend svg and crosshair geometry | V ✓ "legend and crosshair geometry" | `src/App.test.tsx:2151` 2 svgs; `:2153` `viewBox` `toBe("0 0 22 8")`; `:2155` `toEqual(["1", "4", "21", "4"])`; `:2158` `y1` `toBe("12")`; `:2159` `y2` `toBe("156")`; `:2160` `visibility` `toBe("hidden")`. New | PASS |
| C41 | hover dots r 5, side fill, position | P ✓ "- pair", "- pair with one side missing" | `e2e/grafico.spec.ts:126` `toEqual([["var(--s-d)", "5"], ["var(--s-e)", "5"]])`; `:128-129` cx/cy within 0.01 of (310, 108) and (310, 146.4); `:143` `toEqual([["var(--s-d)", "5"]])`. New | PASS |
| C42 | card display, direction, shadow, both schemes | P ✓ "mockup v6 chart declarations - light", "- dark" | `e2e/grafico.spec.ts:335` `display: "flex", "flex-direction": "column", "box-shadow": SHADOW[scheme]`, with `SHADOW` at `:22`, asserted by `:320` `toBe(value)`. New | PASS |

Per-check tally: **42/42 PASS** with located evidence.

## Coverage

Each row the fix touched is recomputed from its authority: mockup v6 for what the design decides, and the code for its own branches. The other rows are carried from 5bd6cf7.

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| pointer events (3). Verified at `32aa089` | v6 l.782; `Evolution.tsx:163-165` | down alone C37 `:152-153` (M4 killed) · move alone C37 `:155-156` (M5 killed) · leave C25 `:164-166` (F5, carried) | - |
| tip positions (5). Verified at `32aa089` | C24's four positions plus PAIR left (C38); the Assumption at `plan.md:155` | CIN3 right C24 `:87-88`, C36 `:96` · CIN3 left C24 `:87-88`, C36 `:99` · PAIR right C38 `:131` · PAIR left C38 `:133` (M3 killed) · one side single, left C38 `:144` (M2 killed) | - |
| clamp branches (3). Verified at `32aa089` | `Evolution.tsx:72-73` | 50px floor wins (single tip ≈ 51-59px): C36 `:96`, `:99`, C38 `:144` (M2 killed) · half-width wins (pair tip ≈ 135px): C38 `:131`, `:133` (M1 killed) · no hover or no tip, early return: jsdom probe, see "Faults injected" | - |
| y-tick step candidates (5). Verified at `32aa089` | `chart.ts:32`; v6 l.722 | ×1 `chart.test.ts:53` (M6 killed) · ×2 `:51` · ×2.5 `:49` · ×5 `:54`, `:55-56` (M7 killed) · ×10 `:47`, `:48`, `:50`, `:52` · all exact at `:60` | - |
| y-tick ranges (10, `checks.md:182`). Verified at `32aa089` | `checks.md` C13 and C39 rows | all 10 rows `chart.test.ts:47-56`, exact `toEqual` at `:60` (the flat rows were property-only in round 1 and are now exact) | - |
| round 1's unaccounted mockup v6 values (10). Verified at `32aa089` | v6 l.86, l.746-747, l.765-766, l.774 | `.card` box-shadow C42 `:335` (M13) · `.card` display flex C42 `:335` (M14) · `.card` flex-direction column C42 `:335` (M15) · crosshair y1 C40 `:2158` (M10) · crosshair y2 C40 `:2159` (M17) · hover dot r C41 `:126`, `:143` (M9) · hover dot side fill C41 `:126`, `:143` (M8) · legend line geometry C40 `:2155` (M11) · legend svg viewBox C40 `:2153` (M12) · hit rect out of reach `checks.md:200` | - |
| mockup v6 `.card` rule l.86 (7 declarations). Verified at `32aa089` | v6 l.86, with `.chart-card` l.167 | background C32 `:333` · radius C32 `:333` · box-shadow C42 · padding (18 16 14, with `.chart-card`) C32 `:334` · display C42 · flex-direction C42 · gap C32 `:334` | - |
| mockup v6 elements (20) and rules (27). Verified at `32aa089` | v6 l.162-188, l.243, `#chartCard` l.356-360 | as round 1 (all asserted), plus the hover dots now C41 and the crosshair C40. `.card` is now complete (row above) | - |
| v6 SVG geometry (11). Verified at `32aa089` | v6 l.748-766, l.774 | viewBox ratio C30 · plot box L/R C11, C16 · T/B C11, C14 · tick text C14 · x text C14 · last dot r C16 · end labels C19 · dashes C19 · crosshair y1/y2 C40 · legend viewBox and line C40 · hover dot r, fill, centre C41, C24 | - |
| Medidas sections (4) · card-absent sources (3) · chips (8) · single-measure states (4) · pair states (5) · change sign and rounding (5) · x-label counts (4) · date formats (2) · tip contents (3) · re-derive triggers (3) · untouched record fields (5) · colour schemes (2) | carried from 5bd6cf7. The fix touched no code these come from; `chart.ts` and `index.css` are unchanged | as in round 1 | - |

## Test policy rows

| Row | Files it classifies | Required proof | Expectation met |
| --- | --- | --- | --- |
| The chart rules (series, change, ticks, x labels) - re-judged, `chart.test.ts` touched | `src/domain/chart.ts` (unchanged) | own layer `chart.test.ts:13-76` · through `App`: C9, C11, C14 and C18 render `CIN3` and `PAIR` | yes. Every row of C10, C12, C13, C14 and C39 is in a table, and every tick row is now asserted exactly |
| The card's state through `App` - re-judged, `Evolution.tsx` and `App.test.tsx` touched | `src/components/Evolution.tsx`, `src/App.tsx` | jsdom C7, C8, C9, C18, C21, C22, C23, C40 | yes. Each single-measure state and each pair state still has a proof through `App`. C40 adds the legend and crosshair attributes |
| Pointer, layout, type and colour - re-judged, `Evolution.tsx` and `grafico.spec.ts` touched | `Evolution.tsx` (clamp, handlers), `src/index.css` (unchanged) | Playwright at 360×740 (`e2e/grafico.spec.ts:4`): C24, C36, C37, C38, C41, C42 | yes. The pointer proofs run at 360×740. C42 runs in both schemes, as does every colour claim (C20, C32, C35) |

## Faults injected

Verified at `32aa089`.

**Method.**

- **Scratch worktree.** Created with `git worktree add --detach <scratchpad>/wt HEAD`, with the real `node_modules` symlinked in.
- **Scratch-only config.** The Playwright port moved to 5199, and `server.fs.strict` was set to false so the fontsource fonts load.
- **Scratch baseline.** 21/21 Playwright (`e2e/grafico.spec.ts`) and 28/28 Vitest (Gráfico and chart).
- **Each mutation.** Applied by a script as an exact single-occurrence replace, and shown with `git diff -U0`. The narrowest covering proof was then run, and the file restored with `git checkout --`. After each one, `git status --porcelain -- src e2e` was empty.
- **Second pass.** A second scratch (`wt2`) ran M17 and M18.
- **Clean-up.** Both worktrees were removed (`git worktree remove --force`, then `prune`). `git worktree list` shows only the main tree.
- **Real tree.** `git status --porcelain` before was ` M .specs/STATE.md`, `?? .playwright-mcp/`. After, it was identical (`diff` printed nothing). The real `node_modules` is intact.

| Mutation | Location | Killed |
| --- | --- | --- |
| M1 - the clamp reverted to v6's fixed 50 (`const half = 50`) | `src/components/Evolution.tsx:72` | yes - "touching the chart shows the date - pair" × at `e2e/grafico.spec.ts:108` (the PAIR tip leaves the plot) |
| M2 - the 50px floor dropped (`half = offsetWidth / 2`) | `Evolution.tsx:72` | yes - "touching the chart shows the date" × at `:96` (C36), and "- pair with one side missing" × at `:112` (C38) |
| M3 - the left side clamped at 50, not half-width | `Evolution.tsx:73` | yes - "- pair" × at `:107` (the PAIR-left call, `:133`) |
| M4 - `onPointerDown` removed | `Evolution.tsx:163` | yes - "a tap alone and a move alone each show the tip" × at `:153`. The 4 other pointer tests stayed green, which is the round-1 gap C37 closes |
| M5 - `onPointerMove` removed | `Evolution.tsx:164` | yes - "a tap alone and a move alone …" × at `:156` |
| M6 - the ×1 step candidate dropped | `src/domain/chart.ts:32` | yes - "y ticks" × (`0..30: expected [0, 20, 40]`) at `chart.test.ts:60` |
| M7 - the ×5 step candidate dropped | `chart.ts:32` | yes - "y ticks" × (`0..12: expected [0, 10, 20]`) at `:60` |
| M8 - every hover dot filled `var(--s-d)` | `Evolution.tsx:197` | yes - "- pair" × at `e2e/grafico.spec.ts:126` |
| M9 - hover dot `r="3"` | `Evolution.tsx:197` | yes - "- pair" × at `:126`, "- pair with one side missing" × at `:143` |
| M10 - crosshair `y1={0} y2={H}` | `Evolution.tsx:194` | yes - "legend and crosshair geometry" × (`'0'` vs `'12'`) at `src/App.test.tsx:2158` |
| M11 - legend line `x1=11 y1=1 x2=21 y2=7` | `Evolution.tsx:150` | yes - × at `src/App.test.tsx:2155` |
| M12 - legend svg `viewBox="0 0 20 10"` | `Evolution.tsx:149` | yes - × at `:2153` |
| M13 - `.card.chart-card { box-shadow: none }` | `src/index.css:124` | yes - "mockup v6 chart declarations" light × and dark × ("card box-shadow", received `none`) at `e2e/grafico.spec.ts:335` |
| M14 - `.card.chart-card { display: block }` | `index.css:124` | yes - light × and dark × ("card display", received `block`) at `:335` |
| M15 - `.card.chart-card { flex-direction: column-reverse }` | `index.css:124` | yes - light × and dark × ("card flex-direction") at `:335` |
| M16 - crosshair `visibility="visible"` at rest | `Evolution.tsx:194` | yes - × at `src/App.test.tsx:2160` |
| M17 - crosshair `y2={H}` only (`y1` kept) | `Evolution.tsx:194` | yes - × (`'180'` vs `'156'`) at `:2159` |
| M18 - hover dot `cy` + 1 | `Evolution.tsx:197` | yes - "- pair" × at `e2e/grafico.spec.ts:129` |

**Totals.** 18 mutations, 18 killed. Each new assertion line in C37-C42 was made to fail at least once, except two:

- `tipInside`'s card bounds at `:109-110`, which the plot bounds at `:107-108` imply, since the plot sits inside the card.
- C38's right-hand centre bound at `:113`, which no mutant moved independently. The right-side clamp is the same expression as the left, and M1 reaches it through `:108`.

**Behaviour faults F1-F5** are carried from 5bd6cf7, all killed. `chart.ts` is unchanged except where M6 and M7 probed it. Pointer leave (F5) still sits at `Evolution.tsx:165`.

**Hooks and the jsdom path.** A scratch-only probe (`src/zz-probe.test.tsx`, deleted afterwards) rendered `Evolution` in four steps:

1. With one entry, which takes the early return.
2. Re-rendered with two entries, which draws the chart.
3. `fireEvent.pointerDown`, `pointerMove` and `pointerLeave` on the chart.
4. Re-rendered with one entry again.

What it showed:

- No throw, and 0 `console.error` calls. So the hook order holds across the early-return boundary: `useState`, `useRef` ×2 and `useLayoutEffect` all sit at `Evolution.tsx:64-74`, above the returns at `:83-84`.
- In jsdom, `offsetWidth` is 0, so `half` is 50. With the zero plot `width`, the tip's `left` comes out as `-50px`. The tip still showed and hid correctly.
- No jsdom proof dispatches a pointer event (`grep -n -i pointer src/App.test.tsx` finds nothing), so this value reaches no assertion.

**Measured at HEAD (scratch, fonts loaded).**

| Position | Tip span (x) | Tip width |
| --- | --- | --- |
| CIN3 right | 248.5-307.5 | 59px |
| CIN3 left | 56.5-107.5 | 51px |

The plot spans 32-328 and the card 16-344. Each tip centre sits exactly at 50px from the plot edge.

## Gate

Run at `32aa089`, on the real tree:

- `pnpm vitest run`: 11 files, **211 passed**, 0 failed. That is round 1's 210 plus C40's test.
- `pnpm exec playwright test`: **73 passed**, 0 failed. That is round 1's 72 plus C37's test.

## Swept existing

Carried from 5bd6cf7. The fix touches no swept constraint. `src/App.tsx`, `src/domain/measurements.ts` and `src/domain/store.ts` are not in `git diff --stat 5bd6cf7..HEAD`.

## Findings

None failing.

Notes:

1. **C38's "within the plot" is asserted directly at 3 of its 5 positions.** Those are PAIR right, PAIR left and the one-side case, via `tipInside`. At CIN3's two positions, the proof asserts the tip inside the card (`:87-88`) and the clamped centre (`:96`, `:99`). Together these imply "within the plot" only while the single tip is at most 100px wide. Measured, it is 51-59px, and C32 pins its padding and font size. No single plausible mutant breaks it without tripping C36 or C32, so this is recorded as a note. If the orchestrator wants it literal, calling `tipInside` after each `pointAt` in the first test would close it.
2. **`checks.md:187`, the Coverage row "tip positions (5)", has only 3 cells.** Its `Unproven` cell is missing. The recomputed row above has no unproven member, so this is cosmetic in the checks file.
3. **The clamp has an unreachable edge.** A tip wider than the plot would make `width - half` fall below `half` and push the tip left. The widest content today is the PAIR tip at about 135px, against a 296px plot, so no current state reaches it.
4. **Carried notes.**
   - C10's `62 → 62.05` row differs from v6, but that input cannot be stored.
   - C31's pair wrap and the tip widths depend on the fontsource fonts loading. Both scratches loaded them through `server.fs.strict: false`.
5. **Lessons step.** The step that distils lessons (`scripts/lessons.py`) was not run. This verifier writes only this report.
