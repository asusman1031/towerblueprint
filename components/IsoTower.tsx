import BoxDrawing from "@/components/BoxDrawing";
import BrickDrawing from "@/components/BrickDrawing";
import TileDrawing from "@/components/TileDrawing";
import type { BoxDesign } from "@/lib/boxes";
import type { BrickDesign } from "@/lib/bricks";
import { buildStructure, type Structure, type Surface } from "@/lib/structure";
import type { TileDesign } from "@/lib/tiles";
import { buildCubes, type Section } from "@/lib/tower";

// Isometric SVG drawing of a tower or a structure. Pure render, works on server and client.
// Painter's order: layer by layer from the bottom, then back to front.

type Variant = "blocks" | "brand" | "ink";

type Props = {
  sections?: Section[];
  structure?: Structure | null; // drawn instead of sections when set
  tiles?: TileDesign | null; // a magnetic tile build, drawn as see-through panels
  bricks?: BrickDesign | null; // a LEGO-style brick build, drawn with studs
  boxes?: BoxDesign | null; // a cardboard box build
  variant?: Variant;
  highlight?: number; // section (or structure part) index to emphasise; others are ghosted
  animate?: boolean;
  stepMs?: number;
  seed?: number;
  className?: string;
  title?: string;
};

const S = 10; // half tile width
const H = 11.6; // cube height on screen

// Bright "texture" colors, like a box of magnetic blocks.
const BLOCK_COLORS = [
  "#5DA130", // grass
  "#8B5A2B", // dirt
  "#8A8F98", // stone
  "#E8561C", // lava
  "#2E9BE6", // water
  "#3FD3D8", // diamond
  "#F6C42B", // gold
  "#B5452F", // brick
  "#8D5BD6", // amethyst
  "#E9EEF3", // snow
  "#3B2E5A", // obsidian
  "#3E8E3E", // leaves
  "#E3CF8C", // sand
  "#C81E1E", // redstone
  "#22C063", // emerald
  "#5B6470", // cobble
];

const BRAND_COLORS = ["#1E63E9", "#2F7BF5", "#4BA9FF", "#1650C8", "#FFC21A", "#2F7BF5", "#4BA9FF", "#FF8A1F"];

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) =>
    Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt))
      .toString(16)
      .padStart(2, "0");
  return `#${f((n >> 16) & 255)}${f((n >> 8) & 255)}${f(n & 255)}`;
}

function hash(x: number, y: number, z: number, seed: number) {
  let h = (x * 73856093) ^ (y * 19349663) ^ (z * 83492791) ^ (seed * 2654435761);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

type V2 = [number, number];
const proj = (x: number, y: number, z: number): V2 => [(x - y) * S, ((x + y) * S) / 2 - z * H];
const fmt = (p: V2) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

// A face from origin o along unit edges u and v, optionally split 2x2 for a pixel texture.
function facePolys(o: V2, u: V2, v: V2, split: boolean) {
  const at = (a: number, b: number): V2 => [o[0] + u[0] * a + v[0] * b, o[1] + u[1] * a + v[1] * b];
  if (!split) return [[at(0, 0), at(1, 0), at(1, 1), at(0, 1)].map(fmt).join(" ")];
  const out: string[] = [];
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) {
      const a = i / 2;
      const b = j / 2;
      out.push([at(a, b), at(a + 0.5, b), at(a + 0.5, b + 0.5), at(a, b + 0.5)].map(fmt).join(" "));
    }
  return out;
}

const U_X = proj(1, 0, 0);
const U_Y = proj(0, 1, 0);
const U_Z = proj(0, 0, 1);

