"use client";

import { buildStructure, MAX_RUN, MAX_START, type Dir, type Part, type Structure } from "@/lib/structure";

// Edit the numbers of a sideways build: how high the beam starts, each pillar's
// base, and how many blocks go each way. Parts can't be added or removed here.

const DIR_OPTIONS: { v: Dir; label: string }[] = [
  { v: "E", label: "→ across" },
  { v: "W", label: "← back" },
  { v: "N", label: "↑ away" },
  { v: "S", label: "↓ toward you" },
  { v: "U", label: "⤒ up" },
  { v: "D", label: "⤓ down" },
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
    <label className="flex items-center gap-1.5">
      <span className="text-xs font-extrabold text-ink uppercase">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Math.round(Number(e.target.value) || min))))}
        className="field !w-16 !px-1 !py-1 text-center font-display text-lg"
      />
    </label>
  );
}

export default function StructureEditor({
  structure,
  onChange,
}: {
  structure: Structure;
  onChange: (s: Structure) => void;
}) {
  const built = buildStructure(structure);
  const paths = structure.parts.flatMap((p, i) => (p.kind === "path" ? [{ i, label: p.label }] : []));
  const setPart = (i: number, next: Part) =>
    onChange({ ...structure, parts: structure.parts.map((p, j) => (j === i ? next : p)) });

  return (
    <div>
      <span className="label">Parts (in building order)</span>
      <div className="mb-3 rounded-xl border-2 border-navy/25 bg-paper p-3">
        <Num
          label="The path starts this many blocks up"
          value={structure.startLayer}
          min={1}
          max={MAX_START}
          onChange={(n) => onChange({ ...structure, startLayer: n })}
        />
      </div>
      <ol className="space-y-2">
        {structure.parts.map((p, i) => {
          const stats = built.parts[i];
          return (
            <li key={i} className="rounded-xl border-2 border-navy/25 bg-paper p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg text-brand">#{i + 1}</span>
                <input
                  className="field !w-auto flex-1 !py-1.5 font-display"
                  value={p.label}
                  maxLength={40}
                  onChange={(e) => setPart(i, { ...p, label: e.target.value })}
                  aria-label={`Name for part ${i + 1}`}
                />
                <span className="text-sm font-bold text-ink">
                  = <span className="font-display text-base text-navy">{stats?.blocks ?? 0}</span> blocks
                </span>
              </div>

              {p.kind === "pillar" ? (
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Num label="Base wide" value={p.base.w} min={1} max={8} onChange={(n) => setPart(i, { ...p, base: { ...p.base, w: n } })} />
                  <Num label="Deep" value={p.base.d} min={1} max={8} onChange={(n) => setPart(i, { ...p, base: { ...p.base, d: n } })} />
                  <Num
                    label="Layers"
                    value={p.base.layers}
                    min={0}
                    max={40}
                    onChange={(n) => setPart(i, { ...p, base: { ...p.base, layers: n } })}
                  />
                  <label className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-ink uppercase">Holds up</span>
                    <select
                      className="field !w-auto !py-1 text-sm"
                      value={p.holds.part}
                      onChange={(e) => setPart(i, { ...p, holds: { ...p.holds, part: Number(e.target.value) } })}
                    >
                      {paths.map((q) => (
                        <option key={q.i} value={q.i}>
                          {q.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Num
                    label="Block #"
                    value={p.holds.block}
                    min={1}
                    max={400}
                    onChange={(n) => setPart(i, { ...p, holds: { ...p.holds, block: n } })}
                  />
                  {stats?.kind === "pillar" ? (
                    <span className="text-sm font-bold text-ink">Column: {stats.column} blocks</span>
                  ) : null}
                </div>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {p.start ? (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="text-xs font-extrabold text-ink uppercase">Starts at</span>
                      <Num
                        label="Across"
                        value={p.start.x}
                        min={0}
                        max={60}
                        onChange={(n) => setPart(i, { ...p, start: { ...p.start!, x: n } })}
                      />
                      <Num
                        label="Back"
                        value={p.start.y}
                        min={0}
                        max={60}
                        onChange={(n) => setPart(i, { ...p, start: { ...p.start!, y: n } })}
                      />
                      <Num
                        label="Up"
                        value={p.start.z}
                        min={0}
                        max={MAX_START}
                        onChange={(n) => setPart(i, { ...p, start: { ...p.start!, z: n } })}
                      />
                    </div>
                  ) : null}
                  {p.runs.map((r, k) => (
                    <div key={k} className="flex flex-wrap items-center gap-2">
                      <select
                        className="field !w-auto !py-1 text-sm"
                        value={r.dir}
                        aria-label={`Direction ${k + 1}`}
                        onChange={(e) =>
                          setPart(i, { ...p, runs: p.runs.map((x, j) => (j === k ? { ...x, dir: e.target.value as Dir } : x)) })
                        }
                      >
                        {DIR_OPTIONS.map((o) => (
                          <option key={o.v} value={o.v}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <Num
                        label="Blocks"
                        value={r.n}
                        min={1}
                        max={MAX_RUN}
                        onChange={(n) => setPart(i, { ...p, runs: p.runs.map((x, j) => (j === k ? { ...x, n } : x)) })}
                      />
                      <button
                        type="button"
                        className="btn btn-white btn-sm !px-2"
                        disabled={p.runs.length <= 1}
                        onClick={() => setPart(i, { ...p, runs: p.runs.filter((_, j) => j !== k) })}
                        aria-label={`Remove direction ${k + 1}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-white btn-sm"
                    disabled={p.runs.length >= 16}
                    onClick={() => setPart(i, { ...p, runs: [...p.runs, { dir: "E", n: 3 }] })}
                  >
                    + Add a turn
                  </button>
                </div>
              )}

              <input
                className="field mt-2 !py-1.5 text-sm"
                placeholder="Tip for builders (where it goes)"
                value={p.note ?? ""}
                maxLength={300}
                onChange={(e) => setPart(i, { ...p, note: e.target.value })}
                aria-label={`Tip for part ${i + 1}`}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
