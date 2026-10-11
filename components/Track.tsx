"use client";

import { useEffect } from "react";

type Event = "visit" | "view_blueprint" | "click_buy";

export function track(event: Event, slug = "") {
  const body = JSON.stringify({ event, slug });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
  } else {
    fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(
      () => {},
    );
  }
}

// Counts one visit per browser tab session, plus any page-specific event.
export default function Track({ event, slug }: { event?: Event; slug?: string }) {
  useEffect(() => {
    try {
      if (!sessionStorage.getItem("tb_visit")) {
        sessionStorage.setItem("tb_visit", "1");
        track("visit");
      }
    } catch {
      // storage blocked: skip visit counting rather than double count
    }
    if (event) track(event, slug);
  }, [event, slug]);
  return null;
}
