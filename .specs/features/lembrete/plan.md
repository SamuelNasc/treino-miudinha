# Lembrete

## Problem

She can log a Measurement since slice 3, but nothing tells her when it is time to. The old Excel
sheet was meant to be weekly, and nobody counted how often it actually was (design, Problem); it
was abandoned during her break. The design's success test is "no gap longer than two cycles", and
its failure signal is fewer than two tape entries in the first two weeks. Today the app opens on
Hoje and Medidas is one tap away that she has no reason to take, so the only reminder is Samuel
remembering to get the tape.

This is slice 4 of 7 in `.design/body-measurements.md`. When it ships, Hoje opens with a card
"Hora da primeira medição" until her first tape Measurement, and from then on "Hora de medir" once
the chosen interval has passed since the last one. "Medir agora" takes her to the form, "Hoje não"
hides the card until tomorrow, and a section "Lembrete" on Medidas sets the interval to 7, 14 or 30
days, or turns it off. A weigh-in at the gym never resets it.

## Flow

This reuses `reminderOf` and `lastTapeDate` for the inputs, the `reminder` field and its parser
from the Measurement slice, `useRecord`'s write-back, `App`'s toast and page switch, the
visibility rollover that already re-renders Hoje on a new day, and `MeasureForm` as the place
"Medir agora" lands. Nothing new is stored: `reminder.everyDays` and `reminder.snoozedOn` exist.

1. Hoje renders -> `App` (exists) asks `measurements.ts` (exists, `src/domain/measurements.ts`) whether the reminder is due on `today`, from `reminderOf(record)` and `lastTapeDate(record)` -> first, due N days, or not due
2. due -> the reminder card (new, no door - placement per conventions) at the top of Hoje's page
3. "Hoje não" -> `App` sets `reminder.snoozedOn = today` -> `useRecord` (exists) writes `treino:v1`, toast "Tudo bem, lembro amanhã"
4. "Medir agora" -> `App` switches to Medidas (exists, `goTo`) and has `MeasureForm` (exists) open on today
5. Medidas renders -> the Lembrete section (new, no door - placement per conventions) below Nova medição -> a choice sets `reminder.everyDays` -> `useRecord` writes `treino:v1`
6. out: the next render of Hoje re-derives the card. A save in `MeasureForm` with a tape measure moves the last tape date, so the card goes away with no extra write

## Impact

| Front | What changes |
| --- | --- |
| screen Hoje | a card now sits above the streak card whenever the reminder is due. On a record with no tape Measurement, which is every existing test seed and her phone on first open after deploy, it is due. Hoje tests that count or locate elements from the top of the page, and the 360×740 Playwright specs that measure where Hoje's content sits, see it. Each such test is fixed by seeding a tape Measurement or the reminder off, never by loosening an assertion |
| screen Medidas | gains a section "Lembrete" after "Nova medição". `MeasureForm` gains a way to be opened from outside |
| domain | new term: due - the reminder is on, she did not tap "Hoje não" today, and either no tape Measurement exists or at least `everyDays` calendar days passed since the last one. Lives in `src/domain/measurements.ts`. Nothing branches on it yet |
| domain | existing term: `reminder.snoozedOn` - the date she last tapped "Hoje não", unchanged. This slice is its first writer |
| stored data | nothing to migrate. `reminder` stays absent until her first "Hoje não" or interval choice, and absent means every 7 days, never snoozed (Measurement slice). The record stays `version: 1` |

## Relations

None - no stored-data shape change. `reminder` was settled in the Measurement slice.

## Surface

None - nothing consumed outside.

## Landing

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| None | - | - |

- Nothing in this change is hard to reverse. The due rule is computed at render and never stored (Key decision 5), so changing it is a redeploy. Both writes go into the `reminder` shape slice 1 fixed

## Criteria

### S1: The reminder card on Hoje (P1)

Hoje tells her when it is time to measure, and lets her go measure or put it off until tomorrow.

**Acceptance Criteria**

