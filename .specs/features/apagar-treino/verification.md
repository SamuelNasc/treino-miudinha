# Apagar treino verification

**Verdict**: FAIL
**Profile**: ui
**Diff range**: 2d76590..1645c5f
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier)

One gap fails the feature: a layout mutant on the strip day button's CSS survived (see Faults injected). It moves the button day's label up 2 px and shrinks its line box from 17.4 px to 13 px. No check asserts the label, although AC 18 names it ("keep the dot, letter and label look"). Every one of the 22 proofs is green at HEAD and each has a located assertion.

## Binding sources

No binding design source and no mockup. The plan copies Histórico's confirm, which is already verified, and the style checks compare against that confirm. I opened `.specs/features/historico/plan.md` (AC 10, 29), `e2e/historico.spec.ts:12-14,119` and `src/index.css:170-172`, and compared them with the plan's AC 16-17 and checks C18-C21.

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| Histórico confirm (reference, not a design): `.specs/features/historico/plan.md` AC 10/29, `e2e/historico.spec.ts:119`, `src/index.css:170-172` | yes | none. `--blush` #ffe1e6/#3a141c and `--cherry` #b3122e/#ff5c75 match `e2e/historico.spec.ts:12-14`. Order question -> "Apagar" -> "Cancelar" and 44 px buttons match `.confirm` | - |
| Plan screens (no design): Hoje strip + confirm, Histórico confirm text | yes | none | strip day button: the label's look (AC 18) has no assertion. See Coverage |

