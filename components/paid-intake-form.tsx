"use client";

import { useState } from "react";

export function PaidIntakeForm({ token, initialUrl }: { token: string; initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/orders/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, url }),
      });
      const json = (await response.json()) as { ok?: boolean; error?: string };
      if (!json.ok) {
        setError(json.error || "The score couldn't be completed.");
        setPending(false);
        return;
      }
      window.location.assign(`/intake?token=${encodeURIComponent(token)}`);
    } catch {
      setError("Network error. Try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-6 md:p-8 max-w-xl">
      <label className="block text-sm font-medium mb-2" htmlFor="site-url">
        Site URL
      </label>
      <input
        id="site-url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        required
        placeholder="your-site.com"
        className="w-full rounded-lg border border-line bg-paper px-3 py-3 text-sm"
      />
      <button
        type="submit"
        disabled={pending || !url.trim()}
        className="mt-4 rounded-xl bg-ink text-paper px-5 py-3 text-sm font-medium hover:bg-signal disabled:opacity-50"
      >
        {pending ? "Scoring…" : "Score this site"}
      </button>
      {error && <p className="mt-4 text-sm text-signal">{error}</p>}
    </form>
  );
}
