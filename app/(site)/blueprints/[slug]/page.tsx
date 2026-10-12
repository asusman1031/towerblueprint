import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BuildingTower from "@/components/BuildingTower";
import BuyBox from "@/components/BuyBox";
import Photo from "@/components/Photo";
import Track from "@/components/Track";
import { getBlueprint, RENAMED_SLUGS } from "@/lib/data";
import { BLUEPRINT_KIND, buildKind, MATERIAL } from "@/lib/kind";
import { designTotals, unitLabel } from "@/lib/structure";
import { difficultyLabel } from "@/lib/tower";

// Always read live data, so changes from HQ or the database show up right away.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/blueprints/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const bp = await getBlueprint(slug);
  if (!bp) return { title: "Blueprint not found" };
  const kind = BLUEPRINT_KIND[buildKind(bp)];
  return {
    title: `${bp.name} blueprint`,
    description: bp.designer
      ? `${bp.tagline} An official step-by-step ${kind} blueprint, designed by ${bp.designer} and made by Sawyer, age 7.`
      : `${bp.tagline} An official step-by-step ${kind} blueprint designed by Sawyer, age 7.`,
    openGraph: { images: bp.photo_url && !bp.photo_url.startsWith("/api/") ? [bp.photo_url] : ["/brand/logo.png"] },
  };
}

