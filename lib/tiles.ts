// Builds made of magnetic tiles: flat squares that click together into hollow rooms.
// A tile build is a list of rooms, built in order. Each room is a box w wide,
// d deep and h tall (counted in squares), standing at x, y, z. It gets walls all
// the way around, plus a roof and a floor when set. A wall that an earlier room
// already built is skipped, so the count is the tiles a builder really needs.
// A big square counts as 4 small squares, and a long rectangle as 2.

export type Room = {
  label: string;
  note?: string;
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  roof: boolean;
  floor: boolean;
};

export type TileDesign = {
  rooms: Room[];
  photos?: string[]; // more photos of the real build, shown on the blueprint page
};

// One small square. "x" squares stand in a plane x = const, "y" squares in a
// plane y = const, and "z" squares lie flat (floors and roofs).
export type Panel = { room: number; axis: "x" | "y" | "z"; x: number; y: number; z: number };

export type RoomStats = Room & {
  index: number;
  note: string;
  around: number; // squares in one ring of walls
  walls: number; // around × h
  skipped: number; // wall squares an earlier room already built
  skippedFrom: string[];
  roofTiles: number;
  floorTiles: number;
  tiles: number; // new squares this room needs
  tilesAfter: number;
  sitsOn: string | null;
};

export type BuiltTiles = {
  panels: Panel[];
  rooms: RoomStats[];
  tiles: number;
  height: number;
  width: number;
  depth: number;
};

const MAX_ROOMS = 16;

const int = (v: unknown, min: number, max: number, fallback = min) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function cleanTiles(input: unknown): TileDesign | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  if (!Array.isArray(r.rooms)) return null;
  const rooms: Room[] = r.rooms.slice(0, MAX_ROOMS).map((raw, i) => {
    const p = (raw ?? {}) as Record<string, unknown>;
    const note = text(p.note, 300);
    return {
      label: text(p.label, 40) || `Room ${i + 1}`,
      ...(note ? { note } : {}),
      x: int(p.x, 0, 20),
      y: int(p.y, 0, 20),
      z: int(p.z, 0, 30),
      w: int(p.w, 1, 8, 1),
      d: int(p.d, 1, 8, 1),
      h: int(p.h, 1, 10, 1),
      roof: p.roof === true,
      floor: p.floor === true,
    };
  });
  if (rooms.length === 0) return null;
  const photos = (Array.isArray(r.photos) ? r.photos : [])
    .filter((x): x is string => typeof x === "string" && /^\/photos\/[a-z0-9-]+\.(jpg|png|webp)$/.test(x))
    .slice(0, 4);
  return { rooms, ...(photos.length ? { photos } : {}) };
}

type Square = Omit<Panel, "room">;
const keyOf = (p: Square) => `${p.axis}:${p.x}:${p.y}:${p.z}`;

function roomSquares(r: Room) {
  const walls: Square[] = [];
  const roof: Square[] = [];
  const floor: Square[] = [];
  for (let z = r.z; z < r.z + r.h; z++) {
    for (let y = r.y; y < r.y + r.d; y++) {
      walls.push({ axis: "x", x: r.x, y, z }, { axis: "x", x: r.x + r.w, y, z });
    }
    for (let x = r.x; x < r.x + r.w; x++) {
      walls.push({ axis: "y", x, y: r.y, z }, { axis: "y", x, y: r.y + r.d, z });
    }
  }
  for (let x = r.x; x < r.x + r.w; x++)
    for (let y = r.y; y < r.y + r.d; y++) {
      if (r.roof) roof.push({ axis: "z", x, y, z: r.z + r.h });
      if (r.floor) floor.push({ axis: "z", x, y, z: r.z });
    }
  return { walls, roof, floor };
}

const overlaps = (a: Room, b: Room) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.d && b.y < a.y + a.d;

export function buildTiles(design: TileDesign): BuiltTiles {
  const owner = new Map<string, number>();
  const panels: Panel[] = [];
  const rooms: RoomStats[] = [];
  let total = 0;

  design.rooms.forEach((r, index) => {
    const { walls, roof, floor } = roomSquares(r);
    const skippedFrom = new Set<string>();
    const add = (list: Square[]) => {
      let added = 0;
      for (const s of list) {
        const k = keyOf(s);
        const prev = owner.get(k);
        if (prev !== undefined) {
          skippedFrom.add(design.rooms[prev].label);
          continue;
        }
        owner.set(k, index);
        panels.push({ ...s, room: index });
        added++;
      }
      return added;
    };
    const newWalls = add(walls);
    const roofTiles = add(roof);
    const floorTiles = add(floor);
    const tiles = newWalls + roofTiles + floorTiles;
    total += tiles;
    const below = design.rooms.slice(0, index).find((o) => o.z + o.h === r.z && overlaps(o, r));
    rooms.push({
      ...r,
      index,
      note: r.note ?? "",
      around: 2 * (r.w + r.d),
      walls: walls.length,
      skipped: walls.length - newWalls,
      skippedFrom: [...skippedFrom],
      roofTiles,
      floorTiles,
      tiles,
      tilesAfter: total,
      sitsOn: below ? below.label : null,
    });
  });

  const xs = design.rooms.flatMap((r) => [r.x, r.x + r.w]);
  const ys = design.rooms.flatMap((r) => [r.y, r.y + r.d]);
  return {
    panels,
    rooms,
    tiles: total,
    height: Math.max(0, ...design.rooms.map((r) => r.z + r.h)),
    width: xs.length ? Math.max(...xs) - Math.min(...xs) : 0,
    depth: ys.length ? Math.max(...ys) - Math.min(...ys) : 0,
  };
}