What the plan decides on each screen, enumerated:
- **Hoje, strip:** 7 days. Only days with a Completion are buttons (C2), named "Apagar treino de ddd, dd/mm" (C2). Dot, letter and label unchanged (C20, C22, except the label's look). Focus ring (C20).
- **Hoje, confirm:** one region directly below the strip and above the Picker (C3, C18), full strip width (C18). One group per workout, stacked in the order recorded (C4). Each group reads question, then "Apagar", then "Cancelar" in one wrapping row (C3, C18). Buttons at least 44 px (C18). Colours (C19).
- **Hoje, after removal:** toast "Treino apagado" (C7). Dot, "Esta semana", streak, "próximo" (C7, C8). Empty label (C9). Training-day card (C9) or rest card (C10).
- **Histórico:** confirm text "Apagar a medição de dd/mm?" (C21). The MeasureForm caller is also covered by the existing test at `src/App.test.tsx:1892`.

## Checks

All vitest proofs ran in one invocation: `pnpm vitest run src/domain/store.test.ts src/App.test.tsx -t "<19 names alternated>" --reporter=verbose`. Exit 0, 19 passed, each listed by name. Playwright: `pnpm exec playwright test e2e/apagar-treino.spec.ts -g "<3 names>"`. Exit 0, 4 passed (the colour test runs once per scheme). Every named test is new in the diff except C21 and C22, which are pre-existing regression proofs by design.

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | removes exactly one (date, workout); rest of record kept; absent pair is a no-op | vitest `removeCompletion drops exactly one pair` exit 0 | `src/domain/store.test.ts:206` `expect(out.completions).toEqual([A 10-05, C 10-07])`; `:210` `expect({ ...out, completions: r.completions }).toEqual(r)`; `:211` no-op | PASS |
| C2 | only Mon and Wed are buttons, with exact names; today with a Completion is a button | vitest `strip days with a workout are buttons` exit 0 | `src/App.test.tsx:2387` aria-labels `toEqual(["Apagar treino de seg, 05/10","Apagar treino de qua, 07/10"])`; `:2395` "Apagar treino de sex, 09/10". The check says "A on FRI", the test seeds C on FRI; same claim | PASS |
| C3 | confirm text and buttons, placed after the strip and before the Picker, nothing stored | vitest `tapping a day asks first` exit 0 | `src/App.test.tsx:2406` `toHaveTextContent(B_WED)`; `:2410-2411` DOCUMENT_POSITION_FOLLOWING strip->group->picker; `:2412` `stored()` equals before | PASS |
| C4 | two workouts on one day give two confirms, A then B | vitest `one confirm per workout of the day` exit 0 | `src/App.test.tsx:2423` `a.compareDocumentPosition(b) & FOLLOWING` | PASS |
| C5 | Cancelar or a second tap hides the confirm, record unchanged | vitest `cancelar or a second tap keeps the workout` exit 0 | `src/App.test.tsx:2435,2440` `queryByRole("group",{name:B_WED})).toBeNull()`; `:2436,2441` `stored()).toEqual(before)` | PASS |
| C6 | another day replaces the confirm | vitest `another day replaces the confirm` exit 0 | `src/App.test.tsx:2451-2452` | PASS |
| C7 | Apagar removes, hides the confirm, shows the toast, re-derives dot/count/próximo | vitest `apagar removes the workout and re-derives` exit 0 | `src/App.test.tsx:2462` completions `[A 10-05]`; `:2464` status "Treino apagado"; `:2467` "Esta semana: 1/4"; `:2468` B "próximo" | PASS |
| C8 | streak 3 -> 2, count 3/4 -> 2/4 | vitest `removing a workout lowers the streak` exit 0 | `src/App.test.tsx:2489` streak-number "2"; `:2490` "Esta semana: 2/4" | PASS |
| C9 | today's removal clears today; card A 0/6; "Comece hoje 💪" | vitest `removing today's workout clears its checks` exit 0 | `src/App.test.tsx:2501` `today` toEqual `{date:FRI,workout:null,checked:[]}`; `:2502-2503` heading "Treino A", "0/6"; `:2504` "Comece hoje 💪" | PASS |
| C10 | rest day after today's removal shows the rest card | vitest `removing today's workout on a rest day shows rest` exit 0 | `src/App.test.tsx:2515` heading "Hoje é descanso"; `:2517` no "Treino B" | PASS |
| C11 | day change hides the confirm | vitest `a new day hides the confirm` exit 0 | `src/App.test.tsx:2531` `queryByRole("group",{name:B_WED})).toBeNull()` | PASS |
| C12 | uncheck removes today's B, keeps the other checks | vitest `unchecking undoes today's workout` exit 0 | `src/App.test.tsx:2552` completions `[A 10-05]`; `:2554` checked = B ids minus voador | PASS |
| C13 | quiet re-derive: dot, 1/4, próximo, no toast, no celebration | vitest `unchecking re-derives quietly` exit 0 | `src/App.test.tsx:2563-2565`; `:2566` `queryByRole("status")).toBeNull()`; `:2567` `queryByRole("dialog")).toBeNull()` | PASS |
| C14 | re-check records B again and celebrates | vitest `checking again records it again` exit 0 | `src/App.test.tsx:2577` completions `[A, B FRI]`; `:2578` "Treino B feito." | PASS |
| C15 | unchecking another workout keeps today's Completion | vitest `unchecking another workout keeps today's completion` exit 0 | `src/App.test.tsx:2588` `toEqual([c(FRI,"B")])` | PASS |
| C16 | weights unchanged by both removal paths | vitest `removal keeps weights` exit 0 | `src/App.test.tsx:2599,2601` `stored().weights).toEqual(weights)` | PASS |
| C17 | version 1, every key but completions kept | vitest `removal keeps the rest of the record` exit 0 | `src/App.test.tsx:2622` `after.version).toBe(1)`; `:2623` `{...after, completions: before.completions}).toEqual(before)` | PASS |
| C18 | confirm between strip and Picker, full width, 44 px buttons, order | playwright `confirm sits between strip and picker` exit 0 | `e2e/apagar-treino.spec.ts:47-49` geometry; `:53-54` heights >= 44; `:56-57` order | PASS |
| C19 | blush background, cherry Apagar, on-accent text, light and dark | playwright `confirm colours match historico (light)`/`(dark)` exit 0 | `e2e/apagar-treino.spec.ts:65` BLUSH; `:67` CHERRY; `:68` ON_ACCENT | PASS |
| C20 | dot look kept, no native border/background, keyboard focus outline | playwright `strip day button keeps its look` exit 0 | `e2e/apagar-treino.spec.ts:77` max-width 42px; `:84-85` same size and y as Tuesday's dot; `:86-87` transparent, 0px border; `:91` outline-style not "none" | PASS |
| C21 | Histórico confirm text unchanged | vitest `apagar asks first` exit 0 | `src/App.test.tsx:1734` `getByText("Apagar a medição de 30/09?")`. AC 19 gives 08/10 as an example; same format | PASS |
| C22 | existing strip test unchanged | vitest `week strip marks letters, today and future` exit 0 | `src/App.test.tsx:203-208` letters, aria-current, data-future. `git diff 2d76590..HEAD -- src/App.test.tsx` touches only the appended describe | PASS |

## Coverage

