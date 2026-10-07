# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: exercise-guides
**Where**: plan approved, checks.md written (30 checks, profile ui) - no code
**In progress**: none
**Next step**: build S1 - save the mockup v4 HTML to `tests/fixtures/mockup-v4.html`, then write the tests for C1-C14
**Blockers**: none
**Uncommitted**: `.specs/features/exercise-guides/plan.md`, `.specs/features/exercise-guides/checks.md`, `.specs/STATE.md`
**Branch**: main
