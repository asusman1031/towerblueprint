import "server-only";
import { db } from "@/lib/supabase";
import { cleanStructure, type Structure } from "@/lib/structure";
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
  difficulty: number;
  price_cents: number;
  checkout_url: string | null;
  status: Status;
  photo_url: string | null;
  designer: string;
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
