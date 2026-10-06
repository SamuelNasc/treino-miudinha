# Gym checklist app ("Treino Miudinha") verification

**Verdict**: PASS
**Profile**: light
**Diff range**: b305887..0e0b70cf3d8a259ce56202b8052bc138efa92334
**Round**: 1 - full
**Verifier**: independent sub-agent (author != verifier)

All 36 checks (C1-C36) proven at HEAD `0e0b70c`, each with a located assertion that targets the
check-defined value. Proofs ran in two batched invocations (unit/UI suite; build + PWA suite).

## Binding sources

Step 1 not required at `light`. For the record, `docs/exercices-list.md` was opened and C3's
expected rows (`src/domain/plan.test.ts:13-56`) match it verbatim (names, order, en-dash `10–12`
literals, 6/9/6/9 counts) - no contradiction observed.

## Checks

Proof runs (both at HEAD):
- U = `pnpm vitest run --reporter=verbose` - exit 0, 6 files, 36 tests passed, each named test listed individually as passed
- P = `pnpm build && pnpm vitest run -c vitest.pwa.config.ts --reporter=verbose` - exit 0, 2 tests passed

| Check | Claim | Proof run | Evidence | Result |
| --- | --- | --- | --- | --- |
| C1 | empty storage on Monday shows "Treino A" | U - `Hoje > empty storage shows Treino A` passed | `src/App.test.tsx:52` - `expect(screen.getByRole("heading", { name: "Treino A" })).toBeInTheDocument()` (setToday(MON) at :50) | PASS |
| C2 | successor A→B→C→D→A, none→A | U - `rotation > next workout follows A-B-C-D-A` passed | `src/domain/rotation.test.ts:7` - `expect(nextWorkout([])).toBe("A")`; `:20` - `expect(nextWorkout(completions)).toBe(next)` over cases :9-12 | PASS |
| C3 | plan module equals trainer list A-D, 6/9/6/9, literals verbatim | U - `plan > matches the trainer's list` passed | `src/domain/plan.test.ts:13` / `:23` / `:36` / `:46` - `expect(rows("A"/"B"/"C"/"D")).toEqual([...])` with `"Tríceps testa – 3×10–12"` at :28; focus via `:11-12,22,35,45` `toMatch(/.../i)` | PASS |
| C4 | Hoje for A shows letter, focus, 6 names in order with sets | U - `Hoje > renders letter, focus and every exercise in order` passed | `src/App.test.tsx:59` - `expect(screen.getByText("Perna · quadríceps")).toBeInTheDocument()`; `:61` - `expect(items.map(... ex-name, ex-sets ...)).toEqual([["Extensão","4×10"], ... ["Gêmeos","3×15"]])` | PASS |
| C5 | tap toggles, indicator 1/6 then 0/6 | U - `Hoje > tap toggles and updates checked/total` passed | `src/App.test.tsx:78-79` - `toHaveAttribute("aria-pressed","true")`, `getByText("1/6")`; `:81-82` - `"false"`, `getByText("0/6")` | PASS |
| C6 | remount same date restores 2 checks, 2/6 | U - `Hoje > reload on same date restores checks` passed | `src/App.test.tsx:94` - `expect(screen.getByText("2/6")).toBeInTheDocument()`; `:95-96` - Extensão/Afundo `toHaveAttribute("aria-pressed", "true")` | PASS |
| C7 | stale today.date → checked [] and completions unchanged | U - `store > stale checks are discarded on a later date` passed | `src/domain/store.test.ts:15` - `expect(record.today.checked).toEqual([])`; `:17` - `expect(record.completions).toEqual([{ date: "2026-10-02", workout: "D" }])` | PASS |
| C8 | last check appends {today, A} and shows "Treino concluído!" | U - `Hoje > last check records completion and celebrates` passed | `src/App.test.tsx:105` - `expect(stored().completions).toEqual([{ date: MON, workout: "A" }])`; `:106` - `getByText("Treino concluído!")` | PASS |
| C9 | duplicate completion same workout+date stays length 1 | U - `store > no duplicate completion for same workout and date` passed | `src/domain/store.test.ts:24` - `expect(r.completions).toEqual([{ date: "2026-10-05", workout: "A" }])` after two `addCompletion` calls | PASS |
| C10 | completion of A today shows "Próximo: Treino B" | U - `Hoje > completed today shows next workout` passed | `src/App.test.tsx:113` - `expect(screen.getByText(/Próximo: Treino B/)).toBeInTheDocument()`; `:123` same after tick-all + remount | PASS |
| C11 | isRestDay true Wed/Sat/Sun, false Mon/Tue/Thu/Fri | U - `rotation > rest days are Wed, Sat, Sun` passed | `src/domain/rotation.test.ts:28-34` - `expect(isRestDay("2026-10-05")).toBe(false)` ... `expect(isRestDay("2026-10-11")).toBe(true)`, all 7 weekdays | PASS |
| C12 | Wednesday shows "Hoje é descanso" + "Treinar mesmo assim" → next heading | U - `Hoje > rest day shows descanso and train anyway` passed | `src/App.test.tsx:147` - `getByText("Hoje é descanso")`; `:148` - `queryByRole("heading",{name:"Treino C"})).not.toBeInTheDocument()`; `:150` - `getByRole("heading", { name: "Treino C" })` after click at :149 | PASS |
| C13 | selector C shows "Treino C", first exercise "Flexora cadeira" | U - `Hoje > selector overrides rotation` passed | `src/App.test.tsx:158` - `getByRole("heading", { name: "Treino C" })`; `:160` - `expect(within(items[0]).getByTestId("ex-name")).toHaveTextContent("Flexora cadeira")` | PASS |
| C14 | reduced motion: text, no falling elements; otherwise present | U - `Hoje > reduced motion celebration has no animation` passed | `src/App.test.tsx:171-172` - `getByText("Treino concluído!")`, `expect(document.querySelectorAll(".fall")).toHaveLength(0)`; `:182` - `expect(document.querySelectorAll(".fall").length).toBeGreaterThan(0)` | PASS |
| C15 | weekCount Mon-Sun: prev Sunday out, this Mon and Sun in | U - `progress > week count uses Mon-Sun week` passed | `src/domain/progress.test.ts:14` - `weekCount([c("2026-10-04")], TODAY)).toBe(0)`; `:15` - `c("2026-10-05")...toBe(1)`; `:16` - `c("2026-10-11")...toBe(1)` | PASS |
| C16 | 3/4/2 weeks → streak 2, screen "Esta semana: 2/4" | U - `progress > streak counts past weeks with 3+` and `Progresso > progress shows streak and week count` passed | `src/domain/progress.test.ts:26` - `expect(streak(completions, TODAY)).toBe(2)`; `src/App.test.tsx:192-193` - `getByTestId("streak-number")).toHaveTextContent("2")`, `getByText("Esta semana: 2/4")` | PASS |
| C17 | current week ≥3 adds 1 | U - `progress > current week with 3+ adds one` passed | `src/domain/progress.test.ts:35` - `expect(streak(completions, TODAY)).toBe(2)` (1 past + current); `:36` - `expect(streak(completions.slice(3), TODAY)).toBe(1)` | PASS |
| C18 | gap → 1; last week with 2 → 0 | U - `progress > streak stops at first non-qualifying past week` passed | `src/domain/progress.test.ts:45` - `expect(streak(gap, TODAY)).toBe(1)`; `:51` - `expect(streak(broken, TODAY)).toBe(0)` | PASS |
| C19 | strip Seg..Dom, letters, aria-current today, future marked | U - `Progresso > week strip marks letters, today and future` passed | `src/App.test.tsx:201` - labels `toEqual(["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"])`; `:202-203` - day-dot `toHaveTextContent("A")`/`("B")`; `:205` - aria-current `toEqual([null,null,null,"date",null,null,null])`; `:206` - future `toEqual([false,false,false,false,true,true,true])` | PASS |
| C20 | no completions → streak 0, "Comece hoje 💪" | U - `Progresso > no completions shows comece hoje` passed | `src/App.test.tsx:213-214` - `getByTestId("streak-number")).toHaveTextContent("0")`, `getByText("Comece hoje 💪")` | PASS |
| C21 | 40 on Leg press 45° survives remount | U - `Carga > weight persists across reload` passed | `src/App.test.tsx:227` - `expect(screen.getByLabelText("Carga de Leg press 45° em kg")).toHaveValue("40")`; `:228` - `weights["leg-press-45"]).toBe(40)` | PASS |
| C22 | abdominal-reto weight on B prefilled on D | U - `Carga > shared exercise shares weight` passed | `src/App.test.tsx:240-241` - heading "Treino D", `getByLabelText("Carga de Abdominal reto em kg")).toHaveValue("12")` | PASS |
| C23 | parseWeight accepts 0, 0.5, 500, "42,5"; rejects -1, 500.5, "abc" | U - `store > weight bounds` passed | `src/domain/store.test.ts:31-37` - `parseWeight("0",10)).toBe(0)` ... `("42,5",10)).toBe(42.5)`, `("-1",10)).toBe(10)`, `("500.5",10)).toBe(10)`, `("abc",10)).toBe(10)` | PASS |
| C24 | no saved weight → empty field; clearing removes stored weight | U - `Carga > weight can be empty` passed | `src/App.test.tsx:249` - `expect(field).toHaveValue("")`; `:255-256` - `toHaveValue("")`, `expect(stored().weights).not.toHaveProperty("extensao")` | PASS |
| C25 | timer 1:30 default counting down; 60 s → 1:00, persisted restSeconds 60 | U - `Descanso > timer counts down from chosen rest` passed | `src/App.test.tsx:268,270` - `/^1:30/` then `/^1:29/` after 1 s; `:274,276` - `"Descanso · 1:00"`, `/^1:00/`; `:277` - `expect(stored().restSeconds).toBe(60)` | PASS |
| C26 | reaches 0 → "Bora! Próxima série", vibrate called once | U - `Descanso > timer finishes and vibrates` passed | `src/App.test.tsx:288` - `getByRole("button", { name: "Bora! Próxima série" })`; `:290` - `expect(vibrate).toHaveBeenCalledTimes(1)` | PASS |
| C27 | +50 s without ticks + visibilitychange → 0:40 | U - `Descanso > timer recomputes from end timestamp on foreground` passed | `src/App.test.tsx:303` - `expect(timer().getByRole("button", { name: /^0:40/ })).toBeInTheDocument()` | PASS |
| C28 | tapping running timer → idle "Descanso · 1:30" | U - `Descanso > tapping running timer cancels` passed | `src/App.test.tsx:313` - `getByRole("button", { name: "Descanso · 1:30" })`; `:315` same after 100 s (stays idle). Clicked button `/parar/` is the running `.go` button (`src/components/RestTimer.tsx:44,60`) | PASS |
| C29 | built manifest name/short_name/standalone, 192/512 PNGs real size, apple-touch-icon exists | P - `built PWA > manifest is installable` passed | `tests/pwa/build.test.ts:17-19` - `toBe("Treino Miudinha")`, `toBe("Miudinha")`, `toBe("standalone")`; `:24` - `expect(pngSize(icon.src)).toEqual([size, size])`; `:30` - `expect(existsSync(join(dist, touch![1]))).toBe(true)` | PASS |
| C30 | SW precaches index.html and every JS/CSS/font, navigation fallback index.html | P - `built PWA > service worker precaches the app shell` passed | `tests/pwa/build.test.ts:37` - `expect(precached("index.html")).toBe(true)`; `:44` - `expect(missing).toEqual([])` (non-empty guards :40-42); `:46` - `toMatch(/NavigationRoute\([^)]*createHandlerBoundToURL\("index\.html"\)/)` | PASS |
| C31 | stored value is exactly the door-1 record under one key | U - `store > persists the door-1 record under one key` passed | `src/domain/store.test.ts:46` - `expect(localStorage.length).toBe(1)`; `:48-54` - `expect(stored).toEqual({ version: 1, completions: [], today: {...checked:["extensao"]}, weights: {...}, restSeconds: 90 })`; `:55` - keys `toEqual([...5 keys])` | PASS |
| C32 | localDate 22:00 UTC-3 → same date; weekStart Sunday → Monday | U - `dates > local date and monday week start` passed | `src/domain/dates.test.ts:9` - `expect(localDate(late)).toBe("2026-10-05")` (UTC slip shown at :8); `:11` - `expect(weekStart("2026-10-11")).toBe("2026-10-05")` | PASS |
| C33 | Exportar downloads treino-backup-<today>.json deep-equal to record | U - `Backup > export downloads the record` passed | `src/App.test.tsx:335` - `expect(downloadName).toBe(\`treino-backup-${MON}.json\`)`; `:337` - `expect(JSON.parse(await blob.text())).toEqual(stored())` | PASS |
| C34 | import + confirm replaces and re-renders; decline leaves unchanged | U - `Backup > import replaces after confirm` passed | `src/App.test.tsx:359` - `expect(localStorage.getItem(STORAGE_KEY)).toBe(before)` (declined); `:367-369` - `findByText("Esta semana: 2/4")`, streak `toHaveTextContent("2")`, `stored().completions).toEqual(THREE_WEEKS)` | PASS |
| C35 | non-JSON, no version, version 2 → "Arquivo inválido", record unchanged | U - `Backup > invalid import is rejected` passed | `src/App.test.tsx:383-384` - `findByText("Arquivo inválido")`, `expect(localStorage.getItem(STORAGE_KEY)).toBe(before)` in loop over the 3 inputs at :375 | PASS |
| C36 | setItem or getItem throws → still toggles, shows warning | U - `Backup > storage failure keeps working in memory` passed | `src/App.test.tsx:400,402` - `getByText(warning)`, `getByText("1/6")` (setItem throws); `:410,412` same (getItem throws) | PASS |

