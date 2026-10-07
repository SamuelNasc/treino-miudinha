# Exercise guides

> Plan from this document. Each slice below carries its own shape - copy it, do not re-derive it.
> Status: confirmed by Samuel, 2026-10-07

## Situation

- Project: in steady use. One person, Samuel's wife, trains with it on her phone, installed as a PWA.
- Decision: was open, and settled in this discovery. Samuel approved the mockup drawings ("they look amazing").
- In flight: nothing. This follows the plan's existing rules: the trainer's plan is static content that is redeployed when it changes, and exercise ids are stable identities.
- At stake: low. Nothing stored changes, and a bad drawing or cue line is fixed with a redeploy. The one real cost is content: 26 drawings.

## Problem

She already knows how to do every exercise, because the trainer taught her. What she can't do mid-workout is link a **name** to a **movement**: "Hack… which one was that?" Today she googles the name between sets or asks the trainer. Nobody has counted how often. Samuel reports it from watching her train, and it happens with the less obvious names, not every exercise.

## Success

- Worked if: within two weeks she stops googling exercise names or asking the trainer at the gym.
- Going wrong: she still googles specific exercises (those drawings don't identify them), or she never opens "como faz" at all (the entry point is invisible or the drawings don't help).
- Review: 2026-10-21. Samuel asks her which drawings she didn't recognize.

## Boundary

In: one guide per exercise in the plan (a drawing plus one cue line), opened inline from the Hoje checklist.

Out:
- A separate exercise-list tab. She needs the guide mid-workout, and leaving the checklist between sets is the friction this removes.
- Photos and video. The drawings are the chosen medium, and video needs a network connection and isn't a quick reminder.
- Editing guides in the app. There is no plan editor, and guides change by redeploy, like the plan.
- Variants for a specific gym's machines. The drawings are generic machines, and her recognition is the test.

Unchanged: the exercise ids in the plan, the `Exercise` and `Workout` shapes, the stored record and its version (still 1), the backup file format, the check-off, weight and rest-timer behaviour.

## Shape

An `ExerciseGuide` is static content keyed by exercise id: a cue line, plus a drawing described as data (machine, start pose, end pose, movement arrows). It is rendered as vector art from the app's theme tokens. The Hoje checklist gets a "como faz" toggle per exercise that expands that exercise's guide inline, one at a time. The only part that is costly to change is the drawing format, since 26 drawings will be authored in it. Changing it later means redrawing, which is why Key decision 3 fixes it now.

The heavier alternative is image files per exercise (photos or illustrated PNGs). That only wins if someone other than Claude produces the art, and nobody will.

## Key decisions

1. **Guides are keyed by exercise id in their own record, separate from the plan's exercises.** `abdominal-reto` and `abdominal-inferior` appear in both Treino B and D. As a field on `Exercise`, their guides would be duplicated and could drift apart. One id gets one guide wherever it appears.
2. **Guides are static content shipped in the app bundle, never stored.** Nothing goes into localStorage or the backup, so the record keeps version 1 and an old backup still imports. Because the bundle is precached, guides work offline at the gym with no extra caching rule.
3. **Every drawing uses one visual grammar: machine outline, start pose faded, end pose solid, green dashed movement arrow, in a 200×140 frame, colours taken only from theme tokens.** This is the grammar of the six approved mockup drawings. It makes each drawing a set of poses rather than freehand art, which is what makes 26 of them feasible and keeps them readable in dark mode. A figure is a head, a hair bun, a torso, and legs and arms as two segments each.
4. **The cue is one line in pt-BR, a reminder and not instruction, about 120 characters at most.** It names the setup and the movement ("Costas no encosto inclinado, ombros sob as almofadas. Desce até o joelho fazer 90° e empurra a plataforma."). The trainer stays the authority on form, so cues never prescribe load, tempo or breathing.
5. **Opening a guide never checks the exercise, and checking never closes the guide.** The check button and the name are separate tap targets. She may look, do the set, and check, all while the guide stays open.
6. **Which guide is open lives only in the screen.** It is not saved: reloading, resuming the next day or switching workouts starts with every guide closed.

## Work

