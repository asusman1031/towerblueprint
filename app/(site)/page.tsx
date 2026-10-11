import Image from "next/image";
import Link from "next/link";
import BlueprintCard from "@/components/BlueprintCard";
import BlueprintPeek from "@/components/BlueprintPeek";
import BuildingTower from "@/components/BuildingTower";
import Photo from "@/components/Photo";
import SignupForm from "@/components/SignupForm";
import Track from "@/components/Track";
import { getArchitectNote, getBlueprints } from "@/lib/data";
import { towerTotals } from "@/lib/tower";

export const revalidate = 60;

const STEPS = [
  {
    n: 1,
    color: "bg-sun",
    title: "Pick a blueprint",
    body: "Every tower is designed and tested by Sawyer. Choose one that matches how many blocks you have.",
  },
  {
    n: 2,
    color: "bg-sky",
    title: "Count your blocks",
    body: "The parts list tells you exactly how many blocks you need. Counting is part of the fun!",
  },
  {
    n: 3,
    color: "bg-tangerine",
    title: "Build layer by layer",
    body: "Each step shows a map of one layer from the top, and how many times to stack it.",
  },
  {
    n: 4,
    color: "bg-[#22c063]",
    title: "Show it off",
    body: "Fill in your “I built it!” certificate and snap a photo of your giant tower.",
  },
];

