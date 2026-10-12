"use client";

import type { BoxDesign, BoxPart, Flaps } from "@/lib/boxes";

// Edit the boxes of a cardboard box build, bottom to top: what kind of box,
// roughly how big (inches), where it sits, and what its flaps do.

const FLAP_OPTIONS: { v: Flaps; label: string }[] = [
  { v: "up", label: "Flaps open, sticking up" },
  { v: "floor", label: "Upside down, flaps flat on the floor" },
  { v: "closed", label: "Flaps shut" },
];

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
        step={0.5}
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Math.round((Number(e.target.value) || 0) * 2) / 2)))}
        className="field !w-16 !px-1 !py-1 text-center font-display text-lg"
      />
    </label>
  );
}

export default function BoxesEditor({ boxes, onChange }: { boxes: BoxDesign; onChange: (b: BoxDesign) => void }) {
  const setBox = (i: number, patch: Partial<BoxPart>) =>
    onChange({ ...boxes, boxes: boxes.boxes.map((b, j) => (j === i ? { ...b, ...patch } : b)) });

  return (
    <div>
      <span className="label">Boxes (bottom first)</span>
      <p className="mb-2 text-sm text-ink">
        Sizes are rough inches. Across, back and up say where each box sits (up is how high its bottom is).
      </p>
      <ol className="space-y-2">
        {boxes.boxes.map((b, i) => (
          <li key={i} className="rounded-xl border-2 border-navy/25 bg-paper p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-lg text-brand">#{i + 1}</span>
              <input
                className="field !w-auto flex-1 !py-1.5 font-display"
                value={b.label}
                maxLength={40}
                onChange={(e) => setBox(i, { label: e.target.value })}
                aria-label={`Name for box ${i + 1}`}
              />
            </div>
            <input
              className="field mt-2 !py-1.5 text-sm"
              placeholder="What kind of box (a big box, a tall box...)"
              value={b.size}
              maxLength={60}
              onChange={(e) => setBox(i, { size: e.target.value })}
              aria-label={`Kind of box ${i + 1}`}
            />
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <Num label="Wide" value={b.w} min={2} max={60} onChange={(n) => setBox(i, { w: n })} />
              <Num label="Deep" value={b.d} min={2} max={60} onChange={(n) => setBox(i, { d: n })} />
              <Num label="Tall" value={b.h} min={2} max={60} onChange={(n) => setBox(i, { h: n })} />
              <Num label="Across" value={b.x} min={-60} max={60} onChange={(n) => setBox(i, { x: n })} />
              <Num label="Back" value={b.y} min={-60} max={60} onChange={(n) => setBox(i, { y: n })} />
              <Num label="Up" value={b.z} min={0} max={200} onChange={(n) => setBox(i, { z: n })} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              <select
                className="field !w-auto !py-1 text-sm"
                value={b.flaps}
                aria-label={`Flaps of box ${i + 1}`}
                onChange={(e) => setBox(i, { flaps: e.target.value as Flaps })}
              >
                {FLAP_OPTIONS.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-sm font-bold text-ink">
                <input type="checkbox" checked={!!b.tape} onChange={(e) => setBox(i, { tape: e.target.checked })} /> Tape on
                top
              </label>
              {i > 0 ? (
                <label className="flex items-center gap-1 text-sm font-bold text-ink">
                  <input type="checkbox" checked={!!b.inside} onChange={(e) => setBox(i, { inside: e.target.checked })} />{" "}
                  Inside the box before it
                </label>
              ) : null}
            </div>
            <input
              className="field mt-2 !py-1.5 text-sm"
              placeholder="Tip for builders"
              value={b.note ?? ""}
              maxLength={300}
              onChange={(e) => setBox(i, { note: e.target.value })}
              aria-label={`Tip for box ${i + 1}`}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
