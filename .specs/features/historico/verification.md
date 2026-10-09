# Histórico verification

**Verdict**: FAIL
**Profile**: ui
**Diff range**: 27447a4..d91b1a1 (HEAD; commits ee9a100, c9b24ca, 0c46262, d91b1a1)
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier). Fresh context. It did not build the feature or write any of its checks, and it changed no file except this report

## Summary

The code does what the checks say. All 31 checks are proven, each with a located assertion. Every behaviour fault was killed. All suites are green.

The feature fails step 1 on two counts:

- **Uncovered mockup values.** Mockup v6 decides 95 style values for the Histórico section. Of these, 28 are neither asserted nor named out of reach in `checks.md:152`. This is the same gap that failed lembrete rounds 1-3. Six probes on these values survived every proof. One of them is an arrangement gap: P1 indents the whole list 40px, and every proof stays green.
- **One contradiction.** AC 3 and C3 keep an open form as it was when she taps "Fazer a primeira". Mockup v6 resets the form instead. This deviation is not recorded in the plan's Assumptions, and the user's approved list does not include it.

## Binding sources

Verified at `d91b1a1`.

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| Mockup v6 Histórico styles. The local copy is `artifact-1d35028d-1791496183-91de.html`, opened and read. Rules covered: `.hist` l.219, `.hist li` l.220, `.row-head` l.221-225, `.vals` l.226-230, `.hist .acts` l.231-232, `.confirm` l.233-234, `.empty` l.235. Also the rules these elements reuse: `.ghost-btn` l.139 ("Cancelar"), `.cta` l.254 and `.cta.small` l.160 ("Fazer a primeira"), and `.sec-head h2` l.191 | yes | none on style. `src/index.css:115-133` matches l.219-235 rule for rule. The differences are the approved 44px floors and `.row-head { color: var(--ink) }`, which the mockup gets by inheritance (`button { color: inherit }` l.47) | 28 of 95 decided values are neither asserted nor named out of reach. The full list is in "Decided values" below. Six probes on them survived (P1-P6). One is an arrangement gap: `.hist { padding: 0 }` (P1) |
| Mockup v6 markup and script: `#histTitle` section l.378-381, `renderHist` l.855-871, the `#hist` click handler l.873-880, and in the form `openForm` l.818-823, `validate` l.812-817, `closeForm` l.825 and the submit handler l.840-851 | yes | **AC 3 / C3.** The mockup's `#firstBtn` calls `openForm()` (l.858). `openForm` sets `f-date` to `TODAY` and calls `renderFields()` (l.820-822), which rebuilds every input from the stored entry. So an open form loses its date and typed values. AC 3 and C3 keep both instead (`src/App.test.tsx:1528-1529`). The plan does not record this as an Assumption, and the user's approved list does not include it: that list has the 44px floor, the form confirm, the locked date and `/aa` | the empty-state "row" (see "Decided values") |
| `.design/body-measurements.md` `### Histórico` (l.161-173) | yes | none. The 5-row state table and default 1 (no paging) map to AC 2, AC 5-AC 12, AC 17-AC 22 and AC 4 | - |

### Decided values in mockup v6, enumerated

Each member below is a value the mockup's rule declares. Legend:

- **C#** means the member is asserted by that check.
- **OOR** means it is named in `checks.md:152`.
- **NONE** means neither.

**Histórico: 95 members. 48 are asserted, 19 are named out of reach, and 28 are neither.**

