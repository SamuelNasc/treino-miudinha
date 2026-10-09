import { expect, test, type Locator, type Page } from "@playwright/test";

// Gráfico slice: what jsdom cannot see - pointer input, the card's arrangement, type and colours.
test.use({ viewport: { width: 360, height: 740 } });

const box = async (l: Locator) => (await l.boundingBox())!;
const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};
const css = (l: Locator, prop: string) => l.evaluate((e, p) => getComputedStyle(e).getPropertyValue(p), prop);

const SURFACE = { light: "#ffffff", dark: "#2a1016" };
const INK = { light: "#3a1118", dark: "#ffe9ec" };
const BG = { light: "#fff5f6", dark: "#1c0a0e" };
const CHERRY = { light: "#b3122e", dark: "#ff5c75" };
const MUTED = { light: "#8d5a63", dark: "#d59aa4" };
const BLUSH = { light: "#ffe1e6", dark: "#3a141c" };
const LINE = { light: "#f6d3d9", dark: "#45202a" };
const S_D = { light: "#e8304a", dark: "#e8364f" };
const S_E = { light: "#8a3fb0", dark: "#a87ae0" };
const SHADOW = { light: "rgba(179, 18, 46, 0.1) 0px 6px 20px 0px", dark: "rgba(0, 0, 0, 0.35) 0px 6px 20px 0px" };

const CIN3 = [
  { date: "2026-08-27", values: { cintura: 74, peso: 64.2 } },
  { date: "2026-09-24", values: { cintura: 72.4 } },
  { date: "2026-10-01", values: { peso: 62.9 } },
  { date: "2026-10-08", values: { cintura: 71.6, peso: 62.6 } },
];
const PAIR = [
  { date: "2026-09-24", values: { "braco-d": 29, "braco-e": 28.6 } },
  { date: "2026-10-08", values: { "braco-d": 28.5, "braco-e": 28.3 } },
];
const ONE_SIDE_SINGLE = [
  { date: "2026-09-24", values: { "braco-d": 29 } },
  { date: "2026-10-08", values: { "braco-d": 28.5, "braco-e": 28.3 } },
];
const ONE = [{ date: "2026-10-08", values: { cintura: 71.6 } }];

const card = (page: Page) => page.getByRole("region", { name: "Sua evolução" });
const chart = (page: Page) => card(page).getByRole("img", { name: /^Gráfico de/ });
const chip = (page: Page, name: string) => page.getByRole("group", { name: "Escolher medida" }).getByRole("button", { name, exact: true });
const tip = (page: Page) => card(page).locator(".tip");
const cross = (page: Page) => chart(page).locator("line.cross");
const hoverDots = (page: Page) => chart(page).locator(".hover-dots circle");

// Seeds the stored record and fixes the clock at 2026-10-09, then opens Medidas.
async function medidas(page: Page, measurements: unknown[] = CIN3) {
  await page.clock.setFixedTime(new Date("2026-10-09T10:00:00-03:00"));
  await page.addInitScript((m) => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    const record = { version: 1, completions: [], today: { date: "2026-10-09", workout: null, checked: [] }, weights: {}, restSeconds: 90, measurements: m };
    localStorage.setItem("treino:v1", JSON.stringify(record));
  }, measurements);
  await page.goto("/");
  await page.getByRole("navigation", { name: "Menu" }).getByRole("button", { name: "Medidas" }).click();
}

// The card's content box: inside its padding.
async function content(l: Locator) {
  const b = await box(l);
  const [pl, pr] = await l.evaluate((e) => [parseFloat(getComputedStyle(e).paddingLeft), parseFloat(getComputedStyle(e).paddingRight)]);
  return { left: b.x + pl, right: b.x + b.width - pr, width: b.width - pl - pr };
}

