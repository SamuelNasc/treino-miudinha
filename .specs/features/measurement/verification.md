# Measurement verification

**Verdict**: PASS
**Profile**: standard
**Diff range**: 9e5a252..e0681b7
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier)

Proof run (one invocation, all 20 checks, 21 named tests), at `e0681b7`:
`pnpm vitest run src/domain/measures.test.ts src/domain/measurements.test.ts src/domain/store.test.ts src/App.test.tsx --reporter=verbose -t "<alternation of the 21 proof names>"` - exit 0, 21 passed, 41 skipped. Each of the 21 names appears individually as passed in the verbose output. All 21 tests are new in the diff range (`git diff 9e5a252..e0681b7` adds them to the four files). The frozen fixture `tests/fixtures/store-9e5a252.ts` was diffed against `git show 9e5a252:src/domain/store.ts`: identical except two comment lines and the `plan` import path.

## Checks

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | `MEASURES` is exactly the 11 ids, units and ranges, in order | batched run, `lists exactly the 11 measures` passed | `src/domain/measures.test.ts:6` - `expect(MEASURES.map(({ id, unit, min, max }) => [id, unit, min, max])).toEqual([["peso","kg",30,200], ... ["panturrilha-e","cm",20,60]])` | PASS |
| C2 | record without the fields loads with `[]`, default reminder, workouts intact | batched run, `record without measurement fields loads with defaults` passed | `src/domain/store.test.ts:85` - `expect(measurementsOf(record)).toEqual([])`; `:86` - `expect(reminderOf(record)).toEqual({ everyDays: 7, snoozedOn: null })`; `:78` (via `:87`) - `expect({ version: 1, completions, today, weights, restSeconds }).toEqual(WORKOUTS_ONLY)` | PASS |
| C3 | load + save back, and opening the app, write neither key | batched run, `absent measurement fields stay absent on save` and `opening the app writes no measurement fields` passed | `src/domain/store.test.ts:94-96` - `expect(stored).not.toHaveProperty("measurements")`, `...("reminder")`, `expect(stored).toEqual(WORKOUTS_ONLY)`; `src/App.test.tsx:626-627` - `expect(stored()).not.toHaveProperty("measurements")`, `expect(stored()).not.toHaveProperty("reminder")` (after a write proven at `:625`) | PASS |
| C4 | save on a new date inserts in date order with exactly the given values | batched run, `save on a new date adds one entry in date order` passed | `src/domain/measurements.test.ts:23` - `expect(measurementsOf(next)).toEqual([{10-01 peso 63}, { date: "2026-10-03", values: { cintura: 70 } }, {10-05 quadril 95}])` | PASS |
| C5 | save onto an existing date merges; repeat is identical | batched run, `save onto an existing date merges` passed | `src/domain/measurements.test.ts:33` - `toEqual([{ date: "2026-10-05", values: { peso: 62.5, cintura: 70, busto: 90 } }])`; `:35` - `expect(measurementsOf(twice)).toEqual(measurementsOf(once))` | PASS |
| C6 | `{}` and `{ peso: undefined }` refused `empty`, record unchanged | batched run, `save with no values is refused` passed | `src/domain/measurements.test.ts:42` - `expect(result).toEqual({ ok: false, reason: "empty", record })`; `:43` - `expect(result.record).toBe(record)` | PASS |
| C7 | min/max accepted, ±0.1 refused for all 11; 62.95, NaN, Infinity refused; mixed save refused whole naming only the bad ids | batched run, `invalid values refuse the whole save` passed | `src/domain/measurements.test.ts:50-51` - `.ok ... toBe(true)` for min and max per id; `:54` - `toEqual({ ok: false, reason: "invalid", invalid: [id], record })`; `:59` - same shape with `invalid: ["peso"]`; `:68` - `expect(mixed.record).toBe(record)`; `:69` - `[...mixed.invalid].sort()).toEqual(["cintura", "coxa-e"])` | PASS |
| C8 | 5 bad/future dates refused `date`; today accepted | batched run, `invalid or future date is refused` passed | `src/domain/measurements.test.ts:75` - `toEqual({ ok: false, reason: "date", record })` over `"", "2026-13-01", "2026-02-30", "08/10/2026", "2026-10-09"`; `:77` - today saved `toEqual([{ date: "2026-10-08", values: { peso: 62 } }])` | PASS |
| C9 | delete removes only that date | batched run, `delete removes only that date` passed | `src/domain/measurements.test.ts:86` - `expect(measurementsOf(deleteMeasurement(record, "2026-10-03"))).toEqual([{10-01 peso 63}, {10-05 quadril 95, peso 62}])` | PASS |
| C10 | `lastTapeDate` null for none/weight-only; skips later weight-only; each of 10 tape ids counts | batched run, `last tape date ignores weight-only entries` passed | `src/domain/measurements.test.ts:93-95` - `toBeNull()` x3; `:96` - `.toBe("2026-10-01")`; `:105` - `expect(tape).toHaveLength(10)`; `:107` - `.toBe("2026-10-02")` per tape id | PASS |
| C11 | deleting the last tape entry falls back to the previous one | batched run, `deleting the last tape entry falls back to the previous one` passed | `src/domain/measurements.test.ts:117` - `expect(lastTapeDate(deleteMeasurement(record, "2026-10-05"))).toBe("2026-10-01")` | PASS |
| C12 | one key `treino:v1`, `version: 1`, with the list | batched run, `measurements are stored under treino:v1 version 1` passed | `src/domain/store.test.ts:102` - `expect(localStorage.length).toBe(1)`; `:104` - `expect(stored.version).toBe(1)`; `:105` - `expect(stored.measurements).toEqual(measurements)` | PASS |
| C13 | export carries both fields; confirmed import stores them equal | batched run, `backup round-trips measurements and reminder` passed | `src/App.test.tsx:646-647` - `expect(JSON.parse(text).measurements).toEqual(measurements)`, `...reminder).toEqual(reminder)`; `:655-656` - `expect(stored().measurements).toEqual(measurements)`, `expect(stored().reminder).toEqual(reminder)` | PASS |
| C14 | older backup imports with "Backup importado", `[]` and default reminder | batched run, `older backup without measurements imports` passed | `src/App.test.tsx:673` - `expect(await screen.findByText("Backup importado")).toBeInTheDocument()`; `:675` - `expect(measurementsOf(stored())).toEqual([])`; `:676` - `expect(reminderOf(stored())).toEqual({ everyDays: 7, snoozedOn: null })` (seeded with a Measurement first, so a merge would fail) | PASS |
| C15 | malformed entries dropped, others and workouts kept | batched run, `malformed measurement entries are dropped` passed | `src/domain/store.test.ts:130` - `expect(measurementsOf(record)).toEqual(good)` over `"x"`, `null`, missing date, `"2026-02-30"`, `"x"`, `5`, values `null`/`[62]`/`62`, nothing-valid `{pescoco, peso: 680}` and `{}`; `:131` - `expectWorkoutsKept(record)` | PASS |
| C16 | unknown id, non-number, out-of-range, two decimals dropped; valid values kept | batched run, `unknown ids and invalid values are dropped from an entry` passed | `src/domain/store.test.ts:138` - `expect(measurementsOf(record)).toEqual([{ date: "2026-10-05", values: { quadril: 95, busto: 90 } }])` from `{ pescoco: 30, peso: "62", cintura: 680, quadril: 95, "coxa-d": 70.25, busto: 90 }` | PASS |
| C17 | duplicate dates merge in file order, sorted | batched run, `duplicate dates merge in file order` passed | `src/domain/store.test.ts:149` - `toEqual([{ date: "2026-10-01", values: { peso: 64 } }, { date: "2026-10-05", values: { peso: 62, cintura: 70 } }])` | PASS |
| C18 | `{}`, `"x"`, `null` read as none, workouts kept | batched run, `measurements that is not a list reads as none` passed | `src/domain/store.test.ts:158` - `expect(measurementsOf(record), ...).toEqual([])`; `:159` - `expectWorkoutsKept(record)` | PASS |
| C19 | everyDays 7/14/30/null kept, others → 7; snoozedOn valid kept, invalid/missing → null | batched run, `reminder settings fall back to defaults` passed | `src/domain/store.test.ts:166-169` - `.toBe(7)`, `.toBe(14)`, `.toBe(30)`, `.toBeNull()`; `:170-173` - `.toBe(7)` for `10`, `"7"`, missing, `5`; `:174` - `.toBe("2026-10-06")`; `:175-177` - `.toBeNull()` for `"2026-02-30"`, `5`, missing | PASS |
| C20 | the 9e5a252 parser accepts a record with Measurements, workouts equal | batched run, `the build before measurements still reads the record` passed | `src/domain/store.test.ts:188` - `expect(record).not.toBeNull()`; `:78` (via `:189`) - `expect({ version: 1, completions, today, weights, restSeconds }).toEqual(WORKOUTS_ONLY)` | PASS |

