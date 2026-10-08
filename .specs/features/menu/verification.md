# Menu verification

**Verdict**: PASS
**Profile**: ui
**Diff range**: 193513a..e9c1e4e
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier) - fresh context, did not build the feature

Proof runs at `e9c1e4e` (HEAD), real tree, two invocations:

- `pnpm vitest run src/App.test.tsx --reporter=verbose -t "menu has Hoje then Medidas|app always opens on Hoje|Medidas hides Hoje|coming back shows the same workout|rest timer keeps running across destinations|header and warning show on Medidas|switching scrolls to the top|Medidas placeholder|switching changes no URL and stores nothing"` - exit 0, 9 passed, 40 skipped. Each of the 9 names appears individually as passed under `src/App.test.tsx > Menu >`.
- `pnpm exec playwright test e2e/menu.spec.ts -g "bar is fixed to the bottom|two equal buttons, icon above label|timer and toast sit above the bar|backup is not hidden behind the bar|menu buttons are tall enough|active and inactive colours|celebration covers the bar"` - exit 0, 8 passed (C13 runs as two tests, light and dark). Each name listed individually as passed.

All 16 proof tests are new in the range: `git diff 193513a..HEAD` adds `describe("Menu")` at `src/App.test.tsx:680-828` and the whole of `e2e/menu.spec.ts`. The Playwright run reused a dev server already listening on 5173; `/proc/<pid>/cwd` showed it serves `/home/samuel/projects/gym-exercices`, so it ran the HEAD tree.

## Binding sources

| Source | Opened | Contradiction | Uncovered |
| --- | --- | --- | --- |
| mockup v6, https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa (local copy of the current version: `.menu` CSS at line 149-152, `.timer` 141, `.toast` 247, `.app` 54, `.party` 249, `<nav class="menu">` markup 295-298, `#page-hoje` 300, `#page-medidas` 346, `go()` menu JS 900-907, light tokens 10-16, dark tokens 32-33) | yes - local HTML read at the lines named | none | - |
| `.design/body-measurements.md`, slice Menu (lines 119-127) | yes | none | - |

Enumeration of what mockup v6 decides for this slice, against the checks and the code:

- **Menu bar, arrangement**: one `nav aria-label="Menu"` fixed to the bottom, full width (`left:0; right:0; bottom:0`) - C1, C2; code `src/index.css:70` matches mockup line 149 declaration for declaration. One row of two equal grid columns (`grid-template-columns: 1fr 1fr`) - C3. Each button is a column with the icon above the label - C3. Order Hoje then Medidas - C1.
- **Icons**: Hoje check path `M5 12.5l4.5 4.5L19 7.5` - C3 asserts the exact `d`. Medidas tape: `rect x=2.5 y=8 w=19 h=8 rx=2` plus path `M6 8v3.5M9.5 8v2M13 8v3.5M16.5 8v2` - C3 asserts one `rect` and one `path` only (precision gap, see Findings); `src/components/Menu.tsx:15-16` is identical to mockup line 297, checked by hand.
- **States**: active = `--blush` background, `--cherry` text; inactive `--muted` (mockup 150, 152) - C13 in both schemes; token values match mockup 10-16 and 32-33. Hoje active on open (mockup 296 `aria-current="page"` on `tab-hoje`) - C4.
- **Pages**: `#page-hoje` and `#page-medidas` both in the DOM, inactive one `hidden` (mockup 300, 346, 902) - C5, C6 (door 1). Medidas page draws no visible heading (its only h2 is `.sr-title`, and belongs to the Gráfico slice) - C15.
- **Stacking and offsets**: timer `bottom: 84px` above the bar (mockup 141), toast `150px` above the timer (247), `.app` bottom padding `200px` (54), celebration `z-index:5` over the bar's `3` (149, 249) - C10, C11, C14; code values `src/index.css:64,169,176,178` equal the mockup's.
- **Switch behaviour**: `go()` sets `aria-current` on the target, removes it from the other and calls `window.scrollTo(0, 0)` (mockup 902-904) - C5, C9.
- Out of this slice and not enumerated: the Lembrete nudge inside `#page-hoje`, all `#page-medidas` contents, the "exemplo" demo tag, `#measureNow` (plan Out of scope rows).

