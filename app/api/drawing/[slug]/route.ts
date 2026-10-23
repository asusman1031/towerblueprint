import { createElement } from "react";
import IsoTower from "@/components/IsoTower";
import { getBlueprint } from "@/lib/data";
import { svgToString } from "@/lib/svg-string";

// A blueprint's isometric drawing as a stand-alone SVG image. Cards and the
// animation gallery load it with <img>, so the browser and the CDN can cache it
// instead of every page carrying thousands of inline shapes.
//   ?animate=1  the blocks drop in layer by layer (the animation lives in the file)
//   ?v=<hash>   changes whenever the design does, so the file can be cached for good

const ANIMATION_CSS =
  "@keyframes d{from{transform:translateY(-36px);opacity:0}to{transform:none;opacity:1}}" +
  ".iso-drop{animation:d .55s cubic-bezier(.2,.9,.3,1.25) both}" +
  "@media(prefers-reduced-motion:reduce){.iso-drop{animation:none}}";

export async function GET(req: Request, ctx: RouteContext<"/api/drawing/[slug]">) {
  const { slug } = await ctx.params;
  const url = new URL(req.url);
  const animate = url.searchParams.get("animate") === "1";
  const stepMs = Math.min(400, Math.max(20, Number(url.searchParams.get("step")) || 65));
  const bp = await getBlueprint(slug);
  if (!bp) return new Response("Not found", { status: 404 });

  let svg = svgToString(
    createElement(IsoTower, {
      sections: bp.sections,
      structure: bp.structure,
      tiles: bp.tiles,
      bricks: bp.bricks,
      boxes: bp.boxes,
      dice: bp.dice,
      paper: bp.paper,
      cubes: bp.cubes,
      animate,
      stepMs,
      coarse: !animate,
      title: `${bp.name} drawing`,
    }),
  );
  if (!svg.startsWith("<svg")) return new Response("No drawing", { status: 404 });
  svg = svg.replace(
    "<svg",
    `<svg xmlns="http://www.w3.org/2000/svg"`,
  );
  if (animate) svg = svg.replace(/(<svg[^>]*>)/, `$1<style>${ANIMATION_CSS}</style>`);

  const versioned = url.searchParams.has("v");
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": versioned
        ? "public, max-age=31536000, immutable"
        : "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