## Coverage

Recomputed from the authority named per row: the design's measure table (`.design/body-measurements.md`, Measurement slice) for ids, units and ranges; the code for the save guards, the date rule and the parser's fault rules (`src/domain/measurements.ts:39-82`, `src/domain/measures.ts:26-31`, `src/domain/dates.ts:30-31`, `src/domain/store.ts:68-69`).

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| measure ids + units + ranges (11) | design measure table | all 11 ids, units, min, max pinned in order by C1 (`measures.test.ts:6`); matches the design table row for row, D/E pairs expanded | - |
| range edges (11 × 4: min, max, min−0.1, max+0.1) | design ranges, via `MEASURES` pinned by C1 | C7, table-driven over all 11 (`measurements.test.ts:50-54`) | - |
| tape ids (10 non-`peso`) | design Key decision 4 | C10, table-driven over all 10 (`measurements.test.ts:105-107`) | - |
| save guards / outcomes (5) | code `measurements.ts:41-50` | empty `:41` C6 · bad/future date `:42` C8 · invalid value `:43-44` C7 · merge `:47-48` C5 · insert + sort `:49` C4 | - |
| value-validity rules (6) | code `measures.ts:28,31` | unknown id C16 (`pescoco`) · non-number C16 (`"62"`) · non-finite C7 (`NaN`, `Infinity`) · below min C7 · above max C7, C16 (`680`) · more than one decimal C7 (`62.95`), C16 (`70.25`). checks.md's Coverage row also credits "below min" to C16, but C16 has no below-min case; the member is proven by C7 through the same `isValidValue`, so the table over-claims without leaving it unproven | - |
| date-validity rules (4) | code `dates.ts:31`, `measurements.ts:42` | not a string C15 (`5`) · not `YYYY-MM-DD` C8 (`""`, `"08/10/2026"`), C15 (`"x"`) · not a calendar date C8 (`"2026-13-01"`, `"2026-02-30"`), C15, C19 (`"2026-02-30"`) · after today C8 (`"2026-10-09"`; today accepted) | - |
| parser entry fault rules (8) | code `measurements.ts:64-76` | not a list `:65` C18 · entry not an object `:68` C15 · bad/missing date `:70` C15 · `values` null/list/non-object `:70` C15 · invalid value dropped `:71` C16 · nothing valid left `:72` C15 · duplicate date merge, later wins `:73` C17 · ascending sort `:75` C17 | - |
| parser presence branches (2) | code `store.ts:68-69` | `measurements` absent stays absent C2, C3 · `reminder` absent stays absent C2, C3 | - |
| `reminder` rules (code `measurements.ts:78-82`): non-object (1), `everyDays` (7, 14, 30, null, other, missing = 6), `snoozedOn` (valid, invalid, missing = 3) | code | non-object C19 (`5`) · `everyDays` all 6 C19 (`store.test.ts:166-173`), absent reminder C2 · `snoozedOn` all 3 C19 (`:174-177`) | - |
| `measurements` field states (3) | plan Impact | absent C2 · not a list C18 · list C12, C15 | - |
| Landing doors (3) | plan Landing | stored shape C3, C12, C20 · measure ids C1 · one per date C5, C17 | - |
| Relations entities (3) | plan Relations | `Measurement` C4 · `ReminderSettings` C19, C13 · `MeasureValue` C16 | - |
| parse entry points (2) | code: `store.ts:81` (`loadRecord`), `Backup.tsx:27` (import) | `loadRecord` C2, C3 · Backup import C13, C14 through `App` | - |
| design Measurement state table (10 rows) | design, Measurement slice | existing record C2 · new date C4 · merge C5 · all blank C6 · out of range / decimal C7 · delete + re-derive C9, C11 · export/import C13 · older backup C14 · malformed entry / unknown id C15, C16 · older build C20 | - |
| design field table (`measurements`, `reminder.everyDays`, `reminder.snoozedOn`; `Measurement.date`, `.values`) (5) | design, Measurement slice | ordering + one per date C4, C17 · `everyDays` domain C19 · `snoozedOn` local date C19 · `date` local date C8, C15 · `values` one or more C6, C15 | - |

