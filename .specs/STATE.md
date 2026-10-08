# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: lembrete (slice 4 of 7 in `.design/body-measurements.md`)
**Where**: `plan.md` written, `validate_plan` exit 0, waiting for Samuel's review. No checks, no code
**In progress**: none
**Next step**: Samuel reviews `.specs/features/lembrete/plan.md` (4 defaults with `Confirmed? n`), then `checks.md` under profile `ui`. Closed: the Measurement slice's "a stored or imported Measurement dated after today is kept" - Samuel took the recommended default, 2026-10-08. Carried from registrar-medicao, no action needed: C27 does not check the cue box spans the full row width; `previous()` in `MeasureForm.tsx` relies on sorted measurements. Lessons L-006 and L-007 are candidates
**Blockers**: none
**Uncommitted**: `.specs/features/lembrete/plan.md`, the confirmed row in `.specs/features/measurement/plan.md`, this file
**Branch**: main, not pushed (measurement, menu and registrar-medicao slices). Menu and Registrar medição can ship together, after Samuel's go-ahead to push