export default async function Home() {
  const [blueprints, note] = await Promise.all([getBlueprints(), getArchitectNote()]);
  const featured = blueprints.find((b) => b.status === "live") ?? blueprints[0];
  const featuredTotals = featured ? towerTotals(featured.sections) : null;
  const biggest = Math.max(0, ...blueprints.map((b) => towerTotals(b.sections).blocks));
  const tallest = Math.max(0, ...blueprints.map((b) => towerTotals(b.sections).height));

  return (
    <>
      <Track />

      {/* Hero */}
      <section className="bg-grid-blue overflow-hidden text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-16">
          <div>
            <Image
              src="/brand/logo.png"
              alt="Tower Blueprints for Kids"
              width={900}
              height={948}
              priority
              className="mx-auto h-auto w-64 drop-shadow-xl sm:w-72 md:mx-0"
            />
            <h1 className="mt-6 text-center font-display text-4xl leading-[1.05] sm:text-5xl md:text-left md:text-6xl">
              Build giant towers.
              <br />
              <span className="text-sun">One layer at a time.</span>
            </h1>
            <p className="mt-4 text-center text-lg font-semibold text-ice md:text-left">
              Official step-by-step blueprints for magnetic block towers, designed and tested by Sawyer, age 7.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link href="/blueprints" className="btn btn-sun">
                See the blueprints
              </Link>
              <Link href="#how-it-works" className="btn btn-white">
                How it works
              </Link>
            </div>
          </div>

          {featured && featuredTotals ? (
            <div className="relative">
              <div className="rounded-[2rem] border-[3px] border-navy bg-white p-5 text-navy shadow-[0_8px_0_#0b1f4d]">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border-2 border-navy bg-sun px-3 py-0.5 font-display text-sm">
                    Blueprint No. {String(featured.number).padStart(3, "0")}
                  </span>
                  <span className="font-display text-lg text-brand">{featured.name}</span>
                </div>
                <div className="bg-grid-light mt-4 grid grid-cols-2 items-end gap-3 rounded-2xl border-2 border-navy/20 p-4">
                  <figure className="flex flex-col items-center">
                    {featured.photo_url ? (
                      <Photo
                        src={featured.photo_url}
                        alt={`Sawyer's real ${featured.name}, built from magnetic blocks`}
                        className="h-80 w-40 rounded-xl border-[3px] border-navy object-cover sm:h-96 sm:w-48"
                      />
                    ) : null}
                    <figcaption className="mt-2 text-xs font-extrabold tracking-wider text-ink uppercase">
                      Sawyer&apos;s real build
                    </figcaption>
                  </figure>
                  <figure className="flex flex-col items-center">
                    <div className="flex items-stretch gap-2">
                      <BuildingTower
                        sections={featured.sections}
                        className="h-72 w-auto sm:h-[22rem]"
                        title={`${featured.name}, ${featuredTotals.blocks} blocks`}
                      />
                    </div>
                    <figcaption className="mt-2 text-xs font-extrabold tracking-wider text-ink uppercase">
                      The blueprint
                    </figcaption>
                  </figure>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl bg-ice p-2">
                    <div className="font-display text-3xl text-navy">{featuredTotals.blocks}</div>
                    <div className="text-xs font-extrabold tracking-wider text-ink uppercase">blocks</div>
                  </div>
                  <div className="rounded-xl bg-ice p-2">
                    <div className="font-display text-3xl text-navy">{featuredTotals.height}</div>
                    <div className="text-xs font-extrabold tracking-wider text-ink uppercase">blocks tall</div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-grid-light scroll-mt-20 border-y-[3px] border-navy">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-4xl text-navy sm:text-5xl">How it works</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-lg text-ink">
            Grab a bin of magnetic building blocks. The blueprint does the rest.
          </p>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="card p-5">
                <span
                  className={`${s.color} flex size-14 items-center justify-center rounded-xl border-[3px] border-navy font-display text-3xl text-navy shadow-[0_4px_0_#0b1f4d]`}
                >
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-2xl text-navy">{s.title}</h3>
                <p className="mt-1 text-ink">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Blueprints */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl text-navy sm:text-5xl">The blueprints</h2>
            <p className="mt-2 text-lg text-ink">Every one built for real, by Sawyer, before it goes on sale.</p>
          </div>
          <Link href="/blueprints" className="btn btn-white btn-sm">
            See all →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blueprints.slice(0, 3).map((bp) => (
            <BlueprintCard key={bp.id} bp={bp} />
          ))}
          <div className="flex flex-col items-center justify-center rounded-[1.5rem] border-[3px] border-dashed border-navy/40 p-8 text-center">
            <span className="font-display text-6xl text-navy/30">?</span>
            <p className="mt-2 font-display text-2xl text-navy">Next blueprint</p>
            <p className="mt-1 text-ink">Sawyer is designing it right now. Join the club to see it first.</p>
          </div>
        </div>
      </section>

      {/* What's inside */}
      {featured ? (
        <section className="bg-ice overflow-x-clip border-y-[3px] border-navy">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2">
            <div>
              <h2 className="font-display text-4xl text-navy sm:text-5xl">What&apos;s in an official blueprint?</h2>
              <ul className="mt-6 space-y-4 text-lg text-ink">
                {[
                  ["📐", "A cover drawing of the whole tower"],
                  ["🧮", "A parts list with the block math worked out"],
                  ["🗺️", "A top-down map of every layer, step by step"],
                  ["📏", "A height chart so you know how tall you're getting"],
                  ["🏆", "An “I built it!” certificate signed by the architect"],
                ].map(([icon, text]) => (
                  <li key={text} className="flex gap-3">
                    <span className="text-2xl" aria-hidden>
                      {icon}
                    </span>
                    <span className="font-semibold">{text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-ink">Print it at home on regular paper. Build it as many times as you want.</p>
            </div>
            <BlueprintPeek sections={featured.sections} name={featured.name} number={featured.number} />
          </div>
        </section>
      ) : null}

      {/* The architect */}
      <section id="architect" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
          <div className="card relative p-7 sm:p-9">
            <span className="absolute -top-5 left-7 rounded-full border-[3px] border-navy bg-sun px-4 py-1 font-display text-lg">
              Meet the architect
            </span>
            <p className="mt-3 text-xl leading-relaxed font-semibold whitespace-pre-line text-navy sm:text-2xl">
              &ldquo;{note}&rdquo;
            </p>
            <p className="mt-5 font-display text-2xl text-brand">— Sawyer, Chief Architect</p>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {[
              [String(blueprints.filter((b) => b.status === "live").length), "blueprints published"],
              [String(biggest), "blocks in the biggest tower"],
              [String(tallest), "blocks tall (tallest tower)"],
              ["7", "years old, the architect"],
            ].map(([n, label]) => (
              <div key={label} className="rounded-2xl border-[3px] border-navy bg-white p-4 text-center">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-4xl text-brand">{n}</dd>
                <dd className="mt-1 text-sm font-extrabold text-ink">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Builders club */}
      <section id="club" className="bg-grid-blue scroll-mt-20 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl">Join the Builders Club</h2>
            <p className="mt-3 text-lg text-ice">
              Get an email when Sawyer drops a new tower blueprint. No spam, just towers.
            </p>
          </div>
          <div className="rounded-[1.5rem] border-[3px] border-navy bg-blueprint-deep/60 p-6">
            <SignupForm kind="club" cta="Join the club" dark />
          </div>
        </div>
      </section>
    </>
  );
}