Sweep for sets with no row in checks.md: the design state table, the design field table, the date-validity rules and the parser presence branches had no row of their own; each was recomputed above and every member has a proof. No member named in the plan's prose lacks a proof.

Notes, not failing:

- The design's measure table also decides a `Label` and a `Guide` per id. `MEASURES` ships labels (`measures.ts:4-14`) that no check asserts. The plan defers labels to Registrar medição ("labels come with the form") and guides to MeasureGuide, and nothing reads them yet; they must be pinned in those slices.
- Step 1 is not owed under `standard`. One divergence seen while reading the binding design: its `Measurement.date` note says "Not in the future", while the parser keeps a stored or imported future-dated entry. No check asserts either way; the plan logs it as an unconfirmed assumption (`Confirmed? n`). It is not a check contradicting the design, but it needs Samuel's confirmation.

## Test policy rows

| Row | Files it classifies | Required proof | Expectation met |
| --- | --- | --- | --- |
| Decides, reached across a boundary (`parseRecord` via load and import) | `src/domain/store.ts` (`parseRecord` `:68-69`), `src/domain/measurements.ts` (`parseMeasurements`, `parseReminder`) | own layer C2, C3, C15, C16, C17, C18, C19 · through `App` C13 (accepted round-trip), C14 (old format) | yes - one asserted case per parser fault rule at its own layer (see the parser rows under Coverage), plus accepted and old-format imports through `App` |
| Decides, not reached across a boundary (save, delete, last tape date) | `src/domain/measurements.ts` (`saveMeasurement`, `deleteMeasurement`, `lastTapeDate`), `src/domain/dates.ts` (`isLocalDate`) | own layer C4-C11 | yes - every outcome (5) and every edge (range edges for all 11, today/tomorrow, weight-only vs each tape id) asserted |
| Static data (`MEASURES`) | `src/domain/measures.ts` | exact equality C1 | yes - all 11 members pinned with `toEqual` on id, unit, min, max in order; `label` is outside the projection, matching C1 and the plan's deferral of labels |

