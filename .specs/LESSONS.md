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

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
