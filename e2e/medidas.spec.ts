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

test("form rows at 360", async ({ page }) => {
  await openForm(page);
  const cintura = page.getByRole("textbox", { name: "Cintura em cm" });
  await cintura.fill("680");
  await cintura.blur();
  const rowOf = (name: string) => page.getByRole("group", { name, exact: true });
  await rowOf("Cintura").getByRole("button", { name: "onde medir" }).click();
  const mid = (b: { y: number; height: number }) => b.y + b.height / 2;
  const beside = (left: { x: number; width: number; y: number; height: number }, right: { x: number; y: number; height: number }, what: string) => {
    expect(left.x + left.width, what).toBeLessThanOrEqual(right.x);
    expect(mid(left), what).toBeGreaterThanOrEqual(right.y);
    expect(mid(left), what).toBeLessThanOrEqual(right.y + right.height);
  };

  for (const [name, unit] of [["Peso", "kg"], ["Busto", "cm"], ["Cintura", "cm"], ["Abdômen", "cm"], ["Quadril", "cm"]]) {
    const label = await box(rowOf(name).getByText(name, { exact: true }));
    const field = await box(page.getByRole("textbox", { name: `${name} em ${unit}` }).locator("xpath=ancestor::label[1]"));
    beside(label, field, name);
    expect(Math.abs(field.width - 120), name).toBeLessThanOrEqual(1);
  }

  beside(await box(page.getByText("Data", { exact: true })), await box(page.getByLabel("Data")), "Data");
  beside(await box(page.getByRole("heading", { name: "Nova medição" })), await box(medidas(page).getByRole("button", { name: "Fechar", exact: true })), "header");

  const label = await box(rowOf("Cintura").getByText("Cintura", { exact: true }));
  const field = await box(cintura.locator("xpath=ancestor::label[1]"));
  const whereButton = rowOf("Cintura").getByRole("button", { name: "fechar" });
  const where = await box(whereButton);
  // The cue box is the region "onde medir" controls; its text sits inside the box's padding.
  const cueBox = page.locator(`#${await whereButton.getAttribute("aria-controls")}`);
  await expect(cueBox).toContainText("Fita reta, sem apertar.");
  const cue = await box(cueBox);
  const err = await box(rowOf("Cintura").getByText("Confira este valor"));
  expect(field.y + field.height).toBeLessThanOrEqual(where.y);
  expect(where.y + where.height).toBeLessThanOrEqual(cue.y);
  expect(cue.y + cue.height).toBeLessThanOrEqual(err.y);
  for (const [what, b] of [["onde medir", where], ["cue", cue], ["message", err]] as const) {
    expect(Math.abs(b.x - label.x), what).toBeLessThanOrEqual(1);
  }
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
