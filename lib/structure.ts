import { buildTiles, type TileDesign } from "@/lib/tiles";
import { towerTotals, type Cube, type Section } from "@/lib/tower";

// Structures are builds that go sideways, like a bridge across two chairs.
// A structure is one long path of blocks plus pillars that hold it up:
// - the path starts `startLayer` blocks up and moves in runs (across, down, turn left...)
// - each pillar is a rectangle of blocks on the ground with a one-block column
//   on top that reaches up to the path block it holds.
// `on` names the furniture a part rests on ("first chair", "table"); the
// drawings show it as a dashed shape under those blocks.
// A path part with `start` begins a new chain at that spot instead of growing
// from the last block, so one structure can hold separate towers side by side.
// `mark` draws an X or an O on the top of a path part's last block.

export type Dir = "E" | "W" | "N" | "S" | "U" | "D";
export type Run = { dir: Dir; n: number };

export type Mark = "X" | "O";
export type PathPart = {
  kind: "path";
  label: string;
  note?: string;
  on?: string;
  runs: Run[];
  start?: { x: number; y: number; z: number };
  mark?: Mark;
};
export type PillarPart = {
  kind: "pillar";
  label: string;
  note?: string;
  on?: string;
  base: { w: number; d: number; layers: number };
  // Which path block the column holds up: a path part's index and its block number (1 = first).
  holds: { part: number; block: number };
};
export type Part = PathPart | PillarPart;
export type Structure = {
  startLayer: number;
  parts: Part[];
  photos?: string[]; // more photos of the real build, shown on the blueprint page
  need?: string; // what to build it with, when it isn't plain magnetic blocks
};

export type StructureCube = Cube & { group: number };
export type Surface = { label: string; x0: number; x1: number; y0: number; y1: number; z: number };

type Pos = [number, number, number];

export type PathStats = {
  kind: "path";
  index: number;
  label: string;
  note: string;
  on: string;
  blocks: number;
  hasStart: boolean; // the first path part, and any with its own start, places a start block
  runs: Run[];
  cubes: Pos[]; // in build order
  attach: Pos | null; // the block this part grows from
  heldBy: { block: number; pillar: string }[];
};

export type PillarStats = {
  kind: "pillar";
  index: number;
  label: string;
  note: string;
  on: string;
  blocks: number;
  base: { w: number; d: number; layers: number };
  perLayer: number;
  baseBlocks: number;
  column: number;
  columnAt: { x: number; y: number }; // column square inside the base, from its back-left corner
  holds: { part: string; block: number } | null;
  gap: { from: string; blocks: number } | null; // space to leave from an earlier pillar on the same surface
};

export type PartStats = PathStats | PillarStats;

export type BuiltStructure = {
  cubes: StructureCube[];
  marks: { x: number; y: number; z: number; mark: Mark }[];
  parts: PartStats[];
  surfaces: Surface[];
  blocks: number;
  height: number;
  length: number;
};

export const MAX_RUN = 60;
export const MAX_START = 60;
const MAX_PARTS = 16;
const MAX_RUNS = 16;
const DIRS: Dir[] = ["E", "W", "N", "S", "U", "D"];

const STEP: Record<Dir, Pos> = {
  E: [1, 0, 0],
  W: [-1, 0, 0],
  N: [0, -1, 0],
  S: [0, 1, 0],
  U: [0, 0, 1],
  D: [0, 0, -1],
};

const LEFT: Record<string, Dir> = { E: "N", N: "W", W: "S", S: "E" };
const RIGHT: Record<string, Dir> = { E: "S", S: "W", W: "N", N: "E" };

