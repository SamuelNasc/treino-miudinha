// Door 2: the trainer's plan (docs/exercices-list.md), transcribed. Workout letters and
// exercise ids are stable identities referenced by stored data - never rename them.

export type WorkoutId = "A" | "B" | "C" | "D";

export interface Exercise {
  id: string;
  name: string;
  sets: string;
}

export interface Workout {
  id: WorkoutId;
  focus: string;
  exercises: Exercise[];
}

export const WORKOUT_IDS: WorkoutId[] = ["A", "B", "C", "D"];

export const PLAN: Record<WorkoutId, Workout> = {
  A: {
    id: "A",
    focus: "Perna · quadríceps",
    exercises: [
      { id: "extensao", name: "Extensão", sets: "4×10" },
      { id: "agachamento", name: "Agachamento", sets: "4×12" },
      { id: "leg-press-45", name: "Leg press 45°", sets: "4×12" },
      { id: "afundo", name: "Afundo", sets: "3×10" },
      { id: "aducao", name: "Adução", sets: "3×15" },
      { id: "gemeos", name: "Gêmeos", sets: "3×15" },
    ],
  },
  B: {
    id: "B",
    focus: "Peito · ombro · tríceps",
    exercises: [
      { id: "voador", name: "Voador", sets: "4×10" },
      { id: "supino-inclinado", name: "Supino inclinado", sets: "4×10" },
      { id: "desenvolvimento-maquina", name: "Desenvolvimento máquina", sets: "3×12" },
      { id: "remada-alta", name: "Remada alta", sets: "3×12" },
      { id: "triceps-testa", name: "Tríceps testa", sets: "3×10–12" },
      { id: "triceps-pulley", name: "Tríceps pulley", sets: "3×10–12" },
      { id: "triceps-frances", name: "Tríceps francês", sets: "3×10–12" },
      { id: "abdominal-reto", name: "Abdominal reto", sets: "4×12" },
      { id: "abdominal-inferior", name: "Abdominal inferior", sets: "4×12" },
    ],
  },
  C: {
    id: "C",
    focus: "Perna · posterior e glúteo",
    exercises: [
      { id: "flexora-cadeira", name: "Flexora cadeira", sets: "4×10" },
      { id: "flexora-mesa", name: "Flexora mesa", sets: "4×10" },
      { id: "sumo", name: "Sumô", sets: "3×15" },
      { id: "hack", name: "Hack", sets: "3×10" },
      { id: "elevacao-pelvica", name: "Elevação pélvica", sets: "4×10" },
      { id: "abducao", name: "Abdução", sets: "3×15" },
    ],
  },
  D: {
    id: "D",
    focus: "Costas · bíceps · ombro",
    exercises: [
      { id: "puxador-frente", name: "Puxador frente", sets: "3×10–12" },
      { id: "remada-baixa", name: "Remada baixa", sets: "3×10–12" },
      { id: "pull-down", name: "Pull down", sets: "3×10–12" },
      { id: "remada-articulada", name: "Remada articulada", sets: "3×10–12" },
      { id: "rosca-martelo", name: "Rosca martelo", sets: "3×12" },
      { id: "elevacao-lateral", name: "Elevação lateral", sets: "3×12" },
      { id: "elevacao-frontal", name: "Elevação frontal", sets: "3×12" },
      { id: "abdominal-reto", name: "Abdominal reto", sets: "4×12" },
      { id: "abdominal-inferior", name: "Abdominal inferior", sets: "4×12" },
    ],
  },
};