1. WHILE the reminder is on, not snoozed today, and no Measurement holds a tape measure THEN Hoje SHALL show, above the streak card, a region named "Lembrete de medidas" with the heading text "Hora da primeira medição", the text "Ela vira o seu ponto de partida.", and the buttons "Medir agora" and "Hoje não"
2. WHILE the reminder is on and not snoozed today, WHEN at least `everyDays` calendar days have passed from the last tape date to today THEN Hoje SHALL show that region with "Hora de medir" and "A última com fita foi há N dias.", N being that number of days (7 days after 2026-10-01 is 2026-10-08, N = 7)
3. WHILE fewer than `everyDays` calendar days have passed since the last tape date THEN Hoje SHALL show no region "Lembrete de medidas"
4. IF the last tape date is after today THEN the system SHALL treat the reminder as not due
5. The system SHALL ignore a Measurement holding only `peso` when finding the last tape date, so a weight-only entry newer than the last tape entry leaves the card as it was
6. WHILE the reminder is off (`everyDays` null) THEN Hoje SHALL never show the region, whatever the Measurements
7. WHEN "Hoje não" is tapped THEN the system SHALL store `reminder.snoozedOn` as today, keep `reminder.everyDays` as it was, hide the region, and show the toast "Tudo bem, lembro amanhã"
8. WHILE `reminder.snoozedOn` equals today THEN Hoje SHALL show no region. WHEN today moves past it, by a reload or by the app being resumed on a later day, THEN Hoje SHALL show the region again if it is still due
9. WHEN "Medir agora" is tapped THEN the system SHALL show Medidas with the form "Nova medição" open on today's date, and store nothing
10. IF the form is already open with typed values when "Medir agora" is tapped THEN the system SHALL leave its date and typed values as they were
11. WHILE no tape Measurement newer than the due point has been saved THEN the region SHALL stay on Hoje after "Medir agora", and WHEN a Measurement with a tape measure is saved on today THEN Hoje SHALL show no region
12. The region SHALL show on Hoje in each of its states: a rest day, a day already trained, and a workout in progress
13. WHEN the region is shown at a 360×740 viewport THEN the icon SHALL sit left of the text, and "Medir agora" SHALL sit left of "Hoje não" on one row below them, each at least 44 px tall
14. The region SHALL draw a dashed border in `--berry`, in the light and the dark colour scheme

**Independent test:** seed no Measurements and open the app: the card shows. Tap "Hoje não": it goes and the toast shows. Reload with the date a day later: it is back.

### S2: The reminder setting on Medidas (P1)

She chooses how often the card comes back, or turns it off.

**Acceptance Criteria**

15. WHILE Medidas is shown THEN the system SHALL show, after the section "Nova medição", a section headed "Lembrete" holding a group named "Lembrar a cada" with the buttons "7 dias", "14 dias", "30 dias" and "Não lembrar", in that order, exactly one with `aria-pressed="true"`: the one matching `reminder.everyDays`, "7 dias" when `reminder` is absent
16. WHEN one of those buttons is tapped THEN the system SHALL store `reminder.everyDays` as 7, 14, 30 or `null` respectively, keep `reminder.snoozedOn` as it was, and mark only that button pressed
17. WHEN the interval changes THEN Hoje SHALL derive the card from the new interval on its next render (last tape on 2026-09-28, today 2026-10-08: due at 7, not due at 14)
18. The section SHALL show one hint: "Sem lembrete. Você mede quando quiser." while the reminder is off; "Vai aparecer em Hoje até você medir com a fita. Só o peso não conta." while the card would show on Hoje; "Conta a partir da última medição com fita. Só o peso não conta." otherwise
19. The system SHALL keep the record at `version: 1` under `treino:v1` after any reminder write, with `completions`, `today`, `weights`, `restSeconds` and `measurements` unchanged by it
20. WHILE no reminder write has happened THEN the stored record SHALL have no `reminder` field

**Independent test:** on Medidas, tap "14 dias" and reload: "14 dias" is pressed and the stored record says `everyDays: 14`.

## Out of scope

