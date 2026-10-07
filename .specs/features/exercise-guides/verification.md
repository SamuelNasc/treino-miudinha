# Exercise guides ("como faz") verification

**Verdict**: PASS
**Profile**: ui
**Diff range**: 61dd6e2..6f8e9da2ff0c870626fd7e20060f3e393ff20af2 (fix range for this round: dbfd311..6f8e9da, one commit `6f8e9da test(guides): compare drawing styles with the mockup page`)
**Round**: 5 - scoped (past the usual three-round bound, agreed by the user as the final scoped round)
**Verifier**: independent sub-agent (author != verifier)

Scope of this round: the fix's diff, round 4's one non-PASS verdict (the unproven `fill: none` declarations), and the new check C37. `git diff --stat dbfd311..HEAD` touches only `.specs/features/exercise-guides/checks.md` (+9/-5) and `e2e/guides.spec.ts` (+42/-1). Nothing under `src/`, `tests/` or the runner configs changed. Every proof re-ran in full at HEAD `6f8e9da`. Every section or row not re-judged here is marked `carried from dbfd311` (round 4) or `carried from 2954c31` (round 3, which round 4 carried).

Round 4's gap is **closed**. C37 compares 7 computed properties between the app and the mockup page, element by element. The properties are `fill`, `opacity`, `stroke`, `stroke-dasharray`, `stroke-linecap`, `stroke-linejoin` and `stroke-width`. It covers Treino C's six drawings in light and dark. Round 4's surviving mutants F10 (`.draw .limb` without `fill: none`) and F11 (`.draw .move` without `fill: none`) are now killed. So are three more style mutants that only C37 can see.

C37 does not pass vacuously. A probe run in the scratch worktree showed the following:
- Each compared drawing has 19-29 elements on each side.
- Every property has a non-empty value on every element.
- Each property takes several distinct values within a drawing. For example, `fill` takes `none`, `rgb(0, 0, 0)` and token colours, and `stroke-width` takes 1, 2, 3, 6, 9, 12 and 15 px.
- The app and the mockup render the same element sequence: same tag order, same class order, same counts.
- The six drawings together reach all 13 selectors of the mockup's `/* drawing parts */` block.

## Binding sources

Verified at 6f8e9da for mockup v4's `/* drawing parts */` rules, the only part of a binding source that the fix touched. Everything else is carried from dbfd311, which carried it from 2954c31. The fix changed no interface file (`git diff --stat dbfd311..HEAD -- src tests` is empty), so step 1 does not re-run for any screen.

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| mockup v4: `tests/fixtures/mockup-v4.html` (byte-identical to the live artifact, carried from 2954c31) | yes - verified at 6f8e9da. Re-read the `/* drawing parts */` block (`tests/fixtures/mockup-v4.html:119-133`, ending before `.foot {` at `:135`) and the dark block's `@media (prefers-color-scheme: dark)` (`:27`). The 13 rules declare exactly 7 distinct properties: `fill`, `stroke`, `stroke-width`, `stroke-linecap`, `stroke-linejoin`, `stroke-dasharray`, `opacity`. C37 slices the same block (`e2e/guides.spec.ts:142`) and extracts these 7 with a regex (`:143`). It pins the result with `toEqual` (`:156`), so if the fixture changes, the test fails instead of silently narrowing. The probe printed the slice: 816 chars, from `/* drawing parts */` to `.move-head { fill: var(--leaf); }`. Round 4's uncovered `fill: none` on `.mach.line`, `.mach.pad`, `.floor`, `.limb`, `.torso` and `.move` is now asserted by C37 at `e2e/guides.spec.ts:171`, and F10 and F11 are killed | none. C37 reads the property list from the fixture. It compares the app against the mockup page itself, opened from the fixture with `file://` (`:159`). Chromium resolves the cascade on both sides (`.mach` then `.mach.line`/`.mach.pad`, `.limb` then `.leg`/`.arm`), so no expected value is retyped. Other screens' contradictions: none, carried from 2954c31 | - |
| `.design/exercise-guides.md` | yes - carried from 2954c31, re-judged at dbfd311 for key decision 3. The dashed movement arrow's dash pattern, which earlier rounds listed as an enumerated exemption, is now asserted by C37 (`stroke-dasharray=5px, 4px`) | none | - |

## Checks

