# Apagar treino

## Problem

Once every exercise of a workout is checked, the app records a Completion for that day, and
nothing can take it back. Unchecking an exercise afterwards leaves the Completion in place, and no
screen removes one. A Completion moves three things she watches: the letter on that day of the
week strip, "Esta semana: N/4" (and through it the streak), and which workout Hoje offers next.

This week she recorded her screen to show the app and checked a whole workout as an example. Her
strip now shows a letter on a day earlier this week when she did not train, her count is one too
high, and the rotation is one workout ahead. Samuel expects the same thing to happen in daily use:
a stray tap on the last exercise completes the workout, and that is the one check she cannot undo.
The only fix today is exporting the backup, editing the JSON by hand and importing it, which she
cannot do alone.

When this ships, tapping a day of this week's strip that has a letter asks "Apagar o Treino B de
qua, 07/10?" with "Apagar" and "Cancelar", and "Apagar" removes it. Unchecking an exercise of a
workout she completed today also removes today's Completion. In both cases the strip, the count,
the streak and the next workout re-derive from what is left.

## Flow

This reuses `weekStrip`, `weekCount`, `streak` and `nextWorkout`, which already derive everything
from `completions`; `toggleCheck` for the session; the `DeleteConfirm` group and its `.confirm`
styles from Histórico; `App`'s toast; and `useRecord`'s write-back. Nothing new is stored.

1. Hoje renders -> `WeekStrip` (exists, `src/components/Progress.tsx`) draws each day of this week; a day with a Completion becomes tappable
2. tap a day with a Completion -> `WeekStrip` shows below the strip one `DeleteConfirm` (exists, `src/components/History.tsx`) per workout recorded that day
3. "Apagar" -> `App` (exists) removes that one Completion through `store.ts` (exists, new function, no door) and, when it was today's, clears today's checks of that workout -> `useRecord` (exists) writes `treino:v1`, toast "Treino apagado"
4. uncheck an exercise of the workout completed today -> `App.toggle` (exists) -> `toggleCheck` (exists) plus the same removal of today's Completion -> `useRecord` writes `treino:v1`
5. out: the strip, `StreakCard`, the Picker's "próximo", and the card Hoje shows re-derive from the remaining `completions` on the next render

## Impact

| Front | What changes |
| --- | --- |
| screen Hoje | strip days with a Completion become buttons; a confirm appears under the strip when one is tapped. Days with no Completion and future days keep their look and do nothing when tapped |
| component `WeekStrip` | gains a tap and the confirm. Its existing tests assert the dot letters, labels and `data-future`; they still hold |
| component `DeleteConfirm` | today its question is fixed to "Apagar a medição de …". It takes the question from its caller, so Histórico keeps the exact text it shows now |
| domain | new term: remove a Completion - drop exactly one (date, workout) pair from `completions`. Lives in `src/domain/store.ts` beside `addCompletion` |
| domain | `toggle` in `App`: unchecking an exercise of a workout with a Completion today now removes that Completion. Before, a Completion once recorded was permanent; `nextWorkout`, `weekCount`, `streak` and `weekStrip` all branch on `completions` and need no change |
| stored data | nothing to migrate. The record stays `version: 1`; a removal writes a shorter `completions` list that every build already reads |

## Relations

None - no stored-data shape change. `completions` keeps at most one entry per (date, workout), as `addCompletion` already guarantees.

## Surface

None - nothing consumed outside.

## Landing

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| None | - | - |

- Nothing in this change is hard to reverse. A removal writes a record every build already accepts, and every screen choice is a redeploy

## Criteria

### S1: Remove a workout from this week's strip (P1)

She taps a day with a letter on this week's strip, confirms, and that workout is gone.

**Acceptance Criteria**

