# Histórico verification

**Verdict**: PASS
**Profile**: ui
**Diff range**: 27447a4..38ec089 (HEAD). The fix under review is b834871..38ec089 (commit 38ec089)
**Round**: 2 - scoped
**Verifier**: independent sub-agent (author != verifier). Fresh context. It did not build the feature, write its checks or write the round-1 fix, and it changed no file except this report

## Summary

Round 2 closes both round-1 findings. The scoped review found no new failure.

- **All 35 checks are proven at `38ec089`**, each with a located assertion. Both proof batches ran on the real tree.
- **The 28 unaccounted mockup v6 values are now all asserted.** C32-C35 cover them. The out-of-reach list at `checks.md:165` now names the empty state's padding correctly. Recomputed from the mockup, the Histórico section has 95 decided values: 76 asserted, 19 out of reach, 0 neither.
- **Probes P1-P8 were re-applied.** Each one is killed when it is applied in a form that changes the page. P1 and P8 as written in round 1 (delete `padding: 0` or `margin: 0`) change nothing in this app. Tailwind's preflight already sets those values (`node_modules/tailwindcss/preflight.css:7-16`), so they are equivalent mutants. The forms that do change the page (a 40px indent) are killed. See "Faults injected".
- **The two user decisions of 2026-10-09 are in place.**
  - The empty state draws the mockup's divider: `src/index.css:132`, AC 30 (`plan.md:121`), C35.
  - "Fazer a primeira" keeps typed values. It is recorded as a confirmed Assumption at `plan.md:148`, so the AC 3 / C3 contradiction is resolved.
- **Faults.** 39 mutations were run in a scratch worktree: 37 killed, and 2 equivalent mutants with no effect on the page. A further 2 precision probes survived (Q1, Q2). They are recorded as notes, not findings; the reasoning is under "Faults injected".

## Round 1 record (carried from b834871, summary)

Round 1 ran on `27447a4..d91b1a1` and returned **FAIL**.

- **What passed.** All 31 checks (C1-C31) were proven with located evidence. All 5 behaviour faults (F1-F5) were killed. The gate was green: Vitest 183, Playwright 45.
- **Finding 1.** 28 of 95 mockup v6 values in the Histórico section were neither asserted nor named out of reach. Probes P1-P8 on them all survived.
- **Finding 2.** The empty state lacked the mockup's row divider, because the mockup draws it as an `li` of `.hist`. Also, `checks.md` stated the empty state's padding as `10px 0 14px`, but the mockup renders `4px 0 8px`.
- **Finding 3.** AC 3 / C3 contradicted mockup v6, which resets an open form on "Fazer a primeira". The plan did not record this as an Assumption.
- **Notes carried, not failing.**
  - AC 16 / C15 closes the form when its entry is deleted from a row. The mockup's behaviour here is a defect: saving throws at l.846. This is still not recorded as an Assumption.
  - C28's `:95` assertion holds only when the fontsource fonts load, which needs a real `node_modules`.
  - The lessons step was left to the orchestrator.

## Scope of this round

The scope follows `verify.md` "Re-verifying after a fix". It is set by the fix's diff and by the three non-PASS verdicts above.

The diff (`git diff --stat b834871..HEAD`) touches four files:

- `src/index.css`, 1 line: the `.empty` rule.
- `e2e/historico.spec.ts`, +98 lines, appended after `:215`. Lines 1-215 are unchanged.
- `checks.md`, which adds C32-C35, a Coverage row and the corrected out-of-reach list.
- `plan.md`, which adds AC 30 and two Assumption rows.

