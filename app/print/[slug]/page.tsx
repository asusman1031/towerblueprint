import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import IsoTower from "@/components/IsoTower";
import PlacementDiagram from "@/components/PlacementDiagram";
import PrintButton from "@/components/PrintButton";
import { getOriginals, getPrint, SEED_BLUEPRINTS, type Blueprint, type OriginalFile } from "@/lib/data";
import { dbReady } from "@/lib/supabase";
import { difficultyLabel, sectionStats, towerTotals, type SectionStats } from "@/lib/tower";
import "./print.css";

export const metadata: Metadata = {
  title: "Official blueprint",
  robots: { index: false, follow: false },
};

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

function TitleBar({ bp, page, pages }: { bp: Blueprint; page: number; pages: number }) {
  return (
    <div className="flex items-center gap-3 border-b-[3px] border-blueprint pb-3">
      <Image src="/brand/mark.png" alt="" width={400} height={270} className="h-10 w-auto" loading="eager" />
      <div className="leading-tight">
        <div className="text-[0.62rem] font-extrabold tracking-[0.25em] text-blueprint uppercase">
          Tower Blueprints for Kids · Official Blueprint
        </div>
        <div className="font-display text-xl text-blueprint">{bp.name}</div>
      </div>
      <div className="ml-auto text-right leading-tight">
        <div className="font-display text-xl text-blueprint">No. {pad3(bp.number)}</div>
        <div className="text-[0.62rem] font-extrabold tracking-widest text-blueprint/70 uppercase">
          Page {page} of {pages}
        </div>
      </div>
    </div>
  );
}

