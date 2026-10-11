import "server-only";
import { db } from "@/lib/supabase";
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
  difficulty: number;
  price_cents: number;
  checkout_url: string | null;
  status: Status;
  photo_url: string | null;
  sort_order: number;
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
      "Sawyer's very first official blueprint. Four sections that get skinnier as they go up, just like the real tower. It starts with a wide, strong base and ends with a spire one block wide.",
    inspired_by: "Jeddah Tower, Saudi Arabia",
    fun_fact:
      "The real Jeddah Tower is being built in Saudi Arabia. When it's finished it is planned to be about 1 kilometer tall (more than 3,000 feet), which would make it the tallest building in the world, taller than the Burj Khalifa.",
    sections: [
      { w: 5, d: 5, count: 6, label: "The Base" },
      { w: 3, d: 3, count: 12, label: "The Lower Tower" },
      { w: 2, d: 2, count: 12, label: "The Upper Tower" },
      { w: 1, d: 1, count: 21, label: "The Spire" },
    ],
    difficulty: 2,
    price_cents: 500,
    checkout_url: null,
    status: "live",
    photo_url: "/photos/jeddah-tower.jpg",
    sort_order: 1,
  },
];

export const DEFAULT_ARCHITECT_NOTE =
  "Hi! I'm Sawyer and I'm 7. I love building really tall towers with magnetic blocks. I design every tower myself, test it to make sure it stands up, and then turn it into a blueprint so you can build it too. My first one is the Jeddah Tower. It has 327 blocks! What should I build next?";

function normalize(row: Record<string, unknown>): Blueprint {
  return { ...(row as unknown as Blueprint), sections: cleanSections(row.sections) };
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

export async function getArchitectNote(): Promise<string> {
  const sb = db();
  if (!sb) return DEFAULT_ARCHITECT_NOTE;
  const { data } = await sb.from("site_settings").select("value").eq("key", "architect_note").maybeSingle();
  return data?.value?.trim() || DEFAULT_ARCHITECT_NOTE;
}
