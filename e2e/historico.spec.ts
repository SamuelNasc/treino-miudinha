import { expect, test, type Locator, type Page } from "@playwright/test";

// Histórico slice: what jsdom cannot see - the rows' arrangement, type and colours.
test.use({ viewport: { width: 360, height: 740 } });

const box = async (l: Locator) => (await l.boundingBox())!;
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};

const CHERRY = { light: "#b3122e", dark: "#ff5c75" };
const MUTED = { light: "#8d5a63", dark: "#d59aa4" };
const BLUSH = { light: "#ffe1e6", dark: "#3a141c" };
const LINE = { light: "#f6d3d9", dark: "#45202a" };
const ON_ACCENT = { light: "#ffffff", dark: "#1c0a0e" };
const TRANSPARENT = "rgba(0, 0, 0, 0)";

const TWO = { date: "2026-09-30", values: { peso: 62.6, cintura: 71.6 } };
const PESO = { date: "2026-09-23", values: { peso: 62.9 } };

const section = (page: Page) => page.getByRole("region", { name: "Histórico" });
const item = (page: Page, date: string) => section(page).getByRole("listitem").filter({ has: page.getByTestId("hist-date").getByText(date, { exact: true }) });
const rowButton = (page: Page, date: string) => item(page, date).locator("button.row-head");

// Seeds the stored record and fixes the clock at 2026-10-08, then opens Medidas.
async function medidas(page: Page, measurements: unknown[] = [TWO, PESO].reverse()) {
  await page.clock.setFixedTime(new Date("2026-10-08T10:00:00-03:00"));
  await page.addInitScript((m) => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    const record = { version: 1, completions: [], today: { date: "2026-10-08", workout: null, checked: [] }, weights: {}, restSeconds: 90, measurements: m };
    localStorage.setItem("treino:v1", JSON.stringify(record));
  }, measurements);
  await page.goto("/");
  await page.getByRole("navigation", { name: "Menu" }).getByRole("button", { name: "Medidas" }).click();
}

async function openRow(page: Page, date: string) {
  await rowButton(page, date).click();
  await expect(rowButton(page, date)).toHaveAttribute("aria-expanded", "true");
}

test("closed row arrangement at 360", async ({ page }) => {
  await medidas(page);
  for (const date of ["30/09", "23/09"]) {
    const row = await box(rowButton(page, date));
    const d = await box(rowButton(page, date).getByTestId("hist-date"));
    const sum = await box(rowButton(page, date).getByTestId("hist-sum"));
    const chev = await box(rowButton(page, date).locator("svg"));
    expect(d.x + d.width, date).toBeLessThanOrEqual(sum.x);
    expect(sum.x + sum.width, date).toBeLessThanOrEqual(chev.x);
    expect(Math.abs(chev.x + chev.width - (row.x + row.width)), date).toBeLessThanOrEqual(1);
    const mids = [d, sum, chev].map((b) => b.y + b.height / 2);
    expect(Math.max(...mids) - Math.min(...mids), date).toBeLessThanOrEqual(2);
    expect(row.height, date).toBeGreaterThanOrEqual(44);
  }
  expect((await box(rowButton(page, "30/09"))).y).toBeLessThan((await box(rowButton(page, "23/09"))).y);
});

