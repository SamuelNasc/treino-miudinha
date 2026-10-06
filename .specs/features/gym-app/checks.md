# Gym checklist app ("Treino Miudinha") - checks

Profile: light
Plan: `.specs/features/gym-app/plan.md`

36 checks in 6 slices · 5 one-way doors · 0 open

All UI proofs run in jsdom with the clock pinned by `vi.setSystemTime` and `TZ=America/Sao_Paulo`
(set in `vitest.config.ts`), so a date that UTC would shift is caught. Build-output proofs (S5)
run under `vitest.pwa.config.ts` after `pnpm build`.

## Checks

### S1 - Hoje · ~10 files · ~45 KB · ~11k

**C1** - With empty storage on a Monday, screen `Hoje` shows heading "Treino A" (AC 1)
Proof: `pnpm vitest run src/App.test.tsx -t "empty storage shows Treino A"`

**C2** - After a most recent completion of X, the next workout is A→B, B→C, C→D, D→A; with no completion it is A (AC 2)
Proof: `pnpm vitest run src/domain/rotation.test.ts -t "next workout follows A-B-C-D-A"`

**C3** - The plan module holds exactly the trainer's list: workouts `A`-`D` with focus text, 6/9/6/9 exercises in source order, and each sets×reps literal verbatim (e.g. `3×10–12`) (AC 3, door 2)
Proof: `pnpm vitest run src/domain/plan.test.ts -t "matches the trainer's list"`

**C4** - Screen `Hoje` for Treino A shows "Treino A", its focus, and all 6 exercise names in plan order each with its sets×reps literal (AC 3)
Proof: `pnpm vitest run src/App.test.tsx -t "renders letter, focus and every exercise in order"`

**C5** - Tapping an exercise marks it checked and the indicator reads `1/6`; tapping it again reads `0/6` (AC 4)
Proof: `pnpm vitest run src/App.test.tsx -t "tap toggles and updates checked/total"`

**C6** - After checking 2 exercises and remounting the app on the same date, the same 2 are checked and the indicator reads `2/6` (AC 5)
Proof: `pnpm vitest run src/App.test.tsx -t "reload on same date restores checks"`

**C7** - Loading a record whose `today.date` is earlier than today yields `today.checked = []` and leaves `completions` unchanged (AC 6)
Proof: `pnpm vitest run src/domain/store.test.ts -t "stale checks are discarded on a later date"`

**C8** - Checking the last unchecked exercise appends `{ date: "<today>", workout: "A" }` to `completions` and shows "Treino concluído!" (AC 7)
Proof: `pnpm vitest run src/App.test.tsx -t "last check records completion and celebrates"`

**C9** - Recording a completion for a workout and date that already has one leaves `completions` at length 1 (AC 8)
Proof: `pnpm vitest run src/domain/store.test.ts -t "no duplicate completion for same workout and date"`

**C10** - With a completion of A dated today, screen `Hoje` shows "Próximo: Treino B" (AC 9, plan independent test)
Proof: `pnpm vitest run src/App.test.tsx -t "completed today shows next workout"`

**C11** - `isRestDay` is true for Wednesday, Saturday and Sunday and false for Monday, Tuesday, Thursday and Friday (AC 10)
Proof: `pnpm vitest run src/domain/rotation.test.ts -t "rest days are Wed, Sat, Sun"`

**C12** - On a Wednesday with no completion today, `Hoje` shows "Hoje é descanso" and a button "Treinar mesmo assim"; tapping it shows the next workout's heading (AC 10)
Proof: `pnpm vitest run src/App.test.tsx -t "rest day shows descanso and train anyway"`

**C13** - Picking `C` in the A/B/C/D selector shows "Treino C" with its first exercise "Flexora cadeira" (AC 11)
Proof: `pnpm vitest run src/App.test.tsx -t "selector overrides rotation"`

**C14** - With `prefers-reduced-motion: reduce`, the celebration renders "Treino concluído!" and no falling-fruit elements; without it, falling elements are present (AC 12)
Proof: `pnpm vitest run src/App.test.tsx -t "reduced motion celebration has no animation"`

### S2 - Progresso · ~3 files · ~12 KB · ~3k

