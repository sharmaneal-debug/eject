import Link from "next/link";
import type { Order } from "@/lib/orders";
import { kitHref } from "@/lib/kit-access";
import { siteConfig } from "@/lib/site";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export function ScoreReport({ order }: { order: Order }) {
  const score = order.score;
  if (!score) return null;
  const eligible = score.eligibility === "ELIGIBLE";

  return (
    <div className="max-w-3xl">
      <p className={`text-xs font-mono uppercase tracking-widest mb-3 ${eligible ? "text-signal" : "text-ink-muted"}`}>
        {score.eligibility}
        {score.referral === "refund" ? " · refund" : ""}
        {score.referral === "refer_out" ? " · refer out" : ""}
        {score.referral === "add_on" ? " · priced add-on or refer out" : ""}
      </p>
      <h1 className="h-display text-4xl md:text-5xl tracking-tightest mb-4">
        {eligible ? "This looks like a simple site." : "This is outside the simple-site scope."}
      </h1>
      <ul className="space-y-2 text-ink-soft mb-8">
        {score.reasons.map((reason) => (
          <li key={reason}>· {reason}</li>
        ))}
      </ul>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Fact label="Platform" value={score.platformLabel} />
        <Fact label="Pages" value={`${score.pageCount} (${score.crawledPageCount} crawled)`} />
        <Fact label="Assets" value={`${score.assetCount} · ${score.assetsPullable ? "pullable" : "hard to pull"}`} />
        <Fact label="JS weight" value={`${Math.round(score.scriptBytes / 1024)} KB${score.scriptBytesEstimated ? " est." : ""}`} />
        <Fact label="CMS" value={`${score.cmsCollections} collections · ${score.cmsItems} items`} />
        <Fact label="Forms" value={String(score.formCount)} />
        <Fact label="Animation" value={score.animationSignals.join(", ") || "none detected"} />
        <Fact label="Commerce" value={score.ecommerceSignals.join(", ") || "none detected"} />
        <Fact label="Rebuild" value={score.rebuildEase} />
        <Fact label="Time" value={score.migration.label} />
      </div>

      <div className="rounded-2xl border border-line bg-white p-6 mb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-4">Cost to serve (estimate)</p>
        <ul className="text-sm space-y-2 text-ink-soft">
          <li className="flex justify-between"><span>Compute</span><span className="font-mono">{money(score.costToServe.computeUsd)}</span></li>
          <li className="flex justify-between"><span>Tokens</span><span className="font-mono">{money(score.costToServe.tokensUsd)}</span></li>
          <li className="flex justify-between"><span>Hosting on our side</span><span className="font-mono">{money(score.costToServe.hostingUsd)}</span></li>
          <li className="flex justify-between"><span>Human time</span><span className="font-mono">{money(score.costToServe.humanUsd)}</span></li>
          <li className="flex justify-between"><span>Stripe fee</span><span className="font-mono">{money(score.costToServe.stripeFeeUsd)}</span></li>
          <li className="flex justify-between font-medium text-ink pt-2 border-t border-line"><span>Total</span><span className="font-mono">{money(score.costToServe.totalUsd)}</span></li>
        </ul>
        <p className="text-xs text-ink-muted mt-3">Constants live in lib/cost-constants.ts. This is not an invoice.</p>
      </div>

      {eligible && order.token ? (
        <div className="rounded-2xl border border-line bg-paper-warm p-6">
          <p className="font-medium mb-2">Handoff</p>
          <p className="text-sm text-ink-soft mb-4">{order.delivery?.note}</p>
          <p className="text-sm text-ink-soft mb-4">
            Assets can {score.assetsPullable ? "be pulled from public URLs." : "not be pulled cleanly. Plan on a manual asset pass."}{" "}
            Rebuild ease: {score.rebuildEase}.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={kitHref(order.token)} className="rounded-xl bg-ink text-paper px-5 py-3 text-sm font-medium">
              Open the kit
            </Link>
          </div>
          {order.delivery?.repoDir && (
            <p className="text-xs font-mono text-ink-muted mt-4">Repo written to {order.delivery.repoDir}</p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-6">
          <p className="font-medium mb-2">
            {score.referral === "add_on" ? "Past the included cap" : score.referral === "refer_out" ? "Refer out" : "Refund"}
          </p>
          <p className="text-sm text-ink-soft">
            Email{" "}
            <a className="text-accent" href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`${score.referral} ${order.id}`)}`}>
              {siteConfig.email}
            </a>{" "}
            with order <span className="font-mono">{order.id}</span>. A person issues a refund or a quote. This app does not move money on its own.
            {score.referral === "refer_out" ? " A store, a member area, or a heavy CMS needs a different kind of project." : ""}
            {score.referral === "add_on" ? " The $99 and $199 prices stop at about 10 pages and 1 form." : ""}
          </p>
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-1">{label}</p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}
