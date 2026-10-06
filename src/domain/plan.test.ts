import { describe, expect, it } from "vitest";
import { PLAN, WORKOUT_IDS } from "./plan";

describe("plan", () => {
  it("matches the trainer's list", () => {
    expect(WORKOUT_IDS).toEqual(["A", "B", "C", "D"]);
    expect(Object.keys(PLAN).sort()).toEqual(["A", "B", "C", "D"]);

    const rows = (id: "A" | "B" | "C" | "D") => PLAN[id].exercises.map((e) => `${e.name} – ${e.sets}`);

    expect(PLAN.A.focus).toMatch(/perna/i);
    expect(PLAN.A.focus).toMatch(/quadríceps/i);
    expect(rows("A")).toEqual([
      "Extensão – 4×10",
      "Agachamento – 4×12",
      "Leg press 45° – 4×12",
      "Afundo – 3×10",
      "Adução – 3×15",
      "Gêmeos – 3×15",
    ]);

    expect(PLAN.B.focus).toMatch(/peito.*ombro.*tríceps/i);
    expect(rows("B")).toEqual([
      "Voador – 4×10",
      "Supino inclinado – 4×10",
      "Desenvolvimento máquina – 3×12",
      "Remada alta – 3×12",
      "Tríceps testa – 3×10–12",
      "Tríceps pulley – 3×10–12",
      "Tríceps francês – 3×10–12",
      "Abdominal reto – 4×12",
      "Abdominal inferior – 4×12",
    ]);

    expect(PLAN.C.focus).toMatch(/perna.*posterior.*glúteo/i);
    expect(rows("C")).toEqual([
      "Flexora cadeira – 4×10",
      "Flexora mesa – 4×10",
      "Sumô – 3×15",
      "Hack – 3×10",
      "Elevação pélvica – 4×10",
      "Abdução – 3×15",
    ]);

    expect(PLAN.D.focus).toMatch(/costas.*bíceps.*ombro/i);
    expect(rows("D")).toEqual([
      "Puxador frente – 3×10–12",
      "Remada baixa – 3×10–12",
      "Pull down – 3×10–12",
      "Remada articulada – 3×10–12",
      "Rosca martelo – 3×12",
      "Elevação lateral – 3×12",
      "Elevação frontal – 3×12",
      "Abdominal reto – 4×12",
      "Abdominal inferior – 4×12",
    ]);

    for (const id of WORKOUT_IDS) {
      expect(PLAN[id].id).toBe(id);
      const ids = PLAN[id].exercises.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const exId of ids) expect(exId).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
    expect(PLAN.A.exercises[2].id).toBe("leg-press-45");
    // Shared movement, one id across workouts (Relations).
    expect(PLAN.B.exercises.find((e) => e.name === "Abdominal reto")?.id).toBe("abdominal-reto");
    expect(PLAN.D.exercises.find((e) => e.name === "Abdominal reto")?.id).toBe("abdominal-reto");
  });
});
