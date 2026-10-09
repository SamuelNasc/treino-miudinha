import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
      restSeconds: 60 as const,
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
      restSeconds: 60 as const,
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

describe("Menu", () => {
  const menu = () => within(screen.getByRole("navigation", { name: "Menu" }));
  const go = (user: ReturnType<typeof userEvent.setup>, name: "Hoje" | "Medidas") => user.click(menu().getByRole("button", { name }));

  it("menu has Hoje then Medidas", () => {
    setToday(MON);
    render(<App />);
    expect(menu().getAllByRole("button").map((b) => b.textContent)).toEqual(["Hoje", "Medidas"]);
  });

  it("app always opens on Hoje", async () => {
    setToday(MON);
    const user = userEvent.setup();
    render(<App />);
    expect(menu().getByRole("button", { name: "Hoje" })).toHaveAttribute("aria-current", "page");
    expect(menu().getByRole("button", { name: "Medidas" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("heading", { name: "Treino A" })).toBeVisible();

    await go(user, "Medidas");
    cleanup();
    render(<App />);
    expect(menu().getByRole("button", { name: "Hoje" })).toHaveAttribute("aria-current", "page");
    expect(menu().getByRole("button", { name: "Medidas" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("heading", { name: "Treino A" })).toBeVisible();
  });

  it("Medidas hides Hoje", async () => {
    const cases: [string, string, Partial<TreinoRecord>][] = [
      [MON, "Treino A", {}],
      [WED, "Hoje é descanso", {}],
      [MON, "Feito por hoje!", { completions: [c(MON, "A")] }],
    ];
    for (const [date, card, record] of cases) {
      setToday(date);
      seed(record, date);
      const user = userEvent.setup();
      render(<App />);
      expect(screen.getByRole("heading", { name: card })).toBeVisible();
      await go(user, "Medidas");

      const hidden = { hidden: true };
      expect(screen.getByRole("region", { name: "Sequência", ...hidden })).not.toBeVisible();
      expect(screen.getByRole("list", { name: "Semana", ...hidden })).not.toBeVisible();
      expect(screen.getByRole("group", { name: "Escolher treino", ...hidden })).not.toBeVisible();
      expect(screen.getByRole("heading", { name: card, ...hidden })).not.toBeVisible();
      expect(screen.getByRole("button", { name: "Exportar backup", ...hidden })).not.toBeVisible();
      expect(screen.getByRole("region", { name: "Medidas" })).toBeVisible();
      expect(menu().getByRole("button", { name: "Medidas" })).toHaveAttribute("aria-current", "page");
      expect(menu().getByRole("button", { name: "Hoje" })).not.toHaveAttribute("aria-current");
      cleanup();
      localStorage.clear();
      vi.useRealTimers();
    }
  });

  it("coming back shows the same workout", async () => {
    setToday(MON);
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Treino C" }));
    await user.click(screen.getByRole("button", { name: "Marcar Flexora cadeira" }));
    await user.click(screen.getByRole("button", { name: "Marcar Flexora mesa" }));
    await user.click(screen.getByRole("button", { name: /^Hack / }));
    expect(screen.getByRole("region", { name: "Como faz Hack" })).toBeVisible();

    await go(user, "Medidas");
    await go(user, "Hoje");
    expect(screen.getByRole("heading", { name: "Treino C" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Marcar Flexora cadeira" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Marcar Flexora mesa" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("region", { name: "Como faz Hack" })).toBeVisible();
  });

  it("rest timer keeps running across destinations", async () => {
    setToday(MON, true);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);
    const timer = () => within(screen.getByRole("group", { name: "Descanso" }));
    await user.click(timer().getByRole("button", { name: "Descanso · 1:30" }));
    act(() => vi.advanceTimersByTime(10_000));

    await go(user, "Medidas");
    expect(timer().getByRole("button", { name: "1:20 · parar" })).toBeVisible();
    act(() => vi.advanceTimersByTime(5_000));
    expect(timer().getByRole("button", { name: "1:15 · parar" })).toBeVisible();

    await go(user, "Hoje");
    expect(timer().getByRole("button", { name: "1:15 · parar" })).toBeVisible();
  });

  it("header and warning show on Medidas", async () => {
    setToday(MON);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const user = userEvent.setup();
    render(<App />);
    await go(user, "Medidas");
    expect(screen.getByRole("heading", { name: "Treino Miudinha" })).toBeVisible();
    expect(screen.getByText(/segunda-feira/)).toBeVisible();
    expect(screen.getByText("Seus dados não estão sendo salvos neste navegador")).toBeVisible();
  });

  it("switching scrolls to the top", async () => {
    setToday(MON);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<App />);
    scrollTo.mockClear();

    await go(user, "Hoje");
    expect(scrollTo).not.toHaveBeenCalled();
    await go(user, "Medidas");
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
    await go(user, "Medidas");
    expect(scrollTo).toHaveBeenCalledTimes(1);
    await go(user, "Hoje");
    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
  });

  it("switching changes no URL and stores nothing", async () => {
    setToday(MON);
    seed({ completions: THREE_WEEKS.slice(0, 3), weights: { extensao: 30 } }, MON);
    const user = userEvent.setup();
    render(<App />);
    const before = localStorage.getItem(STORAGE_KEY);
    const href = location.href;
    const length = history.length;

    await go(user, "Medidas");
    await go(user, "Hoje");
    await go(user, "Medidas");
    expect(location.href).toBe(href);
    expect(history.length).toBe(length);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
  });
});

describe("Registrar medição", () => {
  type User = ReturnType<typeof userEvent.setup>;
  const FIELDS = [
    "Peso em kg", "Busto em cm", "Cintura em cm", "Abdômen em cm", "Quadril em cm",
    "Braço D em cm", "Braço E em cm", "Coxa D em cm", "Coxa E em cm", "Panturrilha D em cm", "Panturrilha E em cm",
  ];
  const ROWS = ["Peso", "Busto", "Cintura", "Abdômen", "Quadril", "Braço", "Coxa", "Panturrilha"];
  const medidas = () => within(screen.getByRole("region", { name: "Medidas" }));
  const row = (name: string) => within(screen.getByRole("group", { name }));
  const field = (name: string) => screen.getByRole("textbox", { name }) as HTMLInputElement;
  const dateField = () => screen.getByLabelText("Data") as HTMLInputElement;
  const save = () => screen.getByRole("button", { name: "Salvar medição" });
  const setDate = (value: string) => fireEvent.change(dateField(), { target: { value } });
  const goTo = (user: User, name: "Hoje" | "Medidas") =>
    user.click(within(screen.getByRole("navigation", { name: "Menu" })).getByRole("button", { name }));

  async function openForm(user: User) {
    await goTo(user, "Medidas");
    await user.click(medidas().getByRole("button", { name: "Abrir" }));
  }

  function start(measurements: TreinoRecord["measurements"] = undefined) {
    setToday(THU);
    if (measurements) seed({ measurements }, THU);
    const user = userEvent.setup();
    render(<App />);
    return user;
  }

  it("Nova medição starts closed", async () => {
    const user = start();
    await goTo(user, "Medidas");
    expect(medidas().getByRole("heading", { name: "Nova medição" })).toBeInTheDocument();
    expect(medidas().getByRole("button", { name: "Abrir" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("textbox", { name: "Peso em kg" })).toBeNull();
    expect(screen.queryByText("Em breve você registra suas medidas aqui.")).toBeNull();
  });

  it("Abrir and Fechar toggle the form", async () => {
    const user = start();
    await openForm(user);
    expect(field("Peso em kg")).toBeVisible();
    const fechar = medidas().getByRole("button", { name: "Fechar" });
    expect(fechar).toHaveAttribute("aria-expanded", "true");
    await user.click(fechar);
    expect(screen.queryByRole("textbox", { name: "Peso em kg" })).toBeNull();
    expect(medidas().getByRole("button", { name: "Abrir" })).toHaveAttribute("aria-expanded", "false");
  });

  it("form opens on today", async () => {
    const user = start();
    await openForm(user);
    expect(dateField().value).toBe("2026-10-08");
    expect(dateField().max).toBe("2026-10-08");
  });

  it("fields in order with units", async () => {
    const user = start();
    await openForm(user);
    const boxes = medidas().getAllByRole("textbox");
    expect(boxes.map((b) => b.getAttribute("aria-label"))).toEqual(FIELDS);
    const before = (a: Node, b: Node) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    const tronco = medidas().getByText("Tronco");
    const limbs = medidas().getByText("Braços e pernas");
    expect(before(field("Peso em kg"), tronco) && before(tronco, field("Busto em cm"))).toBe(true);
    expect(before(field("Quadril em cm"), limbs) && before(limbs, field("Braço D em cm"))).toBe(true);
    for (const name of ROWS) {
      const inRow = row(name).getAllByRole("textbox");
      const unit = name === "Peso" ? "kg" : "cm";
      expect(row(name).getAllByText(unit), name).toHaveLength(inRow.length);
      expect(row(name).queryAllByText(unit === "kg" ? "cm" : "kg"), name).toHaveLength(0);
    }
    for (const name of ["Braço", "Coxa", "Panturrilha"]) {
      const [d, e] = row(name).getAllByRole("textbox");
      expect(row(name).getAllByRole("textbox")).toHaveLength(2);
      expect(d).toHaveAccessibleName(`${name} D em cm`);
      expect(e).toHaveAccessibleName(`${name} E em cm`);
      expect(d.closest("label")).toHaveTextContent(/^D/);
      expect(e.closest("label")).toHaveTextContent(/^E/);
    }
  });

  it("placeholders show the previous value", async () => {
    const user = start([
      { date: "2026-09-24", values: { peso: 63.1, cintura: 72.4, quadril: 101.5 } },
      { date: "2026-10-01", values: { peso: 62.9 } },
    ]);
    await openForm(user);
    const expected: Record<string, string> = { "Peso em kg": "62,9", "Cintura em cm": "72,4", "Quadril em cm": "101,5" };
    for (const name of FIELDS) {
      expect(field(name).value, name).toBe("");
      expect(field(name), name).toHaveAttribute("placeholder", expected[name] ?? "–");
    }
    setDate("2026-09-30");
    expect(field("Peso em kg")).toHaveAttribute("placeholder", "63,1");
  });

  it("a day with a measurement loads its values", async () => {
    const user = start([
      { date: "2026-10-01", values: { cintura: 72 } },
      { date: "2026-10-08", values: { peso: 62.4, quadril: 101.5 } },
    ]);
    await openForm(user);
    expect(field("Peso em kg").value).toBe("62,4");
    expect(field("Quadril em cm").value).toBe("101,5");
    expect(field("Cintura em cm").value).toBe("");
    expect(field("Cintura em cm")).toHaveAttribute("placeholder", "72");
    const hint = "Já tem medição nesse dia. O que você preencher atualiza ela.";
    expect(medidas().getByText(hint)).toBeVisible();
    setDate("2026-10-02");
    expect(medidas().queryByText(hint)).toBeNull();
  });

  it("changing the date reloads the fields", async () => {
    const user = start([{ date: "2026-10-01", values: { peso: 62.9 } }]);
    await openForm(user);
    await user.type(field("Cintura em cm"), "70");
    setDate("2026-10-01");
    expect(field("Cintura em cm").value).toBe("");
    expect(field("Peso em kg").value).toBe("62,9");
  });

  it("an empty or future date resets to today", async () => {
    const user = start();
    await openForm(user);
    for (const value of ["", "2026-10-09"]) {
      setDate(value);
      expect(dateField().value, `"${value}"`).toBe("2026-10-08");
    }
  });

  it("save is disabled while every field is empty", async () => {
    const user = start();
    await openForm(user);
    expect(save()).toBeDisabled();
    await user.type(field("Peso em kg"), "62");
    expect(save()).toBeEnabled();
    await user.clear(field("Peso em kg"));
    expect(save()).toBeDisabled();
  });

  it("comma decimal is stored as a number", async () => {
    const user = start();
    await openForm(user);
    await user.type(field("Peso em kg"), "62,9");
    await user.click(save());
    expect(measurementsOf(stored())[0].values.peso).toBe(62.9);
  });

  it("a bad value is marked on leaving the field", async () => {
    for (const text of ["abc", "680", "6", "62,95"]) {
      const user = start();
      await openForm(user);
      await user.type(field("Peso em kg"), text);
      expect(field("Peso em kg"), text).not.toHaveAttribute("aria-invalid", "true");
      expect(row("Peso").queryByText("Confira este valor"), text).toBeNull();
      await user.tab();
      expect(field("Peso em kg"), text).toHaveAttribute("aria-invalid", "true");
      expect(row("Peso").getAllByText("Confira este valor"), text).toHaveLength(1);
      cleanup();
      localStorage.clear();
    }
  });

  it("one message per D/E row", async () => {
    const user = start();
    await openForm(user);
    await user.type(field("Braço D em cm"), "5");
    await user.type(field("Braço E em cm"), "500");
    await user.tab();
    expect(field("Braço D em cm")).toHaveAttribute("aria-invalid", "true");
    expect(field("Braço E em cm")).toHaveAttribute("aria-invalid", "true");
    expect(row("Braço").getAllByText("Confira este valor")).toHaveLength(1);
  });

  it("save is disabled while a value is bad", async () => {
    const user = start();
    await openForm(user);
    await user.type(field("Peso em kg"), "62");
    await user.tab();
    await user.type(field("Cintura em cm"), "680");
    expect(save()).toBeDisabled();
  });

  it("correcting a value clears its mark", async () => {
    const user = start();
    await openForm(user);
    await user.type(field("Braço D em cm"), "5");
    await user.type(field("Braço E em cm"), "500");
    await user.tab();
    await user.clear(field("Braço D em cm"));
    await user.type(field("Braço D em cm"), "29");
    await user.tab();
    expect(field("Braço D em cm")).not.toHaveAttribute("aria-invalid", "true");
    expect(row("Braço").getAllByText("Confira este valor")).toHaveLength(1);
    await user.clear(field("Braço E em cm"));
    await user.tab();
    expect(field("Braço E em cm")).not.toHaveAttribute("aria-invalid", "true");
    expect(row("Braço").queryByText("Confira este valor")).toBeNull();

    await user.type(field("Peso em kg"), "680");
    await user.tab();
    expect(field("Peso em kg")).toHaveAttribute("aria-invalid", "true");
    await user.clear(field("Peso em kg"));
    await user.type(field("Peso em kg"), "62");
    await user.tab();
    expect(field("Peso em kg")).not.toHaveAttribute("aria-invalid", "true");
    expect(row("Peso").queryByText("Confira este valor")).toBeNull();
  });

  it("saving a new day stores it and closes the form", async () => {
    const user = start();
    await openForm(user);
    await user.type(field("Peso em kg"), "62,9");
    await user.type(field("Cintura em cm"), "72");
    await user.click(save());
    expect(stored().measurements).toEqual([{ date: "2026-10-08", values: { peso: 62.9, cintura: 72 } }]);
    expect(screen.getByRole("status")).toHaveTextContent("Medição salva");
    expect(medidas().getByRole("button", { name: "Abrir" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Peso em kg" })).toBeNull();
  });

  it("weight only is saved", async () => {
    const user = start();
    await openForm(user);
    await user.type(field("Peso em kg"), "62,4");
    await user.click(save());
    expect(measurementsOf(stored())[0].values).toEqual({ peso: 62.4 });
  });

  it("saving onto a day with a measurement merges", async () => {
    const user = start([
      { date: "2026-10-01", values: { peso: 63 } },
      { date: "2026-10-08", values: { peso: 62.4, cintura: 72, quadril: 101.5 } },
    ]);
    await openForm(user);
    await user.clear(field("Peso em kg"));
    await user.type(field("Peso em kg"), "62");
    await user.clear(field("Cintura em cm"));
    await user.type(field("Busto em cm"), "91");
    await user.click(save());
    expect(stored().measurements).toEqual([
      { date: "2026-10-01", values: { peso: 63 } },
      { date: "2026-10-08", values: { peso: 62, cintura: 72, quadril: 101.5, busto: 91 } },
    ]);
  });

  it("reopening after a save starts on today", async () => {
    const user = start();
    await openForm(user);
    setDate("2026-10-01");
    await user.type(field("Peso em kg"), "61");
    await user.click(save());
    await user.click(medidas().getByRole("button", { name: "Abrir" }));
    expect(dateField().value).toBe("2026-10-08");
    expect(field("Peso em kg").value).toBe("");
    expect(field("Peso em kg")).toHaveAttribute("placeholder", "61");

    await user.type(field("Peso em kg"), "60");
    await user.click(save());
    await user.click(medidas().getByRole("button", { name: "Abrir" }));
    expect(field("Peso em kg").value).toBe("60");
  });

  it("onde medir shows the cue", async () => {
    const user = start();
    await openForm(user);
    const buttons = medidas().getAllByRole("button", { name: "onde medir" });
    expect(buttons).toHaveLength(7);
    for (const name of ROWS.slice(1)) {
      const inRow = row(name).getAllByRole("button", { name: "onde medir" });
      expect(inRow, name).toHaveLength(1);
      expect(inRow[0], name).toHaveAttribute("aria-expanded", "false");
    }
    expect(row("Peso").queryByRole("button", { name: "onde medir" })).toBeNull();

    await user.click(row("Cintura").getByRole("button", { name: "onde medir" }));
    expect(row("Cintura").getByText("Na parte mais fina, acima do umbigo. Fita reta, sem apertar.")).toBeVisible();
    expect(row("Cintura").getByRole("button", { name: "fechar" })).toHaveAttribute("aria-expanded", "true");
  });

  it("one cue at a time and typed values stay", async () => {
    const user = start();
    await openForm(user);
    await user.type(field("Peso em kg"), "62");
    await user.type(field("Coxa D em cm"), "56");
    await user.click(row("Cintura").getByRole("button", { name: "onde medir" }));
    await user.click(row("Coxa").getByRole("button", { name: "onde medir" }));
    expect(row("Coxa").getByText("No meio da coxa, em pé. Fita reta, sem apertar.")).toBeVisible();
    expect(row("Cintura").queryByText(/Fita reta/)).toBeNull();
    expect(row("Cintura").getByRole("button", { name: "onde medir" })).toHaveAttribute("aria-expanded", "false");
    expect(medidas().getAllByText(/Fita reta, sem apertar\./)).toHaveLength(1);
    expect(field("Peso em kg").value).toBe("62");
    expect(field("Coxa D em cm").value).toBe("56");
    await user.click(row("Coxa").getByRole("button", { name: "fechar" }));
    expect(medidas().queryByText(/Fita reta/)).toBeNull();
    expect(field("Peso em kg").value).toBe("62");
    expect(field("Coxa D em cm").value).toBe("56");
  });

  it("every cue line", async () => {
    const CUES: Record<string, string> = {
      Busto: "Na parte mais cheia do busto.",
      Cintura: "Na parte mais fina, acima do umbigo.",
      Abdômen: "Na linha do umbigo.",
      Quadril: "Na parte mais larga do bumbum.",
      Braço: "No meio do braço, relaxado.",
      Coxa: "No meio da coxa, em pé.",
      Panturrilha: "Na parte mais grossa da panturrilha.",
    };
    const user = start();
    await openForm(user);
    for (const [name, cue] of Object.entries(CUES)) {
      await user.click(row(name).getByRole("button", { name: "onde medir" }));
      expect(row(name).getByText(`${cue} Fita reta, sem apertar.`), name).toBeVisible();
    }
  });

  it("form survives a page switch", async () => {
    const user = start();
    await openForm(user);
    setDate("2026-10-01");
    await user.type(field("Peso em kg"), "62");
    await goTo(user, "Hoje");
    await goTo(user, "Medidas");
    expect(medidas().getByRole("button", { name: "Fechar" })).toBeInTheDocument();
    expect(dateField().value).toBe("2026-10-01");
    expect(field("Peso em kg").value).toBe("62");
  });

  // MeasureGuide slice: the drawing in the "onde medir" box, as mockup v6's figure() draws it.
  const TAPE: [row: string, name: string, cue: string, ellipse: [cx: number, cy: number, rx: number, ry: number]][] = [
    ["Busto", "busto", "Na parte mais cheia do busto.", [60, 62, 19, 4]],
    ["Cintura", "cintura", "Na parte mais fina, acima do umbigo.", [60, 80, 15, 4]],
    ["Abdômen", "abdômen", "Na linha do umbigo.", [60, 92, 16, 4]],
    ["Quadril", "quadril", "Na parte mais larga do bumbum.", [60, 108, 19, 4]],
    ["Braço", "braço", "No meio do braço, relaxado.", [36, 70, 7, 4]],
    ["Coxa", "coxa", "No meio da coxa, em pé.", [52, 136, 9, 4]],
    ["Panturrilha", "panturrilha", "Na parte mais grossa da panturrilha.", [52.5, 170, 7.5, 4]],
  ];
  const FIGURE = [
    ["path", "body-fill", "M49 40 Q60 45 71 40 L77 50 Q78 60 75 68 Q70 80 71 90 Q75 100 75 112 L72 120 L61 122 L59 122 L48 120 L45 112 Q45 100 49 90 Q50 80 45 68 Q42 60 43 50 Z"],
    ["path", "body-line", "M43 50 Q37 56 36 70 Q35 86 34 104 M77 50 Q83 56 84 70 Q85 86 86 104"],
    ["path", "body-line", "M48 118 Q46 140 49 160 Q50 176 50 192 M57 122 Q58 140 56 160 Q55 176 55 192"],
    ["path", "body-line", "M72 118 Q74 140 71 160 Q70 176 70 192 M63 122 Q62 140 64 160 Q65 176 65 192"],
  ];

  /** Opens the row's guide and returns the box "onde medir" controls. */
  async function openGuide(user: User, name: string) {
    await user.click(row(name).getByRole("button", { name: "onde medir" }));
    const id = row(name).getByRole("button", { name: "fechar" }).getAttribute("aria-controls")!;
    return document.getElementById(id)!;
  }

  it("onde medir shows the drawing", async () => {
    const user = start();
    await openForm(user);
    for (const [name, , cue] of TAPE) {
      const box = await openGuide(user, name);
      expect(screen.getByRole("group", { name }).contains(box), name).toBe(true);
      const imgs = within(box).getAllByRole("img");
      expect(imgs, name).toHaveLength(1);
      const text = within(box).getByText(`${cue} Fita reta, sem apertar.`);
      expect(text, name).toBeVisible();
      expect(imgs[0].compareDocumentPosition(text) & Node.DOCUMENT_POSITION_FOLLOWING, name).toBeTruthy();
    }
  });

  it("drawing is the v6 figure", async () => {
    const user = start();
    await openForm(user);
    for (const [name] of TAPE) {
      const box = await openGuide(user, name);
      const svg = within(box).getByRole("img");
      expect(svg.tagName.toLowerCase(), name).toBe("svg");
      expect(svg.getAttribute("viewBox"), name).toBe("0 0 120 200");
      const kids = [...svg.children];
      expect(kids.map((k) => k.tagName.toLowerCase()), name).toEqual(["path", "path", "path", "path", "circle", "circle", "ellipse"]);
      FIGURE.forEach(([, cls, d], i) => {
        expect(kids[i].getAttribute("class"), `${name} ${i}`).toBe(cls);
        expect(kids[i].getAttribute("d"), `${name} ${i}`).toBe(d);
      });
      const circle = (el: Element) => ["cx", "cy", "r"].map((a) => Number(el.getAttribute(a)));
      expect(circle(kids[4]), `${name} head`).toEqual([60, 24, 12]);
      expect(circle(kids[5]), `${name} bun`).toEqual([60, 9, 6]);
      expect(kids[6].getAttribute("class"), name).toBe("tape");
    }
  });

  it("tape band matches v6", async () => {
    const user = start();
    await openForm(user);
    for (const [name, , , ellipse] of TAPE) {
      const box = await openGuide(user, name);
      const tape = within(box).getByRole("img").querySelector("ellipse.tape")!;
      expect(["cx", "cy", "rx", "ry"].map((a) => Number(tape.getAttribute(a))), name).toEqual(ellipse);
    }
  });

  it("peso has no guide", async () => {
    const user = start();
    await openForm(user);
    const form = within(screen.getByRole("form", { name: "Nova medição" }));
    expect(row("Peso").queryByRole("button", { name: "onde medir" })).toBeNull();
    expect(form.queryAllByRole("img", { name: /^Onde medir/ })).toHaveLength(0);
    for (const [name] of TAPE) {
      await user.click(row(name).getByRole("button", { name: "onde medir" }));
      expect(form.getAllByRole("img", { name: /^Onde medir/ }), name).toHaveLength(1);
      expect(row("Peso").queryByRole("img"), name).toBeNull();
    }
  });

  it("drawing names", async () => {
    const user = start();
    await openForm(user);
    for (const [name, lower, cue] of TAPE) {
      const box = await openGuide(user, name);
      const svg = within(box).getByRole("img");
      expect(svg, name).toHaveAccessibleName(`Onde medir: ${lower}`);
      expect(svg.textContent, name).toBe("");
      const p = within(box).getByText(`${cue} Fita reta, sem apertar.`);
      expect(p.tagName.toLowerCase(), name).toBe("p");
      expect(svg.contains(p), name).toBe(false);
    }
  });

  it("opening guides stores nothing", async () => {
    const user = start([{ date: "2026-10-01", values: { cintura: 72 } }]);
    await openForm(user);
    const before = localStorage.getItem(STORAGE_KEY);
    for (const [name] of TAPE) {
      await user.click(row(name).getByRole("button", { name: "onde medir" }));
      await user.click(row(name).getByRole("button", { name: "fechar" }));
    }
    expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
  });
});

describe("Lembrete", () => {
  type User = ReturnType<typeof userEvent.setup>;
  type Seed = Parameters<typeof seed>[0];
  const tape = (date: string) => ({ date, values: { cintura: 72 } });
  const card = () => screen.queryByRole("region", { name: "Lembrete de medidas" });
  const inCard = () => within(card()!);
  const menuButton = (name: "Hoje" | "Medidas") =>
    within(screen.getByRole("navigation", { name: "Menu" })).getByRole("button", { name });
  const goTo = (user: User, name: "Hoje" | "Medidas") => user.click(menuButton(name));
  const medidas = () => within(screen.getByRole("region", { name: "Medidas" }));
  const field = (name: string) => screen.getByRole("textbox", { name }) as HTMLInputElement;
  const dateField = () => screen.getByLabelText("Data") as HTMLInputElement;
  const intervals = () => within(screen.getByRole("group", { name: "Lembrar a cada" }));
  const INTERVALS = ["7 dias", "14 dias", "30 dias", "Não lembrar"];
  const HINTS = [
    "Sem lembrete. Você mede quando quiser.",
    "Vai aparecer em Hoje até você medir com a fita. Só o peso não conta.",
    "Conta a partir da última medição com fita. Só o peso não conta.",
  ];

  function start(record: Seed = {}, today = THU) {
    setToday(today);
    seed(record, today);
    const user = userEvent.setup();
    render(<App />);
    return user;
  }

  it("first measurement card", () => {
    start();
    expect(card()).toBeInTheDocument();
    expect(inCard().getByText("Hora da primeira medição")).toBeInTheDocument();
    expect(inCard().getByText("Ela vira o seu ponto de partida.")).toBeInTheDocument();
    expect(inCard().getByRole("button", { name: "Medir agora" })).toBeInTheDocument();
    expect(inCard().getByRole("button", { name: "Hoje não" })).toBeInTheDocument();
    const streak = screen.getByRole("region", { name: "Sequência" });
    expect(card()!.compareDocumentPosition(streak) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("due card counts the days", () => {
    start({ measurements: [tape("2026-10-01")] });
    expect(inCard().getByText("Hora de medir")).toBeInTheDocument();
    expect(inCard().getByText("A última com fita foi há 7 dias.")).toBeInTheDocument();
    expect(inCard().queryByText("Hora da primeira medição")).toBeNull();
  });

  it("no card before the interval", () => {
    start({ measurements: [tape("2026-10-02")] });
    expect(card()).toBeNull();
  });

  it("a future tape date is not due", () => {
    start({ measurements: [tape("2026-10-10")] });
    expect(card()).toBeNull();
  });

  it("a weight-only entry does not count", () => {
    start({ measurements: [tape("2026-10-02"), { date: "2026-10-07", values: { peso: 62 } }] });
    expect(card()).toBeNull();
    cleanup();
    start({ measurements: [tape("2026-10-01"), { date: "2026-10-07", values: { peso: 62 } }] });
    expect(inCard().getByText("A última com fita foi há 7 dias.")).toBeInTheDocument();
  });

  it("reminder off shows no card", () => {
    const off = { everyDays: null, snoozedOn: null };
    start({ reminder: off });
    expect(card()).toBeNull();
    cleanup();
    start({ reminder: off, measurements: [tape("2026-08-01")] });
    expect(card()).toBeNull();
  });

  it("hoje nao hides the card until tomorrow", async () => {
    let user = start();
    await user.click(inCard().getByRole("button", { name: "Hoje não" }));
    expect(card()).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Tudo bem, lembro amanhã");
    expect(stored().reminder).toEqual({ everyDays: 7, snoozedOn: THU });
    cleanup();
    user = start({ reminder: { everyDays: 14, snoozedOn: null }, measurements: [tape("2026-09-24")] });
    await user.click(inCard().getByRole("button", { name: "Hoje não" }));
    expect(card()).toBeNull();
    expect(stored().reminder).toEqual({ everyDays: 14, snoozedOn: THU });
  });

  it("the card comes back the next day", async () => {
    start({ reminder: { everyDays: 7, snoozedOn: THU } });
    expect(card()).toBeNull();
    cleanup();
    start({ reminder: { everyDays: 7, snoozedOn: THU } }, "2026-10-09");
    expect(inCard().getByText("Hora da primeira medição")).toBeInTheDocument();
    cleanup();
    const user = start();
    await user.click(inCard().getByRole("button", { name: "Hoje não" }));
    expect(card()).toBeNull();
    vi.setSystemTime(new Date(2026, 9, 9, 9, 0));
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(inCard().getByText("Hora da primeira medição")).toBeInTheDocument();
  });

  it("medir agora opens the form", async () => {
    const user = start();
    const before = stored();
    await user.click(inCard().getByRole("button", { name: "Medir agora" }));
    expect(menuButton("Medidas")).toHaveAttribute("aria-current", "page");
    expect(medidas().getByRole("button", { name: "Fechar" })).toBeInTheDocument();
    expect(dateField().value).toBe(THU);
    expect(stored()).toEqual(before);
  });

  it("medir agora keeps an open form", async () => {
    const user = start();
    await goTo(user, "Medidas");
    await user.click(medidas().getByRole("button", { name: "Abrir" }));
    fireEvent.change(dateField(), { target: { value: "2026-10-01" } });
    await user.type(field("Peso em kg"), "62");
    await goTo(user, "Hoje");
    await user.click(inCard().getByRole("button", { name: "Medir agora" }));
    expect(medidas().getByRole("button", { name: "Fechar" })).toBeInTheDocument();
    expect(dateField().value).toBe("2026-10-01");
    expect(field("Peso em kg").value).toBe("62");
  });

  it("only a tape save clears the card", async () => {
    const user = start();
    await user.click(inCard().getByRole("button", { name: "Medir agora" }));
    await goTo(user, "Hoje");
    expect(card()).toBeInTheDocument();
    await user.click(inCard().getByRole("button", { name: "Medir agora" }));
    await user.type(field("Peso em kg"), "62");
    await user.click(screen.getByRole("button", { name: "Salvar medição" }));
    await goTo(user, "Hoje");
    expect(inCard().getByText("Hora da primeira medição")).toBeInTheDocument();
    await user.click(inCard().getByRole("button", { name: "Medir agora" }));
    await user.type(field("Cintura em cm"), "72");
    await user.click(screen.getByRole("button", { name: "Salvar medição" }));
    await goTo(user, "Hoje");
    expect(card()).toBeNull();
  });

  it("the card shows in every hoje state", () => {
    const first = PLAN.A.exercises[0].id;
    const states: [string, Seed, string, () => HTMLElement][] = [
      ["rest day", {}, WED, () => screen.getByText("Hoje é descanso")],
      ["done today", { completions: [c(THU, "A")] }, THU, () => screen.getByText("Feito por hoje!")],
      [
        "in progress",
        { today: { date: THU, workout: "A", checked: [first] } },
        THU,
        () => screen.getByRole("heading", { name: "Treino A" }),
      ],
    ];
    for (const [name, record, today, marker] of states) {
      start(record, today);
      expect(marker(), name).toBeInTheDocument();
      expect(card(), name).toBeInTheDocument();
      cleanup();
    }
  });

  it("lembrete setting shows the stored interval", async () => {
    const cases: [Seed["reminder"], string][] = [
      [undefined, "7 dias"],
      [{ everyDays: 7, snoozedOn: null }, "7 dias"],
      [{ everyDays: 14, snoozedOn: null }, "14 dias"],
      [{ everyDays: 30, snoozedOn: null }, "30 dias"],
      [{ everyDays: null, snoozedOn: null }, "Não lembrar"],
    ];
    for (const [reminder, pressed] of cases) {
      const user = start(reminder ? { reminder } : {});
      await goTo(user, "Medidas");
      const headings = medidas().getAllByRole("heading").map((h) => h.textContent);
      expect(headings.indexOf("Lembrete")).toBeGreaterThan(headings.indexOf("Nova medição"));
      expect(headings.indexOf("Nova medição")).toBeGreaterThanOrEqual(0);
      const section = screen.getByRole("heading", { name: "Lembrete" }).closest("section")!;
      expect(within(section).getByRole("group", { name: "Lembrar a cada" })).toBeInTheDocument();
      expect(intervals().getAllByRole("button").map((b) => b.textContent)).toEqual(INTERVALS);
      for (const name of INTERVALS) {
        expect(intervals().getByRole("button", { name }), `${pressed}: ${name}`).toHaveAttribute(
          "aria-pressed",
          String(name === pressed),
        );
      }
      cleanup();
    }
  });

  it("choosing an interval stores it", async () => {
    const cases: [7 | 14 | 30, string, 7 | 14 | 30 | null][] = [
      [7, "14 dias", 14],
      [7, "30 dias", 30],
      [7, "Não lembrar", null],
      [30, "7 dias", 7],
    ];
    for (const [from, tap, everyDays] of cases) {
      const user = start({ reminder: { everyDays: from, snoozedOn: THU } });
      await goTo(user, "Medidas");
      await user.click(intervals().getByRole("button", { name: tap }));
      expect(stored().reminder, tap).toEqual({ everyDays, snoozedOn: THU });
      for (const name of INTERVALS) {
        expect(intervals().getByRole("button", { name }), `${tap}: ${name}`).toHaveAttribute("aria-pressed", String(name === tap));
      }
      cleanup();
    }
  });

  it("a new interval applies on the next render", async () => {
    const user = start({ reminder: { everyDays: 14, snoozedOn: null }, measurements: [tape("2026-09-28")] });
    expect(card()).toBeNull();
    await goTo(user, "Medidas");
    await user.click(intervals().getByRole("button", { name: "7 dias" }));
    await goTo(user, "Hoje");
    expect(inCard().getByText("A última com fita foi há 10 dias.")).toBeInTheDocument();
    await goTo(user, "Medidas");
    await user.click(intervals().getByRole("button", { name: "14 dias" }));
    await goTo(user, "Hoje");
    expect(card()).toBeNull();
    await goTo(user, "Medidas");
    await user.click(intervals().getByRole("button", { name: "7 dias" }));
    await user.click(intervals().getByRole("button", { name: "Não lembrar" }));
    await goTo(user, "Hoje");
    expect(card()).toBeNull();
  });

  it("lembrete hint per state", async () => {
    const cases: [string, Seed, string][] = [
      ["off", { reminder: { everyDays: null, snoozedOn: null } }, HINTS[0]],
      ["would show", {}, HINTS[1]],
      ["not due", { measurements: [tape("2026-10-05")] }, HINTS[2]],
      ["snoozed", { reminder: { everyDays: 7, snoozedOn: THU } }, HINTS[2]],
    ];
    for (const [name, record, hint] of cases) {
      const user = start(record);
      await goTo(user, "Medidas");
      const section = within(screen.getByRole("heading", { name: "Lembrete" }).closest("section")!);
      expect(section.getByText(hint), name).toBeInTheDocument();
      expect(HINTS.filter((h) => section.queryByText(h)), name).toHaveLength(1);
      cleanup();
    }
  });

  it("reminder writes keep the rest of the record", async () => {
    const record = {
      completions: [c("2026-10-06", "A")],
      today: { date: THU, workout: "B" as const, checked: [PLAN.B.exercises[0].id] },
      weights: { [PLAN.B.exercises[0].id]: 20 },
      restSeconds: 60 as const,
      measurements: [tape("2026-09-24"), { date: "2026-10-01", values: { peso: 62.9 } }],
    };
    const user = start(record);
    await user.click(inCard().getByRole("button", { name: "Hoje não" }));
    await goTo(user, "Medidas");
    await user.click(intervals().getByRole("button", { name: "30 dias" }));
    const after = JSON.parse(localStorage.getItem("treino:v1")!);
    expect(after.version).toBe(1);
    expect(after.reminder).toEqual({ everyDays: 30, snoozedOn: THU });
    expect(after.completions).toEqual(record.completions);
    expect(after.today).toEqual(record.today);
    expect(after.weights).toEqual(record.weights);
    expect(after.restSeconds).toBe(60);
    expect(after.measurements).toEqual(record.measurements);
  });

  it("no reminder field until she changes it", async () => {
    const user = start();
    expect(card()).toBeInTheDocument();
    await user.click(inCard().getByRole("button", { name: "Medir agora" }));
    await goTo(user, "Hoje");
    expect(stored()).not.toHaveProperty("reminder");
  });
});

describe("Histórico", () => {
  type User = ReturnType<typeof userEvent.setup>;
  type Seed = Parameters<typeof seed>[0];
  type Entry = NonNullable<TreinoRecord["measurements"]>[number];
  const FULL: Entry = {
    date: "2026-09-30",
    values: {
      peso: 62.6, busto: 91, cintura: 71.6, abdomen: 79.4, quadril: 99.6, "braco-d": 28.5, "braco-e": 28.3,
      "coxa-d": 56.1, "coxa-e": 55.8, "panturrilha-d": 35.9, "panturrilha-e": 35.6,
    },
  };
  const TWO: Entry = { date: "2026-09-30", values: { peso: 62.6, cintura: 71.6 } };
  const PESO: Entry = { date: "2026-09-23", values: { peso: 62.9 } };
  const tape = (date: string): Entry => ({ date, values: { cintura: 72 } });
  const FIELDS = [
    "Peso em kg", "Busto em cm", "Cintura em cm", "Abdômen em cm", "Quadril em cm",
    "Braço D em cm", "Braço E em cm", "Coxa D em cm", "Coxa E em cm", "Panturrilha D em cm", "Panturrilha E em cm",
  ];

  const goTo = (user: User, name: "Hoje" | "Medidas") =>
    user.click(within(screen.getByRole("navigation", { name: "Menu" })).getByRole("button", { name }));
  const medidas = () => within(screen.getByRole("region", { name: "Medidas" }));
  const historySection = () => screen.getByRole("heading", { name: "Histórico" }).closest("section")!;
  const history = () => within(historySection());
  const items = () => within(historySection()).queryAllByRole("listitem");
  const dates = () => items().map((li) => within(li).getByTestId("hist-date").textContent);
  const item = (date: string) => items().find((li) => within(li).getByTestId("hist-date").textContent === date)!;
  const rowButton = (date: string) => within(item(date)).getAllByRole("button")[0];
  const lines = (date: string) =>
    Array.from(item(date).querySelectorAll("dl > div")).map((d) => [d.querySelector("dt")!.textContent, d.querySelector("dd")!.textContent]);
  const confirmGroup = (date: string) => screen.queryByRole("group", { name: `Apagar a medição de ${date}?` });
  const field = (name: string) => screen.getByRole("textbox", { name }) as HTMLInputElement;
  const dateField = () => screen.getByLabelText("Data") as HTMLInputElement;
  const formSection = () => screen.getByRole("form").closest("section")!;
  const submit = () => within(screen.getByRole("form")).getAllByRole("button").find((b) => b.getAttribute("type") === "submit")!;
  const card = () => screen.queryByRole("region", { name: "Lembrete de medidas" });

  function start(record: Seed = {}, today = THU) {
    setToday(today);
    seed(record, today);
    const user = userEvent.setup();
    render(<App />);
    return user;
  }

  async function onMedidas(record: Seed = {}, today = THU) {
    const user = start(record, today);
    await goTo(user, "Medidas");
    return user;
  }

  async function open(user: User, date: string) {
    await user.click(rowButton(date));
  }

  async function del(user: User, date: string) {
    if (rowButton(date).getAttribute("aria-expanded") !== "true") await open(user, date);
    await user.click(within(item(date)).getByRole("button", { name: "Apagar" }));
    await user.click(within(confirmGroup(date)!).getByRole("button", { name: "Apagar" }));
  }

  async function edit(user: User, date: string) {
    if (rowButton(date).getAttribute("aria-expanded") !== "true") await open(user, date);
    await user.click(within(item(date)).getByRole("button", { name: "Editar" }));
  }

  it("historico sits between the form and lembrete", async () => {
    for (const record of [{}, { measurements: [TWO] }]) {
      const user = start(record);
      await goTo(user, "Medidas");
      const headings = medidas().getAllByRole("heading").map((h) => h.textContent);
      const form = headings.indexOf("Nova medição");
      const hist = headings.indexOf("Histórico");
      expect(form).toBeGreaterThanOrEqual(0);
      expect(hist).toBeGreaterThan(form);
      expect(headings.indexOf("Lembrete")).toBeGreaterThan(hist);
      cleanup();
    }
  });

  it("historico empty state", async () => {
    for (const record of [{}, { measurements: [] }]) {
      const user = start(record);
      await goTo(user, "Medidas");
      expect(history().getByText("Nenhuma medição ainda.")).toBeInTheDocument();
      expect(history().getByRole("button", { name: "Fazer a primeira" })).toBeInTheDocument();
      expect(history().queryByRole("list")).toBeNull();
      cleanup();
    }
  });

  it("fazer a primeira opens the form", async () => {
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
    const user = await onMedidas();
    await user.click(history().getByRole("button", { name: "Fazer a primeira" }));
    expect(medidas().getByRole("button", { name: "Fechar" })).toBeInTheDocument();
    expect(dateField().value).toBe("2026-10-08");
    expect(scroll.mock.contexts).toContain(formSection());

    fireEvent.change(dateField(), { target: { value: "2026-10-01" } });
    await user.type(field("Peso em kg"), "62");
    await user.click(history().getByRole("button", { name: "Fazer a primeira" }));
    expect(dateField().value).toBe("2026-10-01");
    expect(field("Peso em kg").value).toBe("62");
  });

  it("every entry newest first", async () => {
    const measurements: Entry[] = [];
    const [y, m, d] = [2025, 8, 21];
    for (let i = 0; i < 60; i++) {
      const day = new Date(y, m - 1, d + 7 * i);
      const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      measurements.push({ date: iso, values: { peso: 60 + (i % 10) } });
    }
    expect(measurements[59].date).toBe("2026-10-08");
    await onMedidas({ measurements });
    expect(items()).toHaveLength(60);
    const shown = dates();
    expect(shown[0]).toBe("08/10");
    expect(shown[59]).toBe("21/08/25");
    const iso = [...measurements].reverse().map((e) => e.date);
    for (let i = 0; i < 59; i++) expect(iso[i] > iso[i + 1]).toBe(true);
    // The rows are in that same order.
    expect(shown).toEqual(iso.map((s) => (s.startsWith("2026") ? `${s.slice(8)}/${s.slice(5, 7)}` : `${s.slice(8)}/${s.slice(5, 7)}/${s.slice(2, 4)}`)));
  });

  it("closed row summary", async () => {
    const cases: [Entry["values"], string][] = [
      [FULL.values, "11 medidas"],
      [TWO.values, "2 medidas"],
      [{ cintura: 72 }, "1 medida"],
      [{ peso: 62.9 }, "só peso · 62,9 kg"],
      [{ peso: 64 }, "só peso · 64 kg"],
    ];
    for (const [values, summary] of cases) {
      await onMedidas({ measurements: [{ date: "2026-09-30", values }] });
      expect(dates(), summary).toEqual(["30/09"]);
      expect(within(item("30/09")).getByTestId("hist-sum").textContent, summary).toBe(summary);
      expect(rowButton("30/09")).toHaveAttribute("aria-expanded", "false");
      expect(item("30/09").querySelector("dl"), summary).toBeNull();
      if (values.cintura !== undefined) expect(history().queryByText(/71,6|72 cm/), summary).toBeNull();
      cleanup();
    }
  });

  it("row date shows the year only when it differs", async () => {
    const cases: [string, string, string][] = [
      [THU, "2025-12-30", "30/12/25"],
      [THU, "2026-01-02", "02/01"],
      [THU, "2026-10-08", "08/10"],
      ["2027-01-05", "2026-12-30", "30/12/26"],
    ];
    for (const [today, date, shown] of cases) {
      await onMedidas({ measurements: [{ date, values: { peso: 62 } }] }, today);
      expect(dates(), `${today} ${date}`).toEqual([shown]);
      cleanup();
    }
  });

  it("opening a row shows its values", async () => {
    const user = await onMedidas({
      measurements: [PESO, { date: "2026-09-30", values: { "braco-e": 28.3, peso: 62.6, cintura: 71.6 } }],
    });
    expect(dates()).toEqual(["30/09", "23/09"]);
    await open(user, "30/09");
    expect(rowButton("30/09")).toHaveAttribute("aria-expanded", "true");
    expect(lines("30/09")).toEqual([
      ["Peso", "62,6 kg"],
      ["Cintura", "71,6 cm"],
      ["Braço E", "28,3 cm"],
    ]);
    const buttons = within(item("30/09")).getAllByRole("button").map((b) => b.textContent);
    expect(buttons.slice(1)).toEqual(["Editar", "Apagar"]);

    await open(user, "23/09");
    expect(rowButton("30/09")).toHaveAttribute("aria-expanded", "false");
    expect(lines("30/09")).toEqual([]);
    expect(within(item("30/09")).queryByRole("button", { name: "Editar" })).toBeNull();
    expect(within(item("30/09")).queryByRole("button", { name: "Apagar" })).toBeNull();
    expect(rowButton("23/09")).toHaveAttribute("aria-expanded", "true");
    expect(lines("23/09")).toEqual([["Peso", "62,9 kg"]]);
  });

  it("tapping an open row closes it", async () => {
    const user = await onMedidas({ measurements: [TWO] });
    await open(user, "30/09");
    expect(lines("30/09")).toHaveLength(2);
    await open(user, "30/09");
    expect(rowButton("30/09")).toHaveAttribute("aria-expanded", "false");
    expect(lines("30/09")).toEqual([]);
    expect(within(item("30/09")).queryByRole("button", { name: "Editar" })).toBeNull();
    expect(within(item("30/09")).queryByRole("button", { name: "Apagar" })).toBeNull();
  });

  it("apagar asks first", async () => {
    const user = await onMedidas({ measurements: [TWO] });
    const before = stored();
    await open(user, "30/09");
    await user.click(within(item("30/09")).getByRole("button", { name: "Apagar" }));
    const confirm = confirmGroup("30/09")!;
    expect(item("30/09")).toContainElement(confirm);
    expect(within(confirm).getByText("Apagar a medição de 30/09?")).toBeInTheDocument();
    expect(within(confirm).getByRole("button", { name: "Apagar" })).toBeInTheDocument();
    expect(within(confirm).getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(stored()).toEqual(before);
  });

  it("cancelar keeps the entry", async () => {
    const user = await onMedidas({ measurements: [TWO] });
    const before = stored();
    await open(user, "30/09");
    await user.click(within(item("30/09")).getByRole("button", { name: "Apagar" }));
    await user.click(within(confirmGroup("30/09")!).getByRole("button", { name: "Cancelar" }));
    expect(confirmGroup("30/09")).toBeNull();
    expect(screen.queryByText("Apagar a medição de 30/09?")).toBeNull();
    expect(rowButton("30/09")).toHaveAttribute("aria-expanded", "true");
    expect(lines("30/09")).toHaveLength(2);
    expect(stored()).toEqual(before);
  });

  it("confirmed apagar removes the entry", async () => {
    const user = await onMedidas({ measurements: [PESO, TWO] });
    await del(user, "30/09");
    expect(stored().measurements).toEqual([PESO]);
    expect(dates()).toEqual(["23/09"]);
    expect(items()).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("Medição apagada");
  });

  it("a row change dismisses the confirm", async () => {
    const user = await onMedidas({ measurements: [PESO, TWO] });
    const before = stored();
    await open(user, "30/09");
    await user.click(within(item("30/09")).getByRole("button", { name: "Apagar" }));
    expect(confirmGroup("30/09")).not.toBeNull();
    await open(user, "30/09");
    await open(user, "30/09");
    expect(rowButton("30/09")).toHaveAttribute("aria-expanded", "true");
    expect(screen.queryByText("Apagar a medição de 30/09?")).toBeNull();

    await user.click(within(item("30/09")).getByRole("button", { name: "Apagar" }));
    expect(confirmGroup("30/09")).not.toBeNull();
    await open(user, "23/09");
    expect(history().queryByText(/^Apagar a medição de/)).toBeNull();
    expect(stored()).toEqual(before);
  });

  it("deleting re-derives the reminder", async () => {
    const user = start({ measurements: [tape("2026-09-28"), tape("2026-10-05")] });
    expect(card()).toBeNull();
    await goTo(user, "Medidas");
    await del(user, "05/10");
    await goTo(user, "Hoje");
    expect(within(card()!).getByText("A última com fita foi há 10 dias.")).toBeInTheDocument();
    await goTo(user, "Medidas");
    await del(user, "28/09");
    await goTo(user, "Hoje");
    expect(within(card()!).getByText("Hora da primeira medição")).toBeInTheDocument();
  });

  it("deleting the last entry shows the empty state", async () => {
    const user = await onMedidas({ measurements: [TWO] });
    await del(user, "30/09");
    expect(history().getByText("Nenhuma medição ainda.")).toBeInTheDocument();
    expect(history().getByRole("button", { name: "Fazer a primeira" })).toBeInTheDocument();
    expect(stored().measurements).toEqual([]);
  });

  it("deleting the edited entry closes the form", async () => {
    const user = await onMedidas({ measurements: [PESO, TWO] });
    await edit(user, "30/09");
    expect(medidas().getByRole("heading", { name: "Editar 30/09" })).toBeInTheDocument();
    await del(user, "23/09");
    expect(medidas().getByRole("heading", { name: "Editar 30/09" })).toBeInTheDocument();
    expect(field("Peso em kg").value).toBe("62,6");
    expect(field("Cintura em cm").value).toBe("71,6");
    await del(user, "30/09");
    expect(screen.queryByRole("form")).toBeNull();
    expect(medidas().getByRole("button", { name: "Abrir" })).toBeInTheDocument();
    expect(medidas().getByRole("heading", { name: "Nova medição" })).toBeInTheDocument();
  });

  it("editar opens the form on the entry", async () => {
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
    const user = await onMedidas({ measurements: [TWO, { date: THU, values: { peso: 63 } }] });
    await edit(user, "30/09");
    expect(medidas().getByRole("heading", { name: "Editar 30/09" })).toBeInTheDocument();
    expect(medidas().queryByRole("heading", { name: "Nova medição" })).toBeNull();
    expect(field("Peso em kg").value).toBe("62,6");
    expect(field("Cintura em cm").value).toBe("71,6");
    for (const name of FIELDS.filter((f) => f !== "Peso em kg" && f !== "Cintura em cm")) expect(field(name).value, name).toBe("");
    expect(screen.queryByText("Já tem medição nesse dia. O que você preencher atualiza ela.")).toBeNull();
    expect(scroll.mock.contexts).toContain(formSection());
  });

  it("editar replaces what the form holds", async () => {
    const user = await onMedidas({ measurements: [PESO, TWO] });
    await user.click(medidas().getByRole("button", { name: "Abrir" }));
    await user.type(field("Peso em kg"), "70");
    await edit(user, "30/09");
    expect(field("Peso em kg").value).toBe("62,6");
    await edit(user, "23/09");
    expect(medidas().getByRole("heading", { name: "Editar 23/09" })).toBeInTheDocument();
    expect(field("Peso em kg").value).toBe("62,9");
    expect(field("Cintura em cm").value).toBe("");
  });

  it("the date is locked while editing", async () => {
    const user = await onMedidas({ measurements: [TWO] });
    await edit(user, "30/09");
    expect(dateField().value).toBe("2026-09-30");
    expect(dateField().disabled || dateField().readOnly).toBe(true);
    fireEvent.change(dateField(), { target: { value: "2026-09-20" } });
    expect(dateField().value).toBe("2026-09-30");
    expect(medidas().getByRole("heading", { name: "Editar 30/09" })).toBeInTheDocument();
  });

  it("saving an edit replaces the values", async () => {
    const user = await onMedidas({ measurements: [TWO] });
    await edit(user, "30/09");
    await user.clear(field("Cintura em cm"));
    await user.clear(field("Peso em kg"));
    await user.type(field("Peso em kg"), "62,4");
    await user.type(field("Busto em cm"), "90");
    await user.click(submit());
    expect(stored().measurements).toEqual([{ date: "2026-09-30", values: { peso: 62.4, busto: 90 } }]);
    expect(screen.getByRole("status")).toHaveTextContent("Medição atualizada");
    expect(screen.queryByRole("form")).toBeNull();
    expect(medidas().getByRole("heading", { name: "Nova medição" })).toBeInTheDocument();
    expect(medidas().getByRole("button", { name: "Abrir" })).toBeInTheDocument();
    expect(within(item("30/09")).getByTestId("hist-sum").textContent).toBe("2 medidas");
  });

  it("a cleared edit offers to delete", async () => {
    const user = await onMedidas({ measurements: [TWO] });
    await edit(user, "30/09");
    await user.clear(field("Peso em kg"));
    await user.clear(field("Cintura em cm"));
    expect(submit()).toHaveTextContent("Apagar medição");
    expect(submit()).toBeEnabled();
    await user.type(field("Peso em kg"), "62");
    expect(submit()).toHaveTextContent("Salvar medição");

    await user.click(medidas().getByRole("button", { name: "Fechar" }));
    await user.click(medidas().getByRole("button", { name: "Abrir" }));
    for (const name of FIELDS) expect(field(name).value, name).toBe("");
    expect(submit()).toHaveTextContent("Salvar medição");
    expect(submit()).toBeDisabled();
  });

  it("deleting from the form asks first", async () => {
    const user = await onMedidas({ measurements: [PESO, TWO] });
    const before = stored();
    await edit(user, "30/09");
    await user.clear(field("Peso em kg"));
    await user.clear(field("Cintura em cm"));
    await user.click(submit());
    const confirm = confirmGroup("30/09")!;
    expect(screen.getByRole("form")).toContainElement(confirm);
    expect(within(confirm).getByText("Apagar a medição de 30/09?")).toBeInTheDocument();
    expect(within(confirm).getByRole("button", { name: "Apagar" })).toBeInTheDocument();
    expect(stored()).toEqual(before);

    await user.click(within(confirm).getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByText("Apagar a medição de 30/09?")).toBeNull();
    expect(medidas().getByRole("heading", { name: "Editar 30/09" })).toBeInTheDocument();
    for (const name of FIELDS) expect(field(name).value, name).toBe("");
    expect(submit()).toHaveTextContent("Apagar medição");
    expect(stored()).toEqual(before);

    await user.click(submit());
    await user.click(within(confirmGroup("30/09")!).getByRole("button", { name: "Apagar" }));
    expect(stored().measurements).toEqual([PESO]);
    expect(screen.getByRole("status")).toHaveTextContent("Medição apagada");
    expect(screen.queryByRole("form")).toBeNull();
    expect(dates()).toEqual(["23/09"]);
  });

  it("a bad value in an edit is marked", async () => {
    const user = await onMedidas({ measurements: [TWO] });
    const before = stored();
    await edit(user, "30/09");
    await user.clear(field("Cintura em cm"));
    await user.type(field("Cintura em cm"), "680");
    await user.tab();
    expect(screen.getByText("Confira este valor")).toBeInTheDocument();
    expect(field("Cintura em cm")).toHaveAttribute("aria-invalid", "true");
    expect(submit()).toBeDisabled();
    expect(stored()).toEqual(before);
  });

  it("fechar leaves the edit unsaved", async () => {
    const user = await onMedidas({ measurements: [TWO] });
    const before = stored();
    await edit(user, "30/09");
    await user.clear(field("Cintura em cm"));
    await user.click(medidas().getByRole("button", { name: "Fechar" }));
    expect(stored()).toEqual(before);
    await user.click(medidas().getByRole("button", { name: "Abrir" }));
    expect(medidas().getByRole("heading", { name: "Nova medição" })).toBeInTheDocument();
    expect(dateField().value).toBe("2026-10-08");
    expect(dateField().disabled || dateField().readOnly).toBe(false);
  });

  it("an edit that drops the tape re-derives the reminder", async () => {
    const user = start({ measurements: [tape("2026-09-28"), { date: "2026-10-05", values: { peso: 62, cintura: 71 } }] });
    expect(card()).toBeNull();
    await goTo(user, "Medidas");
    await edit(user, "05/10");
    await user.clear(field("Cintura em cm"));
    await user.click(submit());
    await goTo(user, "Hoje");
    expect(within(card()!).getByText("A última com fita foi há 10 dias.")).toBeInTheDocument();
  });

  it("historico writes keep the rest of the record", async () => {
    const record = {
      completions: [c("2026-10-06", "A")],
      today: { date: THU, workout: "B" as const, checked: [PLAN.B.exercises[0].id] },
      weights: { [PLAN.B.exercises[0].id]: 20 },
      restSeconds: 60 as const,
      reminder: { everyDays: 14 as const, snoozedOn: "2026-10-07" },
      measurements: [PESO, TWO, { date: "2026-10-05", values: { quadril: 95 } }],
    };
    const user = await onMedidas(record);
    await edit(user, "30/09");
    await user.clear(field("Peso em kg"));
    await user.type(field("Peso em kg"), "62,4");
    await user.click(submit());
    await del(user, "23/09");
    const after = JSON.parse(localStorage.getItem("treino:v1")!);
    expect(after.version).toBe(1);
    expect(after.completions).toEqual(record.completions);
    expect(after.today).toEqual(record.today);
    expect(after.weights).toEqual(record.weights);
    expect(after.restSeconds).toBe(60);
    expect(after.reminder).toEqual(record.reminder);
    expect(after.measurements).toEqual([{ date: "2026-09-30", values: { peso: 62.4, cintura: 71.6 } }, record.measurements[2]]);
  });
});

describe("Gráfico", () => {
  type User = ReturnType<typeof userEvent.setup>;
  type Seed = Parameters<typeof seed>[0];
  type Entry = NonNullable<TreinoRecord["measurements"]>[number];
  const FRI = "2026-10-09";
  const CIN3: Entry[] = [
    { date: "2026-08-27", values: { cintura: 74, peso: 64.2 } },
    { date: "2026-09-24", values: { cintura: 72.4 } },
    { date: "2026-10-01", values: { peso: 62.9 } },
    { date: "2026-10-08", values: { cintura: 71.6, peso: 62.6 } },
  ];
  const PAIR: Entry[] = [
    { date: "2026-09-24", values: { "braco-d": 29, "braco-e": 28.6 } },
    { date: "2026-10-08", values: { "braco-d": 28.5, "braco-e": 28.3 } },
  ];
  const PESO1: Entry = { date: "2026-10-01", values: { peso: 62.9 } };
  const ONE_SIDE_SINGLE: Entry[] = [
    { date: "2026-09-24", values: { "braco-d": 29 } },
    { date: "2026-10-08", values: { "braco-d": 28.5, "braco-e": 28.3 } },
  ];
  const CHIP_NAMES = ["Peso", "Busto", "Cintura", "Abdômen", "Quadril", "Braço", "Coxa", "Panturrilha"];
  const FIRST_TEXT = (date: string) => `primeira medição, ${date}. A linha aparece a partir da segunda.`;

  const goTo = (user: User, name: "Hoje" | "Medidas") =>
    user.click(within(screen.getByRole("navigation", { name: "Menu" })).getByRole("button", { name }));
  const evoRegion = () => screen.getByRole("region", { name: "Sua evolução" });
  const evo = () => within(evoRegion());
  const chips = () => within(screen.getByRole("group", { name: "Escolher medida" })).getAllByRole("button");
  const chip = (name: string) => within(screen.getByRole("group", { name: "Escolher medida" })).getByRole("button", { name });
  const chart = () => screen.queryByRole("img", { name: /^Gráfico de/ });
  const lines = () => Array.from(chart()!.querySelectorAll("polyline"));
  const coords = (el: Element) =>
    el.getAttribute("points")!.trim().split(/\s+/).map((pair) => pair.split(",").map(Number));
  const near = (actual: number[][], expected: number[][]) => {
    expect(actual.length).toBe(expected.length);
    actual.forEach(([x, y], i) => {
      expect(Math.abs(x - expected[i][0]), `x${i}`).toBeLessThan(0.01);
      expect(Math.abs(y - expected[i][1]), `y${i}`).toBeLessThan(0.01);
    });
  };
  const sides = () => Array.from(evoRegion().querySelectorAll(".headline > div"));
  const side = (el: Element) => ({
    letter: el.querySelector(".now small:not(:last-child)")?.textContent ?? null,
    value: el.querySelector(".now span")!.textContent,
    unit: el.querySelector(".now small:last-child")!.textContent,
    delta: el.querySelector(".delta")!.textContent,
  });
  const lastDots = () => Array.from(chart()!.querySelectorAll("circle.dot")).filter((c) => !c.closest(".hover-dots"));
  const texts = (filter: (t: SVGTextElement) => boolean) =>
    Array.from(chart()!.querySelectorAll<SVGTextElement>("text.tick")).filter(filter);
  const yTexts = () => texts((t) => t.getAttribute("text-anchor") === "end" && t.getAttribute("x") === "28");
  const xTexts = () => texts((t) => t.getAttribute("y") === "174");

  async function onMedidas(record: Seed = {}, today = FRI) {
    setToday(today);
    seed(record, today);
    const user = userEvent.setup();
    render(<App />);
    await goTo(user, "Medidas");
    return user;
  }

  it("sua evolucao comes first on medidas", async () => {
    await onMedidas({ measurements: CIN3 });
    const medidas = within(screen.getByRole("region", { name: "Medidas" }));
    const headings = medidas.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    const order = ["Sua evolução", "Nova medição", "Histórico", "Lembrete"].map((h) => headings.indexOf(h));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(order[0]).toBe(0);
  });

  it("no measurement no evolucao", async () => {
    for (const record of [{}, { measurements: [] }] as Seed[]) {
      await onMedidas(record);
      expect(screen.queryByRole("heading", { name: "Sua evolução" })).toBeNull();
      expect(screen.queryByRole("group", { name: "Escolher medida" })).toBeNull();
      expect(chart()).toBeNull();
      expect(screen.getByText("Nenhuma medição ainda.")).toBeInTheDocument();
      cleanup();
      localStorage.clear();
    }
    const user = await onMedidas({ measurements: [PESO1] });
    expect(screen.getByRole("heading", { name: "Sua evolução" })).toBeInTheDocument();
    const hist = within(screen.getByRole("heading", { name: "Histórico" }).closest("section")!);
    await user.click(hist.getByRole("button", { name: /01\/10/ }));
    await user.click(hist.getByRole("button", { name: "Apagar" }));
    await user.click(within(screen.getByRole("group", { name: "Apagar a medição de 01/10?" })).getByRole("button", { name: "Apagar" }));
    expect(screen.queryByRole("heading", { name: "Sua evolução" })).toBeNull();
  });

  it("eight chips in order", async () => {
    await onMedidas({ measurements: CIN3 });
    expect(chips().map((b) => b.textContent)).toEqual(CHIP_NAMES);
  });

  it("cintura is chosen first", async () => {
    await onMedidas({ measurements: CIN3 });
    for (const b of chips()) expect(b, b.textContent!).toHaveAttribute("aria-pressed", b.textContent === "Cintura" ? "true" : "false");
  });

  it("a chip tap chooses the measure", async () => {
    const user = await onMedidas({ measurements: CIN3 });
    await user.click(chip("Peso"));
    for (const b of chips()) expect(b, b.textContent!).toHaveAttribute("aria-pressed", b.textContent === "Peso" ? "true" : "false");
    expect(side(sides()[0])).toMatchObject({ value: "62,6", unit: "kg" });
    expect(screen.getByRole("img", { name: "Gráfico de peso" })).toBeInTheDocument();
    await user.click(chip("Quadril"));
    for (const b of chips()) expect(b, b.textContent!).toHaveAttribute("aria-pressed", b.textContent === "Quadril" ? "true" : "false");
  });

  it("the chosen chip survives a page switch", async () => {
    const user = await onMedidas({ measurements: CIN3 });
    await user.click(chip("Peso"));
    await goTo(user, "Hoje");
    await goTo(user, "Medidas");
    expect(chip("Peso")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("img", { name: "Gráfico de peso" })).toBeInTheDocument();
  });

  it("a measure with no entry says so", async () => {
    const user = await onMedidas({ measurements: [PESO1] });
    const table: [string, string][] = [
      ["Cintura", "Ainda sem medição de cintura."],
      ["Busto", "Ainda sem medição de busto."],
      ["Abdômen", "Ainda sem medição de abdômen."],
      ["Braço", "Ainda sem medição de braço."],
      ["Panturrilha", "Ainda sem medição de panturrilha."],
    ];
    for (const [name, text] of table) {
      await user.click(chip(name));
      expect(evo().getByText(text)).toBeInTheDocument();
      expect(chart(), name).toBeNull();
    }
    await user.click(chip("Peso"));
    expect(evo().queryByText(/^Ainda sem/)).toBeNull();
  });

  it("one entry shows primeira medicao", async () => {
    const user = await onMedidas({ measurements: [PESO1, { date: "2026-10-08", values: { cintura: 71.6 } }] });
    const first = () => evoRegion().querySelector(".first")!;
    expect(first().querySelector("b")!.textContent).toBe("71,6 cm");
    expect(first().textContent).toBe("71,6 cm" + FIRST_TEXT("08/10"));
    expect(chart()).toBeNull();
    await user.click(chip("Peso"));
    expect(first().querySelector("b")!.textContent).toBe("62,9 kg");
    expect(first().textContent).toBe("62,9 kg" + FIRST_TEXT("01/10"));
    expect(chart()).toBeNull();
  });

  it("latest value and change since the first", async () => {
    const user = await onMedidas({ measurements: CIN3 });
    expect(sides()).toHaveLength(1);
    expect(side(sides()[0])).toEqual({ letter: null, value: "71,6", unit: "cm", delta: "−2,4 cm desde 27/08" });
    expect(side(sides()[0]).delta.charCodeAt(0)).toBe(0x2212);
    await user.click(chip("Peso"));
    expect(side(sides()[0])).toEqual({ letter: null, value: "62,6", unit: "kg", delta: "−1,6 kg desde 27/08" });
  });

  it("one line through the measured dates", async () => {
    const user = await onMedidas({ measurements: CIN3 });
    expect(lines()).toHaveLength(1);
    near(coords(lines()[0]), [[34, 12], [218, 88.8], [310, 127.2]]);
    await user.click(chip("Peso"));
    expect(lines()).toHaveLength(1);
    near(coords(lines()[0]), [[34, 50.4], [264, 112.8], [310, 127.2]]);
  });

  it("a date without the measure has no point", async () => {
    await onMedidas({
      measurements: [
        { date: "2026-09-24", values: { cintura: 72.4 } },
        { date: "2026-10-01", values: { peso: 62.9 } },
        { date: "2026-10-08", values: { cintura: 71.6 } },
      ],
    });
    expect(lines()).toHaveLength(1);
    expect(coords(lines()[0])).toHaveLength(2);
  });

  it("axis labels", async () => {
    await onMedidas({ measurements: CIN3 });
    expect(yTexts().map((t) => t.textContent)).toEqual(["71", "72", "73", "74"]);
    yTexts().forEach((t, i) => expect(Math.abs(Number(t.getAttribute("y")) - [160, 112, 64, 16][i])).toBeLessThan(0.01));
    expect(xTexts().map((t) => t.textContent)).toEqual(["27/08", "24/09", "08/10"]);
    expect(xTexts().map((t) => t.getAttribute("text-anchor"))).toEqual(["start", "middle", "end"]);
    xTexts().forEach((t, i) => expect(Math.abs(Number(t.getAttribute("x")) - [34, 218, 310][i])).toBeLessThan(0.01));
    cleanup();
    localStorage.clear();
    const user2 = await onMedidas({ measurements: PAIR });
    await user2.click(chip("Braço"));
    expect(yTexts().map((t) => t.textContent)).toEqual(["28,25", "28,5", "28,75", "29"]);
    expect(xTexts().map((t) => t.textContent)).toEqual(["24/09", "08/10"]);
  });

  it("chart dates show the year only when it differs", async () => {
    const today = "2027-01-05";
    await onMedidas({ measurements: [{ date: "2026-12-20", values: { cintura: 74 } }, { date: "2027-01-03", values: { cintura: 73 } }] }, today);
    expect(side(sides()[0]).delta).toBe("−1 cm desde 20/12/26");
    expect(xTexts().map((t) => t.textContent)).toEqual(["20/12/26", "03/01"]);
    cleanup();
    localStorage.clear();
    await onMedidas({ measurements: [{ date: "2026-12-20", values: { cintura: 74 } }] }, today);
    expect(evoRegion().querySelector(".first")!.textContent).toBe("74 cm" + FIRST_TEXT("20/12/26"));
  });

  it("latest point has a dot", async () => {
    await onMedidas({ measurements: CIN3 });
    expect(lastDots()).toHaveLength(1);
    const dot = lastDots()[0];
    expect(dot.getAttribute("r")).toBe("5");
    expect(Math.abs(Number(dot.getAttribute("cx")) - 310)).toBeLessThan(0.01);
    expect(Math.abs(Number(dot.getAttribute("cy")) - 127.2)).toBeLessThan(0.01);
    const grid = Array.from(chart()!.querySelectorAll("line.grid"));
    expect(grid).toHaveLength(4);
    for (const g of grid) {
      expect(g.getAttribute("x1")).toBe("34");
      expect(g.getAttribute("x2")).toBe("310");
    }
  });

  it("chart accessible name", async () => {
    const user = await onMedidas({
      measurements: [
        ...CIN3.slice(0, 1),
        { date: "2026-09-24", values: { cintura: 72.4, abdomen: 81 } },
        ...CIN3.slice(2, 3),
        { date: "2026-10-08", values: { cintura: 71.6, peso: 62.6, abdomen: 80 } },
        ...PAIR.map((p) => ({ date: p.date === "2026-09-24" ? "2026-09-23" : "2026-10-07", values: p.values })),
      ],
    });
    expect(screen.getByRole("img", { name: "Gráfico de cintura" })).toBeInTheDocument();
    await user.click(chip("Abdômen"));
    expect(screen.getByRole("img", { name: "Gráfico de abdômen" })).toBeInTheDocument();
    await user.click(chip("Braço"));
    expect(screen.getByRole("img", { name: "Gráfico de braço" })).toBeInTheDocument();
  });

  it("a pair shows d and e headlines", async () => {
    const user = await onMedidas({ measurements: PAIR });
    await user.click(chip("Braço"));
    expect(sides().map(side)).toEqual([
      { letter: "D", value: "28,5", unit: "cm", delta: "−0,5 cm desde 24/09" },
      { letter: "E", value: "28,3", unit: "cm", delta: "−0,3 cm desde 24/09" },
    ]);
  });

  it("a pair draws solid d and dashed e", async () => {
    const user = await onMedidas({ measurements: PAIR });
    await user.click(chip("Braço"));
    const [d, e] = lines();
    expect(lines()).toHaveLength(2);
    expect(d.getAttribute("stroke")).toBe("var(--s-d)");
    expect(d.hasAttribute("stroke-dasharray")).toBe(false);
    near(coords(d), [[34, 12], [310, 108]]);
    expect(e.getAttribute("stroke")).toBe("var(--s-e)");
    expect(e.getAttribute("stroke-dasharray")).toBe("6 4");
    near(coords(e), [[34, 88.8], [310, 146.4]]);
    expect(lastDots().map((c) => c.getAttribute("fill"))).toEqual(["var(--s-d)", "var(--s-e)"]);
    near(lastDots().map((c) => [Number(c.getAttribute("cx")), Number(c.getAttribute("cy"))]), [[310, 108], [310, 146.4]]);
    const ends = Array.from(chart()!.querySelectorAll("text.end-label"));
    expect(ends.map((t) => t.textContent)).toEqual(["D", "E"]);
    near(ends.map((t) => [Number(t.getAttribute("x")), Number(t.getAttribute("y"))]), [[319, 112], [319, 150.4]]);
    const legend = evoRegion().querySelector(".legend")!;
    const entries = Array.from(legend.querySelectorAll("span"));
    expect(entries.map((s) => s.textContent)).toEqual(["Direita", "Esquerda"]);
    const [ld, le] = entries.map((s) => s.querySelector("line")!);
    expect(ld.getAttribute("stroke")).toBe("var(--s-d)");
    expect(ld.getAttribute("stroke-width")).toBe("2.5");
    expect(ld.hasAttribute("stroke-dasharray")).toBe(false);
    expect(le.getAttribute("stroke")).toBe("var(--s-e)");
    expect(le.getAttribute("stroke-width")).toBe("2.5");
    expect(le.getAttribute("stroke-dasharray")).toBe("4 3");
    cleanup();
    localStorage.clear();
    await onMedidas({ measurements: CIN3 });
    expect(evoRegion().querySelector(".legend")).toBeNull();
    expect(chart()!.querySelectorAll("text.end-label")).toHaveLength(0);
  });

  it("legend and crosshair geometry", async () => {
    const user = await onMedidas({ measurements: PAIR });
    await user.click(chip("Braço"));
    const svgs = Array.from(evoRegion().querySelectorAll(".legend svg"));
    expect(svgs).toHaveLength(2);
    for (const svg of svgs) {
      expect(svg.getAttribute("viewBox")).toBe("0 0 22 8");
      const l = svg.querySelector("line")!;
      expect(["x1", "y1", "x2", "y2"].map((a) => l.getAttribute(a))).toEqual(["1", "4", "21", "4"]);
    }
    const cross = chart()!.querySelector("line.cross")!;
    expect(cross.getAttribute("y1")).toBe("12");
    expect(cross.getAttribute("y2")).toBe("156");
    expect(cross.getAttribute("visibility")).toBe("hidden");
  });

  it("a side with one entry shows primeira medicao", async () => {
    const user = await onMedidas({ measurements: ONE_SIDE_SINGLE });
    await user.click(chip("Braço"));
    const [d, e] = sides().map(side);
    expect(d.delta).toBe("−0,5 cm desde 24/09");
    expect(e).toEqual({ letter: "E", value: "28,3", unit: "cm", delta: "primeira medição" });
    expect(e.delta).not.toContain("desde");
    expect(lines()).toHaveLength(1);
    expect(lines()[0].getAttribute("stroke")).toBe("var(--s-d)");
    const eDot = lastDots().filter((c) => c.getAttribute("fill") === "var(--s-e)");
    expect(eDot).toHaveLength(1);
    expect(Math.abs(Number(eDot[0].getAttribute("cx")) - 310)).toBeLessThan(0.01);
    cleanup();
    localStorage.clear();
    const user2 = await onMedidas({
      measurements: [
        { date: "2026-10-01", values: { "braco-e": 28.6 } },
        { date: "2026-10-08", values: { "braco-d": 29 } },
      ],
    });
    await user2.click(chip("Braço"));
    expect(chart()).not.toBeNull();
    expect(lines()).toHaveLength(0);
    expect(lastDots().map((c) => c.getAttribute("fill"))).toEqual(["var(--s-d)", "var(--s-e)"]);
  });

  it("a side with no entry is left out", async () => {
    const user = await onMedidas({
      measurements: [
        { date: "2026-09-24", values: { "braco-d": 29 } },
        { date: "2026-10-08", values: { "braco-d": 28.5 } },
      ],
    });
    await user.click(chip("Braço"));
    expect(sides().map(side).map((s) => s.letter)).toEqual(["D"]);
    expect(lines()).toHaveLength(1);
    const legend = evoRegion().querySelector(".legend")!;
    expect(Array.from(legend.querySelectorAll("span")).map((s) => s.textContent)).toEqual(["Direita"]);
    expect(Array.from(chart()!.querySelectorAll("text.end-label")).map((t) => t.textContent)).toEqual(["D"]);
    expect(evoRegion().textContent).not.toMatch(/NaN|undefined/);
  });

  it("a pair on one date shows primeira medicao", async () => {
    const user = await onMedidas({ measurements: [{ date: "2026-10-08", values: { "braco-d": 29, "braco-e": 28.6 } }] });
    await user.click(chip("Braço"));
    const first = evoRegion().querySelector(".first")!;
    expect(Array.from(first.querySelectorAll("b")).map((b) => b.textContent)).toEqual(["D 29 cm", "E 28,6 cm"]);
    expect(first.textContent).toBe("D 29 cmE 28,6 cm" + FIRST_TEXT("08/10"));
    expect(chart()).toBeNull();
  });

  it("the chart follows saves edits and deletes", async () => {
    const record: Seed = { measurements: CIN3, completions: [c("2026-10-06", "A")], weights: { extensao: 30 }, restSeconds: 60, reminder: { everyDays: 14, snoozedOn: "2026-10-07" } };
    const user = await onMedidas(record);
    const before = stored();
    await user.click(chip("Peso"));
    const form = () => within(screen.getByRole("form"));
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    await user.type(form().getByRole("textbox", { name: "Peso em kg" }), "62,2");
    await user.click(form().getByRole("button", { name: "Salvar medição" }));
    expect(side(sides()[0])).toMatchObject({ value: "62,2", delta: "−2 kg desde 27/08" });
    expect(chip("Peso")).toHaveAttribute("aria-pressed", "true");
    const hist = within(screen.getByRole("heading", { name: "Histórico" }).closest("section")!);
    await user.click(hist.getByRole("button", { name: /09\/10/ }));
    await user.click(hist.getByRole("button", { name: "Editar" }));
    const peso = form().getByRole("textbox", { name: "Peso em kg" });
    await user.clear(peso);
    await user.type(peso, "62,3");
    await user.click(form().getByRole("button", { name: "Salvar medição" }));
    expect(side(sides()[0]).value).toBe("62,3");
    const row = hist.getByRole("button", { name: /09\/10/ });
    if (row.getAttribute("aria-expanded") !== "true") await user.click(row);
    await user.click(hist.getByRole("button", { name: "Apagar" }));
    await user.click(within(screen.getByRole("group", { name: "Apagar a medição de 09/10?" })).getByRole("button", { name: "Apagar" }));
    expect(side(sides()[0]).value).toBe("62,6");
    expect(chip("Peso")).toHaveAttribute("aria-pressed", "true");
    const after = stored();
    expect(after.version).toBe(1);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(after.completions).toEqual(before.completions);
    expect(after.today).toEqual(before.today);
    expect(after.weights).toEqual(before.weights);
    expect(after.restSeconds).toBe(60);
    expect(after.reminder).toEqual(before.reminder);
  });

  it("choosing chips stores nothing", async () => {
    const user = await onMedidas({ measurements: CIN3 });
    const before = localStorage.getItem(STORAGE_KEY);
    for (const name of CHIP_NAMES) await user.click(chip(name));
    expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
  });

  it("chart numbers use a decimal comma", async () => {
    const user = await onMedidas({ measurements: [...CIN3, ...PAIR.map((p) => ({ date: p.date === "2026-09-24" ? "2026-09-23" : "2026-10-07", values: p.values }))] });
    expect(evoRegion().textContent).not.toMatch(/\d\.\d/);
    await user.click(chip("Braço"));
    expect(evoRegion().textContent).not.toMatch(/\d\.\d/);
    expect(evoRegion().textContent).toContain("28,5");
  });
});
