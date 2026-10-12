import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import IsoTower from "@/components/IsoTower";
import PlacementDiagram from "@/components/PlacementDiagram";
import PrintButton from "@/components/PrintButton";
import { getOriginals, getPrint, RENAMED_SLUGS, type Blueprint, type OriginalFile } from "@/lib/data";
import { buildBoxes } from "@/lib/boxes";
import { buildBricks } from "@/lib/bricks";
import { buildDice } from "@/lib/dice";
import { buildStructure } from "@/lib/structure";
import { buildTiles } from "@/lib/tiles";
import { difficultyLabel, sectionStats, theName, towerTotals, type SectionStats } from "@/lib/tower";
import BoxSheets, { boxStepPages, feet } from "./BoxSheets";
import BrickSheets, { brickStepPages } from "./BrickSheets";
import DiceSheets, { diceStepPages } from "./DiceSheets";
import { Certificate, CountingTrick, TickBoxes, TitleBar } from "./sheets";
import StructureSheets, { structureStepPages } from "./StructureSheets";
import TileSheets, { tileStepPages } from "./TileSheets";
import "./print.css";

export const metadata: Metadata = {
  title: "Official blueprint",
  robots: { index: false, follow: false },
};

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
              {below && (s.w > below.w || s.d > below.d) ? (
                <p className="text-sm text-ink">
                  This layer is wider than the {below.w} × {below.d} layer under it, so it sticks out. The dashed box shows
                  the layer underneath. The magnets hold the rest!
                </p>
              ) : below ? (
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
            <TickBoxes count={s.count} />
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

// Optional extras Sawyer adds in HQ, placed after the official blueprint.
function BonusOriginals({ bp, files, keyParam }: { bp: Blueprint; files: OriginalFile[]; keyParam: string }) {
  const url = (f: OriginalFile, download = false) =>
    `/api/original/${bp.slug}/${f.id}?key=${encodeURIComponent(keyParam)}${download ? "&download=1" : ""}`;
  const images = files.filter((f) => f.mime.startsWith("image/"));
  const pdfs = files.filter((f) => f.mime === "application/pdf");
  return (
    <>
      {pdfs.length ? (
        <div className="no-print mx-auto mb-6 max-w-[8.5in] px-4">
          <div className="card p-5">
            <p className="font-display text-xl text-navy">Bonus: Sawyer&apos;s original notes</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {pdfs.map((f) => (
                <a key={f.id} href={url(f, true)} className="btn btn-white btn-sm">
                  ⬇️ {f.filename || "Download PDF"}
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {images.map((f) => (
        <section key={f.id} className="sheet items-center justify-center">
          <p className="mb-3 text-xs font-extrabold tracking-[0.25em] text-blueprint/70 uppercase">
            Bonus: Sawyer&apos;s original
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url(f)} alt={`Sawyer's original ${bp.name} notes`} className="max-h-[9.6in] max-w-full object-contain" />
        </section>
      ))}
    </>
  );
}

export default async function PrintPage({ params, searchParams }: PageProps<"/print/[slug]">) {
  const { slug } = await params;
  const { key } = await searchParams;
  const keyParam = typeof key === "string" ? key : "";
  const bp = await getPrint(slug, keyParam);

  if (!bp && RENAMED_SLUGS[slug]) redirect(`/print/${RENAMED_SLUGS[slug]}?key=${encodeURIComponent(keyParam)}`);
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
  const bonusPages = originals.filter((f) => f.mime.startsWith("image/")).length;
  const header = (
    <div className="no-print mx-auto mb-6 flex max-w-[8.5in] flex-wrap items-center justify-between gap-4 px-4">
      <div>
        <p className="font-display text-2xl text-navy">Your official blueprint for {theName(bp.name)}</p>
        <p className="text-sm text-ink">
          To download it, click the button and choose &ldquo;Save as PDF.&rdquo; Keep this link to print it again.
        </p>
      </div>
      <PrintButton />
    </div>
  );

  if (bp.dice) {
    const built = buildDice(bp.dice);
    const pages = 2 + diceStepPages(built).length + 1 + bonusPages;
    return (
      <main className="print-root bg-[#e9eef6] py-6">
        {header}
        <DiceSheets bp={bp} dice={bp.dice} built={built} pages={pages} />
        <Certificate bp={bp} stats={`${built.count} dice · ${built.dots} dots facing out`} />
        {originals.length ? <BonusOriginals bp={bp} files={originals} keyParam={keyParam} /> : null}
      </main>
    );
  }

  if (bp.boxes) {
    const built = buildBoxes(bp.boxes);
    const pages = 2 + boxStepPages(built).length + 1 + bonusPages;
    return (
      <main className="print-root bg-[#e9eef6] py-6">
        {header}
        <BoxSheets bp={bp} boxes={bp.boxes} built={built} pages={pages} />
        <Certificate bp={bp} stats={`${built.count} boxes · about ${feet(built.feet)} tall`} />
        {originals.length ? <BonusOriginals bp={bp} files={originals} keyParam={keyParam} /> : null}
      </main>
    );
  }

  if (bp.bricks) {
    const built = buildBricks(bp.bricks);
    const pages = 2 + brickStepPages(built).length + 1 + bonusPages;
    return (
      <main className="print-root bg-[#e9eef6] py-6">
        {header}
        <BrickSheets bp={bp} bricks={bp.bricks} built={built} pages={pages} />
        <Certificate bp={bp} stats={`${built.count} bricks · ${built.tall} bricks tall`} />
        {originals.length ? <BonusOriginals bp={bp} files={originals} keyParam={keyParam} /> : null}
      </main>
    );
  }

  if (bp.tiles) {
    const built = buildTiles(bp.tiles);
    const pages = 2 + tileStepPages(built).length + 1 + bonusPages;
    return (
      <main className="print-root bg-[#e9eef6] py-6">
        {header}
        <TileSheets bp={bp} tiles={bp.tiles} built={built} pages={pages} />
        <Certificate bp={bp} stats={`${built.tiles} tiles · ${built.height} squares tall`} />
        {originals.length ? <BonusOriginals bp={bp} files={originals} keyParam={keyParam} /> : null}
      </main>
    );
  }

  if (bp.structure) {
    const built = buildStructure(bp.structure);
    const pages = 2 + structureStepPages(built).length + 1 + bonusPages;
    return (
      <main className="print-root bg-[#e9eef6] py-6">
        {header}
        <StructureSheets bp={bp} structure={bp.structure} built={built} pages={pages} />
        <Certificate bp={bp} stats={`${built.blocks} blocks · ${built.length} blocks long`} />
        {originals.length ? <BonusOriginals bp={bp} files={originals} keyParam={keyParam} /> : null}
      </main>
    );
  }

  const stats = sectionStats(bp.sections);
  const t = towerTotals(bp.sections);
  const footprint = { w: t.footprintW, d: t.footprintD };
  const stepPages: SectionStats[][] = [];
  for (let i = 0; i < stats.length; i += 2) stepPages.push(stats.slice(i, i + 2));
  const pages = 2 + stepPages.length + 1 + bonusPages;

  return (
    <main className="print-root bg-[#e9eef6] py-6">
      {header}

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
          <CountingTrick blocks={t.blocks} />
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

      <Certificate bp={bp} stats={`${t.blocks} blocks · ${t.height} blocks tall`} />

      {originals.length ? <BonusOriginals bp={bp} files={originals} keyParam={keyParam} /> : null}
    </main>
  );
}
