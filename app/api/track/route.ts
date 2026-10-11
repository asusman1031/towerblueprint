import { db } from "@/lib/supabase";

const EVENTS = new Set(["visit", "view_blueprint", "click_buy"]);
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i;

// Anonymous counters for Sawyer's scoreboard: no cookies, no personal data.
export async function POST(req: Request) {
  if (BOT.test(req.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
  let body: { event?: unknown; slug?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const event = String(body.event ?? "");
  const slug = String(body.slug ?? "").slice(0, 60);
  const sb = db();
  if (sb && EVENTS.has(event)) {
    const { error } = await sb.rpc("track_event", { p_event: event, p_slug: slug });
    if (error) console.error("track_event", error.message);
  }
  return new Response(null, { status: 204 });
}
