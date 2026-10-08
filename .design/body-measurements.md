# Body measurements

> Plan from this document. Each slice below carries its own shape - copy it, do not re-derive it.
> Status: confirmed by Samuel, 2026-10-08

## Situation

- Project: in steady use. One person, Samuel's wife, trains with it on her phone, installed as a PWA. Her workout history lives only in that phone's stored record.
- Decision: was open, and settled in this discovery.
- In flight: nothing. This extends the stored record (gym-app door 1) and the backup (door 3) rather than adding storage beside them, and its drawings follow the exercise-guides grammar. The exercise list page stays out, as the exercise-guides design decided.
- At stake: moderate. The screens are reversible with a redeploy. The stored shape is not, because every later change runs against her real history on one phone, and a bad rollback can erase it (Key decision 2).

## Problem

She can't track her weight and body measurements in the app. Before she paused training she logged them in an Excel sheet: Samuel measured her with a tape at home, she weighed herself on the gym scale, left and right separately, about once a week. That sheet was abandoned during the break, so nothing exists today: no substitute in use and no history to bring over. She is training again, and they are taking the first measurements now, which become her baseline. Nobody counted how often the old sheet was actually updated. Samuel reports weekly was the intent.

## Success

- Worked if: by 2026-12-08 she has logged tape measurements at least every other reminder cycle, with no gap longer than two cycles.
- Going wrong: fewer than two tape entries in the first two weeks, or she taps "Hoje não" every time the reminder shows.
- Review: 2026-12-08 - Samuel opens her Histórico and counts entries. The app has no analytics, so this is checked by looking.

## Boundary

In: a Medidas page reached from a two-item menu (Hoje / Medidas). On it: logging a Measurement of 11 measures, a "where to measure" drawing for each tape measure, a Histórico list with edit and delete, a chart per measure, and the reminder settings. A reminder card on Hoje.

Out:
- The exercise list page. She doesn't need it now (Samuel, 2026-10-08), and the exercise guides already sit where she uses them.
- Importing the old Excel sheet. It no longer exists.
- Goals and targets, body fat %, progress photos. Not asked for. Each is a later addition that touches no door here.
- Push or system notifications. The reminder appears when she opens the app, which is what was asked. A notification needs permission prompts and a background service for little gain.
- Sync, accounts, backend. Unchanged from the gym-app scope.

Unchanged: the stored key `treino:v1` and its `version: 1`, `completions`, `today`, `weights`, `restSeconds`, the rotation, streak and check-off behaviour, the exercise guides, and the backup file name and import confirm.

## Shape

A `Measurement` is one dated entry holding any subset of 11 measures. Measurements and the reminder settings live inside the existing stored record, so the backup carries them unchanged. Logging on a date that already has a Measurement merges into it. The reminder is computed at open time from the date of the last Measurement that has a tape measure, and is never stored as "due". The door is the stored shape: it is added under the same key and version, so an older build reading it still keeps her workouts (Key decision 2).

The heavier alternative, a separate storage key and its own backup file, only wins if measurements must be exported or wiped independently of workouts. Nobody needs that.

## Key decisions

1. **Measurements live in the existing record, not beside it.** One key, and one backup file that is still the record verbatim (gym-app door 3), so a single export carries everything and the import confirm keeps its meaning.
2. **The new fields are additive and optional, and the record stays `version: 1`.** A build from before this feature parses a record with the new fields as a valid v1 record and keeps her workouts. It drops only the measurements on its next save. Bumping to `version: 2` would make that older build reject the record and write a fresh one over it, erasing everything. A missing field means "none yet": no measurements, and the default reminder. Bumping the version stays reserved for a change an older build cannot survive.
3. **At most one Measurement per date, and saving onto a date that has one merges.** Measures filled in this time overwrite. Measures left blank keep what was there. A weigh-in at the gym and the tape at home on the same evening become one row in Histórico and one point per line on the chart.
4. **Every measure is optional, and the reminder counts only from Measurements that contain a tape measure.** A Measurement with only `peso` is valid and never resets the reminder. Otherwise weekly gym weigh-ins would silence the tape reminder forever.
5. **The reminder is derived at open time from today, the interval and the last tape Measurement, and never stored as a state.** The record holds only the interval and the date she last tapped "Hoje não". Logging early, deleting an entry or changing the interval changes the card the next time Hoje renders, with no schedule to keep in sync.
6. **Measures are a fixed list of 11 ids with fixed units: `peso` in kg, the other 10 in cm.** Ids are stable identities, as exercise ids are (gym-app door 2). Renaming one orphans its history, and adding one later is additive under Key decision 2. Values are stored as numbers with at most one decimal and are shown with a pt-BR comma.
7. **Measure guides are static content keyed by measure id, shipped in the bundle and never stored.** Right and left share one guide, so there are 7 guides for 10 tape measures. Like the exercise guides, they add nothing to the record or the backup.

