import { db } from "@/lib/supabase";

// Sawyer's original blueprint file. Only opens with the blueprint's secret key.
export async function GET(req: Request, ctx: RouteContext<"/api/original/[slug]/[id]">) {
  const { slug, id } = await ctx.params;
  const key = new URL(req.url).searchParams.get("key") ?? "";
  const download = new URL(req.url).searchParams.get("download") === "1";
  const sb = db();
  if (!sb || !key || !/^\d+$/.test(id)) return new Response("Not found", { status: 404 });
  const { data, error } = await sb.rpc("get_original_file", { p_slug: slug, p_key: key, p_id: Number(id) });
  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row) return new Response("Not found", { status: 404 });
  const filename = String(row.filename || `${slug}-original`).replace(/[^\w.\- ]+/g, "_");
  return new Response(Buffer.from(row.data_b64, "base64"), {
    headers: {
      "content-type": row.mime,
      "content-disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
      "cache-control": "private, max-age=3600",
      "x-robots-tag": "noindex",
    },
  });
}
