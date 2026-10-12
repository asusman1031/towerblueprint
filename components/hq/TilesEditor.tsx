"use client";

import { buildTiles, type Room, type TileDesign } from "@/lib/tiles";

// Edit the rooms of a magnetic tile build: where each room stands, how big it
// is, and whether it has a roof or a floor. The tile math updates as you type.

function Num({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-1">
      <span className="text-xs font-extrabold text-ink uppercase">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Math.round(Number(e.target.value) || min))))}
        className="field !w-14 !px-1 !py-1 text-center font-display text-lg"
      />
    </label>
  );
}

export default function TilesEditor({ tiles, onChange }: { tiles: TileDesign; onChange: (t: TileDesign) => void }) {
  const built = buildTiles(tiles);
  const setRoom = (i: number, patch: Partial<Room>) =>
    onChange({ ...tiles, rooms: tiles.rooms.map((r, j) => (j === i ? { ...r, ...patch } : r)) });
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= tiles.rooms.length) return;
    const rooms = [...tiles.rooms];
    [rooms[i], rooms[j]] = [rooms[j], rooms[i]];
    onChange({ ...tiles, rooms });
  };

  return (
    <div>
      <span className="label">Rooms (in building order)</span>
      <p className="mb-2 text-sm text-ink">
        Sizes are in squares. Across and back say where a room stands, up is how high it starts.
      </p>
      <ol className="space-y-2">
        {tiles.rooms.map((r, i) => (
          <li key={i} className="rounded-xl border-2 border-navy/25 bg-paper p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-lg text-brand">#{i + 1}</span>
              <input
                className="field !w-auto flex-1 !py-1.5 font-display"
                value={r.label}
                maxLength={40}
                onChange={(e) => setRoom(i, { label: e.target.value })}
                aria-label={`Name for room ${i + 1}`}
              />
              <span className="text-sm font-bold text-ink">
                = <span className="font-display text-base text-navy">{built.rooms[i]?.tiles ?? 0}</span> tiles
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <Num label="Wide" value={r.w} min={1} max={8} onChange={(n) => setRoom(i, { w: n })} />
              <Num label="Deep" value={r.d} min={1} max={8} onChange={(n) => setRoom(i, { d: n })} />
              <Num label="Tall" value={r.h} min={1} max={10} onChange={(n) => setRoom(i, { h: n })} />
              <Num label="Across" value={r.x} min={0} max={20} onChange={(n) => setRoom(i, { x: n })} />
              <Num label="Back" value={r.y} min={0} max={20} onChange={(n) => setRoom(i, { y: n })} />
              <Num label="Up" value={r.z} min={0} max={30} onChange={(n) => setRoom(i, { z: n })} />
              <label className="flex items-center gap-1 text-sm font-bold text-ink">
                <input type="checkbox" checked={r.roof} onChange={(e) => setRoom(i, { roof: e.target.checked })} /> Roof
              </label>
              <label className="flex items-center gap-1 text-sm font-bold text-ink">
                <input type="checkbox" checked={r.floor} onChange={(e) => setRoom(i, { floor: e.target.checked })} /> Floor
              </label>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                className="field !w-auto flex-1 !py-1.5 text-sm"
                placeholder="Tip for builders (where it goes)"
                value={r.note ?? ""}
                maxLength={300}
                onChange={(e) => setRoom(i, { note: e.target.value })}
                aria-label={`Tip for room ${i + 1}`}
              />
              <div className="flex gap-1">
                <button type="button" className="btn btn-white btn-sm !px-2" onClick={() => move(i, -1)} aria-label="Build earlier">
                  ↑
                </button>
                <button type="button" className="btn btn-white btn-sm !px-2" onClick={() => move(i, 1)} aria-label="Build later">
                  ↓
                </button>
                <button
                  type="button"
                  className="btn btn-white btn-sm !px-2"
                  disabled={tiles.rooms.length <= 1}
                  onClick={() => onChange({ ...tiles, rooms: tiles.rooms.filter((_, j) => j !== i) })}
                  aria-label="Remove room"
                >
                  ✕
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="btn btn-blue btn-sm mt-3"
        disabled={tiles.rooms.length >= 16}
        onClick={() => {
          const last = tiles.rooms[tiles.rooms.length - 1];
          const next: Room = last
            ? { label: `Room ${tiles.rooms.length + 1}`, x: last.x, y: last.y, z: last.z + last.h, w: 1, d: 1, h: 1, roof: true, floor: false }
            : { label: "Room 1", x: 0, y: 0, z: 0, w: 2, d: 2, h: 1, roof: true, floor: false };
          onChange({ ...tiles, rooms: [...tiles.rooms, next] });
        }}
      >
        + Add a room
      </button>
    </div>
  );
}
