import { db } from "@/lib/supabase";

// Small blurred preview of an original blueprint, made in HQ at upload time.
export async function GET(_req: Request, ctx: RouteContext<"/api/original-preview/[slug]">) {
  const { slug } = await ctx.params;
  const sb = db();
  if (!sb) return new Response("Not found", { status: 404 });
  const { data, error } = await sb.rpc("get_original_preview", { p_slug: slug });
  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row?.data_b64) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(row.data_b64, "base64"), {
    headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=31536000, immutable" },
  });
}
