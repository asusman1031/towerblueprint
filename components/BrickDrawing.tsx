import { BRICK_COLORS, buildBricks, type BrickDesign, type PlacedBrick } from "@/lib/bricks";

// Isometric drawing of a studded brick build. The build is cut into cells one
// stud wide and one plate tall and painted back to front like IsoTower, with
// outlines only where one brick meets another, and studs on top of each brick.
// A curved ramp is drawn the same way, one plate-high slice at a time, so it
// slots into the back-to-front order like any other brick.

type Variant = "blocks" | "brand" | "ink";

const S = 10; // half the screen width of one stud
const P = 4.64; // screen height of one plate (a brick is 3 plates)

type V2 = [number, number];
const proj = (x: number, y: number, z: number): V2 => [(x - y) * S, ((x + y) * S) / 2 - z * P];
const fmt = (p: V2) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

const TIP = 0.5; // how thick a ramp's tip is, in plates

// How high a ramp's top is (in plates above its bottom) at `a` studs from its
// tip: flat near the tip and steep near the tall end, like a skate ramp.
function rampHeight(len: number, h: number, a: number) {
  const c = len - 1;
  if (a >= c) return h;
  const t = Math.max(0, a / c);
  return TIP + (h - TIP) * t * t;
}
// How far from the tip the ramp's top reaches height `z`.
const rampReach = (len: number, h: number, z: number) => (z <= TIP ? 0 : (len - 1) * Math.sqrt((z - TIP) / (h - TIP)));

