# Measurement checks

Profile: standard
Plan: `.specs/features/measurement/plan.md`

20 checks in 1 slice · 3 one-way doors · 0 open

Domain proofs are Vitest unit tests (`src/domain/*.test.ts`). The backup and app-open proofs
render `App` in jsdom, as the existing Backup tests do, with `TZ=America/Sao_Paulo` from
`vitest.config.ts`. "Today" in the domain tests is passed in explicitly as `2026-10-08`.

## Checks

### S1 - Measurements live in her record and survive backup · 9 files · ~51 KB · ~13k

**C1** - `MEASURES` equals, in this order, exactly: `peso` kg 30–200, `busto` cm 50–160, `cintura` cm 40–150, `abdomen` cm 40–160, `quadril` cm 60–170, `braco-d` cm 15–60, `braco-e` cm 15–60, `coxa-d` cm 30–90, `coxa-e` cm 30–90, `panturrilha-d` cm 20–60, `panturrilha-e` cm 20–60 (AC 1, door 2) — done
Proof: `pnpm vitest run src/domain/measures.test.ts -t "lists exactly the 11 measures"`

**C2** - Loading a stored record with no `measurements` and no `reminder` gives `measurementsOf` = `[]`, `reminderOf` = `{ everyDays: 7, snoozedOn: null }`, and `completions`, `today`, `weights`, `restSeconds` equal to the stored ones (AC 2) — done
Proof: `pnpm vitest run src/domain/store.test.ts -t "record without measurement fields loads with defaults"`

**C3** - A stored record with neither key, loaded and saved back, is stored with neither `measurements` nor `reminder`; opening the app on such a record leaves both keys absent from `treino:v1` (AC 3) — done
Proof: `pnpm vitest run src/domain/store.test.ts -t "absent measurement fields stay absent on save"`
Proof: `pnpm vitest run src/App.test.tsx -t "opening the app writes no measurement fields"`

**C4** - Saving `{ cintura: 70 }` on `2026-10-03` into a record holding `2026-10-01` and `2026-10-05` gives three entries ordered `10-01`, `10-03`, `10-05`, the new one with values exactly `{ cintura: 70 }` (AC 4, door 1) — done
Proof: `pnpm vitest run src/domain/measurements.test.ts -t "save on a new date adds one entry in date order"`

**C5** - Saving `{ peso: 62.5, busto: 90 }` onto a date holding `{ peso: 63, cintura: 70 }` leaves one entry for that date with values `{ peso: 62.5, cintura: 70, busto: 90 }`; saving the same values again leaves it identical (AC 5, door 3) — done
Proof: `pnpm vitest run src/domain/measurements.test.ts -t "save onto an existing date merges"`

**C6** - Saving `{}` or `{ peso: undefined }` is refused with reason `empty` and returns the record unchanged (AC 6) — done
Proof: `pnpm vitest run src/domain/measurements.test.ts -t "save with no values is refused"`

**C7** - For every one of the 11 ids, its min and max are accepted and min − 0.1 and max + 0.1 are refused; `62.95`, `NaN` and `Infinity` are refused; a save mixing valid and invalid values is refused whole, returns the record unchanged, and names every invalid id and only those (AC 7) — done
Proof: `pnpm vitest run src/domain/measurements.test.ts -t "invalid values refuse the whole save"`

**C8** - Saving with date `""`, `"2026-13-01"`, `"2026-02-30"`, `"08/10/2026"` or `"2026-10-09"` (tomorrow) is refused with reason `date` and returns the record unchanged; `"2026-10-08"` (today) is accepted (AC 8) — done
Proof: `pnpm vitest run src/domain/measurements.test.ts -t "invalid or future date is refused"`

**C9** - Deleting `2026-10-03` from entries `10-01`, `10-03`, `10-05` leaves exactly `10-01` and `10-05` with their values unchanged (AC 9) — done
Proof: `pnpm vitest run src/domain/measurements.test.ts -t "delete removes only that date"`

