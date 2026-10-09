# Gráfico checks

Profile: ui
Plan: `.specs/features/grafico/plan.md`

36 checks in 5 slices · 0 one-way doors · 0 open

The chart's rules - a measure's series, the change and its sign, the y ticks, the x labels - are
proven at their own layer in `src/domain/chart.test.ts` (new). Behaviour proofs render `App` in
jsdom (`src/App.test.tsx`, new `describe("Gráfico")`), with `setToday`, `seed` and `stored` as the
existing tests use them. Today is `FRI` (2026-10-09) unless a check says otherwise. Pointer, layout,
type and colour proofs are Playwright at 360×740 (`e2e/grafico.spec.ts`, new), seeding `treino:v1`
before load and fixing the clock at 2026-10-09. Binding source: mockup v6
(https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa) - `#chartCard`, `renderChart`, `series`,
`niceTicks`, `CHIPS`, `PAIRS`, the `.chips` … `.first` and `.sr-title` styles and the `--s-d` /
`--s-e` tokens. Expected coordinates were computed by running v6's own `niceTicks` and
`renderChart` geometry (W 340, H 180, L 34, R 30, T 12, B 24) on the fixtures below, so they are
the reference renderer's output on the same data (L-003).

"The card" is the region named "Sua evolução". "The chart" is the `img` named "Gráfico de …".
"A line" is a `polyline` in the chart. Fixtures:

- `CIN3`: 2026-08-27 `{ cintura: 74, peso: 64.2 }`, 2026-09-24 `{ cintura: 72.4 }`, 2026-10-01 `{ peso: 62.9 }`, 2026-10-08 `{ cintura: 71.6, peso: 62.6 }`
- `PAIR`: 2026-09-24 `{ "braco-d": 29, "braco-e": 28.6 }`, 2026-10-08 `{ "braco-d": 28.5, "braco-e": 28.3 }`
- `PESO1`: 2026-10-01 `{ peso: 62.9 }`

## Checks

### S1 - Picking a measure · 4 files · ~112 KB · ~28k

**C1** - With `CIN3` stored, the headings on Medidas come in document order "Sua evolução", "Nova medição", "Histórico", "Lembrete" (AC 1) — done
Proof: `pnpm vitest run src/App.test.tsx -t "sua evolucao comes first on medidas"`

**C2** - With no `measurements` field, and again with `[]`, Medidas has no heading "Sua evolução", no group "Escolher medida" and no `img` named starting "Gráfico", and still shows "Nenhuma medição ainda."; with `PESO1` stored, deleting it from Histórico removes the heading "Sua evolução" (AC 2) — done
Proof: `pnpm vitest run src/App.test.tsx -t "no measurement no evolucao"`

**C3** - The group "Escolher medida" holds exactly 8 buttons, named in order "Peso", "Busto", "Cintura", "Abdômen", "Quadril", "Braço", "Coxa", "Panturrilha" (AC 3) — done
Proof: `pnpm vitest run src/App.test.tsx -t "eight chips in order"`

**C4** - On first showing Medidas, "Cintura" has `aria-pressed="true"` and each of the other 7 `aria-pressed="false"` (AC 4) — done
Proof: `pnpm vitest run src/App.test.tsx -t "cintura is chosen first"`

**C5** - With `CIN3`, tapping "Peso" gives "Peso" `aria-pressed="true"` and the 7 others `"false"`, and the card shows the value "62,6" with the unit "kg" and the chart "Gráfico de peso"; then tapping "Quadril" moves `aria-pressed="true"` to "Quadril" only (AC 5) — done
Proof: `pnpm vitest run src/App.test.tsx -t "a chip tap chooses the measure"`

**C6** - With `CIN3`, after tapping "Peso", switching to Hoje and back to Medidas through the menu, "Peso" still has `aria-pressed="true"` and the chart is "Gráfico de peso" (AC 6) — done
Proof: `pnpm vitest run src/App.test.tsx -t "the chosen chip survives a page switch"`

**C7** - With `PESO1` only, table-driven over the chips: "Cintura" → the card shows "Ainda sem medição de cintura."; "Busto" → "Ainda sem medição de busto."; "Abdômen" → "Ainda sem medição de abdômen."; "Braço" → "Ainda sem medição de braço."; "Panturrilha" → "Ainda sem medição de panturrilha."; each with no chart `img`. "Peso" shows no such text (AC 7) — done
Proof: `pnpm vitest run src/App.test.tsx -t "a measure with no entry says so"`