test("open row arrangement at 360", async ({ page }) => {
  await medidas(page);
  await openRow(page, "30/09");
  const li = item(page, "30/09");
  const panel = await box(li.locator("dl"));
  const lines = li.locator("dl > div");
  await expect(lines).toHaveCount(2);
  let prevBottom = -Infinity;
  for (let i = 0; i < 2; i++) {
    const line = await box(lines.nth(i));
    const dt = await box(lines.nth(i).locator("dt"));
    const dd = await box(lines.nth(i).locator("dd"));
    expect(dt.x + dt.width).toBeLessThanOrEqual(dd.x);
    expect(panel.x + panel.width - (dd.x + dd.width)).toBeLessThanOrEqual(16);
    expect(line.y).toBeGreaterThanOrEqual(prevBottom);
    prevBottom = line.y + line.height;
  }
  const editar = await box(li.getByRole("button", { name: "Editar" }));
  const apagar = await box(li.getByRole("button", { name: "Apagar" }));
  const liBox = await box(li);
  expect(editar.x + editar.width).toBeLessThanOrEqual(apagar.x);
  expect(Math.abs(editar.y - apagar.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(apagar.x + apagar.width - (liBox.x + liBox.width))).toBeLessThanOrEqual(1);
  for (const b of [editar, apagar]) {
    expect(b.y).toBeGreaterThanOrEqual(panel.y + panel.height);
    expect(b.height).toBeGreaterThanOrEqual(44);
  }

  await li.getByRole("button", { name: "Apagar" }).click();
  const confirm = page.getByRole("group", { name: "Apagar a medição de 30/09?" });
  const c = await box(confirm);
  expect(c.y).toBeGreaterThanOrEqual(apagar.y + apagar.height);
  const yes = await box(confirm.getByRole("button", { name: "Apagar" }));
  const no = await box(confirm.getByRole("button", { name: "Cancelar" }));
  expect(yes.x + yes.width).toBeLessThanOrEqual(no.x);
});

for (const scheme of ["light", "dark"] as const) {
  test(`historico colours - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await medidas(page);
    const li = item(page, "30/09");
    await expect(li).toHaveCSS("border-top-color", rgb(LINE[scheme]));
    await expect(item(page, "23/09")).toHaveCSS("border-top-color", rgb(LINE[scheme]));
    await expect(rowButton(page, "30/09").getByTestId("hist-sum")).toHaveCSS("color", rgb(MUTED[scheme]));
    await expect(rowButton(page, "30/09").locator("svg")).toHaveCSS("color", rgb(CHERRY[scheme]));
    await openRow(page, "30/09");
    await expect(li.locator("dl")).toHaveCSS("background-color", rgb(BLUSH[scheme]));
    await expect(li.locator("dt").first()).toHaveCSS("color", rgb(MUTED[scheme]));
    for (const name of ["Editar", "Apagar"]) {
      const b = li.getByRole("button", { name });
      await expect(b, name).toHaveCSS("color", rgb(CHERRY[scheme]));
      await expect(b, name).toHaveCSS("background-color", TRANSPARENT);
    }
    await li.getByRole("button", { name: "Apagar" }).click();
    const confirm = page.getByRole("group", { name: "Apagar a medição de 30/09?" });
    await expect(confirm).toHaveCSS("background-color", rgb(BLUSH[scheme]));
    const yes = confirm.getByRole("button", { name: "Apagar" });
    await expect(yes).toHaveCSS("background-color", rgb(CHERRY[scheme]));
    await expect(yes).toHaveCSS("color", rgb(ON_ACCENT[scheme]));
    const no = confirm.getByRole("button", { name: "Cancelar" });
    await expect(no).toHaveCSS("color", rgb(MUTED[scheme]));
    await expect(no).toHaveCSS("border-top-color", rgb(LINE[scheme]));
  });

  test(`historico colours, empty - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await medidas(page, []);
    await expect(section(page).getByText("Nenhuma medição ainda.")).toHaveCSS("color", rgb(MUTED[scheme]));
    await expect(section(page).getByRole("button", { name: "Fazer a primeira" })).toHaveCSS("background-color", rgb(CHERRY[scheme]));
  });
}