| Rule (mockup line) | Members |
| --- | --- |
| `.hist` l.219 | `list-style: none` **NONE** · `margin: 0` **NONE** · `padding: 0` **NONE** (P1 survived: the list is indented 40px) · flex column C27 |
| `.hist li` l.220 | flex column C28 · gap 10px OOR · padding OOR · border-top width 1px C30 · border-top style `solid` **NONE** · border-top colour `--line` C29 |
| `.row-head` l.221 | `auto 1fr auto` C27 · `align-items: center` C27 · gap OOR · `border: 0` C27 (indirectly: a default button border fails `:53` by its width) · `background: none` **NONE** (P4) · padding OOR · `text-align: left` **NONE** (P4) · `border-radius: 10px` **NONE** (P4) |
| `.row-head .d` l.222 | family C30 · weight 600 C30 · size 17px C30 · `tabular-nums` OOR |
| `.row-head .sum` l.223 | size 14px C30 · colour `--muted` C29 |
| `.row-head svg` l.224 | 16×16 C30 · colour `--cherry` C29 · transition OOR |
| `[aria-expanded="true"] svg` l.225 | `rotate(180deg)` **NONE**. This is a precision gap: C30 asserts only "not `none`". P5 (`rotate(90deg)`) survived |
| `.vals` l.226 | `margin: 0` **NONE** · single grid column C28 · `gap: 0` **NONE** (equal to the grid default) · background `--blush` C29 · radius 14px C30 · padding 12px 14px C30 |
| `.vals div` l.227 | flex `space-between` C28 · gap 8px **NONE** · size 15px C30 · padding OOR · border-top width C30 · border-top style `solid` **NONE** (P2) · border-top colour `--line` **NONE** (P2) |
| `.vals div:first-child` l.228 | border 0 C30 |
| `.vals dt` l.229 | colour `--muted` C29 |
| `.vals dd` l.230 | `margin: 0` **NONE** (P8 survived) · weight 700 C30 · `tabular-nums` OOR |
| `.hist .acts` l.231 | flex row C28 · gap OOR · `flex-end` C28 |
| `.hist .acts button` l.232 | border 0 C30 · background none C29 · colour `--cherry` C29 · size 14px C30 · weight 500 C30 · padding OOR · radius OOR |
| `.confirm` l.233 | flex row C28 · `align-items: center` **NONE** · gap OOR · wrap OOR · background `--blush` C29 · radius 14px C30 · padding OOR · size 14px C30 |
| `.confirm .danger` l.234 | `border: 0` **NONE** · fill `--cherry` C29 · colour `--on-accent` C29 · radius 999px C30 (at least half the height) · padding OOR · weight 500 C30 |
| "Cancelar" `.ghost-btn` l.139 | border width 1.5px C30 (declared) · border style `solid` **NONE** (P3) · border colour `--line` C29 · background `--surface` **NONE** (P3) · radius OOR · padding OOR · size 14px **NONE** (P3) · colour `--muted` C29 |
| `.empty` l.235 | `text-align: center` C31 · colour `--muted` C29 · padding OOR · flex column C31 · `align-items: center` C31 · gap OOR |
| The empty state as drawn | The mockup renders it as an `<li class="empty">` inside `.hist` (l.857). So `.hist li` (specificity 0,1,1) outranks `.empty` (0,1,0) and adds a 1px `--line` top border. The app renders a `div.empty` with no border (`src/components/History.tsx:64`), so the mockup's divider above the empty text is drawn but not rendered: **NONE**. The same cascade means the empty state's rendered padding is `4px 0 8px`, so the out-of-reach entry "the empty state's padding (10px 0 14px)" at `checks.md:152` names the wrong value |
| "Fazer a primeira" `.cta` l.254 + `.cta.small` l.160 | fill `--cherry` C29 · `border: 0` **NONE** · colour `--on-accent` **NONE** · radius 999px **NONE** · padding 9px 18px **NONE** · family `--display` **NONE** · weight 600 **NONE** · size 16px **NONE** · margin 0 **NONE**. P6 survived with family, weight, size, radius and colour all changed. Lembrete C27 asserts the shared `.cta.small` size on "Medir agora", but the Histórico checks neither cite that nor name these values out of reach for this screen |
| `.sec-head h2` l.191 | 22px C30 |

**Form in edit mode.** It adds no style of its own, and its decided copy and states are all covered:

- the title "Editar dd/mm" (C17)
- the merge hint hidden (C17)
- "Apagar medição", enabled (C21)
- "Fechar" (C24)
- the toasts (C11, C20)

**Selector-reachable enumeration per screen:**

- **Histórico.**
  - The section sits between the form and Lembrete (C1).
  - Empty text above the button, both centred (C2, C31).
  - Rows newest first (C4, C27).
  - Date, summary and chevron on one line (C27).
  - Values panel above the right-aligned actions (C28).
  - Confirm below the actions, "Apagar" before "Cancelar" (C28).
  - **Arrangement gap:** nothing pins the list to the card's content edge. With P1 every row is indented 40px and stays green.
  - **Arrangement gap:** nothing pins the summary to the left of its column (`text-align: left`, P4).
