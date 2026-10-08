# Lembrete checks

Profile: ui
Plan: `.specs/features/lembrete/plan.md`

26 checks in 2 slices · 0 one-way doors · 0 open

The due rule is proven at its own layer, table-driven, in `src/domain/measurements.test.ts`
(`describe("reminder due")`). Behaviour proofs render `App` in jsdom (`src/App.test.tsx`, new
`describe("Lembrete")`), with `setToday`, `seed` and `stored` as the existing tests use them.
Today is `THU` (2026-10-08, a training day) unless a check says otherwise. Layout and colour
proofs are Playwright at 360×740 (`e2e/lembrete.spec.ts`, new). Binding source: mockup v6
(https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa), `#nudge`, `due`, `renderNudge`, `renderRem`,
`#every`, `#notToday`, `#measureNow`, and the `.nudge`, `.nudge-acts`, `.cta.small`, `.seg` styles.

"The card" below is the region named "Lembrete de medidas". "Tape" is a Measurement holding a
measure other than `peso`, e.g. `{ cintura: 72 }`.

## Checks

### S1 - The reminder card on Hoje · 7 files · ~92 KB · ~23k

**C1** - The due rule, table-driven over (reminder, Measurements, today = 2026-10-08) → result: every 7, none → first; every 7, only `{ peso }` entries → first; every 7, tape 2026-10-01 → due 7 days; every 7, tape 2026-10-02 → not due; every 14, tape 2026-09-25 → not due; every 14, tape 2026-09-24 → due 14; every 30, tape 2026-09-08 → due 30; every 30, tape 2026-09-09 → not due; every 7, tape 2026-09-28 and `{ peso }` on 2026-10-07 → due 10; every 7, tape 2026-10-10 → not due; off (`null`), none → not due; off, tape 2026-08-01 → not due; every 7, none, snoozed 2026-10-08 → not due; every 7, tape 2026-10-01, snoozed 2026-10-07 → due 7; every 7, none, snoozed 2026-10-09 → first; reminder absent, none → first (AC 1-8) — done
Proof: `pnpm vitest run src/domain/measurements.test.ts -t "reminder due"`

**C2** - With no Measurement and no `reminder`, Hoje shows the card holding the text "Hora da primeira medição", the text "Ela vira o seu ponto de partida.", and the buttons "Medir agora" and "Hoje não"; the card comes before the region "Sequência" in document order (AC 1) — done
Proof: `pnpm vitest run src/App.test.tsx -t "first measurement card"`

**C3** - With a tape Measurement on 2026-10-01 only, Hoje's card holds "Hora de medir" and "A última com fita foi há 7 dias.", and not "Hora da primeira medição" (AC 2) — done
Proof: `pnpm vitest run src/App.test.tsx -t "due card counts the days"`

**C4** - With a tape Measurement on 2026-10-02, Hoje has no card (AC 3) — done
Proof: `pnpm vitest run src/App.test.tsx -t "no card before the interval"`

**C5** - With a tape Measurement on 2026-10-10 only, Hoje on 2026-10-08 has no card (AC 4) — done
Proof: `pnpm vitest run src/App.test.tsx -t "a future tape date is not due"`

**C6** - With tape on 2026-10-02 and `{ peso: 62 }` on 2026-10-07 (every 7), Hoje has no card; with tape on 2026-10-01 and `{ peso: 62 }` on 2026-10-07, the card says "A última com fita foi há 7 dias." (AC 5) — done
Proof: `pnpm vitest run src/App.test.tsx -t "a weight-only entry does not count"`

**C7** - With `reminder: { everyDays: null, snoozedOn: null }`, Hoje has no card both with no Measurement and with a tape Measurement on 2026-08-01 (AC 6) — done
Proof: `pnpm vitest run src/App.test.tsx -t "reminder off shows no card"`

**C8** - Tapping "Hoje não" removes the card, shows a status "Tudo bem, lembro amanhã", and stores `reminder` equal to `{ everyDays: 7, snoozedOn: "2026-10-08" }` when it was absent, and to `{ everyDays: 14, snoozedOn: "2026-10-08" }` when it was `{ everyDays: 14, snoozedOn: null }` with tape on 2026-09-24 (AC 7) — done
Proof: `pnpm vitest run src/App.test.tsx -t "hoje nao hides the card until tomorrow"`

**C9** - Seeded with `reminder: { everyDays: 7, snoozedOn: "2026-10-08" }` and no Measurement: on 2026-10-08 Hoje has no card; rendered fresh on 2026-10-09 it shows "Hora da primeira medição". Rendered on 2026-10-08, after "Hoje não", moving the clock to 2026-10-09 and firing `visibilitychange` shows the card again (AC 8) — done
Proof: `pnpm vitest run src/App.test.tsx -t "the card comes back the next day"`

