# Apagar treino verification

**Verdict**: PASS
**Profile**: ui
**Diff range**: 2d76590..51fb95b (fix under review: e14d261..51fb95b)
**Round**: 3 - scoped
**Verifier**: independent sub-agent, round 3 Verifier (author != verifier; did not write 1645c5f, e14d261 or 51fb95b)

The fix closes round 2's gap. Round 2's surviving colour mutant (`.day button` `color: inherit` -> `color: var(--ink)`) is now killed by C20's new type and colour assertion at `e2e/apagar-treino.spec.ts:93`. Faults on the new surface were killed too: a font-weight change and a font-family change, both at `:93`, and a font-size change at `:90`. A fourth fault, removing `font: inherit`, turned out to be an equivalent mutant: Tailwind's preflight already gives every button `font: inherit`, so the label's computed type stays the same and nothing could detect it. That is not a gap.

All 22 proofs are green at 51fb95b. The full vitest suite passes (236 of 236).

Scope of this round: the fix's diff (`git diff e14d261..51fb95b --stat`) touches `e2e/apagar-treino.spec.ts` (C20, +4 lines), `checks.md` (C20 claim text), round 2's `verification.md`, and the lessons files (`.specs/lessons.json`, `.specs/LESSONS.md`). No file under `src/` changed. Everything the diff could not touch is carried forward and marked as such.

## Binding sources

*Carried from 1645c5f.* The fix does not touch the interface or any screen's code, so step 1 is not re-run. The one uncovered item recorded in round 2 (the label colour on a button day, AC 18) is now covered by C20 at `e2e/apagar-treino.spec.ts:93`. It was re-judged under Coverage below, verified at 51fb95b.

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| Histórico confirm (reference, not a design): `.specs/features/historico/plan.md` AC 10/29, `e2e/historico.spec.ts:119`, `src/index.css:170-172` | yes (round 1, at 1645c5f) | none | - |
| Plan screens (no design): Hoje strip + confirm, Histórico confirm text | yes (round 1; AC 18 re-read at 51fb95b) | none | - |

## Checks

*Proofs re-run in full at 51fb95b. Citations in `e2e/apagar-treino.spec.ts` were refreshed (the only touched test file). Citations in `src/App.test.tsx` and `src/domain/store.test.ts` are carried from e14d261: neither file changed, and the `it(` lines were re-located with `rg -n` at 51fb95b and are unchanged (for example `src/App.test.tsx:2383`, `:2604`, `src/domain/store.test.ts:194`).*

