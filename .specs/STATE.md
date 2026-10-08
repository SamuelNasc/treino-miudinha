# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: measurement (slice 1 of 7 in `.design/body-measurements.md`)
**Where**: built and verified - 20 of 20 checks, verification PASS (round 1, full, standard, 9e5a252..e0681b7; validate_verification exit 0). 5 faults injected, 5 killed. Vitest 89/89, Playwright 11/11
**In progress**: none
**Next step**: slice Menu (Hoje / Medidas bottom bar), then Registrar medição. Open for Samuel: plan assumption "a stored or imported Measurement dated after today is kept" is unconfirmed (verifier gap 1). Labels in `MEASURES` are unchecked until Registrar medição asserts them
**Blockers**: none
**Uncommitted**: none
**Branch**: main, not pushed (bc3fec0, e0681b7 and this record)