// A ramp's own frame: `a` runs from the tip to the tall end, `c` across it.
function rampFrame(b: PlacedBrick) {
  const alongX = b.ramp === "left" || b.ramp === "right";
  const len = alongX ? b.w : b.d;
  const wide = alongX ? b.d : b.w;
  const world = (a: number, c: number, zz: number): V2 => {
    if (b.ramp === "left") return proj(b.x + a, b.y + c, b.z + zz);
    if (b.ramp === "right") return proj(b.x + b.w - a, b.y + c, b.z + zz);
    if (b.ramp === "back") return proj(b.x + c, b.y + a, b.z + zz);
    return proj(b.x + c, b.y + b.d - a, b.z + zz);
  };
  // The grid cell a stud-sized slice of the ramp sits in.
  const cell = (i: number, c: number): [number, number] => {
    if (b.ramp === "left") return [b.x + i, b.y + c];
    if (b.ramp === "right") return [b.x + b.w - 1 - i, b.y + c];
    if (b.ramp === "back") return [b.x + c, b.y + i];
    return [b.x + c, b.y + b.d - 1 - i];
  };
  return { len, wide, world, cell, alongX };
}

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
  const ramps = bricks.filter((b) => b.ramp);
  for (const b of bricks) {
    if (b.ramp) continue;
    for (let x = b.x; x < b.x + b.w; x++)
      for (let y = b.y; y < b.y + b.d; y++) for (let z = b.z; z < b.z + b.h; z++) owner.set(key(x, y, z), b.id);
  }
  // A ramp only hides what's next to the solid part under its curve.
  const rampCells = new Set<string>();
  for (const b of ramps) {
    const f = rampFrame(b);
    for (let i = 0; i < f.len; i++)
      for (let c = 0; c < f.wide; c++)
        for (let k = 0; k < b.h && rampHeight(f.len, b.h, i) >= k + 1; k++) {
          const [x, y] = f.cell(i, c);
          owner.set(key(x, y, b.z + k), b.id);
          rampCells.add(key(x, y, b.z + k));
        }
  }
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

  const cells = [...owner.entries()]
    .filter(([k]) => !rampCells.has(k))
    .map(([k, id]) => {
      const [x, y, z] = k.split(",").map(Number);
      return { x, y, z, id };
    });
  const rampLevels = ramps.flatMap((b) => Array.from({ length: b.h }, (_, k) => b.z + k));
  const levels = [...new Set([...cells.map((c) => c.z), ...rampLevels])].sort((a, b) => a - b);

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const c of [
    ...cells,
    ...ramps.flatMap((b) =>
      [b.x, b.x + b.w - 1].flatMap((x) =>
        [b.y, b.y + b.d - 1].flatMap((y) => [b.z, b.z + b.h - 1].map((z) => ({ x, y, z, id: b.id }))),
      ),
    ),
  ])
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
    const faces: React.ReactElement[] = [];
    const studs: React.ReactElement[] = [];
    const stud = (cx: number, cy: number, col: ReturnType<typeof look>, k: string) => {
      // A stud: a short cylinder in the middle of its square.
      const rx = 4.1;
      const ry = 2.05;
      const sh = 3.2;
      studs.push(
        <g key={k}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={col.right} />
          <rect x={cx - rx} y={cy - sh} width={rx * 2} height={sh} fill={col.left} />
          <ellipse cx={cx} cy={cy - sh} rx={rx} ry={ry} fill={col.top} stroke={col.line} strokeWidth={col.ghost ? 0.3 : 0.45} />
        </g>,
      );
    };
    const drawCell = (c: (typeof cells)[number]) => {
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
          const [cx, cy] = proj(x + 0.5, y + 0.5, t);
          stud(cx, cy, col, `s-${x}-${y}`);
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
    };

    // One plate-high slice of a ramp: its side shows the curve, its top is the
    // curved surface, and the top slice has the flat tall end with studs.
    const drawSlab = (b: PlacedBrick, k: number) => {
      const col = look(b.id);
      const f = rampFrame(b);
      const P2 = (a: number, c: number, zz: number) => f.world(a, c, zz);
      const pts = (list: V2[]) => list.map(fmt).join(" ");
      const lo = k === 0 ? 0 : rampReach(f.len, b.h, k);
      const hi = rampReach(f.len, b.h, k + 1);
      const curve = Array.from({ length: 7 }, (_, i) => lo + ((hi - lo) * i) / 6).map(
        (a) => [a, Math.max(k, Math.min(k + 1, rampHeight(f.len, b.h, a)))] as const,
      );
      const top = k + 1 === b.h;
      // Faces toward the viewer (+x, +y) use the side colors, like a brick's.
      const sideFill = f.alongX ? col.left : col.right;
      const endFill = (dir: string) => (dir === "left" || dir === "right" ? col.right : col.left);
      const lines: [V2, V2][] = [];
      const line = (p: V2, q: V2) => lines.push([p, q]);
      const key = `r${b.id}-${k}`;
      const face = (fill: string, list: V2[], tag: string) =>
        faces.push(<polygon key={`${key}-${tag}`} points={pts(list)} fill={fill} stroke={fill} strokeWidth={0.35} />);

      // The curved top surface.
      face(
        col.top,
        [...curve.map(([a, zz]) => P2(a, 0, zz)), ...[...curve].reverse().map(([a, zz]) => P2(a, f.wide, zz))],
        "c",
      );
      for (let i = 1; i < curve.length; i++) line(P2(curve[i - 1][0], 0, curve[i - 1][1]), P2(curve[i][0], 0, curve[i][1]));
      // The side, showing the curve.
      const side: V2[] = [
        P2(lo, f.wide, k),
        P2(f.len, f.wide, k),
        P2(f.len, f.wide, k + 1),
        ...[...curve].reverse().map(([a, zz]) => P2(a, f.wide, zz)),
      ];
      face(sideFill, side, "s");
      for (let i = 1; i < curve.length; i++)
        line(P2(curve[i - 1][0], f.wide, curve[i - 1][1]), P2(curve[i][0], f.wide, curve[i][1]));
      line(P2(f.len, f.wide, k), P2(f.len, f.wide, k + 1));
      if (k === 0) {
        line(P2(0, f.wide, 0), P2(f.len, f.wide, 0));
        line(P2(0, f.wide, 0), P2(0, f.wide, TIP));
        line(P2(0, 0, TIP), P2(0, f.wide, TIP));
      }
      // The tall end faces the viewer for a ramp pointing left or back; the tip for one pointing right or front.
      if (b.ramp === "left" || b.ramp === "back") {
        face(endFill(b.ramp), [P2(f.len, 0, k), P2(f.len, f.wide, k), P2(f.len, f.wide, k + 1), P2(f.len, 0, k + 1)], "e");
        line(P2(f.len, 0, k), P2(f.len, 0, k + 1));
        if (k === 0) line(P2(f.len, 0, 0), P2(f.len, f.wide, 0));
      } else if (k === 0) {
        face(endFill(b.ramp!), [P2(0, 0, 0), P2(0, f.wide, 0), P2(0, f.wide, TIP), P2(0, 0, TIP)], "t");
        line(P2(0, 0, 0), P2(0, f.wide, 0));
        line(P2(0, 0, 0), P2(0, 0, TIP));
      }
      if (top) {
        const flat: V2[] = [P2(f.len - 1, 0, b.h), P2(f.len, 0, b.h), P2(f.len, f.wide, b.h), P2(f.len - 1, f.wide, b.h)];
        face(col.top, flat, "f");
        flat.forEach((p, i) => line(p, flat[(i + 1) % 4]));
        for (let c = 0; c < f.wide; c++) {
          const [cx, cy] = P2(f.len - 0.5, c + 0.5, b.h);
          stud(cx, cy, col, `${key}-s${c}`);
        }
      }
      lines.forEach(([p, q], i) =>
        faces.push(
          <line
            key={`${key}-l${i}`}
            x1={p[0]}
            y1={p[1]}
            x2={q[0]}
            y2={q[1]}
            stroke={col.line}
            strokeWidth={col.ghost ? 0.4 : 0.6}
            strokeLinecap="round"
          />,
        ),
      );
    };

    // Back to front within the layer: cells by x + y, and each ramp slice by its corner.
    [
      ...cells.filter((c) => c.z === z).map((c) => ({ at: c.x + c.y, tie: c.x, draw: () => drawCell(c) })),
      ...ramps
        .filter((b) => z >= b.z && z < b.z + b.h)
        .map((b) => ({ at: b.x + b.y, tie: b.x, draw: () => drawSlab(b, z - b.z) })),
    ]
      .sort((p, q) => p.at - q.at || p.tie - q.tie)
      .forEach((e) => e.draw());
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