Product capabilities only. Process and harness rules live in AGENTS.md or as Observable `n/a`.

| Excluded | Why |
| --- | --- |
| Push or system notifications | the design: the reminder appears when she opens the app, and a notification needs permission prompts and a background service |
| An interval other than 7, 14 or 30 days | the design's rejected alternative. It wins only if she asks for another number |
| Deleting a Measurement from the UI, after which the reminder re-derives | slice Histórico. `lastTapeDate` already re-derives after `deleteMeasurement` (Measurement slice AC 11) |
| The chart and Histórico on Medidas | their own slices |

## Assumptions

Defaults that are not already a numbered criterion. Drop a row once it is.

| Assumption | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| The card's copy (AC 1, 2) | mockup v6's: "Hora de medir" over "A última com fita foi há N dias." | the design's table says "Hora de medir: faz N dias". The mockup is later and was reviewed on screen, and splits title from detail the way the streak card does | y - Samuel, 2026-10-08 |
| Changing the interval after "Hoje não" (AC 16) | keeps the snooze, so the card stays hidden until tomorrow | mockup v6 clears it, which brings the card straight back the same day she said "Hoje não". `snoozedOn` records what she tapped, and the design calls it exactly that | y - Samuel, 2026-10-08 |
| A future-dated tape Measurement (AC 4) | not due until that date plus the interval | follows the Measurement slice's confirmed default that such entries are kept. The only way to get one is a wrong phone clock | y - Samuel, 2026-10-08 |
| "Medir agora" with the form already open (AC 10) | left as it is | mockup v6 reopens it on today, dropping what she typed. Losing typing to a button that only means "take me there" is worse | y - Samuel, 2026-10-08 |
| Pushing to her phone | Menu, Registrar medição and this slice ship together at the earliest, after Samuel's go-ahead | Push is never part of an approved plan | y - Samuel, 2026-10-08 |

**Open questions:** none - all resolved or logged above.

## Observable

Worksheet, not the review. `n/a` needs its reason. One row may group the same decision
across several routes.

| Surface | Decision | Landing |
| --- | --- | --- |
| screen Hoje · reminder card | empty state (no tape Measurement yet) | AC 1 |
| screen Hoje · reminder card | hidden states: not due, off, snoozed | AC 3, AC 6, AC 8 |
| screen Hoje · reminder card | loading, unauthorised | n/a - reads the in-memory record, single user |
| screen Hoje · reminder card | error state: storage not saving | existing - the "Seus dados não estão sendo salvos neste navegador" warning shows on both destinations (Menu AC 6). "Hoje não" then lasts until reload |
| screen Hoje · reminder card | density and ordering | AC 1 (above the streak card), AC 12, AC 13 |
| screen Hoje · reminder card | destructive action confirms | n/a - "Hoje não" hides the card until tomorrow, deletes nothing, and the card comes back by itself |
| screen Hoje · reminder card | what happens after each action | AC 7, AC 9, AC 11 |
| screen Hoje · reminder card | a new day while the app stays open | AC 8, existing visibility rollover |
| screen Hoje · reminder card | colour in both schemes | AC 14 |
| screen Medidas · Lembrete | empty state (reminder never set) | AC 15 ("7 dias" pressed), AC 20 |
| screen Medidas · Lembrete | loading, unauthorised, error | n/a - in-memory record, single user, and every choice is valid |
| screen Medidas · Lembrete | density and ordering | AC 15 |
| screen Medidas · Lembrete | destructive action confirms | n/a - "Não lembrar" is undone by tapping another interval, and no Measurement is touched |
| copy card and hints | structure and tone | AC 1, AC 2, AC 7, AC 18 - pt-BR, short, mockup v6 |

## Sources

- `.design/body-measurements.md`, slice Lembrete and Key decisions 4, 5 - confirmed by Samuel 2026-10-08
- Mockup https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa version 6 - `#nudge`, `due`, `renderNudge`, `renderRem`, `#every`, `#notToday`, `#measureNow`, the `.nudge`, `.nudge-acts`, `.cta.small` and `.seg` styles
