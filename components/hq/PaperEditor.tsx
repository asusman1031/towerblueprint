"use client";

import { buildPaper, type PaperDesign, type Pt } from "@/lib/paper";

// Edit a packing paper build: how many sheets go into the rope, and where the
// rope goes on the floor, step by step. Points are in feet: across, then away
// from you. The length adds up as you type.

function Num({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
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
        step={step}
        value={value}
        onChange={(e) => {
          const n = Math.round((Number(e.target.value) || 0) / step) * step;
          onChange(Math.max(min, Math.min(max, Math.round(n * 10) / 10)));
        }}
        className="field !w-16 !px-1 !py-1 text-center font-display text-lg"
      />
    </label>
  );
}

export default function PaperEditor({ paper, onChange }: { paper: PaperDesign; onChange: (p: PaperDesign) => void }) {
  const built = buildPaper(paper);
  const setStep = (i: number, patch: Partial<PaperDesign["steps"][number]>) =>
    onChange({ ...paper, steps: paper.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const setPoint = (i: number, k: number, p: Pt) =>
    setStep(i, { path: paper.steps[i].path.map((q, j) => (j === k ? p : q)) });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <Num label="Sheets of paper" value={paper.sheets} min={1} max={50} onChange={(n) => onChange({ ...paper, sheets: n })} />
        <label className="flex items-center gap-2 text-sm font-bold text-navy">
          <input
            type="checkbox"
            checked={!!paper.face}
            onChange={(e) => onChange({ ...paper, face: e.target.checked || undefined })}
          />
          The end is a head (draw eyes)
        </label>
      </div>
      <span className="label">Steps (in building order, starting at the tail)</span>
      <p className="mb-2 text-sm text-ink">
        Points are in feet: across, then away from you. Each step carries on from the last point of the step before.
        The rope is about <strong>{built.feet} feet</strong> long and needs a {built.wide} × {built.deep} foot space.
      </p>
      <ol className="space-y-2">
        {paper.steps.map((s, i) => (
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
                = about <span className="font-display text-base text-navy">{built.steps[i]?.feet ?? 0}</span> feet
              </span>
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {s.path.map(([x, y], k) => (
                <li key={k} className="flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-2 py-1">
                  <Num label="Across" value={x} min={-100} max={100} step={0.1} onChange={(n) => setPoint(i, k, [n, y])} />
                  <Num label="Away" value={y} min={-100} max={100} step={0.1} onChange={(n) => setPoint(i, k, [x, n])} />
                  <button
                    type="button"
                    className="btn btn-white btn-sm !px-2"
                    disabled={s.path.length <= 1}
                    onClick={() => setStep(i, { path: s.path.filter((_, j) => j !== k) })}
                    aria-label={`Remove point ${k + 1}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn-white btn-sm mt-2"
              disabled={s.path.length >= 40}
              onClick={() => {
                const [x, y] = s.path[s.path.length - 1] ?? [0, 0];
                setStep(i, { path: [...s.path, [x, Math.round((y + 0.5) * 10) / 10]] });
              }}
            >
              + Add a point after the last one
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
