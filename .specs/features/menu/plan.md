# Menu

## Problem

The app has one screen, Hoje. The body-measurements design puts logging, Histórico, the chart and
the reminder setting on a second page, Medidas, and right now there is no way to reach a second
page. She uses the app one-handed at the gym, often mid-set with the rest timer running, so the
way to Medidas has to be in thumb reach and must not cost her the workout she has open: checked
exercises, an open "como faz" guide, a running timer.

This is slice 2 of 7 in `.design/body-measurements.md`. It adds a Hoje / Medidas bar fixed to the
bottom of the screen, as Samuel chose on mockup version 5 and as version 6 draws it. Medidas is
still nearly empty after this slice: Registrar medição, Lembrete, Histórico and Gráfico fill it.
When it ships, she can switch between the two pages and come back to the exact workout she left.

## Flow

This reuses `App`'s existing screen-state pattern (`override`, `celebrating`, `toast` are
in-memory `useState`) and the existing `RestTimer`, toast and header unchanged in behaviour. No
router, no stored field.

1. tap on a `Menu` button (door 1) -> `App` (exists) sets the in-memory destination
2. `App` (exists) keeps Hoje's content mounted and hides it, or shows it, and shows or hides the Medidas page (door 1)
3. out: the header, the storage warning, `RestTimer` (exists) and the toast stay outside both pages, so they render on either destination. The rest timer and toast move up to sit above the bar

## Impact

| Front | What changes |
| --- | --- |
| domain | new term: destination - `hoje` or `medidas`, screen state in `App` only. Nothing branches on it yet. Lembrete's "Medir agora" will be the second caller |
| screen Hoje | its content moves inside a page container that can be hidden. Every existing test that queries Hoje runs on the default destination and must keep passing unchanged |
| layout | the rest timer moves up from 16px to above the bar, the toast above the timer, and the page bottom padding grows so Backup is not hidden behind both. `e2e/guides.spec.ts` and the Descanso tests in `App.test.tsx` query the timer by role and keep passing |
| stored data | nothing. The destination is not stored, so the record and the backup are unchanged |

## Relations

None - no stored-data shape change.

## Surface

None - nothing consumed outside.

## Landing

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| 1. how the app switches pages - the first navigation, and every later slice opens Medidas through it | `App` holds `const [page, setPage] = useState<"hoje" \| "medidas">("hoje")`. Both pages stay mounted; the inactive one carries `hidden`. A `<nav aria-label="Menu">` with two `<button>`s, the active one `aria-current="page"`. No URL change, no history entry, not stored | a router or hash routes - a new dependency, and the phone's back button would start walking between pages, which nothing asked for. Unmounting the inactive page - Hoje's open guide and uncommitted card state live in component state and would be lost on every switch |

- Nothing else in this change is hard to reverse. The bar's look and the offsets are CSS a redeploy changes

## Criteria

### S1: Hoje / Medidas bar at the bottom (P1)

She switches between Hoje and Medidas with her thumb, and coming back to Hoje shows the workout
exactly as she left it.

**Acceptance Criteria**

