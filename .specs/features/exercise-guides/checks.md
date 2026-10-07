# Exercise guides ("como faz") checks

Profile: ui
Plan: `.specs/features/exercise-guides/plan.md`

32 checks in 3 slices · 3 one-way doors · 1 open, of which 0 block (1 blocks go-live)

All proofs run under `vitest.config.ts` (jsdom, `TZ=America/Sao_Paulo`). The binding mockup is
saved verbatim as `tests/fixtures/mockup-v4.html` (fetched from the artifact, not retyped), and
C7 reads its `DRAW` object from that file. So the six Treino C guides are compared against the
source, not against a second copy written by the author.

Claims about applied CSS, layout and colour scheme are proven in real Chromium by Playwright Test
(`pnpm test:e2e`, door 3), against the Vite dev server, because jsdom applies no stylesheet. Those
specs live in `e2e/` and select by role and text, like the Vitest suite.

## Checks

### S1 - ExerciseGuide · ~8 files · ~59 KB · ~15k

**C1** - A guide's drawing is one `svg` with `viewBox="0 0 200 140"` (AC 1) — done
Proof: `pnpm vitest run src/components/GuideDrawing.test.tsx -t "frame is 200x140"`

**C2** - The start pose is drawn in a `g.ghost` and the end pose in a `g` without that class. The start pose comes before the end pose in the document (AC 2) — done
Proof: `pnpm vitest run src/components/GuideDrawing.test.tsx -t "start pose faded, end pose solid"`

**C3** - A drawing has exactly one `path.move` and one `polygon.move-head` per entry of `moves`. For `abducao` that is 2 and 2, for `hack` 1 and 1 (AC 3) — done
Proof: `pnpm vitest run src/components/GuideDrawing.test.tsx -t "one arrow per move"`

**C4** - For every guide in `GUIDES`, no element of the rendered drawing has a `fill`, `stroke`, `color` or `style` value matching a hex colour, `rgb(`/`hsl(` or a CSS named colour (AC 4) — done
Proof: `pnpm vitest run src/components/GuideDrawing.test.tsx -t "no literal colour"`

**C5** - With Hack open in Chromium, the computed `--fig`, `--mach` and `--pad` on `:root` are `#7a2a36`, `#b98a92`, `#f3c3cb` under `colorScheme: "light"` and `#ffc9d1`, `#9a6670`, `#5a2632` under `colorScheme: "dark"`. In each scheme, the end pose's head has computed `fill` equal to `--fig` and the machine outline has computed `stroke` equal to `--mach` (AC 5)
Proof: `pnpm test:e2e e2e/guides.spec.ts -g "drawing tokens in light and dark"`

**C6** - The drawing has `role="img"` and the accessible name `Desenho do exercício Hack` for `hack`. The cue is a `p` element after the figure, whose text equals the guide's `cue` (AC 6) — done
Proof: `pnpm vitest run src/components/GuideDrawing.test.tsx -t "named image and cue text"`

**C7** - For each of `flexora-cadeira`, `flexora-mesa`, `sumo`, `hack`, `elevacao-pelvica` and `abducao`, the guide's `cue`, the start and end pose points (`head`, `bun`, `neck`, `hip`, `legs`, `arms`), `moves`, props (mockup `x`) and machine shapes (mockup `mach` and `floor`) equal the mockup v4 `DRAW` entry for that exercise, read from `tests/fixtures/mockup-v4.html` (AC 7, door 1) — done
Proof: `pnpm vitest run src/domain/guides.test.ts -t "treino C matches mockup v4"`

**C8** - `guideProblems` returns a problem naming `remada-curvada` for a guide keyed `remada-curvada`, and returns `[]` for `GUIDES` against `PLAN` (AC 8, door 2) — done
Proof: `pnpm vitest run src/domain/guides.test.ts -t "guide id not in plan fails"`
Proof: `pnpm vitest run src/domain/guides.test.ts -t "real guides have no problems"`

**C9** - `guideProblems` names the exercise id for a cue of 0 characters, of 121 characters, and with a `\n`. It accepts cues of 1 and of 120 characters. Every cue in `GUIDES` is 1-120 characters with no line break (AC 9) — done
Proof: `pnpm vitest run src/domain/guides.test.ts -t "cue is one line of 1-120"`
Proof: `pnpm vitest run src/domain/guides.test.ts -t "real guides have no problems"`

**C10** - `guideProblems` names the exercise id for a pose point with x = 201, a move point with y = -1, a rect whose x + w = 201, and a circle whose cy + r = 141. It accepts a point at (0, 0) and one at (200, 140) (AC 10) — done
Proof: `pnpm vitest run src/domain/guides.test.ts -t "points outside the frame fail"`

