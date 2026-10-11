"use client";

import { useActionState, useState } from "react";
import { addSale, type FormState } from "@/app/hq/actions";

export default function SaleForm({ blueprints }: { blueprints: { id: string; name: string; price_cents: number }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addSale, null);
  const [bpId, setBpId] = useState(blueprints[0]?.id ?? "");
  const [amount, setAmount] = useState(((blueprints[0]?.price_cents ?? 500) / 100).toString());
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[1.4fr_0.8fr_1.4fr_auto] sm:items-end">
      <div>
        <label className="label" htmlFor="sale-bp">
          Blueprint
        </label>
        <select
          id="sale-bp"
          name="blueprint_id"
          className="field"
          value={bpId}
          onChange={(e) => {
            setBpId(e.target.value);
            const bp = blueprints.find((b) => b.id === e.target.value);
            if (bp) setAmount((bp.price_cents / 100).toString());
          }}
        >
          {blueprints.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="sale-amount">
          Dollars
        </label>
        <input
          id="sale-amount"
          name="amount"
          type="number"
          min="0"
          step="0.01"
          className="field"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="sale-note">
          Who bought it? (optional)
        </label>
        <input id="sale-note" name="note" className="field" placeholder="e.g. Grandma Leelee" maxLength={200} />
      </div>
      <button type="submit" className="btn btn-sun" disabled={pending}>
        {pending ? "…" : "Ring it up! 🛎️"}
      </button>
      {state ? (
        <p role="status" className={`text-sm font-bold sm:col-span-4 ${state.ok ? "text-[#15803d]" : "text-[#c2410c]"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
