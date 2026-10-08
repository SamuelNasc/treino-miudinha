# Lembrete verification

**Verdict**: PASS
**Profile**: ui
**Diff range**: 97555c4..6df0875 (HEAD). Round-4 fix range f15bb63..6df0875
**Round**: 4 - scoped (authorized by Samuel after round 3 escalated, 2026-10-08)
**Verifier**: independent sub-agent (author != verifier). Fresh context; did not build the feature or write any of the fixes

Round 3's two findings are closed. The user chose how: a new check C28 for the button row's span, and naming `.nudge-text { min-width: 0 }` and "Medir agora"'s `border: 0` out of reach.

- **C28 kills P6.** The probe that survived round 3 now fails C28: the title is 110.19px tall against a limit of 41.33px.
- **C28's other assertion was made to fail too.** Two indent faults move the button row under the text column. Both fail C28 by 50px.
- **P7 and P8 are covered by the exemption.** Both values are named in the per-screen out-of-reach list at `checks.md:130`.
- **Every decided value is accounted for.** All 53 decided mockup v6 values for the card and the setting are now either asserted or named out of reach: 25 asserted, 28 named.
- **All proofs pass.** All 28 proofs pass at `6df0875`, and both full suites are green.
- **No source change.** The fix changes no `src` file.

## Rounds 1-3 (record)

- **Round 1** (`a837eaa`, full, FAIL).
  - C1-C23 were all proven, and faults F1-F7d were all killed.
  - Probes P1 and P2 survived: the title-above-detail stacking had no check, and neither did a 2px card border.
  - Several mockup values were neither checked nor named out of reach.
  - Closed in round 2 by C24-C26.
- **Round 2** (`d692c80`, scoped, FAIL).
  - P1 and P2 were killed, and F8-F12 were killed.
  - Probes P3-P5 survived: title weight, unpressed pill colour, icon size. More mockup values were unaccounted for.
  - Closed in round 3 by C27 and a per-screen out-of-reach list.
- **Round 3** (`f15bb63`, scoped, FAIL, escalated).
  - P3-P5 were killed, and F13-F19 were killed.
  - The 53-member value set was rebuilt from mockup v6. Three members were unaccounted for:
    - P6, `.nudge-acts { grid-column: 1 / -1 }`. An arrangement gap: with it removed, the title wrapped to four lines and every proof stayed green.
    - P7, `.nudge-text { min-width: 0 }`.
    - P8, "Medir agora" `border: 0`.
  - All three probes survived. The user chose the fix: C28 for P6, and out of reach for P7 and P8.
- **Round 4** (this report) re-verifies those findings over the fix range `f15bb63..6df0875`.

## Scope of this round

- **Fix diff `f15bb63..6df0875`.**
  - `git diff --name-only` lists only `.specs/features/lembrete/checks.md` and `e2e/lembrete.spec.ts`.
  - `git diff f15bb63..6df0875 -- src | wc -l` gives `0`, so **no source file changed**.
  - Since `a837eaa`, the only `src` change in the whole range is `d692c80`'s one-line comment move in `src/domain/dates.ts`. `.design` is untouched.
  - The spec hunk is `@@ -144,3 +144,13 @@`: it appends C28 at lines 147-156, so citations at lines 1-146 are unchanged.
  - checks.md adds C28, grows the "mockup v6 elements" row from 20 to 21, adds `min-width: 0` and "border (none)" to the out-of-reach list (`checks.md:130`), and updates the cost and handoff lines.
- **Re-done at `6df0875`:**
  - all 28 proofs, in two batched invocations
  - both full suites
  - step 1 for the Hoje card only, because the checks over it changed. This includes re-checking the full 53-member value set.
  - the coverage rows the fix touched
  - faults on C28's surface: the P6 re-run, F20 and F21
  - citations for C28
- **Carried:**
  - from `a837eaa`: the C1-C13 and C16-C21 citations, the behaviour coverage rows, the Swept-existing reading and the round-1 faults. Their files are untouched apart from the one comment line.
  - from `d692c80` and `f15bb63`: the C14, C15 and C22-C27 citations (the spec file changed only after line 146) and the faults of rounds 2 and 3
  - from `f15bb63`: the Medidas setting part of step 1. The fix did not touch it.

