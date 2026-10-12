import type { Blueprint } from "@/lib/data";

// Which kind of build a blueprint is, and the words the site uses for it.

export type BuildKind = "tower" | "structure" | "tiles" | "bricks" | "boxes" | "dice";

export function buildKind(bp: Pick<Blueprint, "structure" | "tiles" | "bricks" | "boxes" | "dice">): BuildKind {
  if (bp.dice) return "dice";
  if (bp.boxes) return "boxes";
  if (bp.bricks) return "bricks";
  if (bp.tiles) return "tiles";
  if (bp.structure) return "structure";
  return "tower";
}

// What it's built with, for photo descriptions.
export const MATERIAL: Record<BuildKind, string> = {
  tower: "magnetic blocks",
  structure: "magnetic blocks",
  tiles: "magnetic tiles",
  bricks: "LEGO DUPLO bricks",
  boxes: "cardboard boxes",
  dice: "dice",
};

// The kind of blueprint, for page descriptions: "an official ... blueprint".
export const BLUEPRINT_KIND: Record<BuildKind, string> = {
  tower: "magnetic block tower",
  structure: "magnetic block tower",
  tiles: "magnetic tile",
  bricks: "LEGO DUPLO",
  boxes: "cardboard box",
  dice: "dice",
};

// The toy a buyer needs, shown as a chip on cards. Magnetic blocks are the default, so they get none.
export const TOY_CHIP: Partial<Record<BuildKind, string>> = {
  tiles: "Magnetic tiles",
  bricks: "LEGO DUPLO",
  boxes: "Cardboard boxes",
  dice: "Dice",
};
