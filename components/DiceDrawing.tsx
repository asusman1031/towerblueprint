import { buildDice, DICE_COLORS, PIPS, type DiceDesign } from "@/lib/dice";

// Isometric drawing of a dice build, painted back to front like IsoTower, with
// the dots drawn on every face you can see.

type Variant = "blocks" | "brand" | "ink";
type V2 = [number, number];

const S = 20; // half the screen width of one die
const V = 23; // screen height of one die
const proj = (x: number, y: number, z: number): V2 => [(x - y) * S, ((x + y) * S) / 2 - z * V];
const fmt = (p: V2) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) =>
    Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt))
      .toString(16)
      .padStart(2, "0");
  return `#${f((n >> 16) & 255)}${f((n >> 8) & 255)}${f(n & 255)}`;
}

export default function DiceDrawing({
  dice: design,
  variant = "blocks",
  highlight,
  animate = false,
  stepMs = 70,
  className,
  title,
}: {
  dice: DiceDesign;
  variant?: Variant;
  highlight?: number; // step index to emphasise; other steps are ghosted
  animate?: boolean;
  stepMs?: number;
  className?: string;
  title?: string;
}) {
  const { dice } = buildDice(design);
  if (!dice.length) return null;
  const taken = new Set(dice.map((d) => `${d.x},${d.y},${d.z}`));
  const free = (x: number, y: number, z: number) => !taken.has(`${x},${y},${z}`);
  const pts: V2[] = [];

  const order = [...dice].sort((a, b) => a.z - b.z || a.x + a.y - (b.x + b.y) || a.x - b.x);
  const drawn = order.map((d, i) => {
    const ghost = highlight !== undefined && d.step !== highlight;
    const base = ghost ? "#EEF4FF" : variant === "ink" ? "#DCEAFF" : DICE_COLORS[d.color];
    const line = ghost ? "#C9DAF5" : variant === "ink" ? "#1146B8" : "rgba(20,25,40,0.6)";
    const pip = ghost ? "#C9DAF5" : variant === "ink" ? "#1146B8" : d.color === "white" ? "#2B2B2B" : "#FFFFFF";
    const { x, y, z } = d;
    const faces: React.ReactElement[] = [];

    // One face: corner o, then "across" and "down" edges, as you look at that face.
    const face = (key: string, fill: string, o: V2, u: V2, v: V2, n: number) => {
      const corners: V2[] = [o, [o[0] + u[0], o[1] + u[1]], [o[0] + u[0] + v[0], o[1] + u[1] + v[1]], [o[0] + v[0], o[1] + v[1]]];
      pts.push(...corners);
      faces.push(
        <g key={key}>
          <polygon points={corners.map(fmt).join(" ")} fill={fill} stroke={line} strokeWidth={ghost ? 0.6 : 0.9} />
          <g transform={`matrix(${u[0]} ${u[1]} ${v[0]} ${v[1]} ${o[0]} ${o[1]})`}>
            {PIPS[n].map(([px, py], k) => (
              <circle key={k} cx={px} cy={py} r={0.1} fill={pip} />
            ))}
          </g>
        </g>,
      );
    };
    const sub = (a: V2, b: V2): V2 => [b[0] - a[0], b[1] - a[1]];

    if (free(x, y + 1, z)) {
      const o = proj(x, y + 1, z + 1);
      face("f", base, o, sub(o, proj(x + 1, y + 1, z + 1)), sub(o, proj(x, y + 1, z)), d.front);
    }
    if (free(x + 1, y, z)) {
      const o = proj(x + 1, y + 1, z + 1);
      face("r", shade(base, -0.18), o, sub(o, proj(x + 1, y, z + 1)), sub(o, proj(x + 1, y + 1, z)), d.right);
    }
    if (free(x, y, z + 1)) {
      const o = proj(x, y, z + 1);
      face("t", shade(base, 0.18), o, sub(o, proj(x + 1, y, z + 1)), sub(o, proj(x, y + 1, z + 1)), d.top);
    }
    return (
      <g key={d.id} className={animate ? "iso-drop" : undefined} style={animate ? { animationDelay: `${i * stepMs * 2}ms` } : undefined}>
        {faces}
      </g>
    );
  });

  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const pad = 3;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  return (
    <svg
      viewBox={`${minX.toFixed(1)} ${minY.toFixed(1)} ${(Math.max(...xs) - minX + pad).toFixed(1)} ${(Math.max(...ys) - minY + pad).toFixed(1)}`}
      className={className}
      role="img"
      aria-label={title ?? "Dice build drawing"}
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      {drawn}
    </svg>
  );
}