Proof runs, all at HEAD `6f8e9da` (verified at 6f8e9da):
- V = `pnpm vitest run --reporter=verbose` (whole suite), run in the real tree: exit 0, 8 files, 68 passed, each named test listed individually as passed.
- E = `CI=1 pnpm test:e2e --reporter=list` (whole suite): exit 0, 11 passed in `[chromium]`, each listed. The run used a clean detached worktree at HEAD (`git worktree add --detach <scratchpad>/wt5 HEAD`, `node_modules` symlinked), with `playwright.config.ts` retargeted in the scratch only from :5173 to :5199. Under `CI=1` the config refuses to reuse a server, so the run started its own server. The Vite server on :5173 (pid 69082, not mine) was never used.
- E37 = `pnpm test:e2e e2e/guides.spec.ts -g "drawing styles match the mockup"`, C37's named proof run verbatim in the same worktree: exit 0, 2 passed (`- light`, `- dark`, `e2e/guides.spec.ts:155`).
- E36 = `pnpm test:e2e e2e/guides.spec.ts -g "every drawing part in its colour"`: exit 0, 2 passed (`e2e/guides.spec.ts:108`).
- L = `pnpm test:e2e --list`: 11 tests in 2 files, all `[chromium]`, including C37's two tests at `guides.spec.ts:155`.
- T = `npx tsc -b`: exit 0.

