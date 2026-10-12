import Image from "next/image";
import PaperDrawing from "@/components/PaperDrawing";
import type { Blueprint } from "@/lib/data";
import type { BuiltPaper, PaperDesign, PaperStepStats } from "@/lib/paper";
import { difficultyLabel } from "@/lib/tower";
import { TickBoxes, TitleBar } from "./sheets";

// The official blueprint pages for a packing paper build (cover, making the rope
// and snake math, then a floor map for each step). The certificate and bonus
// pages come from the main print page.

export function paperStepPages(built: BuiltPaper): PaperStepStats[][] {
  const pages: PaperStepStats[][] = [];
  for (let i = 0; i < built.steps.length; i += 2) pages.push(built.steps.slice(i, i + 2));
  return pages;
}

const feetWord = (n: number) => `${n} ${n === 1 ? "foot" : "feet"}`;
// A rope with a head is a snake; any other paper build is just the rope.
export const ropeWord = (paper: PaperDesign) => (paper.face ? "snake" : "rope");
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className="size-5 shrink-0 rounded border-2 border-blueprint" />
      <span>{children}</span>
    </li>
  );
}

function PaperStep({ step, built, paper }: { step: PaperStepStats; built: BuiltPaper; paper: PaperDesign }) {
  const last = step.index === built.steps.length - 1;
  return (
    <div className="step-card rounded-2xl border-[2.5px] border-blueprint p-4">
      <div className="flex items-baseline gap-3">
        <span className="rounded-lg bg-blueprint px-2.5 py-1 font-display text-lg text-white">Step {step.index + 1}</span>
        <span className="font-display text-2xl text-blueprint">{step.label}</span>
        <span className="ml-auto font-display text-xl text-blueprint">About {feetWord(step.feet)}</span>
      </div>
      {step.note ? <p className="mt-2 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">{step.note}</p> : null}
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-4">
        <div>
          <ul className="space-y-1.5 text-[0.95rem] text-navy">
            <Check>
              {step.index === 0
                ? "Start at the dark dot, near the far end of your space"
                : `Start at the dark dot, where step ${step.index} ended`}
            </Check>
            <Check>Lay the rope along the brown part of the map</Check>
            <Check>Use about {feetWord(step.feet)} of rope</Check>
            {last && paper.face ? <Check>Fluff up the end so the head looks big</Check> : null}
          </ul>
          <p className="mt-3 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">
            {cap(ropeWord(paper))} so far: about {feetWord(step.soFar)}
            {step.index ? ` (${built.steps.slice(0, step.index + 1).map((s) => s.feet).join(" + ")})` : ""}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <PaperDrawing
            paper={paper}
            highlight={step.index}
            grid
            className="h-[2.7in] w-auto max-w-[2.6in]"
            title={`Where step ${step.index + 1} goes`}
          />
          <span className="mt-1 text-[0.6rem] font-extrabold tracking-widest text-blueprint uppercase">
            This step · 1 square = 1 foot
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PaperSheets({
  bp,
  paper,
  built,
  pages,
}: {
  bp: Blueprint;
  paper: PaperDesign;
  built: BuiltPaper;
  pages: number;
}) {
  const photos = [bp.photo_url, ...(paper.photos ?? [])].filter((x): x is string => !!x && !x.startsWith("/api/"));
  const kids = Math.max(1, Math.round(built.feet / 4));
  const thing = ropeWord(paper);
  return (
    <>
      {/* Cover */}
      <section className="sheet">
        <TitleBar bp={bp} page={1} pages={pages} />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm font-extrabold tracking-[0.3em] text-blueprint/70 uppercase">Official Blueprint</p>
          <h1 className="font-display text-6xl leading-none text-blueprint">{bp.name}</h1>
          <p className="mt-2 text-lg font-semibold text-ink">{bp.tagline}</p>
          <div className="mt-6 flex items-center justify-center gap-8">
            <PaperDrawing paper={paper} className="h-[4.4in] w-auto max-w-[3in]" title={`${bp.name} drawing`} />
            {photos.slice(0, 1).map((src) => (
              <Image
                key={src}
                src={src}
                alt={`${bp.name}, the real build`}
                width={1200}
                height={1400}
                loading="eager"
                className="h-[4.2in] w-auto rounded-xl border-[2.5px] border-blueprint"
              />
            ))}
          </div>
        </div>
        <table className="title-block mt-4 w-full text-left text-sm">
          <tbody>
            <tr>
              <th>{bp.designer ? "Designer" : "Architect"}</th>
              <td className="font-display text-lg">{bp.designer || "Sawyer (age 7)"}</td>
              <th>Long</th>
              <td className="font-display text-lg">About {feetWord(built.feet)}</td>
              <th>Paper</th>
              <td className="font-display text-lg">
                {built.sheets} {built.sheets === 1 ? "sheet" : "sheets"}
              </td>
            </tr>
            <tr>
              <th>Floor space</th>
              <td>
                {built.wide} × {built.deep} feet
              </td>
              <th>Steps</th>
              <td>{built.steps.length}</td>
              <th>Level</th>
              <td>{difficultyLabel(bp.difficulty)}</td>
            </tr>
            <tr>
              <th>{bp.designer ? "Blueprint by" : "Inspired by"}</th>
              <td colSpan={3}>
                {bp.designer ? "Sawyer (age 7), Tower Blueprints for Kids" : bp.inspired_by || "Sawyer's imagination"}
              </td>
              <th>Pieces</th>
              <td>Packing paper</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Making the rope */}
      <section className="sheet">
        <TitleBar bp={bp} page={2} pages={pages} />
        <h2 className="mt-5 font-display text-4xl text-blueprint">Paper hunt &amp; {thing} math</h2>
        <p className="mt-1 text-ink">
          {paper.need ? <strong>{paper.need}. </strong> : "Save the crinkly paper that comes stuffed in delivery boxes! "}
          Brown packing paper works best: it&apos;s strong and easy to scrunch.
        </p>

        <div className="mt-5 rounded-2xl border-[2.5px] border-blueprint p-4">
          <p className="font-display text-xl text-blueprint">Make the rope</p>
          <ol className="mt-2 list-decimal space-y-2 pl-6 text-navy">
            <li>
              Unfold the paper all the way. Tick a box for each {built.sheets === 1 ? "piece" : "sheet"}:
              <TickBoxes count={built.sheets} />
            </li>
            <li>Scrunch it the long way into a long, skinny rope, like squeezing a sausage.</li>
            {built.sheets > 1 ? <li>Overlap the ends of two pieces and twist them together tight.</li> : null}
            <li>Keep going until the rope is about as thick as a paper towel tube and about {feetWord(built.feet)} long.</li>
          </ol>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border-[2.5px] border-blueprint p-4">
            <p className="font-display text-xl text-blueprint">How long?</p>
            <p className="mt-2 text-navy">
              Add up the steps: {built.steps.map((s) => s.feet).join(" + ")} = <strong>{feetWord(built.feet)}</strong> of{" "}
              {thing}!
            </p>
          </div>
          <div className="rounded-2xl border-[2.5px] border-blueprint p-4">
            <p className="font-display text-xl text-blueprint">{cap(thing)} math</p>
            <p className="mt-2 text-navy">
              A 7-year-old is about 4 feet tall. So your {thing} is as long as about <strong>{kids}</strong>{" "}
              {kids === 1 ? "kid" : "kids"} lying head to toe ({built.feet} ÷ 4 ≈ {kids}).
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border-[2.5px] border-blueprint p-4">
          <p className="font-display text-xl text-blueprint">Challenge</p>
          <p className="mt-2 text-navy">
            Use the same rope to make something new: a heart, a letter S, or the first letter of your name!
          </p>
        </div>

        <div className="mt-4 rounded-2xl bg-ice p-4">
          <p className="font-display text-xl text-blueprint">Builder tips</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-navy">
            <li>
              Clear a space about {built.wide} × {built.deep} feet on a smooth floor, away from doorways so nobody trips.
            </li>
            <li>On the maps, 1 square = 1 foot. A bigger or smaller {thing} works too: just keep the same shape.</li>
            <li>Scrunch gently. Packing paper tears if you pull too hard.</li>
            <li>When you&apos;re done, the paper goes in the recycling, or save it for the next build!</li>
          </ul>
        </div>
      </section>

      {/* Steps */}
      {paperStepPages(built).map((group, gi) => (
        <section key={gi} className="sheet">
          <TitleBar bp={bp} page={3 + gi} pages={pages} />
          <div className="mt-5 flex flex-1 flex-col gap-5">
            {group.map((step) => (
              <PaperStep key={step.index} step={step} built={built} paper={paper} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