**C10** - Tapping "Medir agora" makes the Medidas tab `aria-current="page"`, shows the region "Medidas" with the button "Fechar" and the field "Data" at `2026-10-08`, and leaves the stored record equal to the seed (AC 9) — done
Proof: `pnpm vitest run src/App.test.tsx -t "medir agora opens the form"`

**C11** - With the form opened on Medidas, its date set to 2026-10-01 and Peso `62` typed, switching to Hoje and tapping "Medir agora" shows the form with date `2026-10-01` and Peso `62` (AC 10) — done
Proof: `pnpm vitest run src/App.test.tsx -t "medir agora keeps an open form"`

**C12** - With no Measurement: after "Medir agora" and switching back to Hoje, the card is shown; after "Medir agora" and saving only Peso `62`, Hoje still shows "Hora da primeira medição"; after "Medir agora" and saving Cintura `72`, Hoje has no card (AC 11) — done
Proof: `pnpm vitest run src/App.test.tsx -t "only a tape save clears the card"`

**C13** - Table-driven with no Measurement, the card is shown on: 2026-10-07 (rest day, "Hoje é descanso" shown); 2026-10-08 with a completion that day (done card shown); 2026-10-08 with `today.checked` holding one exercise of the next workout (workout card shown) (AC 12) — done
Proof: `pnpm vitest run src/App.test.tsx -t "the card shows in every hoje state"`

**C14** - At 360×740 with no Measurement: the card's icon's right edge ≤ the left edge of "Hora da primeira medição", with the icon's vertical centre within that text block's top and bottom; "Medir agora"'s right edge ≤ "Hoje não"'s left edge with tops within 1px; both buttons' tops ≥ the bottom of "Ela vira o seu ponto de partida."; each button is ≥ 44px tall; the card's bottom ≤ the "Sequência" region's top (AC 1, AC 13) — done
Proof: `pnpm exec playwright test e2e/lembrete.spec.ts -g "card arrangement at 360"`

**C15** - The card's computed `border-top-style` is `dashed` and its `border-top-color` is `#e8304a` in the light scheme and `#ff4a64` in the dark scheme (AC 14) — done
Proof: `pnpm exec playwright test e2e/lembrete.spec.ts -g "card border colour"`

**C24** - At 360×740 with no Measurement, as mockup v6 stacks them: "Hora da primeira medição"'s bottom ≤ the top of "Ela vira o seu ponto de partida.", and their left edges are within 1px; the card holds exactly 2 buttons, "Medir agora" then "Hoje não" (AC 1, AC 13). Added after round 1 of verification: the title-above-detail arrangement and the button count had no check — done
Proof: `pnpm exec playwright test e2e/lembrete.spec.ts -g "card text stacks at 360"`

**C25** - The card's computed `border-top-width` is `2px`, and its icon's computed `color` is `#e8304a` in the light scheme and `#ff4a64` in the dark scheme (AC 14). Added after round 1 of verification: a 1px border survived C15, and the icon colour was neither checked nor listed out of reach — done
Proof: `pnpm exec playwright test e2e/lembrete.spec.ts -g "card border width and icon colour"`

### S2 - The reminder setting on Medidas · 4 files · ~75 KB · ~19k

**C16** - On Medidas, a heading "Lembrete" comes after the heading "Nova medição" in document order, and its section holds a group "Lembrar a cada" whose buttons are, in order, "7 dias", "14 dias", "30 dias", "Não lembrar". Table-driven over the stored `reminder`: absent → "7 dias"; `everyDays` 7 → "7 dias"; 14 → "14 dias"; 30 → "30 dias"; `null` → "Não lembrar" - that button alone has `aria-pressed="true"` and the other three `"false"` (AC 15) — done
Proof: `pnpm vitest run src/App.test.tsx -t "lembrete setting shows the stored interval"`

**C17** - Table-driven from `reminder: { everyDays: 7, snoozedOn: "2026-10-08" }`: tapping "14 dias" stores `{ everyDays: 14, snoozedOn: "2026-10-08" }`, "30 dias" → `{ everyDays: 30, … }`, "Não lembrar" → `{ everyDays: null, … }`, and from `everyDays` 30 "7 dias" → `{ everyDays: 7, … }`; after each tap only the tapped button has `aria-pressed="true"` (AC 16) — done
Proof: `pnpm vitest run src/App.test.tsx -t "choosing an interval stores it"`

