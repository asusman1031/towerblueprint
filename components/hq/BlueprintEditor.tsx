"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveBlueprint, uploadPhoto } from "@/app/hq/actions";
import IsoTower from "@/components/IsoTower";
import { MAX_LAYERS, MAX_SIDE, sectionStats, towerTotals, type Section } from "@/lib/tower";
import type { HqBlueprint } from "./types";

type Draft = {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  inspired_by: string;
  fun_fact: string;
  sections: Section[];
  difficulty: number;
  price: string;
  checkout_url: string;
  status: "draft" | "coming_soon" | "live";
};

const STATUS = [
  { v: "draft", label: "🤫 Secret draft", hint: "Only you can see it" },
  { v: "coming_soon", label: "👀 Coming soon", hint: "People can see it and sign up" },
  { v: "live", label: "🚀 Live!", hint: "People can get the blueprint" },
] as const;

function toDraft(bp?: HqBlueprint): Draft {
  if (!bp) {
    return {
      slug: "",
      name: "",
      tagline: "",
      description: "",
      inspired_by: "",
      fun_fact: "",
      sections: [
        { w: 4, d: 4, count: 5 },
        { w: 2, d: 2, count: 8 },
        { w: 1, d: 1, count: 10 },
      ],
      difficulty: 2,
      price: "5",
      checkout_url: "",
      status: "draft",
    };
  }
  return {
    id: bp.id,
    slug: bp.slug,
    name: bp.name,
    tagline: bp.tagline,
    description: bp.description,
    inspired_by: bp.inspired_by,
    fun_fact: bp.fun_fact,
    sections: bp.sections,
    difficulty: bp.difficulty,
    price: (bp.price_cents / 100).toString(),
    checkout_url: bp.checkout_url ?? "",
    status: bp.status,
  };
}

function Stepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <button
        type="button"
        className="size-8 rounded-lg border-2 border-navy bg-white font-display text-lg leading-none"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label={`Less ${label}`}
      >
        −
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Math.round(Number(e.target.value) || min))))}
        className="field !w-14 !px-1 !py-1 text-center font-display text-lg"
        aria-label={label}
      />
      <button
        type="button"
        className="size-8 rounded-lg border-2 border-navy bg-white font-display text-lg leading-none"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label={`More ${label}`}
      >
        +
      </button>
    </div>
  );
}

