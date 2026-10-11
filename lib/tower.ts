// Tower geometry: a blueprint is a stack of sections, bottom first.
// Each section is a w x d rectangle of blocks, repeated `count` layers high.

export type Section = {
  w: number;
  d: number;
  count: number;
  label?: string;
};

export type Cube = { x: number; y: number; z: number };

export type SectionStats = Section & {
  index: number;
  name: string;
  perLayer: number;
  blocks: number;
  heightBefore: number;
  heightAfter: number;
  blocksBefore: number;
  blocksAfter: number;
};

export const MAX_SIDE = 12;
export const MAX_LAYERS = 120;

export function cleanSections(input: unknown): Section[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((s) => {
      const r = (s ?? {}) as Record<string, unknown>;
      const clamp = (v: unknown, max: number) =>
        Math.max(1, Math.min(max, Math.round(Number(v) || 0)));
      const label = typeof r.label === "string" ? r.label.trim().slice(0, 40) : "";
      return {
        w: clamp(r.w, MAX_SIDE),
        d: clamp(r.d ?? r.w, MAX_SIDE),
        count: clamp(r.count, MAX_LAYERS),
        ...(label ? { label } : {}),
      };
    })
    .slice(0, 20);
}

function defaultName(i: number, total: number, s: Section) {
  if (i === 0) return "The Base";
  if (i === total - 1 && s.w === 1 && s.d === 1) return "The Spire";
  if (i === total - 1) return "The Top";
  return `Level ${i + 1}`;
}

export function sectionStats(sections: Section[]): SectionStats[] {
  let height = 0;
  let blocks = 0;
  return sections.map((s, index) => {
    const perLayer = s.w * s.d;
    const sectionBlocks = perLayer * s.count;
    const row: SectionStats = {
      ...s,
      index,
      name: s.label || defaultName(index, sections.length, s),
      perLayer,
      blocks: sectionBlocks,
      heightBefore: height,
      heightAfter: height + s.count,
      blocksBefore: blocks,
      blocksAfter: blocks + sectionBlocks,
    };
    height += s.count;
    blocks += sectionBlocks;
    return row;
  });
}

export function towerTotals(sections: Section[]) {
  const footprintW = Math.max(0, ...sections.map((s) => s.w));
  const footprintD = Math.max(0, ...sections.map((s) => s.d));
  return {
    blocks: sections.reduce((n, s) => n + s.w * s.d * s.count, 0),
    height: sections.reduce((n, s) => n + s.count, 0),
    footprintW,
    footprintD,
  };
}

// Every block in the tower. Each section is centered on the base footprint.
export function buildCubes(sections: Section[]): (Cube & { section: number })[] {
  const { footprintW, footprintD } = towerTotals(sections);
  const cubes: (Cube & { section: number })[] = [];
  let z = 0;
  sections.forEach((s, section) => {
    const x0 = Math.floor((footprintW - s.w) / 2);
    const y0 = Math.floor((footprintD - s.d) / 2);
    for (let layer = 0; layer < s.count; layer++) {
      for (let x = 0; x < s.w; x++) {
        for (let y = 0; y < s.d; y++) {
          cubes.push({ x: x0 + x, y: y0 + y, z, section });
        }
      }
      z++;
    }
  });
  return cubes;
}

export function difficultyLabel(n: number) {
  return ["", "Easy", "Medium", "Expert"][Math.max(1, Math.min(3, n))];
}

export function formatPrice(cents: number | null | undefined) {
  if (cents == null) return "";
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

// A made-up tower used to show what a custom blueprint looks like,
// so marketing never gives away a real blueprint's recipe.
export const SAMPLE_CUSTOM_TOWER: { name: string; sections: Section[] } = {
  name: "Your Tower Here",
  sections: [
    { w: 4, d: 4, count: 4 },
    { w: 2, d: 2, count: 8 },
    { w: 1, d: 1, count: 10 },
  ],
};
