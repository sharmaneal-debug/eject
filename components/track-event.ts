"use client";

import { track } from "@vercel/analytics";

export type FunnelEvent = "scan" | "checkout_click" | "renewal_watch_signup" | "lead_captured";

export function trackEvent(name: FunnelEvent, props?: Record<string, string | number | boolean | null>) {
  try {
    track(name, props);
  } catch {
    // Analytics is optional. The durable event below is the backup.
  }
  const payload = JSON.stringify({ name, props: props ?? {} });
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon("/api/events", blob)) return;
    }
  } catch {
    // fall through to fetch
  }
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