**C18** - With tape on 2026-09-28 and `reminder: { everyDays: 14, snoozedOn: null }`: Hoje has no card; after tapping "7 dias" on Medidas and switching to Hoje, the card says "A última com fita foi há 10 dias."; after tapping "14 dias" and switching back, no card; after "Não lembrar" from 7, no card (AC 17) — done
Proof: `pnpm vitest run src/App.test.tsx -t "a new interval applies on the next render"`

**C19** - The Lembrete section's hint reads exactly: off → "Sem lembrete. Você mede quando quiser."; no Measurement, not snoozed → "Vai aparecer em Hoje até você medir com a fita. Só o peso não conta."; tape on 2026-10-05, every 7 → "Conta a partir da última medição com fita. Só o peso não conta."; no Measurement, snoozed 2026-10-08 → "Conta a partir da última medição com fita. Só o peso não conta."; and the section holds exactly one such hint (AC 18) — done
Proof: `pnpm vitest run src/App.test.tsx -t "lembrete hint per state"`

**C20** - Seeded with completions, `today.checked`, `weights`, `restSeconds: 60` and two Measurements: after "Hoje não" and then tapping "30 dias", the stored record has `version: 1` under `treino:v1`, and its `completions`, `today`, `weights`, `restSeconds` and `measurements` deep-equal the seed (AC 19) — done
Proof: `pnpm vitest run src/App.test.tsx -t "reminder writes keep the rest of the record"`

**C21** - Seeded with no `reminder`: after rendering Hoje with the card, tapping "Medir agora", and switching back, the stored record has no `reminder` property (AC 20) — done
Proof: `pnpm vitest run src/App.test.tsx -t "no reminder field until she changes it"`

**C22** - At 360×740 on Medidas: the heading "Lembrete"'s bottom ≤ the "7 dias" button's top; "7 dias", "14 dias" and "30 dias" have tops within 1px of each other and each one's right edge ≤ the next one's left edge; the hint's top ≥ the bottom of every button in "Lembrar a cada"; the Lembrete section's top ≥ the "Nova medição" section's bottom (AC 15, AC 18) — done
Proof: `pnpm exec playwright test e2e/lembrete.spec.ts -g "setting arrangement at 360"`

**C23** - At 360×740 the pressed interval button has computed `border-color` `#b3122e` in the light scheme and `#ff5c75` in the dark scheme, and an unpressed one `#f6d3d9` / `#45202a` (AC 15) — done
Proof: `pnpm exec playwright test e2e/lembrete.spec.ts -g "pressed interval colour"`

