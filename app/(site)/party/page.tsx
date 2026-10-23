import type { Metadata } from "next";
import Link from "next/link";
import Track from "@/components/Track";
import { getSettings } from "@/lib/data";
import { formatPrice } from "@/lib/tower";

// Always read live data, so the price follows what HQ says.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Build-a-Tower Party",
  description:
    "A birthday party where every guest builds a tower and takes home an official blueprint of it as a party favor.",
};

const STEPS = [
  {
    color: "bg-sun",
    title: "Bring the blocks",
    body: "A few big bins of magnetic blocks is all you need. Most towers use between 50 and 300 blocks.",
  },
  {
    color: "bg-sky",
    title: "Everybody builds",
    body: "Guests build alone or in teams. Sawyer's tip: count the layers from the bottom up as you go.",
  },
  {
    color: "bg-tangerine",
    title: "Snap a photo of each tower",
    body: "Just the tower, no people in the picture. A few angles make the best blueprints.",
  },
  {
    color: "bg-[#22c063]",
    title: "Blueprints as favors",
    body: "Send the photos in afterward. Each guest's tower becomes an official blueprint with their name on it.",
  },
];

const CHECKLIST = [
  "Magnetic blocks, about 150 for each builder",
  "A clear floor or table for each tower",
  "A phone or camera for tower photos",
  "Paper and a pencil for sketching ideas first",
  "A grown-up who counts layers out loud",
  "A list of the guests' first names for the certificates",
];

export default async function PartyPage() {
  const settings = await getSettings();
  return (
    <>
      <Track />
      <section className="bg-grid-blue text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <span className="rounded-full border-2 border-navy bg-sun px-3 py-1 font-display text-navy">
            Birthday party idea
          </span>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] sm:text-6xl">Build-a-Tower Party</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-semibold text-ice">
            The party where everyone builds a giant tower and goes home with an official blueprint of it.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/your-design" className="btn btn-sun">
              Send in a tower
            </Link>
            <Link href="/blueprints" className="btn btn-white">
              Pick a blueprint to build
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-4xl text-navy sm:text-5xl">How a party works</h2>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card p-5">
              <span
                className={`${s.color} flex size-14 items-center justify-center rounded-xl border-[3px] border-navy font-display text-3xl text-navy shadow-[0_4px_0_#0b1f4d]`}
              >
                {i + 1}
              </span>
              <h3 className="mt-4 font-display text-2xl text-navy">{s.title}</h3>
              <p className="mt-1 text-ink">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-ice border-y-[3px] border-navy">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl text-navy sm:text-5xl">Two ways to play</h2>
            <div className="mt-6 space-y-5">
              <div className="card p-5">
                <h3 className="font-display text-2xl text-navy">Build from a blueprint</h3>
                <p className="mt-1 text-ink">
                  Pick an official blueprint that matches how many blocks you have, print it, and follow the layers
                  together. Great for a team build with the whole party.
                </p>
              </div>
              <div className="card p-5">
                <h3 className="font-display text-2xl text-navy">Free build, then blueprint it</h3>
                <p className="mt-1 text-ink">
                  Let everyone invent their own tower. Take a photo of each one, and each tower becomes its own
                  blueprint with the builder&apos;s name on the certificate. That&apos;s the favor.
                </p>
                <p className="mt-2 font-display text-xl text-brand">
                  {formatPrice(settings.customPriceCents)} per design
                </p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="font-display text-4xl text-navy sm:text-5xl">Party checklist</h2>
            <ul className="card mt-6 space-y-3 p-5 text-lg text-ink">
              {CHECKLIST.map((c) => (
                <li key={c} className="flex gap-3">
                  <span aria-hidden className="text-2xl">
                    ☐
                  </span>
                  <span className="font-semibold">{c}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink">
              Magnetic blocks are for kids of the right age. Keep an eye on little ones, like you would with any toy
              that has magnets in it.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-4xl text-navy sm:text-5xl">Ready to build?</h2>
        <p className="mt-3 text-lg text-ink">
          Send Sawyer the photos after the party. Each tower is its own design request, and the grown-up&apos;s email
          is how he sends the blueprint back. Then show it off on the{" "}
          <Link href="/wall" className="font-extrabold text-brand underline">
            Builder Wall
          </Link>
          .
        </p>
        <Link href="/your-design" className="btn btn-sun mt-6">
          Send Sawyer a tower
        </Link>
      </section>
    </>
  );
}
