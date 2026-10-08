# Project state

## Decisions

| ID | Decision | Rationale | Status | Date |
| --- | --- | --- | --- | --- |
| AD-001 | Every exercise id in `PLAN` has one `ExerciseGuide` in `GUIDES` (`src/domain/guides.ts`), drawn in the shared grammar (exercise-guides door 1). A trainer change that adds an exercise ships its guide with it; renaming an id is still forbidden | guides key on the stable exercise ids; an orphan or missing guide fails the tests | active | 2026-10-07 |

## Handoff

**Feature**: lembrete (slice 4 of 7 in `.design/body-measurements.md`)
**Where**: built and verified - 28 of 28 checks, verification PASS (round 4 scoped, ui, 97555c4..6df0875; validate_verification exit 0). Rounds 1-3 failed on test gaps only (unchecked mockup v6 arrangement and style values), closed by C24-C28 with no source change; round 3 escalated and Samuel chose to close and re-verify. 33 faults across 4 rounds, 31 killed, 2 probes on values named out of reach. Vitest 155/155, Playwright 37/37
**In progress**: none
**Next step**: slice Histórico (the list of past Measurements, with edit and delete). Then Gráfico and MeasureGuide, each needing a design review first
**Blockers**: none
**Uncommitted**: none
**Branch**: main, not pushed (measurement, menu, registrar-medicao, lembrete). They ship together after Samuel's go-ahead to push
