# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: measure-guide (slice 7 of 7 in `.design/body-measurements.md`)
**Where**: plan written - Samuel approved mockup v6's seven drawings as-is from a contact sheet 2026-10-09; `validate_plan.py` 0 errors, 1 expected warning (open question: has she seen the drawings - blocks go-live)
**In progress**: none
**Next step**: Samuel reviews `.specs/features/measure-guide/plan.md`, then checks.md (profile ui)
**Blockers**: none
**Uncommitted**: this file, `.specs/features/measure-guide/plan.md`
**Branch**: main, pushed 2026-10-09 (69fb998), Vercel production deploy succeeded. Measurement, Menu, Registrar medição, Lembrete, Histórico and Gráfico are live