**C15** - `weekCount` counts completions from Monday to Sunday of the current week: a Sunday-before completion is excluded, Monday and Sunday of this week are included (AC 13)
Proof: `pnpm vitest run src/domain/progress.test.ts -t "week count uses Mon-Sun week"`

**C16** - Weeks with 3, 4 and 2 completions (current week last) give streak 2 and the screen shows "Esta semana: 2/4" (AC 13, 14, 15, plan independent test)
Proof: `pnpm vitest run src/domain/progress.test.ts -t "streak counts past weeks with 3+"`
Proof: `pnpm vitest run src/App.test.tsx -t "progress shows streak and week count"`

**C17** - When the current week already has 3 completions, streak = past consecutive qualifying weeks + 1 (AC 14)
Proof: `pnpm vitest run src/domain/progress.test.ts -t "current week with 3+ adds one"`

**C18** - A qualifying last week followed by a gap week before it gives streak 1; a last week with 2 completions gives streak 0 even if earlier weeks qualified (AC 14, 15)
Proof: `pnpm vitest run src/domain/progress.test.ts -t "streak stops at first non-qualifying past week"`

**C19** - The week strip has 7 days Seg..Dom; a day with a completion shows its letter, today carries `aria-current="date"`, days after today are marked future (AC 16)
Proof: `pnpm vitest run src/App.test.tsx -t "week strip marks letters, today and future"`

**C20** - With no completions, the streak shows 0 and the text "Comece hoje 💪" (AC 17)
Proof: `pnpm vitest run src/App.test.tsx -t "no completions shows comece hoje"`

### S3 - Carga · ~2 files · ~8 KB · ~2k

**C21** - Entering 40 on "Leg press 45°" and remounting shows 40 in that field (AC 18, 19, plan independent test)
Proof: `pnpm vitest run src/App.test.tsx -t "weight persists across reload"`

**C22** - `abdominal-reto` has one weight shared by B and D: a weight saved while on B is prefilled on D (AC 18, Relations)
Proof: `pnpm vitest run src/App.test.tsx -t "shared exercise shares weight"`

**C23** - `parseWeight` accepts 0, 0.5, 500 and "42,5" (→ 42.5); rejects -1, 500.5, "abc" (returns the previous value) (AC 20)
Proof: `pnpm vitest run src/domain/store.test.ts -t "weight bounds"`

**C24** - An exercise with no saved weight shows an empty field, and clearing a field removes the stored weight (AC 21)
Proof: `pnpm vitest run src/App.test.tsx -t "weight can be empty"`

### S4 - Descanso · ~2 files · ~8 KB · ~2k

**C25** - Tapping the timer shows `1:30` counting down by default; after choosing 60 s it starts at `1:00`, and the choice persists as `restSeconds: 60` (AC 22)
Proof: `pnpm vitest run src/App.test.tsx -t "timer counts down from chosen rest"`

**C26** - When the countdown reaches 0 the timer shows "Bora! Próxima série" and `navigator.vibrate` is called once (AC 23)
Proof: `pnpm vitest run src/App.test.tsx -t "timer finishes and vibrates"`

**C27** - After the clock jumps 50 s without ticks and a `visibilitychange` fires, a 90 s timer shows `0:40` (AC 24)
Proof: `pnpm vitest run src/App.test.tsx -t "timer recomputes from end timestamp on foreground"`

**C28** - Tapping the running timer returns it to idle `Descanso · 1:30` (AC 25)
Proof: `pnpm vitest run src/App.test.tsx -t "tapping running timer cancels"`

### S5 - Instalar · ~5 files · ~6 KB · ~2k

**C29** - The built `dist/manifest.webmanifest` has name "Treino Miudinha", short_name "Miudinha", display "standalone", and icons of 192×192 and 512×512 whose PNG files exist at those pixel sizes; `dist/index.html` links an `apple-touch-icon` that exists (AC 26, door 4)
Proof: `pnpm build && pnpm vitest run -c vitest.pwa.config.ts -t "manifest is installable"`

**C30** - The built service worker precaches `index.html` and every JS, CSS and font file in `dist/assets`, and registers a navigation fallback to `index.html` (AC 27)
Proof: `pnpm build && pnpm vitest run -c vitest.pwa.config.ts -t "service worker precaches the app shell"`

