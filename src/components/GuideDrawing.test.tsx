import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GUIDES, type ExerciseGuide, type Pose, type Shape } from "../domain/guides";
import { PLAN } from "../domain/plan";
import { Guide, GuideDrawing } from "./GuideDrawing";

const nameOf = (id: string) => Object.values(PLAN).flatMap((w) => w.exercises).find((e) => e.id === id)!.name;

const draw = (guide: ExerciseGuide, name = "Teste") => {
  const { container } = render(<GuideDrawing guide={guide} name={name} />);
  return container.querySelector("svg")!;
};

const base: ExerciseGuide = {
  cue: "Teste.",
  machine: [],
  start: { head: [50, 20], neck: [50, 34], hip: [50, 70], legs: [[[50, 100], [50, 126]]], arms: [[[40, 50], [40, 70]]] },
  end: { head: [60, 20], neck: [60, 34], hip: [60, 70], legs: [[[60, 100], [60, 126]]], arms: [[[70, 50], [70, 70]]] },
  moves: [[[20, 20], [30, 30], [40, 40]]],
};

// Every CSS named colour (CSS Color 4, 148 names), so "no literal colour" covers the whole set.
const NAMED = "aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen".split(" ");
const COLOUR = new RegExp(`#[0-9a-f]{3,8}\\b|rgba?\\(|hsla?\\(|\\b(${NAMED.join("|")})\\b`, "i");

it("colour matcher knows all 148 named colours", () => {
  expect(new Set(NAMED).size).toBe(148);
  for (const n of NAMED) expect(n, n).toMatch(COLOUR);
  for (const ok of ["none", "currentColor", "var(--fig)"]) expect(ok).not.toMatch(COLOUR);
});