### S2 - One measure over time · 5 files · ~120 KB · ~30k

**C8** - With 2026-10-08 `{ cintura: 71.6 }` and `PESO1` stored, "Cintura" shows "71,6 cm" and the text "primeira medição, 08/10. A linha aparece a partir da segunda.", and no chart `img`; "Peso" (one entry, 2026-10-01 62.9) shows "62,9 kg" and "primeira medição, 01/10. A linha aparece a partir da segunda." (AC 8) — done
Proof: `pnpm vitest run src/App.test.tsx -t "one entry shows primeira medicao"`

**C9** - With `CIN3`, "Cintura" shows the value "71,6", the unit "cm", and the change text "−2,4 cm desde 27/08", whose first character is U+2212; "Peso" shows "62,6", "kg" and "−1,6 kg desde 27/08" (AC 9) — done
Proof: `pnpm vitest run src/App.test.tsx -t "latest value and change since the first"`

**C10** - The change rule, table-driven at its own layer: 74 → 71.6 is "−2,4"; 71.6 → 74 is "+2,4"; 72 → 72 is "±0"; 63.1 → 62.9 is "−0,2"; 28.3 → 28.6 is "+0,3"; 62 → 62.05 rounds to "+0,1"; 62.04 → 62 rounds to "±0"; the minus is U+2212 and never U+002D (AC 10) — done
Proof: `pnpm vitest run src/domain/chart.test.ts -t "change since the first"`

**C11** - With `CIN3` on "Cintura", the chart holds exactly one line whose points are, each within 0.01, (34, 12), (218, 88.8), (310, 127.2) - v6's geometry for 74, 72.4, 71.6 on 2026-08-27, 2026-09-24, 2026-10-08; on "Peso" its points are (34, 50.4), (264, 112.8), (310, 127.2) (AC 11) — done
Proof: `pnpm vitest run src/App.test.tsx -t "one line through the measured dates"`

**C12** - The series rule at its own layer: for `cintura` over `CIN3` it is exactly [2026-08-27 74, 2026-09-24 72.4, 2026-10-08 71.6], oldest first even when the input is given newest first, with no point for 2026-10-01; for `peso` it is [2026-08-27 64.2, 2026-10-01 62.9, 2026-10-08 62.6]; for `busto` it is []. Through `App`, with 2026-09-24 `{ cintura: 72.4 }`, 2026-10-01 `{ peso: 62.9 }`, 2026-10-08 `{ cintura: 71.6 }`, the cintura line has exactly 2 points (AC 11, AC 12) — done
Proof: `pnpm vitest run src/domain/chart.test.ts -t "series of a measure"`
Proof: `pnpm vitest run src/App.test.tsx -t "a date without the measure has no point"`

**C13** - The tick rule at its own layer, table-driven: (71.6, 74) → [71, 72, 73, 74]; (62.6, 64.2) → [62, 63, 64, 65]; (28.3, 29) → [28.25, 28.5, 28.75, 29]; (30, 200) → [0, 100, 200]; (35.6, 36) → [35.6, 35.8, 36]; (99.6, 101.5) → [99, 100, 101, 102]; and for flat ranges (72, 72) and (62.9, 62.9) - where v6 gives 1 and 2 ticks - and for each of the above: 3 to 5 ticks, equal steps within 1e-9, first ≤ low and last ≥ high, and the low strictly above the first tick or the high strictly below the last when the range is flat (AC 13) — done
Proof: `pnpm vitest run src/domain/chart.test.ts -t "y ticks"`

**C14** - The x-label rule at its own layer: 3 dates → [first, second, third]; 4 dates → [first, second, fourth]; 5 → [first, third, fifth]; 2 → [first, second] with no repeat. Through `App` with `CIN3` on "Cintura": the y-axis texts read "71", "72", "73", "74" at y within 0.01 of 160, 112, 64, 16 (tick y + 4), right-anchored at x 28; the x-axis texts read "27/08", "24/09", "08/10" at y 174, anchored start, middle, end, at x 34, 218, 310; with `PAIR` on "Braço" the y texts read "28,25", "28,5", "28,75", "29" and the x texts "24/09", "08/10", each once (AC 13) — done
Proof: `pnpm vitest run src/domain/chart.test.ts -t "x labels"`
Proof: `pnpm vitest run src/App.test.tsx -t "axis labels"`

