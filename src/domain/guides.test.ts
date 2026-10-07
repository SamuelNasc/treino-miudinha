import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GUIDES, guideProblems, type ExerciseGuide, type Pose, type Shape } from "./guides";
import { PLAN } from "./plan";

const valid = (): ExerciseGuide => ({
  cue: "Sentada. Empurra.",
  machine: [{ path: "M10 128 H190", as: "floor" }],
  start: { head: [50, 20], neck: [50, 34], hip: [50, 70], legs: [[[50, 100], [50, 126]]], arms: [[[40, 50], [40, 70]]] },
  end: { head: [60, 20], neck: [60, 34], hip: [60, 70], legs: [[[60, 100], [60, 126]]], arms: [[[70, 50], [70, 70]]] },
  moves: [[[20, 20], [30, 30], [40, 40]]],
});

const problemsFor = (guide: ExerciseGuide, id = "hack") => guideProblems({ [id]: guide });

describe("guides", () => {
  it("guide id not in plan fails", () => {
    const problems = guideProblems({ "remada-curvada": valid() });
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.join("\n")).toContain("remada-curvada");
  });

  it("real guides have no problems", () => {
    expect(guideProblems(GUIDES)).toEqual([]);
  });

  it("cue is one line of 1-120", () => {
    for (const cue of ["", "x".repeat(121), "Sentada.\nEmpurra."]) {
      const problems = problemsFor({ ...valid(), cue });
      expect(problems, JSON.stringify(cue)).toHaveLength(1);
      expect(problems[0]).toContain("hack");
    }
    expect(problemsFor({ ...valid(), cue: "x" })).toEqual([]);
    expect(problemsFor({ ...valid(), cue: "x".repeat(120) })).toEqual([]);
    for (const [id, g] of Object.entries(GUIDES)) {
      expect(g.cue.length, id).toBeGreaterThanOrEqual(1);
      expect(g.cue.length, id).toBeLessThanOrEqual(120);
      expect(g.cue, id).not.toMatch(/[\r\n]/);
    }
  });

  it("points outside the frame fail", () => {
    const g = valid();
    const cases: ExerciseGuide[] = [
      { ...g, start: { ...g.start, head: [201, 20] } },
      { ...g, moves: [[[20, -1], [30, 30], [40, 40]]] },
      { ...g, machine: [{ rect: [181, 10, 20, 10, 2], as: "mach" }] },
      { ...g, end: { ...g.end, props: [{ circle: [100, 131, 10], as: "weight" }] } },
    ];
    for (const bad of cases) {
      const problems = problemsFor(bad);
      expect(problems, JSON.stringify(bad)).toHaveLength(1);
      expect(problems[0]).toContain("hack");
    }
    expect(problemsFor({ ...g, start: { ...g.start, head: [0, 0] }, end: { ...g.end, head: [200, 140] } })).toEqual([]);
  });

  it("missing move, leg or arm fails", () => {
    const g = valid();
    const cases: ExerciseGuide[] = [
      { ...g, moves: [] },
      { ...g, start: { ...g.start, legs: [] } },
      { ...g, end: { ...g.end, arms: [] } },
    ];
    for (const bad of cases) {
      const problems = problemsFor(bad);
      expect(problems, JSON.stringify(bad)).toHaveLength(1);
      expect(problems[0]).toContain("hack");
    }
  });

  it("treino C matches mockup v4", () => {
    const html = readFileSync("tests/fixtures/mockup-v4.html", "utf8");
    const src = html.match(/const DRAW = (\{[\s\S]*?\n\});/)![1];
    const DRAW = new Function(`return ${src}`)() as Record<string, MockDraw>;

    const ids = ["flexora-cadeira", "flexora-mesa", "sumo", "hack", "elevacao-pelvica", "abducao"];
    expect(PLAN.C.exercises.map((e) => e.id)).toEqual(ids);
    expect(Object.keys(DRAW)).toEqual(PLAN.C.exercises.map((e) => e.name));

    for (const { id, name } of PLAN.C.exercises) {
      const d = DRAW[name];
      const expected: ExerciseGuide = {
        cue: d.cue,
        machine: [{ path: d.floor, as: "floor" }, ...shapes(d.mach)],
        start: pose(d.a),
        end: pose(d.b),
        moves: d.moves,
      };
      expect(GUIDES[id], id).toEqual(expected);
    }
  });
});

describe("guide coverage", () => {
  it("plan has 28 distinct exercises", () => {
    const per = Object.values(PLAN).map((w) => w.exercises.map((e) => e.id));
    expect(new Set(per.flat()).size).toBe(28);
    const seen = new Set<string>();
    const fresh = per.map((ids) => ids.filter((id) => !seen.has(id) && seen.add(id)).length);
    expect(fresh).toEqual([6, 9, 6, 7]);
  });
});

// --- mockup v4 reading: its drawings are SVG strings, the app's are door-1 data ---

type MPt = [number, number];
interface MockPose { h: MPt; bun?: MPt; n: MPt; p: MPt; legs: [MPt, MPt][]; arms: [MPt, MPt][]; x?: string }
interface MockDraw { cue: string; mach: string; floor: string; a: MockPose; b: MockPose; moves: [MPt, MPt, MPt][] }

function pose(m: MockPose): Pose {
  const p: Pose = { head: m.h, neck: m.n, hip: m.p, legs: m.legs, arms: m.arms };
  if (m.bun) p.bun = m.bun;
  if (m.x) p.props = shapes(m.x);
  return p;
}

function shapes(svg: string): Shape[] {
  const doc = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`, "image/svg+xml");
  const n = (el: Element, a: string) => Number(el.getAttribute(a) ?? 0);
  return [...doc.documentElement.children].map((el): Shape => {
    const cls = el.getAttribute("class")!;
    if (el.tagName === "rect") return { rect: [n(el, "x"), n(el, "y"), n(el, "width"), n(el, "height"), n(el, "rx")], as: cls === "weight" ? "weight" : "mach" };
    if (el.tagName === "circle") return { circle: [n(el, "cx"), n(el, "cy"), n(el, "r")], as: cls === "weight" ? "weight" : "mach" };
    if (cls === "mach pad") return { path: el.getAttribute("d")!, as: "pad" };
    if (cls === "mach line") return { path: el.getAttribute("d")!, as: "line" };
    throw new Error(`unexpected mockup shape: ${el.outerHTML}`);
  });
}
