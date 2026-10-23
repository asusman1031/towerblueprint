"use client";

import { useState, useTransition } from "react";
import { submitWallEntry } from "@/app/actions";
import { shrinkImage } from "@/lib/image-client";
import { STATES } from "@/lib/states";

export default function WallForm() {
  const [photo, setPhoto] = useState<{ mime: string; b64: string; preview: string } | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();

  async function onPhoto(file: File | undefined) {
    setPhotoError("");
    if (!file) return setPhoto(null);
    try {
      const { mime, b64 } = await shrinkImage(file, 1400, 0.8);
      setPhoto({ mime, b64, preview: `data:${mime};base64,${b64}` });
    } catch {
      setPhotoError("We couldn't read that photo. Try a JPG or PNG.");
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const age = parseInt(String(f.get("age") ?? ""), 10);
    setResult(null);
    start(async () => {
      setResult(
        await submitWallEntry({
          email: String(f.get("email") ?? ""),
          consent: f.get("consent") === "on",
          firstName: String(f.get("first_name") ?? ""),
          age: Number.isFinite(age) ? age : null,
          state: String(f.get("state") ?? ""),
          towerName: String(f.get("tower_name") ?? ""),
          blurb: String(f.get("blurb") ?? ""),
          photoMime: photo?.mime ?? "",
          photoB64: photo?.b64 ?? "",
        }),
      );
    });
  }

  if (result?.ok) {
    return (
      <div role="status" className="rounded-2xl border-[3px] border-navy bg-ice p-6 text-navy">
        <p className="font-display text-3xl">🎉 Tower received!</p>
        <p className="mt-2 text-lg font-semibold">{result.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="bw-name">
            Builder&apos;s first name
          </label>
          <input id="bw-name" name="first_name" required maxLength={30} className="field" placeholder="First name only" />
        </div>
        <div>
          <label className="label" htmlFor="bw-age">
            Age
          </label>
          <input id="bw-age" name="age" type="number" min={2} max={17} required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="bw-state">
            State
          </label>
          <select id="bw-state" name="state" required className="field" defaultValue="">
            <option value="" disabled>
              Choose…
            </option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="bw-tower">
            Tower name
          </label>
          <input id="bw-tower" name="tower_name" maxLength={80} className="field" placeholder="e.g. Elsa's Ice Castle" />
        </div>
        <div>
          <label className="label" htmlFor="bw-blurb">
            One sentence about it
          </label>
          <input id="bw-blurb" name="blurb" maxLength={200} className="field" placeholder="Built with 150 blocks!" />
        </div>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-navy/30 p-4">
        <span className="label">Photo of the tower</span>
        <div className="flex flex-wrap items-center gap-4">
          <label className="btn btn-white btn-sm cursor-pointer">
            📸 {photo ? "Change photo" : "Add a photo"}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.preview} alt="The tower" className="h-24 w-auto rounded-lg border-2 border-navy object-cover" />
          ) : (
            <span className="text-sm text-ink">Just the tower, please. No faces or people in the picture.</span>
          )}
        </div>
        {photoError ? <p className="mt-2 text-sm font-bold text-[#c2410c]">{photoError}</p> : null}
      </div>

      <div>
        <label className="label" htmlFor="bw-email">
          Grown-up&apos;s email <span className="font-semibold normal-case">(private, never shown)</span>
        </label>
        <input id="bw-email" name="email" type="email" required autoComplete="email" className="field" placeholder="grown-up@email.com" />
      </div>

      <label className="flex items-start gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 accent-[#1e63e9]" />
        <span>
          I&apos;m this child&apos;s parent or guardian (18+). I say it&apos;s OK to show their first name, age, state
          and this tower photo on the Builder Wall. I can ask to have it taken down any time.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-sun text-xl" disabled={pending}>
          {pending ? "Sending…" : "Send my tower to the wall"}
        </button>
        {result && !result.ok ? (
          <p role="alert" className="text-sm font-bold text-[#c2410c]">
            {result.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
