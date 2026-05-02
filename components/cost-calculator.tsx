"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type Platform = "webflow" | "framer" | "wix" | "squarespace";

const platformPlans: Record<Platform, { id: string; label: string; monthly: number }[]> = {
  webflow: [
    { id: "basic", label: "Basic ($14/mo)", monthly: 14 },
    { id: "cms", label: "CMS ($23/mo)", monthly: 23 },
    { id: "business", label: "Business ($39/mo)", monthly: 39 },
    { id: "ecom-standard", label: "Ecommerce Standard ($29/mo)", monthly: 29 },
    { id: "ecom-plus", label: "Ecommerce Plus ($74/mo)", monthly: 74 },
  ],
  framer: [
    { id: "mini", label: "Mini ($10/mo)", monthly: 10 },
    { id: "basic", label: "Basic ($20/mo)", monthly: 20 },
    { id: "pro", label: "Pro ($30/mo)", monthly: 30 },
    { id: "business", label: "Business ($80/mo)", monthly: 80 },
  ],
  wix: [
    { id: "light", label: "Light ($17/mo)", monthly: 17 },
    { id: "core", label: "Core ($29/mo)", monthly: 29 },
    { id: "business", label: "Business ($36/mo)", monthly: 36 },
    { id: "elite", label: "Business Elite ($159/mo)", monthly: 159 },
  ],
  squarespace: [
    { id: "personal", label: "Personal ($16/mo)", monthly: 16 },
    { id: "business", label: "Business ($23/mo)", monthly: 23 },
    { id: "commerce-basic", label: "Commerce Basic ($28/mo)", monthly: 28 },
    { id: "commerce-advanced", label: "Commerce Advanced ($65/mo)", monthly: 65 },
  ],
};

const ejectMonthlyByTier = {
  none: 0,
  hobby: 79,
  pro: 149,
};

export function CostCalculator() {
  const [platform, setPlatform] = useState<Platform>("webflow");
  const [planId, setPlanId] = useState(platformPlans.webflow[1].id);
  const [seats, setSeats] = useState(1);
  const [bandwidthOverages, setBandwidthOverages] = useState(0);
  const [editorTier, setEditorTier] = useState<keyof typeof ejectMonthlyByTier>("hobby");
  const [migrationTier, setMigrationTier] = useState<"diy" | "dwy" | "dfy">("dwy");

  const plans = platformPlans[platform];
  const plan = plans.find((p) => p.id === planId) ?? plans[0];

  const platformCost36 = useMemo(() => {
    // Plan + seats (typical $19/seat avg) + bandwidth overages
    const monthly = plan.monthly + Math.max(0, seats - 1) * 19 + bandwidthOverages;
    return monthly * 36;
  }, [plan, seats, bandwidthOverages]);

  const ejectOneTime = migrationTier === "diy" ? 49 : migrationTier === "dwy" ? 299 : 1499;
  const ejectMonthly = ejectMonthlyByTier[editorTier]; // Cloudflare Pages = $0
  const domainPerYear = 12; // generous estimate
  const ejectCost36 = ejectOneTime + ejectMonthly * 36 + domainPerYear * 3;

  const savings = platformCost36 - ejectCost36;
  const pctSavings = platformCost36 > 0 ? Math.round((savings / platformCost36) * 100) : 0;

  return (
    <div className="rounded-2xl border border-line bg-white shadow-[0_1px_0_0_rgba(11,11,15,0.04),0_24px_60px_-24px_rgba(11,11,15,0.10)] overflow-hidden">
      <div className="grid lg:grid-cols-[1.05fr_1fr]">
        <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-line">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink-muted mb-6">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
            Real cost over 36 months
          </div>

          <Field label="Your current platform">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(platformPlans) as Platform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPlatform(p);
                    setPlanId(platformPlans[p][1].id);
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition capitalize",
                    platform === p
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-paper hover:border-ink"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Plan">
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm focus:border-ink focus:outline-none"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Workspace seats">
              <NumberInput value={seats} onChange={setSeats} min={1} max={50} />
              <p className="text-xs text-ink-muted mt-1">First seat included. ~$19/seat after.</p>
            </Field>
            <Field label="Bandwidth overage / mo">
              <NumberInput value={bandwidthOverages} onChange={setBandwidthOverages} min={0} max={1000} step={5} prefix="$" />
              <p className="text-xs text-ink-muted mt-1">Add what you typically pay above your plan.</p>
            </Field>
          </div>

          <div className="mt-2 pt-6 border-t border-line">
            <p className="text-sm font-medium mb-3">Eject migration tier</p>
            <div className="grid grid-cols-3 gap-2">
              {(["diy", "dwy", "dfy"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMigrationTier(t)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition uppercase",
                    migrationTier === t ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-muted mt-2">
              DIY $49 · Done-with-You $299 · Done-for-You $1,499 (one-time)
            </p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium mb-3">Editor retainer (optional)</p>
            <div className="grid grid-cols-3 gap-2">
              {(["none", "hobby", "pro"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setEditorTier(t)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition capitalize",
                    editorTier === t ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-muted mt-2">
              Hobby $79/mo · Pro $149/mo · Or run it yourself ($0).
            </p>
          </div>
        </div>

        <div className="p-6 lg:p-8 bg-paper-warm">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted">36-month total</p>
            <span className="text-xs font-mono text-ink-muted">{platform}</span>
          </div>

          <div className="space-y-5">
            <Row label={`Stay on ${platform}`} value={platformCost36} highlight="ink" />
            <Row label="Move to Eject" value={ejectCost36} highlight="signal" />
            <div className="h-px bg-line my-1" />
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-1">You save</p>
              <p className="text-5xl h-display text-signal">
                ${Math.max(0, savings).toLocaleString()}
              </p>
              <p className="text-sm text-ink-soft mt-1">
                {pctSavings > 0 ? `That's ${pctSavings}% less` : "Adjust your plan to see savings"} over 3 years.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-line bg-white p-4 text-sm">
            <p className="font-medium mb-1">What's included on Eject</p>
            <ul className="text-ink-soft space-y-1.5 mt-2">
              <li>· A Next.js 15 codebase you own forever (GitHub)</li>
              <li>· Cloudflare Pages free hosting (the &quot;$5/yr&quot; story is your domain)</li>
              <li>· Forms, redirects, sitemaps, SEO meta — all wired</li>
              <li>· Optional chat-based editor (no code required)</li>
            </ul>
          </div>

          <a
            href="/migrate"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-ink text-paper px-4 py-3 text-sm font-medium hover:bg-signal transition"
          >
            Start a free 5-minute audit →
          </a>
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

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-sm pointer-events-none">{prefix}</span>
      )}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
        className={cn(
          "w-full rounded-lg border border-line bg-paper py-2.5 text-sm focus:border-ink focus:outline-none",
          prefix ? "pl-7 pr-3" : "px-3"
        )}
      />
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: number; highlight: "ink" | "signal" }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className={cn("text-2xl font-semibold tabular-nums", highlight === "signal" ? "text-signal" : "text-ink")}>
        ${value.toLocaleString()}
      </p>
    </div>
  );
}