const int = (v: unknown, min: number, max: number, fallback = min) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function cleanStructure(input: unknown): Structure | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  if (!Array.isArray(r.parts)) return null;
  const parts: Part[] = [];
  for (const raw of r.parts.slice(0, MAX_PARTS)) {
    const p = (raw ?? {}) as Record<string, unknown>;
    const label = text(p.label, 40) || `Part ${parts.length + 1}`;
    const note = text(p.note, 300);
    const on = text(p.on, 30);
    const extra = { ...(note ? { note } : {}), ...(on ? { on } : {}) };
    if (p.kind === "pillar") {
      const b = (p.base ?? {}) as Record<string, unknown>;
      const h = (p.holds ?? {}) as Record<string, unknown>;
      parts.push({
        kind: "pillar",
        label,
        ...extra,
        base: { w: int(b.w, 1, 8, 1), d: int(b.d, 1, 8, 1), layers: int(b.layers, 0, 40, 1) },
        holds: { part: int(h.part, 0, MAX_PARTS - 1, 0), block: int(h.block, 1, 400, 1) },
      });
    } else if (p.kind === "path") {
      const runs = (Array.isArray(p.runs) ? p.runs : [])
        .slice(0, MAX_RUNS)
        .map((x) => {
          const run = (x ?? {}) as Record<string, unknown>;
          return { dir: DIRS.includes(run.dir as Dir) ? (run.dir as Dir) : "E", n: int(run.n, 1, MAX_RUN, 1) };
        });
      const st = p.start && typeof p.start === "object" ? (p.start as Record<string, unknown>) : null;
      const mark = p.mark === "X" || p.mark === "O" ? p.mark : null;
      parts.push({
        kind: "path",
        label,
        ...extra,
        runs,
        ...(st ? { start: { x: int(st.x, 0, 60), y: int(st.y, 0, 60), z: int(st.z, 0, MAX_START) } } : {}),
        ...(mark ? { mark } : {}),
      });
    }
  }
  if (!parts.some((p) => p.kind === "path")) return null;
  const photos = (Array.isArray(r.photos) ? r.photos : [])
    .filter((x): x is string => typeof x === "string" && /^\/photos\/[a-z0-9-]+\.(jpg|png|webp)$/.test(x))
    .slice(0, 4);
  const need = text(r.need, 160);
  return {
    startLayer: int(r.startLayer, 1, MAX_START, 1),
    parts,
    ...(photos.length ? { photos } : {}),
    ...(need ? { need } : {}),
  };
}

export function buildStructure(s: Structure): BuiltStructure {
  // 1. Walk the path, part by part.
  const pathCubes = new Map<number, Pos[]>();
  const attachOf = new Map<number, Pos | null>();
  const starts = new Set<number>();
  let cursor: Pos | null = null;
  let first = true;
  s.parts.forEach((p, i) => {
    if (p.kind !== "path") return;
    const out: Pos[] = [];
    attachOf.set(i, p.start ? null : cursor);
    if (p.start || first) {
      cursor = p.start ? [p.start.x, p.start.y, p.start.z] : [0, 0, s.startLayer - 1];
      out.push(cursor);
      starts.add(i);
      first = false;
    }
    for (const run of p.runs) {
      const [dx, dy, dz] = STEP[run.dir];
      for (let k = 0; k < run.n; k++) {
        const [x, y, z]: Pos = cursor!;
        cursor = [x + dx, y + dy, z + dz];
        out.push(cursor);
      }
    }
    pathCubes.set(i, out);
  });

  const firstPath = s.parts.findIndex((p) => p.kind === "path");
  const held = (h: PillarPart["holds"]) => {
    const part = pathCubes.has(h.part) ? h.part : firstPath;
    const list = pathCubes.get(part) ?? [];
    if (list.length === 0) return null;
    const block = Math.max(1, Math.min(list.length, h.block));
    return { part, block, pos: list[block - 1] };
  };

  // 2. Pillars, then everything in build order.
  const cubes: StructureCube[] = [];
  const parts: PartStats[] = [];
  const placedBases: { label: string; on: string; x0: number; x1: number; y0: number; y1: number }[] = [];
  const holdsList: { part: number; block: number; pillar: string }[] = [];

  s.parts.forEach((p, index) => {
    const note = p.note ?? "";
    const on = p.on ?? "";
    if (p.kind === "path") {
      const list = pathCubes.get(index) ?? [];
      for (const [x, y, z] of list) cubes.push({ x, y, z, group: index });
      parts.push({
        kind: "path",
        index,
        label: p.label,
        note,
        on,
        blocks: list.length,
        hasStart: starts.has(index),
        runs: p.runs,
        cubes: list,
        attach: attachOf.get(index) ?? null,
        heldBy: [],
      });
      return;
    }
    const h = held(p.holds);
    const [cx, cy, top] = h ? h.pos : [0, 0, 0];
    const layers = Math.min(p.base.layers, Math.max(0, top));
    const column = Math.max(0, top - layers);
    const x0 = cx - Math.floor((p.base.w - 1) / 2);
    const y0 = cy - Math.floor((p.base.d - 1) / 2);
    for (let z = 0; z < layers; z++)
      for (let y = 0; y < p.base.d; y++)
        for (let x = 0; x < p.base.w; x++) cubes.push({ x: x0 + x, y: y0 + y, z, group: index });
    for (let z = layers; z < top; z++) cubes.push({ x: cx, y: cy, z, group: index });

    const box = { label: p.label, on, x0, x1: x0 + p.base.w - 1, y0, y1: y0 + p.base.d - 1 };
    let gap: PillarStats["gap"] = null;
    for (const other of placedBases) {
      if (other.on !== on || other.y1 < box.y0 || other.y0 > box.y1) continue;
      const blocks = box.x0 > other.x1 ? box.x0 - other.x1 - 1 : other.x0 - box.x1 - 1;
      if (blocks >= 0 && (!gap || blocks < gap.blocks)) gap = { from: other.label, blocks };
    }
    placedBases.push(box);

    parts.push({
      kind: "pillar",
      index,
      label: p.label,
      note,
      on,
      blocks: p.base.w * p.base.d * layers + column,
      base: { ...p.base, layers },
      perLayer: p.base.w * p.base.d,
      baseBlocks: p.base.w * p.base.d * layers,
      column,
      columnAt: { x: cx - x0, y: cy - y0 },
      holds: h ? { part: s.parts[h.part].label, block: h.block } : null,
      gap,
    });
    if (h) holdsList.push({ part: h.part, block: h.block, pillar: p.label });
  });

  for (const q of parts) {
    if (q.kind !== "path") continue;
    q.heldBy = holdsList.filter((h) => h.part === q.index).sort((a, b) => a.block - b.block);
  }

  // 3. Furniture under the parts that name it.
  const surfaces: Surface[] = [];
  const byLabel = new Map<string, StructureCube[]>();
  for (const c of cubes) {
    const on = s.parts[c.group]?.on;
    if (!on) continue;
    if (!byLabel.has(on)) byLabel.set(on, []);
    byLabel.get(on)!.push(c);
  }
  for (const [label, list] of byLabel) {
    const z = Math.min(...list.map((c) => c.z));
    const flat = list.filter((c) => c.z === z);
    surfaces.push({
      label,
      x0: Math.min(...flat.map((c) => c.x)) - 1,
      x1: Math.max(...flat.map((c) => c.x)) + 2,
      y0: Math.min(...flat.map((c) => c.y)) - 1,
      y1: Math.max(...flat.map((c) => c.y)) + 2,
      z,
    });
  }

  const xs = cubes.map((c) => c.x);
  const marks: BuiltStructure["marks"] = [];
  s.parts.forEach((p, i) => {
    const last = pathCubes.get(i)?.at(-1);
    if (p.kind === "path" && p.mark && last) marks.push({ x: last[0], y: last[1], z: last[2], mark: p.mark });
  });

  return {
    cubes,
    marks,
    parts,
    surfaces,
    blocks: parts.reduce((n, p) => n + p.blocks, 0),
    height: cubes.length ? Math.max(...cubes.map((c) => c.z)) + 1 : 0,
    length: cubes.length ? Math.max(...xs) - Math.min(...xs) + 1 : 0,
  };
}