1. The system SHALL show a navigation region named "Menu" with exactly two buttons, "Hoje" then "Medidas", fixed to the bottom of the viewport with its bottom edge at the viewport's bottom edge plus the safe-area inset
2. WHEN the app opens THEN the system SHALL show Hoje and mark "Hoje" with `aria-current="page"`, whichever destination was shown before the app was closed
3. WHEN "Medidas" is tapped THEN the system SHALL hide the streak card, week strip, workout picker, workout or rest/done card and Backup, show the region named "Medidas" (no visible heading, as mockup v6 draws the page), mark "Medidas" with `aria-current="page"` and remove `aria-current` from "Hoje"
4. WHEN "Hoje" is tapped from Medidas THEN the system SHALL show the same workout with the same checked exercises and the same open "como faz" guide as before the switch
5. WHILE the rest timer is running, WHEN she switches to Medidas and back THEN the timer SHALL stay visible on both destinations and keep counting down from the same end time
6. The system SHALL show the header "Treino Miudinha" with the date, and the "Seus dados não estão sendo salvos neste navegador" warning when it applies, on both destinations
7. WHEN the destination changes THEN the system SHALL scroll the page to the top
8. The system SHALL place the rest timer and a toast entirely above the menu bar, with no overlap between any two of the three, at a 360×740 viewport
9. WHEN Hoje is scrolled to the bottom at a 360×740 viewport THEN the "Importar backup" button SHALL be entirely above the rest timer
10. The system SHALL give each menu button a height of at least 48px
11. The system SHALL mark the active menu button with the `--blush` background and `--cherry` text colour, and the inactive one with `--muted` text colour, in both the light and the dark colour scheme
12. WHILE the workout-complete celebration is shown THEN the system SHALL keep the menu bar underneath it, so a tap on the bar's position reaches the celebration and not the menu
13. WHILE Medidas is shown and no later slice has filled it THEN the system SHALL show the text "Em breve você registra suas medidas aqui." as its only content

**Independent test:** `pnpm test` for the switch, the preserved workout and the timer, and
`pnpm e2e` for the fixed bar, the offsets and the colours at 360×740 in both schemes.

## Out of scope

Product capabilities only. Process and harness rules live in AGENTS.md or as Observable `n/a`.

| Excluded | Why |
| --- | --- |
| The Medidas content - form, Histórico, chart, reminder setting | slices Registrar medição, Histórico, Gráfico and Lembrete |
| "Medir agora" opening Medidas from the reminder card | slice Lembrete. It will call the same `setPage` |
| The phone's back button switching pages, deep links to Medidas | not asked for. The back button keeps leaving the app, as it does today |
| Remembering the last destination | the design says the app always opens on Hoje |

## Assumptions

Defaults that are not already a numbered criterion. Drop a row once it is.

| Assumption | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Where Backup lives | stays on Hoje, at the bottom, as mockup v6 draws it | the mockup is the approved layout. Moving it is a later call once Medidas has content | y - Samuel, 2026-10-08 |
| A new day arrives (visibility rollover) while Medidas is shown | stays on Medidas. Hoje re-renders underneath with the new day | the rollover only replaces Hoje's data. Jumping pages on resume would be surprising | y - Samuel, 2026-10-08 |
| Pushing this slice to her phone | not pushed alone. It ships together with Registrar medição at the earliest | a Medidas page that says "em breve" is noise on her phone. Push needs Samuel's go-ahead anyway | y - Samuel, 2026-10-08 |
| Medidas placeholder copy (AC 13) | "Em breve você registra suas medidas aqui." | short pt-BR, matches the app's tone. Disappears with the next slice | y - Samuel, 2026-10-08 |

**Open questions:** none - all resolved or logged above.

## Observable

Worksheet, not the review. `n/a` needs its reason. One row may group the same decision
across several routes.

| Surface | Decision | Landing |
| --- | --- | --- |
| screen Menu bar | empty state | n/a - always two fixed destinations |
| screen Menu bar | loading, error, unauthorised states | n/a - in-memory switch, no fetch, single user |
| screen Menu bar | density and ordering | AC 1, AC 10 |
| screen Menu bar | which destination is active | AC 2, AC 3, AC 11 |
| screen Menu bar | destructive action confirms | n/a - switching loses nothing (AC 4, AC 5) |
| screen Medidas | empty state | AC 13 - until Registrar medição and Histórico fill it |
| screen Medidas | loading, error, unauthorised | n/a - reads the in-memory record. The storage warning stays (AC 6) |
| screen Hoje | state kept across a switch | AC 4, AC 5 |
| screen Hoje | content not hidden behind the bar | AC 8, AC 9 |
| overlay celebration | stacking over the bar | AC 12 |

## Sources

- `.design/body-measurements.md`, slice Menu - confirmed by Samuel 2026-10-08
- Mockup https://claude.ai/artifact/4cBeaiXRUspBbtpdr9isNa version 6 - the bar's markup, icons, colours and the timer above it