- **Form in edit mode.** Covered by C17-C24.
- **Elements the code renders that the design does not draw:**
  - the confirm inside the form (approved, AC 22)
  - the 44px floors (approved)
  - none other

## Checks

All proofs ran at `d91b1a1` on the real tree, in two batched invocations:

- **Vitest**, one invocation:

  ```
  pnpm vitest run src/App.test.tsx src/domain/measurements.test.ts --reporter=verbose -t "historico sits between the form and lembrete|historico empty state|fazer a primeira opens the form|every entry newest first|closed row summary|row date shows the year only when it differs|opening a row shows its values|tapping an open row closes it|apagar asks first|cancelar keeps the entry|confirmed apagar removes the entry|a row change dismisses the confirm|deleting re-derives the reminder|deleting the last entry shows the empty state|deleting the edited entry closes the form|edit measurement|editar opens the form on the entry|editar replaces what the form holds|the date is locked while editing|saving an edit replaces the values|a cleared edit offers to delete|deleting from the form asks first|a bad value in an edit is marked|fechar leaves the edit unsaved|an edit that drops the tape re-derives the reminder|historico writes keep the rest of the record"
  ```

  Exit 0. 28 tests passed, each ✓ by name: the 3 tests under `edit measurement` and 25 under `Histórico > <name>`.
- **Playwright**, one invocation:

  ```
  pnpm exec playwright test e2e/historico.spec.ts -g "closed row arrangement at 360|open row arrangement at 360|historico colours|historico type and boxes|empty state arrangement at 360"
  ```

  Exit 0. 8 tests passed, each ✓ by name, the colour tests once per scheme.
