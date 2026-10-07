// Door 1 (exercise-guides): each drawing is data in one grammar - machine once, start pose faded,
// end pose solid, one arrow per move - in a 200x140 frame. Door 2: guides key on the plan's stable
// exercise ids, one per id wherever it appears. A plan exercise with no guide shows no "como faz".
import { PLAN } from "./plan";

export type Pt = [x: number, y: number];

export type Shape =
  | { rect: [x: number, y: number, w: number, h: number, r: number]; as: "mach" | "weight" }
  | { circle: [cx: number, cy: number, r: number]; as: "mach" | "weight" }
  | { path: string; as: "line" | "pad" | "floor" };

export interface Pose {
  head: Pt;
  /** Drawn at head + (-7, -6) when absent. */
  bun?: Pt;
  neck: Pt;
  hip: Pt;
  legs: [knee: Pt, foot: Pt][];
  arms: [elbow: Pt, hand: Pt][];
  props?: Shape[];
}

export interface ExerciseGuide {
  /** One line of pt-BR, 1-120 characters: a reminder, not instruction. */
  cue: string;
  machine: Shape[];
  start: Pose;
  end: Pose;
  moves: [from: Pt, via: Pt, to: Pt][];
}

export const GUIDES: Record<string, ExerciseGuide> = {
  "flexora-cadeira": {
    cue: "Sentada, rolo atrás do tornozelo. Puxa o calcanhar para baixo e para trás, volta devagar.",
    machine: [
      { path: "M40 128 H180", as: "floor" },
      { path: "M58 30 L66 82", as: "pad" },
      { rect: [60, 84, 62, 10, 4], as: "mach" },
      { path: "M90 94 V128", as: "line" },
      { rect: [100, 66, 30, 9, 4], as: "mach" },
      { circle: [126, 82, 4], as: "mach" },
    ],
    start: { head: [68, 27], neck: [72, 41], hip: [92, 80], legs: [[[126, 80], [166, 84]]], arms: [[[80, 62], [98, 82]]], props: [{ circle: [166, 93, 6], as: "mach" }] },
    end: { head: [68, 27], neck: [72, 41], hip: [92, 80], legs: [[[126, 80], [120, 118]]], arms: [[[80, 62], [98, 82]]], props: [{ circle: [111, 117, 6], as: "mach" }] },
    moves: [[[180, 96], [176, 124], [136, 128]]],
  },
  "flexora-mesa": {
    cue: "Deitada de bruços, rolo no tornozelo. Dobra o joelho trazendo o calcanhar em direção ao bumbum.",
    machine: [
      { path: "M20 128 H190", as: "floor" },
      { rect: [28, 90, 122, 10, 4], as: "mach" },
      { path: "M44 100 V128 M134 100 V128", as: "line" },
    ],
    start: { head: [36, 76], bun: [30, 68], neck: [50, 82], hip: [108, 82], legs: [[[142, 82], [178, 84]]], arms: [[[44, 96], [34, 106]]], props: [{ circle: [178, 75, 6], as: "mach" }] },
    end: { head: [36, 76], bun: [30, 68], neck: [50, 82], hip: [108, 82], legs: [[[142, 82], [158, 50]]], arms: [[[44, 96], [34, 106]]], props: [{ circle: [150, 50, 6], as: "mach" }] },
    moves: [[[188, 74], [190, 44], [166, 34]]],
  },
  sumo: {
    cue: "Pés bem afastados com as pontas para fora, halter no meio. Desce com o tronco reto e os joelhos abrindo.",
    machine: [{ path: "M40 128 H160", as: "floor" }],
    start: {
      head: [100, 22], bun: [100, 11], neck: [100, 36], hip: [100, 74],
      legs: [[[86, 100], [76, 126]], [[114, 100], [124, 126]]],
      arms: [[[88, 58], [100, 88]], [[112, 58], [100, 88]]],
      props: [{ rect: [89, 88, 22, 6, 2], as: "weight" }, { rect: [97, 94, 6, 12, 0], as: "weight" }, { rect: [89, 106, 22, 6, 2], as: "weight" }],
    },
    end: {
      head: [100, 40], bun: [100, 29], neck: [100, 54], hip: [100, 90],
      legs: [[[68, 94], [72, 126]], [[132, 94], [128, 126]]],
      arms: [[[88, 74], [100, 100]], [[112, 74], [100, 100]]],
      props: [{ rect: [89, 100, 22, 6, 2], as: "weight" }, { rect: [97, 106, 6, 12, 0], as: "weight" }, { rect: [89, 118, 22, 6, 2], as: "weight" }],
    },
    moves: [[[154, 36], [156, 66], [154, 100]]],
  },
  hack: {
    cue: "Costas no encosto inclinado, ombros sob as almofadas. Desce até o joelho fazer 90° e empurra a plataforma.",
    machine: [
      { path: "M40 128 H175", as: "floor" },
      { path: "M50 8 L112 112", as: "pad" },
      { path: "M128 122 L162 98", as: "line" },
      { path: "M112 112 L118 128", as: "line" },
    ],
    start: { head: [64, 19], bun: [56, 14], neck: [72, 31], hip: [100, 70], legs: [[[126, 86], [144, 110]]], arms: [[[84, 36], [80, 24]]] },
    end: { head: [81, 43], bun: [73, 38], neck: [89, 55], hip: [117, 95], legs: [[[146, 80], [144, 110]]], arms: [[[101, 60], [97, 48]]] },
    moves: [[[34, 44], [46, 72], [64, 102]]],
  },
  "elevacao-pelvica": {
    cue: "Costas apoiadas no banco, barra no quadril. Sobe o quadril até alinhar com o tronco e aperta o glúteo lá em cima.",
    machine: [
      { path: "M10 128 H185", as: "floor" },
      { rect: [14, 78, 44, 12, 4], as: "mach" },
      { path: "M22 90 V128 M50 90 V128", as: "line" },
    ],
    start: { head: [46, 72], bun: [38, 66], neck: [60, 80], hip: [88, 114], legs: [[[118, 96], [132, 126]]], arms: [[[72, 100], [88, 106]]], props: [{ circle: [88, 101, 8], as: "weight" }] },
    end: { head: [46, 72], bun: [38, 66], neck: [60, 80], hip: [98, 80], legs: [[[132, 88], [132, 126]]], arms: [[[78, 90], [98, 72]]], props: [{ circle: [98, 67, 8], as: "weight" }] },
    moves: [[[166, 114], [170, 96], [166, 74]]],
  },
  abducao: {
    cue: "Sentada, almofadas por fora dos joelhos. Abre as pernas empurrando para fora e volta devagar.",
    machine: [
      { path: "M50 128 H150", as: "floor" },
      { rect: [76, 26, 48, 50, 10], as: "mach" },
      { rect: [66, 74, 68, 12, 5], as: "mach" },
      { path: "M100 86 V128", as: "line" },
    ],
    start: {
      head: [100, 24], bun: [100, 13], neck: [100, 38], hip: [100, 74],
      legs: [[[90, 92], [90, 124]], [[110, 92], [110, 124]]],
      arms: [[[84, 56], [74, 76]], [[116, 56], [126, 76]]],
      props: [{ rect: [76, 84, 7, 18, 3], as: "mach" }, { rect: [117, 84, 7, 18, 3], as: "mach" }],
    },
    end: {
      head: [100, 24], bun: [100, 13], neck: [100, 38], hip: [100, 74],
      legs: [[[72, 90], [66, 122]], [[128, 90], [134, 122]]],
      arms: [[[84, 56], [74, 76]], [[116, 56], [126, 76]]],
      props: [{ rect: [58, 82, 7, 18, 3], as: "mach" }, { rect: [135, 82, 7, 18, 3], as: "mach" }],
    },
    moves: [[[54, 108], [44, 108], [32, 108]], [[146, 108], [156, 108], [168, 108]]],
  },

  // Treino A - drawn for the 2026-10 review, not from the mockup.
  extensao: {
    cue: "Sentada, rolo na frente do tornozelo. Estica as pernas até ficarem retas e desce devagar.",
    machine: [
      { path: "M40 128 H180", as: "floor" },
      { path: "M58 30 L66 82", as: "pad" },
      { rect: [60, 84, 62, 10, 4], as: "mach" },
      { path: "M90 94 V128", as: "line" },
      { circle: [126, 82, 4], as: "mach" },
    ],
    start: { head: [68, 27], neck: [72, 41], hip: [92, 80], legs: [[[126, 80], [124, 118]]], arms: [[[80, 62], [98, 82]]], props: [{ circle: [132, 113, 6], as: "mach" }] },
    end: { head: [68, 27], neck: [72, 41], hip: [92, 80], legs: [[[126, 80], [164, 78]]], arms: [[[80, 62], [98, 82]]], props: [{ circle: [160, 70, 6], as: "mach" }] },
    moves: [[[148, 124], [178, 118], [182, 84]]],
  },
  agachamento: {
    cue: "Barra apoiada nas costas, pés na largura dos ombros. Desce como quem senta, tronco firme, e sobe.",
    machine: [{ path: "M40 128 H170", as: "floor" }],
    start: {
      head: [100, 22], bun: [100, 11], neck: [100, 38], hip: [100, 76],
      legs: [[[90, 102], [88, 126]], [[110, 102], [112, 126]]],
      arms: [[[82, 48], [72, 36]], [[118, 48], [128, 36]]],
      props: [{ rect: [56, 34, 88, 5, 2], as: "weight" }, { rect: [50, 26, 8, 21, 2], as: "weight" }, { rect: [142, 26, 8, 21, 2], as: "weight" }],
    },
    end: {
      head: [100, 40], bun: [100, 29], neck: [100, 56], hip: [100, 94],
      legs: [[[74, 100], [86, 126]], [[126, 100], [114, 126]]],
      arms: [[[82, 66], [72, 54]], [[118, 66], [128, 54]]],
      props: [{ rect: [56, 52, 88, 5, 2], as: "weight" }, { rect: [50, 44, 8, 21, 2], as: "weight" }, { rect: [142, 44, 8, 21, 2], as: "weight" }],
    },
    moves: [[[176, 30], [182, 62], [176, 96]]],
  },
  "leg-press-45": {
    cue: "Costas e quadril no encosto, pés no meio da plataforma. Desce até o joelho fazer 90° e empurra.",
    machine: [
      { path: "M20 128 H185", as: "floor" },
      { path: "M38 56 L76 104", as: "pad" },
      { rect: [70, 104, 30, 9, 4], as: "mach" },
      { path: "M84 113 V128", as: "line" },
      { path: "M112 88 L170 30", as: "line" },
      { path: "M150 128 V50", as: "line" },
    ],
    start: {
      head: [40, 52], neck: [48, 64], hip: [80, 100], legs: [[[96, 64], [124, 76]]], arms: [[[58, 86], [76, 100]]],
      props: [{ path: "M117 63 L137 83", as: "pad" }],
    },
    end: {
      head: [40, 52], neck: [48, 64], hip: [80, 100], legs: [[[112, 70], [148, 52]]], arms: [[[58, 86], [76, 100]]],
      props: [{ path: "M141 39 L161 59", as: "pad" }],
    },
    moves: [[[150, 102], [172, 88], [184, 64]]],
  },
  afundo: {
    cue: "Um pé à frente, outro atrás. Desce o joelho de trás rumo ao chão, tronco reto, e sobe com a perna da frente.",
    machine: [{ path: "M40 128 H160", as: "floor" }],
    start: {
      head: [101, 18], neck: [100, 32], hip: [100, 72],
      legs: [[[114, 98], [124, 126]], [[86, 98], [64, 124]]],
      arms: [[[88, 50], [96, 70]]],
    },
    end: {
      head: [101, 38], neck: [100, 52], hip: [100, 92],
      legs: [[[130, 94], [124, 126]], [[90, 120], [64, 124]]],
      arms: [[[88, 70], [96, 90]]],
    },
    moves: [[[40, 36], [32, 64], [40, 94]]],
  },
  aducao: {
    cue: "Sentada, almofadas por dentro dos joelhos. Fecha as pernas apertando para dentro e abre devagar.",
    machine: [
      { path: "M50 128 H150", as: "floor" },
      { rect: [76, 26, 48, 50, 10], as: "mach" },
      { rect: [66, 74, 68, 12, 5], as: "mach" },
      { path: "M100 86 V128", as: "line" },
    ],
    start: {
      head: [100, 24], bun: [100, 13], neck: [100, 38], hip: [100, 74],
      legs: [[[72, 90], [66, 122]], [[128, 90], [134, 122]]],
      arms: [[[84, 56], [74, 76]], [[116, 56], [126, 76]]],
      props: [{ rect: [77, 82, 7, 18, 3], as: "mach" }, { rect: [116, 82, 7, 18, 3], as: "mach" }],
    },
    end: {
      head: [100, 24], bun: [100, 13], neck: [100, 38], hip: [100, 74],
      legs: [[[90, 92], [90, 124]], [[110, 92], [110, 124]]],
      arms: [[[84, 56], [74, 76]], [[116, 56], [126, 76]]],
      props: [{ rect: [94, 84, 5, 18, 2], as: "mach" }, { rect: [101, 84, 5, 18, 2], as: "mach" }],
    },
    moves: [[[30, 108], [42, 108], [56, 108]], [[170, 108], [158, 108], [144, 108]]],
  },
  gemeos: {
    cue: "Pontas dos pés na beirada do degrau, calcanhar para fora. Sobe na ponta dos pés bem alto e desce devagar.",
    machine: [
      { path: "M50 128 H170", as: "floor" },
      { rect: [100, 116, 40, 12, 3], as: "mach" },
      { path: "M146 30 V116", as: "line" },
    ],
    start: { head: [100, 22], neck: [100, 36], hip: [100, 74], legs: [[[101, 98], [100, 120]]], arms: [[[116, 46], [140, 46]]] },
    end: { head: [100, 10], neck: [100, 24], hip: [100, 62], legs: [[[101, 86], [104, 110]]], arms: [[[118, 36], [140, 46]]] },
    moves: [[[64, 112], [56, 82], [64, 52]]],
  },
};