Citations: the fix rewrote line 1 of `e2e/guides.spec.ts` and inserted two import lines after it. Every earlier citation in that file therefore moved by +2 lines, and the citations below are refreshed at 6f8e9da. Lines 136-174 are new. No other test file changed, so citations in `src/**/*.test.*` are carried from 2954c31. Every proof was re-run and passes at 6f8e9da.

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | one svg, viewBox 0 0 200 140 | V@6f8e9da - `frame is 200x140` passed | carried from 2954c31 - `src/components/GuideDrawing.test.tsx:36` - `expect(svgs).toHaveLength(1)`; `:37` - `toHaveAttribute("viewBox", "0 0 200 140")` | PASS |
| C2 | start in g.ghost, end in a plain g, start first | V@6f8e9da - `start pose faded, end pose solid` passed | carried from 2954c31 - `src/components/GuideDrawing.test.tsx:44-45` - ghost and solid `toHaveLength(1)`; `:46` - `compareDocumentPosition(solid[0]) & DOCUMENT_POSITION_FOLLOWING` | PASS |
| C3 | one path.move and one polygon.move-head per move; abducao 2, hack 1 | V@6f8e9da - `one arrow per move` passed | carried from 2954c31 - `src/components/GuideDrawing.test.tsx:53-54` - `toHaveLength(n)` over `[["abducao", 2], ["hack", 1]]` (`:50`) | PASS |
| C4 | no fill/stroke/color/style is a hex, rgb(/hsl( or any CSS named colour, for every guide | V@6f8e9da - `no literal colour` and `colour matcher knows all 148 named colours` passed | carried from 2954c31 - `src/components/GuideDrawing.test.tsx:63` - `not.toMatch(COLOUR)` on every element and all 4 attributes; `:28-29` - 148 distinct names, each matched | PASS |
| C5 | :root tokens in light and dark; head fill = --fig; outline stroke = --mach | E@6f8e9da - `drawing tokens in light and dark - light` and `- dark` passed | refreshed at 6f8e9da (+2) - `e2e/guides.spec.ts:32` - `expect(tokens).toEqual(Object.values(TOKENS[scheme]))` (literals `:6-7`); `:35` - `toHaveCSS("fill", rgb(TOKENS[scheme]["--fig"]))`; `:37` - `toHaveCSS("stroke", rgb(TOKENS[scheme]["--mach"]))` | PASS |
| C6 | role img named "Desenho do exercício Hack"; cue is a p after the figure | V@6f8e9da - `named image and cue text` passed | carried from 2954c31 - `src/components/GuideDrawing.test.tsx:72` - `getByRole("img", { name: "Desenho do exercício Hack" })`; `:75` - `toBe("P")`; `:78-79` | PASS |
| C7 | the six Treino C guides equal mockup v4 `DRAW` | V@6f8e9da - `treino C matches mockup v4` passed | carried from 2954c31 - `src/domain/guides.test.ts:90` - `expect(GUIDES[id], id).toEqual(expected)`, `expected` built from the fixture's `DRAW` (`:73-75`, `:83-89`) | PASS |
| C8 | remada-curvada is named; GUIDES against PLAN gives [] | V@6f8e9da - `guide id not in plan fails`, `real guides have no problems` passed | carried from 2954c31 - `src/domain/guides.test.ts:20` - `toContain("remada-curvada")`; `:24` - `expect(guideProblems(GUIDES)).toEqual([])` | PASS |
| C9 | cues of 0, 121 or with \n rejected; 1 and 120 accepted; real cues 1-120 with no break | V@6f8e9da - `cue is one line of 1-120` passed | carried from 2954c31 - `src/domain/guides.test.ts:30-31` - `toHaveLength(1)`, `toContain("hack")`; `:33-34` - `toEqual([])`; `:36-38` | PASS |
| C10 | x=201, y=-1, rect x+w=201, circle cy+r=141 rejected; (0,0) and (200,140) accepted | V@6f8e9da - `points outside the frame fail` passed | carried from 2954c31 - `src/domain/guides.test.ts:52-53` over the cases at `:45-48`; `:55` - `toEqual([])` | PASS |
| C11 | moves [], start legs [], end arms [] rejected, and the id named | V@6f8e9da - `missing move, leg or arm fails` passed | carried from 2954c31 - `src/domain/guides.test.ts:67-68` over the cases at `:61-63` | PASS |
| C12 | each shape kind gets its class; props sit inside their pose group | V@6f8e9da - `each shape kind gets its class` passed | carried from 2954c31 - `src/components/GuideDrawing.test.tsx:98-105` - `mach`, `weight`, `mach`, `weight`, `mach line`, `mach pad`, `floor`; `:106`; `:108` | PASS |
| C13 | default bun at head + (-7, -6), a given bun used, one head/bun/torso per pose, legs and arms per entry | V@6f8e9da - `pose parts and default bun` passed | carried from 2954c31 - `src/components/GuideDrawing.test.tsx:161-165` - counts; `:169` - `toEqual(["43", "14"])`; `:170` - `toEqual(["66", "8"])` | PASS |
| C14 | start group opacity 0.28, end 1; backup ghost controls stay at 1 | E@6f8e9da - `only the start pose is faded` passed | refreshed at 6f8e9da (+2) - `e2e/guides.spec.ts:43` - `toHaveCSS("opacity", "0.28")`; `:44` - `"1"`; `:45-49` - Exportar and Importar have class ghost and opacity 1 | PASS |
| C33 | paint order: machine, start, end, arrows, for every guide | V@6f8e9da - `paints machine, start, end, arrows` passed | carried from 2954c31 - `src/components/GuideDrawing.test.tsx:137` - `expect(order, id).toEqual(expected)`, `expected` at `:136` | PASS |
| C35 | every guide's SVG equals mockup v4's own `pose()`/`arrow()`/`drawing()` output, attribute by attribute | V@6f8e9da - `geometry matches the mockup renderer` passed | carried from 2954c31 - `src/components/GuideDrawing.test.tsx:148` - `expect(ours, id).toEqual(flatten(doc.documentElement))`; renderer sliced from the fixture at `:177` | PASS |
| C15 | first view: no region; all 6 rows show "como faz" in the sets line, after the sets | V@6f8e9da - `como faz: all closed on first view` passed | carried from 2954c31 - `src/App.test.tsx:434` - `expect(regions()).toEqual([])`; `:440-443` | PASS |
| C16 | region after the weight field: figure (img, "começo" then "fim"), then the cue; "fechar"; drawing above the cue, "começo" left of "fim" | V@6f8e9da - `como faz: opens inside the row` passed; E@6f8e9da - `guide opens inside the row` passed | carried from 2954c31 - `src/App.test.tsx:453-454`, `:457` - `toEqual(["FIGURE", "P"])`, `:460`, `:462`; refreshed at 6f8e9da (+2) - `e2e/guides.spec.ts:56` - img bottom `toBeLessThanOrEqual` cue top; `:59` - começo right `<=` fim left | PASS |
| C17 | at 390x844 the region sits below check, name and weight, spanning them within 1px | E@6f8e9da - `phone > guide spans the row below` passed | refreshed at 6f8e9da (+2) - `e2e/guides.spec.ts:72` - `region.y >= control.y + control.height` for all 3; `:73-74` - `toBeLessThanOrEqual(1)` | PASS |
| C18 | Hack open, tap Sumô: only Sumô's region is open; Hack reads "como faz" | V@6f8e9da - `como faz: one open at a time` passed | carried from 2954c31 - `src/App.test.tsx:470` - `toEqual(["Como faz Sumô"])`; `:471` | PASS |
| C19 | tap the open name again: region gone, "como faz" back | V@6f8e9da - `como faz: tap again closes` passed | carried from 2954c31 - `src/App.test.tsx:478` - `toEqual([])`; `:479` | PASS |
| C20 | checking while open: aria-pressed true, 1/6, region still there | V@6f8e9da - `como faz: checking keeps it open` passed | carried from 2954c31 - `src/App.test.tsx:486` - `"aria-pressed", "true"`; `:487` - `"1/6"`; `:488` | PASS |
| C21 | open then close: aria-pressed false, 0/6, localStorage byte-identical | V@6f8e9da - `como faz: opening writes nothing` passed | carried from 2954c31 - `src/App.test.tsx:498` - `expect(localStorage.getItem(STORAGE_KEY)).toBe(before)`; `:496-497` | PASS |
| C22 | pick A: no region; pick C again: none | V@6f8e9da - `como faz: switching workout closes` passed | carried from 2954c31 - `src/App.test.tsx:505`, `:507` - `expect(regions()).toEqual([])` | PASS |
| C23 | remount: no region; next day plus visibilitychange, same workout: no region | V@6f8e9da - `como faz: reload closes`, `como faz: new day closes` passed | carried from 2954c31 - `src/App.test.tsx:516` - `toEqual([])`; `:527`; `:532-533` | PASS |
| C24 | no guide for extensao: no "como faz", only "Marcar Extensão", ex-name and ex-sets unchanged | V@6f8e9da - `como faz: no guide, no toggle` passed | carried from 2954c31 - `src/App.test.tsx:543`; `:545` - `toEqual(["Marcar Extensão"])`; `:546-547` | PASS |
| C25 | name is a button, aria-expanded false then true, aria-controls = region id, unique across B and D | V@6f8e9da - `como faz: name button reports expanded` passed | carried from 2954c31 - `src/App.test.tsx:559-560`, `:562`, `:563` - `toBe(region.id)`; `:571`; `:574` - `toBe(2)` | PASS |
| C26 | the whole pre-existing `src/App.test.tsx` passes unchanged | V@6f8e9da includes the whole file: 37/37 passed, including all 24 pre-existing tests. The fix did not touch the file | carried from 2954c31 - `src/App.test.tsx:62` - `within(li).getByTestId("ex-name")` / `"ex-sets"` `toEqual(...)`; `:45` | PASS |
| C34 | chevron svg aria-hidden, closed and open; the começo swatch is k-ghost and the fim swatch is not | V@6f8e9da - `como faz: chevron and legend swatches` passed | carried from 2954c31 - `src/App.test.tsx:587` - `toHaveAttribute("aria-hidden", "true")`; `:594`; `:596` | PASS |
| C31 | test:e2e runs e2e/**/*.spec.ts in chromium only through webServer; Vitest collects nothing from e2e/ | L@6f8e9da - 11 tests, all `[chromium]`; V collects only `src/` files | carried from 2954c31 - `playwright.config.ts:7-8` - `testDir: "./e2e"`, `testMatch: "**/*.spec.ts"`; `:12` - one project `chromium`; `:13` - `webServer`; `vitest.config.ts:12` - `include: ["src/**/*.test.{ts,tsx}"]` | PASS |
| C27 | all 28 ids have a guide; without extensao and voador, exactly those two are listed | V@6f8e9da - `every plan exercise has a guide` passed | carried from 2954c31 - `src/domain/guides.test.ts:97` - `toEqual([])`; `:99` - `toEqual(["extensao", "voador"])` | PASS |
| C28 | PLAN has 28 distinct ids, new per workout 6/9/6/7 | V@6f8e9da - `plan has 28 distinct exercises` passed | carried from 2954c31 - `src/domain/guides.test.ts:104` - `toBe(28)`; `:107` - `toEqual([6, 9, 6, 7])` | PASS |
| C29 | Abdominal reto in B and D: same cue and same svg; one key each | V@6f8e9da - `como faz: shared exercise, one guide` passed | carried from 2954c31 - `src/App.test.tsx:613` - `expect(seen[1]).toEqual(seen[0])`; `:612`; `:600-601` | PASS |
| C30 | every guide: viewBox, no literal colour, arrows, named image | V@6f8e9da - `every guide renders` passed | carried from 2954c31 - `src/components/GuideDrawing.test.tsx:115`; `:117`; `:118-119`; `:122` - `not.toMatch(COLOUR)` | PASS |
| C32 | dark mode: all 28 ids show head fill #ffc9d1 and a visible, non-zero box | E@6f8e9da - `dark > every guide in dark mode` passed | refreshed at 6f8e9da (+2) - `e2e/guides.spec.ts:90` - `toHaveCSS("fill", rgb(TOKENS.dark["--fig"]))`; `:92-93`; `:97` - `expect(seen.size).toBe(28)` | PASS |
| C36 | Hack then Elevação pélvica, light and dark: each part's colour token | E36 and E@6f8e9da - `every drawing part in its colour - light` and `- dark` passed | refreshed at 6f8e9da (+2) - `e2e/guides.spec.ts:124` - `await expect(part, \`${prop} ${hex}\`).toHaveCSS(prop, rgb(hex))` over the 9 Hack parts at `:114-122`; `:134`, the same over the 3 Elevação pélvica parts at `:130-132`; literals `:103-104` and `:6-7`; `:109` - `emulateMedia({ colorScheme: scheme })` | PASS |
| C37 | Treino C's six drawings, light and dark: every element's computed `fill`, `opacity`, `stroke`, `stroke-dasharray`, `stroke-linecap`, `stroke-linejoin`, `stroke-width` equals the matching element on the mockup v4 page; property list read from the fixture | E37 and E@6f8e9da - `drawing styles match the mockup - light` and `- dark` passed | verified at 6f8e9da - `e2e/guides.spec.ts:171` - `expect(await styles(img(page), DRAWING_PROPS), name).toEqual(await styles(img(mockup), DRAWING_PROPS))`. `styles` (`:145-152`) serialises the root `svg` and every descendant as `tagName prop=value ...`, so a different element count or order also fails. Property list: `:142-143` slices and parses the fixture, and `:156` pins `toEqual(["fill", "opacity", "stroke", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "stroke-width"])`. Six names: `:164` - `toHaveLength(6)`. Both images exist: `:169` - `toBeVisible()` on each page. Scheme: `:158` - `emulateMedia({ colorScheme: scheme })` on both pages, over `["light", "dark"]` (`:154`). Non-vacuity was confirmed by a probe (see the header) | PASS |

## Coverage

Verified at 6f8e9da for the three rows whose authority the fix touched: drawing style properties (new), drawing-part colours, and colour schemes. Round 4's "drawing-part `fill: none` (6)" row is recomputed here and absorbed into the style-properties row. Every other row is carried from dbfd311 or 2954c31. Their authorities and proofs are untouched by the fix, and all their proofs re-ran green in V and E at 6f8e9da.

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| drawing style properties declared by mockup v4's drawing rules (7) | verified at 6f8e9da - `tests/fixtures/mockup-v4.html:119-133`, read by hand and by C37's parser (probe output equal) | `fill` C37 (with C5/C36 for token values) · `opacity` C37, C14 · `stroke` C37, C36 · `stroke-dasharray` C37 · `stroke-linecap` C37 · `stroke-linejoin` C37 · `stroke-width` C37. Each is compared on every element of each of the 6 Treino C drawings, in both schemes (`e2e/guides.spec.ts:154-171`) | - |
| drawing-part rules (selectors) in that block (13) | verified at 6f8e9da - same lines | `.mach`, `.mach.line`, `.mach.pad`, `.floor`, `.weight`, `.limb`, `.leg`, `.arm`, `.torso`, `.head`, `.bun`, `.ghost`, `.move`, `.move-head`. The probe found all of them among the classes of the six compared drawings. Elements per drawing: Flexora cadeira 23, Flexora mesa 20, Sumô 26, Hack 19, Elevação pélvica 20, Abdução 29. All are compared by C37 | - |
| drawing-part `fill: none` (6, round 4's unproven set) | verified at 6f8e9da - `tests/fixtures/mockup-v4.html:121,122,123,125,128,132` | `.mach.line`, `.mach.pad`, `.floor`, `.limb`, `.torso`, `.move`: each element's computed `fill=none` is compared by C37 (`e2e/guides.spec.ts:171`). F10 and F11 are now killed | - |
| drawing-part colour bindings (11) | verified at 6f8e9da - mockup drawing rules and tokens `tests/fixtures/mockup-v4.html:6-39,119-133` | each of the 11 has C36 (`e2e/guides.spec.ts:124,134`), and now C37 too, because computed `fill`/`stroke` are compared against the mockup page in both schemes | - |
| colour schemes (2) | verified at 6f8e9da - mockup light `:root` and `@media (prefers-color-scheme: dark)` (`tests/fixtures/mockup-v4.html:27`) | light C5, C14, C36, C37 · dark C5, C32, C36, C37 (C37 emulates the scheme on both pages, `e2e/guides.spec.ts:158`) | - |
| Treino C guides (6) | carried from 2954c31 - mockup `DRAW` keys | all 6 via C7 (`src/domain/guides.test.ts:81-90`); now also styles via C37 | - |
| plan exercise ids (28) | carried from 2954c31 - `src/domain/plan.ts` | C27, plus C30, C33 and C35 over `GUIDES`, plus C32 in Chromium | - |
| drawing tokens on :root (6) | carried from 2954c31 - mockup `:root` and dark block | C5 `e2e/guides.spec.ts:32` (line refreshed) | - |
| literal colour forms (hex, rgb(, hsl(, 148 named) | carried from 2954c31 - CSS Color 4 | C4/C30 `COLOUR`, self-tested at `src/components/GuideDrawing.test.tsx:28-29` | - |
| Shape kind x as (7) | carried from 2954c31 - door 1 type | C12, one case each | - |
| pose parts (7) | carried from 2954c31 - door 1 `Pose` | head, given bun, default bun, torso, legs, arms C13 · props C12 | - |
| rendered geometry (6) | carried from 2954c31 - mockup `pose()`/`arrow()` | all via C35 over 28 guides | - |
| SVG layer order (4) | carried from 2954c31 - mockup `drawing()` | C33 and C35 | - |
| invalid guide inputs (11) | carried from 2954c31 - `guideProblems` `src/domain/guides.ts:516-533` | C8 · C9 · C10 · C11 | - |
| cue and frame edges (6) | carried from 2954c31 - AC 9, AC 10 | C9 · C10 | - |
| como faz states (7) and closes-on (5) | carried from 2954c31 - design "Como faz" table | C15, C16, C18, C19, C20, C22, C23, C24, C25 | - |
| expanded row parts in the mockup (8) | carried from 2954c31 - mockup `how()` and row markup | C15/C16 · C34 | - |
| expanded row arrangement (4) | carried from 2954c31 - mockup `.how` | C16 · C17 | - |
| pre-existing App tests (24) | carried from 2954c31 | all 24 under C26's whole-file proof | - |
| one-way doors (3) | carried from 2954c31 - plan Landing | door 1 C7/C10/C12/C13/C33/C35/C37 · door 2 C8/C29 · door 3 C31 | - |

C37's scope is Treino C only. It does not compare the other 22 drawings' styles against a mockup, because the mockup draws only Treino C. Their styles come from the same class rules, and C35 proves their classes and element structure. This matches C37's claim, so it is not a gap.

## Test policy rows

Re-judged at 6f8e9da: the row that classifies the touched surface (applied CSS, colour scheme). The other rows are carried from dbfd311, because the fix touched none of the files they classify.

| Row | Files it classifies | Required proof | Expectation met |
| --- | --- | --- | --- |
| Decides, not reached across a boundary | `src/domain/guides.ts` `guideProblems` | own layer C8-C11, one case per rule (11) | yes - carried from dbfd311 |
| Decides, reached across a boundary | `src/components/GuideDrawing.tsx` (shape dispatch, default bun) | own layer C12/C13 · screen C16 | yes - carried from dbfd311 |
| Decides, reached across the screen boundary | `src/components/Workout.tsx` open state, `src/App.tsx` remount key | through `App` C15-C25 | yes - carried from dbfd311 |
| Data, no conditional | `src/domain/guides.ts` `GUIDES` | C7, C27, C30 | yes - carried from dbfd311 |
| Applied CSS, layout, colour scheme | `src/index.css` tokens and `.draw`/`.how` rules | Playwright in Chromium: C5, C14, C17, C32, C36, C37 | yes - verified at 6f8e9da. Every declaration in the `.draw` drawing-part rules (`src/index.css:136-149`) is now observed in Chromium against the mockup. The evidence line in `checks.md` was updated to list C36 and C37, which resolves round 4's stale-text note |
| Instrumentation, pass-throughs | none in the diff | none | yes - n/a, carried from dbfd311 |

Swept rows that resolve to existing code are carried from 2954c31: `src/domain/store.ts:12` `version: 1`, and the focus ring at `src/index.css:60`. Neither file is in the fix's diff.

## Faults injected

Verified at 6f8e9da. Isolation: `git worktree add --detach <scratchpad>/wt5 HEAD`, with `node_modules` symlinked. In the scratch only, `playwright.config.ts` was retargeted from :5173 to :5199 and run with `CI=1`, so no proof could reuse the dev server on :5173 that does not belong to this verifier. Before any fault, the unmutated scratch was green (E, 11/11; E37, 2/2). Each fault was a one-line `sed` on `src/index.css`. For each fault I ran the narrowest covering proof, E37 (`-g "drawing styles match the mockup"`), then reverted with `git checkout -- src` before the next fault.

Baseline porcelain of the real tree was `?? .specs/features/exercise-guides/verification.md`. After `git worktree remove --force` and `git worktree prune`, the real tree's porcelain matched the baseline (`diff` empty), and `git worktree list` showed only the main tree. The scratch's own server stopped with the run, and nothing listens on :5199.

Five faults, the cap. They are F10 and F11 from round 4, plus one per remaining property that only C37 asserts: `stroke-width`, `stroke-dasharray` and `stroke-linejoin`.

| Mutation | Location | Killed |
| --- | --- | --- |
| F10 (round 4's survivor, re-run): drop `fill: none` from `.draw .limb` | `src/index.css:141` | yes - C37 failed in both schemes: 4 polylines expected `fill=none`, received `fill=rgb(0, 0, 0)` |
| F11 (round 4's survivor, re-run): drop `fill: none` from `.draw .move` | `src/index.css:148` | yes - C37 failed in both schemes: `path fill=none ... stroke-dasharray=5px, 4px` received `fill=rgb(0, 0, 0)` |
| F12: leg `stroke-width: 9` -> `8` | `src/index.css:142` | yes - C37 failed in both schemes: `stroke-width=9px` received `8px` |
| F13: floor `stroke-dasharray: 2 5` -> `2 4` | `src/index.css:139` | yes - C37 failed in both schemes: `stroke-dasharray=2px, 5px` received `2px, 4px` |
| F14: drop `stroke-linejoin: round` from `.draw .mach` | `src/index.css:136` | yes - C37 failed in both schemes: 7 machine elements (including `.mach.pad` and `.mach.line`, which inherit it through the cascade) expected `stroke-linejoin=round`, received `miter` |
| F5-F9 (colour mutants, round 4) | `src/index.css:34,136,141,146,148-149` | yes - carried from dbfd311 (all killed by C36). C36 and the code it covers are unchanged, and C36 re-ran green at 6f8e9da |

## Earlier rounds' gaps

- Round 4's single gap: the mockup's `fill: none` on six stroke-only parts had no check, and F10 and F11 survived. It is **closed** by C37 (`e2e/guides.spec.ts:171`), and F10 and F11 are now killed. C37 also covers the stroke widths and dash patterns that `checks.md` used to list as out of reach. Its exemption list now names only pose recognisability for the drawing.
- Round 3's gap (drawing-part colours) stays closed: C36 re-ran green, carried from dbfd311.
- Round 2's gaps (rendered geometry, C26 precision) and round 1's four gaps stay closed: their proofs passed again in V at 6f8e9da, carried from 2954c31.

Minor note, not a finding: the `Cost` paragraph in `checks.md`'s Test policy still says "1 Playwright spec with 5 tests". The spec now holds 10 tests (11 with the smoke spec). This is stale prose. No check, row or verdict depends on it.

## Gate

At 6f8e9da: `pnpm vitest run` - 68 passed, 0 failed · `pnpm test:e2e` - 11 passed, 0 failed (in a clean HEAD worktree with `CI=1` and its own server on :5199) · C37 named proof - 2 passed · C36 named proof - 2 passed · `npx tsc -b` - exit 0

Not in reach and not a check: open question 1 (whether she recognises the A, B and D drawings) still gates pushing.
