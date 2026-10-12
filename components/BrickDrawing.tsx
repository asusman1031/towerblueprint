import { BRICK_COLORS, buildBricks, type BrickDesign } from "@/lib/bricks";

// Isometric drawing of a studded brick build. The build is cut into cells one
// stud wide and one plate tall and painted back to front like IsoTower, with
// outlines only where one brick meets another, and studs on top of each brick.

type Variant = "blocks" | "brand" | "ink";

const S = 10; // half the screen width of one stud
const P = 4.64; // screen height of one plate (a brick is 3 plates)

type V2 = [number, number];
const proj = (x: number, y: number, z: number): V2 => [(x - y) * S, ((x + y) * S) / 2 - z * P];
const fmt = (p: V2) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) =>
    Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt))
      .toString(16)
      .padStart(2, "0");
  return `#${f((n >> 16) & 255)}${f((n >> 8) & 255)}${f(n & 255)}`;
}

export default function BrickDrawing({
  bricks: design,
  variant = "blocks",
  highlight,
  animate = false,
  stepMs = 70,
  className,
  title,
}: {
  bricks: BrickDesign;
  variant?: Variant;
  highlight?: number; // step index to emphasise; other steps are ghosted
  animate?: boolean;
  stepMs?: number;
  className?: string;
  title?: string;
}) {
  const { bricks } = buildBricks(design);
  if (bricks.length === 0) return null;

  // Which brick fills each cell.
  const owner = new Map<string, number>();
  const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
  for (const b of bricks)
    for (let x = b.x; x < b.x + b.w; x++)
      for (let y = b.y; y < b.y + b.d; y++) for (let z = b.z; z < b.z + b.h; z++) owner.set(key(x, y, z), b.id);
  const at = (x: number, y: number, z: number) => owner.get(key(x, y, z));
  const byId = new Map(bricks.map((b) => [b.id, b]));

  function look(id: number) {
    const b = byId.get(id)!;
    // Other steps are ghosted; the highlighted step keeps its real colors, so builders can match them.
    if (highlight !== undefined && b.step !== highlight)
      return { top: "#F7FAFF", left: "#EEF4FF", right: "#E2ECFC", line: "#C9DAF5", ghost: true };
    if (variant === "ink") return { top: "#FFFFFF", left: "#DCEAFF", right: "#B9D4FF", line: "#1146B8", ghost: false };
    const base = BRICK_COLORS[b.color];
    return { top: shade(base, 0.2), left: base, right: shade(base, -0.2), line: "rgba(20,25,40,0.55)", ghost: false };
  }

  const cells = [...owner.entries()].map(([k, id]) => {
    const [x, y, z] = k.split(",").map(Number);
    return { x, y, z, id };
  });
  const levels = [...new Set(cells.map((c) => c.z))].sort((a, b) => a - b);

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const c of cells)
    for (const [dx, dy, dz] of [
      [0, 0, 1.8],
      [1, 0, 0],
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 1.8],
      [0, 1, 1.8],
    ]) {
      const [px, py] = proj(c.x + dx, c.y + dy, c.z + dz);
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    }

  const groups = levels.map((z, li) => {
    const row = cells.filter((c) => c.z === z).sort((a, b) => a.x + a.y - (b.x + b.y) || a.x - b.x);
    const faces: React.ReactElement[] = [];
    const studs: React.ReactElement[] = [];
    for (const c of row) {
      const { x, y, id } = c;
      const col = look(id);
      const b = byId.get(id)!;
      const same = (nx: number, ny: number, nz: number) => at(nx, ny, nz) === id;
      const lines: [V2, V2][] = [];
      const face = (fill: string, pts: V2[], k: string) =>
        faces.push(
          <polygon key={`${k}-${x}-${y}`} points={pts.map(fmt).join(" ")} fill={fill} stroke={fill} strokeWidth={0.35} />,
        );

      if (at(x, y, z + 1) === undefined) {
        const t = z + 1;
        face(col.top, [proj(x, y, t), proj(x + 1, y, t), proj(x + 1, y + 1, t), proj(x, y + 1, t)], "t");
        if (!same(x, y - 1, z)) lines.push([proj(x, y, t), proj(x + 1, y, t)]);
        if (!same(x, y + 1, z)) lines.push([proj(x, y + 1, t), proj(x + 1, y + 1, t)]);
        if (!same(x - 1, y, z)) lines.push([proj(x, y, t), proj(x, y + 1, t)]);
        if (!same(x + 1, y, z)) lines.push([proj(x + 1, y, t), proj(x + 1, y + 1, t)]);
        if (t === b.z + b.h) {
          // A stud: a short cylinder in the middle of this square.
          const [cx, cy] = proj(x + 0.5, y + 0.5, t);
          const rx = 4.1;
          const ry = 2.05;
          const sh = 3.2;
          studs.push(
            <g key={`s-${x}-${y}`}>
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={col.right} />
              <rect x={cx - rx} y={cy - sh} width={rx * 2} height={sh} fill={col.left} />
              <ellipse
                cx={cx}
                cy={cy - sh}
                rx={rx}
                ry={ry}
                fill={col.top}
                stroke={col.line}
                strokeWidth={col.ghost ? 0.3 : 0.45}
              />
            </g>,
          );
        }
      }
      if (at(x, y + 1, z) === undefined) {
        face(col.left, [proj(x, y + 1, z), proj(x + 1, y + 1, z), proj(x + 1, y + 1, z + 1), proj(x, y + 1, z + 1)], "l");
        if (!same(x, y, z + 1)) lines.push([proj(x, y + 1, z + 1), proj(x + 1, y + 1, z + 1)]);
        if (!same(x, y, z - 1)) lines.push([proj(x, y + 1, z), proj(x + 1, y + 1, z)]);
        if (!same(x - 1, y, z)) lines.push([proj(x, y + 1, z), proj(x, y + 1, z + 1)]);
        if (!same(x + 1, y, z)) lines.push([proj(x + 1, y + 1, z), proj(x + 1, y + 1, z + 1)]);
      }
      if (at(x + 1, y, z) === undefined) {
        face(col.right, [proj(x + 1, y, z), proj(x + 1, y + 1, z), proj(x + 1, y + 1, z + 1), proj(x + 1, y, z + 1)], "r");
        if (!same(x, y, z + 1)) lines.push([proj(x + 1, y, z + 1), proj(x + 1, y + 1, z + 1)]);
        if (!same(x, y, z - 1)) lines.push([proj(x + 1, y, z), proj(x + 1, y + 1, z)]);
        if (!same(x, y - 1, z)) lines.push([proj(x + 1, y, z), proj(x + 1, y, z + 1)]);
        if (!same(x, y + 1, z)) lines.push([proj(x + 1, y + 1, z), proj(x + 1, y + 1, z + 1)]);
      }
      lines.forEach(([a, bb], i) =>
        faces.push(
          <line
            key={`e-${x}-${y}-${i}`}
            x1={a[0]}
            y1={a[1]}
            x2={bb[0]}
            y2={bb[1]}
            stroke={col.line}
            strokeWidth={col.ghost ? 0.4 : 0.6}
            strokeLinecap="round"
          />,
        ),
      );
    }
    return (
      <g
        key={z}
        className={animate ? "iso-drop" : undefined}
        style={animate ? { animationDelay: `${li * stepMs}ms` } : undefined}
      >
        {faces}
        {studs}
      </g>
    );
  });

  const pad = 3;
  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;
  return (
    <svg
      viewBox={`${(minX - pad).toFixed(1)} ${(minY - pad).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`}
      className={className}
      role="img"
      aria-label={title ?? "Brick build drawing"}
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      {groups}
    </svg>
  );
}