## Checks

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | "Menu" nav holds exactly two buttons, "Hoje" then "Medidas" | vitest batch, `menu has Hoje then Medidas` passed | `src/App.test.tsx:687` - `expect(menu().getAllByRole("button").map((b) => b.textContent)).toEqual(["Hoje", "Medidas"])` | PASS |
| C2 | at 360x740 the bar has left 0, width 360, bottom 740, also after scrolling to the end | playwright batch, `bar is fixed to the bottom` passed | `e2e/menu.spec.ts:20-22` - `expect(b.x).toBe(0)`, `expect(b.width).toBe(360)`, `expect(b.y + b.height).toBe(740)`; `:24` - `scrollY` `toBeGreaterThan(0)`; `:26` - `expect(after.y + after.height).toBe(740)` | PASS |
| C3 | one row, equal widths, one aria-hidden svg above the label, check path and tape icon | playwright batch, `two equal buttons, icon above label` passed | `e2e/menu.spec.ts:33-34` - `Math.abs(hoje.y - medidas.y)` and `Math.abs(hoje.width - medidas.width)` `toBeLessThanOrEqual(1)`; `:39-40` - svg `toHaveCount(1)`, `toHaveAttribute("aria-hidden", "true")`; `:48` - `expect(iconBottom).toBeLessThanOrEqual(textTop)`; `:50` - `toHaveAttribute("d", "M5 12.5l4.5 4.5L19 7.5")`; `:51-52` - `svg rect` and `svg path` `toHaveCount(1)` | PASS |
| C4 | opens on Hoje, Hoje current, Medidas not; still Hoje after switch + remount | vitest batch, `app always opens on Hoje` passed | `src/App.test.tsx:694-695` - Hoje `toHaveAttribute("aria-current", "page")`, Medidas `not.toHaveAttribute("aria-current")`; `:701-702` - same after `cleanup()` and re-render; `:703` - heading "Treino A" `toBeVisible()` | PASS |
| C5 | on Medidas the 5 Hoje parts are hidden, region "Medidas" visible, aria-current moved; over workout, rest, done | vitest batch, `Medidas hides Hoje` passed | `src/App.test.tsx:721-725` - "Sequência", "Semana", "Escolher treino", the card heading, "Exportar backup" each `not.toBeVisible()`; `:726` - region "Medidas" `toBeVisible()`; `:727-728` - Medidas `aria-current="page"`, Hoje none; cases at `:708-710` (MON "Treino A", WED "Hoje é descanso", MON done "Feito por hoje!") | PASS |
| C6 | Treino C, two checks and the Hack guide survive a round trip | vitest batch, `coming back shows the same workout` passed | `src/App.test.tsx:747` - heading "Treino C" `toBeVisible()`; `:748-749` - both `toHaveAttribute("aria-pressed", "true")`; `:750` - region "Como faz Hack" `toBeVisible()` | PASS |
| C7 | timer 1:30 -10 s reads 1:20 on Medidas, -5 s reads 1:15 there and back on Hoje | vitest batch, `rest timer keeps running across destinations` passed | `src/App.test.tsx:762` - `getByRole("button", { name: "1:20 · parar" })).toBeVisible()`; `:764` - `"1:15 · parar"` on Medidas; `:767` - `"1:15 · parar"` back on Hoje, all inside group "Descanso" | PASS |
| C8 | header, date and storage warning visible on Medidas | vitest batch, `header and warning show on Medidas` passed | `src/App.test.tsx:778` - heading "Treino Miudinha" `toBeVisible()`; `:779` - `getByText(/segunda-feira/)).toBeVisible()`; `:780` - "Seus dados não estão sendo salvos neste navegador" `toBeVisible()` (setItem throws, `:772-774`) | PASS |
| C9 | scrollTo(0, 0) on each switch, never on re-tapping the shown destination | vitest batch, `switching scrolls to the top` passed | `src/App.test.tsx:791` - `not.toHaveBeenCalled()` after tapping Hoje on Hoje; `:793-794` - `toHaveBeenCalledTimes(1)`, `toHaveBeenLastCalledWith(0, 0)`; `:796` - still 1 after re-tapping Medidas; `:798-799` - 2, `(0, 0)` | PASS |
| C10 | timer bottom <= bar top on both destinations; toast bottom <= timer top on both | playwright batch, `timer and toast sit above the bar` passed | `e2e/menu.spec.ts:60` - `expect(t.y + t.height).toBeLessThanOrEqual((await box(menu(page))).y)` in a loop over Hoje, Medidas (`:57-58`); `:68` - toast `toBeVisible()`; `:70` - `expect(s.y + s.height).toBeLessThanOrEqual((await box(timer(page))).y)` over both | PASS |
| C11 | at the end of Hoje "Importar backup" bottom <= timer top | playwright batch, `backup is not hidden behind the bar` passed | `e2e/menu.spec.ts:78` - `expect(importer.y + importer.height).toBeLessThanOrEqual((await box(timer(page))).y)` after `toEnd` (`:76`) | PASS |
| C12 | each menu button >= 48px tall | playwright batch, `menu buttons are tall enough` passed | `e2e/menu.spec.ts:84` - `expect((await box(tab(page, name))).height).toBeGreaterThanOrEqual(48)` over both | PASS |
| C13 | active blush/cherry, inactive muted, bar surface, light and dark, each button active in turn | playwright batch, `active and inactive colours - light` and `- dark` passed | `e2e/menu.spec.ts:98` - nav `toHaveCSS("background-color", rgb(c.surface))`; `:101-103` - active `background-color` `rgb(c.blush)`, `color` `rgb(c.cherry)`, inactive `color` `rgb(c.muted)`; literals at `:88-89` (`#ffe1e6 #b3122e #8d5a63 #ffffff` / `#3a141c #ff5c75 #d59aa4 #2a1016`) | PASS |
| C14 | with the celebration open, the point at the Medidas button centre is in the overlay, not the menu | playwright batch, `celebration covers the bar` passed | `e2e/menu.spec.ts:113` - dialog "Treino concluído!" `toBeVisible()`; `:120` - `expect(hit).toEqual({ party: true, menu: false })` | PASS |
| C15 | Medidas region text is exactly the placeholder, with no heading | vitest batch, `Medidas placeholder` passed | `src/App.test.tsx:808` - `expect(page.textContent).toBe("Em breve você registra suas medidas aqui.")`; `:809` - `within(page).queryByRole("heading")).toBeNull()` | PASS |
| C16 | switching leaves href, history.length and the stored record unchanged | vitest batch, `switching changes no URL and stores nothing` passed | `src/App.test.tsx:824` - `expect(location.href).toBe(href)`; `:825` - `expect(history.length).toBe(length)`; `:826` - `expect(localStorage.getItem(STORAGE_KEY)).toBe(before)` | PASS |

