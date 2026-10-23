import { setWallStatus } from "@/app/hq/actions";
import type { HqWallEntry } from "@/components/hq/types";

const BADGE: Record<HqWallEntry["status"], string> = {
  pending: "bg-sun text-navy",
  approved: "bg-[#22c063] text-white",
  rejected: "bg-ink/20 text-ink",
};

// Builder Wall entries. Look at each photo first: only the tower, never a child's face.
export default function WallReview({ entries }: { entries: HqWallEntry[] }) {
  if (!entries.length) return <p className="text-ink">Nothing sent yet. New towers will show up here for you to approve.</p>;
  const order = { pending: 0, approved: 1, rejected: 2 };
  const sorted = [...entries].sort((a, b) => order[a.status] - order[b.status] || b.id - a.id);
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {sorted.map((e) => (
        <li key={e.id} className="flex gap-3 rounded-2xl border-2 border-navy/20 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/hq/wall-photo/${e.id}`}
            alt={`${e.tower_name || "Tower"} by ${e.first_name}`}
            loading="lazy"
            className="h-32 w-28 shrink-0 rounded-lg border-2 border-navy object-cover"
          />
          <div className="min-w-0 flex-1 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-lg text-navy">
                {e.first_name}
                {e.age ? `, ${e.age}` : ""} · {e.state}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold uppercase ${BADGE[e.status]}`}>
                {e.status}
              </span>
            </div>
            {e.tower_name ? <p className="font-bold text-ink">{e.tower_name}</p> : null}
            {e.blurb ? <p className="text-ink">{e.blurb}</p> : null}
            <a href={`mailto:${e.parent_email}`} className="block truncate font-bold text-brand underline">
              {e.parent_email}
            </a>
            <div className="mt-2 flex flex-wrap gap-2">
              {e.status !== "approved" ? (
                <form action={setWallStatus.bind(null, e.id, "approved")}>
                  <button type="submit" className="btn btn-sun btn-sm">
                    Approve
                  </button>
                </form>
              ) : (
                <form action={setWallStatus.bind(null, e.id, "pending")}>
                  <button type="submit" className="btn btn-white btn-sm">
                    Hide
                  </button>
                </form>
              )}
              {e.status === "pending" ? (
                <form action={setWallStatus.bind(null, e.id, "rejected")}>
                  <button type="submit" className="btn btn-white btn-sm">
                    No thanks
                  </button>
                </form>
              ) : null}
              <form action={setWallStatus.bind(null, e.id, "delete")}>
                <button type="submit" className="btn btn-white btn-sm" aria-label="Delete this entry for good">
                  Delete
                </button>
              </form>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