| Slice | Delivers | Status |
|---|---|---|
| [ExerciseGuide](#exerciseguide) | The guide record, the drawing renderer, and Treino C's six guides ported from the mockup | clear |
| [Como faz](#como-faz) | The inline toggle on each Hoje checklist row | open — 1 default taken |
| [Guides for Treino A, B and D](#guides-for-treino-a-b-and-d) | The remaining 20 guides, recognised by her | open — 1 default taken |

Order: ExerciseGuide → Como faz → Guides for Treino A, B and D. After the first two, she can use Treino C's guides at the gym while the other 20 are drawn.

Already handled by existing code: rest day and "Feito por hoje" show no checklist, so there is nothing to expand. The new bundle reaches her phone through the existing auto-updating service worker.

Derivable from the repository, left to the plan: copy tone, tap-target size, focus styles and theme tokens, all as the existing checklist row does them.

### ExerciseGuide

**Delivers** the content record and its renderer, with Treino C's six approved drawings. **Status: clear.** This slice holds the door of Key decision 3.

| State | What should happen |
|---|---|
| Exercise in the plan has a guide | Its drawing renders in the 200×140 frame with the start pose faded, the end pose solid and the arrow, in the current theme |
| Dark mode | The same drawing in the dark tokens, still legible (checked against the mockup) |
| A guide's id is not in the plan | The build's tests fail. An orphan guide means an id was renamed, which Door 2 forbids |
| Screen reader | The drawing is announced as an image named after the exercise, and the cue is read as text |

Record `ExerciseGuide`, keyed by exercise id:

| Field | Type | Null | Note |
|---|---|---|---|
| `cue` | string | no | One line, pt-BR (Key decision 4) |
| `machine` | vector shapes | yes | Empty for free-weight exercises such as Sumô |
| `start` | pose | no | Drawn faded |
| `end` | pose | no | Drawn solid |
| `moves` | arrows, one or more | no | Abdução has two |

A pose is head, optional bun position, neck, hip, legs (knee and foot each) and arms (elbow and hand each), plus optional props that move with the pose (a dumbbell, a roller pad).

Alternatives considered: hand-authored SVG per exercise. That wins if the drawings stop being stick figures. Today it makes 26 files that can't share the grammar.

### Como faz

**Delivers** a "como faz" toggle under each exercise name on the Hoje checklist, which expands the guide inside that row. **Status: open.**

| State | What should happen | Caller sees |
|---|---|---|
| First view of a workout | All guides closed | Each row with a guide shows "como faz ▾" next to its sets |
| Tap a closed exercise's name | That guide opens inside the row, below the name, check and weight. Any other open guide closes | The drawing with the legend "começo · fim", then the cue line. The toggle reads "fechar" |
| Tap the open exercise's name | It closes | Back to "como faz ▾" |
| Check the exercise while its guide is open | Checked as today. The guide stays open (Key decision 5) | The strike-through name and the open guide |
| Switch workout in the picker | Every guide closes (Key decision 6) | The new workout's list, all closed |
| Exercise has no guide | No toggle. The row looks as it does today | No "como faz" |
| Keyboard | The name is a button that reports expanded or collapsed | Focus ring as on the other controls |

1. An exercise without a guide shows no toggle - default: hidden, not disabled. This only happens if the trainer adds an exercise before its drawing exists.

### Guides for Treino A, B and D

**Delivers** the 20 remaining guides in the grammar of Key decision 3, so every exercise in the plan has one. **Status: open.**

| State | What should happen |
|---|---|
| Every exercise in the plan | Has a guide, and the coverage test lists none missing |
| A drawing she doesn't recognise | Redrawn, with recognition by her as the bar, not anatomical accuracy |
| Exercise shared between B and D | One guide, shown in both (Key decision 1) |

1. Review happens before release - default: each batch of drawings (A, then B, then D) is rendered as a contact sheet in the mockup for Samuel and her to approve before it ships.

## Migration

None. Nothing stored changes (Key decision 2). The next time she opens the app, the service worker picks up the new bundle and the guides are there.

## Sources

- `docs/exercices-list.md` - the trainer's plan: 26 distinct exercises
- `.specs/features/gym-app/plan.md` - Door 2 (stable exercise ids) and the static-plan, no-editor scope
- Mockup https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa, version 4 - the approved visual grammar and Treino C's six drawings and cues
