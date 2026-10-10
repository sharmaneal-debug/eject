"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site";

export function OpsPaymentLink({ opsKey }: { opsKey: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setUrl(null);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/ops/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-ops-token": opsKey },
        body: JSON.stringify({
          key: opsKey,
          name: data.get("name"),
          email: data.get("email"),
          url: data.get("url"),
        }),
      });
      const json = (await response.json()) as { ok?: boolean; url?: string; error?: string };
      if (!json.ok || !json.url) setError(json.error || "Could not create the link.");
      else setUrl(json.url);
    } catch {
      setError("Network error.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 rounded-2xl border border-line bg-white p-6 max-w-xl space-y-3">
      <p className="font-medium">Done for you payment link · ${siteConfig.pricing.concierge.price}</p>
      <p className="text-sm text-ink-muted">Use this after the call. It creates a test-mode or mock checkout. It does not appear on the public pricing page.</p>
      <input name="name" placeholder="Customer name" className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
      <input name="email" type="email" required placeholder="Customer email" className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
      <input name="url" placeholder="https://their-site.com" className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
      <button type="submit" disabled={pending} className="rounded-lg bg-ink text-paper px-4 py-2 text-sm">
        {pending ? "Creating…" : "Create payment link"}
      </button>
      {error && <p className="text-sm text-signal">{error}</p>}
      {url && (
        <p className="text-sm break-all">
          Link: <a className="text-accent" href={url}>{url}</a>
        </p>
      )}
    </form>
  );
}