test("historico type and boxes", async ({ page }) => {
  await medidas(page);
  await expect(page.getByRole("heading", { name: "Histórico" })).toHaveCSS("font-size", "22px");
  const date = rowButton(page, "30/09").getByTestId("hist-date");
  expect(await date.evaluate((e) => getComputedStyle(e).fontFamily)).toMatch(/^"?Fredoka/);
  await expect(date).toHaveCSS("font-weight", "600");
  await expect(date).toHaveCSS("font-size", "17px");
  await expect(rowButton(page, "30/09").getByTestId("hist-sum")).toHaveCSS("font-size", "14px");
  const chev = rowButton(page, "30/09").locator("svg");
  const chevBox = await box(chev);
  expect(chevBox.width).toBe(16);
  expect(chevBox.height).toBe(16);
  await expect(chev).toHaveCSS("transform", "none");
  await expect(item(page, "30/09")).toHaveCSS("border-top-width", "1px");

  await openRow(page, "30/09");
  await expect(chev).not.toHaveCSS("transform", "none");
  const li = item(page, "30/09");
  const panel = li.locator("dl");
  await expect(panel).toHaveCSS("border-radius", "14px");
  await expect(panel).toHaveCSS("padding-top", "12px");
  await expect(panel).toHaveCSS("padding-left", "14px");
  const lines = li.locator("dl > div");
  await expect(lines.first()).toHaveCSS("font-size", "15px");
  await expect(lines.first().locator("dd")).toHaveCSS("font-weight", "700");
  await expect(lines.nth(0)).toHaveCSS("border-top-width", "0px");
  await expect(lines.nth(1)).toHaveCSS("border-top-width", "1px");
  for (const name of ["Editar", "Apagar"]) {
    const b = li.getByRole("button", { name });
    await expect(b, name).toHaveCSS("font-size", "14px");
    await expect(b, name).toHaveCSS("font-weight", "500");
    await expect(b, name).toHaveCSS("border-top-width", "0px");
  }

  await li.getByRole("button", { name: "Apagar" }).click();
  const confirm = page.getByRole("group", { name: "Apagar a medição de 30/09?" });
  await expect(confirm).toHaveCSS("border-radius", "14px");
  await expect(confirm).toHaveCSS("font-size", "14px");
  const yes = confirm.getByRole("button", { name: "Apagar" });
  await expect(yes).toHaveCSS("font-weight", "500");
  const radius = parseFloat(await yes.evaluate((e) => getComputedStyle(e).borderTopLeftRadius));
  expect(radius).toBeGreaterThanOrEqual((await box(yes)).height / 2);
  // Chromium reports a 1.5px border as "1px" in computed style, so read what the matching rules declare,
  // in cascade order (the layers come in the same order as the sheet). A shorthand holding var() leaves
  // its longhands empty, so the width is read from the shorthand text too.
  const declared = await confirm.getByRole("button", { name: "Cancelar" }).evaluate((el) => {
    const found: [string, string][] = [];
    const widthOf = (style: CSSStyleDeclaration) => {
      if (style.borderTopWidth) return style.borderTopWidth;
      for (const prop of ["border-top", "border-width", "border"]) {
        const token = style.getPropertyValue(prop).split(/\s+/).find((t) => /^(\d*\.?\d+px|0)$/.test(t));
        if (token) return token === "0" ? "0px" : token;
      }
      return "";
    };
    const walk = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule) {
          const width = el.matches(rule.selectorText) ? widthOf(rule.style) : "";
          if (width) found.push([rule.selectorText, width]);
        } else if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules);
      }
    };
    for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules);
    return found;
  });
  expect(declared.at(-1)).toEqual([".ghost", "1.5px"]);
});

test("empty state arrangement at 360", async ({ page }) => {
  await medidas(page, []);
  const s = await box(section(page));
  const text = section(page).getByText("Nenhuma medição ainda.");
  const t = await box(text);
  const b = await box(section(page).getByRole("button", { name: "Fazer a primeira" }));
  expect(t.y + t.height).toBeLessThanOrEqual(b.y);
  const centre = s.x + s.width / 2;
  expect(Math.abs(t.x + t.width / 2 - centre)).toBeLessThanOrEqual(2);
  expect(Math.abs(b.x + b.width / 2 - centre)).toBeLessThanOrEqual(2);
  await expect(text).toHaveCSS("text-align", "center");
  expect(b.height).toBeGreaterThanOrEqual(44);
});

const SURFACE = { light: "#ffffff", dark: "#2a1016" };
const css = (l: Locator, prop: string) => l.evaluate((e, p) => getComputedStyle(e).getPropertyValue(p), prop);

test("list pinned to the card", async ({ page }) => {
  await medidas(page);
  const list = section(page).getByRole("list");
  await expect(list).toHaveCSS("list-style-type", "none");
  for (const side of ["top", "right", "bottom", "left"]) {
    await expect(list, side).toHaveCSS(`margin-${side}`, "0px");
    await expect(list, side).toHaveCSS(`padding-${side}`, "0px");
  }
  const heading = await box(page.getByRole("heading", { name: "Histórico" }));
  const s = await box(section(page));
  const contentRight = s.x + s.width - parseFloat(await css(section(page), "padding-right"));
  for (const date of ["30/09", "23/09"]) {
    const li = item(page, date);
    const r = await box(li);
    expect(Math.abs(r.x - heading.x), date).toBeLessThanOrEqual(1);
    expect(Math.abs(r.x + r.width - contentRight), date).toBeLessThanOrEqual(1);
    await expect(li, date).toHaveCSS("border-top-style", "solid");
    const head = rowButton(page, date);
    await expect(head, date).toHaveCSS("text-align", "left");
    await expect(head, date).toHaveCSS("background-color", TRANSPARENT);
    await expect(head, date).toHaveCSS("border-top-left-radius", "10px");
    const d = await box(head.getByTestId("hist-date"));
    const hb = await box(head);
    expect(Math.abs(d.x - hb.x), date).toBeLessThanOrEqual(1);
  }
});