## Binding sources

The Hoje card row is verified at `6df0875`. The other rows are carried as marked.

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| `.design/body-measurements.md` `### Lembrete` (10-row state table) and Key decisions 4, 5 | yes; carried from a837eaa (`.design` untouched in the range) | none. The copy follows mockup v6 per the confirmed Assumption | - |
| Mockup v6 card: `#nudge` markup (l.301-307) and the rules `.nudge` l.154, `.nudge-ico` l.155, `.nudge-text` l.156-158, `.nudge-acts` l.159, `.cta.small` l.160, `.cta` l.254, `.ghost-btn` l.139. Local copy `artifact-1d35028d-1791496183-91de.html` | yes, re-read at 6df0875 | none. `src/index.css:102-109` matches l.154-160 rule for rule. C28 (button row starts at the icon's left edge, title on one line) is what `grid-column: 1 / -1` with an `auto 1fr` grid draws at 360, so it contradicts nothing | - |
| Mockup v6 Lembrete section in `#page-medidas` (l.383-392), `.seg` l.237, `.seg button` l.238, `[aria-pressed="true"]` l.239 | yes, carried from f15bb63 (untouched by the fix) | none. `src/index.css:110-112` matches l.237-239 | - |
| Mockup v6 script: `due`, `renderNudge`, `renderRem`, `#every`, `#measureNow`, `#notToday` | yes, carried from a837eaa | none. The three differences are confirmed Assumptions | - |

### Decided values, re-checked against round 3's 53-member enumeration

Each member is listed with what accounts for it: a check, or OOR (named in `checks.md:130`).

**Hoje card: 38 members, all accounted for (15 asserted, 23 OOR).**

| Rule | Members |
| --- | --- |
| `.nudge` | background `--surface` OOR · border width 2px C25 · border style dashed C15 · border colour `--berry` C15 · radius 22px OOR · padding 14px 16px OOR · grid gap 10px 12px OOR · `grid-template-columns: auto 1fr` C14 (icon column) and C28 (the text column keeps the width the title needs for one line) · `align-items: center` C14 |
| `.nudge-ico` | 38×38 C27 · colour `--berry` C25 |
| `.nudge-text` | column stacking C24 · `min-width: 0` **OOR (new at 6df0875)** |
| `.nudge-text strong` | family OOR · weight 600 C27 · size 19px OOR · colour `--cherry` C27 |
| `.nudge-text span` | size 14px OOR · colour `--muted` OOR |
| `.nudge-acts` | `grid-column: 1 / -1` **C28 (new)** · flex row C14 · gap 8px OOR · wrap OOR |
| "Medir agora" (`.cta` + `.cta.small`) | `border: 0` **OOR (new at 6df0875)** · background `--cherry` C27 · text colour OOR · radius OOR · family OOR · weight OOR · size 16px C27 · padding 9px 18px OOR · margin 0 OOR |
| "Hoje não" (`.ghost-btn`) | border OOR · background OOR · radius OOR · padding OOR · size OOR · colour `--muted` C27 |

**Medidas Lembrete setting: 15 members, all accounted for (10 asserted, 5 OOR).** Carried from f15bb63.

| Rule | Members |
| --- | --- |
| `.seg` | flex row C22 · wrap OOR · gap 6px OOR |
| `.seg button` | border width 2px C26 · style solid C27 · colour `--line` C23 · background `--surface` C27 · radius OOR · padding OOR · size 14px OOR · colour `--muted` C27 |
| `.seg button[aria-pressed="true"]` | border `--cherry` C23 · background `--blush` C27 · colour `--cherry` C26 · weight 500 C26 |

**Total: 53 members. 25 are asserted and 28 are named out of reach, 0 neither.**

Round 3's per-row subtotals ("17 asserted · 18 OOR", "9 · 6") were miscounted. Its member lists, recounted with "family and weight" as two members, give the split above. The total of 53 is unchanged.

Every OOR member is a value spelled in `checks.md:130` against its screen. The list has no blanket clause.

Selector-reachable enumeration per screen at `6df0875`:

- **Hoje card.**
  - Region (C2).
  - Icon left of the text (C14).
  - Title above the detail (C24).
  - Copy (C2, C3).
  - Exactly 2 buttons, in order (C24).
  - Buttons on one row below the text, each ≥ 44px (C14).
  - **The button row starts at the card's left content edge, under the icon, and the text column keeps its full width (C28).**
  - Card above the streak (C2, C14).
  - Border, icon and type styles (C15, C25, C27).
  - Absent when not due, off or snoozed (C4, C5, C7, C9).
  - **Arrangement: fully covered.**
- **Medidas Lembrete section.** Carried from f15bb63. **Arrangement: fully covered.**
- **Elements the code renders that the design does not draw:** none. `.nudge-acts button { min-height: 44px }` is AC 13.

## Checks

The proofs ran at `6df0875` on the real tree. The dev server on 5173 (pid 11452) serves `/home/samuel/projects/gym-exercices`. `git status --porcelain` showed the pre-session baseline: ` M .specs/STATE.md`, `?? .playwright-mcp/`, `?? .specs/features/lembrete/verification.md`.

- **Vitest**: one invocation for all 19 Vitest proofs.

  ```
  pnpm vitest run src/domain/measurements.test.ts src/App.test.tsx -t "reminder due|first measurement card|due card counts the days|no card before the interval|a future tape date is not due|a weight-only entry does not count|reminder off shows no card|hoje nao hides the card until tomorrow|the card comes back the next day|medir agora opens the form|medir agora keeps an open form|only a tape save clears the card|the card shows in every hoje state|lembrete setting shows the stored interval|choosing an interval stores it|a new interval applies on the next render|lembrete hint per state|reminder writes keep the rest of the record|no reminder field until she changes it" --reporter=verbose
  ```

  Exit 0, **34 passed | 78 skipped**.
  - 16 `reminder due > <row>` rows, each ✓, from `7, none` through `absent, none`.
  - 18 `Lembrete > <name>` tests, each ✓ and each listed by name.
- **Playwright**: one invocation for all 9 Playwright proofs.

  ```
  pnpm exec playwright test e2e/lembrete.spec.ts -g "card arrangement at 360|card border colour|setting arrangement at 360|pressed interval colour|card text stacks at 360|card border width and icon colour|pressed interval text|card and pill styles|button row spans the card"
  ```

  Exit 0, **14 passed**, each ✓ by name:
  - `card arrangement at 360`
  - `card border colour - light`/`- dark`
  - `pressed interval colour - light`/`- dark`
  - `setting arrangement at 360`
  - `card text stacks at 360`
  - `card border width and icon colour - light`/`- dark`
  - `pressed interval text - light`/`- dark`
  - `card and pill styles - light`/`- dark`
  - **`button row spans the card` (`e2e/lembrete.spec.ts:148`, added by 6df0875)**
- Every filter matched tests that the feature diff added.

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | due rule, 16 rows | Vitest batch, 16 rows ✓ | `src/domain/measurements.test.ts:136-151` case table; `:156` `expect(reminderDue(record, TODAY)).toEqual(expected)` | PASS |
| C2 | first card copy and buttons, before "Sequência" | Vitest batch ✓ | `src/App.test.tsx:1182-1185` `getByText`/`getByRole` `.toBeInTheDocument()`; `:1187` `compareDocumentPosition(streak) & DOCUMENT_POSITION_FOLLOWING` | PASS |
| C3 | "Hora de medir", 7 days | Vitest batch ✓ | `src/App.test.tsx:1192-1194` `getByText("A última com fita foi há 7 dias.")`, `queryByText("Hora da primeira medição")).toBeNull()` | PASS |
| C4 | tape 10-02, no card | Vitest batch ✓ | `src/App.test.tsx:1199` `expect(card()).toBeNull()` | PASS |
| C5 | future tape, no card | Vitest batch ✓ | `src/App.test.tsx:1204` `expect(card()).toBeNull()` | PASS |
| C6 | weight-only entry ignored | Vitest batch ✓ | `src/App.test.tsx:1209` `toBeNull()`; `:1212` `getByText("A última com fita foi há 7 dias.")` | PASS |
| C7 | off, no card | Vitest batch ✓ | `src/App.test.tsx:1218`, `:1221` `expect(card()).toBeNull()` | PASS |
| C8 | Hoje não hides, toasts, stores the snooze | Vitest batch ✓ | `src/App.test.tsx:1227-1229` `toHaveTextContent("Tudo bem, lembro amanhã")`, `reminder).toEqual({ everyDays: 7, snoozedOn: THU })`; `:1233-1234` `{ everyDays: 14, snoozedOn: THU }` | PASS |
| C9 | card back the next day (reload and `visibilitychange`) | Vitest batch ✓ | `src/App.test.tsx:1239`, `:1242`, `:1246`, `:1251` | PASS |
| C10 | Medir agora opens the form on today, stores nothing | Vitest batch ✓ | `src/App.test.tsx:1258` `aria-current="page"`; `:1260` `dateField().value).toBe(THU)`; `:1261` `stored()).toEqual(before)` | PASS |
| C11 | an open form keeps its values | Vitest batch ✓ | `src/App.test.tsx:1273` `toBe("2026-10-01")`; `:1274` `toBe("62")` | PASS |
| C12 | only a tape save clears the card | Vitest batch ✓ | `src/App.test.tsx:1281`, `:1286`, `:1291` `card()).toBeNull()` | PASS |
| C13 | card in every Hoje state | Vitest batch ✓ | `src/App.test.tsx:1308-1309` `expect(card(), name).toBeInTheDocument()` over the states at `:1297-1303` | PASS |
| C14 | card arrangement at 360 | Playwright batch ✓ | `e2e/lembrete.spec.ts:31` `icon.x + icon.width ≤ title.x`; `:33-34` icon centre within the text; `:38-39` buttons side by side; `:41-42` below the text, ≥ 44px; `:47` `c.y + c.height ≤ streak.y` | PASS |
| C15 | dashed `--berry` border, both schemes | Playwright batch, light ✓ dark ✓ | `e2e/lembrete.spec.ts:54` `toHaveCSS("border-top-style", "dashed")`; `:55` `toHaveCSS("border-top-color", rgb(BERRY[scheme]))`, `BERRY` at `:15` | PASS |
| C16 | section order, 4 pills, pressed pill per stored value | Vitest batch ✓ | `src/App.test.tsx:1326`, `:1330` `toEqual(INTERVALS)`, `:1332` `aria-pressed` | PASS |
| C17 | a tap stores the interval and keeps the snooze | Vitest batch ✓ | `src/App.test.tsx:1352` `toEqual({ everyDays, snoozedOn: THU })`; `:1354` | PASS |
| C18 | a new interval applies on the next render | Vitest batch ✓ | `src/App.test.tsx:1362`, `:1366` `getByText("A última com fita foi há 10 dias.")`, `:1370`, `:1375` | PASS |
| C19 | one exact hint per state | Vitest batch ✓ | `src/App.test.tsx:1389` `section.getByText(hint)`; `:1390` `toHaveLength(1)` | PASS |
| C20 | rest of the record untouched | Vitest batch ✓ | `src/App.test.tsx:1408` `after.version).toBe(1)`; `:1410-1414` | PASS |
| C21 | no `reminder` field until set | Vitest batch ✓ | `src/App.test.tsx:1422` `not.toHaveProperty("reminder")` | PASS |
| C22 | setting arrangement at 360 | Playwright batch ✓ | `e2e/lembrete.spec.ts:72`, `:74-75`, `:82`, `:86` | PASS |
| C23 | pressed and unpressed pill border colour | Playwright batch, light ✓ dark ✓ | `e2e/lembrete.spec.ts:62` `toHaveCSS("border-top-color", rgb(CHERRY[scheme]))`; `:63` `rgb(LINE[scheme])` | PASS |
| C24 | title above detail, left-aligned; exactly 2 buttons in order | Playwright batch ✓ | `e2e/lembrete.spec.ts:93` `title.y + title.height ≤ detail.y`; `:94` `Math.abs(title.x - detail.x) ≤ 1`; `:95` `toHaveText(["Medir agora", "Hoje não"])` | PASS |
| C25 | card border 2px; icon `--berry`, both schemes | Playwright batch, light ✓ dark ✓ | `e2e/lembrete.spec.ts:102` `toHaveCSS("border-top-width", "2px")`; `:103` `locator("svg")).toHaveCSS("color", rgb(BERRY[scheme]))` | PASS |
| C26 | pills 2px; pressed `--cherry` at 500; unpressed 400 | Playwright batch, light ✓ dark ✓ | `e2e/lembrete.spec.ts:110` `"border-top-width", "2px"`; `:114` `"color", rgb(CHERRY[scheme])`; `:115` `"font-weight", "500"`; `:116` `"font-weight", "400"` | PASS |
| C27 | title weight and colour, icon 38×38, button and pill styles, both schemes | Playwright batch, light ✓ dark ✓ | `e2e/lembrete.spec.ts:129` `"font-weight", "600"`; `:130` `"color", rgb(CHERRY[scheme])`; `:132-133` `icon.width).toBe(38)`, `icon.height).toBe(38)`; `:135` `"font-size", "16px"`; `:136` `"background-color", rgb(CHERRY[scheme])`; `:137` Hoje não `rgb(MUTED[scheme])`; `:141-143` unpressed pill colour, fill, `"solid"`; `:144` pressed `rgb(BLUSH[scheme])` | PASS |
| C28 | button row spans the card: "Medir agora" left edge within 1px of the icon's; title on one line | Playwright batch, `button row spans the card` ✓ | `e2e/lembrete.spec.ts:152` `expect(Math.abs(measure.x - icon.x)).toBeLessThanOrEqual(1)`; `:154-155` `lineHeight = parseFloat(getComputedStyle(el).lineHeight)`, `expect((await box(title)).height).toBeLessThan(lineHeight * 1.5)`. The computed line-height is 27.55px, so the limit is 41.33px. A `normal` line-height would parse to NaN and the assertion would fail, not pass (fails closed) | PASS |

Per-check tally: **28/28 PASS** with located evidence.

## Coverage

Recomputed at `6df0875` for the rows the fix touched. The other rows are carried as marked.

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| due outcomes (3), due inputs (7), interval edges (6), card actions (2), saves after Medir agora (2), Hoje states (3), how today changes (2), interval choices (4), stored interval on load (5), hint states (3), reminder writes (2), untouched record fields (5) | carried from a837eaa: `src/domain/measurements.ts:58-73`, the design table, mockup `#every`/`renderRem`, `src/domain/store.ts:12-22` | C1-C13, C16-C21, all re-run green at 6df0875 | - |
| colour schemes (2) | mockup `:root` l.8-29 and the dark blocks l.30-40; carried from f15bb63 | light and dark: C15, C23, C25, C26, C27, each run once per scheme. C28 claims no colour | - |
| mockup v6 decided values, Hoje card (38) | mockup l.139, l.154-160, l.254, re-checked this round | 15 asserted (C14, C15, C24, C25, C27, C28) · 23 named OOR at `checks.md:130` | - |
| mockup v6 decided values, Medidas Lembrete setting (15) | mockup l.237-239; carried from f15bb63 | 10 asserted (C22, C23, C26, C27) · 5 named OOR at `checks.md:130` | - |
| checks.md row "mockup v6 elements (21)" (`checks.md:126`) | checks.md Coverage | 21 of 21 proven as cited. The new member "button row spanning the card" is proven by C28 | - |

## Test policy rows

| Row | Files it classifies | Required proof | Expectation met |
| --- | --- | --- | --- |
| The due rule | `src/domain/measurements.ts`, `src/domain/dates.ts` | own layer C1 · through `App` C2-C9 | yes. Carried from a837eaa; re-run green at 6df0875 |
| Card and setting state through `App` | `src/App.tsx`, `src/components/Reminder.tsx`, `src/components/MeasureForm.tsx` | `App` in jsdom, C2-C13, C16-C21 | yes. Carried from a837eaa; re-run green at 6df0875 |
| Card and setting layout and colour | `src/index.css:101-112` | Playwright at 360×740: C14, C15, C22-C28 | yes, verified at 6df0875. C28 runs at 360×740 (`e2e/lembrete.spec.ts:4`). Every colour claim (C15, C23, C25, C26, C27) runs in both schemes. C28 is layout only, so one scheme meets the row |

## Faults injected

Round 4 (at `6df0875`):

- **Scratch worktree.** Created with `git worktree add --detach <scratchpad>/wt4 HEAD`, with `node_modules` symlinked. `playwright.config.ts` was edited in the scratch to use port 5197. The baseline run in the scratch was green: C14, C24 and C28 all ✓.
- **Each fault.** Applied with `sed` to `src/index.css:107` and shown applied by `git diff -U0`. Then the 9 card tests (C14, C15, C24, C25, C27 in both schemes where they have them, and C28) were run. Reverted with `git checkout -- src/index.css`.
- **Clean-up.**
  - The worktree was removed with `git worktree remove --force` and `git worktree prune`. `git worktree list` shows only the main tree, and port 5197 is free.
  - The real tree's `git status --porcelain` was diffed against the baseline taken before the round: identical.

| Mutation | Location | Proof run | Killed |
| --- | --- | --- | --- |
| R1 F1 due boundary `>=` -> `>` | `src/domain/measurements.ts:72` | C1, C3 × | yes (round 1) |
| R1 F2 weight-only exclusion removed | `src/domain/measurements.ts:69` | C1, C6 × | yes (round 1) |
| R1 F3 snooze `===` -> `<=` | `src/domain/measurements.ts:68` | C1, C9 × | yes (round 1) |
| R1 F4 hint branch inverted | `src/components/Reminder.tsx:48` | C19 × | yes (round 1) |
| R1 F5 open form reset on Medir agora | `src/components/MeasureForm.tsx:64` | C11 × | yes (round 1) |
| R1 F5b openRequest ignored | `src/components/MeasureForm.tsx:64` | C10 × | yes (round 1) |
| R1 F6 card after the streak card | `src/App.tsx:128` | C2 ×, C14 × | yes (round 1) |
| R1 F7a border `dashed` -> `solid` | `src/index.css:102` | C15 × | yes (round 1) |
| R1 F7b border `--berry` -> `--cherry` | `src/index.css:102` | C15 × | yes (round 1) |
| R1 F7c' `.nudge-acts button { min-height: 0 }` | `src/index.css:108` | C14 × | yes (round 1) |
| R1 F7d pressed border `--cherry` -> `--berry` | `src/index.css:112` | C23 × | yes (round 1) |
| R1 P1 `.nudge-text` `column` -> `row` | `src/index.css:104` | C24 × | yes (round 2) |
| R1 P2 card border `2px` -> `1px` | `src/index.css:102` | C25 × | yes (round 2) |
| R2 F8 icon `--berry` -> `--cherry` | `src/index.css:103` | C25 × | yes (round 2) |
| R2 F9 pill border `2px` -> `1px` | `src/index.css:111` | C26 × | yes (round 2) |
| R2 F10 pressed `color: --cherry` removed | `src/index.css:112` | C26 × | yes (round 2) |
| R2 F11 pressed weight 500 -> 600 | `src/index.css:112` | C26 × | yes (round 2) |
| R2 F12 third button "Depois" in the card | `src/components/Reminder.tsx:20-22` | C24 × | yes (round 2) |
| R2 P3 title weight 600 -> 400 | `src/index.css:105` | C27 × light and dark | yes (round 3) |
| R2 P4 unpressed pill `--muted` -> `--ink` | `src/index.css:111` | C27 × light and dark | yes (round 3) |
| R2 P5 icon 38px -> 24px | `src/index.css:103` | C27 × light and dark | yes (round 3) |
| R3 F13 title colour `--cherry` -> `--ink` | `src/index.css:105` | C27 × | yes (round 3) |
| R3 F14 `.cta.small` font-size 16px -> 17px | `src/index.css:109` | C27 × | yes (round 3) |
| R3 F15 "Medir agora" fill -> `--berry` | `src/index.css:109` | C27 × | yes (round 3) |
| R3 F16 `.ghost` colour `--muted` -> `--ink` | `src/index.css:206` | C27 × | yes (round 3) |
| R3 F17 unpressed pill fill `--surface` -> `--bg` | `src/index.css:111` | C27 × | yes (round 3) |
| R3 F18 pill border `solid` -> `dashed` | `src/index.css:111` | C27 × | yes (round 3) |
| R3 F19 pressed pill fill `--blush` -> `--surface` | `src/index.css:112` | C27 × | yes (round 3) |
| R3 P6 / R4 re-run: `.nudge-acts` `grid-column: 1 / -1` removed | `src/index.css:107` | Round 3: every card test passed. Round 4: `button row spans the card` × at `:155` (expected < 41.325, received 110.1875: the title on four lines). The other 8 card tests ✓ | yes (round 4) |
| R3 P7 `.nudge-text` `min-width: 0` removed | `src/index.css:104` | not re-run. The member is named out of reach at `checks.md:130` since 6df0875, so no check owns it (see note below) | n/a - out of reach |
| R3 P8 "Medir agora" given a border (mockup `.cta { border: 0 }`) | `src/index.css:109` | not re-run. The member is named out of reach at `checks.md:130` since 6df0875 (see note below) | n/a - out of reach |
| R4 F20 button row under the text column: `grid-column: 1 / -1` -> `2 / -1` | `src/index.css:107` | `button row spans the card` × at `:152` (expected ≤ 1, received 50). The other 8 card tests ✓, so only C28 catches it | yes |
| R4 F21 button row indented: `padding-left: 50px` on `.nudge-acts` | `src/index.css:107` | `button row spans the card` × at `:152` (expected ≤ 1, received 50). The other 8 card tests ✓ | yes |

**Note on P7 and P8.** Neither value is checked; the user decided after round 3 to leave them unchecked. Re-applied, both probes would still pass every proof, as they did in round 3. The procedure allows naming a style value out of reach against its screen, and `checks.md:130` now does that for both. So they are recorded as resolved by exemption, not as killed.

Totals:

- **Round 4:** 3 runs (the P6 re-run, F20, F21), 3 killed. Each of C28's two assertions (`:152` and `:155`) was made to fail at least once, and in each run C28 alone failed.
- **Across all rounds:** 33 distinct mutations: 13 in round 1, 8 in round 2, 10 in round 3, 2 in round 4.
  - 31 are now killed.
  - 2 (P7, P8) are probes on values now named out of reach.
  - 0 survive against a check.

## Gate

At `6df0875`:

- `pnpm vitest run`: 10 files, **155 passed**, 0 failed. This is unchanged from round 3, as expected: the fix added only a Playwright test.
- `pnpm exec playwright test`: **37 passed**, 0 failed. Round 3 had 36; the new test is `button row spans the card`.

## Swept existing

Carried from `a837eaa`. It is still valid, because no source file has changed since then apart from the comment line.

- The storage warning is at `src/App.tsx:121`, with its proof at `src/App.test.tsx:780`.
- The visibility rollover is at `src/App.tsx:37-38`, and C9 exercises it.

## Findings

None open. Round 3's findings are closed as the user directed:

1. **Closed: the button-row arrangement (round 3, finding 1).** C28 (`e2e/lembrete.spec.ts:148-156`) asserts both parts of what `grid-column: 1 / -1` decides:
   - The row starts at the icon's left edge (`:152`). F20 and F21 are killed there.
   - The text column keeps the width it needs, so the title stays on one line (`:155`). P6 is killed there.
2. **Closed: two values neither asserted nor exempt (round 3, finding 2).** `checks.md:130` now names both against the Hoje card: "the text column's `min-width: 0`" and "Medir agora"'s "border (none)".
3. **Coverage is complete.** All 53 decided mockup v6 values for the card and setting are asserted or named out of reach, 0 neither.

Notes:

- **Precision, carried.** C23 says `border-color` but reads only the top side. That is enough, because one shorthand sets all four sides (`src/index.css:111-112`).
- **Precision, new.** C28's one-line bound holds only for the "Hora da primeira medição" copy at 360. The shorter "Hora de medir" fits trivially, and the first-measurement title is the longer of the two, so the bound is the stricter case.
- **Report correction.** Round 3's per-screen asserted and OOR subtotals were miscounted. Its total of 53 was correct.
