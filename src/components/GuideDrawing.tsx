import type { ExerciseGuide, Pose, Pt, Shape } from "../domain/guides";

// Colours come only from the classes in index.css, bound to theme tokens (--fig, --mach, --pad).
const pt = ([x, y]: Pt) => `${x},${y}`;

function ShapeEl({ shape }: { shape: Shape }) {
  if ("rect" in shape) {
    const [x, y, width, height, rx] = shape.rect;
    return <rect className={shape.as} x={x} y={y} width={width} height={height} rx={rx || undefined} />;
  }
  if ("circle" in shape) {
    const [cx, cy, r] = shape.circle;
    return <circle className={shape.as} cx={cx} cy={cy} r={r} />;
  }
  return <path className={shape.as === "floor" ? "floor" : `mach ${shape.as}`} d={shape.path} />;
}

function PoseEl({ pose, ghost }: { pose: Pose; ghost: boolean }) {
  const { head, neck, hip } = pose;
  const bun = pose.bun ?? [head[0] - 7, head[1] - 6];
  return (
    <g className={ghost ? "ghost" : undefined}>
      {pose.legs.map(([knee, foot], i) => (
        <polyline key={`l${i}`} className="limb leg" points={`${pt(hip)} ${pt(knee)} ${pt(foot)}`} />
      ))}
      <line className="torso" x1={neck[0]} y1={neck[1]} x2={hip[0]} y2={hip[1]} />
      {pose.arms.map(([elbow, hand], i) => (
        <polyline key={`a${i}`} className="limb arm" points={`${pt(neck)} ${pt(elbow)} ${pt(hand)}`} />
      ))}
      <circle className="bun" cx={bun[0]} cy={bun[1]} r={5} />
      <circle className="head" cx={head[0]} cy={head[1]} r={9} />
      {pose.props?.map((s, i) => <ShapeEl key={i} shape={s} />)}
    </g>
  );
}

/** A quadratic curve from `from` through `via`, stopping short of `to` for the arrowhead. */
function Arrow({ move: [from, via, to] }: { move: [Pt, Pt, Pt] }) {
  const dx = to[0] - via[0];
  const dy = to[1] - via[1];
  const l = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / l, dy / l];
  const [bx, by] = [to[0] - ux * 9, to[1] - uy * 9];
  return (
    <>
      <path className="move" d={`M${pt(from)} Q${pt(via)} ${pt([bx, by])}`} />
      <polygon className="move-head" points={`${pt(to)} ${bx - uy * 5},${by + ux * 5} ${bx + uy * 5},${by - ux * 5}`} />
    </>
  );
}

export function GuideDrawing({ guide, name }: { guide: ExerciseGuide; name: string }) {
  return (
    <svg viewBox="0 0 200 140" role="img" aria-label={`Desenho do exercício ${name}`}>
      {guide.machine.map((s, i) => (
        <ShapeEl key={i} shape={s} />
      ))}
      <PoseEl pose={guide.start} ghost />
      <PoseEl pose={guide.end} ghost={false} />
      {guide.moves.map((m, i) => (
        <Arrow key={i} move={m} />
      ))}
    </svg>
  );
}

/** The expanded part of a Hoje row: the drawing with its legend, then the cue. */
export function Guide({ guide, name, id }: { guide: ExerciseGuide; name: string; id: string }) {
  return (
    <div className="how" id={id} role="region" aria-label={`Como faz ${name}`}>
      <figure className="draw">
        <GuideDrawing guide={guide} name={name} />
        <figcaption>
          <span className="key">
            <i className="k-ghost" />
            começo
          </span>
          <span className="key">
            <i />
            fim
          </span>
        </figcaption>
      </figure>
      <p className="cue">{guide.cue}</p>
    </div>
  );
}