**C10** - `lastTapeDate` is `null` for no entries and for weight-only entries; is the tape entry's date when a later weight-only entry exists; and counts each of the 10 tape ids alone as a tape Measurement (AC 10) — done
Proof: `pnpm vitest run src/domain/measurements.test.ts -t "last tape date ignores weight-only entries"`

**C11** - With tape entries on `10-01` and `10-05`, deleting `10-05` makes `lastTapeDate` `2026-10-01` (AC 11) — done
Proof: `pnpm vitest run src/domain/measurements.test.ts -t "deleting the last tape entry falls back to the previous one"`

**C12** - Saving a record holding Measurements writes one localStorage key, `treino:v1`, whose JSON has `version: 1` and the `measurements` list (AC 12, door 1) — done
Proof: `pnpm vitest run src/domain/store.test.ts -t "measurements are stored under treino:v1 version 1"`

**C13** - In the app, exporting a record with Measurements and `reminder { everyDays: 14, snoozedOn: "2026-10-06" }` downloads a file holding both, and importing that file (confirmed) stores equal `measurements` and `reminder` (AC 13) — done
Proof: `pnpm vitest run src/App.test.tsx -t "backup round-trips measurements and reminder"`

**C14** - In the app, importing a backup with no `measurements` and no `reminder` (confirmed) is accepted with "Backup importado", and the stored record gives `measurementsOf` = `[]` and the default reminder (AC 14) — done
Proof: `pnpm vitest run src/App.test.tsx -t "older backup without measurements imports"`

**C15** - `parseRecord` drops an entry that is not an object, has a missing or invalid date (`"2026-02-30"`, `"x"`, `5`), has `values` that is `null`, a list or a number, or has no valid value left; it keeps the other entries and returns `completions`, `today`, `weights`, `restSeconds` intact (AC 15) — done
Proof: `pnpm vitest run src/domain/store.test.ts -t "malformed measurement entries are dropped"`

**C16** - `parseRecord` drops from an entry a value with an unknown id (`pescoco`), a non-number (`"62"`), an out-of-range value (`680`) and a value with two decimals (`70.25`), keeping the entry with its valid values (AC 16) — done
Proof: `pnpm vitest run src/domain/store.test.ts -t "unknown ids and invalid values are dropped from an entry"`

**C17** - `parseRecord` on entries `10-05 { peso: 63, cintura: 70 }`, `10-01 { peso: 64 }`, `10-05 { peso: 62 }` gives two entries ordered `10-01`, `10-05`, the second `{ peso: 62, cintura: 70 }` (AC 17) — done
Proof: `pnpm vitest run src/domain/store.test.ts -t "duplicate dates merge in file order"`

**C18** - `parseRecord` with `measurements` set to `{}`, `"x"` or `null` gives `measurementsOf` = `[]` and keeps `completions`, `today`, `weights`, `restSeconds` (AC 18) — done
Proof: `pnpm vitest run src/domain/store.test.ts -t "measurements that is not a list reads as none"`

**C19** - `parseRecord` keeps `everyDays` 7, 14, 30 and `null`; reads 10, `"7"`, missing, and a non-object `reminder` as 7; keeps a valid `snoozedOn` and reads `"2026-02-30"`, `5` and missing as `null` (AC 19) — done
Proof: `pnpm vitest run src/domain/store.test.ts -t "reminder settings fall back to defaults"`

