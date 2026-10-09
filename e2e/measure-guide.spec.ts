import { expect, test, type Locator, type Page } from "@playwright/test";

// MeasureGuide slice: what jsdom cannot see - the drawing's colours and strokes, and the box's arrangement.
test.use({ viewport: { width: 360, height: 740 } });

const box = async (l: Locator) => (await l.boundingBox())!;
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};
const css = (l: Locator, prop: string) => l.evaluate((e, p) => getComputedStyle(e).getPropertyValue(p), prop);

const TAPE = { light: "#3f9a4a", dark: "#6cc677" };
const PAD = { light: "#f3c3cb", dark: "#5a2632" };
const FIG = { light: "#7a2a36", dark: "#ffc9d1" };
const CHERRY = { light: "#b3122e", dark: "#ff5c75" };
const BLUSH = { light: "#ffe1e6", dark: "#3a141c" };
const ROWS = ["Busto", "Cintura", "Abdômen", "Quadril", "Braço", "Coxa", "Panturrilha"];

const row = (page: Page, name: string) => page.getByRole("group", { name, exact: true });

async function openForm(page: Page) {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Menu" }).getByRole("button", { name: "Medidas" }).click();
  await page.getByRole("region", { name: "Medidas" }).getByRole("button", { name: "Abrir" }).click();
}

/** Opens the row's guide and returns the box "onde medir" controls. */
async function openGuide(page: Page, name: string) {
  await row(page, name).getByRole("button", { name: "onde medir" }).click();
  const id = await row(page, name).getByRole("button", { name: "fechar" }).getAttribute("aria-controls");
  return page.locator(`[id="${id}"]`);
}

for (const scheme of ["light", "dark"] as const) {
  test(`guide colours - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await openForm(page);
    const guide = await openGuide(page, "Cintura");
    const svg = guide.getByRole("img", { name: "Onde medir: cintura" });
    expect((await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--tape"))).trim()).toBe(TAPE[scheme]);
    expect(await css(svg.locator("path").nth(0), "fill")).toBe(rgb(PAD[scheme]));
    for (let i = 1; i <= 3; i++) expect(await css(svg.locator("path").nth(i), "stroke"), `line ${i}`).toBe(rgb(FIG[scheme]));
    expect(await css(svg.locator("circle").nth(0), "fill")).toBe(rgb(FIG[scheme]));
    expect(await css(svg.locator("circle").nth(1), "fill")).toBe(rgb(CHERRY[scheme]));
    expect(await css(svg.locator("ellipse"), "stroke")).toBe(rgb(TAPE[scheme]));
    expect(await css(guide, "background-color")).toBe(rgb(BLUSH[scheme]));
  });
}

test("drawing strokes", async ({ page }) => {
  await openForm(page);
  const svg = (await openGuide(page, "Cintura")).getByRole("img");
  for (let i = 1; i <= 3; i++) {
    const line = svg.locator("path").nth(i);
    expect(await css(line, "fill"), `line ${i}`).toBe("none");
    expect(await css(line, "stroke-width"), `line ${i}`).toBe("2.5px");
    expect(await css(line, "stroke-linecap"), `line ${i}`).toBe("round");
    expect(await css(line, "stroke-linejoin"), `line ${i}`).toBe("round");
  }
  const tape = svg.locator("ellipse");
  expect(await css(tape, "fill")).toBe("none");
  expect(await css(tape, "stroke-width")).toBe("3.5px");
  expect(await css(tape, "stroke-dasharray")).toBe("5px, 3px");
  expect(await css(tape, "stroke-linecap")).toBe("round");
});

test("guide box arrangement at 360", async ({ page }) => {
  await openForm(page);
  for (const name of ROWS) {
    const guide = await openGuide(page, name);
    await guide.scrollIntoViewIfNeeded();
    expect(await css(guide, "display"), name).toBe("grid");
    expect((await css(guide, "grid-template-columns")).split(" ")[0], name).toBe("96px");
    expect(await css(guide, "column-gap"), name).toBe("12px");
    expect(await css(guide, "align-items"), name).toBe("center");
    for (const c of ["top-left", "top-right", "bottom-left", "bottom-right"]) {
      expect(await css(guide, `border-${c}-radius`), `${name} ${c}`).toBe("18px");
    }
    expect(await css(guide, "padding-top"), name).toBe("10px");
    expect(await css(guide, "padding-bottom"), name).toBe("10px");
    expect(await css(guide, "padding-left"), name).toBe("12px");
    expect(await css(guide, "padding-right"), name).toBe("12px");

    const g = await box(guide);
    const r = await box(row(page, name));
    expect(Math.abs(g.x - r.x), name).toBeLessThanOrEqual(1);
    expect(Math.abs(g.x + g.width - (r.x + r.width)), name).toBeLessThanOrEqual(1);

    const svg = guide.getByRole("img");
    const d = await box(svg);
    expect(Math.abs(d.width - 96), name).toBeLessThanOrEqual(0.5);
    expect(Math.abs(d.height - 160), name).toBeLessThanOrEqual(0.5);
    expect(await css(svg, "display"), name).toBe("block");

    const p = guide.locator("p");
    const t = await box(p);
    expect(t.x, name).toBeGreaterThanOrEqual(d.x + 96 + 12 - 1);
    expect(Math.abs(t.y + t.height / 2 - (d.y + d.height / 2)), name).toBeLessThanOrEqual(1);
    for (const side of ["top", "right", "bottom", "left"]) expect(await css(p, `margin-${side}`), `${name} ${side}`).toBe("0px");
    expect(await css(p, "font-size"), name).toBe("14px");
    expect(await css(p, "line-height"), name).toBe("19.6px");
  }
});

test("no horizontal scroll with a guide open", async ({ page }) => {
  await openForm(page);
  for (const name of ROWS) {
    await openGuide(page, name);
    const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(scroll, name).toBeLessThanOrEqual(client);
  }
});
