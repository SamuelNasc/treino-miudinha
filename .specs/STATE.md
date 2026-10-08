# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: registrar-medicao (slice 3 of 7 in `.design/body-measurements.md`)
**Where**: built and verified - 27 of 27 checks, verification PASS (round 2 scoped, ui, d974129..b80a257; validate_verification exit 0). Round 1 FAILED on two test gaps (a parser accepting any decimals survived; mockup row arrangement unchecked), closed by C26 and C27 with no source change. 9 faults injected across both rounds, 9 killed. Vitest 121/121, Playwright 23/23
**In progress**: none
**Next step**: slice Lembrete (the reminder card on Hoje and its setting on Medidas). Open for Samuel: the measurement-slice assumption "a stored or imported Measurement dated after today is kept" is still unconfirmed. Verifier notes, no action needed: C27 does not check the cue box spans the full row width; `previous()` in `MeasureForm.tsx` relies on measurements being sorted, which every writer guarantees. Lessons L-006 and L-007 are candidates
**Blockers**: none
**Uncommitted**: none
**Branch**: main, not pushed (measurement, menu and registrar-medicao slices). Menu and Registrar medição can ship together, after Samuel's go-ahead to push
