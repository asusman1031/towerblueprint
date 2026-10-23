"use server";

import { notifyOwner } from "@/lib/notify";
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
  if (data === "joined") {
    await notifyOwner(kind === "preorder" ? "New reservation on Tower Blueprints" : "New Builders Club signup", [
      `${email} signed up${kind === "preorder" ? ` to reserve ${slug || "a blueprint"}` : " for the Builders Club"}.`,
      "",
      "See everyone in Architect HQ: https://www.towerblueprintsforkids.com/hq",
    ]);
  }
  return MESSAGES[String(data)] ?? { ok: false, message: "Something went wrong. Please try again." };
}

const DESIGN_MESSAGES: Record<string, { ok: boolean; message: string }> = {
  sent: { ok: true, message: "Sawyer got your tower! He'll email you soon about making your blueprint." },
  need_grown_up: MESSAGES.need_grown_up,
  bad_email: MESSAGES.bad_email,
  need_details: { ok: false, message: "Tell Sawyer how you built it, or add a photo, so he can make your blueprint." },
  bad_photo: { ok: false, message: "That photo didn't work. Try a JPG or PNG." },
  closed: { ok: false, message: "Sawyer isn't taking new designs right now. Please check back soon!" },
  busy: { ok: false, message: "Lots of towers came in today! Please try again tomorrow." },
};

export type DesignInput = {
  email: string;
  grownUp: boolean;
  builderName: string;
  towerName: string;
  description: string;
  photoMime: string;
  photoB64: string;
};

export async function submitDesign(input: DesignInput): Promise<{ ok: boolean; message: string }> {
  const email = String(input.email ?? "").trim();
  if (!input.grownUp) return DESIGN_MESSAGES.need_grown_up;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return DESIGN_MESSAGES.bad_email;
  const photo = String(input.photoB64 ?? "");
  if (photo.length > 1_400_000) return { ok: false, message: "That photo is too big. Try a smaller one." };

  const sb = db();
  if (!sb) return { ok: false, message: "Design requests open very soon. Please check back in a day or two!" };
  const { data, error } = await sb.rpc("submit_design_request", {
    p_email: email,
    p_grown_up: true,
    p_builder_name: String(input.builderName ?? "").slice(0, 40),
    p_tower_name: String(input.towerName ?? "").slice(0, 80),
    p_description: String(input.description ?? "").slice(0, 2000),
    p_photo_mime: photo ? input.photoMime : null,
    p_photo_b64: photo || null,
  });
  if (error) {
    console.error("submit_design_request", error.message);
    return { ok: false, message: "Something went wrong. Please try again in a minute." };
  }
  if (data === "sent") {
    await notifyOwner("New tower design sent to Tower Blueprints", [
      `${String(input.builderName ?? "").slice(0, 40) || "Someone"} sent in "${String(input.towerName ?? "").slice(0, 80) || "a tower"}".`,
      `Email: ${email}`,
      "",
      "Open Architect HQ to read it and see the photo: https://www.towerblueprintsforkids.com/hq",
    ]);
  }
  return DESIGN_MESSAGES[String(data)] ?? { ok: false, message: "Something went wrong. Please try again." };
}

const WALL_MESSAGES: Record<string, { ok: boolean; message: string }> = {
  sent: {
    ok: true,
    message: "Thank you! Sawyer's team will look at it, and your tower will show up on the wall once it's approved.",
  },
  need_consent: { ok: false, message: "A grown-up needs to check the permission box." },
  bad_email: MESSAGES.bad_email,
  need_name: { ok: false, message: "Please add the builder's first name." },
  bad_age: { ok: false, message: "Please check the age." },
  need_state: { ok: false, message: "Please choose a state." },
  bad_photo: { ok: false, message: "Please add a photo of the tower (JPG or PNG)." },
  busy: { ok: false, message: "Lots of towers came in today! Please try again tomorrow." },
};

export type WallInput = {
  email: string;
  consent: boolean;
  firstName: string;
  age: number | null;
  state: string;
  towerName: string;
  blurb: string;
  photoMime: string;
  photoB64: string;
};

export async function submitWallEntry(input: WallInput): Promise<{ ok: boolean; message: string }> {
  const email = String(input.email ?? "").trim();
  if (!input.consent) return WALL_MESSAGES.need_consent;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) return WALL_MESSAGES.bad_email;
  const photo = String(input.photoB64 ?? "");
  if (photo.length > 1_400_000) return { ok: false, message: "That photo is too big. Try a smaller one." };

  const sb = db();
  if (!sb) return { ok: false, message: "The Builder Wall opens very soon. Please check back in a day or two!" };
  const firstName = String(input.firstName ?? "").slice(0, 30);
  const age = Number.isFinite(input.age) ? Math.round(Number(input.age)) : null;
  const { data, error } = await sb.rpc("submit_wall_entry", {
    p_email: email,
    p_consent: true,
    p_first_name: firstName,
    p_age: age,
    p_state: String(input.state ?? "").slice(0, 40),
    p_tower_name: String(input.towerName ?? "").slice(0, 80),
    p_blurb: String(input.blurb ?? "").slice(0, 200),
    p_photo_mime: photo ? input.photoMime : null,
    p_photo_b64: photo || null,
  });
  if (error) {
    console.error("submit_wall_entry", error.message);
    return { ok: false, message: "Something went wrong. Please try again in a minute." };
  }
  if (data === "sent") {
    await notifyOwner("New tower for the Builder Wall", [
      `${firstName || "Someone"} sent a tower for the Builder Wall.`,
      "",
      "Look at the photo and approve it in Architect HQ: https://www.towerblueprintsforkids.com/hq",
    ]);
  }
  return WALL_MESSAGES[String(data)] ?? { ok: false, message: "Something went wrong. Please try again." };
}
