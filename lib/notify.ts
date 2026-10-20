import "server-only";

// Emails the site owner when someone signs up or sends a design. It uses Resend
// (resend.com). Until RESEND_API_KEY and NOTIFY_EMAIL are set on the server, this
// quietly does nothing, so signing up always works.
export async function notifyOwner(subject: string, lines: string[]) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || "Tower Blueprints <onboarding@resend.dev>",
        to: [to],
        subject,
        text: lines.join("\n"),
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("notifyOwner", res.status, (await res.text()).slice(0, 200));
  } catch (e) {
    console.error("notifyOwner", e instanceof Error ? e.message : e);
  }
}
