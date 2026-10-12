"use client";

import { buildDice, DICE_COLORS, type DiceDesign, type Die, type DieColor } from "@/lib/dice";

// Edit the dice of a dice build, step by step: where each die sits, its color,
// and which numbers face the front and the top. The dot math updates as you type.

const COLORS = Object.keys(DICE_COLORS) as DieColor[];

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

export default function DiceEditor({ dice, onChange }: { dice: DiceDesign; onChange: (d: DiceDesign) => void }) {
  const built = buildDice(dice);
  const setStep = (i: number, patch: Partial<DiceDesign["steps"][number]>) =>
    onChange({ ...dice, steps: dice.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const setDie = (i: number, k: number, patch: Partial<Die>) =>
    setStep(i, { dice: dice.steps[i].dice.map((d, j) => (j === k ? { ...d, ...patch } : d)) });

  return (
    <div>
      <span className="label">Steps (in building order)</span>
      <p className="mb-2 text-sm text-ink">
        Across, back and up are counted in dice. Front is the number facing you, top is the number on top. The dots facing
        you add up to <strong>{built.dots}</strong>.
      </p>
      <ol className="space-y-2">
        {dice.steps.map((s, i) => (
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
                = <span className="font-display text-base text-navy">{s.dice.length}</span> dice
              </span>
            </div>
            <ul className="mt-2 space-y-1.5">
              {s.dice.map((d, k) => (
                <li key={k} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-navy/10 pt-1.5">
                  <span
                    className="h-5 w-5 shrink-0 rounded border-2 border-navy"
                    style={{ background: DICE_COLORS[d.color] }}
                    aria-hidden
                  />
                  <select
                    className="field !w-auto !py-1 text-sm"
                    value={d.color}
                    aria-label={`Color of die ${k + 1}`}
                    onChange={(e) => setDie(i, k, { color: e.target.value as DieColor })}
                  >
                    {COLORS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <Num label="Front" value={d.front} min={1} max={6} onChange={(n) => setDie(i, k, { front: n })} />
                  <Num label="Top" value={d.top} min={1} max={6} onChange={(n) => setDie(i, k, { top: n })} />
                  <Num label="Across" value={d.x} min={-20} max={20} onChange={(n) => setDie(i, k, { x: n })} />
                  <Num label="Back" value={d.y} min={-20} max={20} onChange={(n) => setDie(i, k, { y: n })} />
                  <Num label="Up" value={d.z} min={0} max={40} onChange={(n) => setDie(i, k, { z: n })} />
                  <button
                    type="button"
                    className="btn btn-white btn-sm !px-2"
                    disabled={s.dice.length <= 1}
                    onClick={() => setStep(i, { dice: s.dice.filter((_, j) => j !== k) })}
                    aria-label={`Remove die ${k + 1}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn-white btn-sm mt-2"
              disabled={s.dice.length >= 40}
              onClick={() => {
                const last = s.dice[s.dice.length - 1] ?? { x: -1, y: 0, z: 0 };
                setStep(i, { dice: [...s.dice, { x: last.x + 1, y: last.y, z: last.z, color: "red", front: 1, top: 2 }] });
              }}
            >
              + Add a die next to the last one
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
