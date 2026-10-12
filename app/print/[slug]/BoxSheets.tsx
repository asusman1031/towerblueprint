import Image from "next/image";
import BoxDrawing from "@/components/BoxDrawing";
import type { BoxDesign, BoxStats, BuiltBoxes } from "@/lib/boxes";
import type { Blueprint } from "@/lib/data";
import { difficultyLabel } from "@/lib/tower";
import { TitleBar } from "./sheets";

// The official blueprint pages for a cardboard box build (cover, box hunt, steps).
// The certificate and bonus pages come from the main print page.

export function boxStepPages(built: BuiltBoxes): BoxStats[][] {
  const pages: BoxStats[][] = [];
  for (let i = 0; i < built.boxes.length; i += 2) pages.push(built.boxes.slice(i, i + 2));
  return pages;
}

export function feet(n: number) {
  const whole = Math.floor(n);
  const half = n - whole >= 0.5;
  if (!whole) return "half a foot";
  return `${whole}${half ? "½" : ""} ${whole === 1 && !half ? "foot" : "feet"}`;
}

const inches = (b: BoxStats) => `${b.w} × ${b.d} × ${b.h} inches`;

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className="size-5 shrink-0 rounded border-2 border-blueprint" />
      <span>{children}</span>
    </li>
  );
}

function BoxStep({ box, built, boxes }: { box: BoxStats; built: BuiltBoxes; boxes: BoxDesign }) {
  const before = built.boxes.slice(0, box.index);
  const holder = box.inside ? before[before.length - 1] : undefined;
  // The box it stands on: the highest earlier box whose top is where this one starts.
  const under = before.filter((b) => b.top === box.z && !b.inside).pop();
  const soFar = Math.max(...built.boxes.slice(0, box.index + 1).map((b) => b.top));
  return (
    <div className="step-card rounded-2xl border-[2.5px] border-blueprint p-4">
      <div className="flex items-baseline gap-3">
        <span className="rounded-lg bg-blueprint px-2.5 py-1 font-display text-lg text-white">Step {box.index + 1}</span>
        <span className="font-display text-2xl text-blueprint">{box.label}</span>
        <span className="ml-auto font-display text-xl text-blueprint">1 box</span>
      </div>
      {box.note ? <p className="mt-2 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">{box.note}</p> : null}
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-4">
        <div>
          <p className="text-[0.95rem] text-navy">
            <strong>{box.size}</strong>, about {inches(box)}
          </p>
          <ul className="mt-2 space-y-1.5 text-[0.95rem] text-navy">
            {box.flaps === "floor" ? (
              <>
                <Check>Turn it upside down</Check>
                <Check>Spread all 4 flaps flat on the floor</Check>
              </>
            ) : null}
            {holder ? (
              <Check>Stand it inside {holder.label.replace(/^The /, "the ")}</Check>
            ) : under ? (
              <Check>Put it on top of {under.label.replace(/^The /, "the ")}, right in the middle</Check>
            ) : box.flaps !== "floor" ? (
              <Check>Put it on a flat floor</Check>
            ) : null}
            {box.flaps === "up" ? <Check>Open all 4 top flaps so they stick up</Check> : null}
            {box.flaps === "closed" ? <Check>Keep the flaps shut</Check> : null}
          </ul>
          <p className="mt-3 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">
            Tower so far: {box.index + 1} box{box.index ? "es" : ""}, about {soFar} inches tall
          </p>
        </div>
        <div className="flex flex-col items-center">
          <BoxDrawing
            boxes={boxes}
            highlight={box.index}
            className="h-[2.1in] w-auto max-w-[2.6in]"
            title={`Where step ${box.index + 1} goes`}
          />
          <span className="mt-1 text-[0.6rem] font-extrabold tracking-widest text-blueprint uppercase">This step</span>
        </div>
      </div>
    </div>
  );
}