const W = 200;
const H = 140;

/** Every rule a guide breaks, each naming its key. An empty list means the guides are sound. */
export function guideProblems(guides: Record<string, ExerciseGuide>): string[] {
  const ids = new Set(Object.values(PLAN).flatMap((w) => w.exercises.map((e) => e.id)));
  const problems: string[] = [];
  for (const [id, g] of Object.entries(guides)) {
    const fail = (why: string) => problems.push(`${id}: ${why}`);
    if (!ids.has(id)) fail("not an exercise id in PLAN");
    if (g.cue.length < 1 || g.cue.length > 120) fail(`cue has ${g.cue.length} characters, not 1-120`);
    if (/[\r\n]/.test(g.cue)) fail("cue has a line break");
    if (g.moves.length === 0) fail("no move");
    for (const [label, p] of [["start", g.start], ["end", g.end]] as const) {
      if (p.legs.length === 0) fail(`${label} pose has no leg`);
      if (p.arms.length === 0) fail(`${label} pose has no arm`);
    }
    const out = outside(g);
    if (out.length) fail(`outside the ${W}x${H} frame: ${out.join(", ")}`);
  }
  return problems;
}

/** Plan exercise ids with no guide. */
export function missingGuides(guides: Record<string, ExerciseGuide>): string[] {
  const ids = new Set(Object.values(PLAN).flatMap((w) => w.exercises.map((e) => e.id)));
  return [...ids].filter((id) => !(id in guides));
}

