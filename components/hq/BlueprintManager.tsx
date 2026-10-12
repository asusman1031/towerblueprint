"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setRequest } from "@/app/hq/actions";
import IsoTower from "@/components/IsoTower";
import { designTotals } from "@/lib/structure";
import { formatPrice } from "@/lib/tower";
import BlueprintEditor, { type EditorSeed } from "./BlueprintEditor";
import CopyButton from "./CopyButton";
import type { HqBlueprint, HqRequest } from "./types";

const STATUS_CHIP: Record<string, string> = {
  draft: "bg-white text-ink",
  coming_soon: "bg-tangerine text-white",
  live: "bg-[#22c063] text-white",
};
const STATUS_LABEL: Record<string, string> = { draft: "Secret draft", coming_soon: "Coming soon", live: "Live" };

const REQUEST_STATUS: { v: HqRequest["status"]; label: string }[] = [
  { v: "new", label: "🆕 New" },
  { v: "making", label: "🛠️ Making it" },
  { v: "done", label: "✅ Sent" },
  { v: "declined", label: "🙅 Can't do" },
];

type Editing = { id: string | "new"; seed?: EditorSeed; requestId?: number } | null;

export default function BlueprintManager({
  blueprints,
  requests,
  origin,
}: {
  blueprints: HqBlueprint[];
  requests: HqRequest[];
  origin: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const current = editing && editing.id !== "new" ? blueprints.find((b) => b.id === editing.id) : undefined;
  const printUrl = (bp: HqBlueprint) => (bp.print_key ? `${origin}/print/${bp.slug}?key=${bp.print_key}` : null);
  const own = blueprints.filter((b) => !b.designer);
  const custom = blueprints.filter((b) => b.designer);
  const openRequests = requests.filter((r) => r.status === "new" || r.status === "making");

  function card(bp: HqBlueprint) {
    const t = designTotals(bp);
    const link = printUrl(bp);
    return (
      <li key={bp.id} className="card flex gap-4 p-4">
        <div className="bg-grid-light flex w-24 shrink-0 items-end justify-center rounded-xl border-2 border-navy/20 p-2">
          <IsoTower
            sections={bp.sections}
            structure={bp.structure}
            tiles={bp.tiles}
            bricks={bp.bricks}
            boxes={bp.boxes}
            dice={bp.dice}
            className="h-36 w-auto max-w-full"
            title={bp.name}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm text-ink">No. {String(bp.number).padStart(3, "0")}</span>
            <span
              className={`rounded-full border-2 border-navy px-2 py-0.5 text-[0.7rem] font-extrabold uppercase ${STATUS_CHIP[bp.status]}`}
            >
              {STATUS_LABEL[bp.status]}
            </span>
            {bp.originals.length ? (
              <span className="rounded-full border-2 border-navy bg-sun px-2 py-0.5 text-[0.7rem] font-extrabold uppercase">
                Bonus file added
              </span>
            ) : null}
          </div>
          <h3 className="truncate font-display text-2xl text-navy">{bp.name}</h3>
          <p className="text-sm font-bold text-ink">
            {bp.designer ? `Designed by ${bp.designer} · ` : ""}
            {t.blocks} {t.unit} · {t.height} tall · {formatPrice(bp.price_cents)}
          </p>
          {!bp.designer || bp.status !== "draft" ? (
            <p className="mt-1 text-sm text-ink">
              👀 {bp.views} looks · 🛒 {bp.buy_clicks} buy clicks · 📝 {bp.preorders} reserved · 💰 {bp.sales} sold
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-sun btn-sm" onClick={() => setEditing({ id: bp.id })}>
              Edit
            </button>
            {bp.status !== "draft" ? (
              <Link href={`/blueprints/${bp.slug}`} className="btn btn-white btn-sm" target="_blank">
                View page
              </Link>
            ) : null}
            {link ? (
              <>
                <a href={link} className="btn btn-white btn-sm" target="_blank" rel="noopener">
                  Open blueprint
                </a>
                <CopyButton text={link} label="Copy blueprint link" />
              </>
            ) : null}
          </div>
        </div>
      </li>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-5">
        {editing ? (
          <BlueprintEditor
            key={`${editing.id}-${editing.requestId ?? ""}`}
            blueprint={current}
            blueprints={blueprints}
            seed={editing.seed}
            onDone={() => setEditing(null)}
            onSaved={async (id) => {
              if (editing.requestId) {
                await setRequest(editing.requestId, "making", id);
                router.refresh();
              }
            }}
          />
        ) : (
          <button type="button" className="btn btn-blue" onClick={() => setEditing({ id: "new" })}>
            ✏️ Design a new tower
          </button>
        )}
        <ul className="grid gap-4 md:grid-cols-2">{own.map(card)}</ul>
      </div>

      <div>
        <h2 className="font-display text-3xl text-navy">
          Design requests{" "}
          {openRequests.length ? (
            <span className="ml-1 rounded-full border-2 border-navy bg-tangerine px-2.5 py-0.5 align-middle text-base text-white">
              {openRequests.length} to do
            </span>
          ) : null}
        </h2>
        <p className="mb-4 text-ink">Builders who want you to make their tower into a blueprint.</p>
        {requests.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-navy/30 p-5 text-ink">
            No requests yet. When someone sends their tower, it shows up here.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {requests.map((r) => {
              const bp = r.blueprint_id ? blueprints.find((b) => b.id === r.blueprint_id) : undefined;
              const link = bp ? printUrl(bp) : null;
              return (
                <li key={r.id} className={`card p-4 ${r.status === "done" || r.status === "declined" ? "opacity-70" : ""}`}>
                  <div className="flex gap-4">
                    {r.has_photo ? (
                      <a href={`/hq/request-photo/${r.id}`} target="_blank" rel="noopener" className="shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/hq/request-photo/${r.id}`}
                          alt={`${r.tower_name || "Tower"} photo`}
                          className="h-32 w-24 rounded-xl border-2 border-navy object-cover"
                        />
                      </a>
                    ) : (
                      <div className="flex h-32 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-navy/30 text-xs font-bold text-ink">
                        No photo
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-2xl text-navy">{r.tower_name || "Untitled tower"}</h3>
                      <p className="text-sm font-bold text-ink">
                        {r.builder_name ? `by ${r.builder_name} · ` : ""}
                        {new Date(r.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          timeZone: "America/New_York",
                        })}
                      </p>
                      {r.description ? <p className="mt-2 text-sm whitespace-pre-line text-navy">{r.description}</p> : null}
                      <p className="mt-2 truncate text-xs text-ink">
                        Grown-up:{" "}
                        <a href={`mailto:${r.email}`} className="font-bold text-brand underline">
                          {r.email}
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {REQUEST_STATUS.map((s) => (
                      <button
                        key={s.v}
                        type="button"
                        aria-pressed={r.status === s.v}
                        onClick={async () => {
                          await setRequest(r.id, s.v);
                          router.refresh();
                        }}
                        className={`rounded-lg border-2 px-2 py-1 text-xs font-extrabold ${
                          r.status === s.v ? "border-navy bg-ice" : "border-navy/20 bg-white"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bp ? (
                      <>
                        <button type="button" className="btn btn-sun btn-sm" onClick={() => setEditing({ id: bp.id })}>
                          Edit blueprint
                        </button>
                        {link ? <CopyButton text={link} label="Copy link to send" /> : null}
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-blue btn-sm"
                        onClick={() =>
                          setEditing({
                            id: "new",
                            requestId: r.id,
                            seed: { name: r.tower_name, designer: r.builder_name || "A young builder", description: r.description },
                          })
                        }
                      >
                        📐 Make the blueprint
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {custom.length ? (
        <div>
          <h2 className="font-display text-2xl text-navy">Guest architects and custom blueprints</h2>
          <p className="mb-4 text-ink">
            Towers other builders designed. Secret drafts stay private (only the person with the link can open them). Set
            one to Live to put it in the shop.
          </p>
          <ul className="grid gap-4 md:grid-cols-2">{custom.map(card)}</ul>
        </div>
      ) : null}
    </div>
  );
}
