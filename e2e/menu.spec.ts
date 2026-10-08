import { expect, test, type Locator, type Page } from "@playwright/test";

// Menu slice: what jsdom cannot see - the fixed bar, stacking above it, and its colours.
test.use({ viewport: { width: 360, height: 740 } });

const box = async (l: Locator) => (await l.boundingBox())!;
const menu = (page: Page) => page.getByRole("navigation", { name: "Menu" });
const tab = (page: Page, name: "Hoje" | "Medidas") => menu(page).getByRole("button", { name });
const timer = (page: Page) => page.getByRole("group", { name: "Descanso" });
const toEnd = (page: Page) => page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};

test("bar is fixed to the bottom", async ({ page }) => {
  await page.goto("/");
  const b = await box(menu(page));
  expect(b.x).toBe(0);
  expect(b.width).toBe(360);
  expect(b.y + b.height).toBe(740);
  await toEnd(page);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  const after = await box(menu(page));
  expect(after.y + after.height).toBe(740);
});

test("two equal buttons, icon above label", async ({ page }) => {
  await page.goto("/");
  const hoje = await box(tab(page, "Hoje"));
  const medidas = await box(tab(page, "Medidas"));
  expect(Math.abs(hoje.y - medidas.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(hoje.width - medidas.width)).toBeLessThanOrEqual(1);
  expect(hoje.x + hoje.width).toBeLessThanOrEqual(medidas.x);

  for (const name of ["Hoje", "Medidas"] as const) {
    const button = tab(page, name);
    await expect(button.locator("svg")).toHaveCount(1);
    await expect(button.locator("svg")).toHaveAttribute("aria-hidden", "true");
    const [iconBottom, textTop] = await button.evaluate((el) => {
      const svg = el.querySelector("svg")!.getBoundingClientRect();
      const text = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim())!;
      const range = document.createRange();
      range.selectNodeContents(text);
      return [svg.bottom, range.getBoundingClientRect().top];
    });
    expect(iconBottom).toBeLessThanOrEqual(textTop);
  }
  await expect(tab(page, "Hoje").locator("svg path")).toHaveAttribute("d", "M5 12.5l4.5 4.5L19 7.5");
  await expect(tab(page, "Medidas").locator("svg rect")).toHaveCount(1);
  await expect(tab(page, "Medidas").locator("svg path")).toHaveCount(1);
});

test("timer and toast sit above the bar", async ({ page }) => {
  await page.goto("/");
  for (const name of ["Hoje", "Medidas"] as const) {
    await tab(page, name).click();
    const t = await box(timer(page));
    expect(t.y + t.height).toBeLessThanOrEqual((await box(menu(page))).y);
  }
  // A toast needs the import control, which lives on Hoje; it stays shown after switching.
  await tab(page, "Hoje").click();
  await page.getByLabel("Importar backup").setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from("nope") });
  const toast = page.getByRole("status").filter({ hasText: "Arquivo inválido" });
  for (const name of ["Hoje", "Medidas"] as const) {
    await tab(page, name).click();
    await expect(toast).toBeVisible();
    const s = await box(toast);
    expect(s.y + s.height).toBeLessThanOrEqual((await box(timer(page))).y);
  }
});

test("backup is not hidden behind the bar", async ({ page }) => {
  await page.goto("/");
  await toEnd(page);
  const importer = await box(page.getByText("Importar backup"));
  expect(importer.y + importer.height).toBeLessThanOrEqual((await box(timer(page))).y);
});

test("menu buttons are tall enough", async ({ page }) => {
  await page.goto("/");
  for (const name of ["Hoje", "Medidas"] as const) {
    expect((await box(tab(page, name))).height).toBeGreaterThanOrEqual(48);
  }
});

const COLOURS = {
  light: { blush: "#ffe1e6", cherry: "#b3122e", muted: "#8d5a63", surface: "#ffffff" },
  dark: { blush: "#3a141c", cherry: "#ff5c75", muted: "#d59aa4", surface: "#2a1016" },
} as const;

for (const scheme of ["light", "dark"] as const) {
  test(`active and inactive colours - ${scheme}`, async ({ page }) => {
    const c = COLOURS[scheme];
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await expect(menu(page)).toHaveCSS("background-color", rgb(c.surface));
    for (const [active, inactive] of [["Hoje", "Medidas"], ["Medidas", "Hoje"]] as const) {
      await tab(page, active).click();
      await expect(tab(page, active)).toHaveCSS("background-color", rgb(c.blush));
      await expect(tab(page, active)).toHaveCSS("color", rgb(c.cherry));
      await expect(tab(page, inactive)).toHaveCSS("color", rgb(c.muted));
    }
  });
}

test("celebration covers the bar", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("group", { name: "Escolher treino" }).getByRole("button", { name: "Treino A" }).click();
  const checks = page.getByRole("list", { name: "Exercícios" }).getByRole("button", { name: /^Marcar / });
  for (let i = 0; i < (await checks.count()); i++) await checks.nth(i).click();
  await expect(page.getByRole("dialog", { name: "Treino concluído!" })).toBeVisible();

  const b = await box(tab(page, "Medidas"));
  const hit = await page.evaluate(([x, y]) => {
    const el = document.elementFromPoint(x, y)!;
    return { party: !!el.closest(".party"), menu: !!el.closest("nav") };
  }, [b.x + b.width / 2, b.y + b.height / 2]);
  expect(hit).toEqual({ party: true, menu: false });
});