**C15** - With today 2027-01-05 and cintura 74 on 2026-12-20 and 73 on 2027-01-03: the change text is "−1 cm desde 20/12/26" and the x texts are "20/12/26" and "03/01"; with only the 2026-12-20 entry, the text is "primeira medição, 20/12/26. A linha aparece a partir da segunda." (AC 14) — done
Proof: `pnpm vitest run src/App.test.tsx -t "chart dates show the year only when it differs"`

**C16** - With `CIN3` on "Cintura", the chart holds exactly one dot circle, of radius 5, at (310, 127.2) within 0.01, and the grid draws one line per tick from x 34 to x 310 (AC 15) — done
Proof: `pnpm vitest run src/App.test.tsx -t "latest point has a dot"`

**C17** - The chart's accessible name is "Gráfico de cintura" on "Cintura", "Gráfico de abdômen" on "Abdômen" (with `CIN3` plus 2026-10-08 `{ abdomen: 80 }` and 2026-09-24 `{ abdomen: 81 }`), and "Gráfico de braço" on "Braço" with `PAIR` (AC 16) — done
Proof: `pnpm vitest run src/App.test.tsx -t "chart accessible name"`

### S3 - Right and left together · 3 files · ~105 KB · ~26k

**C18** - With `PAIR` on "Braço": two headlines, "D" before "E" in document order; D shows "28,5", "cm" and "−0,5 cm desde 24/09"; E shows "28,3", "cm" and "−0,3 cm desde 24/09" (AC 17) — done
Proof: `pnpm vitest run src/App.test.tsx -t "a pair shows d and e headlines"`

**C19** - With `PAIR` on "Braço": the chart holds exactly two lines - the first `stroke="var(--s-d)"` with no `stroke-dasharray`, points (34, 12) and (310, 108); the second `stroke="var(--s-e)"` with `stroke-dasharray="6 4"`, points (34, 88.8) and (310, 146.4); a dot at each line's last point filled with that line's colour; a text "D" at (319, 112) and "E" at (319, 150.4); a legend "Direita" whose line has `stroke="var(--s-d)"`, `stroke-width="2.5"` and no dash, and "Esquerda" whose line has `stroke="var(--s-e)"`, `stroke-width="2.5"` and `stroke-dasharray="4 3"`. On "Cintura" there is no legend and no "D"/"E" text (AC 18) — done
Proof: `pnpm vitest run src/App.test.tsx -t "a pair draws solid d and dashed e"`

**C20** - In each scheme (light / dark), with `PAIR` on "Braço": the D line's computed `stroke` is `#e8304a` / `#e8364f` and the E line's `#8a3fb0` / `#a87ae0`, and each last-point dot's `fill` matches its line; the legend lines match too (AC 19) — done
Proof: `pnpm exec playwright test e2e/grafico.spec.ts -g "pair colours"`

