# Apagar treino checks

Profile: ui
Plan: `.specs/features/apagar-treino/plan.md`

22 checks in 3 slices · 0 one-way doors · 0 open

The removal rule is proven at its own layer in `src/domain/store.test.ts` (new
`describe("removeCompletion")`). Behaviour proofs render `App` in jsdom (`src/App.test.tsx`, new
`describe("Apagar treino")`), with `setToday`, `seed`, `stored` and `checkAll` as the existing tests
use them. Today is `FRI` (2026-10-09, a training day) unless a check says otherwise. `WEEK` is the
seed `[A on 2026-10-05, B on 2026-10-07]`. Layout and style proofs are Playwright at 360×740
(`e2e/apagar-treino.spec.ts`, new), seeding `treino:v1` before load and fixing the clock at
2026-10-09. Binding source: none - the plan copies Histórico's confirm, and that verified confirm
is the reference the style checks compare against.

"The strip" is the list named "Semana". "A confirm" is the group named by its question.

## Checks

### S0 - Removal rule · 2 files · ~9 KB · ~2k

**C1** - `removeCompletion(record, "2026-10-07", "B")` on a record holding A on 10-05, B on 10-07 and C on 10-07 returns `completions` equal to [A on 10-05, C on 10-07], and every other field of the record deep-equals the input's. Removing a pair not stored returns `completions` unchanged (AC 6, AC 15) — done
Proof: `pnpm vitest run src/domain/store.test.ts -t "removeCompletion drops exactly one pair"`

### S1 - Remove from the strip · 4 files · ~120 KB · ~30k

**C2** - Seeded with `WEEK`, the strip holds exactly two buttons, named "Apagar treino de seg, 05/10" and "Apagar treino de qua, 07/10"; the days Tue, Thu, Fri, Sat and Sun hold no button. Seeded with A on `FRI` too, the strip also holds a button "Apagar treino de sex, 09/10" (AC 1, AC 2) — done
Proof: `pnpm vitest run src/App.test.tsx -t "strip days with a workout are buttons"`

**C3** - Seeded with `WEEK`, tapping the Wednesday button shows a group "Apagar o Treino B de qua, 07/10?" holding that text and the buttons "Apagar" and "Cancelar", placed after the strip and before the group "Escolher treino" in document order, and the stored record still deep-equals the seed (AC 3) — done
Proof: `pnpm vitest run src/App.test.tsx -t "tapping a day asks first"`

**C4** - Seeded with A then B on 2026-10-07, tapping Wednesday shows two groups, "Apagar o Treino A de qua, 07/10?" then "Apagar o Treino B de qua, 07/10?" in that document order (AC 3) — done
Proof: `pnpm vitest run src/App.test.tsx -t "one confirm per workout of the day"`

**C5** - With the Wednesday confirm showing, tapping "Cancelar" removes it and the stored record deep-equals the seed; tapping Wednesday again shows it, and tapping Wednesday once more removes it and the stored record still deep-equals the seed (AC 4) — done
Proof: `pnpm vitest run src/App.test.tsx -t "cancelar or a second tap keeps the workout"`

**C6** - With the Wednesday confirm showing, tapping Monday removes "Apagar o Treino B de qua, 07/10?" and shows "Apagar o Treino A de seg, 05/10?" (AC 5) — done
Proof: `pnpm vitest run src/App.test.tsx -t "another day replaces the confirm"`

**C7** - Seeded with `WEEK`, confirming "Apagar" on Wednesday leaves stored `completions` equal to [A on 2026-10-05], removes the confirm, shows a status "Treino apagado", leaves the Wednesday dot with empty text and no button named for Wednesday, shows "Esta semana: 1/4", and shows "próximo" in the Picker's B button (AC 6, AC 7) — done
Proof: `pnpm vitest run src/App.test.tsx -t "apagar removes the workout and re-derives"`