## Faults injected

Scratch worktree `git worktree add --detach /tmp/claude-1000/measurement-verify HEAD`, `node_modules` symlinked from the main tree. One fault at a time, restored after each run.

| Mutation | Location | Killed |
| --- | --- | --- |
| upper range bound `value <= measure.max` -> `value < measure.max` | `src/domain/measures.ts:31` | yes - `invalid values refuse the whole save` failed |
| merge drops earlier values: `{ ...existing?.values, ...given }` -> `{ ...given }` | `src/domain/measurements.ts:48` | yes - `save onto an existing date merges` failed |
| weight-only counts as tape: `id !== "peso"` -> `id !== ""` | `src/domain/measurements.ts:59` | yes - `last tape date ignores weight-only entries` failed |
| parser always writes `measurements` (removed the `"measurements" in r` guard) | `src/domain/store.ts:68` | yes - `absent measurement fields stay absent on save` failed |
| `isLocalDate` drops the calendar round-trip, keeps only the regex | `src/domain/dates.ts:31` | yes - `invalid or future date is refused` failed |

Real tree `git status --porcelain` before: `?? .playwright-mcp/`. After removing the worktree: identical. No `git stash` used.

## Gate

`pnpm vitest run` at `e0681b7` - 10 files, 89 passed, 0 failed (includes the unchanged `persists the door-1 record` key-list test).
