import { siteConfig } from "./site";

/** Inbox for customers. SUPPORT_EMAIL overrides the public address in site config. */
export function supportEmail(): string {
  return process.env.SUPPORT_EMAIL?.trim() || siteConfig.email;
}

/** Calendar for the Done for you call. https only. Unset means the book page shows a contact fallback. */
export function bookingUrl(): string | null {
  const raw = process.env.BOOKING_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function bookingEmbeddable(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "cal.com" || host.endsWith(".cal.com") || host === "calendar.google.com" || host.endsWith(".google.com");
  } catch {
    return false;
  }
}
