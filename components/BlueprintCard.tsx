import Link from "next/link";
import IsoTower from "@/components/IsoTower";
import Photo from "@/components/Photo";
import type { Blueprint } from "@/lib/data";
import { designTotals } from "@/lib/structure";
import { difficultyLabel, formatPrice } from "@/lib/tower";

export default function BlueprintCard({ bp }: { bp: Blueprint }) {
  const t = designTotals(bp);
  return (
    <Link href={`/blueprints/${bp.slug}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-1">
      {bp.structure || bp.tiles ? (
        // Sideways and tile builds are wide: the photo fills the top, the drawing sits in a corner.
        <div className="bg-grid-light relative h-72 border-b-[3px] border-navy">
          {bp.photo_url ? (
            <Photo
              src={bp.photo_url}
              alt={`${bp.name}, built with magnetic blocks`}
              width={1200}
              height={1400}
              sizes="(max-width: 768px) 100vw, 400px"
              className="h-full w-full object-cover"
            />
          ) : null}
          <div
            className={`absolute right-3 bottom-3 rounded-xl border-2 border-navy bg-white/90 p-2 ${bp.tiles ? "" : "w-[55%]"}`}
          >
            <IsoTower
              structure={bp.structure}
              tiles={bp.tiles}
              className={bp.tiles ? "mx-auto h-28 w-auto max-w-full" : "h-auto w-full"}
              title={`${bp.name} drawing`}
            />
          </div>
          <Badges bp={bp} />
        </div>
      ) : (
        <div className="bg-grid-light relative flex h-72 items-end justify-center gap-4 border-b-[3px] border-navy px-6 pt-6">
          {bp.photo_url ? (
            <Photo
              src={bp.photo_url}
              alt={`${bp.name}, built with magnetic blocks`}
              className="mb-6 h-56 w-28 rounded-xl border-[3px] border-navy object-cover"
            />
          ) : null}
          <IsoTower sections={bp.sections} className="mb-6 h-56 w-auto max-w-[45%]" title={`${bp.name} drawing`} />
          <Badges bp={bp} />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-3xl text-navy group-hover:text-brand">{bp.name}</h3>
        {bp.designer ? <p className="text-sm font-extrabold text-brand">Guest architect: {bp.designer}</p> : null}
        <p className="mt-1 text-ink">{bp.tagline}</p>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-ice p-2">
            <dt className="text-[0.65rem] font-extrabold tracking-wider text-ink uppercase">
              {t.unit === "tiles" ? "Tiles" : "Blocks"}
            </dt>
            <dd className="font-display text-xl text-navy">{t.blocks}</dd>
          </div>
          <div className="rounded-xl bg-ice p-2">
            <dt className="text-[0.65rem] font-extrabold tracking-wider text-ink uppercase">Tall</dt>
            <dd className="font-display text-xl text-navy">{t.height}</dd>
          </div>
          <div className="rounded-xl bg-ice p-2">
            <dt className="text-[0.65rem] font-extrabold tracking-wider text-ink uppercase">Level</dt>
            <dd className="font-display text-xl text-navy">{difficultyLabel(bp.difficulty)}</dd>
          </div>
        </dl>
        <div className="mt-5 flex items-center justify-between">
          <span className="font-display text-2xl text-navy">{formatPrice(bp.price_cents)}</span>
          <span className="btn btn-sun btn-sm">See blueprint →</span>
        </div>
      </div>
    </Link>
  );
}

function Badges({ bp }: { bp: Blueprint }) {
  return (
    <>
      <span className="absolute top-3 left-3 rounded-full border-2 border-navy bg-white px-3 py-0.5 font-display text-sm">
        No. {String(bp.number).padStart(3, "0")}
      </span>
      {bp.status === "coming_soon" ? (
        <span className="absolute top-3 right-3 rounded-full border-2 border-navy bg-tangerine px-3 py-0.5 text-xs font-extrabold text-white uppercase">
          Coming soon
        </span>
      ) : bp.tiles ? (
        // Tells buyers which toy they need.
        <span className="absolute top-3 right-3 rounded-full border-2 border-navy bg-sun px-3 py-0.5 text-xs font-extrabold uppercase">
          Magnetic tiles
        </span>
      ) : null}
    </>
  );
}
