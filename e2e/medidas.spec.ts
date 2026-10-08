import { expect, test, type Locator, type Page } from "@playwright/test";

// Registrar medição slice: what jsdom cannot see - the form's arrangement and the mark colour.
test.use({ viewport: { width: 360, height: 740 } });

const box = async (l: Locator) => (await l.boundingBox())!;
const medidas = (page: Page) => page.getByRole("region", { name: "Medidas" });

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};

async function openForm(page: Page) {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Menu" }).getByRole("button", { name: "Medidas" }).click();
  await medidas(page).getByRole("button", { name: "Abrir" }).click();
}

test("form arrangement at 360", async ({ page }) => {
  await openForm(page);
  for (const name of ["Braço", "Coxa", "Panturrilha"]) {
    const d = await box(page.getByRole("textbox", { name: `${name} D em cm` }).locator("xpath=ancestor::label[1]"));
    const e = await box(page.getByRole("textbox", { name: `${name} E em cm` }).locator("xpath=ancestor::label[1]"));
    expect(d.x + d.width, name).toBeLessThanOrEqual(e.x);
    expect(Math.abs(d.y - e.y), name).toBeLessThanOrEqual(1);
  }

  const save = page.getByRole("button", { name: "Salvar medição" });
  const form = await box(page.getByRole("form", { name: "Nova medição" }));
  const s = await box(save);
  expect(Math.abs(s.x - form.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(s.x + s.width - (form.x + form.width))).toBeLessThanOrEqual(1);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const after = await box(save);
  const timer = await box(page.getByRole("group", { name: "Descanso" }));
  expect(after.y + after.height).toBeLessThanOrEqual(timer.y);
});

const BERRY = { light: "#e8304a", dark: "#ff4a64" } as const;

for (const scheme of ["light", "dark"] as const) {
  test(`bad value border colour - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await openForm(page);
    const peso = page.getByRole("textbox", { name: "Peso em kg" });
    await peso.fill("680");
    await peso.blur();
    await expect(peso).toHaveAttribute("aria-invalid", "true");
    await expect(peso.locator("xpath=ancestor::label[1]")).toHaveCSS("border-top-color", rgb(BERRY[scheme]));
    await expect(page.getByRole("textbox", { name: "Busto em cm" }).locator("xpath=ancestor::label[1]")).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
  });
}