async function resizeImage(file: File): Promise<{ mime: string; b64: string }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, 1400 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    return { mime: "image/jpeg", b64: dataUrl.split(",")[1] };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function BlueprintEditor({ blueprint, onDone }: { blueprint?: HqBlueprint; onDone: () => void }) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(() => toDraft(blueprint));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [photoMsg, setPhotoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const setSection = (i: number, patch: Partial<Section>) =>
    setD((p) => ({ ...p, sections: p.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));
  const moveSection = (i: number, dir: -1 | 1) =>
    setD((p) => {
      const next = [...p.sections];
      const j = i + dir;
      if (j < 0 || j >= next.length) return p;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...p, sections: next };
    });

  const stats = sectionStats(d.sections);
  const totals = towerTotals(d.sections);

  function save() {
    setMsg(null);
    start(async () => {
      const res = await saveBlueprint({
        id: d.id,
        slug: d.slug,
        name: d.name,
        tagline: d.tagline,
        description: d.description,
        inspired_by: d.inspired_by,
        fun_fact: d.fun_fact,
        sections: d.sections,
        difficulty: d.difficulty,
        price_cents: Math.round(Number(d.price) * 100),
        checkout_url: d.checkout_url,
        status: d.status,
      });
      setMsg({ ok: res.ok, text: res.message });
      if (res.ok) {
        setD((p) => ({ ...p, id: res.id, slug: res.slug ?? p.slug }));
        router.refresh();
      }
    });
  }

  async function onPhoto(file: File | undefined) {
    if (!file || !d.slug) return;
    setUploading(true);
    setPhotoMsg(null);
    try {
      const { mime, b64 } = await resizeImage(file);
      const res = await uploadPhoto(d.slug, mime, b64);
      setPhotoMsg({ ok: res.ok, text: res.message });
      if (res.ok) router.refresh();
    } catch {
      setPhotoMsg({ ok: false, text: "Couldn't read that photo." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b-[3px] border-navy bg-sun px-5 py-3">
        <h3 className="font-display text-2xl text-navy">{d.id ? `Edit: ${d.name || "Tower"}` : "Design a new tower"}</h3>
        <button type="button" onClick={onDone} className="btn btn-white btn-sm">
          Close
        </button>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <div>
            <label className="label" htmlFor="bp-name">
              Tower name
            </label>
            <input
              id="bp-name"
              className="field font-display text-2xl"
              value={d.name}
              maxLength={80}
              placeholder="e.g. Burj Khalifa"
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div>
            <span className="label">Who can see it?</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {STATUS.map((s) => (
                <button
                  key={s.v}
                  type="button"
                  onClick={() => set("status", s.v)}
                  className={`rounded-xl border-[3px] p-2 text-left ${
                    d.status === s.v ? "border-navy bg-ice" : "border-navy/20 bg-white"
                  }`}
                  aria-pressed={d.status === s.v}
                >
                  <span className="block font-display text-lg">{s.label}</span>
                  <span className="text-xs font-semibold text-ink">{s.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label">Sections (bottom first)</span>
            <ol className="space-y-2">
              {d.sections.map((s, i) => (
                <li key={i} className="rounded-xl border-2 border-navy/25 bg-paper p-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="font-display text-lg text-brand">#{i + 1}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-ink uppercase">Wide</span>
                      <Stepper label="wide" value={s.w} min={1} max={MAX_SIDE} onChange={(n) => setSection(i, { w: n })} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-ink uppercase">Deep</span>
                      <Stepper label="deep" value={s.d} min={1} max={MAX_SIDE} onChange={(n) => setSection(i, { d: n })} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-ink uppercase">Layers</span>
                      <Stepper
                        label="layers"
                        value={s.count}
                        min={1}
                        max={MAX_LAYERS}
                        onChange={(n) => setSection(i, { count: n })}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      className="field !w-auto flex-1 !py-1.5 text-sm"
                      placeholder={`Name this part (optional), e.g. ${stats[i]?.name ?? "The Base"}`}
                      value={s.label ?? ""}
                      maxLength={40}
                      onChange={(e) => setSection(i, { label: e.target.value })}
                      aria-label={`Name for section ${i + 1}`}
                    />
                    <span className="text-sm font-bold text-ink">
                      {s.w}×{s.d}×{s.count} = <span className="font-display text-base text-navy">{s.w * s.d * s.count}</span>
                    </span>
                    <div className="ml-auto flex gap-1">
                      <button type="button" className="btn btn-white btn-sm !px-2" onClick={() => moveSection(i, -1)} aria-label="Move down">
                        ↓
                      </button>
                      <button type="button" className="btn btn-white btn-sm !px-2" onClick={() => moveSection(i, 1)} aria-label="Move up">
                        ↑
                      </button>
                      <button
                        type="button"
                        className="btn btn-white btn-sm !px-2"
                        disabled={d.sections.length <= 1}
                        onClick={() => setD((p) => ({ ...p, sections: p.sections.filter((_, j) => j !== i) }))}
                        aria-label="Remove section"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="btn btn-blue btn-sm mt-3"
              disabled={d.sections.length >= 20}
              onClick={() =>
                setD((p) => {
                  const top = p.sections[p.sections.length - 1] ?? { w: 3, d: 3, count: 3 };
                  return {
                    ...p,
                    sections: [...p.sections, { w: Math.max(1, top.w - 1), d: Math.max(1, top.d - 1), count: 5 }],
                  };
                })
              }
            >
              + Add a section on top
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="bp-tagline">
                One-line description
              </label>
              <input
                id="bp-tagline"
                className="field"
                value={d.tagline}
                maxLength={160}
                placeholder="A super-skinny supertall that goes up, up, up."
                onChange={(e) => set("tagline", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="bp-desc">
                Tell builders about it
              </label>
              <textarea
                id="bp-desc"
                className="field"
                rows={3}
                maxLength={2000}
                value={d.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="bp-inspired">
                Real building it&apos;s based on
              </label>
              <input
                id="bp-inspired"
                className="field"
                value={d.inspired_by}
                maxLength={120}
                placeholder="e.g. Burj Khalifa, Dubai"
                onChange={(e) => set("inspired_by", e.target.value)}
              />
            </div>
            <div>
              <span className="label">How hard?</span>
              <div className="flex gap-2">
                {["Easy", "Medium", "Expert"].map((l, i) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => set("difficulty", i + 1)}
                    aria-pressed={d.difficulty === i + 1}
                    className={`flex-1 rounded-xl border-[3px] px-2 py-2 font-display ${
                      d.difficulty === i + 1 ? "border-navy bg-ice" : "border-navy/20 bg-white"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="bp-fact">
                Fun fact about the real building
              </label>
              <textarea
                id="bp-fact"
                className="field"
                rows={2}
                maxLength={600}
                value={d.fun_fact}
                onChange={(e) => set("fun_fact", e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="bp-price">
                Price (dollars)
              </label>
              <input
                id="bp-price"
                type="number"
                min="0"
                step="0.5"
                className="field font-display text-xl"
                value={d.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="bp-checkout">
                Checkout link (grown-ups)
              </label>
              <input
                id="bp-checkout"
                className="field text-sm"
                value={d.checkout_url}
                placeholder="https://buy.stripe.com/…"
                onChange={(e) => set("checkout_url", e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl border-2 border-dashed border-navy/30 p-4">
            <span className="label">Photo of the real build</span>
            {d.id && d.slug ? (
              <div className="flex flex-wrap items-center gap-3">
                <label className="btn btn-white btn-sm cursor-pointer">
                  {uploading ? "Uploading…" : "📸 Choose a photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(e) => onPhoto(e.target.files?.[0])}
                  />
                </label>
                {photoMsg ? (
                  <span className={`text-sm font-bold ${photoMsg.ok ? "text-[#15803d]" : "text-[#c2410c]"}`}>
                    {photoMsg.text}
                  </span>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-ink">Save your tower first, then you can add a photo.</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-sun" onClick={save} disabled={pending}>
              {pending ? "Saving…" : "💾 Save tower"}
            </button>
            {msg ? (
              <span role="status" className={`font-bold ${msg.ok ? "text-[#15803d]" : "text-[#c2410c]"}`}>
                {msg.text}
              </span>
            ) : null}
          </div>
        </div>

        <aside className="bg-grid-light flex flex-col items-center rounded-2xl border-2 border-navy/20 p-4 lg:sticky lg:top-24 lg:self-start">
          <p className="label">Live preview</p>
          <IsoTower sections={d.sections} className="h-80 w-auto max-w-full" title="Tower preview" />
          <div className="mt-4 grid w-full grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-white p-2">
              <div className="font-display text-3xl text-navy">{totals.blocks}</div>
              <div className="text-xs font-extrabold text-ink uppercase">blocks</div>
            </div>
            <div className="rounded-xl bg-white p-2">
              <div className="font-display text-3xl text-navy">{totals.height}</div>
              <div className="text-xs font-extrabold text-ink uppercase">tall</div>
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-ink">
            {stats.map((s) => s.blocks).join(" + ")} = {totals.blocks}
          </p>
        </aside>
      </div>
    </div>
  );
}
