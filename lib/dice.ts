// Builds made of dice. Each step is a list of dice; a die sits at x (across),
// y (back) and z (up), counted in dice. Each die says which number faces the
// front and which is on top; the number on its right side follows from those,
// because every regular die is made the same way.

export const DICE_COLORS = {
  red: "#EC5B43",
  orange: "#F7913D",
  yellow: "#FFD23F",
  green: "#44B87A",
  blue: "#1F55D6",
  purple: "#8B55C9",
  white: "#F4F4F0",
  black: "#2B2B2B",
} as const;
export type DieColor = keyof typeof DICE_COLORS;
const COLOR_NAMES = Object.keys(DICE_COLORS) as DieColor[];

export type Die = { x: number; y: number; z: number; color: DieColor; front: number; top: number };
export type DiceStep = { label: string; note?: string; dice: Die[] };
export type DiceDesign = {
  steps: DiceStep[];
  photos?: string[]; // more photos of the real build, shown on the blueprint page
  need?: string; // what to build it with
};

export type PlacedDie = Die & { right: number; step: number; id: number };

export type DiceStepStats = { index: number; label: string; note: string; dice: PlacedDie[]; countAfter: number };

export type BuiltDice = {
  dice: PlacedDie[];
  steps: DiceStepStats[];
  count: number;
  tall: number; // in dice
  wide: number; // in dice
  rows: { z: number; dots: number[]; sum: number }[]; // dots facing the front, row by row from the bottom
  dots: number; // all the dots facing the front
  colors: { color: DieColor; count: number }[];
};

const MAX_STEPS = 10;
const MAX_DICE = 40;

const int = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// A regular die: 1 at +x, 2 at +y, 3 at +z, and each number across from 7 minus it.
const FACE: Record<number, [number, number, number]> = {
  1: [1, 0, 0],
  2: [0, 1, 0],
  3: [0, 0, 1],
  4: [0, 0, -1],
  5: [0, -1, 0],
  6: [-1, 0, 0],
};

// The number on the right side of a die, from the numbers on its front and top.
// Front and top can't be the same number or opposite sides; then any free side is used.
export function rightFace(front: number, top: number) {
  const ok = front !== top && front + top !== 7;
  if (ok) {
    // Facing the front, your right is up × toward-you. (1 on top and 2 facing you puts 3 on the right.)
    const [a, b, c] = FACE[top];
    const [d, e, f] = FACE[front];
    const cross = [b * f - c * e, c * d - a * f, a * e - b * d];
    const hit = Object.entries(FACE).find(([, v]) => v.every((n, i) => n === cross[i]));
    if (hit) return Number(hit[0]);
  }
  return [1, 2, 3, 4, 5, 6].find((n) => n !== front && n !== top && n !== 7 - front && n !== 7 - top) ?? 1;
}

export function cleanDice(input: unknown): DiceDesign | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  if (!Array.isArray(r.steps)) return null;
  const steps: DiceStep[] = r.steps.slice(0, MAX_STEPS).map((raw, i) => {
    const s = (raw ?? {}) as Record<string, unknown>;
    const note = text(s.note, 300);
    const dice = (Array.isArray(s.dice) ? s.dice : []).slice(0, MAX_DICE).map((d) => {
      const v = (d ?? {}) as Record<string, unknown>;
      return {
        x: int(v.x, -20, 20, 0),
        y: int(v.y, -20, 20, 0),
        z: int(v.z, 0, 40, 0),
        color: COLOR_NAMES.includes(v.color as DieColor) ? (v.color as DieColor) : "red",
        front: int(v.front, 1, 6, 1),
        top: int(v.top, 1, 6, 2),
      };
    });
    return { label: text(s.label, 40) || `Step ${i + 1}`, ...(note ? { note } : {}), dice };
  });
  if (!steps.some((s) => s.dice.length)) return null;
  const photos = (Array.isArray(r.photos) ? r.photos : [])
    .filter((x): x is string => typeof x === "string" && /^\/photos\/[a-z0-9-]+\.(jpg|png|webp)$/.test(x))
    .slice(0, 4);
  const need = text(r.need, 160);
  return { steps, ...(photos.length ? { photos } : {}), ...(need ? { need } : {}) };
}

export function buildDice(design: DiceDesign): BuiltDice {
  const dice: PlacedDie[] = [];
  const steps: DiceStepStats[] = [];
  let id = 0;
  design.steps.forEach((s, index) => {
    const placed = s.dice.map((d) => ({ ...d, right: rightFace(d.front, d.top), step: index, id: id++ }));
    dice.push(...placed);
    steps.push({ index, label: s.label, note: s.note ?? "", dice: placed, countAfter: dice.length });
  });

  // Only fronts you can see count: a die with another die right in front of it is hidden.
  const taken = new Set(dice.map((d) => `${d.x},${d.y},${d.z}`));
  const showing = dice.filter((d) => !taken.has(`${d.x},${d.y + 1},${d.z}`));
  const rows = [...new Set(showing.map((d) => d.z))]
    .sort((a, b) => a - b)
    .map((z) => {
      const dots = showing.filter((d) => d.z === z).sort((a, b) => a.x - b.x).map((d) => d.front);
      return { z, dots, sum: dots.reduce((n, v) => n + v, 0) };
    });

  const counts = new Map<DieColor, number>();
  for (const d of dice) counts.set(d.color, (counts.get(d.color) ?? 0) + 1);
  const xs = dice.map((d) => d.x);
  return {
    dice,
    steps,
    count: dice.length,
    tall: dice.length ? Math.max(...dice.map((d) => d.z)) + 1 : 0,
    wide: dice.length ? Math.max(...xs) - Math.min(...xs) + 1 : 0,
    rows,
    dots: rows.reduce((n, r) => n + r.sum, 0),
    colors: [...counts.entries()].map(([color, count]) => ({ color, count })).sort((a, b) => b.count - a.count),
  };
}

// Where the dots go on a face, in a 0..1 square (row by row, as you look at the face).
export const PIPS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [
    [0.27, 0.27],
    [0.73, 0.73],
  ],
  3: [
    [0.27, 0.27],
    [0.5, 0.5],
    [0.73, 0.73],
  ],
  4: [
    [0.27, 0.27],
    [0.73, 0.27],
    [0.27, 0.73],
    [0.73, 0.73],
  ],
  5: [
    [0.27, 0.27],
    [0.73, 0.27],
    [0.5, 0.5],
    [0.27, 0.73],
    [0.73, 0.73],
  ],
  6: [
    [0.27, 0.25],
    [0.73, 0.25],
    [0.27, 0.5],
    [0.73, 0.5],
    [0.27, 0.75],
    [0.73, 0.75],
  ],
};
