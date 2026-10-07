# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: exercise-guides
**Where**: built and verified - 37 of 37 checks, verification PASS (round 5, scoped, at 6f8e9da; validate_verification exit 0). All 28 guides drawn. Vitest 68/68, Playwright 11/11
**In progress**: none
**Next step**: push to main (deploys to Vercel) once Samuel gives the go-ahead. Samuel approved the 22 A/B/D drawings on 2026-10-07 ("they look ok"); her recognition at the gym (open question 1) is still the plan's go-live bar - review sheet https://claude.ai/artifact/WnHqiKnvGDyYi3Edyab3kq. 2026-10-21 review: ask her which drawings she didn't recognise
**Blockers**: explicit go-ahead to push
**Uncommitted**: none
**Branch**: main (not pushed)
