# Apagar treino verification

**Verdict**: FAIL
**Profile**: ui
**Diff range**: 2d76590..e14d261 (fix under review: 1645c5f..e14d261)
**Round**: 2 - scoped
**Verifier**: independent sub-agent, round 2 Verifier (author != verifier; did not write 1645c5f or e14d261)

The fix closes round 1's gap. The `display: block` mutant on `.day button` is now killed by the new label assertion at `e2e/apagar-treino.spec.ts:89`. Two more faults on the label surface (a gap change and a line-height change) are killed too, at `:89` and `:90`.

One new gap still fails the feature. A colour mutant on the same rule survives: `.day button { color: inherit }` -> `color: var(--ink)`. It turns the label on button days from `--muted` rgb(141, 90, 99) to `--ink` rgb(58, 17, 24), while Tuesday's label stays `--muted`. C20 stays green. AC 18 says the strip day buttons "SHALL keep the dot, letter and label look they have today". The fix proves the label's position and height, but not its colour.

All 22 proofs are green at e14d261.

Scope of this round: the fix's diff touches `e2e/apagar-treino.spec.ts` (C20), `src/App.test.tsx:2393` (the C2 seed), `checks.md` (C20 claim text) and `verification.md`. No source file under `src/` other than the test changed. Everything the diff could not touch is carried forward and marked as such.

## Binding sources

*carried from 1645c5f.* The fix does not touch the interface or any screen's code (`git diff 1645c5f..e14d261 --stat` lists no file under `src/` except `App.test.tsx`), so step 1 is not re-run. Round 1's finding in this section was the uncovered label look (AC 18). That finding is re-judged under Coverage below, verified at e14d261.

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| Histórico confirm (reference, not a design): `.specs/features/historico/plan.md` AC 10/29, `e2e/historico.spec.ts:119`, `src/index.css:170-172` | yes (round 1, at 1645c5f) | none | - |
| Plan screens (no design): Hoje strip + confirm, Histórico confirm text | yes (round 1; AC 18 re-read at e14d261) | none | strip day button: the label's colour on a button day (AC 18 "label look") has no assertion. See Coverage and Faults |

## Checks

*Proofs re-run in full at e14d261. Citations refreshed for the touched files (`e2e/apagar-treino.spec.ts`, `src/App.test.tsx`). Other citations carried from 1645c5f, in files the fix did not change.*

