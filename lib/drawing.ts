import type { Blueprint } from "@/lib/data";

type Designed = Pick<Blueprint, "slug" | "sections" | "structure" | "tiles" | "bricks" | "boxes" | "dice" | "paper" | "cubes">;

// Short fingerprint of a design (FNV-1a), so a drawing's URL changes only when the design does.
function fingerprint(bp: Designed) {
  const text = JSON.stringify([bp.sections, bp.structure, bp.tiles, bp.bricks, bp.boxes, bp.dice, bp.paper, bp.cubes]);
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

// Where a blueprint's cached drawing lives (see app/api/drawing).
export function drawingUrl(bp: Designed, opts: { animate?: boolean; step?: number } = {}) {
  const q = new URLSearchParams();
  if (opts.animate) q.set("animate", "1");
  if (opts.step) q.set("step", String(opts.step));
  q.set("v", fingerprint(bp));
  return `/api/drawing/${bp.slug}?${q}`;
}
