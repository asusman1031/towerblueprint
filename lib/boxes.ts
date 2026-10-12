// Builds made of cardboard boxes. Each box is one step, listed bottom to top.
// Sizes are rough inches (any boxes close in shape work), and x, y, z place the
// box's back corner. A box's flaps can stand open, be spread flat on the floor
// (for a box turned upside down), or stay shut.

export type Flaps = "up" | "floor" | "closed";

export type BoxPart = {
  label: string; // "The Base"
  size: string; // what kind of box, in kid words: "A big box"
  w: number;
  d: number;
  h: number;
  x: number;
  y: number;
  z: number;
  flaps: Flaps;
  tape?: boolean; // a stripe of tape across the top (the taped bottom of an upside-down box)
  inside?: boolean; // stands inside the box before it and pokes out the top
  note?: string;
};

export type BoxDesign = {
  boxes: BoxPart[];
  photos?: string[]; // more photos of the real build, shown on the blueprint page
  need?: string; // what to build it with
};

export type BoxStats = BoxPart & { index: number; flapCount: number; top: number };

export type BuiltBoxes = {
  boxes: BoxStats[];
  count: number;
  flaps: number; // every box has 4 flaps
  levels: number; // how many boxes tall: each box that reaches higher than the ones before counts
  inches: number; // height without the flaps
  feet: number; // rounded to the nearest half foot, for kids
};

const MAX_BOXES = 12;
const FLAPS: Flaps[] = ["up", "floor", "closed"];

const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(v) * 2) / 2; // half inches are close enough
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function cleanBoxes(input: unknown): BoxDesign | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  if (!Array.isArray(r.boxes)) return null;
  const boxes: BoxPart[] = r.boxes.slice(0, MAX_BOXES).map((raw, i) => {
    const b = (raw ?? {}) as Record<string, unknown>;
    const note = text(b.note, 300);
    return {
      label: text(b.label, 40) || `Box ${i + 1}`,
      size: text(b.size, 60) || "A box",
      w: num(b.w, 2, 60, 12),
      d: num(b.d, 2, 60, 12),
      h: num(b.h, 2, 60, 12),
      x: num(b.x, -60, 60, 0),
      y: num(b.y, -60, 60, 0),
      z: num(b.z, 0, 200, 0),
      flaps: FLAPS.includes(b.flaps as Flaps) ? (b.flaps as Flaps) : "up",
      ...(b.tape === true ? { tape: true } : {}),
      ...(b.inside === true ? { inside: true } : {}),
      ...(note ? { note } : {}),
    };
  });
  if (!boxes.length) return null;
  const photos = (Array.isArray(r.photos) ? r.photos : [])
    .filter((x): x is string => typeof x === "string" && /^\/photos\/[a-z0-9-]+\.(jpg|png|webp)$/.test(x))
    .slice(0, 4);
  const need = text(r.need, 160);
  return { boxes, ...(photos.length ? { photos } : {}), ...(need ? { need } : {}) };
}

export function buildBoxes(design: BoxDesign): BuiltBoxes {
  let reach = 0;
  let levels = 0;
  const boxes = design.boxes.map((b, index) => {
    const top = b.z + b.h;
    if (top > reach) {
      levels++;
      reach = top;
    }
    return { ...b, index, flapCount: 4, top };
  });
  return {
    boxes,
    count: boxes.length,
    flaps: boxes.length * 4,
    levels,
    inches: reach,
    feet: Math.round((reach / 12) * 2) / 2,
  };
}
