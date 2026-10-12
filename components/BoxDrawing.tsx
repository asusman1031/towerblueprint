import { buildBoxes, type BoxDesign, type BoxStats } from "@/lib/boxes";

// Isometric drawing of a cardboard box build. Boxes are drawn bottom to top;
// a box that stands inside another is drawn after that box's inside walls and
// before its front walls, so it looks like it pokes out of the top.

type Variant = "blocks" | "brand" | "ink";
type V2 = [number, number];

const S = 3; // half the screen width of one inch
const V = 3.4; // screen height of one inch
const proj = (x: number, y: number, z: number): V2 => [(x - y) * S, ((x + y) * S) / 2 - z * V];
const fmt = (p: V2) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

type Look = {
  top: string;
  left: string;
  right: string;
  inside: string;
  wallX: string;
  wallY: string;
  flap: string;
  line: string;
  tape: string;
  ghost: boolean;
};

const LOOKS: Record<"card" | "ghost" | "ink", Look> = {
  card: {
    top: "#E2BE8A",
    left: "#CFA46C",
    right: "#B88A55",
    inside: "#6E5232",
    wallX: "#8A6A43",
    wallY: "#9C7A4E",
    flap: "#C9A06A",
    line: "#5C4026",
    tape: "#2E3440",
    ghost: false,
  },
  ghost: {
    top: "#F7FAFF",
    left: "#EEF4FF",
    right: "#E2ECFC",
    inside: "#DCE7F8",
    wallX: "#E2ECFC",
    wallY: "#E9F0FC",
    flap: "#EEF4FF",
    line: "#C9DAF5",
    tape: "#DCE7F8",
    ghost: true,
  },
  ink: {
    top: "#FFFFFF",
    left: "#DCEAFF",
    right: "#B9D4FF",
    inside: "#8FB5F0",
    wallX: "#A9C8F5",
    wallY: "#C2D8F8",
    flap: "#EAF2FF",
    line: "#1146B8",
    tape: "#1146B8",
    ghost: false,
  },
};

// Floppy flaps don't all lean the same way.
const LEAN = { back: 0.32, left: 0.5, front: 0.42, right: 0.56 }; // radians from straight up