**C20** - The `parseRecord` frozen from 9e5a252 (`tests/fixtures/store-9e5a252.ts`, the build on her phone) accepts a record holding Measurements and a reminder, returning `completions`, `today`, `weights`, `restSeconds` equal to the input (AC 20, door 1) — done
Proof: `pnpm vitest run src/domain/store.test.ts -t "the build before measurements still reads the record"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| measure ids (11) | C1, exact equality over all 11 · range edges C7, table-driven over all 11 · tape ids C10, table-driven over the 10 non-`peso` | - |
| save outcomes (5) | new date C4 · merge C5 · empty C6 · invalid value C7 · invalid date C8 | - |
| value rejections (5) | below min C7, C16 · above max C7, C16 · two decimals C7, C16 · non-finite C7 · non-number C16 | - |
| date rejections (5) | empty C8 · bad month C8 · impossible day C8, C15 · wrong format C8, C15 · future C8 | - |
| stored-entry faults (6) | not an object C15 · bad date C15 · bad `values` C15 · nothing valid left C15 · unknown id C16 · duplicate date C17 | - |
| `measurements` field states (3) | absent C2 · not a list C18 · list C12 | - |
| `reminder.everyDays` values (6) | `7` C19 · `14` C19 · `30` C19 · `null` C19 · other value C19 · missing C2, C19 | - |
| `reminder.snoozedOn` values (3) | valid C19 · invalid C19 · missing C2, C19 | - |
| Landing doors (3) | stored shape C3, C12, C20 · measure ids C1 · one per date C5, C17 | - |
| Relations entities (3) | `Measurement` C4 · `ReminderSettings` C19 · `MeasureValue` C16 | - |
| parse entry points (2 places) | `loadRecord` C2, C3 · `Backup` import C13, C14 - both call the one `parseRecord` | - |

- Claims naming app behaviour: C3 (second proof), C13, C14 - each proof renders `App`
- No other check claims more than the cases its proof exercises

## Test policy

The repo proves domain decisions with unit tests at their own layer (`rotation.test.ts`,
`progress.test.ts`, `store.test.ts`) and app behaviour through `App` in jsdom. No written guideline
says so; these rows record it for this slice. They stay in this file.

| Code | Required proofs | Coverage expectation |
| --- | --- | --- |
| Decides, reached across a boundary (`parseRecord` via load and import) | one at its own layer **and** one through `App` | one asserted case per fault row at its own layer; accepted and old-format import through `App` |
| Decides, not reached across a boundary (save, delete, last tape date) | one at its own layer | one asserted case per outcome and per edge |
| Static data (`MEASURES`) | exact equality | every member |

Evidence:

- `src/domain/measurements.ts` (new): save decides over 5 outcomes with 4 guards (empty, date, value, merge vs insert); last tape date has 1 rule -> decides
- `src/domain/store.ts` `parseRecord`: gains 6 entry-fault rules and 2 reminder fallbacks -> decides
- closest analogue: `src/domain/store.test.ts` already proves `parseWeight` bounds and the stored shape at the unit level, and `App.test.tsx` proves import through `App`

Cost: 17 unit proofs across 3 test files and 3 `App` proofs. Without these rows, the parser's fault
table would be proven only by the import test's one path.

## Swept

- validation: C7, C8, C15, C16, C19
- failure modes: C15, C18 - a malformed part drops alone, the rest of her record is kept
- idempotency: C5 - saving the same values twice leaves one identical entry
- authorization: n/a - no accounts, one user on one device
- concurrency: n/a - one user, one tab; last write wins on the single key, as gym-app accepted
- data lifecycle: C3, C9 - fields absent until used, delete removes; ~50 entries a year, far below any storage limit
- dependency failure: existing - storage unavailable keeps the gym-app warning and in-memory mode (`useRecord`), unchanged by this slice
- state transitions: C10, C11
- observability: n/a - personal app, no logging requirement

## Handoff

- S1 ≈ existing `store.ts` 4 KB, `store.test.ts` 2.3 KB, `App.test.tsx` 26.6 KB, `dates.ts` 0.8 KB, `Backup.tsx` 1.6 KB, `useRecord.ts` 0.7 KB + new `measures.ts`, `measurements.ts`, their tests and the frozen fixture ≈ 15 KB → ~51 KB / 4 ≈ 13k, one domain - one builder, under the 150k budget