function outside(g: ExerciseGuide): string[] {
  const out: string[] = [];
  const pt = ([x, y]: Pt, label: string) => {
    if (x < 0 || x > W || y < 0 || y > H) out.push(`${label} (${x}, ${y})`);
  };
  const shape = (s: Shape, label: string) => {
    if ("rect" in s) {
      const [x, y, w, h] = s.rect;
      pt([x, y], `${label} rect`);
      pt([x + w, y + h], `${label} rect`);
    } else if ("circle" in s) {
      const [cx, cy, r] = s.circle;
      pt([cx - r, cy - r], `${label} circle`);
      pt([cx + r, cy + r], `${label} circle`);
    } else {
      pathPoints(s.path).forEach((p) => pt(p, `${label} path`));
    }
  };
  g.machine.forEach((s) => shape(s, "machine"));
  for (const [label, p] of [["start", g.start], ["end", g.end]] as const) {
    const points = [p.head, p.neck, p.hip, ...(p.bun ? [p.bun] : []), ...p.legs.flat(), ...p.arms.flat()];
    points.forEach((q) => pt(q, label));
    p.props?.forEach((s) => shape(s, `${label} prop`));
  }
  g.moves.flat().forEach((q) => pt(q, "move"));
  return out;
}

/** Absolute points of a path written with M, L, H, V, Q or C. */
function pathPoints(d: string): Pt[] {
  const points: Pt[] = [];
  let x = 0;
  let y = 0;
  for (const [, cmd, args] of d.matchAll(/([A-Za-z])([^A-Za-z]*)/g)) {
    const n = (args.match(/-?[\d.]+/g) ?? []).map(Number);
    if (cmd === "H") n.forEach((v) => points.push([(x = v), y]));
    else if (cmd === "V") n.forEach((v) => points.push([x, (y = v)]));
    else for (let i = 0; i + 1 < n.length; i += 2) points.push([(x = n[i]), (y = n[i + 1])]);
  }
  return points;
}