for (const scheme of ["light", "dark"] as const) {
  test(`values panel and chevron - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await medidas(page);
    await openRow(page, "30/09");
    // The chevron turns over a 0.2s transition, so wait for it to settle before reading the matrix.
    const chev = rowButton(page, "30/09").locator("svg");
    const matrix = async () => (await css(chev, "transform")).match(/matrix\(([^)]+)\)/)?.[1].split(",").map(Number) ?? [];
    await expect.poll(async () => (await matrix())[0]).toBeLessThan(-0.999);
    const [a, b, c, d] = await matrix();
    expect(Math.abs(a + 1)).toBeLessThan(0.001);
    expect(Math.abs(d + 1)).toBeLessThan(0.001);
    expect(Math.abs(b)).toBeLessThan(0.001);
    expect(Math.abs(c)).toBeLessThan(0.001);
    const li = item(page, "30/09");
    const panel = li.locator("dl");
    for (const side of ["top", "right", "bottom", "left"]) await expect(panel, side).toHaveCSS(`margin-${side}`, "0px");
    expect(["0px", "normal"]).toContain(await css(panel, "row-gap"));
    const lines = li.locator("dl > div");
    for (let i = 0; i < 2; i++) await expect(lines.nth(i)).toHaveCSS("column-gap", "8px");
    await expect(lines.nth(1)).toHaveCSS("border-top-style", "solid");
    await expect(lines.nth(1)).toHaveCSS("border-top-color", rgb(LINE[scheme]));
    for (let i = 0; i < 2; i++) await expect(lines.nth(i).locator("dd")).toHaveCSS("margin-left", "0px");
  });

  test(`confirm and empty buttons - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await medidas(page);
    await openRow(page, "30/09");
    await item(page, "30/09").getByRole("button", { name: "Apagar" }).click();
    const confirm = page.getByRole("group", { name: "Apagar a medição de 30/09?" });
    await expect(confirm).toHaveCSS("align-items", "center");
    await expect(confirm.getByRole("button", { name: "Apagar" })).toHaveCSS("border-top-width", "0px");
    const no = confirm.getByRole("button", { name: "Cancelar" });
    await expect(no).toHaveCSS("border-top-style", "solid");
    await expect(no).toHaveCSS("background-color", rgb(SURFACE[scheme]));
    await expect(no).toHaveCSS("font-size", "14px");

    await page.evaluate(() => localStorage.removeItem("treino:v1"));
    await page.reload();
    await page.getByRole("navigation", { name: "Menu" }).getByRole("button", { name: "Medidas" }).click();
    const first = section(page).getByRole("button", { name: "Fazer a primeira" });
    await expect(first).toHaveCSS("border-top-width", "0px");
    await expect(first).toHaveCSS("color", rgb(ON_ACCENT[scheme]));
    const radius = parseFloat(await css(first, "border-top-left-radius"));
    expect(radius).toBeGreaterThanOrEqual((await box(first)).height / 2);
    await expect(first).toHaveCSS("padding-top", "9px");
    await expect(first).toHaveCSS("padding-left", "18px");
    expect(await css(first, "font-family")).toMatch(/^"?Fredoka/);
    await expect(first).toHaveCSS("font-weight", "600");
    await expect(first).toHaveCSS("font-size", "16px");
    for (const side of ["top", "right", "bottom", "left"]) await expect(first, side).toHaveCSS(`margin-${side}`, "0px");
  });

  test(`empty state divider - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await medidas(page, []);
    const empty = section(page).getByText("Nenhuma medição ainda.").locator("xpath=..");
    await expect(empty).toHaveCSS("border-top-width", "1px");
    await expect(empty).toHaveCSS("border-top-style", "solid");
    await expect(empty).toHaveCSS("border-top-color", rgb(LINE[scheme]));
    await expect(empty).toHaveCSS("padding-top", "4px");
    await expect(empty).toHaveCSS("padding-bottom", "8px");
    const heading = await box(page.getByRole("heading", { name: "Histórico" }));
    expect((await box(empty)).y).toBeGreaterThanOrEqual(heading.y + heading.height);
  });
}
