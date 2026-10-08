# Menu checks

Profile: ui
Plan: `.specs/features/menu/plan.md`

16 checks in 1 slice · 1 one-way door · 0 open

Behaviour proofs render `App` in jsdom (`src/App.test.tsx`, new `describe("Menu")`), with
`setToday` and `seed` as the existing tests use them. Layout, colour and stacking proofs are
Playwright (`e2e/menu.spec.ts`, new) at a 360×740 viewport, because exercise-guides door 3 keeps
Playwright for what jsdom cannot see. Binding source: mockup v6
(https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa), the `.menu` bar, `.timer` and `#page-medidas`.

## Checks

### S1 - Hoje / Medidas bar at the bottom · 6 files · ~55 KB · ~14k

**C1** - The navigation region named "Menu" holds exactly two buttons, named "Hoje" then "Medidas" in that order (AC 1) — done
Proof: `pnpm vitest run src/App.test.tsx -t "menu has Hoje then Medidas"`

**C2** - At 360×740 the "Menu" region's box has left 0, width 360 and bottom 740, and still has bottom 740 after Hoje is scrolled to its end (AC 1) — done
Proof: `pnpm exec playwright test e2e/menu.spec.ts -g "bar is fixed to the bottom"`

**C3** - As mockup v6 draws it: the two buttons sit in one row (same top, ±1px) with equal widths (±1px); each holds one `aria-hidden` `svg` whose box ends above its label text; the "Hoje" icon is the check path `M5 12.5l4.5 4.5L19 7.5` and the "Medidas" icon is the tape (a `rect` plus tick `path`) (AC 1) — done
Proof: `pnpm exec playwright test e2e/menu.spec.ts -g "two equal buttons, icon above label"`

**C4** - Opening the app shows Hoje with "Hoje" at `aria-current="page"` and "Medidas" without `aria-current`; after switching to Medidas, unmounting and rendering `App` again, it is still Hoje (AC 2) — done
Proof: `pnpm vitest run src/App.test.tsx -t "app always opens on Hoje"`

**C5** - After tapping "Medidas", none of these is visible: region "Sequência", list "Semana", group "Escolher treino", the day's card, button "Exportar backup"; the region "Medidas" is visible; "Medidas" has `aria-current="page"` and "Hoje" has none. Table-driven over the day's card in 3 states: workout (Monday, "Treino A"), rest (Wednesday, "Hoje é descanso"), done (Monday with A completed, "Feito por hoje!") (AC 3) — done
Proof: `pnpm vitest run src/App.test.tsx -t "Medidas hides Hoje"`

**C6** - With Treino C picked, "Flexora cadeira" and "Flexora mesa" checked and the "Como faz Hack" guide open, switching to Medidas and back shows heading "Treino C", both checks `aria-pressed="true"` and the region "Como faz Hack" (AC 4, door 1) — done
Proof: `pnpm vitest run src/App.test.tsx -t "coming back shows the same workout"`

**C7** - The rest timer started at 1:30 and advanced 10 s reads `1:20` on Medidas; advanced 5 s more on Medidas, it reads `1:15` there and still `1:15` back on Hoje; the "Descanso" group is present on both destinations (AC 5) — done
Proof: `pnpm vitest run src/App.test.tsx -t "rest timer keeps running across destinations"`

**C8** - On Medidas, the heading "Treino Miudinha" and the date are visible, and with `localStorage.setItem` throwing, the text "Seus dados não estão sendo salvos neste navegador" is visible (AC 6) — done
Proof: `pnpm vitest run src/App.test.tsx -t "header and warning show on Medidas"`

**C9** - `window.scrollTo` is called with `(0, 0)` on the switch to Medidas and again on the switch back to Hoje, and not when tapping the destination already shown (AC 7) — done
Proof: `pnpm vitest run src/App.test.tsx -t "switching scrolls to the top"`

**C10** - At 360×740, on Hoje and on Medidas: the "Descanso" group's bottom ≤ the "Menu" region's top; with the toast "Arquivo inválido" shown, the toast's bottom ≤ the "Descanso" group's top (so it also clears the menu) (AC 8) — done
Proof: `pnpm exec playwright test e2e/menu.spec.ts -g "timer and toast sit above the bar"`

**C11** - At 360×740, with Hoje scrolled to its end, the "Importar backup" label's bottom ≤ the "Descanso" group's top (AC 9) — done
Proof: `pnpm exec playwright test e2e/menu.spec.ts -g "backup is not hidden behind the bar"`

**C12** - At 360×740 each menu button's box height is ≥ 48px (AC 10) — done
Proof: `pnpm exec playwright test e2e/menu.spec.ts -g "menu buttons are tall enough"`