- **Every filter matched only tests the feature added.** They sit in `describe("Histórico")` at `src/App.test.tsx:1426`, `describe("edit measurement")` at `src/domain/measurements.test.ts:161`, and `e2e/historico.spec.ts`, all added in `27447a4..HEAD`.

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | heading order, empty and with one entry | Vitest batch ✓ | `src/App.test.tsx:1500` `expect(hist).toBeGreaterThan(form)`; `:1501` `expect(headings.indexOf("Lembrete")).toBeGreaterThan(hist)`, looped over both records at `:1493` | PASS |
| C2 | empty state, field absent and `[]` | Vitest batch ✓ | `src/App.test.tsx:1510-1511` `getByText("Nenhuma medição ainda.")`, `getByRole("button", { name: "Fazer a primeira" })`; `:1512` `queryByRole("list")).toBeNull()` | PASS |
| C3 | "Fazer a primeira" opens on today and scrolls; an open form is left as is | Vitest batch ✓ | `src/App.test.tsx:1522` `dateField().value).toBe("2026-10-08")`; `:1523` `scroll.mock.contexts).toContain(formSection())`; `:1528-1529` `toBe("2026-10-01")`, `toBe("62")`. It contradicts the mockup; see Binding sources | PASS |
| C4 | 60 rows, newest first | Vitest batch ✓ | `src/App.test.tsx:1542` `toHaveLength(60)`; `:1544-1545` `"08/10"`, `"21/08/25"`; `:1549` `expect(shown).toEqual(...)` in descending order | PASS |
| C5 | 5 summary kinds, no values while closed | Vitest batch ✓ | `src/App.test.tsx:1563` `getByTestId("hist-sum").textContent, summary).toBe(summary)` over the cases at `:1553-1559`; `:1565` `querySelector("dl")).toBeNull()` | PASS |
| C6 | year shown only when it differs | Vitest batch ✓ | `src/App.test.tsx:1580` `expect(dates()).toEqual([shown])` over the cases at `:1572-1577` | PASS |
| C7 | open row values in `MEASURES` order; another row closes it | Vitest batch ✓ | `src/App.test.tsx:1592-1596` `lines("30/09")).toEqual([["Peso","62,6 kg"],["Cintura","71,6 cm"],["Braço E","28,3 cm"]])`; `:1598` `["Editar","Apagar"]`; `:1601-1606` | PASS |
| C8 | tapping an open row closes it | Vitest batch ✓ | `src/App.test.tsx:1614` `aria-expanded", "false"`; `:1615-1617` | PASS |
| C9 | "Apagar" asks first, stores nothing | Vitest batch ✓ | `src/App.test.tsx:1626` `item("30/09")).toContainElement(confirm)`; `:1627-1629`; `:1630` `stored()).toEqual(before)` | PASS |
| C10 | "Cancelar" keeps the entry | Vitest batch ✓ | `src/App.test.tsx:1640` `queryByText("Apagar a medição de 30/09?")).toBeNull()`; `:1641-1643` | PASS |
| C11 | confirmed delete removes it, with a toast | Vitest batch ✓ | `src/App.test.tsx:1649` `stored().measurements).toEqual([PESO])`; `:1650-1652` `toHaveTextContent("Medição apagada")` | PASS |
| C12 | a row change dismisses the confirm | Vitest batch ✓ | `src/App.test.tsx:1664` `toBeNull()`; `:1669` `queryByText(/^Apagar a medição de/)).toBeNull()`; `:1670` `stored()).toEqual(before)` | PASS |
| C13 | delete re-derives the reminder | Vitest batch ✓ | `src/App.test.tsx:1675` `card()).toBeNull()`; `:1679` `"A última com fita foi há 10 dias."`; `:1683` `"Hora da primeira medição"` | PASS |
| C14 | last delete shows the empty state | Vitest batch ✓ | `src/App.test.tsx:1689-1690`; `:1691` `stored().measurements).toEqual([])` | PASS |
| C15 | deleting the edited date closes the form | Vitest batch ✓ | `src/App.test.tsx:1699-1701` keeps "Editar 30/09" and its values; `:1703` `queryByRole("form")).toBeNull()`; `:1704-1705` "Abrir", "Nova medição" | PASS |
| C16 | edit rule at its own layer | Vitest batch ✓ (3 tests) | `src/domain/measurements.test.ts:171` `toEqual([list[0], { date: "2026-09-30", values: { peso: 62.4 } }])`; `:175`; `:179` `{ ok: false, reason: "invalid", invalid: ["cintura"], record }`; `:182` `reason: "empty"`; `:185-187`; `:191` merge `{ peso: 62.4, cintura: 71.6 }` | PASS |
| C17 | "Editar" opens the form on the entry | Vitest batch ✓ | `src/App.test.tsx:1712-1713` "Editar 30/09", no "Nova medição"; `:1714-1716` field values; `:1717` hint `toBeNull()`; `:1718` scroll context | PASS |
| C18 | "Editar" replaces what the form holds | Vitest batch ✓ | `src/App.test.tsx:1726` `toBe("62,6")`; `:1728-1730` "Editar 23/09", `"62,9"`, `""` | PASS |
| C19 | date locked | Vitest batch ✓ | `src/App.test.tsx:1737` `disabled \|\| readOnly).toBe(true)`; `:1739` `toBe("2026-09-30")`; `:1740` | PASS |
| C20 | an edit saves exactly the filled fields | Vitest batch ✓ | `src/App.test.tsx:1751` `toEqual([{ date: "2026-09-30", values: { peso: 62.4, busto: 90 } }])`; `:1752` "Medição atualizada"; `:1753-1756` | PASS |
| C21 | a cleared edit offers "Apagar medição" | Vitest batch ✓ | `src/App.test.tsx:1764-1765` `toHaveTextContent("Apagar medição")`, `toBeEnabled()`; `:1767`; `:1772-1773` "Salvar medição", `toBeDisabled()` | PASS |
| C22 | the form's delete asks first | Vitest batch ✓ | `src/App.test.tsx:1784` `screen.getByRole("form")).toContainElement(confirm)`; `:1787`, `:1790-1794`; `:1798` `toEqual([PESO])`; `:1799-1801` | PASS |
| C23 | a bad value is marked in edit mode | Vitest batch ✓ | `src/App.test.tsx:1811` "Confira este valor"; `:1812` `aria-invalid", "true"`; `:1813` `toBeDisabled()`; `:1814` | PASS |
| C24 | "Fechar" leaves the edit unsaved | Vitest batch ✓ | `src/App.test.tsx:1823` `stored()).toEqual(before)`; `:1825-1827` "Nova medição", `"2026-10-08"`, `toBe(false)` | PASS |
| C25 | an edit that drops the tape re-derives the reminder | Vitest batch ✓ | `src/App.test.tsx:1832` `toBeNull()`; `:1838` `"A última com fita foi há 10 dias."` | PASS |
| C26 | rest of the record untouched | Vitest batch ✓ | `src/App.test.tsx:1857` `after.version).toBe(1)`; `:1858-1862`; `:1863` `measurements` | PASS |
| C27 | closed row arrangement at 360 | Playwright batch ✓ | `e2e/historico.spec.ts:51-53` date ≤ summary ≤ chevron, chevron at the right edge within 1px; `:55` centres within 2px; `:56` `row.height ≥ 44`; `:58` order | PASS |
| C28 | open row arrangement at 360 | Playwright batch ✓ | `e2e/historico.spec.ts:73-75` lines; `:81-83` actions side by side, "Apagar" at the right edge; `:85-86` below the panel, ≥ 44; `:92` confirm below; `:95` `yes.x + yes.width ≤ no.x` | PASS |
| C29 | colours, both schemes | Playwright batch, light ✓ dark ✓ (×2 tests) | `e2e/historico.spec.ts:103-104` row `border-top-color`; `:105-106`; `:108` `dl` `rgb(BLUSH)`; `:109`; `:112-113`; `:117`, `:119-120`, `:122-123`; `:129-130`. The hexes are at `:12-16` | PASS |
| C30 | type and boxes | Playwright batch ✓ | `e2e/historico.spec.ts:136` `"22px"`; `:138-140`; `:141`; `:144-146`; `:147`; `:150` `not.toHaveCSS("transform", "none")`; `:153-155`; `:157-160`; `:163-165`; `:170-171`; `:173`; `:175` radius ≥ h/2; `:200` `declared.at(-1)).toEqual([".ghost", "1.5px"])` | PASS |
| C31 | empty state arrangement at 360 | Playwright batch ✓ | `e2e/historico.spec.ts:209` text above the button; `:211-212` centred within 2px; `:213` `text-align: center`; `:214` ≥ 44 | PASS |

