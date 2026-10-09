# MeasureGuide checks

Profile: ui
Plan: `.specs/features/measure-guide/plan.md`

14 checks in 3 slices · 1 one-way door · 1 open, of which 0 block (1 blocks go-live)

The guide record is proven at its own layer in `src/domain/measureGuides.test.ts` (new). Behaviour
proofs render `App` in jsdom (`src/App.test.tsx`, `describe("Registrar medição")`, with its `start`,
`openForm`, `row` and `stored` helpers). Colour, stroke and layout proofs are Playwright at 360×740
(`e2e/measure-guide.spec.ts`, new), on an empty record. Binding source: mockup v6
(https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa) - `GUIDES`, `figure()`, `where()`, the
`.guide`, `.guide svg`, `.guide p`, `.body-fill`, `.body-line`, `.tape` rules and the `--tape` token.
The expected geometry below is the output of v6's own `figure()` on its own `GUIDES` table, read
from the rendered contact sheet (L-003).

"The box" is the element "onde medir" controls (`aria-controls`). "The drawing" is the `img` named
"Onde medir: …" inside it. The seven tape rows, with v6's band ends and the ellipse `figure()` draws:

| Row | Name | Band ends | Ellipse cx, cy, rx, ry |
| --- | --- | --- | --- |
| Busto | busto | (44,62)-(76,62) | 60, 62, 19, 4 |
| Cintura | cintura | (48,80)-(72,80) | 60, 80, 15, 4 |
| Abdômen | abdômen | (47,92)-(73,92) | 60, 92, 16, 4 |
| Quadril | quadril | (44,108)-(76,108) | 60, 108, 19, 4 |
| Braço | braço | (32,70)-(40,70) | 36, 70, 7, 4 |
| Coxa | coxa | (46,136)-(58,136) | 52, 136, 9, 4 |
| Panturrilha | panturrilha | (48,170)-(57,170) | 52.5, 170, 7.5, 4 |

v6's figure, in paint order: `path.body-fill` d `M49 40 Q60 45 71 40 L77 50 Q78 60 75 68 Q70 80 71 90 Q75 100 75 112 L72 120 L61 122 L59 122 L48 120 L45 112 Q45 100 49 90 Q50 80 45 68 Q42 60 43 50 Z`;
`path.body-line` d `M43 50 Q37 56 36 70 Q35 86 34 104 M77 50 Q83 56 84 70 Q85 86 86 104`;
`path.body-line` d `M48 118 Q46 140 49 160 Q50 176 50 192 M57 122 Q58 140 56 160 Q55 176 55 192`;
`path.body-line` d `M72 118 Q74 140 71 160 Q70 176 70 192 M63 122 Q62 140 64 160 Q65 176 65 192`;
head `circle` 60, 24, r 12; bun `circle` 60, 9, r 6; then the `ellipse.tape`.

## Checks

### S1 - Seeing where the tape goes · 4 files · ~117 KB · ~29k

**C1** - Table-driven over the 7 tape rows: tapping that row's "onde medir" shows inside that row's box exactly one `img`, followed in document order by the text "<cue> Fita reta, sem apertar." (AC 1) — done
Proof: `pnpm vitest run src/App.test.tsx -t "onde medir shows the drawing"`

**C2** - `MEASURE_GUIDES` holds the 7 cue lines exactly as AC 2 writes them, compared with `toBe`: busto, cintura, abdomen, quadril, braco-d, coxa-d, panturrilha-d; and through `App`, every row shows its cue with the appended "Fita reta, sem apertar." (AC 2) — done
Proof: `pnpm vitest run src/domain/measureGuides.test.ts -t "cue lines"`
Proof: `pnpm vitest run src/App.test.tsx -t "every cue line"`

**C3** - Table-driven over the 7 rows: the drawing is an `svg` with `viewBox="0 0 120 200"` whose children are, in this order and no others, the 4 paths with the classes and `d` of v6's figure above, the head `circle` (60, 24, 12), the bun `circle` (60, 9, 6), and one `ellipse.tape` last (AC 3, AC 4 paint order) — done
Proof: `pnpm vitest run src/App.test.tsx -t "drawing is the v6 figure"`

**C4** - Table-driven over the 7 rows: the drawing's `ellipse.tape` has the `cx`, `cy`, `rx`, `ry` of the table above, as numbers (AC 4) — done
Proof: `pnpm vitest run src/App.test.tsx -t "tape band matches v6"`