export default function IsoTower({
  sections = [],
  structure,
  tiles,
  bricks,
  boxes,
  variant = "blocks",
  highlight,
  animate = false,
  stepMs = 70,
  seed = 7,
  className,
  title,
}: Props) {
  if (boxes) {
    return (
      <BoxDrawing
        boxes={boxes}
        variant={variant}
        highlight={highlight}
        animate={animate}
        stepMs={stepMs}
        className={className}
        title={title}
      />
    );
  }
  if (bricks) {
    return (
      <BrickDrawing
        bricks={bricks}
        variant={variant}
        highlight={highlight}
        animate={animate}
        stepMs={stepMs}
        className={className}
        title={title}
      />
    );
  }
  if (tiles) {
    return (
      <TileDrawing
        tiles={tiles}
        variant={variant}
        highlight={highlight}
        animate={animate}
        stepMs={stepMs}
        seed={seed}
        className={className}
        title={title}
      />
    );
  }
  const built = structure ? buildStructure(structure) : null;
  const cubes = built ? built.cubes : buildCubes(sections).map((c) => ({ ...c, group: c.section }));
  const surfaces: Surface[] = built?.surfaces ?? [];
  if (cubes.length === 0) return null;

  const filled = new Set(cubes.map((c) => `${c.x},${c.y},${c.z}`));
  const has = (x: number, y: number, z: number) => filled.has(`${x},${y},${z}`);

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const f of surfaces) {
    for (const [x, y] of [
      [f.x0, f.y0],
      [f.x1, f.y0],
      [f.x0, f.y1],
      [f.x1, f.y1],
    ]) {
      const [px, py] = proj(x, y, f.z);
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py + 13);
    }
  }
  for (const c of cubes) {
    for (const [dx, dy, dz] of [
      [0, 0, 1],
      [1, 0, 0],
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 1],
      [0, 1, 1],
    ]) {
      const [px, py] = proj(c.x + dx, c.y + dy, c.z + dz);
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    }
  }
  const pad = 3;

  const layers = new Map<number, typeof cubes>();
  for (const c of cubes) {
    if (!layers.has(c.z)) layers.set(c.z, []);
    layers.get(c.z)!.push(c);
  }

  const texture = variant === "blocks";
  const stroke = variant === "ink" ? "#1146B8" : "rgba(10,25,60,0.45)";
  const strokeWidth = variant === "ink" ? 0.7 : 0.5;

  function colorsFor(c: (typeof cubes)[number]) {
    const ghost = highlight !== undefined && c.group !== highlight;
    if (ghost) return { top: "#F7FAFF", left: "#EEF4FF", right: "#E2ECFC", ghost: true };
    if (highlight !== undefined) return { top: "#A9CBFF", left: "#5E97F2", right: "#3A76DB", ghost: false };
    if (variant === "ink") return { top: "#FFFFFF", left: "#DCEAFF", right: "#B9D4FF", ghost: false };
    const palette = variant === "brand" ? BRAND_COLORS : BLOCK_COLORS;
    const base = palette[hash(c.x, c.y, c.z, seed) % palette.length];
    return { top: shade(base, 0.22), left: base, right: shade(base, -0.22), ghost: false };
  }

  // Furniture (a chair seat, the table) is a dashed shape drawn just before the blocks resting on it.
  // Its name goes under the front corner, on top of everything.
  function surface(f: Surface, i: number) {
    const pts = [proj(f.x0, f.y0, f.z), proj(f.x1, f.y0, f.z), proj(f.x1, f.y1, f.z), proj(f.x0, f.y1, f.z)];
    return (
      <polygon
        key={`surface-${i}`}
        points={pts.map(fmt).join(" ")}
        fill={variant === "ink" ? "#F4F8FF" : "rgba(255,255,255,0.55)"}
        stroke={variant === "ink" ? "#8DB3EE" : "rgba(17,70,184,0.45)"}
        strokeWidth={0.8}
        strokeDasharray="3 2"
      />
    );
  }
  // X and O marks, painted onto the top face of a block like a game piece.
  const markColor = variant === "ink" ? "#1146B8" : "#1E63E9";
  const marks = (built?.marks ?? []).map((m, i) => {
    const [ox, oy] = proj(m.x, m.y, m.z + 1);
    return (
      <g
        key={`mark-${i}`}
        transform={`matrix(${U_X[0]} ${U_X[1]} ${U_Y[0]} ${U_Y[1]} ${ox.toFixed(1)} ${oy.toFixed(1)})`}
        fill="none"
        stroke={markColor}
        strokeWidth={1.8}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      >
        {m.mark === "X" ? (
          // Lines along the block's edges look like an X once the top face is tilted.
          <path d="M0.5 0.2 L0.5 0.8 M0.2 0.5 L0.8 0.5" vectorEffect="non-scaling-stroke" />
        ) : (
          <circle cx={0.5} cy={0.5} r={0.25} vectorEffect="non-scaling-stroke" />
        )}
      </g>
    );
  });

  const labels = surfaces.map((f, i) => {
    const [lx, ly] = proj(f.x1, f.y1, f.z);
    return (
      <text
        key={`label-${i}`}
        x={lx}
        y={ly + 11}
        textAnchor="middle"
        fontSize={9}
        fontWeight={800}
        fill={variant === "ink" ? "#5F86C9" : "rgba(17,70,184,0.75)"}
        fontFamily="Nunito, sans-serif"
      >
        {f.label.charAt(0).toUpperCase() + f.label.slice(1)}
      </text>
    );
  });

  const zs = new Set([...layers.keys(), ...surfaces.map((f) => f.z)]);
  const groups = [...zs]
    .sort((a, b) => a - b)
    .map((z) => {
      const under = surfaces.flatMap((f, i) => (f.z === z ? [surface(f, i)] : []));
      const row = (layers.get(z) ?? []).sort((a, b) => a.x + a.y - (b.x + b.y) || a.x - b.x);
      const polys: React.ReactElement[] = [];
      for (const c of row) {
        const col = colorsFor(c);
        const jitter = (k: number) => (texture && !col.ghost ? ((hash(c.x, c.y, c.z * 7 + k, seed) % 5) - 2) * 0.035 : 0);
        const faces: [string, V2, V2, V2][] = [];
        if (!has(c.x, c.y, c.z + 1)) faces.push([col.top, proj(c.x, c.y, c.z + 1), U_X, U_Y]);
        if (!has(c.x, c.y + 1, c.z)) faces.push([col.left, proj(c.x, c.y + 1, c.z), U_X, U_Z]);
        if (!has(c.x + 1, c.y, c.z)) faces.push([col.right, proj(c.x + 1, c.y, c.z), U_Y, U_Z]);
        faces.forEach(([fill, o, u, v], fi) => {
          const parts = facePolys(o, u, v, texture && !col.ghost);
          parts.forEach((pts, pi) => {
            const j = jitter(fi * 4 + pi);
            polys.push(
              <polygon
                key={`${c.x}_${c.y}-${fi}-${pi}`}
                points={pts}
                fill={j ? shade(fill, j) : fill}
                stroke={parts.length > 1 ? "none" : col.ghost ? "#C9DAF5" : stroke}
                strokeWidth={strokeWidth}
              />,
            );
          });
          if (parts.length > 1) {
            polys.push(
              <polygon
                key={`${c.x}_${c.y}-${fi}-edge`}
                points={facePolys(o, u, v, false)[0]}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeWidth}
              />,
            );
          }
        });
      }
      return (
        <g
          key={z}
          className={animate ? "iso-drop" : undefined}
          style={animate ? { animationDelay: `${z * stepMs}ms` } : undefined}
        >
          {under}
          {polys}
        </g>
      );
    });

  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;
  return (
    <svg
      viewBox={`${(minX - pad).toFixed(1)} ${(minY - pad).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`}
      className={className}
      role="img"
      aria-label={title ?? "Tower drawing"}
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      {groups}
      {marks}
      {labels}
    </svg>
  );
}