**C26** - At 360×740 every interval button's computed `border-top-width` is `2px`; the pressed one's `color` is `#b3122e` in the light scheme and `#ff5c75` in the dark scheme with `font-weight` `500`, and an unpressed one's `font-weight` is `400` (AC 15). Added after round 1 of verification: these mockup v6 values were neither checked nor listed out of reach — done
Proof: `pnpm exec playwright test e2e/lembrete.spec.ts -g "pressed interval text"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| due rule outcomes (3) | first C1, C2 · due N days C1, C3 · not due C1, C4 | - |
| due rule inputs (7) | interval 7/14/30 C1 · off C1, C7 · snoozed today C1, C9 · snoozed before today C1, C9 · snoozed after today C1 · future tape C1, C5 · weight-only newer than tape C1, C6 | - |
| interval edges (6) | 7 at 7 days C1, C3 · 7 at 6 days C1, C4 · 14 at 14 days C1 · 14 at 13 days C1 · 30 at 30 days C1 · 30 at 29 days C1 | - |
| card actions (2) | "Hoje não" C8, C9 · "Medir agora" C10, C11, C12 | - |
| saves after "Medir agora" (2) | weight-only keeps card C12 · tape clears card C12 | - |
| Hoje states (3) | rest day C13 · done today C13 · workout in progress C13 | - |
| how today changes (2) | fresh load C9 · resume via `visibilitychange` C9 | - |
| interval choices (4) | "7 dias" C16, C17 · "14 dias" C16, C17 · "30 dias" C16, C17 · "Não lembrar" C16, C17 | - |
| stored interval on load (5) | absent C16 · 7 C16 · 14 C16 · 30 C16 · null C16 | - |
| hint states (3) | off C19 · card would show C19 · otherwise C19 (both not due and snoozed) | - |
| reminder writes (2) | snooze C8, C20 · interval C17, C20 | - |
| untouched record fields (5) | `completions` C20 · `today` C20 · `weights` C20 · `restSeconds` C20 · `measurements` C20 | - |
| colour schemes (2) | light C15, C23, C25, C26 · dark C15, C23, C25, C26 | - |
| mockup v6 elements (17) | card above streak C2, C14 · icon left of text C14 · title above detail C24 · exactly two card buttons C24 · 2px card border and `--berry` icon C25 · 2px pills with `--cherry` 500 pressed text C26 · title "Hora da primeira medição"/"Hora de medir" C2, C3 · detail line C2, C3 · "Medir agora" C2, C10 · "Hoje não" C2, C8 · buttons in one row under the text C14 · dashed `--berry` border C15 · toast "Tudo bem, lembro amanhã" C8 · heading "Lembrete" C16, C22 · four pills in order C16, C22 · pressed pill colour C23 · hint under the pills C19, C22 | - |

- Claims naming layout or colour: C14, C15, C22, C23, C24, C25, C26 - each proof runs in Chromium at 360×740
- No other check claims more than the cases its proof exercises
- Out of reach, enumerated for this slice: the card's padding, radius and background, the icon's drawing, the title's font family, size and `--cherry` colour, the detail line's size and colour, the "Medir agora" and "Hoje não" fill and padding, the pills' padding, radius, font size and pressed background, the hint's size and colour, and whether "Não lembrar" wraps to a second row at 360

## Test policy

The repo answers the level for screens: app behaviour through `App` in jsdom, applied CSS and
layout in Playwright (exercise-guides door 3). It leaves the coverage expectation open for the
due rule, so this row records it for this slice and stays in this file.

| Code | Required proofs | Coverage expectation |
| --- | --- | --- |
| The due rule (decides first / due N / not due) | one at its own layer in `measurements.test.ts` **and** one through `App` | at its own layer: each input that changes the outcome and each interval's edge pair; through `App`: each outcome and each input row of AC 1-8 |
| Card and setting state through `App` (decides which copy, what is stored, what is pressed) | one through `App` in jsdom | each action, each Hoje state, each interval, each hint |
| Card and setting layout and colour (CSS) | one in Playwright at 360×740 | both colour schemes where colour is claimed |

Evidence:

- the due rule: off, snoozed today, no tape, days ≥ interval -> 4 branch points, 3 outcomes, decides
- the hint: off, would show, otherwise -> 2 branch points, decides
- closest analogue: `lastTapeDate` and `saveMeasurement` are proven table-driven in `src/domain/measurements.test.ts`; streak and week count in `progress.test.ts` and again through `App`

Cost: 1 domain proof, 17 `App` proofs, 7 Playwright proofs across 3 test files.

## Swept

- validation: C1, C16 - the stored interval is already parsed to 7/14/30/null and the snooze to a date (Measurement slice); the rule is proven over each
- failure modes: existing - storage failing shows "Seus dados não estão sendo salvos neste navegador" (Menu C8); then "Hoje não" lasts until reload, recorded in the plan's Observable
- idempotency: C17 - tapping an interval stores that value whatever it was; C8 - "Hoje não" stores today, so a second tap changes nothing
- authorization: n/a - no accounts, one user on one device
- concurrency: n/a - one tab, one thread; each write is a single synchronous record update
- data lifecycle: C20, C21 - no write until she acts, and a write touches only `reminder`
- dependency failure: n/a - no external dependency
- state transitions: C8, C9, C12, C17, C18 - due → snoozed → due next day; due → cleared by a tape save; interval changes
- observability: n/a - personal app, no logging requirement

## Handoff

- S1 ≈ `App.tsx` 6.0 KB, `App.test.tsx` 50.0 KB, `measurements.ts` 3.8 KB, `measurements.test.ts` 5.4 KB, `MeasureForm.tsx` 6.9 KB, `index.css` 14.9 KB + new card and `e2e/lembrete.spec.ts` ≈ 5 KB → ~92 KB / 4 ≈ 23k
- S2 touches the same `App.tsx`, `App.test.tsx`, `index.css` and spec, plus the new setting ≈ 2 KB → S1+S2 ≈ 97 KB / 4 ≈ 24k, under the 150k budget - one builder

- **Boundary:** C1-C23 closed in `feat(lembrete): remind her to measure on hoje and set the interval on medidas` (one builder, no handoff)
- **Settled mid-build:** none
- **Abandoned:** none
- **Round 1 fix:** C24-C26 added (tests only) for the verifier's surviving probes on the card's title/detail stacking and border width and for unchecked mockup v6 style values; the misplaced `weekdayIndex` doc comment in `dates.ts` moved back
