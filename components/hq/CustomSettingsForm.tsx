"use client";

import { useActionState } from "react";
import { saveCustomSettings, type FormState } from "@/app/hq/actions";

export default function CustomSettingsForm({ priceCents, open }: { priceCents: number; open: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCustomSettings, null);
  return (
    <form action={action} className="flex flex-wrap items-end gap-4">
      <div>
        <label className="label" htmlFor="custom-price">
          Price (dollars)
        </label>
        <input
          id="custom-price"
          name="price"
          type="number"
          min="0"
          step="0.5"
          defaultValue={priceCents / 100}
          className="field !w-32 font-display text-xl"
        />
      </div>
      <label className="flex items-center gap-2 pb-3 font-bold text-navy">
        <input type="checkbox" name="open" defaultChecked={open} className="size-5 accent-[#1e63e9]" />
        Taking new requests
      </label>
      <button type="submit" className="btn btn-sun btn-sm mb-1" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
      {state ? (
        <span role="status" className={`mb-2 text-sm font-bold ${state.ok ? "text-[#15803d]" : "text-[#c2410c]"}`}>
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
