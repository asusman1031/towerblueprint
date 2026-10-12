import "server-only";
import { db } from "@/lib/supabase";
import { cleanStructure, type Structure } from "@/lib/structure";
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
    id: "seed-snaking-pillar",
    slug: "snaking-pillar-structure",
    number: 2,
    name: "Snaking Pillar Structure",
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
    id: "seed-ring-tower",
    slug: "ring-tower",
    number: 3,
    name: "Ring Tower",
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
    difficulty: 2,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/ring-tower.jpg",
    designer: "Ashton (age 5)",
    original_pages: 0,
    preview_url: null,
    sort_order: 3,
  },
];

export const DEFAULT_ARCHITECT_NOTE =
  "Hi! I'm Sawyer and I'm 7. I love building really tall towers with magnetic blocks. I design every tower myself, test it to make sure it stands up, and then turn it into a blueprint so you can build it too. My first one is the Jeddah Tower. It has 327 blocks! Built your own tower? Send it to me and I can make it a blueprint too.";

function normalize(row: Record<string, unknown>): Blueprint {
  return {
    ...(row as unknown as Blueprint),
    sections: cleanSections(row.sections),
    structure: cleanStructure(row.structure),
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