## Coverage

Recomputed. Authority per row: mockup v6 for the bar's elements, icons, colours and stacking (it is the set the code must satisfy); the plan's AC 3 and the code (`src/App.tsx:101-133`) for what Hoje holds; `src/App.tsx:113-122` for the card's three branches.

| Set (size) | Recomputed from | Member -> proof | Unproven |
| --- | --- | --- | --- |
| menu buttons (2) | mockup 296-297 | Hoje C1, C3, C4, C13 · Medidas C1, C3, C5, C13 | - |
| Hoje content hidden on Medidas (5) | `src/App.tsx:102-132`: StreakCard, WeekStrip, Picker, card, Backup | streak C5 · week C5 · picker C5 · card C5 · Backup C5 (`Exportar backup`, same component as Importar) | - |
| day's card branches (3) | `src/App.tsx:113-122` ternary | workout C5 · rest C5 · done C5 | - |
| state kept across a switch (4) | design slice Menu table + plan AC 4-5 | shown workout C6 · checks C6 · open guide C6 · timer C7 | - |
| shown on both destinations (5) | plan AC 5-6, `src/App.tsx:81-97,140-148` outside both pages | header C8 · date C8 · warning C8 · timer C7, C10 · toast C10 (`:68` visible on Medidas) | - |
| stacking pairs (3) | mockup 141, 149, 247 | timer/bar C10 · toast/timer C10 · toast/bar C10 by transitivity | - |
| overlay over bar (1) | mockup 249 vs 149 z-index | celebration/bar C14 | - |
| switch directions (2) | `src/App.tsx:69-73` | to Medidas C5, C9 · to Hoje C6, C7, C9 | - |
| colour schemes x active button (4) | mockup tokens 10-16, 32-33 | light/Hoje, light/Medidas, dark/Hoje, dark/Medidas all C13 | - |
| mockup v6 bar elements (8) | mockup 149-152, 295-298 | nav C1 · two buttons C1 · order C1 · icons C3 · icon above label C3 · one row equal columns C3 · full-width bottom bar C2 · button height C12 | - |
| Landing door 1 parts (3) | plan Landing | both pages mounted C6 (killed by F1) · aria-current C4, C5 · no URL, not stored C16 | - |

Swept for sets with no row: Relations and Surface are `None`; Landing's literal shape is fully joined above; no route or status set exists. Nothing missing.