**C5** - `MEASURE_GUIDES` has exactly the 10 keys `busto`, `cintura`, `abdomen`, `quadril`, `braco-d`, `braco-e`, `coxa-d`, `coxa-e`, `panturrilha-d`, `panturrilha-e`, and no `peso`; `braco-d` and `braco-e` are the same object (`toBe`), and the same for coxa and panturrilha; the 7 distinct guides have 7 distinct bands (AC 5) — done
Proof: `pnpm vitest run src/domain/measureGuides.test.ts -t "every tape measure has a guide"`

**C6** - The row Peso has no "onde medir" button, and after opening each of the 7 guides in turn, the form never holds more than one `img` named starting "Onde medir" and the row Peso never holds one (AC 6) — done
Proof: `pnpm vitest run src/App.test.tsx -t "peso has no guide"`

**C7** - Table-driven over the 7 rows: the drawing's role is `img` and its accessible name equals exactly "Onde medir: busto", "Onde medir: cintura", "Onde medir: abdômen", "Onde medir: quadril", "Onde medir: braço", "Onde medir: coxa", "Onde medir: panturrilha"; the `svg` holds no text node, and the cue is a `p` outside it (AC 7) — done
Proof: `pnpm vitest run src/App.test.tsx -t "drawing names"`

**C8** - The existing toggle is unchanged: the 7 "onde medir" buttons start collapsed, one box is open at a time, "fechar" closes it, and typed values stay (Impact - unchanged behaviour) — done
Proof: `pnpm vitest run src/App.test.tsx -t "onde medir shows the cue"`
Proof: `pnpm vitest run src/App.test.tsx -t "one cue at a time and typed values stay"`

### S2 - Look in both schemes · 3 files · ~31 KB · ~8k

**C9** - In the light and the dark scheme, with Cintura's box open: the root's `--tape` is `#3f9a4a` / `#6cc677`; the computed `fill` of `.body-fill` is `--pad` (`#f3c3cb` / `#5a2632`); the `stroke` of each `.body-line` is `--fig` (`#7a2a36` / `#ffc9d1`); the head's `fill` is `--fig`; the bun's `fill` is `--cherry` (`#b3122e` / `#ff5c75`); the `stroke` of `.tape` is `--tape`; the box's background is `--blush` (`#ffe1e6` / `#3a141c`) (AC 8, AC 9) — done
Proof: `pnpm playwright test e2e/measure-guide.spec.ts -g "guide colours"`

**C10** - With Cintura's box open: each `.body-line` has computed `fill` `none`, `stroke-width` `2.5px`, `stroke-linecap` `round`, `stroke-linejoin` `round`; `.tape` has `fill` `none`, `stroke-width` `3.5px`, `stroke-dasharray` `5px, 3px`, `stroke-linecap` `round` (AC 10) — done
Proof: `pnpm playwright test e2e/measure-guide.spec.ts -g "drawing strokes"`

**C11** - At 360×740, for each of the 7 rows with its box open: the box's computed `display` is `grid`, its first column `96px`, `column-gap` `12px`, `align-items` `center`, all four corner radii `18px`, padding top/bottom `10px` and left/right `12px`, and it spans the row's full width (±1 px); the drawing renders 96 px wide and 160 px tall with `display` `block`; the cue `p` starts at least 96 + 12 px right of the drawing's left edge (−1 px), at the same vertical centre as the drawing (±1 px), with `margin` 0 on all four sides, `font-size` `14px` and `line-height` `19.6px` (AC 11) — done
Proof: `pnpm playwright test e2e/measure-guide.spec.ts -g "guide box arrangement at 360"`

**C12** - At 360×740, for each of the 7 rows with its box open, the document's `scrollWidth` is not greater than its `clientWidth` (AC 12) — done
Proof: `pnpm playwright test e2e/measure-guide.spec.ts -g "no horizontal scroll with a guide open"`

### S3 - Staying static · 1 file · ~103 KB · ~26k

**C13** - With a stored record holding one Measurement, `localStorage["treino:v1"]` is the same string after opening the form, then opening and closing each of the 7 guides, as it was right after opening the form (AC 13) — done
Proof: `pnpm vitest run src/App.test.tsx -t "opening guides stores nothing"`

