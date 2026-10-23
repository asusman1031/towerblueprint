import { cookies } from "next/headers";
import { db } from "@/lib/supabase";

// Builder Wall photos waiting for review. Visible only when signed in to HQ.
export async function GET(_req: Request, ctx: RouteContext<"/hq/wall-photo/[id]">) {
  const { id } = await ctx.params;
  const token = (await cookies()).get("tb_hq")?.value ?? "";
  const sb = db();
  if (!sb || !token || !/^\d+$/.test(id)) return new Response("Not found", { status: 404 });
  const { data, error } = await sb.rpc("hq_wall_photo", { p_token: token, p_id: Number(id) });
  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(row.data_b64, "base64"), {
    headers: { "content-type": row.mime, "cache-control": "private, max-age=3600" },
  });
}