Per-check tally: **31/31 PASS** with located evidence.

**C28 and fonts.** The `:95` "Apagar before Cancelar" assertion holds only with the bundled fontsource fonts loaded:

- In a scratch worktree whose `node_modules` was a symlink, the confirm wrapped at 360 and `:95` failed (`301 > 44`) at an unmutated `HEAD`. Most likely Vite did not serve the font files from outside its root.
- With a real copy of `node_modules`, it passed.

The mockup allows the wrap (`flex-wrap`), so this is environment-sensitive, not wrong. It is recorded so that a future flake here is read correctly.

## Coverage

Recomputed at `d91b1a1`.

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| row summary kinds (5) | mockup `renderHist` l.864 (`isTape` then count with singular/plural, else peso-only) and `src/components/History.tsx:13-17` | many C5 · 2 C5 · 1 singular C5 · peso decimal C5 · peso whole C5 | - |
| row date formats (3) | `src/components/History.tsx:8-11` (1 branch) plus year rollover | `dd/mm` C5, C6 · `dd/mm/aa` C4, C6 · rollover C6 | - |
| row open states (3) | mockup click handler l.875; `History.tsx:53-56` | open C7 · another closes C7 · tap closes C8 | - |
| confirm outcomes (4) | mockup l.877-879; `History.tsx:104-113`, `MeasureForm.tsx:205` | "Apagar" C11, C22 · "Cancelar" C10, C22 · row close C12 · other row C12 | - |
| edit rule outcomes (4) | `src/domain/measurements.ts:54-62` (empty, date, invalid, replace) | C16 for each one | - |
| form modes (3: new, edit, closed) and edit submit paths (3: save, all-blank → confirm, bad → disabled) | `MeasureForm.tsx:74-98` (open, edit and deleted-entry effects), `:106-109` (`canSave`), `:116-125` (submit) | C17-C24 | - |
| form already open (4) | `MeasureForm.tsx:74-98` effects | C3 · C18 ×2 · C15 | - |
| reminder re-derivation (3) | `reminderDue` callers | C13 ×2 · C25 | - |
| untouched record fields (6) | `src/domain/store.ts` record shape | C26 | - |
| colour schemes (2) | mockup `:root` and dark blocks l.8-40 | light, dark: C29 | - |
| mockup v6 decided values, Histórico (95) | mockup l.139, l.160, l.191, l.219-235, l.254, l.857 (authority: the mockup, not the code) | 48 asserted · 19 OOR | 28: `.hist` list-style, margin, padding · `.hist li` border style · `.row-head` background, text-align, radius · chevron `rotate(180deg)` (precision) · `.vals` margin, gap · `.vals div` gap, border style, border colour · `.vals dd` margin · `.confirm` align-items · `.danger` border · "Cancelar" border style, background, font-size · the empty state's top divider · "Fazer a primeira" border, colour, radius, padding, family, weight, size, margin |
| checks.md row "mockup v6 elements (25)" (`checks.md:147`) | checks.md | 25 of 25 proven as cited. The row groups values ("panel radius and padding", "'Cancelar' ghost"), and its groups hide the members above | - |

