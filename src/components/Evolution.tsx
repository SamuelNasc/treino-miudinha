import { useRef, useState, type PointerEvent } from "react";
import { change, seriesOf, xLabels, yTicks, type Point } from "../domain/chart";
import type { Measurement } from "../domain/measurements";
import { MEASURES, type MeasureId } from "../domain/measures";
import { shortDate } from "./History";

const show = (v: number) => String(v).replace(".", ",");

// One chip per chart: a single measure, or right and left together.
const CHIPS: { key: string; label: string; ids: MeasureId[] }[] = [
  { key: "peso", label: "Peso", ids: ["peso"] },
  { key: "busto", label: "Busto", ids: ["busto"] },
  { key: "cintura", label: "Cintura", ids: ["cintura"] },
  { key: "abdomen", label: "Abdômen", ids: ["abdomen"] },
  { key: "quadril", label: "Quadril", ids: ["quadril"] },
  { key: "braco", label: "Braço", ids: ["braco-d", "braco-e"] },
  { key: "coxa", label: "Coxa", ids: ["coxa-d", "coxa-e"] },
  { key: "panturrilha", label: "Panturrilha", ids: ["panturrilha-d", "panturrilha-e"] },
];

// Mockup v6's plot box, in viewBox units.
const W = 340, H = 180, L = 34, R = 30, T = 12, B = 24;
const SIDES = [
  { letter: "D", color: "var(--s-d)", dash: undefined },
  { letter: "E", color: "var(--s-e)", dash: "6 4" },
];

const days = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
};

interface Props {
  measurements: Measurement[];
  today: string;
}

export function Evolution({ measurements, today }: Props) {
  const [chosen, setChosen] = useState("cintura");
  if (measurements.length === 0) return null;
  const chip = CHIPS.find((c) => c.key === chosen)!;

  return (
    <section className="card chart-card" aria-labelledby="chart-title">
      <h2 id="chart-title" className="sr-title">
        Sua evolução
      </h2>
      <div className="chips" role="group" aria-label="Escolher medida">
        {CHIPS.map((c) => (
          <button key={c.key} type="button" className="chip" aria-pressed={c.key === chosen} onClick={() => setChosen(c.key)}>
            {c.label}
          </button>
        ))}
      </div>
      <ChartBody key={chosen} measurements={measurements} today={today} label={chip.label} ids={chip.ids} />
    </section>
  );
}

