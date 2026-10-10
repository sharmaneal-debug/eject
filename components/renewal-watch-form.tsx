"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site";
import { PLATFORMS, defaultPlanId, getPlan, type PlatformId } from "@/lib/pricing/platforms";
import { calculateSavings, formatUsd } from "@/lib/pricing/savings";
import { buildMovePlan } from "@/lib/renewal/move-plan";
import { parseRenewalEmail } from "@/lib/renewal/parse-email";
import { trackEvent } from "./track-event";

type Interval = "month" | "year" | "";

export function RenewalWatchForm({
  initialPlatform = "framer",
  initialPlanId,
  initialDate = "",
}: {
  initialPlatform?: PlatformId;
  initialPlanId?: string;
  initialDate?: string;
}) {
  const [email, setEmail] = useState("");
  const [platformId, setPlatformId] = useState<PlatformId>(initialPlatform);
  const [planId, setPlanId] = useState(initialPlanId ?? defaultPlanId(initialPlatform));
  const [renewalDate, setRenewalDate] = useState(initialDate);
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState<Interval>("");
  const [emailText, setEmailText] = useState("");
  const [parseNotes, setParseNotes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | {
    persisted: boolean;
    emailSent: boolean;
    unsubscribePath: string;
  }>(null);

  const platform = PLATFORMS.find((p) => p.id === platformId) ?? PLATFORMS[0]!;
  const plan = getPlan(platform.id, planId) ?? platform.plans[0]!;
  const amountUsd = amount.trim() === "" ? null : Number(amount);
  const parsedCharge = amountUsd != null && Number.isFinite(amountUsd) ? amountUsd : null;
  const charge = interval === "month" || interval === "year" ? parsedCharge : null;

  const savings = useMemo(
    () =>
      calculateSavings({
        platformId: platform.id,
        planId: plan.id,
        billing: interval === "month" ? "monthly" : "yearly",
        years: 1,
        renewalChargeUsd: charge,
        renewalInterval: interval === "month" || interval === "year" ? interval : null,
        ejectOneTimeUsd: siteConfig.pricing.express.price,
      }),
    [platform.id, plan.id, interval, charge],
  );
  const movePlan = renewalDate ? buildMovePlan(renewalDate) : null;

  function applyPaste(text: string) {
    setEmailText(text);
    if (text.trim().length < 12) {
      setParseNotes([]);
      return;
    }
    const parsed = parseRenewalEmail(text);
    setParseNotes(parsed.notes);
    if (parsed.platform) {
      setPlatformId(parsed.platform);
      if (parsed.planId) setPlanId(parsed.planId);
      else setPlanId(defaultPlanId(parsed.platform));
    } else if (parsed.planId) {
      setPlanId(parsed.planId);
    }
    if (parsed.renewalDate) setRenewalDate(parsed.renewalDate);
    if (parsed.amountUsd != null) setAmount(String(parsed.amountUsd));
    if (parsed.interval) setInterval(parsed.interval);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/renewal-watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          platform: platformId,
          planId,
          renewalDate,
          amountUsd: charge,
          interval: interval || undefined,
          emailText: emailText.trim() || undefined,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        persisted?: boolean;
        emailSent?: boolean;
        unsubscribePath?: string;
      };
      if (!json.ok || !json.unsubscribePath) {
        setError(json.error || "We couldn't save that.");
        return;
      }
      trackEvent("renewal_watch_signup", { platform: platformId, persisted: json.persisted ? 1 : 0 });
      setDone({
        persisted: Boolean(json.persisted),
        emailSent: Boolean(json.emailSent),
        unsubscribePath: json.unsubscribePath,
      });
    } catch {
      setError("Network hiccup. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-white p-8 md:p-10">
        <p className="font-mono text-xs uppercase tracking-widest text-signal mb-3">Watching</p>
        <h2 className="h-section text-3xl mb-3">We&apos;ll remind you before it renews.</h2>
        <p className="text-ink-soft mb-4">
          {done.persisted ? "Saved." : "Saved for this server process only."}{" "}
          {done.emailSent ? "Confirmation email sent." : "Email did not send."}
        </p>
        <Link href={done.unsubscribePath} className="text-sm text-accent hover:text-signal">
          Unsubscribe link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
      <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
        <label className="block text-sm font-medium mb-2" htmlFor="rw-email">
          Email for the reminders
        </label>
        <input
          id="rw-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm mb-5 focus:border-ink focus:outline-none"
        />

        <p className="text-sm font-medium mb-2">Platform</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {PLATFORMS.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => {
                setPlatformId(p.id);
                setPlanId(defaultPlanId(p.id));
              }}
              className={cn(
                "min-h-11 rounded-lg border px-3 text-sm font-medium",
                platformId === p.id ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium mb-2" htmlFor="rw-plan">
          Plan
        </label>
        <select
          id="rw-plan"
          value={plan.id}
          onChange={(e) => setPlanId(e.target.value)}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm mb-5 focus:border-ink focus:outline-none"
        >
          {platform.plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="rw-date">
              Renewal date
            </label>
            <input
              id="rw-date"
              type="date"
              required
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="rw-amount">
              Invoice amount (optional)
            </label>
            <input
              id="rw-amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="Use list price if blank"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm focus:border-ink focus:outline-none"
            />
          </div>
        </div>

        <p className="text-sm font-medium mb-2">That amount is</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {(
            [
              ["", "List price"],
              ["month", "Per month"],
              ["year", "Per year"],
            ] as const
          ).map(([value, label]) => (
            <button
              type="button"
              key={label}
              onClick={() => setInterval(value)}
              className={cn(
                "rounded-lg border px-2 py-2 text-sm",
                interval === value ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium mb-2" htmlFor="rw-paste">
          Or paste the renewal email
        </label>
        <textarea
          id="rw-paste"
          value={emailText}
          onChange={(e) => applyPaste(e.target.value)}
          rows={7}
          placeholder={"From: billing@framer.com\nYour Pro plan renews on November 12, 2026.\nAmount due: $360.00 for the year."}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm font-mono focus:border-ink focus:outline-none"
        />
        {parseNotes.length > 0 && emailText.trim() && (
          <ul className="mt-3 text-xs text-ink-muted space-y-1">
            {parseNotes.map((note) => (
              <li key={note}>· {note}</li>
            ))}
          </ul>
        )}

        {error && <p className="text-sm text-signal mt-4">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-lg bg-ink text-paper px-4 py-3 text-sm font-medium hover:bg-signal transition disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Watch this renewal"}
        </button>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-line bg-paper-warm p-6 md:p-8">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">One year, this plan</p>
          {savings.annualPlatformUsd == null ? (
            <p className="text-sm text-ink-soft">{savings.unavailableReason}</p>
          ) : (
            <>
              <p className="text-lg">
                {platform.name} {plan.name} {formatUsd(savings.annualPlatformUsd)}/yr vs Eject about {formatUsd(savings.annualSelfHostedUsd)}/yr
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-signal">
                {formatUsd(savings.savingsVsSelfHostedUsd ?? 0)}/yr
              </p>
            </>
          )}
          <p className="mt-4 text-xs text-ink-muted">
            Checked {plan.lastChecked}.{" "}
            <a className="text-accent hover:text-signal" href={plan.sourceUrl} target="_blank" rel="noreferrer">
              Source
            </a>
            . {plan.fitsSimpleSite ? "Can be a simple site." : "Usually outside a 10-page site."}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 md:p-8">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">Move-by plan</p>
          {!movePlan ? (
            <p className="text-sm text-ink-soft">Add a renewal date.</p>
          ) : (
            <ol className="space-y-3">
              {movePlan.steps.map((step) => (
                <li key={step.id} className={cn("flex gap-3", step.passed && "opacity-50")}>
                  <p className="w-28 shrink-0 text-xs text-ink-muted">{step.date}</p>
                  <p className="font-medium">{step.title}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </form>
  );
}