Vitest, one invocation: `pnpm vitest run src/App.test.tsx src/domain/store.test.ts -t "<19 names alternated>" --reporter=verbose`. Exit 0. All 19 named tests are listed individually as passed. Playwright: `pnpm exec playwright test e2e/apagar-treino.spec.ts`. Exit 0, 4 passed: C18, C19 light, C19 dark, C20.

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | removes exactly one (date, workout); rest of record kept; absent pair is a no-op | vitest `removeCompletion drops exactly one pair` exit 0 | `src/domain/store.test.ts:206` `expect(out.completions).toEqual([A 10-05, C 10-07])`; `:210` rest of record equal; `:211` no-op (carried, file untouched) | PASS |
| C2 | only Mon and Wed are buttons, with exact names; A on FRI makes Friday a button | vitest `strip days with a workout are buttons` exit 0 | `src/App.test.tsx:2387` aria-labels `toEqual(["Apagar treino de seg, 05/10","Apagar treino de qua, 07/10"])`; `:2391` days 1,3,4,5,6 `queryByRole("button")).toBeNull()`; `:2393` seed now `c(FRI, "A")` matching the claim; `:2395` button "Apagar treino de sex, 09/10" (verified at e14d261) | PASS |
| C3 | confirm text and buttons, after strip and before Picker, nothing stored | vitest `tapping a day asks first` exit 0 | `src/App.test.tsx:2406` `toHaveTextContent(B_WED)`; `:2410-2411` DOCUMENT_POSITION_FOLLOWING; `:2412` `stored()` equals before | PASS |
| C4 | two workouts on one day give two confirms, A then B | vitest `one confirm per workout of the day` exit 0 | `src/App.test.tsx:2423` `a.compareDocumentPosition(b) & FOLLOWING` | PASS |
| C5 | Cancelar or a second tap hides the confirm, record unchanged | vitest `cancelar or a second tap keeps the workout` exit 0 | `src/App.test.tsx:2435,2440` group `toBeNull()`; `:2436,2441` `stored()).toEqual(before)` | PASS |
| C6 | another day replaces the confirm | vitest `another day replaces the confirm` exit 0 | `src/App.test.tsx:2451-2452` | PASS |
| C7 | Apagar removes, hides, toast, re-derives dot/count/próximo | vitest `apagar removes the workout and re-derives` exit 0 | `src/App.test.tsx:2462` completions `[A 10-05]`; `:2464` status "Treino apagado"; `:2467` "Esta semana: 1/4"; `:2468` B "próximo" | PASS |
| C8 | streak 3 -> 2, count 3/4 -> 2/4 | vitest `removing a workout lowers the streak` exit 0 | `src/App.test.tsx:2489` streak-number "2"; `:2490` "Esta semana: 2/4" | PASS |
| C9 | today's removal clears today; card A 0/6; "Comece hoje 💪" | vitest `removing today's workout clears its checks` exit 0 | `src/App.test.tsx:2501` `today` toEqual `{date:FRI,workout:null,checked:[]}`; `:2502-2503`; `:2504` | PASS |
| C10 | rest day after today's removal shows the rest card | vitest `removing today's workout on a rest day shows rest` exit 0 | `src/App.test.tsx:2515` heading "Hoje é descanso"; `:2517` no "Treino B" | PASS |
| C11 | day change hides the confirm | vitest `a new day hides the confirm` exit 0 | `src/App.test.tsx:2531` group `toBeNull()` | PASS |
| C12 | uncheck removes today's B, keeps the other checks | vitest `unchecking undoes today's workout` exit 0 | `src/App.test.tsx:2552` completions `[A 10-05]`; `:2554` checked = B ids minus voador | PASS |
| C13 | quiet re-derive: dot, 1/4, próximo, no toast, no celebration | vitest `unchecking re-derives quietly` exit 0 | `src/App.test.tsx:2563-2565`; `:2566` `queryByRole("status")).toBeNull()`; `:2567` `queryByRole("dialog")).toBeNull()` | PASS |
| C14 | re-check records B again and celebrates | vitest `checking again records it again` exit 0 | `src/App.test.tsx:2577` completions `[A, B FRI]`; `:2578` "Treino B feito." | PASS |
| C15 | unchecking another workout keeps today's Completion | vitest `unchecking another workout keeps today's completion` exit 0 | `src/App.test.tsx:2588` `toEqual([c(FRI,"B")])` | PASS |
| C16 | weights unchanged by both removal paths | vitest `removal keeps weights` exit 0 | `src/App.test.tsx:2599,2601` `stored().weights).toEqual(weights)` | PASS |
| C17 | version 1, every key but completions kept | vitest `removal keeps the rest of the record` exit 0 | `src/App.test.tsx:2622` `after.version).toBe(1)`; `:2623` | PASS |
| C18 | confirm between strip and Picker, full width, 44 px buttons, order | playwright `confirm sits between strip and picker` exit 0 | `e2e/apagar-treino.spec.ts:47-49` geometry; `:53-54` heights >= 44; `:56-57` order (lines unchanged by the fix) | PASS |
| C19 | blush background, cherry Apagar, on-accent text, light and dark | playwright `confirm colours match historico (light)`/`(dark)` exit 0 | `e2e/apagar-treino.spec.ts:65` BLUSH; `:67` CHERRY; `:68` ON_ACCENT | PASS |
| C20 | dot look kept, label at Tuesday's y and height within 0.5 px, no native chrome, keyboard focus outline | playwright `strip day button keeps its look` exit 0 | `e2e/apagar-treino.spec.ts:76-79` dot background/max-width/weight/colour; `:84-85` dot width and y vs Tuesday; `:89` `Math.abs(label.y - tueLabel.y)).toBeLessThanOrEqual(0.5)`; `:90` `Math.abs(label.height - tueLabel.height)).toBeLessThanOrEqual(0.5)`; `:91-92` transparent, 0px border; `:96` outline-style not "none" (verified at e14d261) | PASS |
| C21 | Histórico confirm text unchanged | vitest `apagar asks first` exit 0 | `src/App.test.tsx:1734` `getByText("Apagar a medição de 30/09?")` | PASS |
| C22 | existing strip test unchanged | vitest `week strip marks letters, today and future` exit 0 | `src/App.test.tsx:203-208` letters, aria-current, data-future | PASS |

Each check's claim, as worded, is proven. The remaining gap is AC 18's label colour, which no check claims. It is recorded under Coverage and Faults, not as a failed check row.

## Coverage

