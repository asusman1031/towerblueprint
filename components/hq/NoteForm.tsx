"use client";

import { useActionState } from "react";
import { saveNote, type FormState } from "@/app/hq/actions";

export default function NoteForm({ note }: { note: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveNote, null);
  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="note" className="label">
        Your words, on the home page
      </label>
      <textarea id="note" name="note" defaultValue={note} rows={5} maxLength={2000} className="field text-lg leading-relaxed" />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-sun btn-sm" disabled={pending}>
          {pending ? "Saving…" : "Put it on the website"}
        </button>
        {state ? (
          <span role="status" className={`text-sm font-bold ${state.ok ? "text-[#15803d]" : "text-[#c2410c]"}`}>
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
