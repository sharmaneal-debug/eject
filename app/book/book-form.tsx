"use client";

import { useState } from "react";

type Result = {
  ok: boolean;
  error?: string;
  platform?: string;
  siteUrl?: string;
  scanError?: string | null;
  emailed?: boolean;
  emailSkipped?: boolean;
};

export function BookForm({ bookingUrl, embed, support }: { bookingUrl: string | null; embed: boolean; support: string }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setResult(null);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          url: data.get("url"),
          platform: data.get("platform"),
          renewalDate: data.get("renewalDate"),
          note: data.get("note"),
        }),
      });
      const json = (await response.json()) as Result;
      setResult(json.ok ? json : { ok: false, error: json.error || "We couldn't save that." });
    } catch {
      setResult({ ok: false, error: "Network error. Email us instead." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-xl">
      <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-6 md:p-8 space-y-4">
        <Field label="Your name" name="name" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Site URL" name="url" placeholder="https://your-site.com" required />
        <label className="block text-sm">
          <span className="font-medium">Platform</span>
          <select name="platform" className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2.5" defaultValue="">
            <option value="">Not sure</option>
            <option>Framer</option>
            <option>Webflow</option>
            <option>Wix</option>
            <option>Squarespace</option>
            <option>Something else</option>
          </select>
        </label>
        <Field label="Renewal date, if you know it" name="renewalDate" type="date" />
        <label className="block text-sm">
          <span className="font-medium">What you want</span>
          <textarea name="note" required rows={4} className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2.5" placeholder="A simple marketing site, about N pages. I want to leave before renewal." />
        </label>
        <button type="submit" disabled={pending} className="rounded-xl bg-ink text-paper px-5 py-3 text-sm font-medium hover:bg-signal disabled:opacity-50">
          {pending ? "Checking the site…" : "Check the site and continue"}
        </button>
      </form>

      {result && !result.ok && <p className="mt-4 text-signal text-sm">{result.error}</p>}

      {result?.ok && (
        <div className="mt-8 rounded-2xl border border-line bg-paper-warm p-6">
          <p className="font-medium mb-2">We saved the request{result.platform ? ` and scanned ${result.siteUrl}` : ""}.</p>
          {result.scanError ? (
            <p className="text-sm text-ink-soft mb-3">The free scan did not finish: {result.scanError}. We still have your note.</p>
          ) : (
            <p className="text-sm text-ink-soft mb-3">Scanned {result.siteUrl}.</p>
          )}
          {result.emailSkipped && (
            <p className="text-sm text-ink-soft mb-3">The request is stored. If you do not hear back, email {support}.</p>
          )}
          {bookingUrl ? (
            <div className="mt-4">
              <a href={bookingUrl} className="text-sm text-accent" target="_blank" rel="noreferrer">
                Open the calendar
              </a>
              {embed && (
                <iframe title="Calendar" src={bookingUrl} className="mt-4 w-full h-[420px] rounded-xl border border-line bg-white" />
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-soft">
              Email <a className="text-accent" href={`mailto:${support}`}>{support}</a>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2.5" />
    </label>
  );
}
