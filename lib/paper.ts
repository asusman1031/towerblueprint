// Builds made from packing paper: sheets scrunched into one long rope and laid
// on the floor in a shape, like a snake. The rope's path is a list of floor
// points in feet (x across, y away from you). Each step lays the next part of
// the rope, carrying on from where the step before ended. The rope starts at
// the tail; with `face`, its other end is a head.

export type Pt = [number, number];

export type PaperStep = { label: string; note?: string; path: Pt[] };

export type PaperDesign = {
  sheets: number; // sheets of packing paper scrunched and twisted into the rope
  steps: PaperStep[];
  face?: boolean; // the end of the rope is a head, so the drawing gives it eyes
  photos?: string[]; // more photos of the real build, shown on the blueprint page
  need?: string; // what to build it with
};

export type PaperStepStats = {
  index: number;
  label: string;
  note: string;
  from: number; // where this step starts and ends in `points`; steps share their joining point
  to: number;
  feet: number; // rope laid in this step, to the nearest foot
  soFar: number; // rope laid so far, to the nearest foot
};

export type BuiltPaper = {
  points: Pt[]; // the whole path, moved so the floor space starts at 0,0
  steps: PaperStepStats[];
  sheets: number;
  feet: number; // how long the rope is, to the nearest foot
  wide: number; // floor space, in whole feet
  deep: number;
};

const MAX_STEPS = 10;
const MAX_POINTS = 40; // per step

const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(v) * 10) / 10; // a tenth of a foot is close enough
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function cleanPaper(input: unknown): PaperDesign | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  if (!Array.isArray(r.steps)) return null;
  const steps: PaperStep[] = r.steps.slice(0, MAX_STEPS).map((raw, i) => {
    const s = (raw ?? {}) as Record<string, unknown>;
    const note = text(s.note, 300);
    const path = (Array.isArray(s.path) ? s.path : [])
      .slice(0, MAX_POINTS)
      .filter((p): p is unknown[] => Array.isArray(p) && p.length === 2)
      .map((p): Pt => [num(p[0], -100, 100, 0), num(p[1], -100, 100, 0)]);
    return { label: text(s.label, 40) || `Step ${i + 1}`, ...(note ? { note } : {}), path };
  });
  // A rope needs at least two points to go anywhere.
  if (steps.reduce((n, s) => n + s.path.length, 0) < 2) return null;
  const photos = (Array.isArray(r.photos) ? r.photos : [])
    .filter((x): x is string => typeof x === "string" && /^\/photos\/[a-z0-9-]+\.(jpg|png|webp)$/.test(x))
    .slice(0, 4);
  const need = text(r.need, 160);
  return {
    sheets: Math.round(num(r.sheets, 1, 50, 1)),
    steps,
    ...(r.face === true ? { face: true } : {}),
    ...(photos.length ? { photos } : {}),
    ...(need ? { need } : {}),
  };
}

// The smooth curve through the points from index `from` to `to`, as cubic Bézier
// pieces (Catmull-Rom). Neighbors outside the range still shape the ends, so a
// step drawn on its own joins the next one without a kink.
export function curvePieces(points: Pt[], from = 0, to = points.length - 1): [Pt, Pt, Pt, Pt][] {
  const at = (i: number) => points[Math.max(0, Math.min(points.length - 1, i))];
  const pieces: [Pt, Pt, Pt, Pt][] = [];
  for (let i = from; i < to; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    pieces.push([
      p1,
      [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
      [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
      p2,
    ]);
  }
  return pieces;
}

function bezierAt([a, b, c, d]: [Pt, Pt, Pt, Pt], t: number): Pt {
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ];
}

export function curveLength(points: Pt[], from = 0, to = points.length - 1) {
  let len = 0;
  for (const piece of curvePieces(points, from, to)) {
    let prev = piece[0];
    for (let k = 1; k <= 16; k++) {
      const p = bezierAt(piece, k / 16);
      len += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      prev = p;
    }
  }
  return len;
}

export function buildPaper(design: PaperDesign): BuiltPaper {
  const raw: Pt[] = [];
  const ranges: [number, number][] = [];
  for (const s of design.steps) {
    const from = Math.max(0, raw.length - 1);
    raw.push(...s.path);
    ranges.push([from, Math.max(from, raw.length - 1)]);
  }
  const minX = raw.length ? Math.min(...raw.map((p) => p[0])) : 0;
  const minY = raw.length ? Math.min(...raw.map((p) => p[1])) : 0;
  const points = raw.map(([x, y]): Pt => [x - minX, y - minY]);
  // Each step rounds to whole feet, and the totals add those up, so a kid's sums come out right.
  let laid = 0;
  const steps = design.steps.map((s, index) => {
    const [from, to] = ranges[index];
    const feet = Math.round(curveLength(points, from, to));
    laid += feet;
    return { index, label: s.label, note: s.note ?? "", from, to, feet, soFar: laid };
  });
  return {
    points,
    steps,
    sheets: design.sheets,
    feet: laid,
    wide: Math.ceil(Math.max(0, ...points.map((p) => p[0]))),
    deep: Math.ceil(Math.max(0, ...points.map((p) => p[1]))),
  };
}