## Test policy rows

| Row | Files it classifies | Required proof | Expectation met |
| --- | --- | --- | --- |
| The edit rule | `src/domain/measurements.ts:54-62` | own layer C16 · through `App` C20 (replace) and C22 (all-blank delete) | yes: each outcome, each refusal, and `saveMeasurement` merging (`measurements.test.ts:168-192`) |
| Histórico and edit-mode state through `App` | `src/components/History.tsx`, `src/components/MeasureForm.tsx`, `src/App.tsx` | `App` in jsdom: C1-C15, C17-C26 | yes: every summary kind (C5), every date format (C6), every action (C9, C17), every confirm outcome (C10-C12, C22) |
| Histórico layout, type and colour | `src/index.css:114-133` | Playwright at 360×740: C27-C31 (`e2e/historico.spec.ts:4`) | yes as written. C29 runs in both schemes. The uncovered style values are a step-1 finding, not an unmet row |

## Faults injected

- **Scratch worktree.** Created with `git worktree add --detach <scratchpad>/wt HEAD`, with Playwright moved to port 5197 in the scratch only.
- **`node_modules`.** It started as a symlink, then became a real copy (see the C28 note). The baseline in the scratch was 8/8 green before the faults that count.
- **Each mutation.**
  - Applied by an exact single-occurrence string replace, and shown by `git diff -U0`.
  - The covering proofs were run in the scratch.
  - The file was restored with `git checkout --`, and `git status -- src e2e` showed 0 changes.
- **Clean-up.**
  - `git worktree remove --force` and `prune` were run. `git worktree list` shows only the main tree.
  - The real tree's `git status --porcelain` equals the baseline taken before the run: ` M .specs/STATE.md` (the orchestrator's edit, present before this run) and `?? .playwright-mcp/`.

| Mutation | Location | Killed |
| --- | --- | --- |
| F1 rows oldest first (drop `.reverse()`) | `src/components/History.tsx:51` | yes: `every entry newest first` ×, `opening a row shows its values` × |
| F2 year rule inverted (`===` -> `!==`) | `src/components/History.tsx:10` | yes: `row date shows the year only when it differs` × |
| F3 edit merges instead of replacing | `src/domain/measurements.ts:61` | yes: `edit measurement > replaces the values…` ×, `saving an edit replaces the values` × |
| F4 an all-blank edit cannot be submitted (`canSave = valid && !blank`) | `src/components/MeasureForm.tsx:109` | yes: `a cleared edit offers to delete` ×, `deleting from the form asks first` × |
| F5 actions left-aligned (`flex-end` -> `flex-start`) | `src/index.css:127` | yes: `open row arrangement at 360` × at `:83` (received 173) |
| P1 `.hist` `padding: 0` removed (list indented 40px) | `src/index.css:115` | no: survived, 8/8 green. Arrangement gap |
| P2 value-line divider `solid --line` -> `dashed --cherry` | `src/index.css:123` | no: survived, 8/8 green |
| P3 "Cancelar" background transparent, 12px, dashed border | `src/index.css:130` (an added `.confirm .ghost` rule) | no: survived, 8/8 green |
| P4 `.row-head` background `--blush`, `text-align: center`, radius 0 | `src/index.css:117` | no: survived, 8/8 green |
| P5 open chevron `rotate(180deg)` -> `rotate(90deg)` | `src/index.css:121` | no: survived, 8/8 green (C30 asserts only "not none") |
| P6 "Fazer a primeira" body font, weight 400, 14px, radius 4px, colour `--ink` | `src/index.css:109` (an added `.empty .cta` rule) | no: survived, 8/8 green |
| P7 `.hist` `list-style: disc` | `src/index.css:115` | no: survived. It has no visible effect, because each `li` is `display: flex` and draws no marker. Listed for completeness only |
| P8 `.vals dd` `margin: 0` removed | `src/index.css:126` | no: survived, 8/8 green |