**C11** - `guideProblems` names the exercise id for a guide with `moves: []`, a start pose with `legs: []`, and an end pose with `arms: []` (AC 11) — done
Proof: `pnpm vitest run src/domain/guides.test.ts -t "missing move, leg or arm fails"`

**C12** - The renderer draws each `Shape` kind with its class: `rect` and `circle` with `as: "mach"` get class `mach`, with `as: "weight"` class `weight`. `path` with `as: "line"` gets `mach line`, `pad` gets `mach pad`, `floor` gets `floor`. Props are drawn inside their pose's group (door 1) — done
Proof: `pnpm vitest run src/components/GuideDrawing.test.tsx -t "each shape kind gets its class"`

**C13** - A pose with no `bun` draws its bun circle at `head + (-7, -6)`. A pose with `bun` draws it at that point. Each pose draws one head, one bun, one torso, and one leg polyline and one arm polyline per entry (door 1) — done
Proof: `pnpm vitest run src/components/GuideDrawing.test.tsx -t "pose parts and default bun"`

**C14** - With Hack open in Chromium, the start-pose group has computed `opacity` 0.28 and the end-pose group 1. The `Exportar backup` button and the `Importar backup` control, which already use class `ghost`, have computed `opacity` 1 (AC 2)
Proof: `pnpm test:e2e e2e/guides.spec.ts -g "only the start pose is faded"`

### S2 - Como faz · ~5 files · ~43 KB · ~11k

**C15** - On first view of Treino C, no guide region is in the document, and each of the 6 rows shows "como faz" inside its sets line, after the sets text (AC 12)
Proof: `pnpm vitest run src/App.test.tsx -t "como faz: all closed on first view"`

**C16** - Tapping "Hack" makes its row contain, in this order after the weight field, one region holding a `figure` with the drawing and a caption reading "começo" then "fim", then the cue paragraph. The toggle reads "fechar" (AC 13)
Proof: `pnpm vitest run src/App.test.tsx -t "como faz: opens inside the row"`
Proof: `pnpm test:e2e e2e/guides.spec.ts -g "guide opens inside the row"` - in Chromium, the drawing's bounding box is above the cue's, and the caption's "começo" is left of "fim"

**C17** - At a 390×844 viewport in Chromium, with Hack open, the guide region's top is at or below the bottom of Hack's check button, name button and weight field. Its left edge is within 1 px of the check button's left edge and its right edge within 1 px of the weight field's right edge (AC 13)
Proof: `pnpm test:e2e e2e/guides.spec.ts -g "guide spans the row below"`

**C18** - With Hack open, tapping "Sumô" leaves exactly one guide region in the document, Sumô's. Hack's toggle reads "como faz" (AC 14)
Proof: `pnpm vitest run src/App.test.tsx -t "como faz: one open at a time"`

**C19** - Tapping the open "Hack" name again removes its region, and the toggle reads "como faz" (AC 15)
Proof: `pnpm vitest run src/App.test.tsx -t "como faz: tap again closes"`

**C20** - With Hack open, tapping "Marcar Hack" sets its `aria-pressed="true"`, the count reads "1/6", and Hack's guide region is still in the document (AC 16)
Proof: `pnpm vitest run src/App.test.tsx -t "como faz: checking keeps it open"`

**C21** - Opening and then closing Hack leaves "Marcar Hack" at `aria-pressed="false"`, the count at "0/6", and `localStorage["treino:v1"]` byte-identical to before the first tap (AC 17)
Proof: `pnpm vitest run src/App.test.tsx -t "como faz: opening writes nothing"`

**C22** - With Hack open, picking Treino A shows no guide region. Picking Treino C again also shows none (AC 18)
Proof: `pnpm vitest run src/App.test.tsx -t "como faz: switching workout closes"`

**C23** - With Hack open, unmounting and re-rendering `App` shows no guide region. With Hack open, advancing the clock to the next day and firing `visibilitychange` shows no guide region, even when the same workout is still shown (AC 19)
Proof: `pnpm vitest run src/App.test.tsx -t "como faz: reload closes"`
Proof: `pnpm vitest run src/App.test.tsx -t "como faz: new day closes"`

**C24** - With `GUIDES` mocked to lack `extensao`, Treino A's Extensão row has no "como faz" text, and no `button` whose name contains "Extensão" other than "Marcar Extensão". Its `ex-name` and `ex-sets` text is unchanged (AC 20)
Proof: `pnpm vitest run src/App.test.tsx -t "como faz: no guide, no toggle"`