| Step | This round |
| --- | --- |
| Step 1 (binding sources) | Re-done for the Histórico section and the form's edit mode: the decided values, recomputed in full, and the empty state's composition, the one surface whose CSS changed. Verified at `38ec089` |
| Proofs | All 35 re-run at `38ec089` in 2 batched invocations |
| Citations | C32-C35 cited fresh. C1-C31: `src/App.test.tsx`, `src/domain/measurements.test.ts` and `e2e/historico.spec.ts:1-215` are untouched by the fix (the e2e hunk is `@@ -213,3 +213,101 @@`, pure append), so round 1's line numbers hold. They were re-confirmed against the output of this round's run |
| Coverage | The mockup-values row was recomputed. The colour-schemes row was recomputed, because C33-C35 join it. All other rows are carried from b834871 |
| Test policy | The "Histórico layout, type and colour" row classifies `src/index.css`, which the fix touched, so it is re-judged. The other two rows are carried |
| Faults | The surfaces the fix created were re-injected: C32-C35 and the `.empty` rule, plus P1-P8. The round-1 behaviour faults F1-F5 are carried |
| Swept existing | Carried from b834871. The fix touches no swept constraint |

## Binding sources

Verified at `38ec089`, for the surfaces in scope.

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| Mockup v6 Histórico styles. The local copy is `artifact-1d35028d-1791496183-91de.html`, opened and read this round. Rules: `.hist` l.219, `.hist li` l.220, `.row-head` l.221-225, `.vals` l.226-230, `.hist .acts` l.231-232, `.confirm` l.233-234, `.empty` l.235, `.ghost-btn` l.139, `.cta.small` l.160, `.cta` l.254, `.sec-head h2` l.191, `button { font: inherit; color: inherit }` l.56 (round 1 cited this as l.47), and the dark tokens l.32-35 | yes - read this round; 95 of 95 decided values are asserted (76) or named out of reach (19), see "Decided values". `src/index.css:115-133` matches l.219-235 rule for rule. The differences are the approved 44px floors, `.row-head { color: var(--ink) }` (inherited in the mockup) and `.empty`'s divider, which now reproduces the mockup's cascade (`.hist li` 0,1,1 over `.empty` 0,1,0) as `padding: 4px 0 8px; border-top: 1px solid var(--line)` at `src/index.css:132` | none | none |
| Mockup v6 markup and script: `#histTitle` section l.378-381, `renderHist` l.855-871, the `#hist` click handler l.873-880, and in the form `validate` l.818-824, `openForm` l.825-830, `closeForm` l.831 and the submit handler l.841-851 | yes | none. The round-1 contradiction is resolved. `#firstBtn` calls `openForm()` (l.858), which resets the date and fields (l.827-829). AC 3 / C3 keep the open form, and that is now the confirmed Assumption at `plan.md:148` ("y - Samuel, 2026-10-09"). The other deviations stand as approved in round 1: the 44px floor, confirm-before-delete in the form (AC 22), the locked date (AC 19), `/aa` on another year's date, and C30's declared-value reading of 1.5px | none |
| `.design/body-measurements.md` `### Histórico` (l.161-173) | carried from b834871 | none | - |

### Decided values in mockup v6, recomputed

Legend:

- **C#** means the member is asserted by that check, with the settling line.
- **OOR** means it is named at `checks.md:165`.
- **New** marks a member that was NONE in round 1.

**Histórico: 95 members. 76 are asserted, 19 are out of reach, and 0 are neither.**

