# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: exercise-guides
**Where**: S1 (223d4bc) and S2 (f329173) built - 27 of 32 checks done, Vitest 61/61 and Playwright 6/6 green. Treino C's six guides are live in the toggle; A, B and D rows show no toggle yet (AC 20)
**In progress**: none
**Next step**: S3 batch A - draw the 6 Treino A guides in `src/domain/guides.ts`, render a contact sheet in the mockup artifact for Samuel and her to approve, then B, then D. Then C27, C29, C30, C32 and the Verifier over 93bbddc..HEAD
**Blockers**: open question 1 - each batch is pushed only after she recognises its drawings
**Uncommitted**: none
**Branch**: main (not pushed)
