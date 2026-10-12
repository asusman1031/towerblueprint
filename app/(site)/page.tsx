import Image from "next/image";
import Link from "next/link";
import BlueprintCard from "@/components/BlueprintCard";
import BlueprintPeek from "@/components/BlueprintPeek";
import BuildingTower from "@/components/BuildingTower";
import CoverPreview from "@/components/CoverPreview";
import Photo from "@/components/Photo";
import SignupForm from "@/components/SignupForm";
import Track from "@/components/Track";
import { getBlueprints, getSettings } from "@/lib/data";
import { designTotals } from "@/lib/structure";
import { formatPrice, SAMPLE_CUSTOM_TOWER, theName } from "@/lib/tower";

// Always read live data, so changes from HQ or the database show up right away.
export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: 1,
    color: "bg-sun",
    title: "Pick a blueprint",
    body: "Every tower is designed, built, and tested by Sawyer. Choose one that matches how many blocks you have.",
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
  const [blueprints, settings] = await Promise.all([getBlueprints(), getSettings()]);
  const note = settings.architectNote;
  // The hero shows a tall tower next to its photo, so feature a tower when there is one.
  const featured =
    blueprints.find((b) => b.status === "live" && !b.structure && !b.tiles) ??
    blueprints.find((b) => b.status === "live") ??
    blueprints[0];
  const featuredTotals = featured ? designTotals(featured) : null;
  // Block stats only; tile builds count tiles, not blocks.
  const blockBuilds = blueprints.filter((b) => !b.tiles);
  const biggest = Math.max(0, ...blockBuilds.map((b) => designTotals(b).blocks));
  const tallest = Math.max(0, ...blockBuilds.map((b) => designTotals(b).height));

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
              Official step-by-step blueprints for giant magnetic block towers, designed and built by Sawyer, age 7.
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
                        alt={`${featured.name}, built from magnetic blocks`}
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
                        structure={featured.structure}
                        tiles={featured.tiles}
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
            <p className="mt-2 text-lg text-ink">The newest ones. Every one is built for real before it goes on sale.</p>
          </div>
          <Link href="/blueprints" className="btn btn-white btn-sm">
            See all →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* The newest three; the full list is one click away. */}
          {[...blueprints]
            .sort((a, b) => b.number - a.number)
            .slice(0, 3)
            .map((bp) => (
              <BlueprintCard key={bp.id} bp={bp} />
            ))}
          {/* Fills the row until there are three blueprints to show. */}
          {blueprints.length < 3 ? (
            <div className="flex flex-col items-center justify-center rounded-[1.5rem] border-[3px] border-dashed border-navy/40 p-8 text-center">
              <span className="font-display text-6xl text-navy/30">?</span>
              <p className="mt-2 font-display text-2xl text-navy">Next blueprint</p>
              <p className="mt-1 text-ink">Sawyer is designing it right now. Join the club to see it first.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* What's inside */}
      {featured ? (
        <section className="bg-ice overflow-x-clip border-y-[3px] border-navy">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2">
            <div>
              <h2 className="font-display text-4xl text-navy sm:text-5xl">What&apos;s in an official blueprint?</h2>
              <p className="mt-4 text-lg text-ink">
                Sawyer designs and builds every tower for real. Then it becomes a blueprint you can follow, one layer at
                a time.
              </p>
              <ul className="mt-6 space-y-4 text-lg text-ink">
                {[
                  ["📐", "A cover drawing of the whole tower"],
                  ["🧮", "A parts list with the block math worked out"],
                  ["🗺️", "A top-down map of every layer, step by step"],
                  ["✅", "Tick boxes so you never lose your place"],
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
              <p className="mt-6 text-ink">Print it at home or save it as a PDF. Build it as many times as you want.</p>
              <Link href={`/blueprints/${featured.slug}`} className="btn btn-sun mt-6">
                Get {theName(featured.name)} blueprint
              </Link>
            </div>
            <CoverPreview
              sections={featured.sections}
              structure={featured.structure}
              tiles={featured.tiles}
              name={featured.name}
              number={featured.number}
            />
          </div>
        </section>
      ) : null}

      {/* Custom design service */}
      <section className="bg-grid-blue overflow-x-clip text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <BlueprintPeek sections={SAMPLE_CUSTOM_TOWER.sections} name={SAMPLE_CUSTOM_TOWER.name} badge="Sample" />
          </div>
          <div className="order-1 md:order-2">
            <span className="rounded-full border-2 border-navy bg-sun px-3 py-1 font-display text-navy">
              Got your own tower?
            </span>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl">
              Sawyer will make your design a blueprint too!
            </h2>
            <p className="mt-4 text-lg text-ice">
              Send Sawyer a photo of your tower and how you built it. He&apos;ll turn it into an official blueprint
              with a drawing of your tower, the block math, a map of every layer, and an &ldquo;I built it!&rdquo;
              certificate with your name on it.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link href="/your-design" className="btn btn-sun">
                Send Sawyer your tower
              </Link>
              <span className="font-display text-xl">{formatPrice(settings.customPriceCents)}</span>
            </div>
          </div>
        </div>
      </section>

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
