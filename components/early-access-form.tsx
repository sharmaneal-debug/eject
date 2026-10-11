"use client";

import { useState } from "react";

export function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, url, note }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error || "We couldn't save that. Email us instead.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network hiccup. Try again?");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return <p className="text-base text-ink">You're on the list. We'll email you when checkout opens.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-md gap-3" aria-label="Get early access">
      <h2 className="text-lg font-semibold">Get early access</h2>
      <label className="block text-base">
        Email
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          className="mt-1 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-base"
        />
      </label>
      <label className="block text-base">
        Name <span className="text-ink-muted">(optional)</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          className="mt-1 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-base"
        />
      </label>
      <label className="block text-base">
        Site <span className="text-ink-muted">(optional)</span>
        <input
          type="text"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          inputMode="url"
          className="mt-1 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-base"
        />
      </label>
      <label className="block text-base">
        Note <span className="text-ink-muted">(optional)</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-base"
        />
      </label>
      {error ? <p className="text-base text-signal">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-ink px-4 text-base font-medium text-paper hover:bg-signal disabled:opacity-50"
      >
        {busy ? "Saving…" : "Join the list"}
      </button>
    </form>
  );
}