### S6 - Backup and storage · ~4 files · ~14 KB · ~4k

**C31** - The persisted value under `localStorage["treino:v1"]` after a check-off is exactly `{ version: 1, completions, today: { date, workout, checked }, weights, restSeconds }` and no other key is written (door 1)
Proof: `pnpm vitest run src/domain/store.test.ts -t "persists the door-1 record under one key"`

**C32** - `localDate` returns the device's local calendar date: 22:00 on 2026-10-05 in UTC-3 is `"2026-10-05"`; `weekStart` of Sunday 2026-10-11 is `"2026-10-05"` (door 5)
Proof: `pnpm vitest run src/domain/dates.test.ts -t "local date and monday week start"`

**C33** - "Exportar" downloads a file named `treino-backup-<today>.json` whose parsed content deep-equals the stored record (AC 28, door 3)
Proof: `pnpm vitest run src/App.test.tsx -t "export downloads the record"`

**C34** - Importing a valid backup and confirming replaces the record and re-renders (streak and week from the file); declining the confirm leaves the record unchanged (AC 29)
Proof: `pnpm vitest run src/App.test.tsx -t "import replaces after confirm"`

**C35** - Importing non-JSON text, JSON without `version`, or `version: 2` shows "Arquivo inválido" and leaves the stored record unchanged (AC 30)
Proof: `pnpm vitest run src/App.test.tsx -t "invalid import is rejected"`

**C36** - When `localStorage.setItem` throws, or `localStorage.getItem` throws, the app still toggles checks in memory and shows "Seus dados não estão sendo salvos neste navegador" (AC 31)
Proof: `pnpm vitest run src/App.test.tsx -t "storage failure keeps working in memory"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| rotation successor (5) | none→A C2 · A→B C2 · B→C C2 · C→D C2 · D→A C2 | - |
| weekdays -> rest (7) | Mon C11 · Tue C11 · Wed C11 · Thu C11 · Fri C11 · Sat C11 · Sun C11 | - |
| plan workouts (4) | A C3 · B C3 · C C3 · D C3 | - |
| `Hoje` states (4) | in progress C5 · completed today C10 · rest day C12 · celebration C8 | - |
| weight bound (6 edges) | 0 C23 · 500 C23 · -1 C23 · 500.5 C23 · non-number C23 · comma decimal C23 | - |
| streak rule (4 cases) | past run C16 · current week +1 C17 · broken by gap C18 · current week <3 not breaking C16 | - |
| week boundary (3) | prev Sunday excluded C15 · this Monday C15 · this Sunday C15 | - |
| timer states (4) | idle C28 · running C25 · finished C26 · foreground resync C27 | - |
| import inputs (5) | valid+confirm C34 · valid+decline C34 · non-JSON C35 · no version C35 · version 2 C35 | - |
| storage failures (2) | getItem throws C36 · setItem throws C36 | - |
| one-way doors (5) | door 1 C31 · door 2 C3 · door 3 C33 · door 4 C29 · door 5 C32 | - |
| Relations entities (5) | `Plan` C3 · `Treino` C3 · `Exercicio` C4 · `Conclusao` C8 · `UltimaCarga` C22 | - |
| startup config: storage key (2 assemblies) | app entry point C6 · test harness C31 | - |

- Claims naming a screen output: C1, C4, C5, C6, C8, C10, C12-C14, C16, C19-C22, C24-C28, C33-C36 - each proof renders `App`
- C29, C30 assert the built `dist/`, not the config, so they cross the build boundary. Neither proves real offline loading in a browser; that remains the plan's manual independent test (airplane mode) for Samuel
- No other check claims more than the cases its proof exercises

## Swept

- validation: C23, C35
- failure modes: C36
- idempotency: C9
- authorization: n/a - no accounts, one user on one device
- concurrency: n/a - one user, one tab in practice; last write wins on the single key is accepted
- data lifecycle: C7 - stale checks discarded; completions grow by ~200 a year, far below any storage limit
- dependency failure: C36
- state transitions: C7, C8, C10, C12
- observability: n/a - personal app, no logging requirement

## Handoff

- S1-S6 ≈ 40 files touched, ~95 KB / 4 ≈ 24k, all in one greenfield app - one builder, under the 150k budget