## Coverage

Coverage recompute not required at `light`; the checks.md Coverage table was read but not recomputed.

## Test policy rows

Not required at `light`; checks.md carries no Test policy section.

## Faults injected

Fault injection not required at `light`; none run.

## Swept

No `Swept` row resolves to "existing" - every row names check ids (C7-C10, C12, C23, C35, C36) or `n/a`, so there is nothing to re-read against the code.

## Notes (non-failing)

- Precision gap (C3): workout focus text is asserted only by regex (`plan.test.ts:11-12,22,35,45`), not as an exact string; only A's rendered focus is pinned exactly (`App.test.tsx:59`, "Perna · quadríceps"). B-D focus wording could drift unnoticed.
- Level note (C9): duplicate prevention is proven on `addCompletion` only; the UI path calls it (`src/App.tsx:51`) but no UI test re-completes the same workout on the same day (e.g. uncheck + re-check after completion).
- C29/C30 prove the built `dist/` artefacts, not real offline loading or installability in a browser; the plan's manual airplane-mode / Lighthouse test remains Samuel's (as checks.md states).
- An extra test `Hoje > resuming on a later date rolls the session over` (`src/App.test.tsx:127`) covers AC 6 at UI level but is named by no check.
- `nextWorkout` picks the most recent by date with `>=` (`src/domain/rotation.ts:9`), so with two completions on the same date the later array entry wins; this tie case is not checked (plan allows two workouts per day).

## Gate

`pnpm vitest run --reporter=verbose` - 36 passed, 0 failed; `pnpm build && pnpm vitest run -c vitest.pwa.config.ts --reporter=verbose` - 2 passed, 0 failed (38 total)
