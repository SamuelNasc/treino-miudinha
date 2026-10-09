# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: measure-guide (slice 7 of 7 in `.design/body-measurements.md`)
**Where**: verified - round 1 PASS: 14/14 checks, 5/5 faults killed, Vitest 219, Playwright 78, validate_verification exit 0. Clean pass, no lessons recorded
**In progress**: none
**Next step**: push and deploy after Samuel's go-ahead; the design asks his wife to see the drawings before release (plan open question 1, blocks go-live). All 7 body-measurement slices are built
**Blockers**: none
**Uncommitted**: none
**Branch**: main, 3 commits ahead of origin (25e3157, e780c6e, this one). Production still has slices 1-6
