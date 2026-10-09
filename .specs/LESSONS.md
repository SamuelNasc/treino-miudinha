# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Plan/Checks)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Assert transcribed reference text with exact equality, not a loose pattern match
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `plan-data` · harmful: 0
- features: gym-app
- evidence: verification.md C3 - src/domain/plan.test.ts:11 (plan-data)
- last seen: 2026-10-06T17:39:40Z

### L-002 - Derive the asserted style properties from the binding source's rules and compare computed values against it, instead of enumerating properties by hand
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `ui-styles` · harmful: 0
- features: exercise-guides
- evidence: verification.md C37 - round 4 F10/F11 (fill: none removed from .limb, .move) (ui-styles)
- last seen: 2026-10-07T18:15:42Z

### L-003 - Compare rendered output against the reference renderer's output on the same data, not only element counts and classes
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `rendering` · harmful: 0
- features: exercise-guides
- evidence: verification.md C35 - round 2 F1 (arms drawn from hip instead of neck) (rendering)
- last seen: 2026-10-07T18:15:42Z

### L-004 - Make a proof's test selector cover the whole claim; a name filter that runs a subset proves only that subset
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: exercise-guides
- evidence: verification.md C26 - round 2 (proof -t Hoje ran 10 of 24 tests) (tests)
- last seen: 2026-10-07T18:15:42Z

### L-005 - Match a value class against its full specification list, not a hand-picked subset
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `ui-styles` · harmful: 0
- features: exercise-guides
- evidence: verification.md C4/C30 - round 1 (fill=palevioletred passed) (ui-styles)
- last seen: 2026-10-07T18:15:42Z

### L-006 - Prove each validation rule with an input that only that rule rejects, not one a later check also rejects
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `validation` · harmful: 0
- features: registrar-medicao
- evidence: verification.md C10 - F1 regex loosened at src/domain/measures.ts:38 (validation)
- last seen: 2026-10-08T22:46:30Z

### L-007 - Give every row arrangement the binding mockup draws a layout check, not only the unusual ones
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `ui-layout` · harmful: 0
- features: registrar-medicao
- evidence: verification.md Binding sources - mockup v6 single-row, date-row, header and cue-below arrangement uncovered (C24 covers only D/E and Save) (ui-layout)
- last seen: 2026-10-08T22:46:30Z

### L-008 - Assert every CSS value the binding mockup decides for a new section, or name it out of reach per screen
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `ui` · harmful: 0
- features: historico
- evidence: verification round 1 P1-P6 (b834871) (ui)
- last seen: 2026-10-09T11:01:14Z

### L-009 - Assert all four sides of a padding or radius shorthand, not one side or corner
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `ui` · harmful: 0
- features: historico
- evidence: verification round 2 Q1, Q2 (ui)
- last seen: 2026-10-09T11:01:14Z

### L-010 - Assert a rotation's exact matrix after its transition settles, not only that transform is not none
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `ui` · harmful: 0
- features: historico
- evidence: verification round 1 P5, checks.md C30 (ui)
- last seen: 2026-10-09T11:01:14Z

### L-011 - Compare a mockup's empty state by its structure and dividers, not only its copy
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `ui` · harmful: 0
- features: historico
- evidence: verification round 1 gap 2, mockup l.857 (ui)
- last seen: 2026-10-09T11:01:14Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
