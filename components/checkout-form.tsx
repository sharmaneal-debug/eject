"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Tier } from "@/lib/stripe";

export function CheckoutForm({ tier, prefilledUrl }: { tier: Tier; prefilledUrl?: string }) {
 const [email, setEmail] = useState("");
 const [siteUrl, setSiteUrl] = useState(prefilledUrl ? prefilledUrl.replace(/^https?:\/\//i, "") : "");
 const [name, setName] = useState("");
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [preview, setPreview] = useState<{ price: number; name: string } | null>(null);

 async function onSubmit(e: React.FormEvent) {
 e.preventDefault();
 setError(null);
 setPreview(null);
 setSubmitting(true);
 try {
 const res = await fetch("/api/checkout", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ tier, email, url: siteUrl }),
 });
 const json = await res.json();
 if (!json.ok) {
 if (json.preview) {
 setPreview({ price: json.tier?.price ?? 0, name: json.tier?.name ?? "" });
 } else {
 setError(json.error || "checkout failed. try again?");
 }
 } else if (json.url) {
 window.location.href = json.url;
 }
 } catch {
 setError("network error. try again?");
 } finally {
 setSubmitting(false);
 }
 }

 return (
 <form
 onSubmit={onSubmit}
 className="rounded-2xl border border-line bg-white p-7 md:p-9"
 >
 <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-5">
 Step 1 of 1. Pay & we&apos;ll start
 </p>

 <div className="space-y-4">
 <Field
 label="Your name"
 name="name"
 value={name}
 onChange={setName}
 required
 placeholder="Jane Doe"
 />
 <Field
 label="Email"
 name="email"
 type="email"
 value={email}
 onChange={setEmail}
 required
 placeholder="jane@yourcompany.com"
 />
 <Field
 label="Your current site URL"
 name="siteUrl"
 value={siteUrl}
 onChange={setSiteUrl}
 required
 placeholder="your-site.com"
 prefix="https://"
 />
 </div>

 <button
 type="submit"
 disabled={submitting || !email || !siteUrl}
 className={cn(
 "mt-7 w-full rounded-xl px-5 py-4 text-base font-medium transition",
 submitting
 ? "bg-ink/30 text-paper cursor-wait"
 : "bg-ink text-paper hover:bg-signal disabled:opacity-50"
 )}
 >
 {submitting ? "Redirecting to Stripe…" : "Continue to payment →"}
 </button>

 <p className="mt-3 text-xs text-ink-muted text-center">
 Payment is processed by Stripe. We never see your card.
 </p>

 {error && (
 <p className="mt-4 rounded-lg bg-signal/10 border border-signal/30 px-4 py-3 text-sm text-signal">
 {error}
 </p>
 )}

 {preview && (
 <div className="mt-4 rounded-lg bg-paper-warm border border-line px-4 py-3 text-sm text-ink-soft">
 <p className="font-medium text-ink mb-1">Heads up. Stripe isn&apos;t hooked up yet.</p>
 <p>
 We received your details and would charge ${preview.price} for {preview.name} once payments are live.
 For now, email <a className="text-accent hover:text-signal" href="mailto:hi@eject.co">hi@eject.co</a> and
 we&apos;ll invoice you manually.
 </p>
 </div>
 )}
 </form>
 );
}

function Field({
 label,
 name,
 type = "text",
 value,
 onChange,
 required,
 placeholder,
 prefix,
}: {
 label: string;
 name: string;
 type?: string;
 value: string;
 onChange: (v: string) => void;
 required?: boolean;
 placeholder?: string;
 prefix?: string;
}) {
 return (
 <div>
 <label className="block text-sm font-medium mb-2">{label}</label>
 <div className="relative">
 {prefix && (
 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-sm font-mono pointer-events-none">
 {prefix}
 </span>
 )}
 <input
 type={type}
 name={name}
 value={value}
 onChange={(e) => onChange(e.target.value.replace(/^https?:\/\//i, ""))}
 required={required}
 placeholder={placeholder}
 className={cn(
 "w-full rounded-lg border border-line bg-paper py-3 text-sm focus:border-ink focus:outline-none transition",
 prefix ? "pl-[4.5rem] pr-3" : "px-3"
 )}
 />
 </div>
 </div>
 );
}
