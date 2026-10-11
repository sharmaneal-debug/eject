"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site";
import { PLATFORMS, defaultPlanId, getPlan, type PlatformId } from "@/lib/pricing/platforms";
import { calculateSavings, formatUsd } from "@/lib/pricing/savings";
import { ongoingFootnote } from "@/lib/pricing/ongoing";
import { addUtcDays, daysUntilDate, formatLongDate } from "@/lib/renewal/dates";

const fieldClass =
  "min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-base focus:border-ink focus:outline-none";

export function CostCalculator({
  initialPlatform = "framer",
  initialPlanId,
}: {
  initialPlatform?: PlatformId;
  initialPlanId?: string;
}) {
  const [platformId, setPlatformId] = useState<PlatformId>(initialPlatform);
  const [planId, setPlanId] = useState(initialPlanId ?? defaultPlanId(initialPlatform));
  const [renewalDate, setRenewalDate] = useState("");

  const platform = PLATFORMS.find((p) => p.id === platformId) ?? PLATFORMS[0]!;
  const plan = getPlan(platform.id, planId) ?? platform.plans[0]!;
  const moveFee = siteConfig.pricing.express.price;

  const result = useMemo(
    () =>
      calculateSavings({
        platformId: platform.id,
        planId: plan.id,
        billing: "yearly",
        years: 1,
        ejectOneTimeUsd: moveFee,
      }),
    [platform.id, plan.id, moveFee],
  );

  const moveBy = renewalDate ? moveByLabel(renewalDate) : null;
  const reminderHref = `/renewal-watch?platform=${platform.id}&plan=${plan.id}${renewalDate ? `&date=${renewalDate}` : ""}`;

  return (
    <div className="min-w-0 rounded-2xl border border-line bg-white p-4 sm:p-8">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {PLATFORMS.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => {
              setPlatformId(item.id);
              setPlanId(defaultPlanId(item.id));
            }}
            className={cn(
              "min-h-11 rounded-lg border px-3 text-base font-medium transition",
              platformId === item.id ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink hover:border-ink",
            )}
          >
            {item.name}
          </button>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="text-base font-medium">Plan</span>
        <select
          value={plan.id}
          onChange={(event) => setPlanId(event.target.value)}
          className={cn(fieldClass, "mt-1.5")}
        >
          {platform.plans.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      {result.annualPlatformUsd == null ? (
        <p className="mt-6 text-base text-ink-soft">
          No yearly price on the page we checked.{" "}
          <a className="text-accent underline-offset-2 hover:underline" href={plan.sourceUrl} target="_blank" rel="noreferrer">
            See the source
          </a>
          .
        </p>
      ) : (
        <div className="mt-6">
          <div className="grid min-w-0 items-end gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
            <div className="min-w-0">
              <p className="text-base text-ink-muted">
                {platform.name} {plan.name}
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
                {formatUsd(result.annualPlatformUsd)}/yr
              </p>
            </div>
            <p className="text-base text-ink-muted lg:pb-2">vs</p>
            <div className="min-w-0">
              <p className="text-base text-ink-muted">Eject</p>
              <p className="mt-1 break-words text-3xl font-semibold tabular-nums tracking-tight">
                about {formatUsd(result.annualSelfHostedUsd)}/yr
              </p>
            </div>
          </div>
          <p className="mt-5 text-lg">
            Yearly savings{" "}
            <span className="font-semibold tabular-nums text-signal">{formatUsd(result.savingsVsSelfHostedUsd ?? 0)}</span>
          </p>
        </div>
      )}

      {!plan.fitsSimpleSite && (
        <p className="mt-3 text-base text-ink-soft">This plan is usually outside a 10-page simple site.</p>
      )}

      <div className="mt-6 grid gap-3">
        <label className="block min-w-0">
          <span className="text-base font-medium">Renewal date</span>
          <span className="text-ink-muted"> (optional)</span>
          <input
            type="date"
            value={renewalDate}
            onChange={(event) => setRenewalDate(event.target.value)}
            className={cn(fieldClass, "mt-1.5")}
          />
        </label>
        <p className="text-base text-ink-soft">
          {moveBy ? <span className="text-ink">{moveBy} </span> : null}
          <Link href={reminderHref} className="inline-flex min-h-11 items-center text-accent underline-offset-2 hover:underline">
            Get reminders
          </Link>
        </p>
      </div>

      <p className="mt-5 text-base leading-relaxed text-ink-muted">{ongoingFootnote(moveFee)}</p>
    </div>
  );
}

function moveByLabel(renewalDate: string): string | null {
  const days = daysUntilDate(renewalDate);
  if (days == null) return null;
  if (days < 0) return "That date has passed.";
  const start = addUtcDays(renewalDate, -60);
  if (!start) return null;
  const startDays = daysUntilDate(start);
  if (startDays != null && startDays < 0) return `Move by ${formatLongDate(renewalDate)}.`;
  return `Move by ${formatLongDate(start)}.`;
}
