"use client";

import { useActionState, useId } from "react";
import { joinList, type JoinState } from "@/app/actions";

export default function SignupForm({
  kind = "club",
  slug = "",
  cta = "Join the club",
  dark = false,
}: {
  kind?: "club" | "preorder";
  slug?: string;
  cta?: string;
  dark?: boolean;
}) {
  const [state, action, pending] = useActionState<JoinState, FormData>(joinList, null);
  const id = useId();

  if (state?.ok) {
    return (
      <div
        role="status"
        className={`rounded-2xl border-[3px] border-navy p-5 font-bold ${dark ? "bg-white text-navy" : "bg-ice text-navy"}`}
      >
        <span className="font-display text-2xl">🎉 Woo-hoo!</span>
        <p className="mt-1">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="slug" value={slug} />
      <label htmlFor={`${id}-email`} className="sr-only">
        Grown-up&apos;s email
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="grown-up@email.com"
          className="field sm:flex-1"
        />
        <button type="submit" className="btn btn-sun shrink-0" disabled={pending}>
          {pending ? "Saving…" : cta}
        </button>
      </div>
      <label className={`flex items-start gap-2 text-sm font-semibold ${dark ? "text-ice" : "text-ink"}`}>
        <input type="checkbox" name="grown_up" required className="mt-0.5 size-4 accent-[#1e63e9]" />
        <span>I&apos;m a grown-up (18+). Kids: ask a parent to sign up for you!</span>
      </label>
      {state && !state.ok ? (
        <p role="alert" className={`text-sm font-bold ${dark ? "text-sun" : "text-[#c2410c]"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