Vitest, one invocation: `pnpm vitest run src/App.test.tsx src/domain/store.test.ts -t "<19 names alternated, taken from checks.md>" --reporter=verbose`. Exit 0. All 19 named tests are listed individually as passed. Playwright: `pnpm exec playwright test e2e/apagar-treino.spec.ts --reporter=list`. Exit 0, 4 passed: C18 (`:41`), C19 light and dark (`:61`), C20 (`:72`).

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | removes exactly one (date, workout); rest of record kept; absent pair is a no-op | vitest `removeCompletion drops exactly one pair` exit 0 | `src/domain/store.test.ts:206` `expect(out.completions).toEqual([A 10-05, C 10-07])`; `:210` rest of record equal; `:211` no-op | PASS |
| C2 | only Mon and Wed are buttons, with exact names; A on FRI makes Friday a button | vitest `strip days with a workout are buttons` exit 0 | `src/App.test.tsx:2387` aria-labels `toEqual(["Apagar treino de seg, 05/10","Apagar treino de qua, 07/10"])`; `:2391` days 1,3,4,5,6 `queryByRole("button")).toBeNull()`; `:2395` button "Apagar treino de sex, 09/10" | PASS |
| C3 | confirm text and buttons, after strip and before Picker, nothing stored | vitest `tapping a day asks first` exit 0 | `src/App.test.tsx:2406` `toHaveTextContent(B_WED)`; `:2410-2411` DOCUMENT_POSITION_FOLLOWING; `:2412` `stored()` equals before | PASS |
| C4 | two workouts on one day give two confirms, A then B | vitest `one confirm per workout of the day` exit 0 | `src/App.test.tsx:2423` `a.compareDocumentPosition(b) & FOLLOWING` | PASS |
| C5 | Cancelar or a second tap hides the confirm, record unchanged | vitest `cancelar or a second tap keeps the workout` exit 0 | `src/App.test.tsx:2435,2440` group `toBeNull()`; `:2436,2441` `stored()).toEqual(before)` | PASS |
| C6 | another day replaces the confirm | vitest `another day replaces the confirm` exit 0 | `src/App.test.tsx:2451-2452` | PASS |
| C7 | Apagar removes, hides, toast, re-derives dot/count/próximo | vitest `apagar removes the workout and re-derives` exit 0 | `src/App.test.tsx:2462` completions `[A 10-05]`; `:2464` status "Treino apagado"; `:2467` "Esta semana: 1/4"; `:2468` B "próximo" | PASS |
| C8 | streak 3 -> 2, count 3/4 -> 2/4 | vitest `removing a workout lowers the streak` exit 0 | `src/App.test.tsx:2489` streak-number "2"; `:2490` "Esta semana: 2/4" | PASS |
| C9 | today's removal clears today; card A 0/6; "Comece hoje 💪" | vitest `removing today's workout clears its checks` exit 0 | `src/App.test.tsx:2501` `today` toEqual `{date:FRI,workout:null,checked:[]}`; `:2502-2503`; `:2504` | PASS |
| C10 | rest day after today's removal shows the rest card | vitest `removing today's workout on a rest day shows rest` exit 0 | `src/App.test.tsx:2515` heading "Hoje é descanso"; `:2517` heading "Treino B" absent | PASS |
| C11 | day change hides the confirm | vitest `a new day hides the confirm` exit 0 | `src/App.test.tsx:2531` group `toBeNull()` | PASS |
| C12 | uncheck removes today's B, keeps the other checks | vitest `unchecking undoes today's workout` exit 0 | `src/App.test.tsx:2552` completions `[A 10-05]`; `:2554` checked = B ids minus voador | PASS |
| C13 | quiet re-derive: dot, 1/4, próximo, no toast, no celebration | vitest `unchecking re-derives quietly` exit 0 | `src/App.test.tsx:2563-2565`; `:2566` `queryByRole("status")).toBeNull()`; `:2567` `queryByRole("dialog")).toBeNull()` | PASS |
| C14 | re-check records B again and celebrates | vitest `checking again records it again` exit 0 | `src/App.test.tsx:2577` completions `[A, B FRI]`; `:2578` "Treino B feito." | PASS |
| C15 | unchecking another workout keeps today's Completion | vitest `unchecking another workout keeps today's completion` exit 0 | `src/App.test.tsx:2588` `toEqual([c(FRI,"B")])` | PASS |
| C16 | weights unchanged by both removal paths | vitest `removal keeps weights` exit 0 | `src/App.test.tsx:2599,2601` `stored().weights).toEqual(weights)` | PASS |
| C17 | version 1, every key but completions kept | vitest `removal keeps the rest of the record` exit 0 | `src/App.test.tsx:2622` `after.version).toBe(1)`; `:2623` | PASS |
| C18 | confirm between strip and Picker, full width, 44 px buttons, order | playwright `confirm sits between strip and picker` exit 0 | `e2e/apagar-treino.spec.ts:47-49` geometry; `:53-54` heights >= 44; `:56-57` order (lines unchanged by the fix) | PASS |
| C19 | blush background, cherry Apagar, on-accent text, light and dark | playwright `confirm colours match historico (light)`/`(dark)` exit 0 | `e2e/apagar-treino.spec.ts:65` BLUSH; `:67` CHERRY; `:68` ON_ACCENT (lines unchanged by the fix) | PASS |
| C20 | dot look kept; label at Tuesday's y and height within 0.5 px with the same computed colour, font-size, font-weight, font-family; no native chrome; keyboard focus outline | playwright `strip day button keeps its look` exit 0 | `e2e/apagar-treino.spec.ts:76-79` dot background/max-width/weight/colour; `:84-85` dot width and y vs Tuesday; `:89-90` label y and height vs Tuesday within 0.5; `:92-93` `for (const prop of ["color", "font-size", "font-weight", "font-family"]) expect(await css(button.getByTestId("day-label"), prop), prop).toBe(await css(tueLabelEl, prop))`; `:95-96` transparent, 0px border; `:100` outline-style `not.toBe("none")` (verified at 51fb95b) | PASS |
| C21 | Histórico confirm text unchanged | vitest `apagar asks first` exit 0 | `src/App.test.tsx:1734` `getByText("Apagar a medição de 30/09?")` | PASS |
| C22 | existing strip test unchanged | vitest `week strip marks letters, today and future` exit 0 | `src/App.test.tsx:203-208` letters, aria-current, data-future | PASS |

## Coverage

*Row "strip day button look" recomputed at 51fb95b, because the fix touched it. The other rows are carried from e14d261: the fix added no branch and changed no source, so their members did not change.*

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| strip day kinds (4) | AC 1-2 | past with Completion C2 · without C2 · today with Completion C2 · future C2, C22 | - |
| confirm exits (4) | AC 4-6 | Apagar C7 · Cancelar C5 · same day again C5 · another day C6 | - |
| confirm hidden on day change (1) | AC 9 | C11 | - |
| workouts per day (2) | AC 3 | one C3 · two C4 | - |
| re-derived views (5) | AC 7, 10, 12 | dot C7, C13 · Esta semana C7, C13 · streak C8 · próximo C7, C13 · empty label C9 | - |
| Hoje after today's removal (2) | AC 8 | training day C9 · rest day C10 | - |
| uncheck cases (3) | AC 11, 13 | completed today C12 · re-check C14 · another workout C15 | - |
| outputs of the uncheck path (3) | AC 12 | re-derive C13 · toast absent C13 · celebration absent C13 | - |
| record fields kept (7) | AC 14-15 | version/key C17 · weights C16, C17 · restSeconds, measurements, reminder C17 · today C9, C17 · other Completions C1, C17 | - |
| confirm arrangement (5) | AC 16 | between C3, C18 · full width C18 · order C18 · wrap `.confirm` flex-wrap `src/index.css:170` · 44 px C18 | - |
| colour schemes (2) | AC 17 | light C19 · dark C19 | - |
| strip day button look (7) - verified at 51fb95b | AC 18 ("dot, letter and label look ... focus ring"). Members read off the dot and label spans in `src/components/Progress.tsx:42-45` and the declarations of `.day button` in `src/index.css:202`, against the inherited `.day` rule at `:195` (`font-size: 12px; color: var(--muted)`) and `.day.today` at `:200` | dot size/position C20 `:84-85` · dot and letter colour/weight C20 `:76-79` · label position C20 `:89` · label height C20 `:90` · label colour C20 `:93` (round 2 mutant killed) · label type (size, weight, family) C20 `:93`, size also `:90` · no native chrome and focus ring C20 `:95-96`, `:100` | - |
| DeleteConfirm callers (3) | Impact row; AC 19 | Histórico C21 · MeasureForm `src/App.test.tsx:1892` · strip C3 | - |

