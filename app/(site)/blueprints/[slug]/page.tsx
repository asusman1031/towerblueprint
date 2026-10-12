import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuildingTower from "@/components/BuildingTower";
import BuyBox from "@/components/BuyBox";
import Photo from "@/components/Photo";
import Track from "@/components/Track";
import { getBlueprint } from "@/lib/data";
import { difficultyLabel, towerTotals } from "@/lib/tower";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/blueprints/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const bp = await getBlueprint(slug);
  if (!bp) return { title: "Blueprint not found" };
  return {
    title: `${bp.name} blueprint`,
    description: `${bp.tagline} An official step-by-step magnetic block tower blueprint designed by Sawyer, age 7.`,
    openGraph: { images: bp.photo_url && !bp.photo_url.startsWith("/api/") ? [bp.photo_url] : ["/brand/logo.png"] },
  };
}

export default async function BlueprintPage({ params }: PageProps<"/blueprints/[slug]">) {
  const { slug } = await params;
  const bp = await getBlueprint(slug);
  if (!bp) notFound();
  const t = towerTotals(bp.sections);

  return (
    <>
      <Track event="view_blueprint" slug={bp.slug} />
      <section className="bg-grid-light border-b-[3px] border-navy">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <Link href="/blueprints" className="text-sm font-extrabold text-brand hover:underline">
            ← All blueprints
          </Link>
          <div className="mt-6 grid gap-10 md:grid-cols-[1fr_1.05fr]">
            <div className="card bg-grid-light grid grid-cols-2 items-end gap-4 p-5">
              <figure className="flex flex-col items-center">
                {bp.photo_url ? (
                  <Photo
                    src={bp.photo_url}
                    alt={`Sawyer's real ${bp.name}, built from magnetic blocks`}
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

            <div>
              <span className="rounded-full border-2 border-navy bg-sun px-3 py-0.5 font-display text-sm">
                Blueprint No. {String(bp.number).padStart(3, "0")}
              </span>
              <h1 className="mt-3 font-display text-5xl leading-none text-navy sm:text-6xl">{bp.name}</h1>
              <p className="mt-3 text-xl font-semibold text-ink">{bp.tagline}</p>
              {bp.description ? <p className="mt-4 text-lg text-ink">{bp.description}</p> : null}

              <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Blocks", String(t.blocks)],
                  ["Tall", `${t.height}`],
                  ["Base", `${t.footprintW}×${t.footprintD}`],
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
              <span aria-hidden>🧊</span>
              <span>
                <strong className="font-extrabold">{t.blocks} magnetic cube blocks</strong> (any colors you like)
              </span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden>🟫</span>
              <span>A hard, flat floor so your tower stands straight</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden>🙋</span>
              <span>A grown-up to help reach the top if it gets taller than you</span>
            </li>
            <li className="flex gap-3">
              <span aria-hidden>🖨️</span>
              <span>A printer, or save the blueprint as a PDF</span>
            </li>
          </ul>
        </div>
        {bp.fun_fact ? (
          <div className="card bg-sun/20 p-6">
            <h2 className="font-display text-3xl text-navy">The real building</h2>
            {bp.inspired_by ? <p className="mt-1 font-extrabold text-brand">{bp.inspired_by}</p> : null}
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
