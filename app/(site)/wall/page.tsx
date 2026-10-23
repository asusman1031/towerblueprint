import type { Metadata } from "next";
import Link from "next/link";
import Photo from "@/components/Photo";
import Track from "@/components/Track";
import WallForm from "@/components/WallForm";
import { getBlueprints, getWallEntries } from "@/lib/data";
import { isCutout } from "@/lib/kind";

// Always read live data, so approved entries show up right away.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Builder Wall",
  description: "Young architects from all over show off the towers they built.",
};

export default async function WallPage() {
  const [blueprints, entries] = await Promise.all([getBlueprints(), getWallEntries()]);
  // The wall opens with the founders' own towers.
  const founders = [
    { slug: "menorah-tower", who: "Sawyer", role: "Chief Architect" },
    { slug: "pyramid-and-tsunami", who: "Ashton", role: "Guest architect" },
  ].flatMap((f) => {
    const bp = blueprints.find((b) => b.slug === f.slug);
    return bp?.photo_url ? [{ ...f, bp }] : [];
  });

  return (
    <div className="bg-grid-light min-h-[60vh]">
      <Track />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h1 className="font-display text-5xl text-navy sm:text-6xl">The Builder Wall</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink">
          Young architects from all over show off the towers they built. Want your tower up here? A grown-up can send
          it in below.
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {entries.map((e) => (
            <li key={e.id} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/wall-photo/${e.id}`}
                alt={`${e.tower_name || "A tower"} built by ${e.first_name}`}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full border-b-[3px] border-navy object-cover"
              />
              <div className="p-4">
                <p className="font-display text-xl text-navy">
                  {e.first_name}
                  {e.age ? `, ${e.age}` : ""}
                </p>
                <p className="text-sm font-extrabold text-brand">{e.state}</p>
                {e.tower_name ? <p className="mt-1 font-bold text-ink">{e.tower_name}</p> : null}
                {e.blurb ? <p className="text-sm text-ink">{e.blurb}</p> : null}
              </div>
            </li>
          ))}
          {founders.map(({ bp, who, role }) => (
            <li key={bp.slug} className="card overflow-hidden">
              <Link href={`/blueprints/${bp.slug}`} className="block">
                <div className="bg-grid-light aspect-[4/5] border-b-[3px] border-navy">
                  <Photo
                    src={bp.photo_url!}
                    alt={`${bp.name}, built by ${who}`}
                    width={800}
                    height={1000}
                    sizes="(max-width: 768px) 50vw, 280px"
                    className={`h-full w-full ${isCutout(bp.photo_url) ? "object-contain p-3" : "object-cover"}`}
                  />
                </div>
                <div className="p-4">
                  <p className="font-display text-xl text-navy">{who}</p>
                  <p className="text-sm font-extrabold text-brand">{role}</p>
                  <p className="mt-1 font-bold text-ink">{bp.name}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <section id="send" className="card mt-14 scroll-mt-24 p-6 sm:p-8">
          <h2 className="font-display text-3xl text-navy sm:text-4xl">Put your tower on the wall</h2>
          <p className="mt-2 max-w-2xl text-ink">
            Only a grown-up can send a tower in. We show the builder&apos;s first name, age and state, plus the tower
            photo, and nothing else. Sawyer&apos;s team looks at every entry before it goes up.
          </p>
          <div className="mt-6">
            <WallForm />
          </div>
        </section>
      </div>
    </div>
  );
}
