# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: historico (slice 5 of 7 in `.design/body-measurements.md`)
**Where**: built and verified - 35 of 35 checks, verification PASS (round 2 scoped, ui, b834871..38ec089; validate_verification exit 0). Round 1 failed on 28 unaccounted mockup v6 values and the empty state's missing divider, closed by C32-C35 and one CSS rule. Vitest 183/183, Playwright 52/52. Lessons L-008..L-011 recorded as candidates
**In progress**: none
**Next step**: Gráfico, then MeasureGuide - each needs Samuel's design review of a new mockup version first. Optional follow-up from round 2: C32/C34 sample one corner/side of the radius and padding shorthands (Q1, Q2)
**Blockers**: none
**Uncommitted**: none
**Branch**: main, pushed 2026-10-09 (4bf7012), Vercel production deploy succeeded. Measurement, Menu, Registrar medição, Lembrete and Histórico are live
