import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { GUIDES } from "./domain/guides";
import { PLAN, type WorkoutId } from "./domain/plan";
import { measurementsOf, reminderOf } from "./domain/measurements";
import { STORAGE_KEY, type TreinoRecord } from "./domain/store";

// 2026-10-05 is a Monday.
const MON = "2026-10-05";
const WED = "2026-10-07";
const THU = "2026-10-08";

function setToday(date: string, fakeIntervals = false) {
  const [y, m, d] = date.split("-").map(Number);
  vi.useFakeTimers({ toFake: fakeIntervals ? ["Date", "setInterval", "clearInterval"] : ["Date"] });
  vi.setSystemTime(new Date(y, m - 1, d, 10, 0, 0));
}

function seed(record: Partial<TreinoRecord> & { completions?: TreinoRecord["completions"] }, today: string) {
  const full: TreinoRecord = {
    version: 1,
    completions: [],
    today: { date: today, workout: null, checked: [] },
    weights: {},
    restSeconds: 90,
    ...record,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
}

const stored = (): TreinoRecord => JSON.parse(localStorage.getItem(STORAGE_KEY)!);

const c = (date: string, workout: WorkoutId) => ({ date, workout });

// 3 workouts the week of 09-21, 4 the week of 09-28, 2 in the current week (of 10-05).
const THREE_WEEKS = [
  c("2026-09-21", "A"), c("2026-09-22", "B"), c("2026-09-24", "C"),
  c("2026-09-28", "D"), c("2026-09-29", "A"), c("2026-10-01", "B"), c("2026-10-02", "C"),
  c("2026-10-05", "D"), c("2026-10-06", "A"),
];

async function checkAll(user: ReturnType<typeof userEvent.setup>, workout: WorkoutId) {
  for (const ex of PLAN[workout].exercises) {
    await user.click(screen.getByRole("button", { name: `Marcar ${ex.name}` }));
  }
}

describe("Hoje", () => {
  it("empty storage shows Treino A", () => {
    setToday(MON);
    render(<App />);
    expect(screen.getByRole("heading", { name: "Treino A" })).toBeInTheDocument();
  });

  it("renders letter, focus and every exercise in order", () => {
    setToday(MON);
    render(<App />);
    expect(screen.getByRole("heading", { name: "Treino A" })).toBeInTheDocument();
    expect(screen.getByText("Perna · quadríceps")).toBeInTheDocument();
    const items = within(screen.getByRole("list", { name: "Exercícios" })).getAllByRole("listitem");
    expect(items.map((li) => [within(li).getByTestId("ex-name").textContent, within(li).getByTestId("ex-sets").textContent])).toEqual([
      ["Extensão", "4×10"],
      ["Agachamento", "4×12"],
      ["Leg press 45°", "4×12"],
      ["Afundo", "3×10"],
      ["Adução", "3×15"],
      ["Gêmeos", "3×15"],
    ]);
  });

  it("tap toggles and updates checked/total", async () => {
    setToday(MON);
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText("0/6")).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: "Marcar Extensão" });
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1/6")).toBeInTheDocument();
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("0/6")).toBeInTheDocument();
  });

  it("reload on same date restores checks", async () => {
    setToday(MON);
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByRole("button", { name: "Marcar Extensão" }));
    await user.click(screen.getByRole("button", { name: "Marcar Afundo" }));
    first.unmount();

    render(<App />);
    expect(screen.getByText("2/6")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Marcar Extensão" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Marcar Afundo" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Marcar Agachamento" })).toHaveAttribute("aria-pressed", "false");
  });

  it("last check records completion and celebrates", async () => {
    setToday(MON);
    const user = userEvent.setup();
    render(<App />);
    await checkAll(user, "A");
    expect(stored().completions).toEqual([{ date: MON, workout: "A" }]);
    expect(screen.getByText("Treino concluído!")).toBeInTheDocument();
  });

  it("completed today shows next workout", async () => {
    setToday(MON);
    seed({ completions: [c(MON, "A")] }, MON);
    const seeded = render(<App />);
    expect(screen.getByText(/Próximo: Treino B/)).toBeInTheDocument();
    seeded.unmount();
    localStorage.clear();

    // Plan independent test: tick every exercise of A, reload.
    const user = userEvent.setup();
    const first = render(<App />);
    await checkAll(user, "A");
    first.unmount();
    render(<App />);
    expect(screen.getByText(/Próximo: Treino B/)).toBeInTheDocument();
    expect(screen.queryByText("Treino concluído!")).not.toBeInTheDocument();
  });

  it("resuming on a later date rolls the session over", async () => {
    setToday(MON);
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Marcar Extensão" }));
    vi.setSystemTime(new Date(2026, 9, 6, 9, 0));
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getByRole("heading", { name: "Treino A" })).toBeInTheDocument();
    expect(screen.getByText("0/6")).toBeInTheDocument();
    expect(stored().today).toEqual({ date: "2026-10-06", workout: null, checked: [] });
    expect(stored().completions).toEqual([]);
  });

  it("rest day shows descanso and train anyway", async () => {
    setToday(WED);
    seed({ completions: [c("2026-10-06", "B")] }, WED);
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText("Hoje é descanso")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Treino C" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Treinar mesmo assim" }));
    expect(screen.getByRole("heading", { name: "Treino C" })).toBeInTheDocument();
  });

  it("selector overrides rotation", async () => {
    setToday(MON);
    const user = userEvent.setup();
    render(<App />);
    await user.click(within(screen.getByRole("group", { name: "Escolher treino" })).getByRole("button", { name: "Treino C" }));
    expect(screen.getByRole("heading", { name: "Treino C" })).toBeInTheDocument();
    const items = within(screen.getByRole("list", { name: "Exercícios" })).getAllByRole("listitem");
    expect(within(items[0]).getByTestId("ex-name")).toHaveTextContent("Flexora cadeira");
  });

  it("reduced motion celebration has no animation", async () => {
    setToday(MON);
    const user = userEvent.setup();
    vi.spyOn(window, "matchMedia").mockImplementation(
      (q: string) => ({ matches: q.includes("prefers-reduced-motion: reduce"), media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
    );
    render(<App />);
    await checkAll(user, "A");
    expect(screen.getByText("Treino concluído!")).toBeInTheDocument();
    expect(document.querySelectorAll(".fall")).toHaveLength(0);

    cleanup();
    localStorage.clear();
    vi.mocked(window.matchMedia).mockImplementation(
      (q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
    );
    render(<App />);
    await checkAll(user, "A");
    expect(screen.getByText("Treino concluído!")).toBeInTheDocument();
    expect(document.querySelectorAll(".fall").length).toBeGreaterThan(0);
  });
});

describe("Progresso", () => {
  it("progress shows streak and week count", () => {
    setToday(THU);
    seed({ completions: THREE_WEEKS }, THU);
    render(<App />);
    const card = screen.getByRole("region", { name: "Sequência" });
    expect(within(card).getByTestId("streak-number")).toHaveTextContent("2");
    expect(within(card).getByText("Esta semana: 2/4")).toBeInTheDocument();
  });

  it("week strip marks letters, today and future", () => {
    setToday(THU);
    seed({ completions: [c("2026-10-05", "A"), c("2026-10-06", "B")] }, THU);
    render(<App />);
    const days = within(screen.getByRole("list", { name: "Semana" })).getAllByRole("listitem");
    expect(days.map((d) => within(d).getByTestId("day-label").textContent)).toEqual(["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]);
    expect(within(days[0]).getByTestId("day-dot")).toHaveTextContent("A");
    expect(within(days[1]).getByTestId("day-dot")).toHaveTextContent("B");
    expect(within(days[2]).getByTestId("day-dot")).toHaveTextContent("");
    expect(days.map((d) => d.getAttribute("aria-current"))).toEqual([null, null, null, "date", null, null, null]);
    expect(days.map((d) => d.dataset.future === "true")).toEqual([false, false, false, false, true, true, true]);
  });

  it("no completions shows comece hoje", () => {
    setToday(MON);
    render(<App />);
    const card = screen.getByRole("region", { name: "Sequência" });
    expect(within(card).getByTestId("streak-number")).toHaveTextContent("0");
    expect(within(card).getByText("Comece hoje 💪")).toBeInTheDocument();
  });
});

describe("Carga", () => {
  it("weight persists across reload", async () => {
    setToday(MON);
    const user = userEvent.setup();
    const first = render(<App />);
    await user.type(screen.getByLabelText("Carga de Leg press 45° em kg"), "40");
    await user.tab();
    first.unmount();
    render(<App />);
    expect(screen.getByLabelText("Carga de Leg press 45° em kg")).toHaveValue("40");
    expect(stored().weights["leg-press-45"]).toBe(40);
  });

  it("shared exercise shares weight", async () => {
    setToday(MON);
    const user = userEvent.setup();
    render(<App />);
    const picker = within(screen.getByRole("group", { name: "Escolher treino" }));
    await user.click(picker.getByRole("button", { name: "Treino B" }));
    await user.type(screen.getByLabelText("Carga de Abdominal reto em kg"), "12");
    await user.tab();
    await user.click(picker.getByRole("button", { name: "Treino D" }));
    expect(screen.getByRole("heading", { name: "Treino D" })).toBeInTheDocument();
    expect(screen.getByLabelText("Carga de Abdominal reto em kg")).toHaveValue("12");
  });

  it("weight can be empty", async () => {
    setToday(MON);
    const user = userEvent.setup();
    render(<App />);
    const field = screen.getByLabelText("Carga de Extensão em kg");
    expect(field).toHaveValue("");
    await user.type(field, "30");
    await user.tab();
    expect(stored().weights.extensao).toBe(30);
    await user.clear(field);
    await user.tab();
    expect(field).toHaveValue("");
    expect(stored().weights).not.toHaveProperty("extensao");
  });
});

describe("Descanso", () => {
  const timer = () => within(screen.getByRole("group", { name: "Descanso" }));

  it("timer counts down from chosen rest", async () => {
    setToday(MON, true);
    const user = userEvent.setup();
    render(<App />);
    await user.click(timer().getByRole("button", { name: "Descanso · 1:30" }));
    expect(timer().getByRole("button", { name: /^1:30/ })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(timer().getByRole("button", { name: /^1:29/ })).toBeInTheDocument();
    await user.click(timer().getByRole("button", { name: /parar/ }));

    await user.click(timer().getByRole("button", { name: "60s" }));
    expect(timer().getByRole("button", { name: "Descanso · 1:00" })).toBeInTheDocument();
    await user.click(timer().getByRole("button", { name: "Descanso · 1:00" }));
    expect(timer().getByRole("button", { name: /^1:00/ })).toBeInTheDocument();
    expect(stored().restSeconds).toBe(60);
  });

  it("timer finishes and vibrates", async () => {
    setToday(MON, true);
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
    const user = userEvent.setup();
    render(<App />);
    await user.click(timer().getByRole("button", { name: "Descanso · 1:30" }));
    act(() => vi.advanceTimersByTime(90_000));
    expect(timer().getByRole("button", { name: "Bora! Próxima série" })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(5_000));
    expect(vibrate).toHaveBeenCalledTimes(1);
  });

  it("timer recomputes from end timestamp on foreground", async () => {
    setToday(MON, true);
    const user = userEvent.setup();
    render(<App />);
    await user.click(timer().getByRole("button", { name: "Descanso · 1:30" }));
    // The phone was locked: the clock moves, no interval fired.
    vi.setSystemTime(Date.now() + 50_000);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(timer().getByRole("button", { name: /^0:40/ })).toBeInTheDocument();
  });

  it("tapping running timer cancels", async () => {
    setToday(MON, true);
    const user = userEvent.setup();
    render(<App />);
    await user.click(timer().getByRole("button", { name: "Descanso · 1:30" }));
    act(() => vi.advanceTimersByTime(3000));
    await user.click(timer().getByRole("button", { name: /parar/ }));
    expect(timer().getByRole("button", { name: "Descanso · 1:30" })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(100_000));
    expect(timer().getByRole("button", { name: "Descanso · 1:30" })).toBeInTheDocument();
  });
});

describe("Backup", () => {
  it("export downloads the record", async () => {
    setToday(MON);
    seed({ completions: [c("2026-10-02", "D")], weights: { "leg-press-45": 40 } }, MON);
    const createObjectURL = vi.fn((_: Blob) => "blob:backup");
    Object.defineProperty(URL, "createObjectURL", { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, "revokeObjectURL", { value: vi.fn(), configurable: true });
    let downloadName = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloadName = this.download;
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Marcar Extensão" }));
    await user.click(screen.getByRole("button", { name: /Exportar/ }));

    expect(downloadName).toBe(`treino-backup-${MON}.json`);
    const blob = createObjectURL.mock.calls[0][0];
    expect(JSON.parse(await blob.text())).toEqual(stored());
    expect(stored().today.checked).toEqual(["extensao"]);
  });

  it("import replaces after confirm", async () => {
    setToday(THU);
    const backup: TreinoRecord = {
      version: 1,
      completions: THREE_WEEKS,
      today: { date: "2026-10-06", workout: null, checked: [] },
      weights: { "leg-press-45": 55 },
      restSeconds: 60,
    };
    const file = () => new File([JSON.stringify(backup)], "treino-backup-2026-10-06.json", { type: "application/json" });
    const user = userEvent.setup();

    // Declined: nothing changes.
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const first = render(<App />);
    const before = localStorage.getItem(STORAGE_KEY);
    await user.upload(screen.getByLabelText("Importar backup"), file());
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
    expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
    expect(screen.getByText("Esta semana: 0/4")).toBeInTheDocument();
    first.unmount();

    // Confirmed: replaced and re-rendered.
    confirm.mockReturnValue(true);
    render(<App />);
    await user.upload(screen.getByLabelText("Importar backup"), file());
    expect(await screen.findByText("Esta semana: 2/4")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Sequência" })).getByTestId("streak-number")).toHaveTextContent("2");
    expect(stored().completions).toEqual(THREE_WEEKS);
    expect(stored().weights).toEqual({ "leg-press-45": 55 });
  });

  it("invalid import is rejected", async () => {
    setToday(MON);
    const bad = ["not json at all", JSON.stringify({ completions: [], weights: {} }), JSON.stringify({ version: 2, completions: [], weights: {}, today: { date: MON, workout: null, checked: [] }, restSeconds: 90 })];
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    for (const text of bad) {
      seed({ completions: [c("2026-10-02", "D")] }, MON);
      const before = localStorage.getItem(STORAGE_KEY);
      render(<App />);
      await user.upload(screen.getByLabelText("Importar backup"), new File([text], "x.json", { type: "application/json" }));
      expect(await screen.findByText("Arquivo inválido")).toBeInTheDocument();
      expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
      cleanup();
      localStorage.clear();
    }
    expect(confirm).not.toHaveBeenCalled();
  });

  it("storage failure keeps working in memory", async () => {
    const warning = "Seus dados não estão sendo salvos neste navegador";
    setToday(MON);
    const user = userEvent.setup();

    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    render(<App />);
    expect(screen.getByText(warning)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Marcar Extensão" }));
    expect(screen.getByText("1/6")).toBeInTheDocument();
    cleanup();
    setItem.mockRestore();

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    render(<App />);
    expect(screen.getByText(warning)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Marcar Extensão" }));
    expect(screen.getByText("1/6")).toBeInTheDocument();
  });
});

describe("como faz", () => {
  const pick = (user: ReturnType<typeof userEvent.setup>, id: WorkoutId) =>
    user.click(within(screen.getByRole("group", { name: "Escolher treino" })).getByRole("button", { name: `Treino ${id}` }));
  const nameButton = (name: string) => screen.getByRole("button", { name: new RegExp(`^${name} `) });
  const regions = () => screen.queryAllByRole("region", { name: /^Como faz / });
  const row = (name: string) => screen.getByRole("button", { name: `Marcar ${name}` }).closest("li")!;

  async function openTreinoC() {
    setToday(MON);
    const user = userEvent.setup();
    render(<App />);
    await pick(user, "C");
    return user;
  }

  it("como faz: all closed on first view", async () => {
    await openTreinoC();
    expect(regions()).toEqual([]);
    for (const ex of PLAN.C.exercises) {
      const li = row(ex.name);
      const sets = within(li).getByTestId("ex-sets");
      const peek = within(li).getByText("como faz");
      const line = sets.parentElement!;
      expect(line).toHaveClass("sets");
      expect(line.contains(peek)).toBe(true);
      expect(sets.compareDocumentPosition(peek) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(line.textContent).toMatch(new RegExp(`^${ex.sets}\\s*como faz$`));
    }
  });

  it("como faz: opens inside the row", async () => {
    const user = await openTreinoC();
    await user.click(nameButton("Hack"));
    const li = row("Hack");
    const region = within(li).getByRole("region", { name: "Como faz Hack" });
    const weight = within(li).getByRole("textbox", { name: "Carga de Hack em kg" });
    expect(weight.compareDocumentPosition(region) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(weight.closest("label")!.contains(region)).toBe(false);

    const parts = [...region.children];
    expect(parts.map((p) => p.tagName)).toEqual(["FIGURE", "P"]);
    const [figure, cue] = parts;
    expect(within(figure as HTMLElement).getByRole("img", { name: "Desenho do exercício Hack" })).toBeInTheDocument();
    expect(figure.querySelector("figcaption")!.textContent).toMatch(/^começo\s*fim$/);
    expect(cue).toHaveTextContent(GUIDES.hack.cue);
    expect(within(nameButton("Hack")).getByText("fechar")).toBeInTheDocument();
    expect(within(nameButton("Hack")).queryByText("como faz")).not.toBeInTheDocument();
  });

  it("como faz: one open at a time", async () => {
    const user = await openTreinoC();
    await user.click(nameButton("Hack"));
    await user.click(nameButton("Sumô"));
    expect(regions().map((r) => r.getAttribute("aria-label"))).toEqual(["Como faz Sumô"]);
    expect(within(nameButton("Hack")).getByText("como faz")).toBeInTheDocument();
  });

  it("como faz: tap again closes", async () => {
    const user = await openTreinoC();
    await user.click(nameButton("Hack"));
    await user.click(nameButton("Hack"));
    expect(regions()).toEqual([]);
    expect(within(nameButton("Hack")).getByText("como faz")).toBeInTheDocument();
  });

  it("como faz: checking keeps it open", async () => {
    const user = await openTreinoC();
    await user.click(nameButton("Hack"));
    await user.click(screen.getByRole("button", { name: "Marcar Hack" }));
    expect(screen.getByRole("button", { name: "Marcar Hack" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1/6")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Como faz Hack" })).toBeInTheDocument();
  });

  it("como faz: opening writes nothing", async () => {
    const user = await openTreinoC();
    const before = localStorage.getItem(STORAGE_KEY);
    await user.click(nameButton("Hack"));
    await user.click(nameButton("Hack"));
    expect(screen.getByRole("button", { name: "Marcar Hack" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("0/6")).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
  });

  it("como faz: switching workout closes", async () => {
    const user = await openTreinoC();
    await user.click(nameButton("Hack"));
    await pick(user, "A");
    expect(regions()).toEqual([]);
    await pick(user, "C");
    expect(regions()).toEqual([]);
  });

  it("como faz: reload closes", async () => {
    const user = await openTreinoC();
    await user.click(nameButton("Hack"));
    cleanup();
    render(<App />);
    await pick(user, "C");
    expect(regions()).toEqual([]);
  });

  it("como faz: new day closes", async () => {
    // Thursday, after A and B: the rotation shows Treino C on Thursday and again on Friday.
    setToday(THU);
    seed({ completions: [c(MON, "A"), c("2026-10-06", "B")] }, THU);
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("heading", { name: "Treino C" })).toBeInTheDocument();
    await user.click(nameButton("Hack"));
    expect(regions()).toHaveLength(1);
    vi.setSystemTime(new Date(2026, 9, 9, 9, 0));
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getByRole("heading", { name: "Treino C" })).toBeInTheDocument();
    expect(regions()).toEqual([]);
  });

  it("como faz: no guide, no toggle", async () => {
    const saved = GUIDES.extensao;
    delete GUIDES.extensao;
    try {
      setToday(MON);
      render(<App />);
      const li = row("Extensão");
      expect(within(li).queryByText(/como faz/)).not.toBeInTheDocument();
      const named = screen.getAllByRole("button").filter((b) => b.textContent?.includes("Extensão") || b.getAttribute("aria-label")?.includes("Extensão"));
      expect(named.map((b) => b.getAttribute("aria-label") ?? b.textContent)).toEqual(["Marcar Extensão"]);
      expect(within(li).getByTestId("ex-name")).toHaveTextContent(/^Extensão$/);
      expect(within(li).getByTestId("ex-sets")).toHaveTextContent(/^4×10$/);
    } finally {
      if (saved) GUIDES.extensao = saved;
    }
  });

  it("como faz: name button reports expanded", async () => {
    const saved = GUIDES["abdominal-reto"];
    GUIDES["abdominal-reto"] ??= GUIDES.hack;
    try {
      const user = await openTreinoC();
      const hack = nameButton("Hack");
      expect(hack.tagName).toBe("BUTTON");
      expect(hack).toHaveAttribute("aria-expanded", "false");
      await user.click(hack);
      expect(nameButton("Hack")).toHaveAttribute("aria-expanded", "true");
      expect(nameButton("Hack").getAttribute("aria-controls")).toBe(screen.getByRole("region", { name: "Como faz Hack" }).id);

      const ids: string[] = [];
      for (const w of ["B", "D"] as const) {
        await pick(user, w);
        await user.click(nameButton("Abdominal reto"));
        const region = screen.getByRole("region", { name: "Como faz Abdominal reto" });
        expect(nameButton("Abdominal reto").getAttribute("aria-controls")).toBe(region.id);
        expect(document.querySelectorAll(`[id="${region.id}"]`)).toHaveLength(1);
        ids.push(region.id);
      }
      expect(new Set(ids).size).toBe(2);
    } finally {
      if (saved) GUIDES["abdominal-reto"] = saved;
      else delete GUIDES["abdominal-reto"];
    }
  });

  it("como faz: chevron and legend swatches", async () => {
    const user = await openTreinoC();
    const peekChevron = () => {
      const peek = within(nameButton("Hack")).getByText(/^(como faz|fechar)$/);
      const svg = peek.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    };
    peekChevron();
    await user.click(nameButton("Hack"));
    peekChevron();
    const caption = screen.getByRole("region", { name: "Como faz Hack" }).querySelector("figcaption")!;
    const swatch = (label: string) => within(caption as HTMLElement).getByText(label).querySelector("i");
    expect(swatch("começo")).toHaveClass("k-ghost");
    expect(swatch("fim")).not.toBeNull();
    expect(swatch("fim")).not.toHaveClass("k-ghost");
  });

  it("como faz: shared exercise, one guide", async () => {
    expect(Object.keys(GUIDES).filter((k) => k === "abdominal-reto")).toHaveLength(1);
    expect(Object.keys(GUIDES).filter((k) => k === "abdominal-inferior")).toHaveLength(1);
    setToday(MON);
    const user = userEvent.setup();
    render(<App />);
    const seen: { cue: string; svg: string }[] = [];
    for (const w of ["B", "D"] as const) {
      await pick(user, w);
      await user.click(nameButton("Abdominal reto"));
      const region = screen.getByRole("region", { name: "Como faz Abdominal reto" });
      seen.push({ cue: region.querySelector("p")!.textContent!, svg: within(region).getByRole("img").outerHTML });
    }
    expect(seen[0].cue).toBe(GUIDES["abdominal-reto"].cue);
    expect(seen[1]).toEqual(seen[0]);
  });
});

describe("Medidas no registro", () => {
  it("opening the app writes no measurement fields", async () => {
    setToday(MON);
    seed({ completions: [c("2026-10-02", "D")] }, MON);
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Marcar Extensão" }));
    expect(stored().today.checked).toEqual(["extensao"]);
    expect(stored()).not.toHaveProperty("measurements");
    expect(stored()).not.toHaveProperty("reminder");
  });

  it("backup round-trips measurements and reminder", async () => {
    setToday(THU);
    const measurements = [
      { date: "2026-10-01", values: { peso: 63 } },
      { date: "2026-10-05", values: { peso: 62.9, cintura: 70, "braco-d": 27.5 } },
    ];
    const reminder = { everyDays: 14 as const, snoozedOn: "2026-10-06" };
    seed({ completions: [c("2026-10-02", "D")], measurements, reminder }, THU);
    const createObjectURL = vi.fn((_: Blob) => "blob:backup");
    Object.defineProperty(URL, "createObjectURL", { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, "revokeObjectURL", { value: vi.fn(), configurable: true });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByRole("button", { name: /Exportar/ }));
    const text = await createObjectURL.mock.calls[0][0].text();
    expect(JSON.parse(text).measurements).toEqual(measurements);
    expect(JSON.parse(text).reminder).toEqual(reminder);
    first.unmount();

    localStorage.clear();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<App />);
    await user.upload(screen.getByLabelText("Importar backup"), new File([text], "treino-backup-2026-10-08.json", { type: "application/json" }));
    expect(await screen.findByText("Backup importado")).toBeInTheDocument();
    expect(stored().measurements).toEqual(measurements);
    expect(stored().reminder).toEqual(reminder);
  });

  it("older backup without measurements imports", async () => {
    setToday(THU);
    seed({ measurements: [{ date: "2026-10-05", values: { peso: 62 } }] }, THU);
    const backup = {
      version: 1,
      completions: THREE_WEEKS,
      today: { date: "2026-10-06", workout: null, checked: [] },
      weights: { "leg-press-45": 55 },
      restSeconds: 60,
    };
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<App />);
    await user.upload(screen.getByLabelText("Importar backup"), new File([JSON.stringify(backup)], "treino-backup-2026-10-06.json", { type: "application/json" }));
    expect(await screen.findByText("Backup importado")).toBeInTheDocument();
    expect(stored().completions).toEqual(THREE_WEEKS);
    expect(measurementsOf(stored())).toEqual([]);
    expect(reminderOf(stored())).toEqual({ everyDays: 7, snoozedOn: null });
  });
});
