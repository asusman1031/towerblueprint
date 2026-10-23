import "server-only";
import { db } from "@/lib/supabase";
import { cleanStructure, type Structure } from "@/lib/structure";
import { cleanBoxes, type BoxDesign } from "@/lib/boxes";
import { cleanBricks, type BrickDesign } from "@/lib/bricks";
import { cleanDice, type DiceDesign } from "@/lib/dice";
import { cleanCubes, type CubeDesign } from "@/lib/cubes";
import { cleanPaper, type PaperDesign } from "@/lib/paper";
import { cleanTiles, type TileDesign } from "@/lib/tiles";
import { cleanSections, type Section } from "@/lib/tower";

export type Status = "draft" | "coming_soon" | "live";

export type Blueprint = {
  id: string;
  slug: string;
  number: number;
  name: string;
  tagline: string;
  description: string;
  inspired_by: string;
  fun_fact: string;
  sections: Section[];
  structure: Structure | null; // set for sideways builds; then `sections` is only a placeholder
  tiles: TileDesign | null; // set for magnetic tile builds; then `sections` is only a placeholder
  bricks: BrickDesign | null; // set for studded brick builds (LEGO); then `sections` is only a placeholder
  boxes: BoxDesign | null; // set for cardboard box builds; then `sections` is only a placeholder
  dice: DiceDesign | null; // set for dice builds; then `sections` is only a placeholder
  paper: PaperDesign | null; // set for packing paper builds; then `sections` is only a placeholder
  cubes: CubeDesign | null; // set for free-form magnetic block builds; then `sections` is only a placeholder
  difficulty: number;
  price_cents: number;
  checkout_url: string | null;
  status: Status;
  photo_url: string | null;
  designer: string;
  award?: string | null; // a prize the blueprint won, like "Best Design"
  original_pages: number;
  preview_url: string | null;
  sort_order: number;
};

export type OriginalFile = { id: number; mime: string; filename: string };

export type SiteSettings = {
  architectNote: string;
  customPriceCents: number;
  customOpen: boolean;
};