function ChartBody({ measurements, today, label, ids }: Props & { label: string; ids: MeasureId[] }) {
  const [hover, setHover] = useState<{ date: string; left: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const unit = MEASURES.find((m) => m.id === ids[0])!.unit;
  const pair = ids.length > 1;
  const sides = ids
    .map((id, i) => ({ ...SIDES[i], letter: pair ? SIDES[i].letter : null, pts: seriesOf(measurements, id) }))
    .filter((s) => s.pts.length > 0);
  const dates = [...new Set(sides.flatMap((s) => s.pts.map((p) => p.date)))].sort();

  if (dates.length === 0) return <div className="first">Ainda sem medição de {label.toLowerCase()}.</div>;
  if (dates.length === 1)
    return (
      <div className="first">
        {sides.map((s) => (
          <b key={s.color}>
            {s.letter ? `${s.letter} ` : ""}
            {show(s.pts[0].v)} {unit}
          </b>
        ))}
        primeira medição, {shortDate(dates[0], today)}. A linha aparece a partir da segunda.
      </div>
    );

  const values = sides.flatMap((s) => s.pts.map((p) => p.v));
  const ticks = yTicks(Math.min(...values), Math.max(...values));
  const d0 = days(dates[0]), d1 = days(dates[dates.length - 1]);
  const x = (date: string) => L + ((days(date) - d0) / (d1 - d0)) * (W - L - R);
  const y = (v: number) => T + (1 - (v - ticks[0]) / (ticks[ticks.length - 1] - ticks[0])) * (H - T - B);
  const at = (p: Point) => `${x(p.date)},${y(p.v)}`;
  const labels = xLabels(dates);
  const hits = hover ? sides.map((s) => ({ s, p: s.pts.find((p) => p.date === hover.date) })).filter((h) => h.p) : [];

  const point = (e: PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) * W) / r.width;
    const date = dates.reduce((a, b) => (Math.abs(x(b) - px) < Math.abs(x(a) - px) ? b : a));
    setHover({ date, left: Math.min(Math.max((x(date) * r.width) / W, 50), r.width - 50) });
  };

  return (
    <>
      <div className={`headline${pair ? " pair" : ""}`}>
        {sides.map((s) => {
          const first = s.pts[0], last = s.pts[s.pts.length - 1];
          return (
            <div key={s.color}>
              <div className="now">
                {s.letter && (
                  <>
                    <small>{s.letter}</small>{" "}
                  </>
                )}
                <span>{show(last.v)}</span>
                <small>{unit}</small>
              </div>
              <div className="delta">
                {s.pts.length > 1 ? (
                  <>
                    <b>
                      {change(first.v, last.v)} {unit}
                    </b>{" "}
                    desde {shortDate(first.date, today)}
                  </>
                ) : (
                  "primeira medição"
                )}
              </div>
            </div>
          );
        })}
      </div>
      {pair && (
        <div className="legend">
          {sides.map((s) => (
            <span key={s.color}>
              <svg viewBox="0 0 22 8" aria-hidden="true">
                <line x1="1" y1="4" x2="21" y2="4" stroke={s.color} strokeWidth="2.5" strokeDasharray={s.dash && "4 3"} />
              </svg>
              {s.letter === "D" ? "Direita" : "Esquerda"}
            </span>
          ))}
        </div>
      )}
      <div className="plot">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Gráfico de ${label.toLowerCase()}`}
          onPointerDown={point}
          onPointerMove={point}
          onPointerLeave={() => setHover(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line className="grid" x1={L} x2={W - R} y1={y(t)} y2={y(t)} />
              <text className="tick" x={L - 6} y={y(t) + 4} textAnchor="end">
                {show(t)}
              </text>
            </g>
          ))}
          {labels.map((d, i) => (
            <text key={d} className="tick" x={x(d)} y={H - 6} textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}>
              {shortDate(d, today)}
            </text>
          ))}
          {sides.map((s) => {
            const last = s.pts[s.pts.length - 1];
            return (
              <g key={s.color}>
                {s.pts.length > 1 && <polyline className="series" stroke={s.color} strokeDasharray={s.dash} points={s.pts.map(at).join(" ")} />}
                <circle className="dot" fill={s.color} cx={x(last.date)} cy={y(last.v)} r="5" />
                {s.letter && (
                  <text className="end-label" x={x(last.date) + 9} y={y(last.v) + 4}>
                    {s.letter}
                  </text>
                )}
              </g>
            );
          })}
          <line className="cross" x1={hover ? x(hover.date) : 0} x2={hover ? x(hover.date) : 0} y1={T} y2={H - B} visibility={hover ? "visible" : "hidden"} />
          <g className="hover-dots">
            {hits.map(({ s, p }) => (
              <circle key={s.color} className="dot" fill={s.color} cx={x(p!.date)} cy={y(p!.v)} r="5" />
            ))}
          </g>
          <rect x={L} y="0" width={W - L - R + 10} height={H} fill="transparent" />
        </svg>
        <div className="tip" hidden={!hover} style={hover ? { left: hover.left } : undefined}>
          {hover && (
            <>
              <b>{shortDate(hover.date, today)}</b>
              <br />
              {hits.map(({ s, p }) => `${s.letter ? `${s.letter} ` : ""}${show(p!.v)} ${unit}`).join(" · ")}
            </>
          )}
        </div>
      </div>
    </>
  );
}