function StepCard({
  s,
  below,
  bp,
  footprint,
}: {
  s: SectionStats;
  below?: SectionStats;
  bp: Blueprint;
  footprint: { w: number; d: number };
}) {
  return (
    <div className="step-card rounded-2xl border-[2.5px] border-blueprint p-4">
      <div className="flex items-baseline gap-3">
        <span className="rounded-lg bg-blueprint px-2.5 py-1 font-display text-lg text-white">Step {s.index + 1}</span>
        <span className="font-display text-2xl text-blueprint">{s.name}</span>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-4">
        <div>
          <div className="flex items-start gap-4">
            <PlacementDiagram
              current={s}
              below={below}
              footprint={footprint}
              className="h-28 w-28 shrink-0"
            />
            <div className="space-y-1.5 text-[0.95rem] text-navy">
              <p>
                <strong>One layer:</strong> {s.w} × {s.d} = <strong>{s.perLayer}</strong> block
                {s.perLayer === 1 ? "" : "s"}
              </p>
              <p>
                <strong>Stack it {s.count} time{s.count === 1 ? "" : "s"}:</strong> {s.perLayer} × {s.count} ={" "}
                <strong>{s.blocks}</strong> blocks
              </p>
              {below ? (
                <p className="text-sm text-ink">
                  Put it on top of the {below.w} × {below.d} layer, right where the map shows. The dashed squares are the
                  layer underneath.
                </p>
              ) : (
                <p className="text-sm text-ink">Build this square right on the floor. It holds up the whole tower!</p>
              )}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[0.7rem] font-extrabold tracking-widest text-blueprint uppercase">
              Tick a box for every layer you finish
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {Array.from({ length: s.count }, (_, i) => (
                <span
                  key={i}
                  className="flex size-6 items-center justify-center rounded border-2 border-blueprint text-[0.6rem] font-bold text-blueprint/50"
                >
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-3 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">
            Tower so far: {s.heightAfter} block{s.heightAfter === 1 ? "" : "s"} tall · {s.blocksAfter} blocks used
          </p>
        </div>
        <div className="flex flex-col items-center">
          <IsoTower
            sections={bp.sections}
            variant="ink"
            highlight={s.index}
            className="h-[3.3in] w-auto"
            title={`Where step ${s.index + 1} goes`}
          />
          <span className="mt-1 text-[0.6rem] font-extrabold tracking-widest text-blueprint uppercase">This step</span>
        </div>
      </div>
    </div>
  );
}

function OriginalsView({ bp, files, keyParam }: { bp: Blueprint; files: OriginalFile[]; keyParam: string }) {
  const url = (f: OriginalFile, download = false) =>
    `/api/original/${bp.slug}/${f.id}?key=${encodeURIComponent(keyParam)}${download ? "&download=1" : ""}`;
  const images = files.filter((f) => f.mime.startsWith("image/"));
  const pdfs = files.filter((f) => f.mime === "application/pdf");
  return (
    <main className="print-root bg-[#e9eef6] py-6">
      <div className="no-print mx-auto mb-6 max-w-[8.5in] px-4">
        <div className="card flex flex-wrap items-center gap-4 p-5">
          <Image src="/brand/mark.png" alt="" width={400} height={270} className="h-12 w-auto" loading="eager" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl text-navy">Sawyer&apos;s original {bp.name} blueprint</p>
            <p className="text-sm text-ink">Made by Sawyer himself. Keep this link to print it again anytime.</p>
          </div>
          {images.length && !pdfs.length ? <PrintButton /> : null}
        </div>
        {pdfs.length ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {pdfs.map((f) => (
              <span key={f.id} className="flex flex-wrap gap-3">
                <a href={url(f)} target="_blank" rel="noopener" className="btn btn-sun">
                  🖨️ Open &amp; print{pdfs.length > 1 ? ` ${f.filename || "PDF"}` : ""}
                </a>
                <a href={url(f, true)} className="btn btn-white">
                  ⬇️ Download PDF
                </a>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {pdfs.map((f) => (
        <div key={f.id} className="no-print mx-auto mb-6 max-w-[8.5in] px-4">
          <object
            data={url(f)}
            type="application/pdf"
            className="h-[11in] w-full rounded-xl border-[3px] border-navy bg-white"
            aria-label={`${bp.name} original blueprint`}
          >
            <p className="p-6 text-center text-ink">
              Your browser can&apos;t show the PDF here.{" "}
              <a href={url(f)} className="font-bold text-brand underline">
                Open it in a new tab
              </a>
              .
            </p>
          </object>
        </div>
      ))}

      {images.map((f) => (
        <section key={f.id} className="sheet items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url(f)} alt={`${bp.name} original blueprint page`} className="max-h-[10in] max-w-full object-contain" />
        </section>
      ))}
    </main>
  );
}

export default async function PrintPage({ params, searchParams }: PageProps<"/print/[slug]">) {
  const { slug } = await params;
  const { key } = await searchParams;
  const keyParam = typeof key === "string" ? key : "";
  let bp = await getPrint(slug, keyParam);
  // Local development without a database: preview the seed blueprint.
  if (!bp && !dbReady() && process.env.NODE_ENV !== "production") {
    bp = SEED_BLUEPRINTS.find((b) => b.slug === slug) ?? null;
  }

  if (!bp) {
    return (
      <main className="bg-grid-light flex min-h-screen items-center justify-center p-6">
        <div className="card max-w-md p-8 text-center">
          <h1 className="font-display text-3xl text-navy">Hmm, this blueprint link doesn&apos;t work.</h1>
          <p className="mt-3 text-ink">
            Check that you copied the whole link from your email. Still stuck? Reply to that email and Sawyer&apos;s team
            will help.
          </p>
          <Link href="/blueprints" className="btn btn-sun mt-6">
            See the blueprints
          </Link>
        </div>
      </main>
    );
  }

  const originals = await getOriginals(bp.slug, keyParam);
  if (originals.length) return <OriginalsView bp={bp} files={originals} keyParam={keyParam} />;

  const stats = sectionStats(bp.sections);
  const t = towerTotals(bp.sections);
  const footprint = { w: t.footprintW, d: t.footprintD };
  const stepPages: SectionStats[][] = [];
  for (let i = 0; i < stats.length; i += 2) stepPages.push(stats.slice(i, i + 2));
  const pages = 2 + stepPages.length + 1;
  const tens = Math.floor(t.blocks / 10);
  const extra = t.blocks % 10;

  return (
    <main className="print-root bg-[#e9eef6] py-6">
      <div className="no-print mx-auto mb-6 flex max-w-[8.5in] flex-wrap items-center justify-between gap-4 px-4">
        <div>
          <p className="font-display text-2xl text-navy">Your official {bp.name} blueprint</p>
          <p className="text-sm text-ink">Prints on regular letter paper. Keep this link to print it again.</p>
        </div>
        <PrintButton />
      </div>

      {/* Cover */}
      <section className="sheet">
        <TitleBar bp={bp} page={1} pages={pages} />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm font-extrabold tracking-[0.3em] text-blueprint/70 uppercase">Official Blueprint</p>
          <h1 className="font-display text-6xl leading-none text-blueprint">{bp.name}</h1>
          <p className="mt-2 text-lg font-semibold text-ink">{bp.tagline}</p>
          <div className="mt-6 flex items-stretch gap-4">
            <IsoTower sections={bp.sections} variant="ink" className="h-[5.6in] w-auto" title={`${bp.name} drawing`} />
            <div className="flex flex-col items-center py-1">
              <span className="h-0.5 w-4 bg-blueprint" />
              <span className="w-0.5 flex-1 bg-blueprint" />
              <span className="my-2 font-display text-lg whitespace-nowrap text-blueprint [writing-mode:vertical-rl]">
                {t.height} blocks tall
              </span>
              <span className="w-0.5 flex-1 bg-blueprint" />
              <span className="h-0.5 w-4 bg-blueprint" />
            </div>
          </div>
        </div>
        <table className="title-block w-full text-left text-sm">
          <tbody>
            <tr>
              <th>{bp.designer ? "Designer" : "Architect"}</th>
              <td className="font-display text-lg">{bp.designer || "Sawyer (age 7)"}</td>
              <th>Blocks</th>
              <td className="font-display text-lg">{t.blocks}</td>
              <th>Height</th>
              <td className="font-display text-lg">{t.height}</td>
            </tr>
            <tr>
              <th>Base</th>
              <td>
                {t.footprintW} × {t.footprintD}
              </td>
              <th>Steps</th>
              <td>{stats.length}</td>
              <th>Level</th>
              <td>{difficultyLabel(bp.difficulty)}</td>
            </tr>
            <tr>
              <th>{bp.designer ? "Blueprint by" : "Inspired by"}</th>
              <td colSpan={3}>{bp.designer ? "Sawyer (age 7), Tower Blueprints for Kids" : bp.inspired_by || "Sawyer's imagination"}</td>
              <th>Scale</th>
              <td>1 block = 1 block</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Parts list */}
      <section className="sheet">
        <TitleBar bp={bp} page={2} pages={pages} />
        <h2 className="mt-5 font-display text-4xl text-blueprint">Parts list &amp; block math</h2>
        <p className="mt-1 text-ink">Before you build, make sure you have enough blocks. Here is the math!</p>
        <table className="parts mt-5 w-full text-left">
          <thead>
            <tr>
              <th>Step</th>
              <th>Part</th>
              <th>One layer</th>
              <th>Layers</th>
              <th className="text-right">Blocks</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.index}>
                <td className="font-display text-lg">{s.index + 1}</td>
                <td className="font-bold">{s.name}</td>
                <td>
                  {s.w} × {s.d} = {s.perLayer}
                </td>
                <td>× {s.count}</td>
                <td className="text-right font-display text-xl">{s.blocks}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="font-bold">
                Total: {stats.map((s) => s.blocks).join(" + ")} =
              </td>
              <td />
              <td className="text-right font-display text-3xl">{t.blocks}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border-[2.5px] border-blueprint p-4">
            <p className="font-display text-xl text-blueprint">How tall will it be?</p>
            <p className="mt-2 text-navy">
              {stats.map((s) => s.count).join(" + ")} = <strong className="font-display text-2xl">{t.height}</strong>{" "}
              blocks tall
            </p>
          </div>
          <div className="rounded-2xl border-[2.5px] border-blueprint p-4">
            <p className="font-display text-xl text-blueprint">Counting trick</p>
            <p className="mt-2 text-navy">
              Make piles of 10. You need <strong>{tens}</strong> pile{tens === 1 ? "" : "s"} of 10
              {extra ? (
                <>
                  {" "}
                  and <strong>{extra}</strong> extra
                </>
              ) : null}
              .
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {Array.from({ length: Math.min(tens, 60) }, (_, i) => (
                <span key={i} className="size-3.5 rounded-sm border-2 border-blueprint" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-ice p-4">
          <p className="font-display text-xl text-blueprint">Builder tips from Sawyer</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-navy">
            <li>Build on a hard, flat floor. Carpets make towers wobbly.</li>
            <li>Keep every layer lined up with the one below so the tower stays straight.</li>
            <li>The top gets wobbly. Go slow and ask a grown-up to help you reach.</li>
            <li>Any colors work. Mix them up and make it yours!</li>
          </ul>
        </div>
      </section>

      {/* Steps */}
      {stepPages.map((group, gi) => (
        <section key={gi} className="sheet">
          <TitleBar bp={bp} page={3 + gi} pages={pages} />
          <div className="mt-5 flex flex-1 flex-col gap-5">
            {group.map((s) => (
              <StepCard key={s.index} s={s} below={s.index > 0 ? stats[s.index - 1] : undefined} bp={bp} footprint={footprint} />
            ))}
          </div>
        </section>
      ))}

      {/* Certificate */}
      <section className="sheet">
        <div className="certificate flex flex-1 flex-col items-center justify-center rounded-3xl border-[6px] border-double border-blueprint p-10 text-center">
          <Image src="/brand/logo.png" alt="Tower Blueprints for Kids" width={900} height={948} className="h-36 w-auto" loading="eager" />
          <p className="mt-6 text-sm font-extrabold tracking-[0.35em] text-blueprint/70 uppercase">Certificate of</p>
          <h2 className="font-display text-6xl text-blueprint">Awesome Building</h2>
          <p className="mt-8 text-lg text-ink">This certifies that</p>
          <div className="mt-8 w-4/5 border-b-[3px] border-blueprint" />
          <p className="mt-2 text-xs font-extrabold tracking-widest text-blueprint/60 uppercase">Builder&apos;s name</p>
          <p className="mt-8 text-lg text-ink">built the</p>
          <p className="font-display text-5xl text-blueprint">{bp.name}</p>
          <p className="mt-2 font-bold text-navy">
            {t.blocks} blocks · {t.height} blocks tall
          </p>
          {bp.designer ? <p className="mt-1 text-ink">Designed by {bp.designer}</p> : null}
          <div className="mt-12 grid w-full grid-cols-2 gap-10">
            <div>
              <div className="h-10 border-b-[3px] border-blueprint" />
              <p className="mt-2 text-xs font-extrabold tracking-widest text-blueprint/60 uppercase">Date</p>
            </div>
            <div>
              <div className="flex h-10 items-end justify-center border-b-[3px] border-blueprint font-display text-3xl text-blueprint">
                Sawyer
              </div>
              <p className="mt-2 text-xs font-extrabold tracking-widest text-blueprint/60 uppercase">Chief Architect</p>
            </div>
          </div>
          <p className="mt-10 text-sm text-ink">Blueprint No. {pad3(bp.number)} · towerblueprintsforkids.com</p>
        </div>
      </section>
    </main>
  );
}