export default function BoxDrawing({
  boxes: design,
  variant = "blocks",
  highlight,
  animate = false,
  stepMs = 70,
  className,
  title,
}: {
  boxes: BoxDesign;
  variant?: Variant;
  highlight?: number; // box index to emphasise; the others are ghosted
  animate?: boolean;
  stepMs?: number;
  className?: string;
  title?: string;
}) {
  const { boxes } = buildBoxes(design);
  if (!boxes.length) return null;

  const pts: V2[] = [];
  const poly = (look: Look, fill: string, p: [number, number, number][], key: string, dash = false) => {
    const sp = p.map(([x, y, z]) => proj(x, y, z));
    pts.push(...sp);
    return (
      <polygon
        key={key}
        points={sp.map(fmt).join(" ")}
        fill={fill}
        stroke={look.line}
        strokeWidth={look.ghost ? 0.5 : 0.8}
        strokeDasharray={dash ? "2 1.5" : undefined}
      />
    );
  };

  const lookOf = (b: BoxStats) =>
    highlight !== undefined && b.index !== highlight ? LOOKS.ghost : variant === "ink" ? LOOKS.ink : LOOKS.card;

  function drawBox(b: BoxStats, children: React.ReactElement[]): React.ReactElement {
    const look = lookOf(b);
    const [x0, y0, z0] = [b.x, b.y, b.z];
    const [x1, y1, z1] = [b.x + b.w, b.y + b.d, b.z + b.h];
    const L = Math.min(b.w, b.d) / 2; // flaps reach halfway across, so they meet in the middle
    const k = `b${b.index}`;
    const back: React.ReactElement[] = [];
    const front: React.ReactElement[] = [];

    if (b.flaps === "floor") {
      // Upside down, flaps spread flat on the floor like a skirt.
      back.push(
        poly(look, look.flap, [[x0, y0 - L, z0], [x1, y0 - L, z0], [x1, y0, z0], [x0, y0, z0]], `${k}-fb`),
        poly(look, look.flap, [[x0 - L, y0, z0], [x0, y0, z0], [x0, y1, z0], [x0 - L, y1, z0]], `${k}-fl`),
        poly(look, look.top, [[x0, y1, z0], [x1, y1, z0], [x1, y1 + L, z0], [x0, y1 + L, z0]], `${k}-ff`),
        poly(look, look.top, [[x1, y0, z0], [x1 + L, y0, z0], [x1 + L, y1, z0], [x1, y1, z0]], `${k}-fr`),
      );
    }

    const s = (a: number) => Math.sin(a) * L;
    const c = (a: number) => Math.cos(a) * L;
    if (b.flaps === "up") {
      back.push(
        poly(look, look.flap, [[x0, y0, z1], [x1, y0, z1], [x1, y0 - s(LEAN.back), z1 + c(LEAN.back)], [x0, y0 - s(LEAN.back), z1 + c(LEAN.back)]], `${k}-ub`),
        poly(look, look.flap, [[x0, y0, z1], [x0, y1, z1], [x0 - s(LEAN.left), y1, z1 + c(LEAN.left)], [x0 - s(LEAN.left), y0, z1 + c(LEAN.left)]], `${k}-ul`),
        // Looking down into the open box: the dark inside and the two far walls.
        poly(look, look.inside, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], `${k}-in`),
        poly(look, look.wallX, [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], `${k}-wx`),
        poly(look, look.wallY, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], `${k}-wy`),
      );
      front.push(
        poly(look, look.left, [[x0, y1, z1], [x1, y1, z1], [x1, y1 + s(LEAN.front), z1 + c(LEAN.front)], [x0, y1 + s(LEAN.front), z1 + c(LEAN.front)]], `${k}-uf`),
        poly(look, look.right, [[x1, y0, z1], [x1, y1, z1], [x1 + s(LEAN.right), y1, z1 + c(LEAN.right)], [x1 + s(LEAN.right), y0, z1 + c(LEAN.right)]], `${k}-ur`),
      );
    }

    const walls = [
      poly(look, look.left, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], `${k}-l`),
      poly(look, look.right, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], `${k}-r`),
      ...(b.flaps === "up" ? [] : [poly(look, look.top, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], `${k}-t`)]),
    ];
    if (b.tape && b.flaps !== "up") {
      // Packing tape along the seam, running over the end of the box.
      const m = (y0 + y1) / 2;
      const t = Math.max(0.8, b.d * 0.07);
      const drop = Math.min(3, b.h / 3);
      walls.push(
        poly(look, look.tape, [[x0, m - t, z1], [x1, m - t, z1], [x1, m + t, z1], [x0, m + t, z1]], `${k}-tt`),
        poly(look, look.tape, [[x1, m - t, z1], [x1, m + t, z1], [x1, m + t, z1 - drop], [x1, m - t, z1 - drop]], `${k}-te`),
      );
    }

    return (
      <g
        key={k}
        className={animate ? "iso-drop" : undefined}
        style={animate ? { animationDelay: `${b.index * stepMs * 4}ms` } : undefined}
      >
        {back}
        {children}
        {walls}
        {front}
      </g>
    );
  }

  // A box marked "inside" belongs to the box before it.
  const groups: { box: BoxStats; inner: BoxStats[] }[] = [];
  for (const b of boxes) {
    const last = groups[groups.length - 1];
    if (b.inside && last) last.inner.push(b);
    else groups.push({ box: b, inner: [] });
  }
  const drawn = groups.map((g) =>
    drawBox(
      g.box,
      g.inner.map((b) => drawBox(b, [])),
    ),
  );

  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const pad = 3;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const w = Math.max(...xs) - Math.min(...xs) + pad * 2;
  const h = Math.max(...ys) - Math.min(...ys) + pad * 2;
  return (
    <svg
      viewBox={`${minX.toFixed(1)} ${minY.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`}
      className={className}
      role="img"
      aria-label={title ?? "Box build drawing"}
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      {drawn}
    </svg>
  );
}