**Totals.** 5 behaviour faults, all 5 killed. The cap of five covered the domain rule, the summary and date logic, the form's edit state and the CSS arrangement. 8 probes on uncovered mockup values, all 8 survived. P1-P6 are findings. P7 and P8 document the remaining members.

## Gate

At `d91b1a1`, on the real tree:

- `pnpm vitest run`: 10 files, **183 passed**, 0 failed.
- `pnpm exec playwright test`: **45 passed**, 0 failed.

## Swept existing

- **failure modes.** The storage warning "Seus dados não estão sendo salvos neste navegador" is at `src/App.tsx:138`, with its proof at `src/App.test.tsx:780`. The constraint is present.
- **Other rows.** They name checks (C11, C14, C16, C22, C26 and others), which are proven above, or `n/a`, which is approved policy.

## Findings

Ranked:

1. **28 mockup v6 values are neither checked nor named out of reach.** Six probes on them survived (P1-P6). This is the lembrete round 1-3 failure again. `checks.md:152` lists 19 values, and the Coverage row at `checks.md:147` groups members so that this is hidden.
   - The two **arrangement** members come first:
     - `.hist { margin: 0; padding: 0 }`: rows flush with the card's content edge (P1)
     - `.row-head { text-align: left }`: the summary starts right after the date (P4)
   - Then the visible values:
     - the row button's `background: none` and `border-radius: 10px` (P4)
     - the value-line divider's colour `--line` and style `solid` (P2)
     - the chevron's `rotate(180deg)` (P5, a precision gap in C30)
     - "Cancelar"'s `--surface` background, 14px size and `solid` border style (P3)
     - "Fazer a primeira"'s `--on-accent` text, `--display` family, weight 600, size 16px, radius 999px, padding 9px 18px, margin 0 and `border: 0` (P6)
     - `.hist li`'s border style `solid`
     - `.confirm { align-items: center }` and `.confirm .danger { border: 0 }`
     - `.vals { margin: 0 }` and `.vals div { gap: 8px }`
   - Two have no visible effect: `.hist { list-style: none }` (P7) and `.vals { gap: 0 }`.
   - **Fix:** add checks, or name each one out of reach against Histórico. Either way, the per-member list is in "Decided values".
2. **The empty state as the mockup draws it.** Mockup v6 puts the empty state inside `.hist` as an `li` (l.857). It therefore gets `.hist li`'s 1px `--line` top divider, and an effective padding of `4px 0 8px`. The app renders `div.empty` with no divider (`src/components/History.tsx:64`). `checks.md:152` names the padding as "10px 0 14px". This is either a missing element or a mis-stated exemption, and the user should decide which.
3. **A contradiction with the binding source (AC 3, C3).** The mockup's "Fazer a primeira" calls `openForm()`, which resets an open form to today and blank fields (l.858, l.820-822). The plan and checks keep the open form instead. This mirrors lembrete's confirmed "Medir agora" Assumption, but it is not in historico's Assumptions table or in the user's list of approved deviations. **Fix:** a confirmed Assumption row, or align with the mockup.

Notes (not failing):

- **AC 16 / C15.** The mockup leaves the form open in edit mode when its entry is deleted from a row. Saving then throws, because `ex` is undefined at l.846. This is a mockup defect, not a decision. The plan's closing of the form is the sound reading, but it is not recorded as an Assumption either.
- **C30 precision.** The chevron transform is asserted as "not `none`". See finding 1.
- **C28 environment sensitivity.** See the note under Checks.
- **Lessons step.** The step that distils lessons (`scripts/lessons.py`) was not run. This verifier writes only this report; that step is for the orchestrator.
