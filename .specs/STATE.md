# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: apagar-treino (remove a workout from this week's strip, or by unchecking today's)
**Where**: verified - round 3 PASS: 22/22 checks, all faults killed (round 1 and 2 survivors closed by C20's label assertions), Vitest 236, Playwright apagar-treino 4, validate_verification exit 0. Lesson L-016 recorded (candidate)
**In progress**: none
**Next step**: push and deploy after Samuel's go-ahead; then his wife removes the demo workout from this week's strip
**Blockers**: none
**Uncommitted**: none after the verification commit
**Branch**: main, not pushed. Measure-guide and earlier features are live (pushed 2026-10-09, 94da083)