**C25** - The name of a row with a guide is a `button` with `aria-expanded="false"`, which becomes `"true"` when opened. Its `aria-controls` equals the `id` of the guide region, and that id is unique when `abdominal-reto` appears twice across B and D (AC 21)
Proof: `pnpm vitest run src/App.test.tsx -t "como faz: name button reports expanded"`

**C26** - The existing Hoje tests still find rows by `ex-name`/`ex-sets` and checks by `Marcar <name>`. The whole of `src/App.test.tsx` that existed before this feature passes unchanged (Impact: screen `Hoje`)
Proof: `pnpm vitest run src/App.test.tsx -t "Hoje"`

**C31** - `pnpm test:e2e` runs `e2e/**/*.spec.ts` in exactly one project, `chromium`, against the Vite dev server that `webServer` starts, and `pnpm test` (Vitest) does not collect any file under `e2e/` (door 3)
Proof: `pnpm test:e2e --list` - lists only `[chromium]` tests from `e2e/`
Proof: `pnpm vitest list --filesOnly` - lists no file under `e2e/`

### S3 - Guides for Treino A, B and D · ~2 files · ~50 KB · ~13k

**C27** - Every one of the 28 distinct exercise ids in `PLAN` has a `GUIDES` entry. With `GUIDES` missing `extensao` and `voador`, the coverage check lists exactly those two (AC 22)
Proof: `pnpm vitest run src/domain/guides.test.ts -t "every plan exercise has a guide"`

**C28** - `PLAN` has exactly 28 distinct exercise ids (A 6, B 9, C 6, D 7 new) (AC 22, assumption confirmed)
Proof: `pnpm vitest run src/domain/guides.test.ts -t "plan has 28 distinct exercises"`

**C29** - Opening "Abdominal reto" in Treino B and in Treino D shows the same cue text and the same drawing markup. `GUIDES` has one key `abdominal-reto` and one key `abdominal-inferior` (AC 23)
Proof: `pnpm vitest run src/App.test.tsx -t "como faz: shared exercise, one guide"`

**C30** - Every guide in `GUIDES` renders with `viewBox="0 0 200 140"`, no literal colour, its arrows and its named image, so the 22 new guides meet C1, C3, C4 and C6 (AC 1, 3, 4, 6)
Proof: `pnpm vitest run src/components/GuideDrawing.test.tsx -t "every guide renders"`

