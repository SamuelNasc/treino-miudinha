# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: grafico (slice 6 of 7 in `.design/body-measurements.md`)
**Where**: plan written, `validate_plan` exit 0, awaiting Samuel's review. Mockup v6's Gráfico approved as-is by Samuel 2026-10-09 (no v7). Profile ui
**In progress**: none
**Next step**: Samuel reviews `.specs/features/grafico/plan.md` (three `n` defaults: AC 7 copy, pair with different dates, chip size), then checks.md
**Blockers**: none
**Uncommitted**: `.specs/features/grafico/plan.md`, this file
**Branch**: main, pushed 2026-10-09 (4bf7012), Vercel production deploy succeeded. Measurement, Menu, Registrar medição, Lembrete and Histórico are live