1. WHILE a day of the strip has one or more Completions THEN that day SHALL be a button labelled "Apagar treino de qua, 07/10" (weekday short name in lowercase, `dd/mm`), including today
2. WHILE a day of the strip has no Completion THEN that day SHALL NOT be a button and tapping it SHALL change nothing, future days included
3. WHEN a day with Completions is tapped THEN the system SHALL show directly below the strip one confirm per workout recorded that day, in the order recorded, each with the text "Apagar o Treino B de qua, 07/10?" and the buttons "Apagar" and "Cancelar", and SHALL store nothing
4. WHEN the same day is tapped again, or "Cancelar" is tapped THEN the system SHALL hide the confirm and keep every Completion
5. WHEN another day with Completions is tapped while a confirm shows THEN the system SHALL show that day's confirm in its place
6. WHEN a confirm's "Apagar" is tapped THEN the system SHALL remove exactly that (date, workout) Completion from the stored record, hide the confirm, and show the toast "Treino apagado"
7. WHEN a Completion is removed THEN the strip, "Esta semana: N/4", the streak and the Picker's "próximo" SHALL show what the remaining Completions give (Completions A on Mon 2026-10-05 and B on Wed 2026-10-07, today Fri 2026-10-09: removing B shows the Wednesday dot empty, "Esta semana: 1/4" and "próximo" under B)
8. WHEN the removed Completion is today's THEN the system SHALL clear today's checks of that workout, and Hoje SHALL show what it shows on that day with no Completion and no check (the next workout's card on a training day, the rest card on a rest day)
9. WHEN the day changes while a confirm shows (the app resumed on a later date) THEN the system SHALL hide the confirm
10. IF the removed Completion was the only one stored THEN the streak card SHALL show its empty label "Comece hoje 💪"

**Independent test:** seed A on Monday and B on Wednesday of the current week, open Hoje, tap Wednesday, "Cancelar": still there; tap Wednesday, "Apagar": dot empty, 1/4, "próximo" under B, toast shown.

### S2: Unchecking undoes today's workout (P1)

A stray tap on the last exercise is undone by unchecking any exercise.

**Acceptance Criteria**

11. WHILE workout W has a Completion today and is the workout of today's checks, WHEN an exercise of W is unchecked THEN the system SHALL remove today's W Completion and keep the other checks
12. WHEN today's Completion is removed by unchecking THEN the strip, "Esta semana: N/4", the streak and "próximo" SHALL re-derive as in AC 7, and SHALL show no toast and no celebration
13. WHEN that unchecked exercise is checked again THEN the system SHALL record today's W Completion again and show the celebration, as for any completed workout
14. The system SHALL leave `weights` unchanged by any removal, through the strip or by unchecking

**Independent test:** complete workout A today, pick A in the Picker, uncheck one exercise: Today's dot is empty, the count drops by one, "próximo" is back under A; check it again: the celebration shows and the dot reads A.

### S3: Record and arrangement (P1)

**Acceptance Criteria**

15. The system SHALL keep the record at `version: 1` under `treino:v1` after any removal, with `today` (apart from AC 8), `weights`, `restSeconds`, `measurements`, `reminder` and every other Completion unchanged
16. WHEN a confirm shows at a 360×740 viewport THEN it SHALL sit between the strip and the Picker, full width, with the question then "Apagar" then "Cancelar" in one wrapping row, each button at least 44 px tall
17. The confirm SHALL use the `--blush` background and its "Apagar" a `--cherry` fill, in the light and the dark colour scheme, as Histórico's confirm does
18. The strip day buttons SHALL keep the dot, letter and label look they have today, with a visible focus ring when focused by keyboard
19. The system SHALL keep Histórico's confirms reading the text "Apagar a medição de 08/10?"

**Independent test:** at 360×740 in both schemes, tap a day with a letter and compare the confirm with Histórico's.

## Out of scope

| Excluded | Why |
| --- | --- |
| Removing Completions from past weeks | the strip shows only this week, where a wrong letter is noticed; reaching older weeks needs a history screen nobody asked for |
| Adding a Completion to a day she forgot to log | not asked for |
| Restoring weights changed during a mistaken workout | weights are retyped in their field; nothing records the previous value |
| Undo after "Apagar" | the confirm is the guard, as in Histórico. A wrong removal is redone by checking the workout again on that day only if it is today |

## Assumptions

| Assumption | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Scope of removal | current week through the strip, plus unchecking for today | Samuel, in the discovery | y - Samuel, 2026-10-09 |
| Today on the strip (AC 1) | tappable like any other day | one rule for every day; the misclick is usually noticed on the strip, not in the hidden card | n |
| Two workouts on one day (AC 3) | one confirm per workout, stacked | each removal names the workout it removes; the day is rare enough not to need a chooser | n |
| The question's wording (AC 3) | "Apagar o Treino B de qua, 07/10?" | Histórico's "Apagar a medição de 08/10?", plus the workout and the weekday the strip shows | n |
| Toast on removal from the strip (AC 6) | "Treino apagado" | Histórico's "Medição apagada" | n |
| No toast when unchecking (AC 12) | none | unchecking is already its own undo and the strip changes in view; a toast on every uncheck after completing would be noise | n |
| Today's checks after removing today's Completion from the strip (AC 8) | cleared | keeping every exercise checked with no Completion is a state nothing else produces, and the next check would re-complete it at once | n |
| No mockup | arrangement and colours copy Histórico's confirm (AC 16, 17) | the confirm already exists and is verified; a new mockup buys nothing | n |
| Pushing to her phone | after Samuel's go-ahead | push is never part of an approved plan | y - project rule |

**Open questions:** none - all resolved or logged above.

## Observable

| Surface | Decision | Landing |
| --- | --- | --- |
| screen Hoje, strip | empty state | AC 2 - a day with no Completion is not tappable |
| screen Hoje, strip | loading state | n/a - the record is read synchronously from localStorage before the first render |
| screen Hoje, strip | error state | existing - the "Seus dados não estão sendo salvos" warning covers a failed write |
| screen Hoje, strip | unauthorised state | n/a - one person, one device, no accounts |
| screen Hoje, strip | density and ordering | AC 3, AC 16 |
| screen Hoje, strip | destructive action confirms | AC 3, AC 4, AC 6 - Histórico's inline confirm |
| screen Hoje, workout card | uncheck after completion | AC 11, AC 12, AC 13 |

## Sources

- Discovery in this session, 2026-10-09 - scope: current week via the strip, plus unchecking today's workout
- `.specs/features/historico/plan.md` - the confirm, its copy and its styles