**C8** - Seeded with A on 09-21, B on 09-22, C on 09-24, D on 09-28, A on 09-29, B on 10-01, then A on 10-05, B on 10-06, C on 10-08, today `FRI`: the streak number reads "3" and "Esta semana: 3/4"; confirming "Apagar" on Thursday makes the streak number read "2" and "Esta semana: 2/4" (AC 7) — done
Proof: `pnpm vitest run src/App.test.tsx -t "removing a workout lowers the streak"`

**C9** - Seeded with only A on `FRI`, today's checks holding every exercise of A with `today.workout` "A": confirming "Apagar" on Friday leaves stored `completions` empty and `today` equal to `{ date: "2026-10-09", workout: null, checked: [] }`, shows the heading "Treino A" with "0/6", and shows the streak label "Comece hoje 💪" (AC 8, AC 10) — done
Proof: `pnpm vitest run src/App.test.tsx -t "removing today's workout clears its checks"`

**C10** - Today 2026-10-10 (Saturday, a rest day), seeded with A on 10-05 and B on 2026-10-10 with today's checks holding all of B: confirming "Apagar" on Saturday shows the heading "Hoje é descanso" and the button "Treinar mesmo assim", and no heading "Treino B" (AC 8) — done
Proof: `pnpm vitest run src/App.test.tsx -t "removing today's workout on a rest day shows rest"`

**C11** - Seeded with `WEEK`, today 2026-10-09, the Wednesday confirm showing: with the clock moved to 2026-10-12 (next Monday) and a `visibilitychange` to visible, no group "Apagar o Treino B de qua, 07/10?" is shown (AC 9) — done
Proof: `pnpm vitest run src/App.test.tsx -t "a new day hides the confirm"`

### S2 - Uncheck undoes today's workout · 2 files · ~95 KB · ~24k

**C12** - Seeded with A on 2026-10-05 and today `FRI`, checking every exercise of B records B on `FRI`; tapping "Fechar" on the celebration and picking B in the Picker, then unchecking "Voador" leaves stored `completions` equal to [A on 2026-10-05], stored `today.checked` holding every other exercise id of B and not `voador`, and `today.workout` "B" (AC 11) — done
Proof: `pnpm vitest run src/App.test.tsx -t "unchecking undoes today's workout"`

**C13** - After C12's uncheck: the Friday dot has empty text, "Esta semana: 1/4" shows, the Picker's B button shows "próximo", no status role "Treino apagado" exists, and no celebration dialog exists (AC 12) — done
Proof: `pnpm vitest run src/App.test.tsx -t "unchecking re-derives quietly"`

**C14** - After C12's uncheck, checking that exercise again stores B on `FRI` once (`completions` length 2) and shows the celebration with "Treino B feito." (AC 13) — done
Proof: `pnpm vitest run src/App.test.tsx -t "checking again records it again"`

**C15** - Seeded with B on `FRI`, `today.workout` "A" with two checks of A: picking A and unchecking one leaves `completions` holding B on `FRI` (an exercise of a workout with no Completion today removes nothing) (AC 11) — done
Proof: `pnpm vitest run src/App.test.tsx -t "unchecking another workout keeps today's completion"`

**C16** - With `weights` `{ extensao: 40, voador: 12 }` seeded, both a strip removal and an uncheck removal leave stored `weights` deep-equal to the seed (AC 14) — done
Proof: `pnpm vitest run src/App.test.tsx -t "removal keeps weights"`

### S3 - Record and arrangement · 3 files · ~40 KB · ~10k

**C17** - Seeded with `WEEK`, `weights`, `restSeconds: 60`, one Measurement and `reminder: { everyDays: 14 }`: after a strip removal the stored record has `version` 1 under `treino:v1`, and every key except `completions` deep-equals the seed (AC 15) — done
Proof: `pnpm vitest run src/App.test.tsx -t "removal keeps the rest of the record"`

