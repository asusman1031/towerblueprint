// Free-form builds of magnetic cube blocks, like a figure with arms and a head.
// Each step is a list of boxes: a box is w × d × h cubes standing at x (across),
// y (back) and z (up), counted in cubes. Boxes can hang out past what's under
// them, because the magnets hold them on. Where boxes overlap, a cube counts once.

export type CubeBox = { x: number; y: number; z: number; w: number; d: number; h: number };
export type CubeStep = { label: string; note?: string; boxes: CubeBox[] };
export type CubeDesign = {
  steps: CubeStep[];
  photos?: string[]; // more photos of the real build, shown on the blueprint page
  need?: string; // what to build it with
};

export type FigureCube = { x: number; y: number; z: number; group: number }; // group: the step that adds it

// Layers of a step that look the same from the top are built the same way, so
// the blueprint shows them once: "build this layer 5 times".
export type LayerRun = { z0: number; z1: number; cells: [number, number][] };

export type CubeStepStats = {
  index: number;
  label: string;
  note: string;
  count: number;
  countAfter: number;
  runs: LayerRun[];
};

export type BuiltCubes = {
  cubes: FigureCube[];
  steps: CubeStepStats[];
  count: number;
  tall: number; // in cubes
  base: { w: number; d: number }; // footprint on the floor
};

const MAX_STEPS = 12;
const MAX_BOXES = 30;
const MAX_CUBES = 2000;

const int = (v: unknown, min: number, max: number, fallback = min) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function cleanCubes(input: unknown): CubeDesign | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  if (!Array.isArray(r.steps)) return null;
  let total = 0;
  const steps: CubeStep[] = r.steps.slice(0, MAX_STEPS).map((raw, i) => {
    const s = (raw ?? {}) as Record<string, unknown>;
    const note = text(s.note, 300);
    const boxes = (Array.isArray(s.boxes) ? s.boxes : []).slice(0, MAX_BOXES).flatMap((b) => {
      const v = (b ?? {}) as Record<string, unknown>;
      const box = {
        x: int(v.x, -30, 30, 0),
        y: int(v.y, -30, 30, 0),
        z: int(v.z, 0, 120, 0),
        w: int(v.w, 1, 30, 1),
        d: int(v.d, 1, 30, 1),
        h: int(v.h, 1, 60, 1),
      };
      total += box.w * box.d * box.h;
      return total > MAX_CUBES ? [] : [box];
    });
    return { label: text(s.label, 40) || `Step ${i + 1}`, ...(note ? { note } : {}), boxes };
  });
  if (!steps.some((s) => s.boxes.length)) return null;
  const photos = (Array.isArray(r.photos) ? r.photos : [])
    .filter((x): x is string => typeof x === "string" && /^\/photos\/[a-z0-9-]+\.(jpg|png|webp)$/.test(x))
    .slice(0, 4);
  const need = text(r.need, 160);
  return { steps, ...(photos.length ? { photos } : {}), ...(need ? { need } : {}) };
}

export function buildCubeDesign(design: CubeDesign): BuiltCubes {
  const seen = new Set<string>();
  const cubes: FigureCube[] = [];
  const steps: CubeStepStats[] = design.steps.map((s, index) => {
    const mine: FigureCube[] = [];
    for (const b of s.boxes)
      for (let z = b.z; z < b.z + b.h; z++)
        for (let y = b.y; y < b.y + b.d; y++)
          for (let x = b.x; x < b.x + b.w; x++) {
            const k = `${x},${y},${z}`;
            if (seen.has(k)) continue;
            seen.add(k);
            mine.push({ x, y, z, group: index });
          }
    cubes.push(...mine);
    // Group the step's layers into runs that look the same from the top.
    const byZ = new Map<number, string[]>();
    for (const c of mine) byZ.set(c.z, [...(byZ.get(c.z) ?? []), `${c.x},${c.y}`]);
    const runs: LayerRun[] = [];
    for (const z of [...byZ.keys()].sort((a, b) => a - b)) {
      const shape = byZ.get(z)!.sort().join(" ");
      const last = runs[runs.length - 1];
      if (last && last.z1 === z - 1 && last.cells.map(([x, y]) => `${x},${y}`).sort().join(" ") === shape) last.z1 = z;
      else runs.push({ z0: z, z1: z, cells: byZ.get(z)!.map((k) => k.split(",").map(Number) as [number, number]) });
    }
    return { index, label: s.label, note: s.note ?? "", count: mine.length, countAfter: cubes.length, runs };
  });
  const floor = cubes.filter((c) => c.z === 0);
  const span = (list: number[]) => (list.length ? Math.max(...list) - Math.min(...list) + 1 : 0);
  return {
    cubes,
    steps,
    count: cubes.length,
    tall: cubes.length ? Math.max(...cubes.map((c) => c.z)) + 1 : 0,
    base: { w: span(floor.map((c) => c.x)), d: span(floor.map((c) => c.y)) },
  };
}