## Work

| Slice | Delivers | Status |
|---|---|---|
| [Measurement](#measurement) | The stored entries and reminder settings, their parsing, merge and backup round-trip | clear |
| [Menu](#menu) | Hoje / Medidas bar at the bottom of the screen | clear |
| [Registrar medição](#registrar-medição) | The form that logs or merges a Measurement | open — 2 defaults taken |
| [MeasureGuide](#measureguide) | 7 "where to measure" drawings, opened inline from the form | design |
| [Histórico](#histórico) | The list of past Measurements, with edit and delete | open — 1 default taken |
| [Lembrete](#lembrete) | The reminder card on Hoje and its settings on Medidas | clear |
| [Gráfico](#gráfico) | One chart per measure, with change since the first entry | design |

Order: Measurement → Menu → Registrar medição → Lembrete → Histórico → Gráfico → MeasureGuide. The first four already let her log weekly and be reminded. The chart has nothing to show until she has a few entries, and the drawings can ship after the mockup review without blocking logging. The guides start out as text cues if the drawings aren't ready yet.

Already handled by existing code: storage unavailable → the existing "Seus dados não estão sendo salvos" warning covers measurements too. A new day while the app stays open → the existing visibility rollover re-renders Hoje, so the reminder re-evaluates. The new bundle reaches her phone through the auto-updating service worker.

Derivable from the repository, left to the plan: copy tone (pt-BR, short), decimal-comma input parsing, tap-target size, focus styles, theme tokens and dark mode, toasts - all as the existing weight input, Backup and checklist row do them.

### Measurement

**Delivers** the record fields, the rules that keep them valid, and the backup round-trip. **Status: clear.** This slice holds the doors of Key decisions 2, 3 and 6.

| State | What should happen |
|---|---|
| Existing record without the new fields | Loads with no measurements and the default reminder (every 7 days, never snoozed). Workouts untouched |
| Save onto a new date | A new Measurement, and the list stays ordered by date |
| Save onto a date that has one | Merged per Key decision 3. Still one entry for that date |
| Save with every measure blank | Refused. Nothing is stored |
| A value outside its range, or more than one decimal | That measure is refused, and the form names it (see Registrar medição) |
| Delete a Measurement | Removed. If it was the last tape Measurement, the reminder re-derives from the previous one |
| Export, then import on this build | The same measurements and settings come back |
| Import an older backup without the new fields | Accepted, as in the first row |
| Import a stored or backup record with a malformed Measurement | The malformed entry is dropped and the rest of the record is kept. Same for an unknown measure id inside an entry |
| An older build opens a record that has measurements | Workouts are kept and measurements are lost on its next save (Key decision 2). See Migration |

`treino:v1` gains two fields. Nothing existing changes.

| Field | Type | Null | Note |
|---|---|---|---|
| `measurements` | list of `Measurement` | no (absent = empty) | Ordered by `date`, at most one per date (Key decision 3) |
| `reminder.everyDays` | `7` \| `14` \| `30` \| `null` | yes | `null` = reminder off. Default `7` |
| `reminder.snoozedOn` | local date `YYYY-MM-DD` | yes | The date she last tapped "Hoje não" |

`Measurement`:

| Field | Type | Null | Note |
|---|---|---|---|
| `date` | local date `YYYY-MM-DD` | no | Gym-app door 5 dates. Not in the future |
| `values` | map of measure id → number | no | One or more entries. Missing id = not measured |

Measure ids and their allowed ranges (Key decision 6):

| Id | Label | Unit | Range | Guide |
|---|---|---|---|---|
| `peso` | Peso | kg | 30–200 | none |
| `busto` | Busto | cm | 50–160 | busto |
| `cintura` | Cintura | cm | 40–150 | cintura |
| `abdomen` | Abdômen | cm | 40–160 | abdomen |
| `quadril` | Quadril | cm | 60–170 | quadril |
| `braco-d` / `braco-e` | Braço D / E | cm | 15–60 | braco |
| `coxa-d` / `coxa-e` | Coxa D / E | cm | 30–90 | coxa |
| `panturrilha-d` / `panturrilha-e` | Panturrilha D / E | cm | 20–60 | panturrilha |

The ranges catch typos like 680 for 68,0, not real bodies at the edges. Widening one later is a redeploy.

Alternatives considered: a separate `medidas:v1` key with its own backup. That wins if measurements ever need exporting or resetting without the workouts.

### Menu

**Delivers** a bar fixed to the bottom of the screen with two destinations, Hoje and Medidas, so she can reach it with her thumb. The rest timer floats just above it. **Status: clear** (Samuel chose the bottom bar on mockup version 5, 2026-10-08).

| State | What should happen |
|---|---|
| App opens | Always on Hoje. The last destination is not remembered |
| Switch to Medidas mid-workout | Hoje's checks, the open guide and the running rest timer are unaffected, and coming back shows the same workout |
| Rest timer running | Stays reachable on both destinations |


### Registrar medição

**Delivers** the form on Medidas that logs a Measurement or merges into an existing one. **Status: open.**

| State | What should happen | Caller sees |
|---|---|---|
| Open the form | Date set to today. All 11 measures blank, grouped: Peso, then tronco (busto, cintura, abdômen, quadril), then D/E pairs side by side | Units next to each field. The previous value as placeholder text, never prefilled |
| Fill only `peso` and save | Saved (Key decision 4) | Toast "Medição salva" |
| Today already has a Measurement | Form opens with today's values filled, and saving merges (Key decision 3) | The saved values in the fields |
| Save with everything blank | Nothing saved | Save button disabled |
| A value out of range or not a number | Nothing saved | That field marked, "Confira este valor" |
| Change the date to an earlier day | Saves onto that date, merging if it has one | That day's values load into the form |
| Tap "onde medir" on a tape field | Its MeasureGuide opens inline, one at a time | The drawing and cue line |

1. The previous value is a placeholder, not a prefill - default: placeholder. A prefilled value saved unchanged would record a measurement she didn't take, which shows up on the chart as a false flat line.
2. The date can't be in the future - default: the date picker's maximum is today.

### MeasureGuide

**Delivers** 7 drawings showing where the tape goes, plus a cue line each. **Status: design.** Content is static (Key decision 7).

| State | What should happen |
|---|---|
| Each tape measure | Has a guide, and the coverage test lists none missing. The D/E pairs share one |
| Dark mode | Legible in the dark tokens, like the exercise guides |
| Screen reader | Announced as an image named after the measure, and the cue read as text |

Cues, pt-BR, one line, a reminder of the landmark: cintura "Na parte mais fina, acima do umbigo"; abdômen "Na linha do umbigo"; quadril "Na parte mais larga do bumbum"; busto "Na parte mais cheia do busto"; braço "No meio do braço, relaxado"; coxa "No meio da coxa, em pé"; panturrilha "Na parte mais grossa da panturrilha". Every cue adds: fita reta, sem apertar.

- Design: the exercise-guide grammar draws side-view machines and two poses. These need a front-view standing figure and a tape band at the landmark, so the grammar is extended, not reused as-is. The figure is slim, matching her build (Samuel, 2026-10-08), and one figure serves all 7 with only the band moving. The 7 drawings are reviewed as a contact sheet, as Treino A, B and D were, and Samuel and she approve them before release.

### Histórico

**Delivers** the list of past Measurements on Medidas, newest first, with edit and delete. **Status: open.**

| State | What should happen | Caller sees |
|---|---|---|
| No Measurements | No list | "Nenhuma medição ainda" with a button to log the first |
| A Measurement, closed | One line per entry | "30/09 · 11 medidas", or "23/09 · só peso · 62,9 kg" for a weight-only entry |
| Tap a row | It opens and any other open row closes | Each measure it has on its own line, label then value with unit, then "Editar" and "Apagar" |
| Edit a row | Opens Registrar medição on that date. Clearing a field there removes that measure. Clearing all of them asks to delete the entry | The form with the values filled |
| Delete a row | Removed after a confirm | "Apagar a medição de 08/10?" |

1. The list shows every entry - default: no paging. At weekly entries that's about 50 rows a year, which a phone scrolls without trouble.

### Lembrete

**Delivers** the reminder card on Hoje and its setting on Medidas. **Status: clear.** Holds Key decisions 4 and 5.

| State | What should happen | Caller sees |
|---|---|---|
| Reminder off | No card, ever | - |
| No tape Measurement yet, reminder on | Due now | "Hora da primeira medição" · "Medir agora" / "Hoje não" |
| Last tape Measurement + interval ≤ today | Due | "Hora de medir: faz N dias" · same two buttons |
| Not yet due | No card | - |
| "Medir agora" | Opens Registrar medição. The card stays until a tape Measurement is saved | The form |
| "Hoje não" | Hidden until tomorrow, then shown again while still due | Card gone |
| She logs early | The next due date moves to the new entry + interval | No card |
| Weight-only entry | Doesn't count (Key decision 4) | Card unchanged |
| Rest day, done for today, or mid-workout | Shown on every one of them, above the streak card | The card |
| Change interval or turn it off | Applied from the next render | Setting on Medidas: "Lembrar a cada 7 / 14 / 30 dias / Não lembrar" |

Alternatives considered: any interval in days. That wins if she asks for one that isn't 7, 14 or 30.

### Gráfico

**Delivers** a chart per measure on Medidas, showing her progress since the first entry. **Status: design.**

| State | What should happen |
|---|---|
| No Measurements | No chart. Histórico's empty state covers the page |
| One entry for the chosen measure | The value and "primeira medição" in place of a line |
| Two or more entries | A line over the dates she measured, with the change since the first entry (e.g. "−2,5 cm desde 08/10") |
| D/E pair chosen | Both sides on the same chart, distinguishable without relying on colour |
| A Measurement without the chosen measure | That date has no point. The line joins the dates that have one |
| Dark mode | Legible in the dark tokens |

- Design: the Medidas mockup must show how she picks a measure (a chip row, one chart at a time, is the default to react to), the one-entry and two-entry states, a D/E pair, the empty page, and where the form, Histórico and the reminder setting sit around the chart. Built as a new version of the approved mockup https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa, and approved by Samuel before planning this slice.

## Migration

- Existing record: nothing is rewritten on load. The new fields are absent until her first Measurement or reminder change, and absent means the defaults (Key decision 2). So on her first open after deploy, Hoje shows "Hora da primeira medição", which is what they want.
- Old backups: import as before, with no measurements.
- Rollback: a deploy back to a build without this feature keeps her workouts and drops her measurements on its first save. Export a backup before any rollback. Never ship a build that bumps the version without also accepting the old one.
- A new backup imported into an old build: workouts imported, measurements silently dropped. Acceptable with one phone and no reason to go back.

## Sources

- `.specs/features/gym-app/plan.md` - doors 1 (versioned single-key record), 2 (stable ids), 3 (backup is the record verbatim), 5 (local dates)
- `.design/exercise-guides.md` - the drawing grammar and contact-sheet review that MeasureGuide extends, and the no-exercise-tab decision
- Mockup https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa, version 4 - the approved visual style the Medidas mockup builds on
- Same mockup, version 6 (2026-10-08) - the Medidas proposal for Menu, Lembrete, Registrar medição, Histórico and Gráfico, plus the slim MeasureGuide figure. Version 5 was reviewed and changed: bottom menu, slimmer figure, collapsible Histórico rows