// Used until the database is connected, and as the seed row in Supabase.
export const SEED_BLUEPRINTS: Blueprint[] = [
  {
    id: "seed-jeddah",
    slug: "jeddah-tower",
    number: 1,
    name: "Jeddah Tower",
    tagline: "A super-skinny supertall that goes up, up, up.",
    description:
      "Sawyer's very first blueprint. Four sections that get skinnier as they go up, just like the real tower. It starts with a wide, strong base and ends with a spire one block wide.",
    inspired_by: "Jeddah Tower, Saudi Arabia",
    fun_fact:
      "The real Jeddah Tower is being built in Saudi Arabia. When it's finished it is planned to be about 1 kilometer tall (more than 3,000 feet), which would make it the tallest building in the world, taller than the Burj Khalifa.",
    sections: [
      { w: 5, d: 5, count: 6, label: "The Base" },
      { w: 3, d: 3, count: 12, label: "The Lower Tower" },
      { w: 2, d: 2, count: 12, label: "The Upper Tower" },
      { w: 1, d: 1, count: 21, label: "The Spire" },
    ],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: null,
    difficulty: 2,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/jeddah-tower-v2.jpg",
    designer: "",
    original_pages: 0,
    preview_url: null,
    sort_order: 1,
  },
  {
    id: "seed-snake-rope",
    slug: "snake-rope",
    number: 2,
    name: "The Snake Rope",
    tagline: "A bridge on pillars that leaps across two chairs and snakes over the table.",
    description:
      "Sawyer's second blueprint, and his first one that goes sideways! Three pillars hold up a long beam. It crosses two chairs, drops down, and turns into a zig-zag snake on the table.",
    inspired_by: "Sawyer's imagination",
    fun_fact:
      "Bridges and buildings use pillars (engineers call them columns) to carry weight down to the ground. The longer the beam between two pillars, the stronger it has to be. That's why Pillar C stands right under the lower beam.",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: {
      startLayer: 19,
      photos: ["/photos/snaking-pillar-structure-chairs.jpg"],
      parts: [
        {
          kind: "pillar",
          label: "Pillar A",
          on: "first chair",
          base: { w: 3, d: 2, layers: 4 },
          holds: { part: 2, block: 1 },
          note: "Build it on the seat of the first chair, near the back.",
        },
        {
          kind: "pillar",
          label: "Pillar B",
          on: "first chair",
          base: { w: 3, d: 2, layers: 4 },
          holds: { part: 2, block: 9 },
          note: "Build it on the same chair seat, next to Pillar A.",
        },
        {
          kind: "path",
          label: "The Top Beam",
          runs: [{ dir: "E", n: 13 }],
          note: "Start on top of Pillar A. The beam sits right on top of Pillar B, then keeps going until it reaches the back of the second chair.",
        },
        {
          kind: "path",
          label: "The Drop",
          runs: [{ dir: "D", n: 4 }],
          note: "Hang blocks straight down from the end of the top beam. Sawyer used a TNT block here!",
        },
        {
          kind: "pillar",
          label: "Pillar C",
          on: "second chair",
          base: { w: 3, d: 2, layers: 7 },
          holds: { part: 5, block: 3 },
          note: "Build it on the seat of the second chair, between the chair back and the table.",
        },
        {
          kind: "path",
          label: "The Lower Beam",
          runs: [{ dir: "E", n: 8 }],
          note: "Stick it to the side of the last block of the drop and head for the table. Pillar C holds it up.",
        },
        {
          kind: "path",
          label: "The Snake",
          on: "table",
          runs: [
            { dir: "E", n: 7 },
            { dir: "N", n: 10 },
            { dir: "E", n: 5 },
            { dir: "N", n: 8 },
            { dir: "E", n: 2 },
            { dir: "N", n: 1 },
            { dir: "E", n: 16 },
            { dir: "N", n: 11 },
          ],
          note: "Keep going onto the table and zig-zag like a snake!",
        },
      ],
    },
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: null,
    difficulty: 3,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/snaking-pillar-structure.jpg",
    designer: "",
    original_pages: 0,
    preview_url: null,
    sort_order: 2,
  },
  {
    id: "seed-dragon-tower",
    slug: "dragon-tower",
    number: 3,
    name: "The Dragon Tower",
    tagline: "A tall tower with a big ring around its middle.",
    description:
      "Our first guest architect! Sawyer's little brother Ashton designed this one. A big strong base, a skinny neck, a wide ring in the middle, then up, up, up to a pointy spire.",
    inspired_by: "",
    fun_fact:
      "Lots of tall towers have a ring partway up where people can look out. The CN Tower in Toronto has a glass floor up in its ring, 342 meters (more than 1,100 feet) above the ground, and you can stand right on it!",
    sections: [
      { w: 4, d: 4, count: 9, label: "The Big Base" },
      { w: 2, d: 2, count: 5, label: "The Neck" },
      { w: 4, d: 4, count: 2, label: "The Ring" },
      { w: 2, d: 2, count: 7, label: "The Tower" },
      { w: 2, d: 1, count: 5, label: "The Skinny Part" },
      { w: 1, d: 1, count: 4, label: "The Spire" },
    ],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: null,
    difficulty: 2,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/dragon-tower.jpg",
    designer: "Ashton (age 5)",
    original_pages: 0,
    preview_url: null,
    sort_order: 3,
  },
  {
    id: "seed-sims-tower",
    slug: "sims-tower",
    number: 4,
    name: "The Sims Tower",
    tagline: "A stepped base and a super-tall tower with a spire on top.",
    description:
      "Sawyer's newest tower. A wide base steps in like a pyramid, then a 2×2 tower shoots straight up and ends with a 9-block spire.",
    inspired_by: "",
    fun_fact:
      "Lots of skyscrapers get skinnier as they go up, in steps like this one. Builders call those steps setbacks. The Empire State Building in New York has them, and they help sunlight reach the street below.",
    sections: [
      { w: 7, d: 7, count: 1, label: "The Base" },
      { w: 5, d: 5, count: 3, label: "The First Step" },
      { w: 3, d: 3, count: 2, label: "The Second Step" },
      { w: 2, d: 2, count: 28, label: "The Tower" },
      { w: 1, d: 1, count: 9, label: "The Spire" },
    ],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: null,
    difficulty: 2,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/sims-tower.jpg",
    designer: "",
    original_pages: 0,
    preview_url: null,
    sort_order: 4,
  },
  {
    id: "seed-museum-of-tiles",
    slug: "museum-of-tiles",
    number: 5,
    name: "Museum of Tiles",
    tagline: "A see-through museum with two halls, a courtyard, and a tower on top.",
    description:
      "Ashton's second blueprint, and the first one built with magnetic tiles instead of blocks! Two halls, an open courtyard with a floor, a gallery upstairs, and a tower on top.",
    inspired_by: "",
    fun_fact:
      "The Louvre in Paris is the most visited art museum in the world. Its famous entrance is a giant pyramid made of 673 glass panes, kind of like a huge build of see-through tiles!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: {
      photos: ["/photos/museum-of-tiles-back.jpg"],
      rooms: [
        { label: "The Left Hall", x: 0, y: 0, z: 0, w: 1, d: 2, h: 2, roof: true, floor: false, note: "Build it right on the floor: walls all the way around, then the roof." },
        { label: "The Courtyard", x: 1, y: 0, z: 0, w: 2, d: 2, h: 2, roof: false, floor: true, note: "Lay the floor down first, then build the walls. Leave the top open so visitors can look in!" },
        { label: "The Right Hall", x: 3, y: 0, z: 0, w: 1, d: 2, h: 2, roof: true, floor: false, note: "Build it on the other side of the courtyard, then put on its roof." },
        { label: "The Gallery", x: 1, y: 0, z: 2, w: 2, d: 1, h: 1, roof: true, floor: false, note: "Stand it on the back half of the courtyard. It rests on the tops of the walls." },
        { label: "The Tower", x: 1, y: 0, z: 3, w: 1, d: 1, h: 2, roof: true, floor: false, note: "Stand it on the left side of the gallery roof. Go slow, it gets tall!" },
      ],
    },
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: null,
    difficulty: 1,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/museum-of-tiles.jpg",
    designer: "Ashton (age 5)",
    original_pages: 0,
    preview_url: null,
    sort_order: 5,
  },
  {
    id: "seed-ring-tower",
    slug: "ring-tower",
    number: 6,
    name: "Ring Tower",
    tagline: "A tall tower wrapped in rings, with a tiny ring at the very top.",
    description:
      "Sawyer's newest tower has rings! Three wide 5×5 rings stick out around the tower, and a little 3×3 ring sits near the top, just under the spire.",
    inspired_by: "",
    fun_fact:
      "Real supertall skyscrapers have extra-strong floors partway up, called belt floors. They wrap around the building like a ring and help keep it from swaying in the wind.",
    sections: [
      { w: 5, d: 5, count: 1, label: "The Bottom Ring" },
      { w: 5, d: 3, count: 3, label: "The Base" },
      { w: 5, d: 5, count: 1, label: "The Second Ring" },
      { w: 5, d: 3, count: 4, label: "The Lower Tower" },
      { w: 3, d: 3, count: 5, label: "The Middle" },
      { w: 5, d: 5, count: 1, label: "The Third Ring" },
      { w: 5, d: 3, count: 3, label: "The Upper Tower" },
      { w: 3, d: 3, count: 4, label: "The Top Tower" },
      { w: 1, d: 1, count: 2, label: "The Neck" },
      { w: 3, d: 3, count: 1, label: "The Top Ring" },
      { w: 1, d: 1, count: 4, label: "The Spire" },
    ],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: null,
    difficulty: 3,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/sawyer-ring-tower.jpg",
    designer: "",
    original_pages: 0,
    preview_url: null,
    sort_order: 6,
  },
  {
    id: "seed-tic-tac-toe-twin-towers",
    slug: "tic-tac-toe-twin-towers",
    number: 7,
    name: "Tic Tac Toe Twin Towers",
    tagline: "Two little towers, one for X and one for O. Who wins?",
    description:
      "Sawyer built this one with tic-tac-toe pieces! Two towers stand side by side: the X Tower and the O Tower. It's his smallest blueprint yet, perfect for little builders.",
    inspired_by: "",
    fun_fact:
      "Tic-tac-toe is really old: the ancient Romans played a game like it called terni lapilli. And if both players make the best move every time, nobody can win. It always ends in a tie!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: {
      startLayer: 1,
      need: "8 tic-tac-toe pieces (or any 8 blocks), with an X and an O for the tops",
      parts: [
        {
          kind: "path",
          label: "The X Tower",
          start: { x: 0, y: 0, z: 0 },
          runs: [{ dir: "U", n: 3 }],
          mark: "X",
          note: "Stack 4 pieces. Put the X on top!",
        },
        {
          kind: "path",
          label: "The O Tower",
          start: { x: 2, y: 0, z: 0 },
          runs: [{ dir: "U", n: 3 }],
          mark: "O",
          note: "Leave one empty space next to the X Tower, then stack 4 more. Put the O on top!",
        },
      ],
    },
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: null,
    difficulty: 1,
    price_cents: 200,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/tic-tac-toe-twin-towers.jpg",
    designer: "",
    original_pages: 0,
    preview_url: null,
    sort_order: 7,
  },
  {
    id: "seed-crazy-lego-tower",
    slug: "crazy-lego-tower",
    number: 8,
    name: "Crazy Lego Tower",
    tagline: "A rainbow brick tower with a zig-zag top that sticks way out.",
    description:
      "Ashton's third blueprint, built with big LEGO DUPLO bricks! A strong yellow base, a patchwork middle, rainbow stripes, and a crazy zig-zag top that sticks way out to the side.",
    inspired_by: "",
    fun_fact:
      "DUPLO bricks are exactly twice as long, twice as wide and twice as tall as regular LEGO bricks, and the two kinds can even click together!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: {
      need: "21 DUPLO-size bricks, including one thin 2×4 plate",
      photos: ["/photos/crazy-lego-tower-back.webp"],
      steps: [
        {
          label: "The Base",
          note: "Start with the thin green plate. Then stack the yellow layers: two small bricks, one long brick, two small, one long. Switching keeps the tower strong!",
          bricks: [
            { x: 0, y: 0, z: 0, w: 4, d: 2, h: 1, color: "lime" },
            { x: 0, y: 0, z: 1, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 2, y: 0, z: 1, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 0, y: 0, z: 4, w: 4, d: 2, h: 3, color: "yellow" },
            { x: 0, y: 0, z: 7, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 2, y: 0, z: 7, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 0, y: 0, z: 10, w: 4, d: 2, h: 3, color: "yellow" },
          ],
        },
        {
          label: "The Patchwork",
          note: "Two small bricks side by side on each layer. The yellow star brick is two bricks tall, so the top layer only needs one small blue brick next to it.",
          bricks: [
            { x: 0, y: 0, z: 13, w: 2, d: 2, h: 3, color: "green" },
            { x: 2, y: 0, z: 13, w: 2, d: 2, h: 3, color: "red" },
            { x: 0, y: 0, z: 16, w: 2, d: 2, h: 3, color: "lime" },
            { x: 2, y: 0, z: 16, w: 2, d: 2, h: 3, color: "orange" },
            { x: 0, y: 0, z: 19, w: 2, d: 2, h: 3, color: "red" },
            { x: 2, y: 0, z: 19, w: 2, d: 2, h: 6, color: "yellow" },
            { x: 0, y: 0, z: 22, w: 2, d: 2, h: 3, color: "blue" },
          ],
        },
        {
          label: "The Stripes",
          note: "Three long bricks, each one lined up right on top of the last.",
          bricks: [
            { x: 0, y: 0, z: 25, w: 4, d: 2, h: 3, color: "lime" },
            { x: 0, y: 0, z: 28, w: 4, d: 2, h: 3, color: "sky" },
            { x: 0, y: 0, z: 31, w: 4, d: 2, h: 3, color: "lime" },
          ],
        },
        {
          label: "The Crazy Top",
          note: "The extra-long blue brick sits on just half of the top and sticks way out. Then zig-zag: orange over the tower, orange shifted back, red on top. Hold it while you press!",
          bricks: [
            { x: -6, y: 0, z: 34, w: 8, d: 2, h: 3, color: "blue" },
            { x: 0, y: 0, z: 37, w: 4, d: 2, h: 3, color: "orange" },
            { x: -2, y: 0, z: 40, w: 4, d: 2, h: 3, color: "orange" },
            { x: 0, y: 0, z: 43, w: 4, d: 2, h: 3, color: "red" },
          ],
        },
      ],
    },
    boxes: null,
    dice: null,
    paper: null,
    cubes: null,
    difficulty: 2,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/crazy-lego-tower.webp",
    designer: "Ashton (age 5)",
    original_pages: 0,
    preview_url: null,
    sort_order: 8,
  },
  {
    id: "seed-james-tower",
    slug: "james-tower",
    number: 9,
    name: "The James Tower",
    tagline: "A super-tall rainbow tower with a hat, a lookout eye, and a propeller on top.",
    description:
      "Sawyer's first LEGO DUPLO blueprint! A rainbow tower four studs wide, a hat that sticks out on both sides, a skinny neck with an eye peeking out, and a propeller on top.",
    inspired_by: "",
    fun_fact: "The name LEGO comes from two Danish words, \"leg godt\", which mean \"play well\".",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: {
      need: "69 DUPLO-size bricks, including two thin 2×4 plates",
      photos: ["/photos/james-tower-back.webp"],
      steps: [
        {
          label: "The Rainbow Base",
          note: "Every layer has a back row and a front row. Long bricks fill a whole row. On the maps, the front row is at the bottom.",
          bricks: [
            { x: 0, y: 0, z: 0, w: 2, d: 2, h: 3, color: "sky" },
            { x: 2, y: 0, z: 0, w: 2, d: 2, h: 3, color: "green" },
            { x: 0, y: 2, z: 0, w: 2, d: 2, h: 3, color: "sky" },
            { x: 2, y: 2, z: 0, w: 2, d: 2, h: 3, color: "green" },
            { x: 0, y: 0, z: 3, w: 4, d: 2, h: 3, color: "lime" },
            { x: 0, y: 2, z: 3, w: 4, d: 2, h: 3, color: "orange" },
            { x: 0, y: 0, z: 6, w: 4, d: 2, h: 3, color: "sky" },
            { x: 0, y: 2, z: 6, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 2, y: 2, z: 6, w: 2, d: 2, h: 3, color: "lime" },
            { x: 0, y: 0, z: 9, w: 2, d: 2, h: 3, color: "orange" },
            { x: 2, y: 0, z: 9, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 0, y: 2, z: 9, w: 2, d: 2, h: 3, color: "blue" },
            { x: 2, y: 2, z: 9, w: 2, d: 2, h: 3, color: "lime" },
            { x: 0, y: 0, z: 12, w: 2, d: 2, h: 3, color: "green" },
            { x: 2, y: 0, z: 12, w: 2, d: 2, h: 3, color: "sky" },
            { x: 0, y: 2, z: 12, w: 2, d: 2, h: 3, color: "red" },
            { x: 2, y: 2, z: 12, w: 2, d: 2, h: 3, color: "orange" },
          ],
        },
        {
          label: "The Middle",
          note: "Keep stacking, back row then front row. Press each layer down hard so the tower stays straight.",
          bricks: [
            { x: 0, y: 0, z: 15, w: 2, d: 2, h: 3, color: "red" },
            { x: 2, y: 0, z: 15, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 0, y: 2, z: 15, w: 2, d: 2, h: 3, color: "lime" },
            { x: 2, y: 2, z: 15, w: 2, d: 2, h: 3, color: "lime" },
            { x: 0, y: 0, z: 18, w: 2, d: 2, h: 3, color: "sky" },
            { x: 2, y: 0, z: 18, w: 2, d: 2, h: 3, color: "blue" },
            { x: 0, y: 2, z: 18, w: 2, d: 2, h: 3, color: "red" },
            { x: 2, y: 2, z: 18, w: 2, d: 2, h: 3, color: "sky" },
            { x: 0, y: 0, z: 21, w: 2, d: 2, h: 3, color: "orange" },
            { x: 2, y: 0, z: 21, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 0, y: 2, z: 21, w: 2, d: 2, h: 3, color: "blue" },
            { x: 2, y: 2, z: 21, w: 2, d: 2, h: 3, color: "blue" },
            { x: 0, y: 0, z: 24, w: 4, d: 2, h: 3, color: "blue" },
            { x: 0, y: 2, z: 24, w: 2, d: 2, h: 3, color: "sky" },
            { x: 2, y: 2, z: 24, w: 2, d: 2, h: 3, color: "sky" },
            { x: 0, y: 0, z: 27, w: 2, d: 2, h: 3, color: "red" },
            { x: 2, y: 0, z: 27, w: 2, d: 2, h: 3, color: "lime" },
            { x: 0, y: 2, z: 27, w: 2, d: 2, h: 3, color: "sky" },
            { x: 2, y: 2, z: 27, w: 2, d: 2, h: 3, color: "yellow" },
          ],
        },
        {
          label: "The Top of the Tower",
          note: "Look for the green brick with an eye and turn it to look out the front! The last layer is two long bricks.",
          bricks: [
            { x: 0, y: 0, z: 30, w: 2, d: 2, h: 3, color: "red" },
            { x: 2, y: 0, z: 30, w: 2, d: 2, h: 3, color: "sky" },
            { x: 0, y: 2, z: 30, w: 2, d: 2, h: 3, color: "blue" },
            { x: 2, y: 2, z: 30, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 0, y: 0, z: 33, w: 2, d: 2, h: 3, color: "green" },
            { x: 2, y: 0, z: 33, w: 2, d: 2, h: 3, color: "orange" },
            { x: 0, y: 2, z: 33, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 2, y: 2, z: 33, w: 2, d: 2, h: 3, color: "green" },
            { x: 0, y: 0, z: 36, w: 2, d: 2, h: 3, color: "red" },
            { x: 2, y: 0, z: 36, w: 2, d: 2, h: 3, color: "red" },
            { x: 0, y: 2, z: 36, w: 2, d: 2, h: 3, color: "lime" },
            { x: 2, y: 2, z: 36, w: 2, d: 2, h: 3, color: "orange" },
            { x: 0, y: 0, z: 39, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 2, y: 0, z: 39, w: 2, d: 2, h: 3, color: "green" },
            { x: 0, y: 2, z: 39, w: 2, d: 2, h: 3, color: "green" },
            { x: 2, y: 2, z: 39, w: 2, d: 2, h: 3, color: "sky" },
            { x: 0, y: 0, z: 42, w: 4, d: 2, h: 3, color: "green" },
            { x: 0, y: 2, z: 42, w: 4, d: 2, h: 3, color: "blue" },
          ],
        },
        {
          label: "The Hat",
          note: "Four small bricks right on top. Then a row of three across the middle: the side bricks stick out one stud, and the green one starts the neck.",
          bricks: [
            { x: 0, y: 2, z: 45, w: 2, d: 2, h: 3, color: "orange" },
            { x: 2, y: 2, z: 45, w: 2, d: 2, h: 3, color: "sky" },
            { x: 0, y: 0, z: 45, w: 2, d: 2, h: 3, color: "sky" },
            { x: 2, y: 0, z: 45, w: 2, d: 2, h: 3, color: "blue" },
            { x: -1, y: 1, z: 48, w: 2, d: 2, h: 3, color: "sky" },
            { x: 1, y: 1, z: 48, w: 2, d: 2, h: 3, color: "green" },
            { x: 3, y: 1, z: 48, w: 2, d: 2, h: 3, color: "blue" },
          ],
        },
        {
          label: "The Neck",
          note: "Four small bricks straight up on the green one. The yellow brick has an eye, so turn it to look out the front!",
          bricks: [
            { x: 1, y: 1, z: 51, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 1, y: 1, z: 54, w: 2, d: 2, h: 3, color: "orange" },
            { x: 1, y: 1, z: 57, w: 2, d: 2, h: 3, color: "blue" },
            { x: 1, y: 1, z: 60, w: 2, d: 2, h: 3, color: "lime" },
          ],
        },
        {
          label: "The Propeller",
          note: "A long blue brick on the neck. Then the yellow brick in the middle, with a thin plate on each side sticking way out.",
          bricks: [
            { x: 0, y: 1, z: 63, w: 4, d: 2, h: 3, color: "blue" },
            { x: -3, y: 1, z: 66, w: 4, d: 2, h: 1, color: "sky" },
            { x: 1, y: 1, z: 66, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 3, y: 1, z: 66, w: 4, d: 2, h: 1, color: "orange" },
          ],
        },
      ],
    },
    boxes: null,
    dice: null,
    paper: null,
    cubes: null,
    difficulty: 2,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/james-tower.webp",
    designer: "",
    original_pages: 0,
    preview_url: null,
    sort_order: 9,
  },
  {
    id: "seed-box-tower",
    slug: "box-tower",
    number: 10,
    name: "Box Tower",
    tagline: "A tower of cardboard boxes, with a lookout box poking out the top.",
    description:
      "Sawyer's first blueprint built from cardboard boxes! A big box upside down with its flaps spread out, a tall box on top, and a small box inside that pokes out like a lookout. All you need is 3 boxes from the recycling bin.",
    inspired_by: "",
    fun_fact:
      "Cardboard boxes are strong because of the wavy layer hidden inside the cardboard. The waves work like lots of tiny arches holding up the weight!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: {
      need: "3 cardboard boxes: one big, one tall, and one small enough to fit inside the tall one",
      photos: ["/photos/box-tower-back.webp"],
      boxes: [
        {
          label: "The Base",
          size: "A big box",
          w: 18,
          d: 14,
          h: 9,
          x: 0,
          y: 0,
          z: 0,
          flaps: "floor",
          tape: true,
          note: "Turn the biggest box upside down. Open its 4 flaps and spread them flat on the floor, like a skirt. That keeps the tower steady!",
        },
        {
          label: "The Tower Box",
          size: "A tall box",
          w: 8,
          d: 8,
          h: 10,
          x: 5,
          y: 3,
          z: 9,
          flaps: "up",
          note: "Stand a tall box on top of the big box, right in the middle. Open its top flaps so they stick up.",
        },
        {
          label: "The Lookout",
          size: "A small box that fits inside the tall box",
          w: 7,
          d: 7,
          h: 14,
          x: 5.5,
          y: 3.5,
          z: 9,
          flaps: "up",
          inside: true,
          note: "Stand a smaller box inside the tall box so it pokes out the top. Open its flaps too. Now it's a lookout!",
        },
      ],
    },
    dice: null,
    paper: null,
    cubes: null,
    difficulty: 1,
    price_cents: 200,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/box-tower.webp",
    designer: "",
    original_pages: 0,
    preview_url: null,
    sort_order: 10,
  },
  {
    id: "seed-dice-wall",
    slug: "dice-wall",
    number: 11,
    name: "Dice Wall",
    tagline: "A little wall of 8 dice. Add up the dots to find its secret number!",
    description:
      "Sawyer's smallest blueprint yet, and the first one with math built in! Two rows of colorful dice, with every number facing out on purpose. Add up all the dots to find the wall's secret number.",
    inspired_by: "",
    fun_fact:
      "On every regular die, the dots on opposite sides add up to 7: 1 is across from 6, 2 from 5, and 3 from 4. Check your dice!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: {
      need: "8 dice: 2 red, 2 yellow, 2 blue and 2 green (any colors work)",
      steps: [
        {
          label: "The Bottom Row",
          note: "Line up 4 dice side by side. Turn each one so the right number faces you: 5, 5, 5 and 4.",
          dice: [
            { x: 0, y: 0, z: 0, color: "red", front: 5, top: 1 },
            { x: 1, y: 0, z: 0, color: "blue", front: 5, top: 1 },
            { x: 2, y: 0, z: 0, color: "blue", front: 5, top: 1 },
            { x: 3, y: 0, z: 0, color: "green", front: 4, top: 1 },
          ],
        },
        {
          label: "The Top Row",
          note: "Stack 4 more dice right on top: red on red, yellow on the blue ones, green on green. Turn them so 1, 6, 5 and 1 face you.",
          dice: [
            { x: 0, y: 0, z: 1, color: "red", front: 1, top: 2 },
            { x: 1, y: 0, z: 1, color: "yellow", front: 6, top: 3 },
            { x: 2, y: 0, z: 1, color: "yellow", front: 5, top: 1 },
            { x: 3, y: 0, z: 1, color: "green", front: 1, top: 5 },
          ],
        },
      ],
    },
    paper: null,
    cubes: null,
    difficulty: 1,
    price_cents: 200,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/dice-wall.webp",
    designer: "",
    original_pages: 0,
    preview_url: null,
    sort_order: 11,
  },
  {
    id: "seed-cardboard-snake",
    slug: "cardboard-snake",
    number: 12,
    name: "Cardboard Snake",
    tagline: "A giant floor snake made from the packing paper that came in a box.",
    description:
      "Sawyer's first blueprint made from packing paper! He saved the crinkly paper that came stuffed in a delivery box, scrunched it into one long rope, and turned it into a snake: a curly tail, a long wiggly body, a big U-turn, and a crumpled-up head.",
    inspired_by: "",
    fun_fact:
      "The longest snakes in the world, reticulated pythons, can grow more than 20 feet long. That's about as long as this paper snake!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: {
      sheets: 1,
      face: true,
      need: "Packing paper from a delivery box, about 21 feet of it (one long strip, or a few pieces twisted together)",
      steps: [
        {
          label: "The Curly Tail",
          note: "Start at the dot in the middle. Wind the rope around and around like a snail shell, then let it come out at the bottom.",
          path: [[2.5, 7.1], [2.2, 7.4], [1.8, 7.0], [1.7, 6.3], [1.9, 5.9], [2.3, 6.1], [2.7, 6.2], [3.1, 6.5], [3.4, 7.0], [3.3, 7.5], [2.9, 8.1], [2.6, 8.3], [2.0, 8.5], [1.5, 7.9], [1.3, 7.0], [1.3, 6.2]],
        },
        {
          label: "The Long Wiggle",
          note: "Swoop down past the tail toward you, with a gentle wiggle.",
          path: [[1.4, 5.5], [1.6, 5.1], [1.9, 4.6], [2.3, 4.0], [2.4, 3.4], [2.5, 2.4], [2.6, 1.3]],
        },
        {
          label: "The Big U-Turn",
          note: "Curve all the way around in a big U, so the snake heads back the other way.",
          path: [[2.5, 0.5], [2.3, 0.1], [1.8, 0.0], [1.5, 0.3], [1.3, 1.2]],
        },
        {
          label: "Neck & Head",
          note: "Run back up beside the body, then bend to the left. Leave the end big and crumpled up: that's the head!",
          path: [[1.2, 2.4], [1.1, 3.8], [0.8, 4.7], [0.5, 4.9], [0.1, 4.9]],
        },
      ],
    },
    cubes: null,
    difficulty: 1,
    price_cents: 200,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/cardboard-snake.webp",
    designer: "",
    original_pages: 0,
    preview_url: null,
    sort_order: 12,
  },
  {
    id: "seed-high-skateboard-tower",
    slug: "high-skateboard-tower",
    number: 13,
    name: "High Skateboard Tower",
    tagline: "A super-tall tower with two skateboard ramps way up high!",
    description:
      "Ashton's fourth blueprint, and his tallest yet! It starts just like Sawyer's James Tower, with the rainbow trunk, the lookout eye and the propeller. Then Ashton kept going: a long green skate deck with a curved ramp on each end, and a lookout stack on top.",
    inspired_by: "",
    fun_fact:
      "Skateboarding was invented by surfers in California in the 1950s, who wanted to surf on the sidewalk. A curved ramp like these is called a quarter pipe, because it's shaped like a quarter of a pipe!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: {
      need: "83 DUPLO-size pieces, including five thin 2×4 plates and two curved ramps",
      photos: ["/photos/high-skateboard-tower-back.webp"],
      steps: [
        {
          label: "The Rainbow Base",
          note: "Every layer has a back row and a front row. Long bricks fill a whole row. On the maps, the front row is at the bottom.",
          bricks: [
            { x: 0, y: 0, z: 0, w: 2, d: 2, h: 3, color: "sky" },
            { x: 2, y: 0, z: 0, w: 2, d: 2, h: 3, color: "green" },
            { x: 0, y: 2, z: 0, w: 2, d: 2, h: 3, color: "sky" },
            { x: 2, y: 2, z: 0, w: 2, d: 2, h: 3, color: "green" },
            { x: 0, y: 0, z: 3, w: 4, d: 2, h: 3, color: "lime" },
            { x: 0, y: 2, z: 3, w: 4, d: 2, h: 3, color: "orange" },
            { x: 0, y: 0, z: 6, w: 4, d: 2, h: 3, color: "sky" },
            { x: 0, y: 2, z: 6, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 2, y: 2, z: 6, w: 2, d: 2, h: 3, color: "lime" },
            { x: 0, y: 0, z: 9, w: 2, d: 2, h: 3, color: "orange" },
            { x: 2, y: 0, z: 9, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 0, y: 2, z: 9, w: 2, d: 2, h: 3, color: "blue" },
            { x: 2, y: 2, z: 9, w: 2, d: 2, h: 3, color: "lime" },
            { x: 0, y: 0, z: 12, w: 2, d: 2, h: 3, color: "green" },
            { x: 2, y: 0, z: 12, w: 2, d: 2, h: 3, color: "sky" },
            { x: 0, y: 2, z: 12, w: 2, d: 2, h: 3, color: "red" },
            { x: 2, y: 2, z: 12, w: 2, d: 2, h: 3, color: "orange" },
          ],
        },
        {
          label: "The Middle",
          note: "Keep stacking, back row then front row. Press each layer down hard so the tower stays straight.",
          bricks: [
            { x: 0, y: 0, z: 15, w: 2, d: 2, h: 3, color: "red" },
            { x: 2, y: 0, z: 15, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 0, y: 2, z: 15, w: 2, d: 2, h: 3, color: "lime" },
            { x: 2, y: 2, z: 15, w: 2, d: 2, h: 3, color: "lime" },
            { x: 0, y: 0, z: 18, w: 2, d: 2, h: 3, color: "sky" },
            { x: 2, y: 0, z: 18, w: 2, d: 2, h: 3, color: "blue" },
            { x: 0, y: 2, z: 18, w: 2, d: 2, h: 3, color: "red" },
            { x: 2, y: 2, z: 18, w: 2, d: 2, h: 3, color: "sky" },
            { x: 0, y: 0, z: 21, w: 2, d: 2, h: 3, color: "orange" },
            { x: 2, y: 0, z: 21, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 0, y: 2, z: 21, w: 2, d: 2, h: 3, color: "blue" },
            { x: 2, y: 2, z: 21, w: 2, d: 2, h: 3, color: "blue" },
            { x: 0, y: 0, z: 24, w: 4, d: 2, h: 3, color: "blue" },
            { x: 0, y: 2, z: 24, w: 2, d: 2, h: 3, color: "sky" },
            { x: 2, y: 2, z: 24, w: 2, d: 2, h: 3, color: "sky" },
            { x: 0, y: 0, z: 27, w: 2, d: 2, h: 3, color: "red" },
            { x: 2, y: 0, z: 27, w: 2, d: 2, h: 3, color: "lime" },
            { x: 0, y: 2, z: 27, w: 2, d: 2, h: 3, color: "sky" },
            { x: 2, y: 2, z: 27, w: 2, d: 2, h: 3, color: "yellow" },
          ],
        },
        {
          label: "The Top of the Tower",
          note: "Look for the green brick with an eye and turn it to look out the front! The last layer is two long bricks.",
          bricks: [
            { x: 0, y: 0, z: 30, w: 2, d: 2, h: 3, color: "red" },
            { x: 2, y: 0, z: 30, w: 2, d: 2, h: 3, color: "sky" },
            { x: 0, y: 2, z: 30, w: 2, d: 2, h: 3, color: "blue" },
            { x: 2, y: 2, z: 30, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 0, y: 0, z: 33, w: 2, d: 2, h: 3, color: "green" },
            { x: 2, y: 0, z: 33, w: 2, d: 2, h: 3, color: "orange" },
            { x: 0, y: 2, z: 33, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 2, y: 2, z: 33, w: 2, d: 2, h: 3, color: "green" },
            { x: 0, y: 0, z: 36, w: 2, d: 2, h: 3, color: "red" },
            { x: 2, y: 0, z: 36, w: 2, d: 2, h: 3, color: "red" },
            { x: 0, y: 2, z: 36, w: 2, d: 2, h: 3, color: "lime" },
            { x: 2, y: 2, z: 36, w: 2, d: 2, h: 3, color: "orange" },
            { x: 0, y: 0, z: 39, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 2, y: 0, z: 39, w: 2, d: 2, h: 3, color: "green" },
            { x: 0, y: 2, z: 39, w: 2, d: 2, h: 3, color: "green" },
            { x: 2, y: 2, z: 39, w: 2, d: 2, h: 3, color: "sky" },
            { x: 0, y: 0, z: 42, w: 4, d: 2, h: 3, color: "green" },
            { x: 0, y: 2, z: 42, w: 4, d: 2, h: 3, color: "blue" },
          ],
        },
        {
          label: "The Hat",
          note: "Four small bricks right on top. Then a row of three across the middle: the side bricks stick out one stud, and the green one starts the neck.",
          bricks: [
            { x: 0, y: 2, z: 45, w: 2, d: 2, h: 3, color: "orange" },
            { x: 2, y: 2, z: 45, w: 2, d: 2, h: 3, color: "sky" },
            { x: 0, y: 0, z: 45, w: 2, d: 2, h: 3, color: "sky" },
            { x: 2, y: 0, z: 45, w: 2, d: 2, h: 3, color: "blue" },
            { x: -1, y: 1, z: 48, w: 2, d: 2, h: 3, color: "sky" },
            { x: 1, y: 1, z: 48, w: 2, d: 2, h: 3, color: "green" },
            { x: 3, y: 1, z: 48, w: 2, d: 2, h: 3, color: "blue" },
          ],
        },
        {
          label: "The Neck",
          note: "Four small bricks straight up on the green one. The yellow brick has an eye, so turn it to look out the front!",
          bricks: [
            { x: 1, y: 1, z: 51, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 1, y: 1, z: 54, w: 2, d: 2, h: 3, color: "orange" },
            { x: 1, y: 1, z: 57, w: 2, d: 2, h: 3, color: "blue" },
            { x: 1, y: 1, z: 60, w: 2, d: 2, h: 3, color: "lime" },
          ],
        },
        {
          label: "The Propeller",
          note: "A long blue brick on the neck. Then the yellow brick in the middle, with a thin plate on each side sticking way out.",
          bricks: [
            { x: 0, y: 1, z: 63, w: 4, d: 2, h: 3, color: "blue" },
            { x: -3, y: 1, z: 66, w: 4, d: 2, h: 1, color: "sky" },
            { x: 1, y: 1, z: 66, w: 2, d: 2, h: 3, color: "yellow" },
            { x: 3, y: 1, z: 66, w: 4, d: 2, h: 1, color: "orange" },
          ],
        },
        {
          label: "Up the Middle",
          note: "A green brick on the yellow one. Then an orange brick and a blue brick side by side, each sticking out one stud.",
          bricks: [
            { x: 1, y: 1, z: 69, w: 2, d: 2, h: 3, color: "green" },
            { x: 0, y: 1, z: 72, w: 2, d: 2, h: 3, color: "orange" },
            { x: 2, y: 1, z: 72, w: 2, d: 2, h: 3, color: "blue" },
          ],
        },
        {
          label: "The Skate Deck",
          note: "Two thin green plates end to end make a long deck. Put the orange brick right in the middle.",
          bricks: [
            { x: -2, y: 1, z: 75, w: 4, d: 2, h: 1, color: "green" },
            { x: 2, y: 1, z: 75, w: 4, d: 2, h: 1, color: "green" },
            { x: 1, y: 1, z: 76, w: 2, d: 2, h: 3, color: "orange" },
          ],
        },
        {
          label: "The Skateboard Ramps",
          note: "Press a curved ramp onto each end of the deck, tall side in, so the curves swoop out like skate ramps!",
          bricks: [
            { x: -4, y: 1, z: 76, w: 3, d: 2, h: 6, color: "blue", ramp: "left" },
            { x: 5, y: 1, z: 76, w: 3, d: 2, h: 6, color: "blue", ramp: "right" },
          ],
        },
        {
          label: "The Lookout Top",
          note: "A thin yellow plate, then light blue and dark blue bricks straight up. Two lime bricks side by side, and a green brick on top!",
          bricks: [
            { x: 0, y: 1, z: 79, w: 4, d: 2, h: 1, color: "yellow" },
            { x: 1, y: 1, z: 80, w: 2, d: 2, h: 3, color: "sky" },
            { x: 1, y: 1, z: 83, w: 2, d: 2, h: 3, color: "blue" },
            { x: 0, y: 1, z: 86, w: 2, d: 2, h: 3, color: "lime" },
            { x: 2, y: 1, z: 86, w: 2, d: 2, h: 3, color: "lime" },
            { x: 1, y: 1, z: 89, w: 2, d: 2, h: 3, color: "green" },
          ],
        },
      ],
    },
    boxes: null,
    dice: null,
    paper: null,
    cubes: null,
    difficulty: 3,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/high-skateboard-tower.webp",
    designer: "Ashton (age 5)",
    original_pages: 0,
    preview_url: null,
    sort_order: 13,
  },
  {
    id: "seed-flying-ant-tower",
    slug: "flying-ant-tower",
    number: 14,
    name: "The Flying Ant Tower",
    tagline: "A giant flying ant with long arms, a big head, and a propeller on top!",
    description:
      "Sawyer's biggest blueprint ever, and the first one at Ultra Expert level! A huge ant made of 415 magnetic blocks: a wide body, long arms that reach way out, a collar, a big head, and a propeller on top so it can fly. Winner of the Best Design award!",
    inspired_by: "",
    fun_fact:
      "Some ants really can fly! Young queen ants and male ants grow wings and fly off to start new colonies. Ants are super strong too: they can carry things many times heavier than they are.",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: {
      need: "415 magnetic cube blocks (any pictures or colors)",
      photos: ["/photos/flying-ant-tower-side.webp"],
      steps: [
        {
          label: "The Body: Bottom Half",
          note: "Make a wall of blocks 9 wide and 3 deep. Build the same layer 5 times.",
          boxes: [{ x: 3, y: 0, z: 0, w: 9, d: 3, h: 5 }],
        },
        {
          label: "The Body: Top Half",
          note: "Five more layers just like the first ones. Now the body is 10 blocks tall!",
          boxes: [{ x: 3, y: 0, z: 5, w: 9, d: 3, h: 5 }],
        },
        {
          label: "The Long Arms",
          note: "One long layer, 15 blocks wide. The arms hang out 3 blocks past each side of the body, so hold them while the magnets click.",
          boxes: [{ x: 0, y: 0, z: 10, w: 15, d: 3, h: 1 }],
        },
        {
          label: "The Chest",
          note: "A 3 × 3 tower right in the middle, 3 layers tall.",
          boxes: [{ x: 6, y: 0, z: 11, w: 3, d: 3, h: 3 }],
        },
        {
          label: "The Collar",
          note: "A 5 × 5 layer that sticks out one block on every side, like a collar.",
          boxes: [{ x: 5, y: -1, z: 14, w: 5, d: 5, h: 1 }],
        },
        {
          label: "The Head",
          note: "Back to 3 × 3, for 4 layers.",
          boxes: [{ x: 6, y: 0, z: 15, w: 3, d: 3, h: 4 }],
        },
        {
          label: "The Neck",
          note: "Three single blocks straight up from the middle of the head.",
          boxes: [{ x: 7, y: 1, z: 19, w: 1, d: 1, h: 3 }],
        },
        {
          label: "The Propeller",
          note: "A plus sign on top: one block in the middle, with 2 more sticking out each way. Now it can fly!",
          boxes: [{ x: 5, y: 1, z: 22, w: 5, d: 1, h: 1 }, { x: 7, y: -1, z: 22, w: 1, d: 5, h: 1 }],
        },
      ],
    },
    difficulty: 4,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/flying-ant-tower.webp",
    designer: "",
    award: "Best Design",
    original_pages: 0,
    preview_url: null,
    sort_order: 14,
  },
  {
    id: "seed-house-of-hess",
    slug: "house-of-hess",
    number: 15,
    name: "The House of Hess",
    tagline: "A cozy block house with a doorway, windows, and a super tall chimney!",
    description:
      "Ashton's house made of magnetic blocks! It has a flat floor, a front door, walls all around, a tower with windows you can see right through, and a really tall chimney that reaches up to the sky.",
    inspired_by: "",
    fun_fact:
      "Chimneys are built tall so smoke goes high above the roof. Some factory chimneys are taller than 300 meters!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: {
      need: "87 magnetic cube blocks (any pictures or colors)",
      photos: ["/photos/house-of-hess-side.webp"],
      steps: [
        {
          label: "The Floor",
          note: "Lay a flat floor of blocks, 5 long and 3 wide.",
          boxes: [{ x: 0, y: 0, z: 0, w: 5, d: 3, h: 1 }],
        },
        {
          label: "The Front Wall",
          note: "Two short walls with a doorway gap between them, 2 layers tall. Then a block across the top of the doorway.",
          boxes: [{ x: 0, y: 0, z: 1, w: 2, d: 1, h: 2 }, { x: 3, y: 0, z: 1, w: 2, d: 1, h: 2 }, { x: 0, y: 0, z: 3, w: 5, d: 1, h: 1 }],
        },
        {
          label: "The Back and Side Walls",
          note: "Build the back wall 5 long and 3 tall, then one block in each end to close the room.",
          boxes: [{ x: 0, y: 2, z: 1, w: 5, d: 1, h: 3 }, { x: 0, y: 1, z: 1, w: 1, d: 1, h: 3 }, { x: 4, y: 1, z: 1, w: 1, d: 1, h: 3 }],
        },
        {
          label: "The Tower Base",
          note: "Build a tower on the roof, 2 wide and 3 deep, 2 layers tall.",
          boxes: [{ x: 2, y: 0, z: 4, w: 2, d: 3, h: 2 }],
        },
        {
          label: "The Windows",
          note: "Leave a hole in the middle so you can see right through. Build a wall at the front and a wall at the back, 2 layers tall.",
          boxes: [{ x: 2, y: 0, z: 6, w: 2, d: 1, h: 2 }, { x: 2, y: 2, z: 6, w: 2, d: 1, h: 2 }],
        },
        {
          label: "The Tower Top",
          note: "Fill the middle back in, with 2 more layers.",
          boxes: [{ x: 2, y: 0, z: 8, w: 2, d: 3, h: 2 }],
        },
        {
          label: "The Tall Chimney",
          note: "One block wide and 6 blocks tall, right in the middle. Build it slowly and don't let it wobble!",
          boxes: [{ x: 2, y: 1, z: 10, w: 1, d: 1, h: 6 }],
        },
      ],
    },
    difficulty: 3,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/house-of-hess.webp",
    designer: "Ashton (age 5)",
    original_pages: 0,
    preview_url: null,
    sort_order: 15,
  },
  {
    id: "seed-toothbrush-tower",
    slug: "toothbrush-tower",
    number: 16,
    name: "Toothbrush Tower",
    tagline: "A giant toothbrush and a tube of toothpaste, built out of blocks!",
    description:
      "Two buildings in one blueprint! A super tall toothbrush with a long handle, a skinny neck, and a brush head, and a short tube of toothpaste with a pink cap standing beside it. The wooden block at the end of the brush is the toothpaste that got squeezed on.",
    inspired_by: "",
    fun_fact:
      "Long ago, people cleaned their teeth with chewing sticks. The first toothbrush with bristles was made in China more than 500 years ago!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: {
      need: "178 magnetic cube blocks (any pictures or colors), and one wooden block",
      photos: ["/photos/toothbrush-tower-side.webp"],
      steps: [
        {
          label: "The Handle: Bottom Half",
          note: "Make a tall tower 3 blocks wide and 2 deep. Build the same layer 10 times. This is the handle of the toothbrush!",
          boxes: [{ x: 0, y: 0, z: 0, w: 3, d: 2, h: 10 }],
        },
        {
          label: "The Handle: Top Half",
          note: "Ten more layers just like the first ones. Now the handle is 20 blocks tall!",
          boxes: [{ x: 0, y: 0, z: 10, w: 3, d: 2, h: 10 }],
        },
        {
          label: "The Skinny Neck",
          note: "One block wide and 13 blocks tall, standing in the middle of the handle. Go slowly so it doesn't wobble!",
          boxes: [{ x: 1, y: 0, z: 20, w: 1, d: 1, h: 13 }],
        },
        {
          label: "The Brush Head",
          note: "The head sticks out sideways like a toothbrush. Lay 5 blocks in a row, with the last one sitting on top of the neck. Then 3 more blocks on top of them.",
          boxes: [{ x: -3, y: 0, z: 33, w: 5, d: 1, h: 1 }, { x: -2, y: 0, z: 34, w: 3, d: 1, h: 1 }],
        },
        {
          label: "The Squeezed-on Toothpaste",
          note: "Put one wooden block right on top of the neck end. That's the toothpaste that got squeezed onto the brush!",
          boxes: [{ x: 1, y: 0, z: 34, w: 1, d: 1, h: 1 }],
        },
        {
          label: "The Toothpaste Tube",
          note: "A second building, standing next to the toothbrush. Make a tower 2 wide and 2 deep, 8 layers tall.",
          boxes: [{ x: -5, y: 0, z: 0, w: 2, d: 2, h: 8 }],
        },
        {
          label: "The Pink Cap",
          note: "Finish the tube with a flat 2 × 2 cap of pink blocks on top.",
          boxes: [{ x: -5, y: 0, z: 8, w: 2, d: 2, h: 1 }],
        },
      ],
    },
    difficulty: 3,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/toothbrush-tower.webp",
    designer: "",
    original_pages: 0,
    preview_url: null,
    sort_order: 16,
  },
  {
    id: "seed-the-monster",
    slug: "the-monster",
    number: 17,
    name: "The Monster",
    tagline: "A big blocky monster with long arms stretched out wide!",
    description:
      "Ashton's monster, built from 75 magnetic blocks! It has a skinny body, super long arms that reach out to each side, wide shoulders, a square head, and a green hat on top.",
    inspired_by: "",
    fun_fact:
      "Video game characters are often built with their arms stretched straight out, just like this monster. It's called a T-pose, and it helps artists get ready to make them move!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: {
      need: "75 magnetic cube blocks (any pictures or colors)",
      photos: ["/photos/the-monster-side.webp"],
      steps: [
        {
          label: "The Legs and Body",
          note: "Build a skinny tower 2 blocks wide and 2 deep. Build the same layer 9 times.",
          boxes: [{ x: 4, y: 0, z: 0, w: 2, d: 2, h: 9 }],
        },
        {
          label: "The Long Arms",
          note: "One long layer. Lay 10 blocks in a row, with the body in the middle so each arm sticks out 4 blocks. Put 2 more blocks behind the body.",
          boxes: [{ x: 0, y: 0, z: 9, w: 10, d: 1, h: 1 }, { x: 4, y: 1, z: 9, w: 2, d: 1, h: 1 }],
        },
        {
          label: "The Chest",
          note: "Four more layers of 2 × 2 on top of the arms.",
          boxes: [{ x: 4, y: 0, z: 10, w: 2, d: 2, h: 4 }],
        },
        {
          label: "The Shoulders",
          note: "A wider layer: 4 blocks in a row, so one block sticks out on each side, and 2 more blocks behind.",
          boxes: [{ x: 3, y: 0, z: 14, w: 4, d: 1, h: 1 }, { x: 4, y: 1, z: 14, w: 2, d: 1, h: 1 }],
        },
        {
          label: "The Head",
          note: "Back to 2 × 2 for the monster's big square head.",
          boxes: [{ x: 4, y: 0, z: 15, w: 2, d: 2, h: 1 }],
        },
        {
          label: "The Hat",
          note: "Finish with one green block on top!",
          boxes: [{ x: 4, y: 1, z: 16, w: 1, d: 1, h: 1 }],
        },
      ],
    },
    difficulty: 2,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/the-monster.webp",
    designer: "Ashton (age 5)",
    original_pages: 0,
    preview_url: null,
    sort_order: 17,
  },
  {
    id: "seed-north-tower",
    slug: "north-tower",
    number: 18,
    name: "The North Tower",
    tagline: "A super tall skinny tower that reaches way up high!",
    description:
      "Sawyer's North Tower! A wide, sturdy base 20 blocks tall holds up a long skinny stem that stretches way up into the sky, with a green block on top. It's 137 magnetic blocks tall and tricky to balance!",
    inspired_by: "",
    fun_fact:
      "A compass needle is a tiny magnet. It points north because the whole Earth acts like a giant magnet!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: {
      need: "137 magnetic cube blocks (any pictures or colors)",
      steps: [
        {
          label: "The Base: Bottom Half",
          note: "Make a tall, skinny tower 3 blocks wide and 2 deep. Build the same layer 10 times.",
          boxes: [{ x: 0, y: 0, z: 0, w: 3, d: 2, h: 10 }],
        },
        {
          label: "The Base: Top Half",
          note: "Ten more layers just like the first ones. Now the base is 20 blocks tall!",
          boxes: [{ x: 0, y: 0, z: 10, w: 3, d: 2, h: 10 }],
        },
        {
          label: "The Skinny Stem",
          note: "One block wide and 17 blocks tall, standing on top of the base. Go slowly so it doesn't wobble!",
          boxes: [{ x: 1, y: 0, z: 20, w: 1, d: 1, h: 17 }],
        },
      ],
    },
    difficulty: 3,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/north-tower.webp",
    designer: "",
    original_pages: 0,
    preview_url: null,
    sort_order: 18,
  },
  {
    id: "seed-steve-tower",
    slug: "steve-tower",
    number: 19,
    name: "Steve Tower",
    tagline: "Minecraft's Steve, made of magnetic blocks, with a face you can see!",
    description:
      "The Steve Tower, from Minecraft! A skinny body holds up a big square head made of 5 × 5 × 5 blocks. Look at the front of the head: some blocks are pushed in, so you can see Steve's eyes and nose.",
    inspired_by: "Minecraft",
    fun_fact:
      "In the game Minecraft, the whole world is made of blocks, and so is Steve, the main character!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: {
      need: "248 magnetic cube blocks (any pictures or colors)",
      photos: ["/photos/steve-tower-side.webp"],
      steps: [
        {
          label: "The Body",
          note: "Build a tower 3 blocks wide and 3 deep. Build the same layer 14 times. This is Steve's body!",
          boxes: [{ x: 1, y: 1, z: 0, w: 3, d: 3, h: 14 }],
        },
        {
          label: "The Head: Chin and Nose",
          note: "Now the big square head, 5 blocks wide and 5 deep. Start with one full 5 × 5 layer. Then another layer with a gap in the front for the nose: leave out the middle block on the front row.",
          boxes: [{ x: 0, y: 0, z: 14, w: 5, d: 5, h: 1 }, { x: 0, y: 0, z: 15, w: 2, d: 1, h: 1 }, { x: 3, y: 0, z: 15, w: 2, d: 1, h: 1 }, { x: 0, y: 1, z: 15, w: 5, d: 4, h: 1 }],
        },
        {
          label: "The Head: Eyes",
          note: "Another 5 × 5 layer with two gaps in the front row for Steve's eyes. Leave out the 2nd and 4th blocks on the front row.",
          boxes: [{ x: 0, y: 0, z: 16, w: 1, d: 1, h: 1 }, { x: 2, y: 0, z: 16, w: 1, d: 1, h: 1 }, { x: 4, y: 0, z: 16, w: 1, d: 1, h: 1 }, { x: 0, y: 1, z: 16, w: 5, d: 4, h: 1 }],
        },
        {
          label: "The Head: Hair",
          note: "Finish the head with two more full 5 × 5 layers on top.",
          boxes: [{ x: 0, y: 0, z: 17, w: 5, d: 5, h: 2 }],
        },
      ],
    },
    difficulty: 3,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/steve-tower.webp",
    designer: "",
    original_pages: 0,
    preview_url: null,
    sort_order: 19,
  },
  {
    id: "seed-trophy-tower",
    slug: "trophy-tower",
    number: 20,
    name: "The Trophy Tower",
    tagline: "A tall, flat trophy with two big handles, a crown, and a spire on top!",
    description:
      "Ashton's trophy! It has a strong 3-block-wide base, a window you can see right through, two big handles on the sides, a crown bar across the top, and a tall spire in the middle. It's a flat build, only one block thick, and the handles make it tricky to balance.",
    inspired_by: "",
    fun_fact:
      "Olympic gold medals aren't made of solid gold. They're mostly silver, with a thin layer of gold on the outside!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: {
      need: "64 magnetic cube blocks (any pictures or colors)",
      steps: [
        {
          label: "The Legs",
          note: "Build a wall 3 blocks wide and 5 layers tall. This is the strong bottom of the trophy.",
          boxes: [{ x: 2, y: 0, z: 0, w: 3, d: 1, h: 5 }],
        },
        {
          label: "The Window",
          note: "Now build two skinny posts, one on the left and one on the right, 3 layers tall. Leave the middle empty so you can see right through!",
          boxes: [{ x: 2, y: 0, z: 5, w: 1, d: 1, h: 3 }, { x: 4, y: 0, z: 5, w: 1, d: 1, h: 3 }],
        },
        {
          label: "The First Handle Bars",
          note: "Add a bar of 3 blocks sticking out to the left, and another sticking out to the right. Check that your handles are the same height!",
          boxes: [{ x: 0, y: 0, z: 8, w: 3, d: 1, h: 1 }, { x: 4, y: 0, z: 8, w: 3, d: 1, h: 1 }],
        },
        {
          label: "The Handle Posts",
          note: "Four single blocks on top of the bars: one at each end and one on each of the middle posts.",
          boxes: [{ x: 0, y: 0, z: 9, w: 1, d: 1, h: 1 }, { x: 2, y: 0, z: 9, w: 1, d: 1, h: 1 }, { x: 4, y: 0, z: 9, w: 1, d: 1, h: 1 }, { x: 6, y: 0, z: 9, w: 1, d: 1, h: 1 }],
        },
        {
          label: "The Second Handle Bars",
          note: "Two more bars of 3 blocks, left and right, just like the first ones.",
          boxes: [{ x: 0, y: 0, z: 10, w: 3, d: 1, h: 1 }, { x: 4, y: 0, z: 10, w: 3, d: 1, h: 1 }],
        },
        {
          label: "The Tall Posts",
          note: "Build the four posts up 2 more layers. Then add one block in the middle, between the two inner posts, to bridge them together.",
          boxes: [{ x: 0, y: 0, z: 11, w: 1, d: 1, h: 2 }, { x: 2, y: 0, z: 11, w: 1, d: 1, h: 2 }, { x: 4, y: 0, z: 11, w: 1, d: 1, h: 2 }, { x: 6, y: 0, z: 11, w: 1, d: 1, h: 2 }, { x: 3, y: 0, z: 12, w: 1, d: 1, h: 1 }],
        },
        {
          label: "The Crown Posts",
          note: "Three single blocks: one on each outer post and one in the middle.",
          boxes: [{ x: 0, y: 0, z: 13, w: 1, d: 1, h: 1 }, { x: 3, y: 0, z: 13, w: 1, d: 1, h: 1 }, { x: 6, y: 0, z: 13, w: 1, d: 1, h: 1 }],
        },
        {
          label: "The Crown Bar",
          note: "A long bar of 7 blocks across the very top of the handles.",
          boxes: [{ x: 0, y: 0, z: 14, w: 7, d: 1, h: 1 }],
        },
        {
          label: "The Horns and the Spire",
          note: "Two short horns, 2 blocks tall, on each side. Then the tall spire in the middle: 4 blocks tall!",
          boxes: [{ x: 1, y: 0, z: 15, w: 1, d: 1, h: 2 }, { x: 5, y: 0, z: 15, w: 1, d: 1, h: 2 }, { x: 3, y: 0, z: 15, w: 1, d: 1, h: 4 }],
        },
      ],
    },
    difficulty: 3,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/trophy-tower.webp",
    designer: "Ashton (age 5)",
    original_pages: 0,
    preview_url: null,
    sort_order: 20,
  },
  {
    id: "seed-stairs-tower",
    slug: "stairs-tower",
    number: 21,
    name: "Stairs Tower",
    tagline: "A giant staircase of magnetic blocks, 13 steps tall!",
    description:
      "Sawyer's Stairs Tower! It's a staircase that goes up one block at a time, from a tiny 1-block step all the way up to a 13-block-tall wall. It's wide and sturdy, so it's easy to build but it takes a LOT of blocks.",
    inspired_by: "",
    fun_fact:
      "The Great Pyramid of Giza has about 200 layers of stone blocks, stacked up like giant steps. When it was new, it was nearly 150 meters tall!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: {
      need: "273 magnetic cube blocks (any pictures or colors)",
      photos: ["/photos/stairs-tower-side.webp"],
      steps: [
        {
          label: "The Low Steps",
          note: "Build 4 walls side by side, each 3 blocks wide (that's the width of the stairs). The first wall is 1 block tall, then 2, then 3, then 4 blocks tall.",
          boxes: [{ x: 0, y: 0, z: 0, w: 1, d: 3, h: 1 }, { x: 1, y: 0, z: 0, w: 1, d: 3, h: 2 }, { x: 2, y: 0, z: 0, w: 1, d: 3, h: 3 }, { x: 3, y: 0, z: 0, w: 1, d: 3, h: 4 }],
        },
        {
          label: "The Middle Steps",
          note: "Keep going! Build 5 more walls: 5, 6, 7, 8 and 9 blocks tall. Each wall is 1 block taller than the last one.",
          boxes: [{ x: 4, y: 0, z: 0, w: 1, d: 3, h: 5 }, { x: 5, y: 0, z: 0, w: 1, d: 3, h: 6 }, { x: 6, y: 0, z: 0, w: 1, d: 3, h: 7 }, { x: 7, y: 0, z: 0, w: 1, d: 3, h: 8 }, { x: 8, y: 0, z: 0, w: 1, d: 3, h: 9 }],
        },
        {
          label: "The High Steps",
          note: "Finish with 4 tall walls: 10, 11, 12 and 13 blocks tall. Now you've built a giant staircase!",
          boxes: [{ x: 9, y: 0, z: 0, w: 1, d: 3, h: 10 }, { x: 10, y: 0, z: 0, w: 1, d: 3, h: 11 }, { x: 11, y: 0, z: 0, w: 1, d: 3, h: 12 }, { x: 12, y: 0, z: 0, w: 1, d: 3, h: 13 }],
        },
      ],
    },
    difficulty: 2,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/stairs-tower.webp",
    designer: "",
    original_pages: 0,
    preview_url: null,
    sort_order: 21,
  },
  {
    id: "seed-stop-sign-tower",
    slug: "stop-sign-tower",
    number: 22,
    name: "Stop Sign Tower",
    tagline: "A STOP sign made of blocks, with a tall tower where the O goes!",
    description:
      "Sawyer's Stop Sign Tower! It's a big flat frame lying on the floor with the letters S, T and P built inside, and a tall tower standing right where the O should be. The tower has a skinny stem sticking way up, so it's like a stop sign that's also a skyscraper.",
    inspired_by: "",
    fun_fact:
      "The first stop signs, in the 1920s, were yellow with black letters. Red stop signs didn't start until the 1950s!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: {
      need: "260 magnetic cube blocks (any pictures or colors)",
      photos: ["/photos/stop-sign-tower-side.webp"],
      steps: [
        {
          label: "The Frame",
          note: "Lay the sign flat on the floor. Make a long rectangle, one block thick: 25 blocks along the front and back, and 8 blocks on each end.",
          boxes: [{ x: 0, y: 0, z: 0, w: 25, d: 1, h: 1 }, { x: 0, y: 7, z: 0, w: 25, d: 1, h: 1 }, { x: 0, y: 1, z: 0, w: 1, d: 6, h: 1 }, { x: 24, y: 1, z: 0, w: 1, d: 6, h: 1 }],
        },
        {
          label: "The Letter S",
          note: "Inside the frame, 2 blocks in from the left, build a big S that's 3 blocks wide and 5 blocks tall. It goes: top row of 3, one block down on the left, a middle row of 3, one block down on the right, and a bottom row of 3.",
          boxes: [{ x: 2, y: 5, z: 0, w: 3, d: 1, h: 1 }, { x: 2, y: 4, z: 0, w: 1, d: 1, h: 1 }, { x: 2, y: 3, z: 0, w: 3, d: 1, h: 1 }, { x: 4, y: 2, z: 0, w: 1, d: 1, h: 1 }, { x: 2, y: 1, z: 0, w: 3, d: 1, h: 1 }],
        },
        {
          label: "The Letter T",
          note: "Leave a gap, then build a T. The top bar is 5 blocks wide, and the stem goes down 4 blocks from the middle.",
          boxes: [{ x: 6, y: 5, z: 0, w: 5, d: 1, h: 1 }, { x: 8, y: 1, z: 0, w: 1, d: 4, h: 1 }],
        },
        {
          label: "The Letter P",
          note: "Leave a bigger gap for the tower. Then build a P on the right: a tall line of 5 blocks, a top bar, one block on the right, and a middle bar to make the loop.",
          boxes: [{ x: 18, y: 1, z: 0, w: 1, d: 5, h: 1 }, { x: 19, y: 5, z: 0, w: 2, d: 1, h: 1 }, { x: 20, y: 4, z: 0, w: 1, d: 1, h: 1 }, { x: 19, y: 3, z: 0, w: 2, d: 1, h: 1 }],
        },
        {
          label: "The Tower Where the O Goes",
          note: "In the gap between the T and the P, build a big tower. It's 5 blocks wide and 4 blocks deep, and 8 layers tall. This is the 'O' in STOP.",
          boxes: [{ x: 12, y: 1, z: 0, w: 5, d: 4, h: 8 }],
        },
        {
          label: "The Skinny Stem",
          note: "Stand a stem of 8 blocks, one on top of another, right on top of the tower. It's the tallest part, so go slowly. Now your STOP sign has a tower in the middle!",
          boxes: [{ x: 14, y: 2, z: 8, w: 1, d: 1, h: 8 }],
        },
      ],
    },
    difficulty: 3,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/stop-sign-tower.webp",
    designer: "",
    original_pages: 0,
    preview_url: null,
    sort_order: 22,
  },
  {
    id: "seed-glasses-tower",
    slug: "glasses-tower",
    number: 23,
    name: "Glasses Tower",
    tagline: "A big pair of glasses with two see-through lenses and a floating arch on top!",
    description:
      "Ashton's Glasses Tower! It's a giant pair of glasses made from two big square lenses that you can see right through, joined in the middle by a bridge. On top there's a floating arch with little sparks on each side, like fireworks.",
    inspired_by: "",
    fun_fact:
      "The first eyeglasses were made in Italy around 700 years ago. They were held up on your nose with no arms to go over your ears!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: {
      need: "56 magnetic cube blocks (any pictures or colors)",
      steps: [
        {
          label: "The Left Lens",
          note: "Build a rectangle frame, one block thick, standing up. It's 6 blocks wide and 6 blocks tall, with an empty hole in the middle. This is the left lens of the glasses!",
          boxes: [{ x: 0, y: 0, z: 0, w: 6, d: 1, h: 1 }, { x: 0, y: 0, z: 5, w: 6, d: 1, h: 1 }, { x: 0, y: 0, z: 1, w: 1, d: 1, h: 4 }, { x: 5, y: 0, z: 1, w: 1, d: 1, h: 4 }],
        },
        {
          label: "The Right Lens",
          note: "Build a second frame just like the first, with a 2-block gap between them. This is the right lens.",
          boxes: [{ x: 8, y: 0, z: 0, w: 6, d: 1, h: 1 }, { x: 8, y: 0, z: 5, w: 6, d: 1, h: 1 }, { x: 8, y: 0, z: 1, w: 1, d: 1, h: 4 }, { x: 13, y: 0, z: 1, w: 1, d: 1, h: 4 }],
        },
        {
          label: "The Bridge",
          note: "Connect the two lenses in the middle. Put a 2-block bar across the top, and another 2-block bar lower down, like the part of glasses that sits on your nose.",
          boxes: [{ x: 6, y: 0, z: 5, w: 2, d: 1, h: 1 }, { x: 6, y: 0, z: 3, w: 2, d: 1, h: 1 }],
        },
        {
          label: "The Two Posts",
          note: "Stand a post of 3 blocks on top, on each side of the middle. Hold them while the magnets click, because they're tall and skinny!",
          boxes: [{ x: 5, y: 0, z: 6, w: 1, d: 1, h: 3 }, { x: 9, y: 0, z: 6, w: 1, d: 1, h: 3 }],
        },
        {
          label: "The Floating Arch",
          note: "Now the fun part: build an arch. Put a block up high and to the inside of each post. Then one block in the very middle, on top, to be the keystone. The arch looks like it's floating!",
          boxes: [{ x: 6, y: 0, z: 9, w: 1, d: 1, h: 1 }, { x: 8, y: 0, z: 9, w: 1, d: 1, h: 1 }, { x: 7, y: 0, z: 10, w: 1, d: 1, h: 1 }],
        },
        {
          label: "The Little Sparks",
          note: "Finish with three blocks sticking out like little sparks: two lava blocks, one on each side, and one brown block up high on the right.",
          boxes: [{ x: 4, y: 0, z: 9, w: 1, d: 1, h: 1 }, { x: 10, y: 0, z: 9, w: 1, d: 1, h: 1 }, { x: 10, y: 0, z: 10, w: 1, d: 1, h: 1 }],
        },
      ],
    },
    difficulty: 3,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/glasses-tower.webp",
    designer: "Ashton (age 5)",
    original_pages: 0,
    preview_url: null,
    sort_order: 23,
  },
  {
    id: "seed-pyramid-and-tsunami",
    slug: "pyramid-and-tsunami",
    number: 24,
    name: "The Pyramid and the Tsunami",
    tagline: "Two huge builds in one: a stepped pyramid with a sky-high stem, and a crashing tsunami wave!",
    description:
      "Ashton's Pyramid and Tsunami! It's two buildings in one blueprint. First, a big stepped pyramid with a super tall, skinny stem that reaches way up into the sky, with little arms and a crown at the top. Then, a tsunami: a thick wave with a tall tower on one end and a curl that looks like it's about to crash. It's an Ultra Expert build, so take your time!",
    inspired_by: "",
    fun_fact:
      "A tsunami can travel across the ocean as fast as a jet plane! Out at sea it's barely noticeable, but near the shore it slows down and grows into a giant wave.",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: {
      need: "351 magnetic cube blocks (any pictures or colors)",
      photos: ["/photos/pyramid-and-tsunami-side.webp"],
      steps: [
        {
          label: "The Pyramid Floor",
          note: "Lay a big flat floor of blocks, 8 blocks wide and 11 blocks long. This is the bottom of the pyramid.",
          boxes: [{ x: 0, y: 0, z: 0, w: 8, d: 11, h: 1 }],
        },
        {
          label: "The Pyramid Steps",
          note: "Now build the steps. Make a smaller floor on top: 6 wide and 9 long, leaving one block of room all the way around the edge. Then 4 wide and 7 long. Then 2 wide and 5 long. It looks like a staircase up all four sides!",
          boxes: [{ x: 1, y: 1, z: 1, w: 6, d: 9, h: 1 }, { x: 2, y: 2, z: 2, w: 4, d: 7, h: 1 }, { x: 3, y: 3, z: 3, w: 2, d: 5, h: 1 }],
        },
        {
          label: "The Super Tall Stem",
          note: "On the very top step, stand one block on another. Build it 20 blocks tall, one block wide. This is the hardest part of the whole build, so go slowly and hold it steady!",
          boxes: [{ x: 3, y: 5, z: 4, w: 1, d: 1, h: 20 }],
        },
        {
          label: "The Stem's Arms",
          note: "Add two small arms that stick out of the stem, one at 8 blocks up and one at 14 blocks up. Each arm is one block on each side.",
          boxes: [{ x: 2, y: 5, z: 12, w: 1, d: 1, h: 1 }, { x: 4, y: 5, z: 12, w: 1, d: 1, h: 1 }, { x: 2, y: 5, z: 18, w: 1, d: 1, h: 1 }, { x: 4, y: 5, z: 18, w: 1, d: 1, h: 1 }],
        },
        {
          label: "The Crown",
          note: "At the very top, build a little crown: a bar of 3 blocks, with 3 blocks standing on top.",
          boxes: [{ x: 2, y: 5, z: 24, w: 3, d: 1, h: 1 }, { x: 2, y: 5, z: 25, w: 1, d: 1, h: 1 }, { x: 3, y: 5, z: 25, w: 1, d: 1, h: 1 }, { x: 4, y: 5, z: 25, w: 1, d: 1, h: 1 }],
        },
        {
          label: "The Tsunami Base",
          note: "Now the second building: the tsunami! Leave a gap, then build a thick wall on the floor, 8 blocks long and 3 deep, 2 layers tall.",
          boxes: [{ x: 10, y: 0, z: 0, w: 8, d: 3, h: 2 }],
        },
        {
          label: "The Tsunami Wall",
          note: "On top, build the wall of the wave: 8 blocks long, 2 deep, and 3 layers tall.",
          boxes: [{ x: 10, y: 0, z: 2, w: 8, d: 2, h: 3 }],
        },
        {
          label: "The Wave Tower",
          note: "At one end of the wave, build a tall tower: 2 blocks wide, 2 deep, and 6 layers tall.",
          boxes: [{ x: 10, y: 0, z: 5, w: 2, d: 2, h: 6 }],
        },
        {
          label: "The Curl",
          note: "The wave curls over! Build a curl next to the tower: 3 wide, 2 deep and 3 layers tall. Then one single block on top of the curl, like the tip of a wave.",
          boxes: [{ x: 12, y: 0, z: 5, w: 3, d: 2, h: 3 }, { x: 14, y: 0, z: 8, w: 1, d: 1, h: 1 }],
        },
        {
          label: "The Spray",
          note: "Add 2 blocks sticking out in front of the wave at the bottom, like water splashing out.",
          boxes: [{ x: 8, y: 0, z: 0, w: 2, d: 1, h: 1 }],
        },
      ],
    },
    difficulty: 4,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/pyramid-and-tsunami.webp",
    designer: "Ashton (age 5)",
    original_pages: 0,
    preview_url: null,
    sort_order: 24,
  },
  {
    id: "seed-glass-house-2",
    slug: "glass-house-2",
    number: 25,
    name: "Glass House 2",
    tagline: "Two big windows, a glass roof, and a super tall stem that sticks way up!",
    description:
      "Ashton's Glass House 2! It's a house made of windows: two big square frames you can see right through, joined together, with a smaller window across the roof. A skinny stem stands on top and reaches way up high, with a lava block at the very top. It's the sequel to the Glasses Tower, only taller.",
    inspired_by: "",
    fun_fact:
      "Glass is made from sand! When sand is heated to about 1,700 degrees Celsius, it melts, and when it cools down, it turns into clear glass.",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: {
      need: "131 magnetic cube blocks (any pictures or colors)",
      steps: [
        {
          label: "The Left Window",
          note: "Build a big square frame standing up: 6 blocks wide and 6 blocks tall, and 2 blocks thick. It has a hole in the middle, like a window.",
          boxes: [{ x: 0, y: 0, z: 0, w: 6, d: 2, h: 1 }, { x: 0, y: 0, z: 5, w: 6, d: 2, h: 1 }, { x: 0, y: 0, z: 1, w: 1, d: 2, h: 4 }, { x: 5, y: 0, z: 1, w: 1, d: 2, h: 4 }],
        },
        {
          label: "The Right Window",
          note: "Build a second frame just like the first, with a 2-block gap in between. These are the two windows of the glass house.",
          boxes: [{ x: 8, y: 0, z: 0, w: 6, d: 2, h: 1 }, { x: 8, y: 0, z: 5, w: 6, d: 2, h: 1 }, { x: 8, y: 0, z: 1, w: 1, d: 2, h: 4 }, { x: 13, y: 0, z: 1, w: 1, d: 2, h: 4 }],
        },
        {
          label: "The Middle Bridges",
          note: "Join the two windows together with two short bars in the middle, 2 blocks wide and 2 thick. One goes across the top and one goes lower down.",
          boxes: [{ x: 6, y: 0, z: 5, w: 2, d: 2, h: 1 }, { x: 6, y: 0, z: 3, w: 2, d: 2, h: 1 }],
        },
        {
          label: "The Glass Roof",
          note: "On top, build a third, smaller frame that sits across the middle: 6 blocks wide, 3 blocks tall and 2 blocks thick, with a hole in the middle. This is the roof window!",
          boxes: [{ x: 4, y: 0, z: 6, w: 6, d: 2, h: 1 }, { x: 4, y: 0, z: 8, w: 6, d: 2, h: 1 }, { x: 4, y: 0, z: 7, w: 1, d: 2, h: 1 }, { x: 9, y: 0, z: 7, w: 1, d: 2, h: 1 }],
        },
        {
          label: "The Tall Stem",
          note: "Stand a skinny stem right in the middle of the roof, 9 blocks tall and one block wide. Go slowly and hold it steady while the magnets click.",
          boxes: [{ x: 7, y: 0, z: 9, w: 1, d: 1, h: 9 }],
        },
        {
          label: "The Side Blocks",
          note: "Put one block sticking out to the right, about halfway up. Then, near the top, step the stem over to the left by one block.",
          boxes: [{ x: 8, y: 0, z: 12, w: 1, d: 1, h: 1 }, { x: 6, y: 0, z: 18, w: 1, d: 1, h: 1 }],
        },
        {
          label: "The Top of the Stem",
          note: "Finish by building the stem 4 blocks higher, with a red lava block on the very top!",
          boxes: [{ x: 6, y: 0, z: 19, w: 1, d: 1, h: 4 }],
        },
      ],
    },
    difficulty: 3,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/glass-house-2.webp",
    designer: "Ashton (age 5)",
    original_pages: 0,
    preview_url: null,
    sort_order: 25,
  },
  {
    id: "seed-cemetery-pyramid",
    slug: "cemetery-pyramid",
    number: 26,
    name: "Cemetery Pyramid",
    tagline: "A giant stepped pyramid with a field of tombs lying all around it!",
    description:
      "Ashton's Cemetery Pyramid! It's a huge stepped pyramid that climbs up in 6 big steps to a spire at the top. And all around it, behind it, there are tombs: 132 of them, each one made of two blocks lying flat on the floor, laid out like a spooky graveyard. It's the biggest build on the site, so get lots of blocks ready!",
    inspired_by: "",
    fun_fact:
      "The ancient Egyptians built pyramids as tombs for their pharaohs. The Great Pyramid of Giza was the tallest building in the world for almost 4,000 years!",
    sections: [{ w: 1, d: 1, count: 1 }],
    structure: null,
    tiles: null,
    bricks: null,
    boxes: null,
    dice: null,
    paper: null,
    cubes: {
      need: "519 magnetic cube blocks (any pictures or colors)",
      steps: [
        {
          label: "The Two Low Steps",
          note: "Build the pyramid from the front. It's 12 blocks wide. The first wall is 1 block tall and 1 block deep. Right behind it, build a second wall 2 blocks tall.",
          boxes: [{ x: 0, y: 0, z: 0, w: 12, d: 1, h: 1 }, { x: 0, y: 1, z: 0, w: 12, d: 1, h: 2 }],
        },
        {
          label: "The Middle Steps",
          note: "Keep going backward. Build the next two walls, each one block taller than the last: 3 blocks tall, then 4 blocks tall.",
          boxes: [{ x: 0, y: 2, z: 0, w: 12, d: 1, h: 3 }, { x: 0, y: 3, z: 0, w: 12, d: 1, h: 4 }],
        },
        {
          label: "The High Steps",
          note: "Build the last two walls: 5 blocks tall, then 6 blocks tall. Now the pyramid looks like a giant staircase going up toward the back!",
          boxes: [{ x: 0, y: 4, z: 0, w: 12, d: 1, h: 5 }, { x: 0, y: 5, z: 0, w: 12, d: 1, h: 6 }],
        },
        {
          label: "The Spire",
          note: "On the very top, in the middle of the back wall, stand 3 blocks tall. That's the point of the pyramid.",
          boxes: [{ x: 5, y: 5, z: 6, w: 1, d: 1, h: 3 }],
        },
        {
          label: "The Tombs: Part 1",
          note: "Outside the pyramid, lay down tombs. A tomb is 2 blocks stuck together, lying flat on the floor. Put them in 2 rows behind the pyramid, with a gap between each one so they're not touching. Make 22 tombs in this step.",
          boxes: [{ x: 0, y: 8, z: 0, w: 2, d: 1, h: 1 }, { x: 3, y: 8, z: 0, w: 2, d: 1, h: 1 }, { x: 6, y: 8, z: 0, w: 2, d: 1, h: 1 }, { x: 9, y: 8, z: 0, w: 2, d: 1, h: 1 }, { x: 12, y: 8, z: 0, w: 2, d: 1, h: 1 }, { x: 15, y: 8, z: 0, w: 2, d: 1, h: 1 }, { x: 18, y: 8, z: 0, w: 2, d: 1, h: 1 }, { x: 21, y: 8, z: 0, w: 2, d: 1, h: 1 }, { x: 24, y: 8, z: 0, w: 2, d: 1, h: 1 }, { x: 27, y: 8, z: 0, w: 2, d: 1, h: 1 }, { x: 30, y: 8, z: 0, w: 2, d: 1, h: 1 }, { x: 0, y: 10, z: 0, w: 2, d: 1, h: 1 }, { x: 3, y: 10, z: 0, w: 2, d: 1, h: 1 }, { x: 6, y: 10, z: 0, w: 2, d: 1, h: 1 }, { x: 9, y: 10, z: 0, w: 2, d: 1, h: 1 }, { x: 12, y: 10, z: 0, w: 2, d: 1, h: 1 }, { x: 15, y: 10, z: 0, w: 2, d: 1, h: 1 }, { x: 18, y: 10, z: 0, w: 2, d: 1, h: 1 }, { x: 21, y: 10, z: 0, w: 2, d: 1, h: 1 }, { x: 24, y: 10, z: 0, w: 2, d: 1, h: 1 }, { x: 27, y: 10, z: 0, w: 2, d: 1, h: 1 }, { x: 30, y: 10, z: 0, w: 2, d: 1, h: 1 }],
        },
        {
          label: "The Tombs: Part 2",
          note: "Outside the pyramid, lay down tombs. A tomb is 2 blocks stuck together, lying flat on the floor. Put them in 2 rows behind the pyramid, with a gap between each one so they're not touching. Make 22 tombs in this step.",
          boxes: [{ x: 0, y: 12, z: 0, w: 2, d: 1, h: 1 }, { x: 3, y: 12, z: 0, w: 2, d: 1, h: 1 }, { x: 6, y: 12, z: 0, w: 2, d: 1, h: 1 }, { x: 9, y: 12, z: 0, w: 2, d: 1, h: 1 }, { x: 12, y: 12, z: 0, w: 2, d: 1, h: 1 }, { x: 15, y: 12, z: 0, w: 2, d: 1, h: 1 }, { x: 18, y: 12, z: 0, w: 2, d: 1, h: 1 }, { x: 21, y: 12, z: 0, w: 2, d: 1, h: 1 }, { x: 24, y: 12, z: 0, w: 2, d: 1, h: 1 }, { x: 27, y: 12, z: 0, w: 2, d: 1, h: 1 }, { x: 30, y: 12, z: 0, w: 2, d: 1, h: 1 }, { x: 0, y: 14, z: 0, w: 2, d: 1, h: 1 }, { x: 3, y: 14, z: 0, w: 2, d: 1, h: 1 }, { x: 6, y: 14, z: 0, w: 2, d: 1, h: 1 }, { x: 9, y: 14, z: 0, w: 2, d: 1, h: 1 }, { x: 12, y: 14, z: 0, w: 2, d: 1, h: 1 }, { x: 15, y: 14, z: 0, w: 2, d: 1, h: 1 }, { x: 18, y: 14, z: 0, w: 2, d: 1, h: 1 }, { x: 21, y: 14, z: 0, w: 2, d: 1, h: 1 }, { x: 24, y: 14, z: 0, w: 2, d: 1, h: 1 }, { x: 27, y: 14, z: 0, w: 2, d: 1, h: 1 }, { x: 30, y: 14, z: 0, w: 2, d: 1, h: 1 }],
        },
        {
          label: "The Tombs: Part 3",
          note: "Outside the pyramid, lay down tombs. A tomb is 2 blocks stuck together, lying flat on the floor. Put them in 2 rows behind the pyramid, with a gap between each one so they're not touching. Make 22 tombs in this step.",
          boxes: [{ x: 0, y: 16, z: 0, w: 2, d: 1, h: 1 }, { x: 3, y: 16, z: 0, w: 2, d: 1, h: 1 }, { x: 6, y: 16, z: 0, w: 2, d: 1, h: 1 }, { x: 9, y: 16, z: 0, w: 2, d: 1, h: 1 }, { x: 12, y: 16, z: 0, w: 2, d: 1, h: 1 }, { x: 15, y: 16, z: 0, w: 2, d: 1, h: 1 }, { x: 18, y: 16, z: 0, w: 2, d: 1, h: 1 }, { x: 21, y: 16, z: 0, w: 2, d: 1, h: 1 }, { x: 24, y: 16, z: 0, w: 2, d: 1, h: 1 }, { x: 27, y: 16, z: 0, w: 2, d: 1, h: 1 }, { x: 30, y: 16, z: 0, w: 2, d: 1, h: 1 }, { x: 0, y: 18, z: 0, w: 2, d: 1, h: 1 }, { x: 3, y: 18, z: 0, w: 2, d: 1, h: 1 }, { x: 6, y: 18, z: 0, w: 2, d: 1, h: 1 }, { x: 9, y: 18, z: 0, w: 2, d: 1, h: 1 }, { x: 12, y: 18, z: 0, w: 2, d: 1, h: 1 }, { x: 15, y: 18, z: 0, w: 2, d: 1, h: 1 }, { x: 18, y: 18, z: 0, w: 2, d: 1, h: 1 }, { x: 21, y: 18, z: 0, w: 2, d: 1, h: 1 }, { x: 24, y: 18, z: 0, w: 2, d: 1, h: 1 }, { x: 27, y: 18, z: 0, w: 2, d: 1, h: 1 }, { x: 30, y: 18, z: 0, w: 2, d: 1, h: 1 }],
        },
        {
          label: "The Tombs: Part 4",
          note: "Outside the pyramid, lay down tombs. A tomb is 2 blocks stuck together, lying flat on the floor. Put them in 2 rows behind the pyramid, with a gap between each one so they're not touching. Make 22 tombs in this step.",
          boxes: [{ x: 0, y: 20, z: 0, w: 2, d: 1, h: 1 }, { x: 3, y: 20, z: 0, w: 2, d: 1, h: 1 }, { x: 6, y: 20, z: 0, w: 2, d: 1, h: 1 }, { x: 9, y: 20, z: 0, w: 2, d: 1, h: 1 }, { x: 12, y: 20, z: 0, w: 2, d: 1, h: 1 }, { x: 15, y: 20, z: 0, w: 2, d: 1, h: 1 }, { x: 18, y: 20, z: 0, w: 2, d: 1, h: 1 }, { x: 21, y: 20, z: 0, w: 2, d: 1, h: 1 }, { x: 24, y: 20, z: 0, w: 2, d: 1, h: 1 }, { x: 27, y: 20, z: 0, w: 2, d: 1, h: 1 }, { x: 30, y: 20, z: 0, w: 2, d: 1, h: 1 }, { x: 0, y: 22, z: 0, w: 2, d: 1, h: 1 }, { x: 3, y: 22, z: 0, w: 2, d: 1, h: 1 }, { x: 6, y: 22, z: 0, w: 2, d: 1, h: 1 }, { x: 9, y: 22, z: 0, w: 2, d: 1, h: 1 }, { x: 12, y: 22, z: 0, w: 2, d: 1, h: 1 }, { x: 15, y: 22, z: 0, w: 2, d: 1, h: 1 }, { x: 18, y: 22, z: 0, w: 2, d: 1, h: 1 }, { x: 21, y: 22, z: 0, w: 2, d: 1, h: 1 }, { x: 24, y: 22, z: 0, w: 2, d: 1, h: 1 }, { x: 27, y: 22, z: 0, w: 2, d: 1, h: 1 }, { x: 30, y: 22, z: 0, w: 2, d: 1, h: 1 }],
        },
        {
          label: "The Tombs: Part 5",
          note: "Outside the pyramid, lay down tombs. A tomb is 2 blocks stuck together, lying flat on the floor. Put them in 2 rows behind the pyramid, with a gap between each one so they're not touching. Make 22 tombs in this step.",
          boxes: [{ x: 0, y: 24, z: 0, w: 2, d: 1, h: 1 }, { x: 3, y: 24, z: 0, w: 2, d: 1, h: 1 }, { x: 6, y: 24, z: 0, w: 2, d: 1, h: 1 }, { x: 9, y: 24, z: 0, w: 2, d: 1, h: 1 }, { x: 12, y: 24, z: 0, w: 2, d: 1, h: 1 }, { x: 15, y: 24, z: 0, w: 2, d: 1, h: 1 }, { x: 18, y: 24, z: 0, w: 2, d: 1, h: 1 }, { x: 21, y: 24, z: 0, w: 2, d: 1, h: 1 }, { x: 24, y: 24, z: 0, w: 2, d: 1, h: 1 }, { x: 27, y: 24, z: 0, w: 2, d: 1, h: 1 }, { x: 30, y: 24, z: 0, w: 2, d: 1, h: 1 }, { x: 0, y: 26, z: 0, w: 2, d: 1, h: 1 }, { x: 3, y: 26, z: 0, w: 2, d: 1, h: 1 }, { x: 6, y: 26, z: 0, w: 2, d: 1, h: 1 }, { x: 9, y: 26, z: 0, w: 2, d: 1, h: 1 }, { x: 12, y: 26, z: 0, w: 2, d: 1, h: 1 }, { x: 15, y: 26, z: 0, w: 2, d: 1, h: 1 }, { x: 18, y: 26, z: 0, w: 2, d: 1, h: 1 }, { x: 21, y: 26, z: 0, w: 2, d: 1, h: 1 }, { x: 24, y: 26, z: 0, w: 2, d: 1, h: 1 }, { x: 27, y: 26, z: 0, w: 2, d: 1, h: 1 }, { x: 30, y: 26, z: 0, w: 2, d: 1, h: 1 }],
        },
        {
          label: "The Tombs: Part 6",
          note: "Outside the pyramid, lay down tombs. A tomb is 2 blocks stuck together, lying flat on the floor. Put them in 2 rows behind the pyramid, with a gap between each one so they're not touching. Make 22 tombs in this step.",
          boxes: [{ x: 0, y: 28, z: 0, w: 2, d: 1, h: 1 }, { x: 3, y: 28, z: 0, w: 2, d: 1, h: 1 }, { x: 6, y: 28, z: 0, w: 2, d: 1, h: 1 }, { x: 9, y: 28, z: 0, w: 2, d: 1, h: 1 }, { x: 12, y: 28, z: 0, w: 2, d: 1, h: 1 }, { x: 15, y: 28, z: 0, w: 2, d: 1, h: 1 }, { x: 18, y: 28, z: 0, w: 2, d: 1, h: 1 }, { x: 21, y: 28, z: 0, w: 2, d: 1, h: 1 }, { x: 24, y: 28, z: 0, w: 2, d: 1, h: 1 }, { x: 27, y: 28, z: 0, w: 2, d: 1, h: 1 }, { x: 30, y: 28, z: 0, w: 2, d: 1, h: 1 }, { x: 0, y: 30, z: 0, w: 2, d: 1, h: 1 }, { x: 3, y: 30, z: 0, w: 2, d: 1, h: 1 }, { x: 6, y: 30, z: 0, w: 2, d: 1, h: 1 }, { x: 9, y: 30, z: 0, w: 2, d: 1, h: 1 }, { x: 12, y: 30, z: 0, w: 2, d: 1, h: 1 }, { x: 15, y: 30, z: 0, w: 2, d: 1, h: 1 }, { x: 18, y: 30, z: 0, w: 2, d: 1, h: 1 }, { x: 21, y: 30, z: 0, w: 2, d: 1, h: 1 }, { x: 24, y: 30, z: 0, w: 2, d: 1, h: 1 }, { x: 27, y: 30, z: 0, w: 2, d: 1, h: 1 }, { x: 30, y: 30, z: 0, w: 2, d: 1, h: 1 }],
        },
      ],
    },
    difficulty: 4,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/cemetery-pyramid.webp",
    designer: "Ashton (age 5)",
    original_pages: 0,
    preview_url: null,
    sort_order: 26,
  },
];