*Row "strip day button look" recomputed at e14d261, the row the fix touched. Other rows carried from 1645c5f. The fix added no branch and changed no source, so no other row's members changed.*

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| strip day kinds (4) | AC 1-2 | past with Completion C2 · without C2 · today with Completion C2 (seed now A on FRI, `:2393`) · future C2, C22 | - |
| confirm exits (4) | AC 4-6 | Apagar C7 · Cancelar C5 · same day again C5 · another day C6 | - |
| confirm hidden on day change (1) | AC 9 | C11 | - |
| workouts per day (2) | AC 3 | one C3 · two C4 | - |
| re-derived views (5) | AC 7, 10, 12 | dot C7, C13 · Esta semana C7, C13 · streak C8 · próximo C7, C13 · empty label C9 | - |
| Hoje after today's removal (2) | AC 8 | training day C9 · rest day C10 | - |
| uncheck cases (3) | AC 11, 13 | completed today C12 · re-check C14 · another workout C15 | - |
| outputs of the uncheck path (3) | AC 12 | re-derive C13 · no toast C13 · no celebration C13 | - |
| record fields kept (7) | AC 14-15 | version/key C17 · weights C16, C17 · restSeconds, measurements, reminder C17 · today C9, C17 · other Completions C1, C17 | - |
| confirm arrangement (5) | AC 16 | between C3, C18 · full width C18 · order C18 · wrap `.confirm` flex-wrap `src/index.css:170` · 44 px C18 | - |
| colour schemes (2) | AC 17 | light C19 · dark C19 | - |
| strip day button look (6) - verified at e14d261 | AC 18 ("dot, letter and label look ... focus ring"); members read off the label and dot in `src/components/Progress.tsx:45` and `.day button` in `src/index.css:202` | dot size/position C20 `:84-85` · dot and letter colour/weight C20 `:76-79` · label position C20 `:89` · label height C20 `:90` · focus ring C20 `:96` · label colour: no proof (mutant `color: inherit` -> `var(--ink)` survives) | label colour on a button day - no assertion |
| DeleteConfirm callers (3) | Impact row; AC 19 | Histórico C21 · MeasureForm `src/App.test.tsx:1892` · strip C3 | - |

Sweep for sets with no row: carried from 1645c5f. Surface, Relations and Landing are "None". `Swept existing` (failure modes) was checked in round 1 at `src/App.tsx:23,152`. The fix did not touch `App.tsx`.

## Test policy rows

*carried from 1645c5f.* `checks.md` has a Test policy section with no rows. It defers to repo convention, and the fix does not change which layer any proof sits at. No row verdicts are owed.

## Faults injected

*verified at e14d261.* Faults were injected in a scratch worktree (`git worktree add --detach <scratchpad>/wt HEAD`) with `node_modules` symlinked. Playwright ran with `CI=1`, so it started its own server from the scratch tree and did not reuse an existing one. The worktree was removed afterwards. The real tree's `git status --porcelain` matched the baseline (`?? .playwright-mcp/`). Proof run each time: `pnpm exec playwright test e2e/apagar-treino.spec.ts -g "strip day button keeps its look"`.

| Mutation | Location | Killed |
| --- | --- | --- |
| round 1 survivor, re-injected: `.day button` `display: flex; flex-direction: column` -> `display: block` | `src/index.css:202` | yes - C20 failed at `e2e/apagar-treino.spec.ts:89` (label y off by 2, expected <= 0.5) |
| new label surface: `.day button` `gap: 4px` -> `gap: 8px` | `src/index.css:202` | yes - C20 failed at `:89` (label y off by 4) |
| new label surface: `.day button` adds `line-height: 1` | `src/index.css:202` | yes - C20 failed at `:90` (label height off by 5.39) |
| new label surface: `.day button` `color: inherit` -> `color: var(--ink)`. Probe at HEAD: Wed, Tue and Mon labels all rgb(141, 90, 99). Under the mutant: Wed and Mon rgb(58, 17, 24), Tue rgb(141, 90, 99) | `src/index.css:202` | no - survived; C20 asserts the label's box but not its colour |

Round 1's other five faults (`store.ts:109`, `App.tsx:63`, `App.tsx:74`, `Progress.tsx:56`, `index.css:202` background) are carried from 1645c5f, all killed. The fix touched none of that source, and their proofs re-ran green above.

## Gate

*verified at e14d261.*

- `pnpm vitest run` - 236 passed, 0 failed (12 files)
- `pnpm exec playwright test e2e/apagar-treino.spec.ts` - 4 passed, 0 failed

**Ranked gaps**
1. A surviving colour mutant on `.day button` (`src/index.css:202`): changing `color: inherit` re-colours a button day's label with nothing to catch it. Gap in AC 18 ("label look") and C20 (`e2e/apagar-treino.spec.ts:72-97`). Suggested fix: in C20, assert the Wednesday label's computed `color` equals Tuesday's label's, alongside `:89-90`, and extend C20's claim text to match.
2. Round 1's precision note, part resolved: C2's seed now matches its wording (`src/App.test.tsx:2393`). C21's check text still uses 30/09 where AC 19's example says 08/10. The claim still holds and this does not fail on its own.
