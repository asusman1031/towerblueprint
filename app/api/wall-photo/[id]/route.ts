import { db } from "@/lib/supabase";

// Photos of approved Builder Wall entries. Anything not approved is a 404.
export async function GET(_req: Request, ctx: RouteContext<"/api/wall-photo/[id]">) {
  const { id } = await ctx.params;
  const sb = db();
  if (!sb || !/^\d+$/.test(id)) return new Response("Not found", { status: 404 });
  const { data, error } = await sb.rpc("wall_photo", { p_id: Number(id) });
  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(row.data_b64, "base64"), {
    headers: {
      "content-type": row.mime,
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
