import { db } from "@/lib/supabase";

// Serves blueprint photos uploaded from Architect HQ. URLs carry a ?v= version,
// so responses can be cached for a long time.
export async function GET(_req: Request, ctx: RouteContext<"/api/photo/[slug]">) {
  const { slug } = await ctx.params;
  const sb = db();
  if (!sb) return new Response("Not found", { status: 404 });
  const { data, error } = await sb.rpc("get_blueprint_photo", { p_slug: slug });
  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(row.data_b64, "base64"), {
    headers: {
      "content-type": row.mime,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
