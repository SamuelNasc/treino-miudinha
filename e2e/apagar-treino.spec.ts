import { expect, test, type Locator, type Page } from "@playwright/test";

// Apagar treino: what jsdom cannot see - the confirm's place, size and colours, and the strip day's look.
test.use({ viewport: { width: 360, height: 740 } });

const box = async (l: Locator) => (await l.boundingBox())!;
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};
const css = (l: Locator, prop: string) => l.evaluate((e, p) => getComputedStyle(e).getPropertyValue(p), prop);

const CHERRY = { light: "#b3122e", dark: "#ff5c75" };
const BLUSH = { light: "#ffe1e6", dark: "#3a141c" };
const ON_ACCENT = { light: "#ffffff", dark: "#1c0a0e" };
const BERRY = { light: "#e8304a", dark: "#ff4a64" };
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const QUESTION = "Apagar o Treino B de qua, 07/10?";

// Seeds A on Monday and B on Wednesday, fixes the clock at Friday 2026-10-09, opens Hoje.
async function hoje(page: Page) {
  await page.clock.setFixedTime(new Date("2026-10-09T10:00:00-03:00"));
  await page.addInitScript(() => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    const record = {
      version: 1,
      completions: [{ date: "2026-10-05", workout: "A" }, { date: "2026-10-07", workout: "B" }],
      today: { date: "2026-10-09", workout: null, checked: [] },
      weights: {},
      restSeconds: 90,
    };
    localStorage.setItem("treino:v1", JSON.stringify(record));
  });
  await page.goto("/");
}

const wed = (page: Page) => page.getByRole("button", { name: "Apagar treino de qua, 07/10" });
const confirm = (page: Page) => page.getByRole("group", { name: QUESTION });

test("confirm sits between strip and picker", async ({ page }) => {
  await hoje(page);
  await wed(page).click();
  const c = await box(confirm(page));
  const strip = await box(page.getByRole("list", { name: "Semana" }));
  const picker = await box(page.getByRole("group", { name: "Escolher treino" }));
  expect(c.y).toBeGreaterThanOrEqual(strip.y + strip.height);
  expect(c.y + c.height).toBeLessThanOrEqual(picker.y);
  expect(Math.abs(c.width - strip.width)).toBeLessThanOrEqual(1);
  const q = await box(confirm(page).getByText(QUESTION));
  const yes = await box(confirm(page).getByRole("button", { name: "Apagar" }));
  const no = await box(confirm(page).getByRole("button", { name: "Cancelar" }));
  expect(yes.height).toBeGreaterThanOrEqual(44);
  expect(no.height).toBeGreaterThanOrEqual(44);
  const before = (a: typeof q, b: typeof q) => a.x + a.width <= b.x || a.y + a.height <= b.y;
  expect(before(q, yes)).toBe(true);
  expect(before(yes, no)).toBe(true);
});

for (const scheme of ["light", "dark"] as const) {
  test(`confirm colours match historico (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await hoje(page);
    await wed(page).click();
    expect(await css(confirm(page), "background-color")).toBe(rgb(BLUSH[scheme]));
    const yes = confirm(page).getByRole("button", { name: "Apagar" });
    expect(await css(yes, "background-color")).toBe(rgb(CHERRY[scheme]));
    expect(await css(yes, "color")).toBe(rgb(ON_ACCENT[scheme]));
  });
}

test("strip day button keeps its look", async ({ page }) => {
  await hoje(page);
  const button = wed(page);
  const dot = button.getByTestId("day-dot");
  expect(await css(dot, "background-color")).toBe(rgb(BERRY.light));
  expect(await css(dot, "max-width")).toBe("42px");
  expect(await css(dot, "font-weight")).toBe("600");
  expect(await css(dot, "color")).toBe(rgb(ON_ACCENT.light));
  // The dot of a day with no button, for size: Tuesday.
  const tue = page.getByRole("list", { name: "Semana" }).getByRole("listitem").nth(1).getByTestId("day-dot");
  const a = await box(dot);
  const b = await box(tue);
  expect(Math.abs(a.width - b.width)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(0.5);
  expect(await css(button, "background-color")).toBe(TRANSPARENT);
  expect(await css(button, "border-top-width")).toBe("0px");
  await page.getByRole("button", { name: "Apagar treino de seg, 05/10" }).focus();
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  expect(await css(button, "outline-style")).not.toBe("none");
});