describe("GuideDrawing", () => {
  it("frame is 200x140", () => {
    const svgs = draw(GUIDES.hack, "Hack").ownerDocument.querySelectorAll("svg");
    expect(svgs).toHaveLength(1);
    expect(svgs[0]).toHaveAttribute("viewBox", "0 0 200 140");
  });

  it("start pose faded, end pose solid", () => {
    const svg = draw(GUIDES.hack, "Hack");
    const ghost = svg.querySelectorAll("g.ghost");
    const solid = [...svg.querySelectorAll("g")].filter((g) => !g.classList.contains("ghost"));
    expect(ghost).toHaveLength(1);
    expect(solid).toHaveLength(1);
    expect(ghost[0].compareDocumentPosition(solid[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("one arrow per move", () => {
    for (const [id, n] of [["abducao", 2], ["hack", 1]] as const) {
      const svg = draw(GUIDES[id]);
      expect(GUIDES[id].moves).toHaveLength(n);
      expect(svg.querySelectorAll("path.move"), id).toHaveLength(n);
      expect(svg.querySelectorAll("polygon.move-head"), id).toHaveLength(n);
    }
  });

  it("no literal colour", () => {
    for (const [id, guide] of Object.entries(GUIDES)) {
      const svg = draw(guide, nameOf(id));
      for (const el of [svg, ...svg.querySelectorAll("*")]) {
        for (const attr of ["fill", "stroke", "color", "style"]) {
          expect(el.getAttribute(attr) ?? "", `${id} <${el.tagName}> ${attr}`).not.toMatch(COLOUR);
        }
      }
      svg.ownerDocument.body.innerHTML = "";
    }
  });

  it("named image and cue text", () => {
    render(<Guide guide={GUIDES.hack} name="Hack" id="how-hack" />);
    const img = screen.getByRole("img", { name: "Desenho do exercício Hack" });
    expect(img.tagName.toLowerCase()).toBe("svg");
    const cue = screen.getByText(GUIDES.hack.cue);
    expect(cue.tagName).toBe("P");
    const figure = img.closest("figure")!;
    expect(figure).not.toBeNull();
    expect(figure.compareDocumentPosition(cue) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(figure.contains(cue)).toBe(false);
  });

  it("each shape kind gets its class", () => {
    const svg = draw({
      ...base,
      machine: [
        { rect: [10, 10, 20, 10, 2], as: "mach" },
        { rect: [10, 30, 20, 10, 0], as: "weight" },
        { circle: [100, 20, 5], as: "mach" },
        { circle: [120, 20, 5], as: "weight" },
        { path: "M1 1 L2 2", as: "line" },
        { path: "M3 3 L4 4", as: "pad" },
        { path: "M5 5 H6", as: "floor" },
      ],
      start: { ...base.start, props: [{ circle: [150, 20, 6], as: "mach" }] },
      end: { ...base.end, props: [{ rect: [150, 40, 8, 8, 1], as: "weight" }] },
    });
    const cls = (sel: string) => svg.querySelector(sel)!.getAttribute("class");
    expect(cls('rect[x="10"][y="10"]')).toBe("mach");
    expect(svg.querySelector('rect[x="10"][y="10"]')).toHaveAttribute("rx", "2");
    expect(cls('rect[x="10"][y="30"]')).toBe("weight");
    expect(cls('circle[cx="100"]')).toBe("mach");
    expect(cls('circle[cx="120"]')).toBe("weight");
    expect(cls('path[d="M1 1 L2 2"]')).toBe("mach line");
    expect(cls('path[d="M3 3 L4 4"]')).toBe("mach pad");
    expect(cls('path[d="M5 5 H6"]')).toBe("floor");
    expect(svg.querySelector('g.ghost circle[cx="150"]')).toHaveAttribute("class", "mach");
    const end = [...svg.querySelectorAll("g")].find((g) => !g.classList.contains("ghost"))!;
    expect(end.querySelector('rect[x="150"]')).toHaveAttribute("class", "weight");
  });

  it("every guide renders", () => {
    for (const [id, guide] of Object.entries(GUIDES)) {
      const name = nameOf(id);
      const { container, unmount } = render(<GuideDrawing guide={guide} name={name} />);
      const svg = screen.getByRole("img", { name: `Desenho do exercício ${name}` });
      expect(container.querySelectorAll("svg"), id).toHaveLength(1);
      expect(svg, id).toHaveAttribute("viewBox", "0 0 200 140");
      expect(svg.querySelectorAll("path.move"), id).toHaveLength(guide.moves.length);
      expect(svg.querySelectorAll("polygon.move-head"), id).toHaveLength(guide.moves.length);
      for (const el of [svg, ...svg.querySelectorAll("*")]) {
        for (const attr of ["fill", "stroke", "color", "style"]) {
          expect(el.getAttribute(attr) ?? "", `${id} <${el.tagName}> ${attr}`).not.toMatch(COLOUR);
        }
      }
      unmount();
    }
  });

  it("paints machine, start, end, arrows", () => {
    for (const [id, guide] of Object.entries(GUIDES)) {
      const { container, unmount } = render(<GuideDrawing guide={guide} name={nameOf(id)} />);
      const kids = [...container.querySelector("svg")!.children];
      const kind = (el: Element) =>
        el.tagName === "g" ? (el.classList.contains("ghost") ? "start" : "end") : el.classList.contains("move") || el.classList.contains("move-head") ? "arrow" : "machine";
      const order = kids.map(kind);
      const expected = [...Array(guide.machine.length).fill("machine"), "start", "end", ...Array(guide.moves.length * 2).fill("arrow")];
      expect(order, id).toEqual(expected);
      unmount();
    }
  });

  it("geometry matches the mockup renderer", () => {
    for (const [id, guide] of Object.entries(GUIDES)) {
      const name = nameOf(id);
      const { container, unmount } = render(<GuideDrawing guide={guide} name={name} />);
      const ours = flatten(container.querySelector("svg")!);
      const doc = new DOMParser().parseFromString(mockupDrawing(guide, name), "image/svg+xml");
      expect(ours, id).toEqual(flatten(doc.documentElement));
      unmount();
    }
  });

  it("pose parts and default bun", () => {
    const svg = draw({
      ...base,
      start: { ...base.start, legs: [[[40, 100], [40, 126]], [[60, 100], [60, 126]]] },
      end: { ...base.end, bun: [66, 8], arms: [[[70, 50], [70, 70]], [[80, 50], [80, 70]], [[90, 50], [90, 70]]] },
    });
    const [start, end] = [...svg.querySelectorAll("g")];
    for (const [g, legs, arms] of [[start, 2, 1], [end, 1, 3]] as const) {
      expect(g.querySelectorAll("circle.head")).toHaveLength(1);
      expect(g.querySelectorAll("circle.bun")).toHaveLength(1);
      expect(g.querySelectorAll(".torso")).toHaveLength(1);
      expect(g.querySelectorAll("polyline.leg")).toHaveLength(legs);
      expect(g.querySelectorAll("polyline.arm")).toHaveLength(arms);
    }
    const at = (c: Element) => [c.getAttribute("cx"), c.getAttribute("cy")];
    expect(at(start.querySelector("circle.head")!)).toEqual(["50", "20"]);
    expect(at(start.querySelector("circle.bun")!)).toEqual(["43", "14"]);
    expect(at(end.querySelector("circle.bun")!)).toEqual(["66", "8"]);
  });
});

// --- the mockup v4 renderer, run from the saved fixture on our guide data (C35) ---

const MOCKUP = readFileSync("tests/fixtures/mockup-v4.html", "utf8");
const RENDERER = MOCKUP.slice(MOCKUP.indexOf("const pt = "), MOCKUP.indexOf("\n}\n", MOCKUP.indexOf("function drawing(name)")) + 2);

function mockupDrawing(guide: ExerciseGuide, name: string): string {
  const svg = (sh: Shape): string => {
    if ("rect" in sh) {
      const [x, y, w, h, r] = sh.rect;
      return `<rect class="${sh.as}" x="${x}" y="${y}" width="${w}" height="${h}"${r ? ` rx="${r}"` : ""}/>`;
    }
    if ("circle" in sh) return `<circle class="${sh.as}" cx="${sh.circle[0]}" cy="${sh.circle[1]}" r="${sh.circle[2]}"/>`;
    return `<path class="mach ${sh.as}" d="${sh.path}"/>`;
  };
  const [floor, ...mach] = guide.machine;
  if (!("path" in floor) || floor.as !== "floor") throw new Error(`${name}: the mockup grammar draws the floor first`);
  const pose = (p: Pose) => ({ h: p.head, bun: p.bun, n: p.neck, p: p.hip, legs: p.legs, arms: p.arms, x: (p.props ?? []).map(svg).join("") });
  const DRAW = { [name]: { floor: floor.path, mach: mach.map(svg).join(""), a: pose(guide.start), b: pose(guide.end), moves: guide.moves } };
  return new Function("DRAW", "name", `${RENDERER}\nreturn drawing(name);`)(DRAW, name);
}

/** Every element in paint order, with its attributes; numbers rounded so float formatting can't differ. */
function flatten(root: Element): string[] {
  const num = (v: string) => v.replace(/-?\d+(\.\d+)?(e-?\d+)?/g, (n) => String(Math.round(Number(n) * 1000) / 1000));
  return [root, ...root.querySelectorAll("*")].map((el) => {
    const attrs = [...el.attributes]
      .filter((a) => !a.name.startsWith("xmlns") && !(a.name === "class" && a.value === ""))
      .map((a) => `${a.name}=${num(a.value.trim().replace(/\s+/g, " "))}`)
      .sort();
    return `${el.tagName.toLowerCase()} ${attrs.join(" ")}`;
  });
}
