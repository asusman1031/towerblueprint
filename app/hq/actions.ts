"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/lib/supabase";
import { cleanStructure } from "@/lib/structure";
import { cleanTiles } from "@/lib/tiles";
import { cleanSections } from "@/lib/tower";

const COOKIE = "tb_hq";

async function token() {
  return (await cookies()).get(COOKIE)?.value ?? "";
}

export type FormState = { ok: boolean; message: string } | null;

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const sb = db();
  if (!sb) return { ok: false, message: "HQ opens once the database is connected." };
  const passcode = String(formData.get("passcode") ?? "").trim();
  if (!passcode) return { ok: false, message: "Type the secret passcode." };
  const { data, error } = await sb.rpc("hq_login", { p_passcode: passcode });
  if (error || !data) {
    return { ok: false, message: "That passcode didn't work. Too many tries? Wait 15 minutes and try again." };
  }
  (await cookies()).set(COOKIE, String(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  revalidatePath("/hq");
  return { ok: true, message: "Welcome back, Architect!" };
}

export async function logout() {
  const sb = db();
  const t = await token();
  if (sb && t) await sb.rpc("hq_logout", { p_token: t });
  (await cookies()).delete(COOKIE);
  revalidatePath("/hq");
}

export type BlueprintInput = {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  inspired_by: string;
  fun_fact: string;
  sections: unknown;
  structure?: unknown;
  tiles?: unknown;
  difficulty: number;
  price_cents: number;
  checkout_url: string;
  status: string;
  designer: string;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function saveBlueprint(input: BlueprintInput): Promise<{ ok: boolean; message: string; id?: string; slug?: string }> {
  const sb = db();
  if (!sb) return { ok: false, message: "Database not connected." };
  const name = String(input.name ?? "").trim().slice(0, 80);
  if (!name) return { ok: false, message: "Every tower needs a name!" };
  const structure = input.structure == null ? null : cleanStructure(input.structure);
  if (input.structure != null && !structure) return { ok: false, message: "Something in the parts isn't quite right." };
  const tiles = input.tiles == null ? null : cleanTiles(input.tiles);
  if (input.tiles != null && !tiles) return { ok: false, message: "Something in the rooms isn't quite right." };
  // Structures and tile builds keep a one-block placeholder in sections, because the column is required.
  const sections = structure || tiles ? [{ w: 1, d: 1, count: 1 }] : cleanSections(input.sections);
  if (sections.length === 0) return { ok: false, message: "Add at least one section to your tower." };
  const slug = slugify(input.slug || name);
  if (!slug) return { ok: false, message: "Try a name with some letters in it." };
  const checkout = String(input.checkout_url ?? "").trim();
  if (checkout && !/^https:\/\/\S+$/.test(checkout)) {
    return { ok: false, message: "The checkout link must start with https://" };
  }
  const status = ["draft", "coming_soon", "live"].includes(input.status) ? input.status : "draft";

  const { data, error } = await sb.rpc("hq_save_blueprint", {
    p_token: await token(),
    p_data: {
      id: input.id || null,
      slug,
      name,
      tagline: String(input.tagline ?? "").trim().slice(0, 160),
      description: String(input.description ?? "").trim().slice(0, 2000),
      inspired_by: String(input.inspired_by ?? "").trim().slice(0, 120),
      fun_fact: String(input.fun_fact ?? "").trim().slice(0, 600),
      sections,
      structure,
      tiles,
      difficulty: Math.max(1, Math.min(3, Math.round(Number(input.difficulty) || 2))),
      price_cents: Math.max(0, Math.min(100000, Math.round(Number(input.price_cents) || 0))),
      checkout_url: checkout,
      status,
      designer: String(input.designer ?? "").trim().slice(0, 40),
    },
  });
  if (error) {
    console.error("hq_save_blueprint", error.message);
    return { ok: false, message: "Couldn't save. Try again?" };
  }
  const res = data as { ok?: boolean; error?: string; id?: string; slug?: string };
  if (res?.error === "not_signed_in") return { ok: false, message: "You got signed out. Reload and sign in again." };
  if (res?.error === "slug_taken") return { ok: false, message: "Another blueprint already uses that web address. Try a different name." };
  if (res?.error) return { ok: false, message: "Something in the form isn't quite right. Check the fields and try again." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved! 🎉", id: res.id, slug: res.slug };
}

export async function uploadPhoto(slug: string, mime: string, b64: string): Promise<{ ok: boolean; message: string }> {
  const sb = db();
  if (!sb) return { ok: false, message: "Database not connected." };
  if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) return { ok: false, message: "Use a JPG or PNG photo." };
  if (b64.length > 1_400_000) return { ok: false, message: "That photo is too big. Try a smaller one." };
  const { data, error } = await sb.rpc("hq_set_photo", { p_token: await token(), p_slug: slug, p_mime: mime, p_b64: b64 });
  if (error || !data) return { ok: false, message: "Couldn't upload the photo." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Photo added! 📸" };
}

export async function addSale(_prev: FormState, formData: FormData): Promise<FormState> {
  const sb = db();
  if (!sb) return { ok: false, message: "Database not connected." };
  const dollars = Number(formData.get("amount"));
  if (!Number.isFinite(dollars) || dollars < 0 || dollars > 1000) return { ok: false, message: "Type an amount in dollars." };
  const blueprintId = String(formData.get("blueprint_id") ?? "") || null;
  const { data, error } = await sb.rpc("hq_add_sale", {
    p_token: await token(),
    p_blueprint_id: blueprintId,
    p_amount_cents: Math.round(dollars * 100),
    p_note: String(formData.get("note") ?? "").slice(0, 200),
  });
  if (error || !data) return { ok: false, message: "Couldn't record that sale." };
  revalidatePath("/hq");
  return { ok: true, message: `Cha-ching! $${dollars.toFixed(2)} added. 💰` };
}

export async function deleteSale(id: number) {
  const sb = db();
  if (!sb) return;
  await sb.rpc("hq_delete_sale", { p_token: await token(), p_id: id });
  revalidatePath("/hq");
}

export async function saveNote(_prev: FormState, formData: FormData): Promise<FormState> {
  const sb = db();
  if (!sb) return { ok: false, message: "Database not connected." };
  const { data, error } = await sb.rpc("hq_set_setting", {
    p_token: await token(),
    p_key: "architect_note",
    p_value: String(formData.get("note") ?? "").trim().slice(0, 2000),
  });
  if (error || !data) return { ok: false, message: "Couldn't save your note." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Your note is on the website now! ✨" };
}

export async function uploadOriginal(
  slug: string,
  mime: string,
  filename: string,
  b64: string,
  previewB64: string,
): Promise<{ ok: boolean; message: string }> {
  const sb = db();
  if (!sb) return { ok: false, message: "Database not connected." };
  if (!["application/pdf", "image/jpeg", "image/png"].includes(mime)) {
    return { ok: false, message: "Use a PDF, JPG, or PNG file." };
  }
  if (b64.length > 4_300_000) return { ok: false, message: "That file is too big (3 MB max). Try saving a smaller PDF." };
  const { data, error } = await sb.rpc("hq_add_original", {
    p_token: await token(),
    p_slug: slug,
    p_mime: mime,
    p_filename: filename.slice(0, 120),
    p_b64: b64,
    p_preview_b64: previewB64 || null,
  });
  if (error || !data) {
    if (error) console.error("hq_add_original", error.message);
    return { ok: false, message: "Couldn't upload that file." };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Your original is uploaded! 📄" };
}

export async function deleteOriginal(id: number): Promise<boolean> {
  const sb = db();
  if (!sb) return false;
  const { data } = await sb.rpc("hq_delete_original", { p_token: await token(), p_id: id });
  revalidatePath("/", "layout");
  return Boolean(data);
}

export async function setRequest(id: number, status: string, blueprintId?: string): Promise<boolean> {
  const sb = db();
  if (!sb) return false;
  const { data } = await sb.rpc("hq_set_request", {
    p_token: await token(),
    p_id: id,
    p_status: status,
    p_blueprint_id: blueprintId ?? null,
  });
  revalidatePath("/hq");
  return Boolean(data);
}

export async function saveCustomSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const sb = db();
  if (!sb) return { ok: false, message: "Database not connected." };
  const dollars = Number(formData.get("price"));
  if (!Number.isFinite(dollars) || dollars < 0 || dollars > 1000) return { ok: false, message: "Type a price in dollars." };
  const t = await token();
  const results = await Promise.all([
    sb.rpc("hq_set_setting", { p_token: t, p_key: "custom_price_cents", p_value: String(Math.round(dollars * 100)) }),
    sb.rpc("hq_set_setting", { p_token: t, p_key: "custom_open", p_value: formData.get("open") === "on" ? "true" : "false" }),
  ]);
  if (results.some((r) => r.error || !r.data)) return { ok: false, message: "Couldn't save. Try again?" };
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved! ✨" };
}
