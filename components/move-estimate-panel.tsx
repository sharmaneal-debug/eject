"use client";

import { moveCheckoutHref } from "@/lib/checkout-gate";
import { AGENT_PRICE_LINE } from "@/lib/home-copy";
import type { Platform } from "@/lib/platform";
import { formatUsdRange, hostingPriceRange } from "@/lib/pricing/hosting-range";

export type MoveScan = {
  url: string;
  platform: Platform;
  platformLabel: string;
};

export function MoveEstimatePanel({ scan }: { scan: MoveScan }) {
  const range = hostingPriceRange(scan.platform);
  const pay = formatUsdRange(range.lowUsd, range.highUsd);
  const savings = formatUsdRange(range.savingsLowUsd, range.savingsHighUsd);
  const href = moveCheckoutHref(scan.url);

  return (
    <section
      id="estimate"
      data-testid="estimate-panel"
      aria-live="polite"
      className="mt-6 min-w-0 rounded-2xl border border-line bg-white p-4 sm:p-6"
    >
      <h2 className="text-base font-medium text-ink-muted">Detected platform</h2>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{scan.platformLabel}</p>

      <h3 className="mt-6 text-base font-medium text-ink-muted">What you likely pay now</h3>
      <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
        {pay}
        <span className="text-base font-normal text-ink-muted"> per year</span>
      </p>
      <p className="mt-2 text-base leading-relaxed text-ink-soft">{range.note}</p>

      <h3 className="mt-6 text-base font-medium text-ink-muted">Estimated yearly savings</h3>
      <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
        {savings}
        <span className="text-base font-normal text-ink-muted"> per year</span>
      </p>
      <p className="mt-2 text-base leading-relaxed text-ink-soft">{range.savingsNote}</p>

      {range.sources.length > 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Public prices:{" "}
          {range.sources.map((source, index) => (
            <span key={source.url}>
              {index > 0 ? ", " : null}
              <a className="underline underline-offset-2 hover:text-ink" href={source.url} target="_blank" rel="noopener noreferrer">
                {source.label}
              </a>
            </span>
          ))}
          . Checked {range.checked}.
        </p>
      ) : null}

      <p className="mt-6 text-base leading-relaxed text-ink">{AGENT_PRICE_LINE}</p>
      <a
        href={href}
        data-testid="buy-cta"
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-ink px-5 text-base font-medium text-paper hover:bg-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:w-auto"
      >
        Buy now
      </a>
    </section>
  );
}