| Rule (mockup line) | Members |
| --- | --- |
| `.hist` l.219 (4) | `list-style: none` C32 `e2e/historico.spec.ts:223` **new** · `margin: 0` C32 `:225` **new** · `padding: 0` C32 `:226` **new** · flex column C27 |
| `.hist li` l.220 (6) | flex column C28 · gap 10px OOR · padding OOR · border width C30 · border style `solid` C32 `:236` **new** · border colour C29 |
| `.row-head` l.221 (8) | grid `auto 1fr auto` C27 · `align-items` C27 · gap OOR · `border: 0` C27 · `background: none` C32 `:239` **new** · padding OOR · `text-align: left` C32 `:238` **new** (also `:243`, the date at the row's left) · `border-radius: 10px` C32 `:240` **new** |
| `.row-head .d` l.222 (4) | family, weight, size C30 · `tabular-nums` OOR |
| `.row-head .sum` l.223 (2) | size C30 · colour C29 |
| `.row-head svg` l.224 (3) | 16×16 C30 · colour C29 · transition OOR |
| `[aria-expanded="true"] svg` l.225 (1) | `rotate(180deg)` C33 `:255-260` (matrix a=d=-1, b=c=0) **new**. This closes the round-1 precision gap |
| `.vals` l.226 (6) | `margin: 0` C33 `:263` **new** · single column C28 (also OOR at `checks.md:165`) · `gap: 0` C33 `:264` **new** · background C29 · radius C30 · padding C30 |
| `.vals div` l.227 (7) | flex `space-between` C28 · gap 8px C33 `:266` **new** · size C30 · padding OOR · border width C30 · border style C33 `:267` **new** · border colour C33 `:268` **new** |
| `.vals div:first-child` l.228 (1) | C30 |
| `.vals dt` l.229 (1) | C29 |
| `.vals dd` l.230 (3) | `margin: 0` C33 `:269` **new** · weight C30 · `tabular-nums` OOR |
| `.hist .acts` l.231 (3) | flex row C28 · gap OOR · `flex-end` C28 |
| `.hist .acts button` l.232 (7) | border, size, weight C30 · background, colour C29 · padding OOR · radius OOR |
| `.confirm` l.233 (8) | flex row C28 · `align-items: center` C34 `:278` **new** · gap OOR · wrap OOR · background C29 · radius C30 · padding OOR · size C30. Not counted: `grid-column: 1 / -1`, which has no effect inside the flex `li` |
| `.confirm .danger` l.234 (6) | `border: 0` C34 `:279` **new** · fill, colour C29 · radius, weight C30 · padding OOR |
| "Cancelar" `.ghost-btn` l.139 (8) | width C30 (declared) · style `solid` C34 `:281` **new** · border colour C29 · background `--surface` C34 `:282` **new** (`#ffffff` / `#2a1016`, matching mockup l.10 and l.32) · size 14px C34 `:283` **new** · radius OOR · padding OOR · colour C29 |
| `.empty` l.235 (6) | `text-align` C31 · colour C29 · flex column C31 · `align-items` C31 · gap OOR. Padding: the rendered value is the row's `4px 0 8px`, and C35 asserts it at `:308-309` (the OOR entry is now stated correctly) |
| The empty state as drawn (l.857) (1) | the `.hist li` top divider: C35 `:305-307` **new**, in both schemes |
| "Fazer a primeira" `.cta` l.254 + `.cta.small` l.160 (9) | fill C29 · `border: 0` C34 `:289` · colour C34 `:290` · radius C34 `:291-292` · padding `9px 18px` C34 `:293-294` · family C34 `:295` · weight C34 `:296` · size C34 `:297` · margin C34 `:298`. All are **new** |
| `.sec-head h2` l.191 (1) | C30 |

Tally: round 1 had 48 asserted + 19 OOR + 28 neither = 95. The 28 new assertions give 76 + 19 + 0 = 95. Each new member's assertion was made to fail by a fault (see "Faults injected"), except the two that the preflight makes equivalent. For those two, an observable variant was killed.

**Form in edit mode.** Recomputed from the mockup script. It adds no style rule of its own. Each decided behaviour or copy is checked:

- the title "Editar dd/mm", l.828: C17
- the date set to the entry, l.827: C17. Its editability is the approved deviation C19
- the save button reads "Apagar medição" when all fields are blank, l.823: C21
- a blank edit stays enabled, while bad values disable it, l.822: C21 and C23
- the toasts "Medição apagada" and "Medição atualizada", l.846-847: C11, C20 and C22
- the toggle reads "Fechar", l.826: C24
- the form closes after submit, l.850: C20

0 members are uncovered.

**Composition of the empty state.** The fix touched this interface, so it was re-checked:

- The mockup draws the empty state as one `li` of `ul.hist`: a top divider, then the text above the button, both centred, with a 10px gap.
- The app renders `div.empty` (`src/components/History.tsx:64`) with the same divider, padding, centring and order. These are proven by C31 and C35.
- One difference is not visual: the mockup's empty state sits inside a list element, while AC 2 and C2 require "no list" (`src/App.test.tsx:1512`). This is ARIA semantics, not something the mockup draws. A list containing a single non-item message is the mockup's implementation shortcut. This is recorded as a note, not a contradiction.

## Checks

All proofs ran at `38ec089` on the real tree, in two batched invocations.

- **Vitest** ran the same command as round 1 (C1-C26): `pnpm vitest run src/App.test.tsx src/domain/measurements.test.ts --reporter=verbose -t "<the 26-name alternation in round 1>"`. Exit 0. 28 passed, each ✓ by name: the 3 tests under `edit measurement > …` and 25 under `Histórico > …`.
- **Playwright** (C27-C35): `pnpm exec playwright test e2e/historico.spec.ts -g "closed row arrangement at 360|open row arrangement at 360|historico colours|historico type and boxes|empty state arrangement at 360|list pinned to the card|values panel and chevron|confirm and empty buttons|empty state divider"`. Exit 0. 15 passed, each ✓ by name:
  - `:44` closed row arrangement
  - `:61` open row arrangement
  - `:99` historico colours, light and dark
  - `:126` historico colours, empty, light and dark
  - `:134` type and boxes
  - `:203` empty state arrangement
  - `:220` list pinned to the card
  - `:248` values panel and chevron, light and dark
  - `:272` confirm and empty buttons, light and dark
  - `:301` empty state divider, light and dark
- **The new tests are the feature's own.** C32-C35's tests are the ones added by 38ec089 (`e2e/historico.spec.ts:217-313`), and no other file holds those names.

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | heading order | Vitest batch ✓ | `src/App.test.tsx:1500-1501` (carried citation, file unchanged) | PASS |
| C2 | empty state, no list | Vitest batch ✓ | `src/App.test.tsx:1510-1512` | PASS |
| C3 | "Fazer a primeira" opens on today; an open form is left as is | Vitest batch ✓ | `src/App.test.tsx:1522-1523`, `:1528-1529`. Now backed by `plan.md:148` | PASS |
| C4 | 60 rows, newest first | Vitest batch ✓ | `src/App.test.tsx:1542-1549` | PASS |
| C5 | 5 summary kinds | Vitest batch ✓ | `src/App.test.tsx:1563`, `:1565` | PASS |
| C6 | year only when it differs | Vitest batch ✓ | `src/App.test.tsx:1580` | PASS |
| C7 | open row values, `MEASURES` order | Vitest batch ✓ | `src/App.test.tsx:1592-1598`, `:1601-1606` | PASS |
| C8 | tap closes | Vitest batch ✓ | `src/App.test.tsx:1614-1617` | PASS |
| C9 | "Apagar" asks first | Vitest batch ✓ | `src/App.test.tsx:1626-1630` | PASS |
| C10 | "Cancelar" keeps | Vitest batch ✓ | `src/App.test.tsx:1640-1643` | PASS |
| C11 | confirmed delete with toast | Vitest batch ✓ | `src/App.test.tsx:1649-1652` | PASS |
| C12 | a row change dismisses the confirm | Vitest batch ✓ | `src/App.test.tsx:1664`, `:1669-1670` | PASS |
| C13 | delete re-derives the reminder | Vitest batch ✓ | `src/App.test.tsx:1675`, `:1679`, `:1683` | PASS |
| C14 | last delete shows the empty state | Vitest batch ✓ | `src/App.test.tsx:1689-1691` | PASS |
| C15 | deleting the edited entry closes the form | Vitest batch ✓ | `src/App.test.tsx:1699-1705` | PASS |
| C16 | edit rule at its own layer | Vitest batch ✓ (3) | `src/domain/measurements.test.ts:171`, `:179`, `:182`, `:191` | PASS |
| C17 | "Editar" opens the form on the entry | Vitest batch ✓ | `src/App.test.tsx:1712-1718` | PASS |
| C18 | "Editar" replaces the form | Vitest batch ✓ | `src/App.test.tsx:1726-1730` | PASS |
| C19 | date locked | Vitest batch ✓ | `src/App.test.tsx:1737-1740` | PASS |
| C20 | edit saves exactly the filled fields | Vitest batch ✓ | `src/App.test.tsx:1751-1756` | PASS |
| C21 | cleared edit offers "Apagar medição" | Vitest batch ✓ | `src/App.test.tsx:1764-1773` | PASS |
| C22 | the form's delete asks first | Vitest batch ✓ | `src/App.test.tsx:1784-1801` | PASS |
| C23 | bad value marked | Vitest batch ✓ | `src/App.test.tsx:1811-1814` | PASS |
| C24 | "Fechar" leaves unsaved | Vitest batch ✓ | `src/App.test.tsx:1823-1827` | PASS |
| C25 | edit drops the tape | Vitest batch ✓ | `src/App.test.tsx:1832`, `:1838` | PASS |
| C26 | rest of the record untouched | Vitest batch ✓ | `src/App.test.tsx:1857-1863` | PASS |
| C27 | closed row arrangement | Playwright batch ✓ | `e2e/historico.spec.ts:51-58` | PASS |
| C28 | open row arrangement | Playwright batch ✓ | `e2e/historico.spec.ts:73-95` (`:95` needs the fonts loaded) | PASS |
| C29 | colours, both schemes | Playwright batch ✓ ×4 | `e2e/historico.spec.ts:103-123`, `:129-130` | PASS |
| C30 | type and boxes | Playwright batch ✓ | `e2e/historico.spec.ts:136-200` | PASS |
| C31 | empty state arrangement | Playwright batch ✓ | `e2e/historico.spec.ts:209-214` | PASS |
| C32 | list pinned to the card; row border style; row button text-align, background, radius; date at the row's left | Playwright batch ✓ | `e2e/historico.spec.ts:223` `toHaveCSS("list-style-type", "none")`; `:225-226` `` toHaveCSS(`margin-${side}`, "0px") ``, `` toHaveCSS(`padding-${side}`, "0px") `` on 4 sides; `:234` `Math.abs(r.x - heading.x) ≤ 1`; `:235` `Math.abs(r.x + r.width - contentRight) ≤ 1`; `:236` `"border-top-style", "solid"`; `:238` `"text-align", "left"`; `:239` `"background-color", TRANSPARENT`; `:240` `"border-top-left-radius", "10px"`; `:243` `Math.abs(d.x - hb.x) ≤ 1` | PASS |
| C33 | chevron 180°; panel margin and gap; line gap and divider; `dd` margin; both schemes | Playwright batch ✓ ×2 | `e2e/historico.spec.ts:255` `expect.poll(… matrix()[0]).toBeLessThan(-0.999)`; `:257-260` `abs(a+1)`, `abs(d+1)`, `abs(b)`, `abs(c)` `< 0.001`; `:263` panel margins `"0px"`; `:264` `["0px","normal"]).toContain(row-gap)`; `:266` `"column-gap", "8px"`; `:267` `"border-top-style", "solid"`; `:268` `"border-top-color", rgb(LINE[scheme])`; `:269` `dd` `"margin-left", "0px"` | PASS |
| C34 | confirm align, "Apagar" border; "Cancelar" style, background, size; "Fazer a primeira" border, colour, radius, padding, family, weight, size, margin; both schemes | Playwright batch ✓ ×2 | `e2e/historico.spec.ts:278` `"align-items", "center"`; `:279` `"border-top-width", "0px"`; `:281-283` `"solid"`, `rgb(SURFACE[scheme])` (`:217` `#ffffff` / `#2a1016`), `"14px"`; `:289` `"0px"`; `:290` `rgb(ON_ACCENT[scheme])`; `:292` `radius ≥ height / 2`; `:293-294` `"9px"`, `"18px"`; `:295` `toMatch(/^"?Fredoka/)`; `:296` `"600"`; `:297` `"16px"`; `:298` margins `"0px"` | PASS |
| C35 | empty state divider and padding, both schemes; below the heading | Playwright batch ✓ ×2 | `e2e/historico.spec.ts:305` `"border-top-width", "1px"`; `:306` `"solid"`; `:307` `rgb(LINE[scheme])`; `:308-309` `"4px"`, `"8px"`; `:311` `box(empty).y ≥ heading.y + heading.height` | PASS |

Per-check tally: **35/35 PASS** with located evidence.

**C28 and fonts.** This still holds. In the scratch worktree, `node_modules` was a real copy (`cp -a` of the real tree's). `pnpm install --offline` could not complete: `@fontsource-variable/dm-sans` is missing from the store. The baseline there was 15/15 before any fault.

## Coverage

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| mockup v6 decided values, Histórico (95). Verified at `38ec089` | mockup l.56, l.139, l.160, l.191, l.219-235, l.254, l.857 (authority: the mockup) | 76 asserted (48 carried + 28 new: C32 ×7, C33 ×7, C34 ×13, C35 ×1) · 19 OOR (`checks.md:165`) | - |
| colour schemes (2). Verified at `38ec089` | mockup `:root` and dark l.8-42 | light: C29, C33, C34, C35 · dark: C29, C33, C34, C35. Each new test is parametrised over both (`e2e/historico.spec.ts:247`), and both ran ✓ | - |
| checks.md "mockup v6 values left unaccounted in round 1 (28)" (`checks.md:160`). Verified at `38ec089` | round 1's NONE list | 28 of 28 map to a located assertion above. P7 (`list-style`) is included, at `:223` | - |
| empty state composition (5: divider, padding, text-above-button, centring, gap). Verified at `38ec089` | mockup l.857 + l.220 + l.235 | divider C35 · padding C35 · order C31 · centring C31 · gap OOR | - |
| form edit-mode copy and states (7). Verified at `38ec089` | mockup l.822-850 | C17, C19 (approved deviation), C20-C24, C11 | - |
| row summary kinds (5) · row date formats (3) · row open states (3) · confirm outcomes (4) · edit rule outcomes (4) · form modes and submit paths · form already open (4) · reminder re-derivation (3) · untouched record fields (6) | carried from b834871. The fix touched no code these come from | as in round 1 | - |

## Test policy rows

| Row | Files it classifies | Required proof | Expectation met |
| --- | --- | --- | --- |
| The edit rule | `src/domain/measurements.ts:54-62` | own layer C16, plus through `App` | yes (carried from b834871, file untouched) |
| Histórico and edit-mode state through `App` | `History.tsx`, `MeasureForm.tsx`, `App.tsx` | `App` in jsdom C1-C26 | yes (carried from b834871, files untouched) |
| Histórico layout, type and colour (re-judged, because `src/index.css` was touched) | `src/index.css:114-133` | Playwright at 360×740: C27-C35 (`e2e/historico.spec.ts:4`) | yes. Every decided value is asserted or OOR, the new colour claims run in both schemes, and the `.empty` change is carried by C35 |

## Faults injected

Verified at `38ec089`.

**Method.**

- **Scratch worktree.** Created with `git worktree add --detach <scratchpad>/wt2 HEAD`. Playwright was moved to port 5198 in the scratch only, and `node_modules` was a real copy. The baseline in the scratch was 15/15 green.
- **Each mutation.**
  - Applied by a script as an exact single-occurrence replace in `src/index.css`, and shown by `git diff -U0`.
  - The scratch ran `pnpm exec playwright test e2e/historico.spec.ts` (all 15).
  - For the E-series, the scratch also ran Vitest C2 and C14 (`historico empty state|deleting the last entry shows the empty state`).
  - The file was restored with `git checkout --`, and `git status -- src e2e` showed it clean after every mutation.
- **Clean-up.**
  - `git worktree remove --force` and `prune` were run. `git worktree list` shows only the main tree.
  - The real tree's `git status --porcelain` equals the baseline taken before the run: `?? .playwright-mcp/`.

**Round-1 probes, re-applied.** The location for each is `src/index.css`.

| Mutation | Location | Killed |
| --- | --- | --- |
| P1 as written: delete `.hist`'s `padding: 0` | `:115` | equivalent mutant - the computed padding stays `0px`, because Tailwind preflight `* { padding: 0 }` (`node_modules/tailwindcss/preflight.css:14`, already imported at d91b1a1) supplies it. C32's `:226` asserted `0px` and held; the page is unchanged, so no proof can tell it apart. Round 1's "indented 40px" did not happen |
| P1 as intended: `.hist { padding: 0 0 0 40px }` (list indented 40px) | `:115` | yes: `list pinned to the card` × at `:226` |
| P2 value-line divider `solid --line` -> `dashed --cherry` | `:123` | yes: `values panel and chevron` light × dark × at `:267` |
| P3 `.confirm .ghost { background: transparent; font-size: 12px; border-style: dashed }` | `:131` (added) | yes: `confirm and empty buttons` ×2 at `:281` |
| P3b "Cancelar" background only | `:131` (added) | yes: ×2 at `:282` |
| P3c "Cancelar" 12px only | `:131` (added) | yes: ×2 at `:283` |
| P4 `.row-head` background `--blush`, `text-align: center`, radius 0 | `:117` | yes: `list pinned to the card` × at `:238` |
| P4b row button background only | `:117` | yes: × at `:239` |
| P4c row button radius 0 only | `:117` | yes: × at `:240` |
| P5 open chevron `rotate(90deg)` | `:121` | yes: `values panel and chevron` ×2 at `:255` |
| P6 `.empty .cta { system-ui; 400; 14px; radius 4px; --ink }` | `:133` (added) | yes: `confirm and empty buttons` ×2 at `:290` |
| P6b-P6i, one property each: colour, family, weight, size, radius 4px, padding `12px 22px`, border 1px, `margin-top: 6px` | `:133` (added) | yes, each ×2: at `:290`, `:295`, `:296`, `:297`, `:292`, `:293`, `:289`, `:298` respectively |
| P7 `.hist { list-style: disc }` | `:115` | yes: `list pinned to the card` × at `:223` |
| P8 as written: delete `.vals dd`'s `margin: 0` | `:126` | equivalent mutant - preflight's `* { margin: 0 }` (`preflight.css:13`) keeps `dd` at `0px`; C33's `:269` held; the page is unchanged |
| P8 as intended: `.vals dd { margin: 0 0 0 40px }` (UA default indent) | `:126` | yes: `values panel and chevron` ×2 at `:269` |

**The new surfaces of C32-C33-C34**, one fault per assertion line not already reached above:

| Mutation | Location | Killed |
| --- | --- | --- |
| `.hist { margin: 0 12px }` | `:115` | yes: C32 × at `:225` |
| `.hist li { margin-left: 12px }` (list intact, rows shifted) | `:116` | yes: C32 × at `:234` |
| `.hist li { margin-right: 12px }` | `:116` | yes: C32 × at `:235` |
| `.hist li` border `dashed` | `:116` | yes: C32 × at `:236` |
| `.row-head .d { margin-left: 10px }` | `:118` | yes: C32 × at `:243` |
| `.vals { gap: 6px }` | `:122` | yes: C33 ×2 at `:264` |
| `.vals div { gap: 2px }` | `:123` | yes: C33 ×2 at `:266` |
| `.vals div` border colour `--cherry` (style kept) | `:123` | yes: C33 ×2 at `:268` |
| `.confirm { align-items: flex-start }` | `:129` | yes: C34 ×2 at `:278` |
| `.confirm .danger { border: 2px solid var(--line) }` | `:131` | yes: C34 ×2 at `:279` |

**The `.empty` change (C35)** and its effect on C2, C29 and C31:

| Mutation | Location | Killed |
| --- | --- | --- |
| E1 the divider removed | `:132` | yes: `empty state divider` light × dark × at `:305`. C2 and C14 (Vitest) ✓, C29 `historico colours, empty` ✓, C31 ✓ |
| E2 `.empty` reverted to its round-1 rule (`padding: 10px 0 14px`, no border) | `:132` | yes: C35 ×2 at `:305`. C2, C14, C29 and C31 ✓ |
| E3 divider colour `--cherry` | `:132` | yes: C35 ×2 at `:307`. C2, C29 and C31 ✓ |
| E4 divider kept, padding back to `10px 0 14px` | `:132` | yes: C35 ×2 at `:308`. C2, C29 and C31 ✓ |
| E5 `.empty { margin-top: -30px }` (the divider over the heading) | `:133` (added) | yes: C35 ×2 at `:311`. C31 ✓ |

**What E1-E5 show about C2, C29 and C31.** The `.empty` change is carried by C35 alone.

- C2 is a jsdom proof and does not see CSS.
- C29 asserts only the empty state's text colour and the button's fill.
- C31 asserts order and centring, which the divider does not move.

All three stayed green both with and without the change, so the fix did not regress them, and none of them hides the divider.

**Behaviour faults F1-F5** are carried from b834871, all killed. The fix touched no `.ts` or `.tsx` source.

**Totals.** 39 mutations, 37 killed, 2 equivalent (P1 and P8 as literally written). Every assertion line in C32-C35 was made to fail at least once.

**Precision probes, recorded as notes.** Two further probes survived. Both are asymmetric edits that keep the shorthand's asserted sides:

- **Q1.** `.cta.small { padding: 9px 6px 2px 18px }`. C34 asserts `padding-top` 9px and `padding-left` 18px, not the right and bottom sides.
- **Q2.** `.row-head { border-radius: 10px 0 0 0 }`. C32 asserts only `border-top-left-radius`.

Neither is a value left unaccounted. Each of the shorthands `9px 18px` and `10px` is asserted on its distinct values, and a plausible regression, which replaces the shorthand, is killed (P4c, P6f, P6g). This sampling is the same one round 1 accepted for C30: panel padding at `e2e/historico.spec.ts:154-155`, and the "Apagar" radius at `:174-175`. If the orchestrator wants these closed, asserting `padding-right`/`padding-bottom` and all four radii would close them.

## Gate

Run at `38ec089`, on the real tree:

- `pnpm vitest run`: 10 files, **183 passed**, 0 failed.
- `pnpm exec playwright test`: **52 passed**, 0 failed. That is round 1's 45 plus the 7 new tests.

## Swept existing

Carried from b834871. The fix touches no swept constraint. The storage warning is still at `src/App.tsx:138`, and that file is untouched.

## Findings

None failing.

Notes:

1. **Round 1's P1 and P8 descriptions were wrong.** Deleting `padding: 0` or `margin: 0` never changed the page, because of Tailwind's preflight (`node_modules/tailwindcss/preflight.css:7-16`). Their observable forms are killed now. Anyone reading lembrete or older reports should know that a "removed reset" probe is an equivalent mutant in this repo.
2. **Q1 and Q2, longhand sampling.** These are described above. They are not failing, and they are consistent with round 1's reading of C30.
3. **The empty state is not a list.** Mockup v6 puts it inside `ul.hist`, while AC 2 and C2 require "no list". This is ARIA semantics, not something the mockup draws, and it is not visible.
4. **AC 16 / C15** still has no Assumption row. The form closes when its edited entry is deleted from a row, where the mockup's flow throws. This is carried from round 1 and not failing.
5. **C28 depends on the fonts** loading with a real `node_modules`. Carried.
6. **Lessons step.** The step that distils lessons (`scripts/lessons.py`) was not run. This verifier writes only this report.