// Old web addresses of renamed blueprints, so links people already have keep working.
// Pages only redirect when the old address no longer finds a blueprint, so the
// database can be renamed before or after a deploy.
export const RENAMED_SLUGS: Record<string, string> = {
  // The Dragon Tower was briefly "ring-tower"; that address now belongs to Sawyer's
  // Ring Tower, so only print links with a Dragon Tower key end up forwarded.
  "ring-tower": "dragon-tower",
  "snaking-pillar-structure": "snake-rope",
};

export const DEFAULT_ARCHITECT_NOTE =
  "Hi! I'm Sawyer and I'm 7. I love building really tall towers with magnetic blocks. I design every tower myself, test it to make sure it stands up, and then turn it into a blueprint so you can build it too. My first one is the Jeddah Tower. It has 327 blocks! Built your own tower? Send it to me and I can make it a blueprint too.";

function normalize(row: Record<string, unknown>): Blueprint {
  return {
    ...(row as unknown as Blueprint),
    sections: cleanSections(row.sections),
    structure: cleanStructure(row.structure),
    tiles: cleanTiles(row.tiles),
    bricks: cleanBricks(row.bricks),
    boxes: cleanBoxes(row.boxes),
    dice: cleanDice(row.dice),
    paper: cleanPaper(row.paper),
    cubes: cleanCubes(row.cubes),
  };
}