// How to say each run out loud: "Go across", "Turn left", "Go down"...
export function runWords(runs: Run[], before: Dir | null): { words: string; arrow: string; dir: Dir }[] {
  let heading = before;
  return runs.map((r) => {
    let words: string;
    if (r.dir === "U") words = "Go up";
    else if (r.dir === "D") words = "Go down";
    else {
      if (!heading) words = "Go across";
      else if (heading === r.dir) words = "Keep going straight";
      else if (LEFT[heading] === r.dir) words = "Turn left";
      else if (RIGHT[heading] === r.dir) words = "Turn right";
      else words = "Turn around";
      heading = r.dir;
    }
    return { words, arrow: ARROW[r.dir], dir: r.dir };
  });
}

const ARROW: Record<Dir, string> = { E: "→", W: "←", N: "↑", S: "↓", U: "⤒", D: "⤓" };

// The last sideways direction the path was heading before part `index`.
export function headingBefore(s: Structure, index: number): Dir | null {
  let heading: Dir | null = null;
  s.parts.forEach((p, i) => {
    if (i >= index || p.kind !== "path") return;
    for (const r of p.runs) if (r.dir !== "U" && r.dir !== "D") heading = r.dir;
  });
  return heading;
}

// The numbers every blueprint shows, whether it's a tower, a structure or a tile build.
// `blocks` counts pieces: cube blocks, or small tile squares when unit is "tiles".
export function designTotals(d: { sections: Section[]; structure?: Structure | null; tiles?: TileDesign | null }) {
  if (d.tiles) {
    const b = buildTiles(d.tiles);
    return {
      blocks: b.tiles,
      unit: "tiles" as const,
      height: b.height,
      base: { label: "Base", value: `${b.width}×${b.depth}` },
      steps: b.rooms.length,
    };
  }
  if (d.structure) {
    const b = buildStructure(d.structure);
    return {
      blocks: b.blocks,
      unit: "blocks" as const,
      height: b.height,
      base: { label: "Long", value: `${b.length}` },
      steps: b.parts.length,
    };
  }
  const t = towerTotals(d.sections);
  return {
    blocks: t.blocks,
    unit: "blocks" as const,
    height: t.height,
    base: { label: "Base", value: `${t.footprintW}×${t.footprintD}` },
    steps: d.sections.length,
  };
}