**C32** - In Chromium under `colorScheme: "dark"`, opening every exercise of Treino A, B, C and D in turn shows a drawing whose end-pose head has computed `fill` `#ffc9d1` and a visible, non-zero bounding box, for all 28 ids (AC 5, AC 22)
Proof: `pnpm test:e2e e2e/guides.spec.ts -g "every guide in dark mode"

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| Treino C guides from mockup (6) | `flexora-cadeira` C7 · `flexora-mesa` C7 · `sumo` C7 · `hack` C7 · `elevacao-pelvica` C7 · `abducao` C7 | - |
| plan exercise ids (28) | C27, table-driven over all 28 · C30, table-driven over all 28 · C32, in Chromium over all 28 | - |
| drawing tokens, applied (6 values) | light `--fig` C5 · light `--mach` C5 · light `--pad` C5 · dark `--fig` C5 · dark `--mach` C5 · dark `--pad` C5 | - |
| `Shape` kinds × `as` (7) | rect·mach C12 · rect·weight C12 · circle·mach C12 · circle·weight C12 · path·line C12 · path·pad C12 · path·floor C12 | - |
| pose parts (7) | head C13 · bun given C13 · bun default C13 · torso C13 · legs C13 · arms C13 · props C12 | - |
| invalid guide inputs (11) | id not in plan C8 · cue empty C9 · cue 121 C9 · cue line break C9 · pose point out C10 · move point out C10 · rect out C10 · circle out C10 · no moves C11 · no leg C11 · no arm C11 | - |
| cue length edges (4) | 0 C9 · 1 C9 · 120 C9 · 121 C9 | - |
| frame edges (2) | (0, 0) C10 · (200, 140) C10 | - |
| como faz states, design table (7) | first view C15 · tap closed C16 · tap open C19 · check while open C20 · switch workout C22 · no guide C24 · keyboard C25 | - |
| guide closes on (5) | tap again C19 · open another C18 · picker switch C22 · reload C23 · new day C23 | - |
| expanded row parts, mockup order (5) | drawing C16 · caption "começo" C16 · caption "fim" C16 · cue C16 · toggle "fechar" C16 | - |
| expanded row arrangement (4) | region inside the `li`, after the weight field C16 · drawing above cue C16 · below the row's controls C17 · full-row width C17 | - |
| colour schemes (2) | light C5, C14 · dark C5, C32 | - |
| one-way doors (3) | door 1 C7, C10, C12, C13 · door 2 C8, C29 · door 3 C31 | - |
| Relations entities (2) | `Exercicio` → `ExerciseGuide` C27 · shared id, one guide C29 | - |
| Impact rows (5) | `ExerciseGuide` term C8 · exercise id now keys guides C8 · Hoje row C26 · theme tokens C5 · tooling C31 | - |

- Startup config: the guides need none - they are a bundled module the component imports. The two test runners are two assemblies of the same app: Vitest renders `App` in jsdom, Playwright loads the dev server's `index.html`. C31 keeps them from collecting each other's files
- Claims naming a screen output: C15, C16, C18-C25, C29 - each proof renders `App`
- Claims about applied style, layout or colour scheme: C5, C14, C16 (second proof), C17, C32 - each proof runs in Chromium, none reads CSS as text
- No other check claims more than the cases its proof exercises

Out of reach of a selector, enumerated per screen. The Verifier compares these against the mockup
with the Playwright MCP, on screenshots in light and dark mode:

- Hoje, expanded row: the padding and gaps around the region, the blush figure background and its
  18px radius, the cue's 15px size, the legend swatch colours and size, the chevron's rotation
- the drawing: stroke widths (leg 9, arm 6, torso 15, machine 3, arrow 3 dashed 5 4), head and bun
  radii, whether each pose is recognisable. Recognition is Samuel's and hers (open question 1)

## Test policy

The repo has no guideline on which level proves which code. So these rows are the bar for this
build.

| Code | Required proofs | Coverage expectation |
| --- | --- | --- |
| Decides, reached across a boundary | one at the boundary **and** one at its own layer | the contract at the boundary; one asserted case per row of the decision table at its own layer |
| Decides, not reached across a boundary | one at its own layer | one asserted case per row of the decision table |
| Entry point that decides nothing | one at the boundary | accepted input, each rejected input, each error path |
| Instrumentation, pass-throughs | none of its own | covered by its consumer's proof |

Evidence:

- `src/domain/guides.ts` `guideProblems`: 11 rejection rules over ids, cues, bounds and parts -> decides, not reached across a boundary -> C8-C11 at its own layer
- `src/components/GuideDrawing.tsx`: dispatches over 3 shape kinds and 5 `as` values (7 combinations), plus the default-bun branch -> decides, reached through Hoje -> C12, C13 at its own layer and C16 at the screen
- `WorkoutCard` open state: open, close, switch, reset on workout and day -> decides, reached across the screen boundary -> C15-C25 through `App`, as the existing Hoje rules are
- `src/domain/guides.ts` `GUIDES`: data, no conditional -> C7, C27, C30 assert it as data
- applied CSS, layout and colour scheme: no decision in code, but jsdom cannot observe them -> Playwright in Chromium (door 3): C5, C14, C17, C32
- closest analogue in the repo: `src/domain/store.ts` `parseWeight`, proven at its own layer in `store.test.ts` (C23 of gym-app) and through `App`

Cost: 6 proofs at their own layer across 2 new test files, plus 1 Playwright spec with 5 tests. Without these rows, the shape dispatch
and the 11 rejection rules would be proven only by real data that happens to be valid, and they
could never fail.

## Swept

- validation: C9, C10, C11 - cue length and frame bounds
- failure modes: C8, C27 - bad or missing guide data fails the tests instead of the screen. C24 - a plan exercise with no guide renders the row as today
- idempotency: C19, C21 - toggling is reversible and writes nothing
- authorization: n/a - no accounts, one user on one device
- concurrency: n/a - open state is screen state in one tab, with no shared store
- data lifecycle: C21 - nothing is stored. Old backups import unchanged because the record is untouched (the gym-app import check still covers it)
- dependency failure: n/a - guides are bundled and precached, with no network fetch at all
- state transitions: C16, C18, C19, C22, C23 - closed → open → closed, and the resets
- observability: n/a - personal app, no logging requirement. The 2026-10-21 review asks her which drawings she didn't recognise

## Handoff

- S1 ≈ 59 KB + Playwright config and spec ≈ 8 KB → ~17k, S2 enters `Workout.tsx`/`App.test.tsx` at ~28k total, S3 grows `guides.ts` to ~41k total - all in one small app, under the 150k budget - one builder
- S3 is drawn in three batches (A, B, D). Each batch is pushed only after Samuel and she approve its contact sheet (open question 1). No `git push` without that go-ahead