export async function getBlueprints(): Promise<Blueprint[]> {
  const sb = db();
  if (!sb) return SEED_BLUEPRINTS;
  const { data, error } = await sb
    .from("blueprints")
    .select("*")
    .neq("status", "draft")
    .order("sort_order")
    .order("number");
  if (error) {
    console.error("getBlueprints", error.message);
    return SEED_BLUEPRINTS;
  }
  return (data ?? []).map(normalize);
}

export async function getBlueprint(slug: string): Promise<Blueprint | null> {
  const sb = db();
  if (!sb) return SEED_BLUEPRINTS.find((b) => b.slug === slug) ?? null;
  const { data, error } = await sb
    .from("blueprints")
    .select("*")
    .eq("slug", slug)
    .neq("status", "draft")
    .maybeSingle();
  if (error) {
    console.error("getBlueprint", error.message);
    return SEED_BLUEPRINTS.find((b) => b.slug === slug) ?? null;
  }
  return data ? normalize(data) : null;
}

export async function getPrint(slug: string, key: string): Promise<Blueprint | null> {
  const sb = db();
  if (!sb || !key) return null;
  const { data, error } = await sb.rpc("get_print", { p_slug: slug, p_key: key });
  if (error) {
    console.error("getPrint", error.message);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : null;
  return row ? normalize(row) : null;
}

export const DEFAULT_CUSTOM_PRICE_CENTS = 1000;

export async function getSettings(): Promise<SiteSettings> {
  const defaults: SiteSettings = {
    architectNote: DEFAULT_ARCHITECT_NOTE,
    customPriceCents: DEFAULT_CUSTOM_PRICE_CENTS,
    customOpen: true,
  };
  const sb = db();
  if (!sb) return defaults;
  const { data, error } = await sb.from("site_settings").select("key, value");
  if (error || !data) return defaults;
  const map = Object.fromEntries(data.map((r) => [r.key, String(r.value ?? "")]));
  const price = Number(map.custom_price_cents);
  return {
    architectNote: map.architect_note?.trim() || defaults.architectNote,
    customPriceCents: map.custom_price_cents && Number.isFinite(price) ? price : defaults.customPriceCents,
    customOpen: map.custom_open !== "false",
  };
}

export async function getOriginals(slug: string, key: string): Promise<OriginalFile[]> {
  const sb = db();
  if (!sb || !key) return [];
  const { data, error } = await sb.rpc("get_originals", { p_slug: slug, p_key: key });
  if (error) {
    console.error("getOriginals", error.message);
    return [];
  }
  return (data ?? []) as OriginalFile[];
}