**C18** - At 360×740, light scheme, the Wednesday confirm showing: its box top is at or below the strip's box bottom and its box bottom at or above the picker's box top; its width equals the strip's width within 1 px; "Apagar" and "Cancelar" are each at least 44 px tall; the question's box is left of "Apagar", which is left of "Cancelar" (or on a later line) (AC 16) — done
Proof: `pnpm exec playwright test e2e/apagar-treino.spec.ts -g "confirm sits between strip and picker"`

**C19** - In the light and the dark scheme, the confirm's background is `--blush` (#ffe1e6 / #3a141c) and its "Apagar" background is `--cherry` (#b3122e / #ff5c75) with `--on-accent` text (#ffffff / #1c0a0e) (AC 17) — done
Proof: `pnpm exec playwright test e2e/apagar-treino.spec.ts -g "confirm colours match historico"`

**C20** - In the light scheme, a strip day button's dot has the same size, border, background and letter colour as the same dot before this change (the done dot: background `--berry`, 42 px max width, font weight 600), the button has no visible native border or background of its own, and focused by keyboard (Tab) it shows a non-`none` outline (AC 18) — done
Proof: `pnpm exec playwright test e2e/apagar-treino.spec.ts -g "strip day button keeps its look"`

**C21** - Histórico's confirm still reads "Apagar a medição de 30/09?" (AC 19) — done
Proof: `pnpm vitest run src/App.test.tsx -t "apagar asks first"`

**C22** - The existing strip test still passes unchanged: letters, today and future (AC 2, AC 18) — done
Proof: `pnpm vitest run src/App.test.tsx -t "week strip marks letters, today and future"`

## Coverage

| Set (size) | Member -> proof | Unproven |
| --- | --- | --- |
| strip day kinds (4) | with Completion C2 · without C2 · today with Completion C2 · future C2, C22 | - |
| confirm exits (4) | "Apagar" C7 · "Cancelar" C5 · same day again C5 · another day C6 | - |
| confirm hide on day change (1) | C11 | - |
| workouts per day (2) | one C3 · two C4 | - |
| re-derived views (5) | strip dot C7, C13 · "Esta semana" C7, C13 · streak C8 · "próximo" C7, C13 · empty label C9 | - |
| what Hoje shows after today's removal (2) | training day C9 · rest day C10 | - |
| uncheck cases (3) | workout completed today C12 · re-check C14 · workout not completed today C15 | - |
| record fields kept (6) | `weights` C16, C17 · `restSeconds` C17 · `measurements` C17 · `reminder` C17 · `today` C9, C17 · other Completions C1, C17 | - |
| colour schemes (2) | light C19 · dark C19 | - |

- No check claims more than the cases its proof exercises; C1 covers the rule, C7 and C12 each cross the screen for one path

## Test policy

The repo answers both questions: domain rules in `src/domain/*.test.ts`, screen behaviour by rendering `App`, layout and colour in Playwright (Histórico, Lembrete, Gráfico). Nothing to add.

## Swept

- validation: n/a - no input is typed; the only inputs are taps on rendered workouts
- failure modes: existing - a failed write raises "Seus dados não estão sendo salvos" through `useRecord`
- idempotency: C1 - removing a pair not stored changes nothing
- authorization: n/a - one person, one device, no accounts
- concurrency: n/a - one tab writes the record; the app already assumes a single writer
- data lifecycle: C1, C17 - deletion removes exactly one pair and nothing else
- dependency failure: n/a - no network or external service
- state transitions: C9, C12, C14 - Completion present to absent and back
- observability: n/a - no logging in this app

## Handoff

- S0 = 2k, S1 = 30k, S2 = 24k, S3 = 10k: 66k total from `wc -c` of `App.tsx`, `Progress.tsx`, `History.tsx`, `store.ts`, `index.css`, `App.test.tsx` and the e2e spec, under the 150k budget - one builder
