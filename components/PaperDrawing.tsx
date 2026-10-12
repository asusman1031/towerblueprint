import { buildPaper, curvePieces, type PaperDesign, type Pt } from "@/lib/paper";

// A packing paper build seen from above: one thick, crinkly rope laid along its
// path, with a head (eyes and a tongue) at the end when it has a face.

type Variant = "blocks" | "brand" | "ink";

const S = 20; // drawing units per foot
const ROPE = 0.38 * S; // a bit fatter than the real rope, so it reads at card size

export default function PaperDrawing({
  paper,
  variant = "blocks",
  highlight,
  animate = false,
  stepMs = 70,
  grid = false,
  className,
  title,
}: {
  paper: PaperDesign;
  variant?: Variant;
  highlight?: number; // step to emphasise: earlier steps are ghosted, later ones a dotted guide
  animate?: boolean;
  stepMs?: number;
  grid?: boolean; // one-foot squares underneath, for laying it out on the floor
  className?: string;
  title?: string;
}) {
  const built = buildPaper(paper);
  const { points } = built;
  if (points.length < 2) return null;
  const top = built.deep; // whole feet, so grid squares line up with feet on the floor
  // Feet on the floor to drawing units; away from you is up the page.
  const at = (p: Pt): Pt => [p[0] * S, (top - p[1]) * S];
  const fmt = (p: Pt) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  const pathOf = (from: number, to: number) =>
    curvePieces(points, from, to)
      .map(([a, b, c, d], i) => `${i ? "" : `M${fmt(at(a))}`}C${fmt(at(b))} ${fmt(at(c))} ${fmt(at(d))}`)
      .join("");

  const ink = variant === "ink";
  const real = { fill: ink ? "#DCEAFF" : "#D3B68D", line: ink ? "#1146B8" : "#6E5233", crease: ink ? "#1146B8" : "#B39169" };
  const ghost = { fill: "#EEF4FF", line: "#C9DAF5", crease: "" };
  const last = built.steps.length - 1;

  const parts = built.steps
    .filter((s) => s.to > s.from)
    .map((s) => ({
      i: s.index,
      d: pathOf(s.from, s.to),
      later: highlight !== undefined && s.index > highlight,
      look: highlight !== undefined && s.index < highlight ? ghost : real,
      anim: animate ? { className: "iso-drop", style: { animationDelay: `${s.index * stepMs * 4}ms` } } : {},
    }));
  const laid = parts.filter((p) => !p.later);
  // Every outline goes down first and every fill on top, so steps join without a seam.
  const rope = (
    <g fill="none" strokeLinecap="round">
      {parts
        .filter((p) => p.later)
        .map((p) => (
          <path key={`g${p.i}`} d={p.d} stroke="#9DBBEA" strokeWidth={ROPE * 0.3} strokeDasharray="0.1 9" />
        ))}
      {laid.map((p) => (
        <path key={`o${p.i}`} d={p.d} stroke={p.look.line} strokeWidth={ROPE + 2.4} {...p.anim} />
      ))}
      {laid.map((p) => (
        <path key={`f${p.i}`} d={p.d} stroke={p.look.fill} strokeWidth={ROPE} {...p.anim} />
      ))}
      {/* Short marks across the rope, like the creases in scrunched paper. */}
      {laid
        .filter((p) => p.look.crease)
        .map((p) => (
          <path
            key={`c${p.i}`}
            d={p.d}
            stroke={p.look.crease}
            strokeOpacity={ink ? 0.4 : 0.75}
            strokeWidth={ROPE * 0.66}
            strokeLinecap="butt"
            strokeDasharray="0.9 2.6 0.6 3.4"
            {...p.anim}
          />
        ))}
    </g>
  );

  // The head sits on the end of the rope, facing the way the rope was going.
  let head: React.ReactElement | null = null;
  if (paper.face && (highlight === undefined || highlight === last)) {
    const pieces = curvePieces(points, points.length - 2, points.length - 1);
    const [, , c, e] = pieces[pieces.length - 1];
    const end = at(e);
    const back = at(c);
    const len = Math.hypot(end[0] - back[0], end[1] - back[1]) || 1;
    const dir: Pt = [(end[0] - back[0]) / len, (end[1] - back[1]) / len];
    const side: Pt = [-dir[1], dir[0]];
    const go = (p: Pt, f: number, s = 0): Pt => [p[0] + dir[0] * f * S + side[0] * s * S, p[1] + dir[1] * f * S + side[1] * s * S];
    const centre = go(end, 0.1);
    const angle = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI;
    const tip = go(centre, 0.62);
    head = (
      <g
        className={animate ? "iso-drop" : undefined}
        style={animate ? { animationDelay: `${built.steps.length * stepMs * 4}ms` } : undefined}
      >
        <path
          d={`M${fmt(go(centre, 0.32))}L${fmt(tip)}M${fmt(tip)}l${fmt([dir[0] * 3 + side[0] * 2.4, dir[1] * 3 + side[1] * 2.4])}M${fmt(tip)}l${fmt([dir[0] * 3 - side[0] * 2.4, dir[1] * 3 - side[1] * 2.4])}`}
          stroke={ink ? real.line : "#E5484D"}
          strokeWidth={1.4}
          strokeLinecap="round"
          fill="none"
        />
        <ellipse
          cx={centre[0]}
          cy={centre[1]}
          rx={0.36 * S}
          ry={0.29 * S}
          transform={`rotate(${angle.toFixed(1)} ${fmt(centre)})`}
          fill={real.fill}
          stroke={real.line}
          strokeWidth={1.2}
        />
        {[1, -1].map((k) => {
          const eye = go(centre, 0.1, 0.13 * k);
          const pupil = go(eye, 0.025);
          return (
            <g key={k}>
              <circle cx={eye[0]} cy={eye[1]} r={0.075 * S} fill="#FFFFFF" stroke={real.line} strokeWidth={0.7} />
              <circle cx={pupil[0]} cy={pupil[1]} r={0.04 * S} fill="#0B1F4D" />
            </g>
          );
        })}
      </g>
    );
  }

  // Where this step starts, so a builder knows where to pick up.
  const start =
    highlight !== undefined && built.steps[highlight] ? at(points[built.steps[highlight].from]) : null;

  const pad = 0.7 * S;
  const xs = points.map((p) => at(p)[0]);
  const ys = points.map((p) => at(p)[1]);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const w = Math.max(...xs) - minX + pad;
  const h = Math.max(...ys) - minY + pad;
  const lines: React.ReactElement[] = [];
  if (grid) {
    for (let x = Math.floor(minX / S); x <= Math.ceil((minX + w) / S); x++) {
      lines.push(<line key={`x${x}`} x1={x * S} y1={minY} x2={x * S} y2={minY + h} />);
    }
    for (let y = Math.floor(minY / S); y <= Math.ceil((minY + h) / S); y++) {
      lines.push(<line key={`y${y}`} x1={minX} y1={y * S} x2={minX + w} y2={y * S} />);
    }
  }
  return (
    <svg
      viewBox={`${minX.toFixed(1)} ${minY.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`}
      className={className}
      role="img"
      aria-label={title ?? "Packing paper build drawing"}
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      {grid ? (
        <g stroke="#C9DAF5" strokeWidth={0.6}>
          {lines}
        </g>
      ) : null}
      {rope}
      {head}
      {start ? <circle cx={start[0]} cy={start[1]} r={0.17 * S} fill="#0B1F4D" stroke="#FFFFFF" strokeWidth={1.5} /> : null}
    </svg>
  );
}
