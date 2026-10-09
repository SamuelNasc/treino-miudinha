import type { MeasureGuide } from "../domain/measureGuides";

/** Mockup v6's figure: the same slim front view for every measure, with the tape band at the landmark. */
export function MeasureDrawing({ guide, name }: { guide: MeasureGuide; name: string }) {
  const [[x1, y], [x2]] = guide.band;
  const rx = (x2 - x1) / 2;
  return (
    <svg viewBox="0 0 120 200" role="img" aria-label={`Onde medir: ${name}`}>
      <path className="body-fill" d="M49 40 Q60 45 71 40 L77 50 Q78 60 75 68 Q70 80 71 90 Q75 100 75 112 L72 120 L61 122 L59 122 L48 120 L45 112 Q45 100 49 90 Q50 80 45 68 Q42 60 43 50 Z" />
      <path className="body-line" d="M43 50 Q37 56 36 70 Q35 86 34 104 M77 50 Q83 56 84 70 Q85 86 86 104" />
      <path className="body-line" d="M48 118 Q46 140 49 160 Q50 176 50 192 M57 122 Q58 140 56 160 Q55 176 55 192" />
      <path className="body-line" d="M72 118 Q74 140 71 160 Q70 176 70 192 M63 122 Q62 140 64 160 Q65 176 65 192" />
      <circle className="body-head" cx={60} cy={24} r={12} />
      <circle className="body-bun" cx={60} cy={9} r={6} />
      <ellipse className="tape" cx={x1 + rx} cy={y} rx={rx + 3} ry={4} />
    </svg>
  );
}