**C14** - The build type-checks with `MEASURE_GUIDES` typed `Record<Exclude<MeasureId, "peso">, MeasureGuide>`, so a tape measure with no guide fails `tsc` (door 1) — done
Proof: `pnpm tsc -b`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| tape rows (7) | Busto C1, C3, C4, C7, C11 · Cintura C1, C3, C4, C7, C9-C11 · Abdômen C1, C3, C4, C7, C11 · Quadril C1, C3, C4, C7, C11 · Braço C1, C3, C4, C7, C11 · Coxa C1, C3, C4, C7, C11 · Panturrilha C1, C3, C4, C7, C11 | - |
| tape measure ids (10) | C5, table-driven over all 10 | - |
| D/E pairs sharing (3) | braço C5 · coxa C5 · panturrilha C5 | - |
| cue lines (7) | C2, table-driven over all 7, at its own layer and through `App` | - |
| rows without a guide (1) | Peso C6 | - |
| v6 figure elements (7) | body fill C3 · arm lines C3 · left leg lines C3 · right leg lines C3 · head C3 · bun C3 · tape band C3, C4 | - |
| colour schemes (2) | light C9 · dark C9 | - |
| mockup v6 rules (6) | `.guide` C9, C11 · `.guide svg` C11 · `.guide p` C11 · `.body-fill` C9 · `.body-line` C9, C10 · `.tape` C9, C10 | - |
| v6 inline fills (2) | head `var(--fig)` C9 · bun `var(--cherry)` C9 | - |
| one-way doors (1) | door 1 C5, C14 | - |

- Claims naming layout, type or colour: C9-C12 - each proof runs in Chromium at 360×740
- Deviation from mockup v6, approved in the plan: the accessible name with the row's name in lower case, "Onde medir: abdômen", where v6 writes the key "abdomen" (C7)
- No other check claims more than the cases its proof exercises
- Out of reach, enumerated per screen against mockup v6. Nova medição · onde medir box: `.guide svg { height: auto }` is asserted through its rendered 160 px height (C11), not as a declared value. Nothing else in the rules or geometry above is out of reach

## Test policy

The repo answers the level for screens: app behaviour through `App` in jsdom, applied CSS and
layout in Playwright (exercise-guides door 3, Gráfico's test policy). The guide record decides
nothing - it is a static table - so its own-layer proof covers its contents and shape only.

| Code | Required proofs | Coverage expectation |
| --- | --- | --- |
| `MEASURE_GUIDES` (static table, no branch) | one at its own layer | every key and every cue |
| The drawing component (maps a band to an ellipse, no branch) | one through `App` | every row's geometry |
| Layout, stroke and colour | one in Playwright at 360×740 | both colour schemes where colour is claimed |

Evidence:

- `MEASURE_GUIDES`: 10 entries, 0 branch points -> data
- the drawing: `cx = (x1 + x2) / 2`, `rx = (x2 - x1) / 2 + 3`, 0 branch points -> instrumentation over data, proven by its rendered output per row
- closest analogue: `GUIDES` in `src/domain/guides.test.ts` - coverage and shape at its own layer, drawing through the component

Cost: 2 domain proofs, 7 `App` proofs, 4 Playwright proofs across 3 test files.

## Swept

- validation: C5, C14 - every tape id has a guide by type and by test; band values are static content, checked against v6 per row in C4
- failure modes: existing - storage failing shows "Seus dados não estão sendo salvos neste navegador" (Menu); the guide reads and writes nothing (C13)
- idempotency: C13 - opening and closing a guide stores nothing, so repeating it changes nothing
- authorization: n/a - no accounts, one user on one device
- concurrency: n/a - one tab, one thread; the guide is static content
- data lifecycle: C13 - no stored field is read or written
- dependency failure: n/a - no external dependency; the drawing is inline SVG in the bundle
- state transitions: C8 - closed → open → closed, one open at a time, unchanged from Registrar medição
- observability: n/a - personal app, no logging requirement

## Handoff

- S1 ≈ `MeasureForm.tsx` 8.9 KB, `App.test.tsx` 103 KB, `measures.ts` 2 KB, new `measureGuides.ts` + test ≈ 3 KB → ~117 KB / 4 ≈ 29k
- S2 adds `index.css` 21 KB and `e2e/measure-guide.spec.ts` (new, ≈ 6 KB), with `e2e/medidas.spec.ts` 5 KB read for its helpers → ~31 KB / 4 ≈ 8k; S3 is in `App.test.tsx`, already counted
- S1-S3 ≈ 148 KB / 4 ≈ 37k, under the 150k budget - one builder

- **Boundary:** C1-C14 closed (one builder, no handoff)
- **Settled mid-build:** none
- **Abandoned:** none. The head and bun take classes (`body-head`, `body-bun`) where v6 writes inline `fill` attributes, so both schemes come from the stylesheet; C9 asserts the computed fills