async function pointAt(page: Page, edge: "left" | "right") {
  const b = await box(chart(page));
  await page.mouse.move(edge === "right" ? b.x + b.width - 1 : b.x + 1, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.up();
}

test("touching the chart shows the date", async ({ page }) => {
  await medidas(page);
  const cardBox = await box(card(page));
  const plot = await box(chart(page));
  const checkTip = async (date: string, values: string, crossX: number, dots: number) => {
    await expect(tip(page)).toBeVisible();
    await expect(tip(page)).toHaveText(`${date}${values}`);
    expect(await tip(page).locator("b").textContent()).toBe(date);
    await expect(cross(page)).toHaveAttribute("visibility", "visible");
    expect(Math.abs(Number(await cross(page).getAttribute("x1")) - crossX)).toBeLessThan(0.01);
    expect(await css(cross(page), "stroke-dasharray")).toBe("3px, 3px");
    await expect(hoverDots(page)).toHaveCount(dots);
    const t = await box(tip(page));
    expect(t.x).toBeGreaterThanOrEqual(cardBox.x);
    expect(t.x + t.width).toBeLessThanOrEqual(cardBox.x + cardBox.width);
    await tipInside(page);
    return t.x + t.width / 2 - plot.x;
  };

  await pointAt(page, "right");
  const rightCentre = await checkTip("08/10", "71,6 cm", 310, 1);
  expect(Math.abs(Number(await hoverDots(page).first().getAttribute("cx")) - 310)).toBeLessThan(0.01);
  expect(Math.abs(Number(await hoverDots(page).first().getAttribute("cy")) - 127.2)).toBeLessThan(0.01);
  expect(rightCentre).toBeLessThanOrEqual(plot.width - 50 + 0.5);
  await pointAt(page, "left");
  const leftCentre = await checkTip("27/08", "74 cm", 34, 1);
  expect(leftCentre).toBeGreaterThanOrEqual(50 - 0.5);
});

// The tip stays inside the plot, so inside the card, its centre at least 50px from each side as v6.
async function tipInside(page: Page) {
  const t = await box(tip(page));
  const plot = await box(chart(page));
  const c = await box(card(page));
  expect(t.x).toBeGreaterThanOrEqual(plot.x - 0.5);
  expect(t.x + t.width).toBeLessThanOrEqual(plot.x + plot.width + 0.5);
  expect(t.x).toBeGreaterThanOrEqual(c.x);
  expect(t.x + t.width).toBeLessThanOrEqual(c.x + c.width);
  const centre = t.x + t.width / 2 - plot.x;
  expect(centre).toBeGreaterThanOrEqual(50 - 0.5);
  expect(centre).toBeLessThanOrEqual(plot.width - 50 + 0.5);
}

const dotsAt = (page: Page) =>
  hoverDots(page).evaluateAll((cs) => cs.map((c) => [c.getAttribute("fill"), c.getAttribute("r"), Number(c.getAttribute("cx")), Number(c.getAttribute("cy"))] as const));

test("touching the chart shows the date - pair", async ({ page }) => {
  await medidas(page, PAIR);
  await chip(page, "Braço").click();
  await pointAt(page, "right");
  await expect(tip(page)).toHaveText("08/10D 28,5 cm · E 28,3 cm");
  await expect(hoverDots(page)).toHaveCount(2);
  const dots = await dotsAt(page);
  expect(dots.map(([fill, r]) => [fill, r])).toEqual([["var(--s-d)", "5"], ["var(--s-e)", "5"]]);
  for (const [i, [cx, cy]] of [[310, 108], [310, 146.4]].entries()) {
    expect(Math.abs(dots[i][2] - cx)).toBeLessThan(0.01);
    expect(Math.abs(dots[i][3] - cy)).toBeLessThan(0.01);
  }
  await tipInside(page);
  await pointAt(page, "left");
  await expect(tip(page)).toHaveText("24/09D 29 cm · E 28,6 cm");
  await tipInside(page);
});

test("touching the chart shows the date - pair with one side missing", async ({ page }) => {
  await medidas(page, ONE_SIDE_SINGLE);
  await chip(page, "Braço").click();
  await pointAt(page, "left");
  await expect(tip(page)).toHaveText("24/09D 29 cm");
  await expect(hoverDots(page)).toHaveCount(1);
  expect((await dotsAt(page)).map(([fill, r]) => [fill, r])).toEqual([["var(--s-d)", "5"]]);
  await tipInside(page);
});

test("a tap alone and a move alone each show the tip", async ({ page }) => {
  await medidas(page);
  const b = await box(chart(page));
  const y = b.y + b.height / 2;
  // A finger tap fires pointerdown with no move before it.
  await chart(page).dispatchEvent("pointerdown", { clientX: b.x + b.width - 1, clientY: y, pointerType: "touch", isPrimary: true });
  await expect(tip(page)).toHaveText("08/1071,6 cm");
  // A mouse moving over the chart with no button down.
  await page.mouse.move(b.x + 1, y);
  await expect(tip(page)).toHaveText("27/0874 cm");
});

test("leaving the chart hides the tip", async ({ page }) => {
  await medidas(page);
  await pointAt(page, "right");
  await expect(tip(page)).toBeVisible();
  await page.mouse.move(5, 5);
  await expect(tip(page)).toBeHidden();
  await expect(cross(page)).toHaveAttribute("visibility", "hidden");
  await expect(hoverDots(page)).toHaveCount(0);
});

test("the chart lets the page scroll", async ({ page }) => {
  await medidas(page);
  expect(await css(chart(page), "touch-action")).toBe("pan-y");
});

test("touching the chart stores nothing", async ({ page }) => {
  await medidas(page);
  const before = await page.evaluate(() => localStorage.getItem("treino:v1"));
  await pointAt(page, "right");
  await pointAt(page, "left");
  const b = await box(chart(page));
  for (let i = 0; i <= 10; i++) await page.mouse.move(b.x + (b.width * i) / 10, b.y + b.height / 2);
  await page.mouse.move(5, 5);
  expect(await page.evaluate(() => localStorage.getItem("treino:v1"))).toBe(before);
});

test("chips on one scrolling line", async ({ page }) => {
  await medidas(page);
  const group = page.getByRole("group", { name: "Escolher medida" });
  const all = group.getByRole("button");
  await expect(all).toHaveCount(8);
  const boxes = [];
  for (let i = 0; i < 8; i++) boxes.push(await box(all.nth(i)));
  for (let i = 1; i < 8; i++) {
    expect(Math.abs(boxes[i].y - boxes[0].y)).toBeLessThanOrEqual(1);
    expect(boxes[i].x).toBeGreaterThanOrEqual(boxes[i - 1].x + boxes[i - 1].width);
  }
  expect(await css(group, "overflow-x")).toBe("auto");
  expect(await css(group, "scrollbar-width")).toBe("none");
  const [sw, cw] = await group.evaluate((e) => [e.scrollWidth, e.clientWidth]);
  expect(sw).toBeGreaterThan(cw);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test("plot fills the card", async ({ page }) => {
  await medidas(page);
  const c = await content(card(page));
  const plot = await box(chart(page));
  expect(Math.abs(plot.width - c.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(plot.height / plot.width - 180 / 340)).toBeLessThanOrEqual(0.01);
  const now = card(page).locator(".headline .now");
  expect(await css(now, "font-family")).toMatch(/^"?Fredoka/);
  expect(await css(now, "font-size")).toBe("36px");
});

test("plot fills the card, pair", async ({ page }) => {
  await medidas(page, PAIR);
  await chip(page, "Braço").click();
  const nows = card(page).locator(".headline .now");
  await expect(nows).toHaveCount(2);
  for (let i = 0; i < 2; i++) expect(await css(nows.nth(i), "font-size")).toBe("30px");
});

test("card arrangement at 360", async ({ page }) => {
  await medidas(page);
  const c = await content(card(page));
  const heading = card(page).getByRole("heading", { name: "Sua evolução" });
  const chips = page.getByRole("group", { name: "Escolher medida" });
  const headline = card(page).locator(".headline");
  const order = [heading, chips, headline, chart(page)];
  let prev = null;
  for (const l of order) {
    const b = await box(l);
    expect(Math.abs(b.x - c.left)).toBeLessThanOrEqual(1);
    if (prev) expect(b.y).toBeGreaterThanOrEqual(prev.y + prev.height - 0.5);
    prev = b;
  }
  const value = await box(headline.locator(".now"));
  const delta = await box(headline.locator(".delta"));
  expect(Math.abs(value.x - c.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(delta.x - c.left)).toBeLessThanOrEqual(1);
  expect(delta.y).toBeGreaterThanOrEqual(value.y + value.height - 0.5);
});

test("card arrangement at 360, pair", async ({ page }) => {
  await medidas(page, PAIR);
  await chip(page, "Braço").click();
  const c = await content(card(page));
  const headline = card(page).locator(".headline");
  const legend = card(page).locator(".legend");
  const order = [page.getByRole("group", { name: "Escolher medida" }), headline, legend, chart(page)];
  let prev = null;
  for (const l of order) {
    const b = await box(l);
    expect(Math.abs(b.x - c.left)).toBeLessThanOrEqual(1);
    if (prev) expect(b.y).toBeGreaterThanOrEqual(prev.y + prev.height - 0.5);
    prev = b;
  }
  // v6 stacks headline, legend and plot in one block with no gap between them.
  const [hb, lb, pb] = [await box(headline), await box(legend), await box(chart(page))];
  expect(Math.abs(lb.y - (hb.y + hb.height))).toBeLessThanOrEqual(1);
  expect(Math.abs(pb.y - (lb.y + lb.height))).toBeLessThanOrEqual(1);
  // At 360px mockup v6 wraps the pair: E under D, both at the content's left.
  const d = await box(headline.locator(":scope > div").nth(0));
  const e = await box(headline.locator(":scope > div").nth(1));
  expect(Math.abs(d.x - c.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(e.x - c.left)).toBeLessThanOrEqual(1);
  expect(e.y).toBeGreaterThanOrEqual(d.y + d.height - 0.5);
});

test("card arrangement at 360, one entry", async ({ page }) => {
  await medidas(page, ONE);
  const c = await content(card(page));
  const first = card(page).locator(".first");
  const f = await box(first);
  const chips = await box(page.getByRole("group", { name: "Escolher medida" }));
  expect(Math.abs(f.x - c.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(f.x + f.width - c.right)).toBeLessThanOrEqual(1);
  expect(f.y).toBeGreaterThanOrEqual(chips.y + chips.height - 0.5);
  expect(await css(first, "text-align")).toBe("center");
});

for (const scheme of ["light", "dark"] as const) {
  test(`pair colours - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await medidas(page, PAIR);
    await chip(page, "Braço").click();
    const [d, e] = [chart(page).locator("polyline").nth(0), chart(page).locator("polyline").nth(1)];
    expect(await css(d, "stroke")).toBe(rgb(S_D[scheme]));
    expect(await css(e, "stroke")).toBe(rgb(S_E[scheme]));
    const dots = chart(page).locator("circle.dot");
    expect(await css(dots.nth(0), "fill")).toBe(rgb(S_D[scheme]));
    expect(await css(dots.nth(1), "fill")).toBe(rgb(S_E[scheme]));
    const legend = card(page).locator(".legend line");
    expect(await css(legend.nth(0), "stroke")).toBe(rgb(S_D[scheme]));
    expect(await css(legend.nth(1), "stroke")).toBe(rgb(S_E[scheme]));
  });

  test(`series tokens - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await medidas(page);
    const tokens = await page.evaluate(() => {
      const probe = document.createElement("div");
      document.body.appendChild(probe);
      const read = (v: string) => {
        probe.style.color = `var(${v})`;
        return getComputedStyle(probe).color;
      };
      const out = [read("--s-d"), read("--s-e"), getComputedStyle(document.documentElement).getPropertyValue("--s-d").trim()];
      probe.remove();
      return out;
    });
    expect(tokens[0]).toBe(rgb(S_D[scheme]));
    expect(tokens[1]).toBe(rgb(S_E[scheme]));
    expect(tokens[2]).not.toBe("");
  });

  test(`mockup v6 chart declarations - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await medidas(page);
    const expectCss = async (l: Locator, label: string, want: Record<string, string>) => {
      for (const [prop, value] of Object.entries(want)) expect(await css(l, prop), `${label} ${prop}`).toBe(value);
    };
    const four = (prefix: string, suffix: string, v: string) =>
      Object.fromEntries(["top", "right", "bottom", "left"].map((s) => [`${prefix}-${s}${suffix}`, v]));
    const corners = (v: string) =>
      Object.fromEntries(["top-left", "top-right", "bottom-right", "bottom-left"].map((s) => [`border-${s}-radius`, v]));
    const roundAll = async (l: Locator, label: string) => {
      const h = (await box(l)).height;
      for (const k of Object.keys(corners(""))) expect(parseFloat(await css(l, k)), `${label} ${k}`).toBeGreaterThanOrEqual(h / 2);
    };

    const c = card(page);
    await expectCss(c, "card", {
      "background-color": rgb(SURFACE[scheme]), ...corners("24px"),
      "padding-top": "18px", "padding-right": "16px", "padding-bottom": "14px", "padding-left": "16px", "row-gap": "14px",
      display: "flex", "flex-direction": "column", "box-shadow": SHADOW[scheme],
    });
    const h = c.getByRole("heading", { name: "Sua evolução" });
    await expectCss(h, "heading", { "font-size": "22px", ...four("margin", "", "0px") });
    expect(await css(h, "font-family")).toMatch(/^"?Fredoka/);

    const group = page.getByRole("group", { name: "Escolher medida" });
    await expectCss(group, "chips", { display: "flex", "column-gap": "6px", "padding-top": "2px", "padding-right": "2px", "padding-bottom": "6px", "padding-left": "2px" });
    const peso = chip(page, "Peso");
    await expectCss(peso, "chip", {
      "flex-shrink": "0", "flex-grow": "0", ...four("border", "-width", "2px"), ...four("border", "-style", "solid"),
      ...four("border", "-color", rgb(LINE[scheme])), "background-color": rgb(SURFACE[scheme]),
      "padding-top": "6px", "padding-right": "12px", "padding-bottom": "6px", "padding-left": "12px",
      "font-size": "14px", "font-weight": "500", color: rgb(MUTED[scheme]),
    });
    await roundAll(peso, "chip");
    await expectCss(chip(page, "Cintura"), "chosen chip", {
      ...four("border", "-color", rgb(CHERRY[scheme])), "background-color": rgb(BLUSH[scheme]), color: rgb(CHERRY[scheme]),
    });

    const headline = c.locator(".headline");
    await expectCss(headline, "headline", { display: "flex", "align-items": "baseline", "justify-content": "space-between", "column-gap": "12px", "flex-wrap": "wrap" });
    const now = headline.locator(".now");
    await expectCss(now, "value", { "font-weight": "700", "line-height": "36px", color: rgb(INK[scheme]), "font-variant-numeric": "tabular-nums" });
    await expectCss(now.locator("small"), "unit", { "font-size": "16px", "font-weight": "500", color: rgb(MUTED[scheme]), "margin-left": "3px" });
    const delta = headline.locator(".delta");
    await expectCss(delta, "change", { "font-size": "14px", color: rgb(MUTED[scheme]), "font-variant-numeric": "tabular-nums" });
    await expectCss(delta.locator("b"), "change bold", { "font-weight": "700", color: rgb(INK[scheme]) });

    const plot = c.locator(".plot");
    await expectCss(plot, "plot", { position: "relative" });
    await expectCss(chart(page), "plot svg", { display: "block" });
    const grid = chart(page).locator("line.grid").first();
    await expectCss(grid, "grid", { stroke: rgb(LINE[scheme]), "stroke-width": "1px" });
    const tick = chart(page).locator("text.tick").first();
    await expectCss(tick, "tick", { fill: rgb(MUTED[scheme]), "font-size": "11px", "font-variant-numeric": "tabular-nums" });
    expect(await css(tick, "font-family")).toMatch(/^"?DM Sans/);
    const series = chart(page).locator("polyline").first();
    await expectCss(series, "line", { fill: "none", "stroke-width": "2px", "stroke-linejoin": "round", "stroke-linecap": "round" });
    const dot = chart(page).locator("circle.dot").first();
    await expectCss(dot, "dot", { stroke: rgb(SURFACE[scheme]), "stroke-width": "2px" });
    await expectCss(cross(page), "crosshair", { stroke: rgb(MUTED[scheme]), "stroke-width": "1px", "stroke-dasharray": "3px, 3px" });

    await pointAt(page, "right");
    const t = tip(page);
    await expectCss(t, "tip", {
      position: "absolute", top: "0px", "pointer-events": "none", "background-color": rgb(INK[scheme]), color: rgb(BG[scheme]),
      ...corners("10px"), "padding-top": "6px", "padding-right": "9px", "padding-bottom": "6px", "padding-left": "9px",
      "font-size": "12px", "line-height": "16.2px", "white-space": "nowrap", "font-variant-numeric": "tabular-nums",
    });
    const [e, width] = await t.evaluate((el) => [new DOMMatrix(getComputedStyle(el).transform).e, el.getBoundingClientRect().width]);
    expect(Math.abs(e + width / 2)).toBeLessThanOrEqual(0.5);

    // A pair: the headline's gap, the legend, the D/E end labels.
    await chip(page, "Braço").click();
    await page.mouse.move(5, 5);
    await expect(c.locator(".first")).toHaveText("Ainda sem medição de braço.");
    await expectCss(c.locator(".first"), "first panel (empty)", { "background-color": rgb(BLUSH[scheme]) });
  });

  test(`mockup v6 chart declarations, pair and one entry - ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await medidas(page, PAIR);
    await chip(page, "Braço").click();
    const expectCss = async (l: Locator, label: string, want: Record<string, string>) => {
      for (const [prop, value] of Object.entries(want)) expect(await css(l, prop), `${label} ${prop}`).toBe(value);
    };
    const c = card(page);
    await expectCss(c.locator(".headline"), "pair headline", { "column-gap": "18px", "justify-content": "space-between" });
    await expectCss(c.locator(".headline .now small").first(), "letter", { "font-size": "16px", "font-weight": "500", color: rgb(MUTED[scheme]), "margin-left": "3px" });
    const legend = c.locator(".legend");
    await expectCss(legend, "legend", { display: "flex", "column-gap": "14px", "font-size": "13px", color: rgb(MUTED[scheme]) });
    await expectCss(legend.locator("span").first(), "legend entry", { "align-items": "center", "column-gap": "6px" });
    // A flex item computes inline-flex as flex, so read what the last matching rule declares.
    expect(await legend.locator("span").first().evaluate((el) => {
      let value = "";
      const walk = (rules: CSSRuleList) => {
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSStyleRule) {
            if (el.matches(rule.selectorText) && rule.style.display) value = rule.style.display;
          } else if ("cssRules" in rule) walk((rule as CSSGroupingRule).cssRules);
        }
      };
      for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules);
      return value;
    })).toBe("inline-flex");
    const lsvg = await box(legend.locator("svg").first());
    expect(lsvg.width).toBeCloseTo(22, 1);
    expect(lsvg.height).toBeCloseTo(8, 1);
    const end = chart(page).locator("text.end-label").first();
    await expectCss(end, "end label", { "font-weight": "700", "font-size": "12px", fill: rgb(INK[scheme]) });
    expect(await css(end, "font-family")).toMatch(/^"?DM Sans/);

    await page.evaluate(() => {
      const r = JSON.parse(localStorage.getItem("treino:v1")!);
      r.measurements = [{ date: "2026-10-08", values: { cintura: 71.6 } }];
      localStorage.setItem("treino:v1", JSON.stringify(r));
    });
    await page.reload();
    await page.getByRole("navigation", { name: "Menu" }).getByRole("button", { name: "Medidas" }).click();
    const first = c.locator(".first");
    await expectCss(first, "first panel", {
      "background-color": rgb(BLUSH[scheme]), "border-top-left-radius": "18px", "border-top-right-radius": "18px",
      "border-bottom-right-radius": "18px", "border-bottom-left-radius": "18px",
      "padding-top": "16px", "padding-right": "16px", "padding-bottom": "16px", "padding-left": "16px",
      "text-align": "center", color: rgb(MUTED[scheme]), "font-size": "14px",
    });
    const b = first.locator("b");
    await expectCss(b, "first value", { display: "block", "font-size": "30px", color: rgb(INK[scheme]) });
    expect(await css(b, "font-family")).toMatch(/^"?Fredoka/);
  });
}
