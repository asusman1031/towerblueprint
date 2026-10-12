"use client";

import { buildCubeDesign, type CubeBox, type CubeDesign } from "@/lib/cubes";

// Edit a free-form magnetic block build, step by step. Each step is a few boxes
// of blocks: where the box starts (across, back, up) and how big it is (wide,
// deep, tall), all counted in blocks. The counts update as you type.

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

export default function CubesEditor({ cubes, onChange }: { cubes: CubeDesign; onChange: (c: CubeDesign) => void }) {
  const built = buildCubeDesign(cubes);
  const setStep = (i: number, patch: Partial<CubeDesign["steps"][number]>) =>
    onChange({ ...cubes, steps: cubes.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const setBox = (i: number, k: number, patch: Partial<CubeBox>) =>
    setStep(i, { boxes: cubes.steps[i].boxes.map((b, j) => (j === k ? { ...b, ...patch } : b)) });

  return (
    <div>
      <span className="label">Steps (in building order)</span>
      <p className="mb-2 text-sm text-ink">
        Each box is a block of blocks: where it starts (across, back, up) and how big it is. Boxes can hang out past the
        layer below. The whole build is <strong>{built.count}</strong> blocks.
      </p>
      <ol className="space-y-2">
        {cubes.steps.map((s, i) => (
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
                = <span className="font-display text-base text-navy">{built.steps[i]?.count ?? 0}</span> blocks
              </span>
            </div>
            <ul className="mt-2 space-y-1.5">
              {s.boxes.map((b, k) => (
                <li key={k} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-navy/10 pt-1.5">
                  <Num label="Across" value={b.x} min={-30} max={30} onChange={(n) => setBox(i, k, { x: n })} />
                  <Num label="Back" value={b.y} min={-30} max={30} onChange={(n) => setBox(i, k, { y: n })} />
                  <Num label="Up" value={b.z} min={0} max={120} onChange={(n) => setBox(i, k, { z: n })} />
                  <Num label="Wide" value={b.w} min={1} max={30} onChange={(n) => setBox(i, k, { w: n })} />
                  <Num label="Deep" value={b.d} min={1} max={30} onChange={(n) => setBox(i, k, { d: n })} />
                  <Num label="Tall" value={b.h} min={1} max={60} onChange={(n) => setBox(i, k, { h: n })} />
                  <button
                    type="button"
                    className="btn btn-white btn-sm !px-2"
                    disabled={s.boxes.length <= 1}
                    onClick={() => setStep(i, { boxes: s.boxes.filter((_, j) => j !== k) })}
                    aria-label={`Remove box ${k + 1}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn-white btn-sm mt-2"
              disabled={s.boxes.length >= 30}
              onClick={() => {
                const last = s.boxes[s.boxes.length - 1] ?? { x: 0, y: 0, z: 0, w: 1, d: 1, h: 1 };
                setStep(i, { boxes: [...s.boxes, { ...last, z: last.z + last.h }] });
              }}
            >
              + Add a box on top of the last one
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
