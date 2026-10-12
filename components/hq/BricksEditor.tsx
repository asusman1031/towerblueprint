"use client";

import { BRICK_COLORS, buildBricks, type Brick, type BrickColor, type BrickDesign } from "@/lib/bricks";

// Edit the bricks of a LEGO-style build, step by step: where each brick sits,
// its size and its color. The counts update as you type.

const COLORS = Object.keys(BRICK_COLORS) as BrickColor[];
const HEIGHTS = [
  { v: 1, label: "Plate (thin)" },
  { v: 3, label: "Brick" },
  { v: 6, label: "Tall brick" },
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
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Math.round(Number(e.target.value) || 0))))}
        className="field !w-14 !px-1 !py-1 text-center font-display text-lg"
      />
    </label>
  );
}

export default function BricksEditor({ bricks, onChange }: { bricks: BrickDesign; onChange: (b: BrickDesign) => void }) {
  const built = buildBricks(bricks);
  const setStep = (i: number, patch: Partial<BrickDesign["steps"][number]>) =>
    onChange({ ...bricks, steps: bricks.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const setBrick = (i: number, k: number, patch: Partial<Brick>) =>
    setStep(i, { bricks: bricks.steps[i].bricks.map((b, j) => (j === k ? { ...b, ...patch } : b)) });

  return (
    <div>
      <span className="label">Steps (in building order)</span>
      <p className="mb-2 text-sm text-ink">
        Sizes are in studs. Across and back say where a brick sits. Up counts thin plates from the floor: a brick is 3
        plates tall, a tall brick 6.
      </p>
      <ol className="space-y-2">
        {bricks.steps.map((s, i) => (
          <li key={i} className="rounded-xl border-2 border-navy/25 bg-paper p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-lg text-brand">#{i + 1}</span>
              <input
                className="field !w-auto flex-1 !py-1.5 font-display"
                value={s.label}
                maxLength={40}
                onChange={(e) => setStep(i, { label: e.target.value })}
                aria-label={`Name for step ${i + 1}`}
              />
              <span className="text-sm font-bold text-ink">
                = <span className="font-display text-base text-navy">{built.steps[i]?.count ?? 0}</span> bricks
              </span>
            </div>
            <ul className="mt-2 space-y-1.5">
              {s.bricks.map((b, k) => (
                <li key={k} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-navy/10 pt-1.5">
                  <span
                    className="h-5 w-5 shrink-0 rounded border-2 border-navy"
                    style={{ background: BRICK_COLORS[b.color] }}
                    aria-hidden
                  />
                  <select
                    className="field !w-auto !py-1 text-sm"
                    value={b.color}
                    aria-label={`Color of brick ${k + 1}`}
                    onChange={(e) => setBrick(i, k, { color: e.target.value as BrickColor })}
                  >
                    {COLORS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <select
                    className="field !w-auto !py-1 text-sm"
                    value={b.h}
                    aria-label={`Kind of brick ${k + 1}`}
                    onChange={(e) => setBrick(i, k, { h: Number(e.target.value) })}
                  >
                    {[...HEIGHTS, ...(HEIGHTS.some((x) => x.v === b.h) ? [] : [{ v: b.h, label: `${b.h} plates tall` }])].map(
                      (o) => (
                        <option key={o.v} value={o.v}>
                          {o.label}
                        </option>
                      ),
                    )}
                  </select>
                  <Num label="Wide" value={b.w} min={1} max={16} onChange={(n) => setBrick(i, k, { w: n })} />
                  <Num label="Deep" value={b.d} min={1} max={16} onChange={(n) => setBrick(i, k, { d: n })} />
                  <Num label="Across" value={b.x} min={-20} max={20} onChange={(n) => setBrick(i, k, { x: n })} />
                  <Num label="Back" value={b.y} min={-20} max={20} onChange={(n) => setBrick(i, k, { y: n })} />
                  <Num label="Up" value={b.z} min={0} max={150} onChange={(n) => setBrick(i, k, { z: n })} />
                  <button
                    type="button"
                    className="btn btn-white btn-sm !px-2"
                    disabled={s.bricks.length <= 1}
                    onClick={() => setStep(i, { bricks: s.bricks.filter((_, j) => j !== k) })}
                    aria-label={`Remove brick ${k + 1}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn-white btn-sm mt-2"
              disabled={s.bricks.length >= 40}
              onClick={() => {
                const last = s.bricks[s.bricks.length - 1] ?? { x: 0, y: 0, z: 0, h: 0 };
                const next: Brick = { x: last.x, y: last.y, z: last.z + last.h, w: 4, d: 2, h: 3, color: "red" };
                setStep(i, { bricks: [...s.bricks, next] });
              }}
            >
              + Add a brick on top
            </button>
            <input
              className="field mt-2 !py-1.5 text-sm"
              placeholder="Tip for builders"
              value={s.note ?? ""}
              maxLength={300}
              onChange={(e) => setStep(i, { note: e.target.value })}
              aria-label={`Tip for step ${i + 1}`}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
