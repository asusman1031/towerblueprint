"use server";

import { db } from "@/lib/supabase";

export type JoinState = { ok: boolean; message: string } | null;

const MESSAGES: Record<string, { ok: boolean; message: string }> = {
  joined: { ok: true, message: "You're on the list! Sawyer will send an email when it's ready." },
  already: { ok: true, message: "You're already on the list. Thanks for checking!" },
  need_grown_up: { ok: false, message: "Please have a grown-up check the box and sign up." },
  bad_email: { ok: false, message: "That email doesn't look right. Can you check it?" },
  bad_blueprint: { ok: false, message: "That blueprint isn't available yet." },
  busy: { ok: false, message: "Lots of builders signing up today! Please try again tomorrow." },
};

export async function joinList(_prev: JoinState, formData: FormData): Promise<JoinState> {
  const email = String(formData.get("email") ?? "").trim();
  const kind = formData.get("kind") === "preorder" ? "preorder" : "club";
  const slug = String(formData.get("slug") ?? "");
  const grownUp = formData.get("grown_up") === "on";

  if (!grownUp) return MESSAGES.need_grown_up;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return MESSAGES.bad_email;

  const sb = db();
  if (!sb) {
    return { ok: false, message: "Sign-ups open very soon. Please check back in a day or two!" };
  }
  const { data, error } = await sb.rpc("join_list", {
    p_email: email,
    p_kind: kind,
    p_slug: slug,
    p_grown_up: grownUp,
  });
  if (error) {
    console.error("join_list", error.message);
    return { ok: false, message: "Something went wrong. Please try again in a minute." };
  }
  return MESSAGES[String(data)] ?? { ok: false, message: "Something went wrong. Please try again." };
}
