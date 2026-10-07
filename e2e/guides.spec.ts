import { expect, test, type Page } from "@playwright/test";

const TOKENS = {
  light: { "--fig": "#7a2a36", "--mach": "#b98a92", "--pad": "#f3c3cb" },
  dark: { "--fig": "#ffc9d1", "--mach": "#9a6670", "--pad": "#5a2632" },
} as const;

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};

async function openHack(page: Page) {
  await page.goto("/");
  await page.getByRole("group", { name: "Escolher treino" }).getByRole("button", { name: "Treino C" }).click();
  await page.getByRole("button", { name: /^Hack / }).click();
  return page.getByRole("img", { name: "Desenho do exercício Hack" });
}

const box = async (l: ReturnType<Page["locator"]>) => (await l.boundingBox())!;

for (const scheme of ["light", "dark"] as const) {
  test(`drawing tokens in light and dark - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    const img = await openHack(page);
    const tokens = await page.evaluate(
      (names) => names.map((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim()),
      Object.keys(TOKENS[scheme]),
    );
    expect(tokens).toEqual(Object.values(TOKENS[scheme]));

    const head = img.locator("g:not(.ghost) > circle.head");
    await expect(head).toHaveCSS("fill", rgb(TOKENS[scheme]["--fig"]));
    const outline = img.locator("path.mach.line").first();
    await expect(outline).toHaveCSS("stroke", rgb(TOKENS[scheme]["--mach"]));
  });
}

test("only the start pose is faded", async ({ page }) => {
  const img = await openHack(page);
  await expect(img.locator("g.ghost")).toHaveCSS("opacity", "0.28");
  await expect(img.locator("g:not(.ghost)")).toHaveCSS("opacity", "1");
  await expect(page.getByRole("button", { name: "Exportar backup" })).toHaveClass(/\bghost\b/);
  await expect(page.getByRole("button", { name: "Exportar backup" })).toHaveCSS("opacity", "1");
  const importer = page.getByText("Importar backup");
  await expect(importer).toHaveClass(/\bghost\b/);
  await expect(importer).toHaveCSS("opacity", "1");
});

test("guide opens inside the row", async ({ page }) => {
  const img = await openHack(page);
  const region = page.getByRole("region", { name: "Como faz Hack" });
  const cue = region.getByRole("paragraph");
  expect((await box(img)).y + (await box(img)).height).toBeLessThanOrEqual((await box(cue)).y);
  const start = await box(region.getByText("começo"));
  const end = await box(region.getByText("fim"));
  expect(start.x + start.width).toBeLessThanOrEqual(end.x);
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("guide spans the row below", async ({ page }) => {
    await openHack(page);
    const check = await box(page.getByRole("button", { name: "Marcar Hack" }));
    const name = await box(page.getByRole("button", { name: /^Hack / }));
    const weight = await box(page.getByRole("textbox", { name: "Carga de Hack em kg" }).locator(".."));
    const region = await box(page.getByRole("region", { name: "Como faz Hack" }));

    for (const control of [check, name, weight]) expect(region.y).toBeGreaterThanOrEqual(control.y + control.height);
    expect(Math.abs(region.x - check.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(region.x + region.width - (weight.x + weight.width))).toBeLessThanOrEqual(1);
  });
});

test.describe("dark", () => {
  test.use({ colorScheme: "dark" });

  test("every guide in dark mode", async ({ page }) => {
    await page.goto("/");
    const picker = page.getByRole("group", { name: "Escolher treino" });
    const seen = new Set<string>();
    for (const w of ["A", "B", "C", "D"]) {
      await picker.getByRole("button", { name: `Treino ${w}` }).click();
      for (const name of await page.getByTestId("ex-name").allTextContents()) {
        await page.getByRole("button", { name: new RegExp(`^${name} `) }).click();
        const img = page.getByRole("img", { name: `Desenho do exercício ${name}` });
        await expect(img.locator("g:not(.ghost) > circle.head")).toHaveCSS("fill", rgb(TOKENS.dark["--fig"]));
        const b = await img.boundingBox();
        expect(b && b.width > 0 && b.height > 0, name).toBe(true);
        await expect(img).toBeVisible();
        seen.add(name);
      }
    }
    expect(seen.size).toBe(28);
  });
});

// Mockup v4's colour for every drawing part (tests/fixtures/mockup-v4.html, `.mach` to `.move-head`).
const PART_COLOURS = {
  light: { leaf: "#3f9a4a", berry: "#e8304a", cherry: "#b3122e", surface: "#ffffff", ...TOKENS.light },
  dark: { leaf: "#6cc677", berry: "#ff4a64", cherry: "#ff5c75", surface: "#2a1016", ...TOKENS.dark },
} as const;

for (const scheme of ["light", "dark"] as const) {
  test(`every drawing part in its colour - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    const c = PART_COLOURS[scheme];
    const hack = await openHack(page);
    const solid = hack.locator("g:not(.ghost)");
    const parts: [ReturnType<Page["locator"]>, string, string][] = [
      [hack.locator("path.move").first(), "stroke", c.leaf],
      [hack.locator("polygon.move-head").first(), "fill", c.leaf],
      [solid.locator(".torso"), "stroke", c.berry],
      [solid.locator("circle.bun"), "fill", c.cherry],
      [solid.locator("circle.head"), "fill", c["--fig"]],
      [solid.locator("polyline.limb").first(), "stroke", c["--fig"]],
      [hack.locator("path.mach.pad"), "stroke", c["--pad"]],
      [hack.locator("path.mach.line").first(), "stroke", c["--mach"]],
      [hack.locator("path.floor"), "stroke", c["--mach"]],
    ];
    for (const [part, prop, hex] of parts) await expect(part, `${prop} ${hex}`).toHaveCSS(prop, rgb(hex));

    // Opening another guide closes Hack, so its parts are checked first.
    await page.getByRole("button", { name: /^Elevação pélvica / }).click();
    const pelvic = page.getByRole("img", { name: "Desenho do exercício Elevação pélvica" });
    const more: typeof parts = [
      [pelvic.locator("circle.weight").first(), "fill", c["--mach"]],
      [pelvic.locator("rect.mach").first(), "fill", c.surface],
      [pelvic.locator("rect.mach").first(), "stroke", c["--mach"]],
    ];
    for (const [part, prop, hex] of more) await expect(part, `${prop} ${hex}`).toHaveCSS(prop, rgb(hex));
  });
}
