// Builds made of studded building bricks, like LEGO DUPLO. A brick build is a
// list of steps, and each step is a list of bricks. A brick is w × d studs and
// h plates tall (a plate is the thin piece, a regular brick is 3 plates, a tall
// brick 6), standing at x, y (in studs) and z (in plates). Bricks can stick out
// past the ones below, because the studs hold them on. A curved ramp is a
// brick whose top swoops down from a tall end (with studs) to a thin tip; `ramp`
// says which way the tip points, and w × d × h is the box it fits in.

export const BRICK_COLORS = {
  red: "#D7262E",
  orange: "#F7841F",
  yellow: "#FFCD00",
  lime: "#8DC63F",
  green: "#2BA84A",
  blue: "#1F5BC6",
  sky: "#5DA9E9",
  purple: "#8E4FC4",
  pink: "#F29BC1",
  white: "#F4F4F4",
  black: "#2B2B2B",
  brown: "#8A5A35",
  gray: "#9AA1A8",
} as const;
export type BrickColor = keyof typeof BRICK_COLORS;
const COLOR_NAMES = Object.keys(BRICK_COLORS) as BrickColor[];

export type RampDir = "left" | "right" | "front" | "back";
export const RAMP_DIRS: RampDir[] = ["left", "right", "front", "back"];

export type Brick = {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: BrickColor;
  ramp?: RampDir;
};
export type BrickStep = { label: string; note?: string; bricks: Brick[] };
export type BrickDesign = {
  steps: BrickStep[];
  photos?: string[]; // more photos of the real build, shown on the blueprint page
  need?: string; // what to build it with
};

export type PlacedBrick = Brick & { step: number; id: number };

export type StepStats = {
  index: number;
  label: string;
  note: string;
  bricks: PlacedBrick[];
  layers: number[]; // distinct z values in build order
  count: number;
  countAfter: number;
};

export type BuiltBricks = {
  bricks: PlacedBrick[];
  steps: StepStats[];
  count: number;
  plates: number; // height in plates
  tall: number; // height in bricks, rounded
  minX: number;
  minY: number;
  width: number;
  depth: number;
  base: { w: number; d: number }; // footprint of the bricks on the floor, in studs
  kinds: { key: string; label: string; color: BrickColor; count: number }[];
};

const MAX_STEPS = 12;
const MAX_BRICKS = 40;

const int = (v: unknown, min: number, max: number, fallback = min) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function cleanBricks(input: unknown): BrickDesign | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  if (!Array.isArray(r.steps)) return null;
  const steps: BrickStep[] = r.steps.slice(0, MAX_STEPS).map((raw, i) => {
    const s = (raw ?? {}) as Record<string, unknown>;
    const note = text(s.note, 300);
    const bricks = (Array.isArray(s.bricks) ? s.bricks : []).slice(0, MAX_BRICKS).map((b) => {
      const v = (b ?? {}) as Record<string, unknown>;
      return {
        x: int(v.x, -20, 20, 0),
        y: int(v.y, -20, 20, 0),
        z: int(v.z, 0, 150, 0),
        w: int(v.w, 1, 16, 2),
        d: int(v.d, 1, 16, 2),
        h: int(v.h, 1, 12, 3),
        color: COLOR_NAMES.includes(v.color as BrickColor) ? (v.color as BrickColor) : "red",
        ...(RAMP_DIRS.includes(v.ramp as RampDir) ? { ramp: v.ramp as RampDir } : {}),
      };
    });
    return { label: text(s.label, 40) || `Step ${i + 1}`, ...(note ? { note } : {}), bricks };
  });
  if (!steps.some((s) => s.bricks.length)) return null;
  const photos = (Array.isArray(r.photos) ? r.photos : [])
    .filter((x): x is string => typeof x === "string" && /^\/photos\/[a-z0-9-]+\.(jpg|png|webp)$/.test(x))
    .slice(0, 4);
  const need = text(r.need, 160);
  return { steps, ...(photos.length ? { photos } : {}), ...(need ? { need } : {}) };
}

// "2×4 brick", "2×4 plate", "2×2 tall brick", "curved ramp"
export function brickName(b: Pick<Brick, "w" | "d" | "h" | "ramp">) {
  if (b.ramp) return "curved ramp";
  const size = `${Math.min(b.w, b.d)}×${Math.max(b.w, b.d)}`;
  if (b.h === 1) return `${size} plate`;
  if (b.h === 3) return `${size} brick`;
  if (b.h === 6) return `${size} tall brick`;
  return `${size} brick (${b.h} plates tall)`;
}

function footprint(list: Brick[]) {
  if (!list.length) return { w: 0, d: 0 };
  return {
    w: Math.max(...list.map((b) => b.x + b.w)) - Math.min(...list.map((b) => b.x)),
    d: Math.max(...list.map((b) => b.y + b.d)) - Math.min(...list.map((b) => b.y)),
  };
}

export function buildBricks(design: BrickDesign): BuiltBricks {
  const bricks: PlacedBrick[] = [];
  const steps: StepStats[] = [];
  let id = 0;
  design.steps.forEach((s, index) => {
    const placed = s.bricks.map((b) => ({ ...b, step: index, id: id++ }));
    bricks.push(...placed);
    steps.push({
      index,
      label: s.label,
      note: s.note ?? "",
      bricks: placed,
      layers: [...new Set(placed.map((b) => b.z))].sort((a, b) => a - b),
      count: placed.length,
      countAfter: bricks.length,
    });
  });

  const kinds = new Map<string, { key: string; label: string; color: BrickColor; count: number }>();
  for (const b of bricks) {
    const label = brickName(b);
    const key = `${label}:${b.color}`;
    const k = kinds.get(key) ?? { key, label, color: b.color, count: 0 };
    k.count++;
    kinds.set(key, k);
  }

  const plates = Math.max(0, ...bricks.map((b) => b.z + b.h));
  const minX = Math.min(...bricks.map((b) => b.x));
  const minY = Math.min(...bricks.map((b) => b.y));
  return {
    bricks,
    steps,
    count: bricks.length,
    plates,
    tall: Math.round(plates / 3),
    minX,
    minY,
    base: footprint(bricks.filter((b) => b.z === 0)),
    width: Math.max(...bricks.map((b) => b.x + b.w)) - minX,
    depth: Math.max(...bricks.map((b) => b.y + b.d)) - minY,
    kinds: [...kinds.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
  };
}

// Which way a ramp's curve swoops, in the words the step pages use.
export const rampWord = (dir: RampDir) =>
  ({ left: "curve out to the left", right: "curve out to the right", front: "curve toward you", back: "curve away from you" })[dir];