export default async function BlueprintPage({ params }: PageProps<"/blueprints/[slug]">) {
  const { slug } = await params;
  const bp = await getBlueprint(slug);
  if (!bp) {
    if (RENAMED_SLUGS[slug]) redirect(`/blueprints/${RENAMED_SLUGS[slug]}`);
    notFound();
  }
  const t = designTotals(bp);
  const sideways = bp.structure;
  // Sideways builds that rest on furniture (chairs, a table) need it lined up first.
  const onFurniture = !!bp.structure?.parts.some((p) => p.on);
  const hasPillars = !!bp.structure?.parts.some((p) => p.kind === "pillar");
  const photos = [bp.photo_url, ...((bp.structure ?? bp.tiles ?? bp.bricks ?? bp.boxes ?? bp.dice)?.photos ?? [])]
    .filter((x): x is string => !!x)
    .slice(0, 2);
  // Everything but a plain tower shows two photos with the drawing underneath.
  const kind = buildKind(bp);
  const wide = kind !== "tower";
  const material = MATERIAL[kind];

  return (
    <>
      <Track event="view_blueprint" slug={bp.slug} />
      <section className="bg-grid-light border-b-[3px] border-navy">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <Link href="/blueprints" className="text-sm font-extrabold text-brand hover:underline">
            ← All blueprints
          </Link>
          <div className="mt-6 grid gap-10 md:grid-cols-[1fr_1.05fr]">
            {wide ? (
              <div className="card bg-grid-light space-y-5 p-5">
                <div className={photos.length > 1 ? "grid grid-cols-2 gap-4" : "mx-auto max-w-sm"}>
                  {photos.map((src, i) =>
                    src ? (
                      <figure key={src} className="flex flex-col items-center">
                        <Photo
                          src={src}
                          alt={
                            i === 0
                              ? `${bp.name}, built from ${material}`
                              : `Another view of ${bp.name}`
                          }
                          width={1200}
                          height={1400}
                          sizes="(max-width: 768px) 50vw, 280px"
                          className={`w-full rounded-xl border-[3px] border-navy ${photos.length > 1 ? "aspect-[6/7] object-cover" : "h-auto"}`}
                        />
                        <figcaption className="mt-2 text-xs font-extrabold tracking-wider text-ink uppercase">
                          {i === 0 ? "The real build" : "Another view"}
                        </figcaption>
                      </figure>
                    ) : null,
                  )}
                </div>
                <figure className="flex w-full flex-col items-center">
                  <BuildingTower
                    sections={bp.sections}
                    structure={bp.structure}
                    tiles={bp.tiles}
                    bricks={bp.bricks}
                    boxes={bp.boxes}
                    dice={bp.dice}
                    wide
                    className={
                      bp.bricks
                        ? "mx-auto h-80 w-auto max-w-full"
                        : bp.dice
                          ? "mx-auto h-48 w-auto max-w-full"
                          : bp.tiles || bp.boxes
                          ? "mx-auto h-64 w-auto max-w-full"
                          : "h-auto max-h-[22rem] w-full"
                    }
                    title={`${bp.name} drawing`}
                  />
                  <figcaption className="mt-2 text-xs font-extrabold tracking-wider text-ink uppercase">
                    The blueprint
                  </figcaption>
                </figure>
              </div>
            ) : (
              <div className="card bg-grid-light grid grid-cols-2 items-end gap-4 p-5">
                <figure className="flex flex-col items-center">
                  {bp.photo_url ? (
                    <Photo
                      src={bp.photo_url}
                      alt={`${bp.name}, built from magnetic blocks`}
                      className="h-[26rem] w-52 rounded-xl border-[3px] border-navy object-cover"
                    />
                  ) : (
                    <div className="flex h-[26rem] w-52 items-center justify-center rounded-xl border-[3px] border-dashed border-navy/30 p-4 text-center text-sm font-bold text-ink">
                      Photo coming soon
                    </div>
                  )}
                  <figcaption className="mt-2 text-xs font-extrabold tracking-wider text-ink uppercase">
                    The real build
                  </figcaption>
                </figure>
                <figure className="flex flex-col items-center">
                  <BuildingTower sections={bp.sections} className="h-[22rem] w-auto" title={`${bp.name} drawing`} />
                  <figcaption className="mt-2 text-xs font-extrabold tracking-wider text-ink uppercase">
                    The blueprint
                  </figcaption>
                </figure>
              </div>
            )}

            <div>
              <span className="rounded-full border-2 border-navy bg-sun px-3 py-0.5 font-display text-sm">
                Blueprint No. {String(bp.number).padStart(3, "0")}
              </span>
              <h1 className="mt-3 font-display text-5xl leading-none text-navy sm:text-6xl">{bp.name}</h1>
              {bp.designer ? (
                <p className="mt-2 font-extrabold text-brand">
                  Designed by {bp.designer} · Blueprint by Sawyer (age 7)
                </p>
              ) : null}
              <p className="mt-3 text-xl font-semibold text-ink">{bp.tagline}</p>
              {bp.description ? <p className="mt-4 text-lg text-ink">{bp.description}</p> : null}

              <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  [unitLabel(t.unit), String(t.blocks)],
                  ["Tall", `${t.height}`],
                  [t.base.label, t.base.value],
                  ["Level", difficultyLabel(bp.difficulty)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border-2 border-navy bg-white p-3 text-center">
                    <dt className="text-[0.7rem] font-extrabold tracking-wider text-ink uppercase">{k}</dt>
                    <dd className="font-display text-2xl text-navy">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6">
                <BuyBox
                  slug={bp.slug}
                  name={bp.name}
                  priceCents={bp.price_cents}
                  checkoutUrl={bp.checkout_url}
                  status={bp.status}
                  sections={bp.sections}
                  structure={bp.structure}
                  tiles={bp.tiles}
                  bricks={bp.bricks}
                  boxes={bp.boxes}
                  dice={bp.dice}
                  number={bp.number}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-3xl text-navy">What you need</h2>
          <ul className="mt-4 space-y-3 text-lg text-ink">
            <li className="flex gap-3">
              <span aria-hidden>{bp.tiles ? "🟦" : bp.bricks ? "🧱" : bp.boxes ? "📦" : bp.dice ? "🎲" : "🧊"}</span>
              {bp.structure?.need ? (
                <span>
                  <strong className="font-extrabold">{bp.structure.need}</strong>
                </span>
              ) : bp.dice ? (
                <span>
                  <strong className="font-extrabold">{bp.dice.need || `${t.blocks} dice`}</strong> (regular dice with dots)
                </span>
              ) : bp.boxes ? (
                <span>
                  <strong className="font-extrabold">{bp.boxes.need || `${t.blocks} cardboard boxes`}</strong> (any boxes
                  close in shape work)
                </span>
              ) : bp.bricks ? (
                <span>
                  <strong className="font-extrabold">{bp.bricks.need || `${t.blocks} LEGO DUPLO bricks`}</strong> (the
                  parts list shows every size and color, but any colors work)
                </span>
              ) : bp.tiles ? (
                <span>
                  <strong className="font-extrabold">{t.blocks} magnetic tile squares</strong> (any brand or colors. A big
                  square counts as 4, a long rectangle as 2)
                </span>
              ) : (
                <span>
                  <strong className="font-extrabold">{t.blocks} magnetic cube blocks</strong> (any colors you like)
                </span>
              )}
            </li>
            <li className="flex gap-3">
              <span aria-hidden>{onFurniture ? "🪑" : "🟫"}</span>
              <span>
                {onFurniture
                  ? "Two chairs and a table, lined up next to each other"
                  : bp.tiles
                    ? "A hard, flat floor so the walls stand up straight"
                    : "A hard, flat floor so your tower stands straight"}
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden>🙋</span>
              <span>
                {hasPillars
                  ? "A grown-up to help hold the beams while the magnets click together"
                  : bp.tiles
                    ? "A grown-up to hold the walls steady while the roofs click on"
                    : bp.bricks
                      ? "A grown-up to hold the tower steady while you press the top bricks on"
                      : bp.boxes
                        ? "A grown-up to open any taped-up flaps"
                        : bp.dice
                          ? "A steady hand: dice are smooth, so set them down gently"
                      : "A grown-up to help reach the top if it gets taller than you"}
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden>🖨️</span>
              <span>A printer, or save the blueprint as a PDF</span>
            </li>
          </ul>
        </div>
        {bp.fun_fact ? (
          <div className="card bg-sun/20 p-6">
            <h2 className="font-display text-3xl text-navy">
              {sideways || !bp.inspired_by ? "Did you know?" : "The real building"}
            </h2>
            {bp.inspired_by && !sideways ? <p className="mt-1 font-extrabold text-brand">{bp.inspired_by}</p> : null}
            <p className="mt-3 text-lg text-ink">{bp.fun_fact}</p>
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="bg-grid-blue flex flex-col items-start gap-4 rounded-[1.5rem] border-[3px] border-navy p-6 text-white sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="font-display text-3xl">Built your own tower?</p>
            <p className="mt-1 text-ice">Sawyer will make your design a blueprint too.</p>
          </div>
          <Link href="/your-design" className="btn btn-sun">
            Send Sawyer your tower
          </Link>
        </div>
      </section>
    </>
  );
}
