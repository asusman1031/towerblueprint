"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/app/hq/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, null);
  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="passcode" className="label">
        Secret passcode
      </label>
      <input
        id="passcode"
        name="passcode"
        type="password"
        autoComplete="current-password"
        required
        className="field text-lg"
        placeholder="••••••••"
      />
      <button type="submit" className="btn btn-sun mt-1" disabled={pending}>
        {pending ? "Checking…" : "Open HQ 🔑"}
      </button>
      {state && !state.ok ? (
        <p role="alert" className="text-sm font-bold text-[#c2410c]">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
