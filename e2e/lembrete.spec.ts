import { expect, test, type Locator, type Page } from "@playwright/test";

// Lembrete slice: what jsdom cannot see - the card's and the setting's arrangement and colours.
test.use({ viewport: { width: 360, height: 740 } });

const box = async (l: Locator) => (await l.boundingBox())!;
const card = (page: Page) => page.getByRole("region", { name: "Lembrete de medidas" });
const intervals = (page: Page) => page.getByRole("group", { name: "Lembrar a cada" });

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};

const BERRY = { light: "#e8304a", dark: "#ff4a64" };
const CHERRY = { light: "#b3122e", dark: "#ff5c75" };
const LINE = { light: "#f6d3d9", dark: "#45202a" };

async function medidas(page: Page) {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Menu" }).getByRole("button", { name: "Medidas" }).click();
}

test("card arrangement at 360", async ({ page }) => {
  await page.goto("/");
  const icon = await box(card(page).locator("svg"));
  const title = await box(card(page).getByText("Hora da primeira medição"));
  const detail = await box(card(page).getByText("Ela vira o seu ponto de partida."));
  const textTop = title.y;
  const textBottom = detail.y + detail.height;
  expect(icon.x + icon.width).toBeLessThanOrEqual(title.x);
  const iconMid = icon.y + icon.height / 2;
  expect(iconMid).toBeGreaterThanOrEqual(textTop);
  expect(iconMid).toBeLessThanOrEqual(textBottom);

  const measure = await box(card(page).getByRole("button", { name: "Medir agora" }));
  const snooze = await box(card(page).getByRole("button", { name: "Hoje não" }));
  expect(measure.x + measure.width).toBeLessThanOrEqual(snooze.x);
  expect(Math.abs(measure.y - snooze.y)).toBeLessThanOrEqual(1);
  for (const b of [measure, snooze]) {
    expect(b.y).toBeGreaterThanOrEqual(textBottom);
    expect(b.height).toBeGreaterThanOrEqual(44);
  }

  const c = await box(card(page));
  const streak = await box(page.getByRole("region", { name: "Sequência" }));
  expect(c.y + c.height).toBeLessThanOrEqual(streak.y);
});

for (const scheme of ["light", "dark"] as const) {
  test(`card border colour - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await expect(card(page)).toHaveCSS("border-top-style", "dashed");
    await expect(card(page)).toHaveCSS("border-top-color", rgb(BERRY[scheme]));
  });

  test(`pressed interval colour - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await medidas(page);
    await expect(intervals(page).getByRole("button", { name: "7 dias" })).toHaveAttribute("aria-pressed", "true");
    await expect(intervals(page).getByRole("button", { name: "7 dias" })).toHaveCSS("border-top-color", rgb(CHERRY[scheme]));
    await expect(intervals(page).getByRole("button", { name: "14 dias" })).toHaveCSS("border-top-color", rgb(LINE[scheme]));
  });
}

test("setting arrangement at 360", async ({ page }) => {
  await medidas(page);
  const heading = await box(page.getByRole("heading", { name: "Lembrete" }));
  const names = ["7 dias", "14 dias", "30 dias"];
  const pills = await Promise.all(names.map((name) => box(intervals(page).getByRole("button", { name }))));
  expect(heading.y + heading.height).toBeLessThanOrEqual(pills[0].y);
  for (let i = 1; i < pills.length; i++) {
    expect(Math.abs(pills[i].y - pills[0].y), names[i]).toBeLessThanOrEqual(1);
    expect(pills[i - 1].x + pills[i - 1].width, names[i]).toBeLessThanOrEqual(pills[i].x);
  }
  const all = await Promise.all(
    [...names, "Não lembrar"].map((name) => box(intervals(page).getByRole("button", { name }))),
  );
  const section = page.getByRole("region", { name: "Lembrete" });
  const hint = await box(section.locator("p.hint"));
  for (const b of all) expect(hint.y).toBeGreaterThanOrEqual(b.y + b.height);

  const form = await box(page.getByRole("region", { name: "Nova medição" }));
  const s = await box(section);
  expect(s.y).toBeGreaterThanOrEqual(form.y + form.height);
});

test("card text stacks at 360", async ({ page }) => {
  await page.goto("/");
  const title = await box(card(page).getByText("Hora da primeira medição"));
  const detail = await box(card(page).getByText("Ela vira o seu ponto de partida."));
  expect(title.y + title.height).toBeLessThanOrEqual(detail.y);
  expect(Math.abs(title.x - detail.x)).toBeLessThanOrEqual(1);
  await expect(card(page).getByRole("button")).toHaveText(["Medir agora", "Hoje não"]);
});

for (const scheme of ["light", "dark"] as const) {
  test(`card border width and icon colour - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await expect(card(page)).toHaveCSS("border-top-width", "2px");
    await expect(card(page).locator("svg")).toHaveCSS("color", rgb(BERRY[scheme]));
  });

  test(`pressed interval text - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await medidas(page);
    for (const name of ["7 dias", "14 dias", "30 dias", "Não lembrar"]) {
      await expect(intervals(page).getByRole("button", { name }), name).toHaveCSS("border-top-width", "2px");
    }
    const pressed = intervals(page).getByRole("button", { name: "7 dias" });
    await expect(pressed).toHaveAttribute("aria-pressed", "true");
    await expect(pressed).toHaveCSS("color", rgb(CHERRY[scheme]));
    await expect(pressed).toHaveCSS("font-weight", "500");
    await expect(intervals(page).getByRole("button", { name: "14 dias" })).toHaveCSS("font-weight", "400");
  });
}