Sweep for sets with no row: carried from 1645c5f. Surface, Relations and Landing are "None". `Swept existing` (failure modes) was checked in round 1 at `src/App.tsx:23,152`. No later fix touched `App.tsx`.

Residual note, not a gap: C20 compares Wednesday's label against Tuesday's in the light scheme only, with Friday (today) as a non-button day. `.day.today` (`src/index.css:200`) changes colour and weight on today's `li`, and today's button inherits them through `color: inherit` and `font: inherit`. That path is the same inheritance C20 now pins on Wednesday, so it is covered by the same mechanism, though not asserted on a today-button directly. AC 18 does not name a scheme for the label, and the label's colour comes from the `--muted` token in both schemes.

## Test policy rows

*Carried from 1645c5f.* `checks.md` has a Test policy section with no rows. It defers to repo convention, and the fix does not change which layer any proof sits at. No row verdicts are owed.

## Faults injected

*Verified at 51fb95b.* Faults were injected in a scratch worktree (`git worktree add --detach <scratchpad>/wt HEAD`) with `node_modules` symlinked. Playwright ran with `CI=1`, so `reuseExistingServer` was false (`playwright.config.ts:13`) and it served the scratch tree. Each fault was applied to `src/index.css:202` with `sed`, then reverted from a copy before the next one. Afterwards the worktree was removed (`git worktree remove --force`, `git worktree prune`; `git worktree list` shows only the main tree). The real tree's `git status --porcelain` matched the baseline (`?? .playwright-mcp/`). Proof run each time: `CI=1 pnpm exec playwright test e2e/apagar-treino.spec.ts -g "strip day button keeps its look"`.

| Mutation | Location | Killed |
| --- | --- | --- |
| round 2 survivor, re-injected: `.day button` `color: inherit` -> `color: var(--ink)` | `src/index.css:202` | yes - C20 failed at `e2e/apagar-treino.spec.ts:93` (`color`: expected rgb(141, 90, 99), received rgb(58, 17, 24)) |
| new type surface: `.day button` adds `font-weight: 700` after `font: inherit` | `src/index.css:202` | yes - C20 failed at `:93` (`font-weight`: expected "400", received "700") |
| new type surface: `.day button` adds `font-family: var(--display)` after `font: inherit` | `src/index.css:202` | yes - C20 failed at `:93` (`font-family`: expected DM Sans Variable stack, received Fredoka stack) |
| new type surface: `.day button` adds `font-size: 13px` after `font: inherit` | `src/index.css:202` | yes - C20 failed at `:90` (label height off by 1.45, expected <= 0.5), before reaching `:93` |
| `.day button` `font: inherit` removed | `src/index.css:202` | equivalent mutant - C20 stays green because Tailwind's preflight (`@import "tailwindcss"` at `src/index.css:1`; `node_modules/tailwindcss/preflight.css:243-249` sets `font: inherit` on `button`) already gives the button the same computed font, so the label's rendering is identical and any test would pass |

Round 1's other five faults (`store.ts:109`, `App.tsx:63`, `App.tsx:74`, `Progress.tsx:56`, `index.css:202` background) and round 2's gap, gap-size and line-height faults are carried from 1645c5f and e14d261. All were killed. The fix touched none of that source, and their proofs re-ran green above.

## Gate

*Verified at 51fb95b.*

- `pnpm vitest run` - 236 passed, 0 failed (12 files)
- `pnpm exec playwright test e2e/apagar-treino.spec.ts` - 4 passed, 0 failed

**Remaining notes (do not fail the feature)**
1. C21's check text uses 30/09 where AC 19's example says 08/10. The claim, as worded, holds (`src/App.test.tsx:1734`). Carried from round 1.
2. The `font: inherit` declaration on `.day button` (`src/index.css:202`) is redundant with Tailwind's preflight, and so is `color: inherit`. They are harmless and kept as explicit intent. If the preflight were ever removed, C20 `:93` would catch the change.
