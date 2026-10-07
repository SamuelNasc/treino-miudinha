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

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
