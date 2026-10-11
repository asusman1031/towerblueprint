"use client";

import { useState } from "react";
import SignupForm from "@/components/SignupForm";
import { track } from "@/components/Track";
import { formatPrice } from "@/lib/tower";

type Props = {
  slug: string;
  name: string;
  priceCents: number;
  checkoutUrl: string | null;
  status: "draft" | "coming_soon" | "live";
};

export default function BuyBox({ slug, name, priceCents, checkoutUrl, status }: Props) {
  const [reserving, setReserving] = useState(false);
  const price = formatPrice(priceCents);

  if (status === "coming_soon") {
    return (
      <div className="card p-6">
        <p className="font-display text-2xl text-navy">Coming soon!</p>
        <p className="mt-1 mb-4 text-ink">Sawyer is still testing this one. Get an email the moment it&apos;s ready.</p>
        <SignupForm kind="preorder" slug={slug} cta="Tell me first" />
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="label !mb-0">Official blueprint</p>
          <p className="font-display text-5xl text-navy">{price}</p>
        </div>
        <span className="rounded-full border-2 border-navy bg-sun px-3 py-1 text-xs font-extrabold uppercase tracking-wide">
          Printable PDF
        </span>
      </div>

      {checkoutUrl ? (
        <>
          <a
            href={checkoutUrl}
            onClick={() => track("click_buy", slug)}
            className="btn btn-sun mt-5 w-full text-xl"
            rel="noopener"
          >
            Get the {name} blueprint
          </a>
          <p className="mt-3 text-sm text-ink/80">
            Grown-ups check out on a secure payment page. The printable blueprint opens right after.
          </p>
        </>
      ) : reserving ? (
        <div className="mt-5">
          <p className="mb-3 font-semibold text-ink">
            Checkout opens very soon! Leave a grown-up&apos;s email and Sawyer&apos;s team will send the blueprint and a
            way to pay.
          </p>
          <SignupForm kind="preorder" slug={slug} cta="Reserve my copy" />
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              track("click_buy", slug);
              setReserving(true);
            }}
            className="btn btn-sun mt-5 w-full text-xl"
          >
            Get the {name} blueprint
          </button>
          <p className="mt-3 text-sm text-ink/80">A grown-up finishes the order. You print it and start building.</p>
        </>
      )}
    </div>
  );
}