## Test policy rows

| Row | Files it classifies | Required proof | Expectation met |
| --- | --- | --- | --- |
| Destination switch in `App` | `src/App.tsx`, `src/components/Menu.tsx` | through `App` in jsdom - C1, C4-C9, C15, C16 | yes - each destination (C5, C6), each direction (C9), each piece of surviving state (C6, C7) |
| Menu bar layout and stacking (CSS) | `src/index.css` | Playwright at 360x740 - C2, C3, C10-C14 | yes - stacking on Hoje and Medidas (C10), colour in light and dark (C13). Bar box (C2) and button height (C12) are measured with Hoje shown only; the bar sits outside both pages and C10 measures its top on Medidas too, so accepted |

## Faults injected

Isolated in `git worktree add --detach <scratchpad>/wt HEAD` with `node_modules` symlinked and a scratch Playwright config on port 5174 with `reuseExistingServer: false` (so the real tree's server on 5173 could not answer for the mutant). Worktree baseline was green first (8/8 e2e, 9/9 Menu unit). Real-tree `git status --porcelain` recorded before and compared after removal: identical (`?? .playwright-mcp/` only).

| Mutation | Location | Killed |
| --- | --- | --- |
| F1: Hoje page unmounted when inactive (`{page === "hoje" && <div className="page">...}`) instead of `hidden` | `src/App.tsx:101` | yes - C6 `coming back shows the same workout` failed: region "Como faz Hack" not found after the round trip |
| F2: removed the `if (to === page) return;` guard | `src/App.tsx:70` | yes - C9 `switching scrolls to the top` failed |
| F3: Medidas button never receives `aria-current` | `src/components/Menu.tsx:13` | yes - C5 `Medidas hides Hoje` failed |
| F4: timer offset back to the pre-feature `calc(16px + env(...))` | `src/index.css:169` | yes - C10 `timer and toast sit above the bar` failed: the timer intercepted the tap on the Hoje tab (`e2e/menu.spec.ts:58`) |
| F5: bar `z-index: 3` -> `6`, above the celebration | `src/index.css:70` | yes - C14 `celebration covers the bar` failed at `e2e/menu.spec.ts:120`, received `{ party: false, menu: true }` |

5 injected (the cap), 5 killed. Proofs not individually mutated under the cap: C1, C2, C3, C4, C7, C8, C11, C12, C13, C15, C16. Their assertions are literal comparisons against check-defined values (cited above), so a wrong value fails them by construction.

## Findings

Non-blocking, none changes a verdict:

1. **Precision gap (C3)** - the Medidas icon is asserted only as one `rect` plus one `path` (`e2e/menu.spec.ts:51-52`), while the mockup fixes both shapes exactly (line 297). The code matches the mockup today (`src/components/Menu.tsx:15-16`, checked by hand), but any rect/path pair would pass. Contrast the Hoje icon, whose `d` is asserted exactly at `:50`.
2. **Precision gap (C2 / AC 1 safe-area)** - AC 1 says the bar's bottom edge includes the safe-area inset; desktop Chromium has `env(safe-area-inset-bottom) = 0`, so no proof can see it. The declaration `calc(8px + env(safe-area-inset-bottom, 0px))` at `src/index.css:70` equals the mockup's at line 149.
3. **F4 killed by actionability, not the box assertion** - with the timer over the bar, Playwright's `click()` on a tab timed out before `:60` ran. A real regression, really caught; a partial overlap that leaves the tab centre clickable would still reach the box assertion at `:60`.
4. **Re-tap behaviour differs from the mockup's demo JS, not from a binding decision** - mockup `go()` (line 904) calls `scrollTo(0, 0)` even when the shown tab is tapped again; AC 7 and C9 say a re-tap does nothing, and the code follows C9 (`src/App.tsx:70`). Plan Sources limits the mockup's binding role to "the bar's markup, icons, colours and the timer above it", and AC 7 was approved in the plan, so this is not a contradiction. If Samuel wants the common "tap the active tab to go to the top" behaviour, that is a one-line change.
5. **DOM position of the bar** - mockup puts `<nav>` after the header and before the pages inside `.app` (295-300); the code does the same (`src/App.tsx:99`, after the storage warning). No check asserts it, but the bar is `position: fixed`, so the order is not visible; it only sets keyboard and screen-reader order.

## Gate

`pnpm test` - 98 passed, 0 failed (10 files). `pnpm exec playwright test` - 19 passed, 0 failed.