export default function BoxSheets({
  bp,
  boxes,
  built,
  pages,
}: {
  bp: Blueprint;
  boxes: BoxDesign;
  built: BuiltBoxes;
  pages: number;
}) {
  const photos = [bp.photo_url, ...(boxes.photos ?? [])].filter((x): x is string => !!x && !x.startsWith("/api/"));
  const base = built.boxes[0];
  const spread = built.boxes.some((b) => b.flaps === "floor");
  const nested = built.boxes.some((b) => b.inside);
  return (
    <>
      {/* Cover */}
      <section className="sheet">
        <TitleBar bp={bp} page={1} pages={pages} />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm font-extrabold tracking-[0.3em] text-blueprint/70 uppercase">Official Blueprint</p>
          <h1 className="font-display text-6xl leading-none text-blueprint">{bp.name}</h1>
          <p className="mt-2 text-lg font-semibold text-ink">{bp.tagline}</p>
          <BoxDrawing boxes={boxes} className="mt-6 h-[3.6in] w-auto max-w-full" title={`${bp.name} drawing`} />
          {photos.length ? (
            <div className="mt-5 flex justify-center gap-4">
              {photos.slice(0, 2).map((src) => (
                <Image
                  key={src}
                  src={src}
                  alt={`${bp.name}, the real build`}
                  width={1200}
                  height={1400}
                  loading="eager"
                  className="h-[2.1in] w-auto rounded-xl border-[2.5px] border-blueprint"
                />
              ))}
            </div>
          ) : null}
        </div>
        <table className="title-block mt-4 w-full text-left text-sm">
          <tbody>
            <tr>
              <th>{bp.designer ? "Designer" : "Architect"}</th>
              <td className="font-display text-lg">{bp.designer || "Sawyer (age 7)"}</td>
              <th>Boxes</th>
              <td className="font-display text-lg">{built.count}</td>
              <th>Tall</th>
              <td className="font-display text-lg">About {feet(built.feet)}</td>
            </tr>
            <tr>
              <th>Base</th>
              <td>{base ? `${base.size}, about ${base.w} × ${base.d} inches` : ""}</td>
              <th>Steps</th>
              <td>{built.count}</td>
              <th>Level</th>
              <td>{difficultyLabel(bp.difficulty)}</td>
            </tr>
            <tr>
              <th>{bp.designer ? "Blueprint by" : "Inspired by"}</th>
              <td colSpan={3}>
                {bp.designer ? "Sawyer (age 7), Tower Blueprints for Kids" : bp.inspired_by || "Sawyer's imagination"}
              </td>
              <th>Pieces</th>
              <td>Cardboard boxes</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Box hunt */}
      <section className="sheet">
        <TitleBar bp={bp} page={2} pages={pages} />
        <h2 className="mt-5 font-display text-4xl text-blueprint">Box hunt &amp; flap math</h2>
        <p className="mt-1 text-ink">
          {boxes.need ? <strong>{boxes.need}. </strong> : null}
          Check the recycling bin! Sizes are just a guide: boxes close in shape work great.
        </p>
        <table className="parts mt-5 w-full text-left">
          <thead>
            <tr>
              <th>Step</th>
              <th>Box</th>
              <th>About how big</th>
              <th className="text-right">Found it?</th>
            </tr>
          </thead>
          <tbody>
            {built.boxes.map((b) => (
              <tr key={b.index}>
                <td className="font-display text-lg">{b.index + 1}</td>
                <td>
                  <span className="font-bold">{b.label}</span>
                  <span className="block text-sm text-ink">{b.size}</span>
                </td>
                <td>{inches(b)}</td>
                <td className="text-right">
                  <span className="inline-block size-6 rounded border-2 border-blueprint" />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="font-bold">
                Total boxes:
              </td>
              <td className="text-right font-display text-3xl">{built.count}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border-[2.5px] border-blueprint p-4">
            <p className="font-display text-xl text-blueprint">Flap math</p>
            <p className="mt-2 text-navy">
              Every box has <strong>4</strong> flaps. {built.count} boxes × 4 flaps = <strong>{built.flaps}</strong>{" "}
              flaps!
            </p>
          </div>
          <div className="rounded-2xl border-[2.5px] border-blueprint p-4">
            <p className="font-display text-xl text-blueprint">How tall?</p>
            <p className="mt-2 text-navy">
              About <strong>{built.inches}</strong> inches without the flaps. That&apos;s about{" "}
              <strong>{feet(built.feet)}</strong>, because 12 inches make 1 foot.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-ice p-4">
          <p className="font-display text-xl text-blueprint">Builder tips</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-navy">
            <li>Any boxes work. Put the biggest one at the bottom and smaller ones going up.</li>
            {spread ? (
              <li>Spreading the flaps flat on the floor makes the bottom wider, so the tower doesn&apos;t tip.</li>
            ) : null}
            {nested ? <li>The box that goes inside should fit with a little wiggle room.</li> : null}
            <li>Ask a grown-up to cut any tape. Never use a sharp knife yourself.</li>
            <li>When you&apos;re done playing, the boxes go back in the recycling!</li>
          </ul>
        </div>
      </section>

      {/* Steps */}
      {boxStepPages(built).map((group, gi) => (
        <section key={gi} className="sheet">
          <TitleBar bp={bp} page={3 + gi} pages={pages} />
          <div className="mt-5 flex flex-1 flex-col gap-5">
            {group.map((box) => (
              <BoxStep key={box.index} box={box} built={built} boxes={boxes} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
