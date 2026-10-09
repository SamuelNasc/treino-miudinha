# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: measure-guide (slice 7 of 7 in `.design/body-measurements.md`)
**Where**: verified - round 1 PASS: 14/14 checks, 5/5 faults killed, Vitest 219, Playwright 78, validate_verification exit 0. Clean pass, no lessons recorded
**In progress**: none
**Next step**: none for body measurements - all 7 slices live. Plan open question 1 (his wife seeing the drawings) is still open; a band she misreads is moved by a redeploy
**Blockers**: none
**Uncommitted**: this file
**Branch**: main, pushed 2026-10-09 (94da083), Vercel production deploy succeeded. Measurement, Menu, Registrar medição, Lembrete, Histórico, Gráfico and MeasureGuide are live