**C21** - With 2026-09-24 `{ "braco-d": 29 }` and 2026-10-08 `{ "braco-d": 28.5, "braco-e": 28.3 }` on "Braço": D shows "−0,5 cm desde 24/09"; E shows "28,3", "cm" and "primeira medição" and no "desde"; the chart holds exactly one line (D's) and one dot filled `var(--s-e)` at x 310 besides D's last dot. Also with 2026-10-01 `{ "braco-e": 28.6 }` and 2026-10-08 `{ "braco-d": 29 }`: a chart is drawn with no line and one dot per side (AC 20) — done
Proof: `pnpm vitest run src/App.test.tsx -t "a side with one entry shows primeira medicao"`

**C22** - With 2026-09-24 and 2026-10-08 holding only `braco-d` (29, 28.5) on "Braço": exactly one headline, prefixed "D"; one line; the legend holds "Direita" and no "Esquerda"; no "E" text; nothing reads "NaN" or "undefined" in the card (AC 21) — done
Proof: `pnpm vitest run src/App.test.tsx -t "a side with no entry is left out"`

**C23** - With only 2026-10-08 `{ "braco-d": 29, "braco-e": 28.6 }` on "Braço": the card shows "D 29 cm", "E 28,6 cm" and "primeira medição, 08/10. A linha aparece a partir da segunda.", and no chart `img` (AC 22) — done
Proof: `pnpm vitest run src/App.test.tsx -t "a pair on one date shows primeira medicao"`

### S4 - Reading a point · 2 files · ~40 KB · ~10k

**C24** - At 360×740 with `CIN3` on "Cintura": a pointer down at the chart's right edge shows a tip reading "08/10" then "71,6 cm", a visible dashed line (`stroke-dasharray` `3 3`) at x 310, and one hover dot at (310, 127.2); moving to the left edge shows "27/08" and "74 cm" with the dashed line at x 34. With `PAIR` on "Braço" at the right edge the tip reads "08/10" and "D 28,5 cm · E 28,3 cm" with two hover dots; with the C21 fixture at the left edge it reads "24/09" and "D 29 cm" with one hover dot. Each time the tip lies horizontally inside the card (AC 23) — done
Proof: `pnpm exec playwright test e2e/grafico.spec.ts -g "touching the chart shows the date"`

**C25** - After C24's pointer down, moving the pointer off the chart hides the tip, sets the dashed line's `visibility` to `hidden`, and leaves no hover dot (AC 24) — done
Proof: `pnpm exec playwright test e2e/grafico.spec.ts -g "leaving the chart hides the tip"`

**C26** - The chart's `svg` has computed `touch-action` `pan-y` (AC 25) — done
Proof: `pnpm exec playwright test e2e/grafico.spec.ts -g "the chart lets the page scroll"`

### S5 - Staying true and arrangement · 4 files · ~70 KB · ~18k

**C27** - With `CIN3` on Medidas and "Peso" chosen: saving Peso `62,2` in "Nova medição" on 2026-10-09 makes the card show "62,2" and "−2 kg desde 27/08" with "Peso" still pressed; editing 2026-10-09 to Peso `62,3` from Histórico shows "62,3"; deleting 2026-10-09 shows "62,6" again; all without remounting `App` (AC 26) — done
Proof: `pnpm vitest run src/App.test.tsx -t "the chart follows saves edits and deletes"`

**C28** - With `CIN3`, the string stored under `treino:v1` is identical before and after tapping each of the 8 chips (jsdom), and before and after C24's pointer downs and moves (Playwright) (AC 27) — done
Proof: `pnpm vitest run src/App.test.tsx -t "choosing chips stores nothing"`
Proof: `pnpm exec playwright test e2e/grafico.spec.ts -g "touching the chart stores nothing"`

**C29** - At 360×740 with `CIN3`: the 8 chips' tops are within 1px of each other and each next chip's left ≥ the previous one's right; the chip row has computed `overflow-x` `auto`, `scrollbar-width` `none`, and `scrollWidth` > `clientWidth`; the page's `scrollWidth` ≤ 360 (AC 28) — done
Proof: `pnpm exec playwright test e2e/grafico.spec.ts -g "chips on one scrolling line"`

**C30** - At 360×740 with `CIN3` on "Cintura": the chart's width is within 1px of the card's content width (card width minus its left and right padding) and its height / width within 0.01 of 180 / 340; the headline value has `font-family` starting `Fredoka` and `font-size` `36px`; with `PAIR` on "Braço" each side's value has `font-size` `30px` (AC 29) — done
Proof: `pnpm exec playwright test e2e/grafico.spec.ts -g "plot fills the card"`

**C31** - At 360×740, the card's arrangement as mockup v6 draws it: the heading "Sua evolução", the chip row, the headline, (for a pair) the legend, then the chart, each one's top ≥ the previous one's bottom and each left within 1px of the card's content left; on "Cintura" the value's left and the change text's left are within 1px of the content left and the change text's top ≥ the value's bottom (v6 stacks them in one block); on "Braço" the D and E blocks' lefts within 1px of the content left and E's top ≥ D's bottom - at 360px v6 wraps the pair, E under D (measured on v6: both at x 32, D at y 350, E at y 418); on the one-entry state (2026-10-08 cintura only) the "primeira medição" panel's left and right are within 1px of the content's, below the chip row, with its text centred (AC 29, AC 30) — done
Proof: `pnpm exec playwright test e2e/grafico.spec.ts -g "card arrangement at 360"`

**C32** - Every declaration of mockup v6's chart rules, table-driven over the computed style in each scheme (light / dark), on `CIN3` "Cintura", `PAIR` "Braço" and the one-entry state: the card `background-color` `#ffffff` / `#2a1016`, `border-radius` `24px` all four corners, padding `18px 16px 14px 16px`, `row-gap` `14px`; heading `font-size` `22px`, `font-family` starting `Fredoka`, margins `0px`; chip row `display` `flex`, `column-gap` `6px`, padding `2px 2px 6px 2px`; each chip `flex-shrink` `0`, `flex-grow` `0`, border `2px` `solid` on all four sides, `border-color` `#f6d3d9` / `#45202a`, `background-color` `#ffffff` / `#2a1016`, `border-radius` ≥ half its height on all four corners, padding `6px 12px 6px 12px`, `font-size` `14px`, `font-weight` `500`, `color` `#8d5a63` / `#d59aa4`; the chosen chip `border-color` `#b3122e` / `#ff5c75`, `background-color` `#ffe1e6` / `#3a141c`, `color` `#b3122e` / `#ff5c75`; headline `display` `flex`, `align-items` `baseline`, `justify-content` `space-between`, `column-gap` `12px` (`18px` for a pair), `flex-wrap` `wrap`; value `font-weight` `700`, `line-height` equal to its font size, `color` `#3a1118` / `#ffe9ec`, `font-variant-numeric` `tabular-nums`; its unit (and the D/E letter) `font-size` `16px`, `font-weight` `500`, `color` `#8d5a63` / `#d59aa4`, `margin-left` `3px`; change text `font-size` `14px`, `color` `#8d5a63` / `#d59aa4`, `tabular-nums`, its bold part `font-weight` `700` and `color` `#3a1118` / `#ffe9ec`; legend `display` `flex`, `column-gap` `14px`, `font-size` `13px`, `color` `#8d5a63` / `#d59aa4`, each entry declaring `display` `inline-flex` in the last matching rule (a flex item computes it as `flex`), `align-items` `center`, `column-gap` `6px`, each legend svg 22×8px; plot `position` `relative`, its svg `display` `block`; grid lines `stroke` `#f6d3d9` / `#45202a`, `stroke-width` `1px`; axis texts `fill` `#8d5a63` / `#d59aa4`, `font-size` `11px`, `font-family` starting `DM Sans`, `tabular-nums`; each line `fill` `none`, `stroke-width` `2px`, `stroke-linejoin` `round`, `stroke-linecap` `round`; each dot `stroke` `#ffffff` / `#2a1016`, `stroke-width` `2px`; the D/E end texts `font-weight` `700`, `font-size` `12px`, `font-family` starting `DM Sans`, `fill` `#3a1118` / `#ffe9ec`; the dashed line `stroke` `#8d5a63` / `#d59aa4`, `stroke-width` `1px`, `stroke-dasharray` `3px, 3px`; the tip `position` `absolute`, `top` `0px`, `pointer-events` `none`, `background-color` `#3a1118` / `#ffe9ec`, `color` `#fff5f6` / `#1c0a0e`, `border-radius` `10px` all four corners, padding `6px 9px 6px 9px`, `font-size` `12px`, `line-height` `16.2px`, `white-space` `nowrap`, `tabular-nums`, a `translateX(-50%)` transform (matrix `e` within 0.5px of minus half its width); the one-entry panel `background-color` `#ffe1e6` / `#3a141c`, `border-radius` `18px` all four corners, padding `16px` on all four sides, `text-align` `center`, `color` `#8d5a63` / `#d59aa4`, `font-size` `14px`, its value `display` `block`, `font-family` starting `Fredoka`, `font-size` `30px`, `color` `#3a1118` / `#ffe9ec`; the D/E lines and dots as C20 (AC 19, AC 29, AC 30) — done
Proof: `pnpm exec playwright test e2e/grafico.spec.ts -g "mockup v6 chart declarations"`

**C33** - The stored record after C27 has `version: 1` under `treino:v1`, and `completions`, `today`, `weights`, `restSeconds` and `reminder` deep-equal the seed (AC 27) — done
Proof: `pnpm vitest run src/App.test.tsx -t "the chart follows saves edits and deletes"`

**C34** - The chart and the one-entry panel show no measure value written with a dot: with `CIN3` on "Cintura" no text in the card matches `/\d\.\d/` (AC 8, AC 9, AC 13, AC 23) — done
Proof: `pnpm vitest run src/App.test.tsx -t "chart numbers use a decimal comma"`

**C35** - The theme declares `--s-d` and `--s-e` on `:root` with the computed values `#e8304a` / `#e8364f` and `#8a3fb0` / `#a87ae0` in light / dark (AC 19) — done
Proof: `pnpm exec playwright test e2e/grafico.spec.ts -g "series tokens"`

**C36** - The tip's left is clamped as v6 does: at the right edge of `CIN3`'s chart the tip's centre is at most the plot's width minus 50px from the plot's left, and at the left edge at least 50px (AC 23) — done
Proof: `pnpm exec playwright test e2e/grafico.spec.ts -g "touching the chart shows the date"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| section order (4) | "Sua evolução" first C1 · "Nova medição" C1 · "Histórico" C1 · "Lembrete" C1 | - |
| card absent sources (3) | field absent C2 · `[]` C2 · last entry deleted C2 | - |
| chips (8) | "Peso" C3, C5 · "Busto" C3, C7 · "Cintura" C3, C4 · "Abdômen" C3, C7 · "Quadril" C3, C5 · "Braço" C3, C7 · "Coxa" C3 · "Panturrilha" C3, C7 | - |
| card states for a single measure (3) | no entry C7 · one entry C8 · two or more C9, C11 | - |
| card states for a pair (5) | both ≥2 C18, C19 · one side single C21 · one side none C22 · every value on one date C23 · two singles on two dates C21 | - |
| change sign (3) | "+" C10 · "−" U+2212 C9, C10 · "±" C10 | - |
| change rounding (2) | up C10 · to zero C10 | - |
| units (2) | kg C5, C8, C9 · cm C8, C9, C18 | - |
| y-tick ranges (8) | whole step C13 · 0.25 step C13, C14 · 100 step C13 · 0.2 step C13 · straddling C13 · four ticks C13 · flat whole C13 · flat with decimal C13 | - |
| x-label counts (4) | 2 dates C14 · 3 C14 · 4 C14 · 5 C14 | - |
| date formats (2) | this year `dd/mm` C9, C14 · other year `dd/mm/aa` C15 | - |
| dates the card shows (4) | change "desde" C9, C15 · one-entry C8, C15 · x labels C14, C15 · tip C24 | - |
| a missing measure on a date (2) | weight-only between tape C12 · pair side missing C21, C24 | - |
| tip contents (3) | single C24 · pair both sides C24 · pair one side C24 | - |
| pointer events (3) | down C24 · move C24 · leave C25 | - |
| re-derive triggers (3) | save C27 · edit C27 · delete C27, C2 | - |
| untouched record fields (5) | `completions` C33 · `today` C33 · `weights` C33 · `restSeconds` C33 · `reminder` C33 | - |
| colour schemes (2) | light C20, C32, C35 · dark C20, C32, C35 | - |
| mockup v6 elements (20) | heading "Sua evolução" C1, C32 · chip row C3, C29, C32 · chosen chip C4, C32 · headline value C9, C30, C32 · unit C9, C32 · change text C9, C32 · pair headlines C18, C31 · legend C19, C32 · y grid C16, C32 · y labels C14, C32 · x labels C14, C32 · lines C11, C19, C32 · last dot C16, C19, C32 · D/E end labels C19, C32 · dashed crosshair C24, C32 · hover dots C24 · tip C24, C32, C36 · one-entry panel C8, C31, C32 · "Ainda sem" text C7 · card placement C1, C31 | - |
| mockup v6 rules (27) | `.chips` C29, C32 · `.chip` C32 · `.chip[aria-pressed]` C32 · `.chart-card` C32 · `.card` C32 · `.headline` C31, C32 · `.headline .now` C30, C32 · `.now small` C32 · `.delta` C32 · `.delta b` C32 · `.pair` C32 · `.pair .now` C30 · `.legend` C32 · `.legend span` C32 · `.legend svg` C32 · `.plot` C32 · `.plot svg` C26, C30, C32 · `.grid` C32 · `.tick` C32 · `.series` C32 · `.dot` C32 · `.end-label` C32 · `.cross` C32 · `.tip` C32, C36 · `.first` C32 · `.first b` C32 · `.sr-title` C32 | - |
| v6 SVG geometry (8) | viewBox 340×180 C30 · plot box L34 R30 C11, C16 · T12 B24 C11, C14 · tick text x L−6, y+4 C14 · x text y H−6 C14 · dot r 5 C16 · end label x+9 y+4 C19 · E dash `6 4` and legend dash `4 3` C19 | - |

- Claims naming layout, type or colour: C20, C26, C29-C32, C35, C36 - each proof runs in Chromium at 360×740
- Deviation from mockup v6, approved in the plan: the "Ainda sem medição de …" copy (AC 7); a side with one or no value (AC 20, AC 21) where v6 crashes; ticks for a flat range (C13) where v6 gives one tick and divides by zero
- No other check claims more than the cases its proof exercises
- Out of reach, enumerated per screen against mockup v6. Sua evolução: `.chips::-webkit-scrollbar { display: none }` (Chromium honours `scrollbar-width: none`, asserted in C29). Nothing else in the rules above is out of reach

## Test policy

The repo answers the level for screens: app behaviour through `App` in jsdom, applied CSS,
layout and pointer input in Playwright (exercise-guides door 3). It leaves the coverage
expectation open for the chart's rules, so this row records it for this slice and stays here.

| Code | Required proofs | Coverage expectation |
| --- | --- | --- |
| The chart rules (series, change, ticks, x labels) | one at its own layer in `chart.test.ts` **and** one through `App` | at its own layer: every row of C10, C12, C13, C14; through `App`: the rendered numbers for `CIN3` and `PAIR` |
| The card's state through `App` (which state, which sides, headline text, line attributes) | one through `App` in jsdom | each single-measure state, each pair state |
| Pointer, layout, type and colour | one in Playwright at 360×740 | both colour schemes where colour is claimed |

Evidence:

- series: filter by measure, sort -> 1 branch point, decides
- change: sign three ways, rounding -> 3 branch points, decides
- ticks: flat or not, step choice over 5 candidates, floor/ceil -> 7 branch points, decides
- x labels: dedup of first/middle/last -> 1 branch point, decides
- card state: none / one date / chart, per side none / one / many -> 5 branch points, decides
- closest analogue: `reminderDue` and `saveMeasurement` proven table-driven in `src/domain/measurements.test.ts`, then through `App`

Cost: 4 domain proofs, 22 `App` proofs, 10 Playwright proofs across 3 test files.

## Swept

- validation: C13 - a flat range still gives 3 to 5 ticks and no division by zero; C22, C34 - no "NaN", "undefined" or dot decimal reaches the card. Stored values are already validated on parse (Measurement slice)
- failure modes: existing - storage failing shows "Seus dados não estão sendo salvos neste navegador" (Menu C8); the chart reads memory and writes nothing (C28)
- idempotency: C28 - choosing chips and touching the chart store nothing, so repeating them changes nothing
- authorization: n/a - no accounts, one user on one device
- concurrency: n/a - one tab, one thread; the chart derives from the record on each render (C27)
- data lifecycle: C27, C33 - the chart follows saves, edits and deletes, and touches no stored field
- dependency failure: n/a - no external dependency; no chart library is added
- state transitions: C4, C5, C6 - chosen chip default → tapped → kept across pages; C2, C8, C9, C27 - card absent ↔ one-entry ↔ chart as entries come and go
- observability: n/a - personal app, no logging requirement

## Handoff

- S1 ≈ `App.tsx` 8.2 KB, `App.test.tsx` 83.2 KB, `index.css` 18.3 KB, new card ≈ 6 KB → ~116 KB / 4 ≈ 29k
- S2 adds `src/domain/chart.ts` ≈ 3 KB and `chart.test.ts` ≈ 4 KB; S3 the same files; S4 and S5 add `e2e/grafico.spec.ts` (new, ≈ 18 KB) → S1-S5 ≈ 141 KB / 4 ≈ 35k, under the 150k budget - one builder

- **Settled mid-build:** C31 corrected before any code for it existed - it claimed the single measure's value and change on one line, value left and change right, but v6's `renderChart` puts both in one block, the change under the value. The check now follows the approved mockup
- **Settled mid-build:** C31's pair claim corrected - it said D left and E right on one line, but v6 measured at 360px wraps the pair, E under D, both left-aligned. C32's legend entry `display` is read as declared, since a flex item's `inline-flex` computes as `flex` in v6 and in the app alike. Both corrections follow the approved mockup and weaken nothing
- **Boundary:** C1-C36 closed (one builder, no handoff)
- **Abandoned:** rendering the headline, legend and plot as direct children of the card - the card's 14px gap then sat between them, where v6's `#chartBody` stacks them with none
- **Also touched:** `e2e/historico.spec.ts` "open row arrangement at 360" re-measures the row's "Apagar" after the tap, since the card above now makes that tap scroll the page; same claim, same bound
