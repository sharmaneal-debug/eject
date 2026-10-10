"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site";
import { PLATFORMS, SELF_HOSTED, defaultPlanId, getPlan, type PlatformId } from "@/lib/pricing/platforms";
import { calculateSavings, formatUsd, type BillingChoice } from "@/lib/pricing/savings";
type Billing = BillingChoice;

export function CostCalculator({ initialPlatform = "webflow" }: { initialPlatform?: PlatformId }) {
  const [platformId, setPlatformId] = useState<PlatformId>(initialPlatform);
  const [planId, setPlanId] = useState(defaultPlanId(initialPlatform));
  const [billing, setBilling] = useState<Billing>("yearly");
  const [years, setYears] = useState(3);

  const platform = PLATFORMS.find((p) => p.id === platformId) ?? PLATFORMS[0]!;
  const plan = getPlan(platform.id, planId) ?? platform.plans[0]!;
  const ejectOneTimeUsd = siteConfig.pricing.express.price;

  const result = useMemo(
    () =>
      calculateSavings({
        platformId: platform.id,
        planId: plan.id,
        billing,
        years,
        ejectOneTimeUsd,
      }),
    [platform.id, plan.id, billing, years, ejectOneTimeUsd],
  );

  const monthlyMissing = billing === "monthly" && plan.monthlyBilledUsd == null;
  const yearlyMissing = billing === "yearly" && plan.yearlyBilledMonthlyUsd == null;

  return (
    <div className="rounded-2xl border border-line bg-white shadow-[0_1px_0_0_rgba(11,11,15,0.04),0_24px_60px_-24px_rgba(11,11,15,0.10)] overflow-hidden">
      <div className="grid lg:grid-cols-[1.05fr_1fr]">
        <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-line">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink-muted mb-6">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
            List price vs self-hosting
          </div>

          <Field label="Platform">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => {
                    setPlatformId(p.id);
                    setPlanId(defaultPlanId(p.id));
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition",
                    platformId === p.id ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink",
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Plan">
            <select
              value={plan.id}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm focus:border-ink focus:outline-none"
            >
              {platform.plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.fitsSimpleSite ? "" : " · usually out of scope"}
                </option>
              ))}
            </select>
            <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">{plan.notes}</p>
          </Field>

          <Field label="How they bill you">
            <div className="grid grid-cols-2 gap-2">
              <Toggle active={billing === "yearly"} onClick={() => setBilling("yearly")} label="Yearly price" />
              <Toggle active={billing === "monthly"} onClick={() => setBilling("monthly")} label="Month-to-month" />
            </div>
          </Field>

          <Field label="Compare over">
            <div className="grid grid-cols-3 gap-2">
              {[1, 3, 5].map((n) => (
                <Toggle key={n} active={years === n} onClick={() => setYears(n)} label={`${n} year${n > 1 ? "s" : ""}`} />
              ))}
            </div>
          </Field>

          <p className="mt-2 pt-6 border-t border-line text-sm">Fee subtracted: ${siteConfig.pricing.express.price}.</p>
        </div>

        <div className="p-6 lg:p-8 bg-paper-warm">
          <div className="flex items-baseline justify-between mb-2 gap-3">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted">{years}-year platform bill</p>
            <StatusBadge status={result.priceStatus} />
          </div>

          {result.platformTotalUsd == null ? (
            <div className="rounded-xl border border-line bg-white p-5 mb-5">
              <p className="font-medium mb-1">No number, on purpose.</p>
              <p className="text-sm text-ink-soft leading-relaxed">{result.unavailableReason}</p>
              {(monthlyMissing || yearlyMissing) && (
                <a href={plan.sourceUrl} className="inline-block mt-3 text-sm text-accent hover:text-signal" target="_blank" rel="noreferrer">
                  Check {plan.sourceUrl.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-5 mb-5">
              <Row label={`Stay on ${platform.name}`} value={result.platformTotalUsd} />
              <Row label="Self-host a simple site" value={result.selfHostedTotalUsd} highlight />
              <div className="h-px bg-line" />
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-1">Hosting difference</p>
                <p className="text-5xl h-display text-signal">{formatUsd(result.savingsVsSelfHostedUsd ?? 0)}</p>
                <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                  After the {formatUsd(ejectOneTimeUsd)} one-time fee, the difference is{" "}
                  <span className="font-semibold text-ink">{formatUsd(result.netAfterEjectUsd ?? 0)}</span>. Seats, taxes, and add-ons are not in the platform number.
                </p>
              </div>
            </div>
          )}

          {!plan.fitsSimpleSite && (
            <p className="text-sm text-ink mb-4 leading-relaxed rounded-xl bg-signal/10 px-4 py-3">
              This plan is usually a store or a heavy CMS. Eject does not take that work. The price is here so you can see the bill, not as a promise we&apos;ll migrate it.
            </p>
          )}

          <p className="text-xs text-ink-muted leading-relaxed mb-4">{SELF_HOSTED.assumption}</p>
          <p className="text-xs text-ink-muted mb-5">
            Price source, checked {plan.lastChecked}:{" "}
            <a className="text-accent hover:text-signal break-all" href={plan.sourceUrl} target="_blank" rel="noreferrer">
              {plan.sourceUrl}
            </a>
          </p>

          <p className="text-sm text-ink-muted">One-time fee in this math: ${ejectOneTimeUsd}.</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium mb-2">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2.5 text-sm font-medium transition",
        active ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink",
      )}
    >
      {label}
    </button>
  );
}

function Row({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className={cn("text-2xl font-semibold tabular-nums", highlight ? "text-signal" : "text-ink")}>{formatUsd(value)}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const verified = status === "verified";
  return (
    <span
      className={cn(
        "text-[10px] font-mono uppercase tracking-widest rounded-full px-2 py-0.5",
        verified ? "bg-ink text-paper" : "bg-signal/15 text-signal",
      )}
    >
      {verified ? "Price checked" : status === "custom" ? "Your invoice" : "Needs verification"}
    </span>
  );
}