Recomputed from the plan's criteria (AC 1-19), not from the author's table. The full vitest suite is 236/236 green.

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| strip day kinds (4) | AC 1-2 | past day with a Completion: C2. Day without: C2. Today with a Completion: C2. Future: C2, C22 | - |
| confirm exits (4) | AC 4-6 | Apagar: C7. Cancelar: C5. Same day again: C5. Another day: C6 | - |
| confirm hidden on day change (1) | AC 9 | C11 | - |
| workouts per day (2) | AC 3 | one: C3. Two, in order: C4 | - |
| re-derived views (5) | AC 7, 10, 12 | dot: C7, C13. Esta semana: C7, C13. Streak: C8. Próximo: C7, C13. Empty label: C9 | - |
| Hoje after today's removal (2) | AC 8 | training day: C9. Rest day: C10 | - |
| uncheck cases (3) | AC 11, 13 | completed today: C12. Re-check: C14. Another workout: C15 | - |
| outputs of the uncheck path (3) | AC 12 | re-derive: C13. No toast: C13. No celebration: C13 | - |
| record fields kept (7) | AC 14-15 | version/key: C17. Weights: C16, C17. restSeconds, measurements, reminder: C17. Today: C9, C17. Other Completions: C1, C17 | - |
| confirm arrangement (5) | AC 16 | between strip and Picker: C3, C18. Full width: C18. Order: C18. Wrap: `.confirm` flex-wrap, `src/index.css:170`. 44 px: C18 | - |
| colour schemes (2) | AC 17 | light: C19. Dark: C19 | - |
| strip day button look (4) | AC 18 ("dot, letter and label look ... focus ring") | dot: C20. Letter: C20 (colour, weight). Focus ring: C20. Label: no proof (the layout mutant below moves it and survives) | label look on a button day - no assertion |
| DeleteConfirm callers (3) | Impact row "DeleteConfirm"; AC 19 | Histórico row: C21. MeasureForm edit: existing `src/App.test.tsx:1892`. Strip: C3 | - |

Sweep for sets with no row: Surface, Relations and Landing are all "None". No route, status or entity constraint is owed.

`Swept existing`, re-read: failure modes holds. `useRecord` returns `notSaving` (`src/App.tsx:23`), and the warning renders at `src/App.tsx:152`. The `n/a` rows are policy.

## Test policy rows

`checks.md` has a Test policy section but no rows. It defers to repo convention: domain rules in `src/domain/*.test.ts`, behaviour through `App`, layout and colour in Playwright. The proofs follow that convention: C1 at the domain layer, C2-C17 and C21-C22 through `App`, C18-C20 in Playwright. With no rows, I have no row verdicts to give.

## Faults injected

Each fault was injected in a scratch worktree (`git worktree add --detach`) and discarded afterwards. The real tree's porcelain matched the baseline (`?? .playwright-mcp/`) after every run.

| Mutation | Location | Killed |
| --- | --- | --- |
| `removeCompletion` filter `&&` -> `\|\|` (drops every match on the date or the workout) | `src/domain/store.ts:109` | yes - C1 failed |
| uncheck branch in `toggle` disabled (`else if (false)`) | `src/App.tsx:63` | yes - C12 failed |
| `removeWorkout` never clears today's session (`ownSession = false`) | `src/App.tsx:74` | yes - C9 failed |
| strip tap no longer toggles (`setAsking(d.date)`) | `src/components/Progress.tsx:56` | yes - C5 failed |
| `.day button` `background: none` -> `var(--surface)` | `src/index.css:202` | yes - C20 failed (expected rgba(0, 0, 0, 0), got rgb(255, 255, 255)) |
| `.day button` `display: flex; flex-direction: column` -> `display: block`. Probe: Wed label y 445.75 -> 443.75, height 17.39 -> 13; the dot is unchanged | `src/index.css:202` | no - survived; C20 asserts only the dot and the button chrome |

Equivalent mutant, not counted: deleting `border: 0; background: none` from `.day button` leaves C20 green, because Tailwind preflight (`@import "tailwindcss"`) already resets buttons to a transparent background and 0 border. So the declaration is redundant, not untested. The background-value mutation above shows C20 kills a real change on that surface.

## Gate

- `pnpm vitest run` - 236 passed, 0 failed
- `pnpm exec playwright test e2e/apagar-treino.spec.ts` - 4 passed, 0 failed

**Ranked gaps**
1. A layout mutant on `.day button` survives. A button day's label shifts and its line box shrinks, and nothing asserts it. The gap is in AC 18 (label look) and check C20, at `e2e/apagar-treino.spec.ts:72-92`. Suggested fix: in C20, assert the Wednesday label's box (y and height) against Tuesday's, as `:84-85` already does for the dot.
2. Precision note (does not fail on its own): C2's check text seeds "A on FRI" but `src/App.test.tsx:2393` seeds C on FRI. C21's check text uses 30/09 where AC 19's example says 08/10. The claims still hold; align the wording.
