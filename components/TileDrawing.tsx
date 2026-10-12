import { buildTiles, type Panel, type TileDesign } from "@/lib/tiles";

// Isometric drawing of a magnetic tile build: every square is a see-through
// colored panel with a frame, like the real tiles. Same projection as IsoTower.

type Variant = "blocks" | "brand" | "ink";

const S = 10;
const H = 11.6;

const TILE_COLORS = ["#FF4D4D", "#FF9F1C", "#FFD60A", "#7BD14B", "#1EC8B4", "#3A8DFF", "#9B5DE5", "#FF70A6"];

type V3 = [number, number, number];
type V2 = [number, number];
const proj = ([x, y, z]: V3): V2 => [(x - y) * S, ((x + y) * S) / 2 - z * H];
const fmt = (p: V2) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

function corners(p: Panel): V3[] {
  if (p.axis === "x")
    return [
      [p.x, p.y, p.z],
      [p.x, p.y + 1, p.z],
      [p.x, p.y + 1, p.z + 1],
      [p.x, p.y, p.z + 1],
    ];
  if (p.axis === "y")
    return [
      [p.x, p.y, p.z],
      [p.x + 1, p.y, p.z],
      [p.x + 1, p.y, p.z + 1],
      [p.x, p.y, p.z + 1],
    ];
  return [
    [p.x, p.y, p.z],
    [p.x + 1, p.y, p.z],
    [p.x + 1, p.y + 1, p.z],
    [p.x, p.y + 1, p.z],
  ];
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) =>
    Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt))
      .toString(16)
      .padStart(2, "0");
  return `#${f((n >> 16) & 255)}${f((n >> 8) & 255)}${f(n & 255)}`;
}

function hash(a: number, b: number, c: number, d: number) {
  let h = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791) ^ (d * 2654435761);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

export default function TileDrawing({
  tiles,
  variant = "blocks",
  highlight,
  animate = false,
  stepMs = 70,
  seed = 7,
  className,
  title,
}: {
  tiles: TileDesign;
  variant?: Variant;
  highlight?: number; // room index to emphasise; others are ghosted
  animate?: boolean;
  stepMs?: number;
  seed?: number;
  className?: string;
  title?: string;
}) {
  const { panels } = buildTiles(tiles);
  if (panels.length === 0) return null;

  const drawn = panels.map((p) => {
    const c = corners(p);
    const center = c.reduce<V3>((m, v) => [m[0] + v[0] / 4, m[1] + v[1] / 4, m[2] + v[2] / 4], [0, 0, 0]);
    return { p, pts: c.map(proj), inner: c.map((v) => proj(v.map((n, i) => center[i] + (n - center[i]) * 0.78) as V3)), depth: center[0] + center[1] + center[2] };
  });
  // Back to front, so nearer tiles are drawn over farther ones.
  drawn.sort((a, b) => a.depth - b.depth);

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const d of drawn)
    for (const [x, y] of d.pts) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  const pad = 3;

  function look(p: Panel) {
    if (highlight !== undefined && p.room !== highlight)
      return { fill: "#F7FAFF", opacity: 0.55, stroke: "#C9DAF5", width: 0.6, frame: false };
    if (highlight !== undefined) return { fill: "#5E97F2", opacity: 0.45, stroke: "#1146B8", width: 1, frame: true };
    if (variant === "ink") return { fill: "#EAF2FF", opacity: 0.6, stroke: "#1146B8", width: 0.8, frame: true };
    const base = TILE_COLORS[hash(p.x + (p.axis === "x" ? 50 : 0), p.y + (p.axis === "y" ? 50 : 0), p.z, seed) % TILE_COLORS.length];
    return { fill: base, opacity: 0.42, stroke: shade(base, -0.3), width: 1, frame: true };
  }

  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;
  return (
    <svg
      viewBox={`${(minX - pad).toFixed(1)} ${(minY - pad).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`}
      className={className}
      role="img"
      aria-label={title ?? "Tile build drawing"}
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      {drawn.map(({ p, pts, inner }) => {
        const l = look(p);
        return (
          <g
            key={`${p.axis}-${p.x}-${p.y}-${p.z}`}
            className={animate ? "iso-drop" : undefined}
            style={animate ? { animationDelay: `${p.room * stepMs * 5}ms` } : undefined}
          >
            <polygon points={pts.map(fmt).join(" ")} fill={l.fill} fillOpacity={l.opacity} stroke={l.stroke} strokeWidth={l.width} />
            {l.frame ? (
              <polygon points={inner.map(fmt).join(" ")} fill="none" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={0.45} />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
