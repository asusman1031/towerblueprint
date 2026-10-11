"use client";

import { useState, useTransition } from "react";
import { submitDesign } from "@/app/actions";
import { shrinkImage } from "@/lib/image-client";

export default function DesignRequestForm() {
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
    setResult(null);
    start(async () => {
      const res = await submitDesign({
        email: String(f.get("email") ?? ""),
        grownUp: f.get("grown_up") === "on",
        builderName: String(f.get("builder_name") ?? ""),
        towerName: String(f.get("tower_name") ?? ""),
        description: String(f.get("description") ?? ""),
        photoMime: photo?.mime ?? "",
        photoB64: photo?.b64 ?? "",
      });
      setResult(res);
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="dr-tower">
            Tower name
          </label>
          <input id="dr-tower" name="tower_name" className="field" maxLength={80} placeholder="e.g. The Rainbow Spire" />
        </div>
        <div>
          <label className="label" htmlFor="dr-builder">
            Builder&apos;s first name <span className="font-semibold normal-case">(for the certificate)</span>
          </label>
          <input id="dr-builder" name="builder_name" className="field" maxLength={40} placeholder="First name only" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="dr-desc">
          How did you build it?
        </label>
        <textarea
          id="dr-desc"
          name="description"
          rows={4}
          maxLength={2000}
          className="field"
          placeholder="Example: 4 layers of 4x4, then 8 layers of 2x2, then 10 single blocks on top."
        />
        <p className="mt-1 text-sm text-ink">Sawyer&apos;s tip: count the layers from the bottom up!</p>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-navy/30 p-4">
        <span className="label">Photo of your tower</span>
        <div className="flex flex-wrap items-center gap-4">
          <label className="btn btn-white btn-sm cursor-pointer">
            📸 {photo ? "Change photo" : "Add a photo"}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.preview} alt="Your tower" className="h-24 w-auto rounded-lg border-2 border-navy object-cover" />
          ) : (
            <span className="text-sm text-ink">Just the tower, please, no people in the picture.</span>
          )}
        </div>
        {photoError ? <p className="mt-2 text-sm font-bold text-[#c2410c]">{photoError}</p> : null}
      </div>

      <div>
        <label className="label" htmlFor="dr-email">
          Grown-up&apos;s email
        </label>
        <input
          id="dr-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field"
          placeholder="grown-up@email.com"
        />
      </div>

      <label className="flex items-start gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" name="grown_up" required className="mt-0.5 size-4 accent-[#1e63e9]" />
        <span>I&apos;m a grown-up (18+) sending this for a young builder.</span>
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-sun text-xl" disabled={pending}>
          {pending ? "Sending…" : "Send my tower to Sawyer"}
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
