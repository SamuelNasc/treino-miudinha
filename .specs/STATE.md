# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: menu (slice 2 of 7 in `.design/body-measurements.md`)
**Where**: built and verified - 16 of 16 checks, verification PASS (round 1, full, ui, 193513a..HEAD; validate_verification exit 0). 5 faults injected, 5 killed. Vitest 98/98, Playwright 19/19
**In progress**: registrar-medicao (slice 3 of 7) - `plan.md` written, validate_plan exit 0, waiting for Samuel's review. No checks, no code
**Next step**: slice Registrar medição (replaces the Medidas placeholder). Open for Samuel: the measurement-slice assumption "a stored or imported Measurement dated after today is kept" is still unconfirmed. Verifier notes, no action needed: the tape icon check counts shapes only; tapping the active tab does not scroll to top, unlike the mockup demo
**Blockers**: none
**Uncommitted**: `.specs/features/registrar-medicao/plan.md`, this handoff
**Branch**: main, not pushed (measurement and menu slices). Menu ships with Registrar medição at the earliest (Samuel, 2026-10-08)
