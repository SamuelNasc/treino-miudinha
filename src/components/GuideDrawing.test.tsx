import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GUIDES, type ExerciseGuide } from "../domain/guides";
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

const COLOUR = /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\b(red|green|blue|black|white|gr[ae]y|pink|purple|orange|yellow|brown|maroon|navy|teal|olive|crimson|salmon|tomato|coral|gold|silver|cyan|magenta|lime|indigo|violet|beige|ivory|khaki|lavender|plum|orchid|tan|wheat|aqua|fuchsia|firebrick|darkred|lightpink|hotpink|deeppink)\b/i;

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