**C13** - In the light scheme the active button has background `#ffe1e6` and colour `#b3122e`, the inactive one colour `#8d5a63`; in the dark scheme `#3a141c`, `#ff5c75` and `#d59aa4`; the bar's background is `--surface` (`#ffffff` / `#2a1016`). Checked with Hoje active and with Medidas active (AC 11) — done
Proof: `pnpm exec playwright test e2e/menu.spec.ts -g "active and inactive colours"`

**C14** - With the workout-complete celebration open after checking every Treino A exercise, the element at the centre of the "Medidas" button is inside the celebration overlay, and the menu buttons are not reached by that point (AC 12) — done
Proof: `pnpm exec playwright test e2e/menu.spec.ts -g "celebration covers the bar"`

**C15** - The "Medidas" region's text content is exactly "Em breve você registra suas medidas aqui." and it holds no heading (AC 13, AC 3) — done
Proof: `pnpm vitest run src/App.test.tsx -t "Medidas placeholder"`

**C16** - Switching to Medidas and back leaves `location.href` and `history.length` unchanged, and the stored `treino:v1` record equal to what it was before the switches (door 1) — done
Proof: `pnpm vitest run src/App.test.tsx -t "switching changes no URL and stores nothing"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| menu buttons (2) | `Hoje` C1, C3, C4, C13 · `Medidas` C1, C3, C5, C13 | - |
| Hoje content hidden on Medidas (5) | streak C5 · week strip C5 · picker C5 · day's card C5 · Backup C5 | - |
| day's card states (3) | workout C5 · rest C5 · done C5 | - |
| state kept across a switch (4) | shown workout C6 · checked exercises C6 · open guide C6 · running timer C7 | - |
| shown on both destinations (5) | header C8 · date C8 · storage warning C8 · rest timer C7, C10 · toast C10 | - |
| stacking pairs (3) | timer/menu C10 · toast/timer C10 · toast/menu C10 (by transitivity of the two) | - |
| destinations for layout (2) | Hoje C10, C11 · Medidas C10 | - |
| switch directions (2) | to Medidas C5, C9 · to Hoje C6, C9 | - |
| colour schemes (2) | light C13 · dark C13 | - |
| Landing doors (1) | page switch: both pages mounted C6 · no URL, not stored C16 | - |
| mockup v6 elements on this slice (8) | `nav` "Menu" C1 · two buttons C1 · order C1 · icons C3 · icon above label C3 · one row of equal columns C3 · full-width bottom bar C2 · timer above bar C10 | - |

- Claims naming layout or colour: C2, C3, C10-C14 - each proof runs in Chromium at 360×740
- No other check claims more than the cases its proof exercises
- Out of reach, enumerated for the Menu bar: its top border width and colour, its shadow, its padding, the label font family, weight and size, the icon stroke width and size. The rest timer's and toast's exact offsets beyond the ordering in C10

## Test policy

The repo answers the level: `playwright.config.ts` (exercise-guides door 3) keeps Playwright for
applied CSS, layout and colour scheme, and app behaviour is proven by rendering `App` in jsdom.
It leaves the coverage expectation open for screen-state switching; this row records it for this
slice and stays in this file.

| Code | Required proofs | Coverage expectation |
| --- | --- | --- |
| Destination switch in `App` (decides which page shows and which button is current) | one through `App` in jsdom | each destination, each direction, each piece of Hoje state that must survive |
| Menu bar layout and stacking (CSS) | one in Playwright at 360×740 | each destination, both colour schemes where colour is claimed |

Evidence:

- `src/App.tsx`: gains 1 two-way branch (destination) and the scroll-to-top on change -> decides
- `src/index.css`: offsets for timer, toast and page bottom -> layout, only Playwright can see it
- closest analogue: `e2e/guides.spec.ts` proves token colours in both schemes and box ordering in Playwright; `App.test.tsx` "Descanso" proves the timer through `App`

Cost: 9 `App` proofs and 7 Playwright proofs across 2 test files.

## Swept

- validation: n/a - no input; two fixed buttons
- failure modes: C8 - storage failing still shows the warning on Medidas
- idempotency: C9 - tapping the destination already shown does nothing
- authorization: n/a - no accounts, one user on one device
- concurrency: C7 - the timer's interval keeps running while the destination changes
- data lifecycle: C16 - the destination is never stored
- dependency failure: n/a - no external dependency; storage failure is C8
- state transitions: C4, C5, C6
- observability: n/a - personal app, no logging requirement

## Handoff

- S1 ≈ existing `App.tsx` 5 KB, `index.css` 11.6 KB, `App.test.tsx` 29.6 KB, `RestTimer.tsx` 2 KB, `Celebration.tsx` 1.4 KB + new `Menu.tsx` and `e2e/menu.spec.ts` ≈ 6 KB → ~56 KB / 4 ≈ 14k, one domain - one builder, under the 150k budget

- **Boundary:** C1-C16 closed in `feat(menu): add the hoje/medidas bar at the bottom` (one builder, no handoff)
- **Settled mid-build:** none
- **Abandoned:** none
