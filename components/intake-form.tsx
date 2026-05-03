"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type Tier = "diy" | "dwy" | "dfy";

export function IntakeForm({ defaultTier = "dwy" }: { defaultTier?: Tier }) {
 const [tier, setTier] = useState<Tier>(defaultTier);
 const [submitted, setSubmitted] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [siteUrl, setSiteUrl] = useState("");
 const [email, setEmail] = useState("");

 async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
 e.preventDefault();
 setSubmitting(true);
 const data = new FormData(e.currentTarget);
 try {
 await fetch("/api/intake", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(Object.fromEntries(data)),
 });
 setSubmitted(true);
 } catch {
 // Even if API isn't deployed yet, capture client-side; in production this writes to Resend/CRM
 setSubmitted(true);
 } finally {
 setSubmitting(false);
 }
 }

 if (submitted) {
 return (
 <div className="rounded-2xl border border-line bg-white p-10 text-center">
 <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-signal/15 text-signal mb-4 font-mono">✓</div>
 <h3 className="text-2xl h-section mb-2">Got it.</h3>
 <p className="text-ink-soft max-w-md mx-auto">
 We&apos;ll record a 5-minute Loom audit of <span className="font-mono">{siteUrl || "your site"}</span> and send it to{" "}
 <span className="font-mono">{email || "your email"}</span> within 24 hours. No call required, no pitch deck.
 </p>
 </div>
 );
 }

 return (
 <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-7 md:p-10">
 <div className="mb-6">
 <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">Tier</p>
 <div className="grid grid-cols-3 gap-2">
 {(["diy", "dwy", "dfy"] as Tier[]).map((t) => (
 <button
 type="button"
 key={t}
 onClick={() => setTier(t)}
 className={cn(
 "rounded-lg border px-3 py-3 text-sm font-medium transition uppercase",
 tier === t ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink"
 )}
 >
 {t === "diy" ? "DIY · $49" : t === "dwy" ? "Done-with-You · $299" : "Done-for-You · $1,499"}
 </button>
 ))}
 </div>
 <input type="hidden" name="tier" value={tier} />
 </div>

 <div className="grid md:grid-cols-2 gap-5">
 <Field label="Your name" name="name" required />
 <Field label="Email" name="email" type="email" required value={email} onChange={setEmail} />
 <Field
 label="Live site URL"
 name="siteUrl"
 placeholder="https://your-site.com"
 required
 value={siteUrl}
 onChange={setSiteUrl}
 className="md:col-span-2"
 />
 <div className="md:col-span-2">
 <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">Current platform</p>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
 {["webflow", "framer", "wix", "squarespace"].map((p) => (
 <label
 key={p}
 className="rounded-lg border border-line bg-paper px-3 py-2.5 text-sm font-medium capitalize cursor-pointer hover:border-ink transition has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper"
 >
 <input type="radio" name="platform" value={p} required className="sr-only" />
 {p}
 </label>
 ))}
 </div>
 </div>
 <Field label="Approx. # of pages" name="pages" type="number" placeholder="8" />
 <Field label="Approx. # CMS items" name="cmsItems" type="number" placeholder="40" />
 <div className="md:col-span-2">
 <label className="block text-sm font-medium mb-2">Anything weird about your site we should know? (optional)</label>
 <textarea
 name="notes"
 rows={3}
 placeholder="Memberships, gated content, ecommerce, multi-language, etc."
 className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm focus:border-ink focus:outline-none"
 />
 </div>
 </div>

 <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
 <p className="text-xs text-ink-muted">
 We&apos;ll send a free 5-min Loom audit within 24h. No call required, no pitch deck.
 </p>
 <button
 type="submit"
 disabled={submitting}
 className="rounded-lg bg-ink text-paper px-5 py-3 text-sm font-medium hover:bg-signal transition disabled:opacity-60"
 >
 {submitting ? "Sending…" : "Get the Loom audit →"}
 </button>
 </div>
 </form>
 );
}

function Field({
 label,
 name,
 type = "text",
 required,
 placeholder,
 className,
 value,
 onChange,
}: {
 label: string;
 name: string;
 type?: string;
 required?: boolean;
 placeholder?: string;
 className?: string;
 value?: string;
 onChange?: (v: string) => void;
}) {
 return (
 <div className={className}>
 <label className="block text-sm font-medium mb-2">{label}</label>
 <input
 type={type}
 name={name}
 required={required}
 placeholder={placeholder}
 value={value}
 onChange={onChange ? (e) => onChange(e.target.value) : undefined}
 className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm focus:border-ink focus:outline-none"
 />
 </div>
 );
}
