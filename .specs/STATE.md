# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: grafico (slice 6 of 7 in `.design/body-measurements.md`)
**Where**: verified - round 1 FAIL (5 gaps), fixed in 02b207a/32aa089 (C37-C42 added, tip clamp and accessible-name deviations approved by Samuel 2026-10-09), round 2 scoped PASS: 42/42 checks, 18/18 faults killed, Vitest 211, Playwright 73, validate_verification exit 0. Lessons L-012..L-015 added, L-008 confirmed
**In progress**: none
**Next step**: MeasureGuide (slice 7) - needs Samuel's mockup review first
**Blockers**: none
**Uncommitted**: this file
**Branch**: main, pushed 2026-10-09 (69fb998), Vercel production deploy succeeded. Measurement, Menu, Registrar medição, Lembrete, Histórico and Gráfico are live
