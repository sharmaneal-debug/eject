"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site";

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

// Default to a real-world plan most small businesses are on (mid-tier).
const DEFAULT_PLAN: Record<Platform, string> = {
  webflow: "business",
  framer: "pro",
  wix: "core",
  squarespace: "business",
};

type Tier = "express" | "concierge";

export function CostCalculator() {
  const [platform, setPlatform] = useState<Platform>("webflow");
  const [planId, setPlanId] = useState(DEFAULT_PLAN.webflow);
  const [seats, setSeats] = useState(2);
  const [tier, setTier] = useState<Tier>("express");

  const plans = platformPlans[platform];
  const plan = plans.find((p) => p.id === planId) ?? plans[0];

  const platformAnnual = useMemo(() => {
    // Plan + Workspace seats above the first (~$19/seat avg).
    const monthly = plan.monthly + Math.max(0, seats - 1) * 19;
    return monthly * 12;
  }, [plan, seats]);

  const platform3yr = platformAnnual * 3;
  const platform5yr = platformAnnual * 5;

  // Eject = one-time fee. Ongoing hosting + AI editor = $0 (Cloudflare free,
  // ChatGPT/Claude free tiers). Domain renewal is paid to your registrar
  // either way — same on both sides — so we don't count it.
  const ejectOneTime = tier === "express" ? siteConfig.pricing.express.price : siteConfig.pricing.concierge.price;
  const ejectAnnualOngoing = 0;

  const eject3yr = ejectOneTime + ejectAnnualOngoing * 3;
  const eject5yr = ejectOneTime + ejectAnnualOngoing * 5;

  const savings3yr = Math.max(0, platform3yr - eject3yr);
  const savings5yr = Math.max(0, platform5yr - eject5yr);
  const pctSavings3yr = platform3yr > 0 ? Math.round((savings3yr / platform3yr) * 100) : 0;

  return (
    <div className="rounded-2xl border border-line bg-white shadow-[0_1px_0_0_rgba(11,11,15,0.04),0_24px_60px_-24px_rgba(11,11,15,0.10)] overflow-hidden">
      <div className="grid lg:grid-cols-[1.05fr_1fr]">
        <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-line">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink-muted mb-6">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
            Plug in your situation
          </div>

          <Field label="Your current platform">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(platformPlans) as Platform[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => {
                    setPlatform(p);
                    setPlanId(DEFAULT_PLAN[p]);
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

          <Field label="Your plan">
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

          <Field label="People who edit the site">
            <NumberInput value={seats} onChange={setSeats} min={1} max={50} />
            <p className="text-xs text-ink-muted mt-1.5">
              First seat included. Most platforms charge ~$19 per extra seat.
            </p>
          </Field>

          <div className="mt-2 pt-6 border-t border-line">
            <p className="text-sm font-medium mb-3">How do you want to do this?</p>
            <div className="grid grid-cols-2 gap-2">
              <TierButton
                active={tier === "express"}
                onClick={() => setTier("express")}
                name={`Express · $${siteConfig.pricing.express.price}`}
                blurb="Auto-rebuild + AI kit. You deploy."
              />
              <TierButton
                active={tier === "concierge"}
                onClick={() => setTier("concierge")}
                name={`Concierge · $${siteConfig.pricing.concierge.price}`}
                blurb="A human does the whole thing."
              />
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8 bg-paper-warm">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted">3-year cost</p>
            <span className="text-xs font-mono text-ink-muted capitalize">{platform}</span>
          </div>

          <div className="space-y-5">
            <Row label={`Stay on ${platform}`} value={platform3yr} highlight="ink" />
            <Row label="Move to Eject" value={eject3yr} highlight="signal" />
            <div className="h-px bg-line my-1" />
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-1">You save</p>
              <p className="text-5xl h-display text-signal">
                ${savings3yr.toLocaleString()}
              </p>
              <p className="text-sm text-ink-soft mt-1">
                {pctSavings3yr > 0 ? `That's ${pctSavings3yr}% less` : "Adjust your plan to see savings"} over 3 years.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-white p-4 mt-4">
              <p className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-3">After 5 years</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-ink-muted text-xs mb-0.5">{platform}</p>
                  <p className="font-semibold tabular-nums">${platform5yr.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-ink-muted text-xs mb-0.5">Eject</p>
                  <p className="font-semibold tabular-nums text-signal">${eject5yr.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-xs text-ink-muted mt-3 leading-snug">
                Once you pay Eject, ongoing cost is{" "}
                <span className="font-semibold text-ink">$0</span>. Hosting on Cloudflare is free. Editing with ChatGPT or Claude free tier is free. Your domain renewal is paid to your registrar either way.
              </p>
            </div>
          </div>

          <Link
            href={`/checkout?tier=${tier}`}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-ink text-paper px-4 py-3 text-sm font-medium hover:bg-signal transition"
          >
            Start with {tier === "express" ? "Express" : "Concierge"} · ${ejectOneTime} →
          </Link>
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
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
      className="w-full rounded-lg border border-line bg-paper py-2.5 px-3 text-sm focus:border-ink focus:outline-none"
    />
  );
}

function TierButton({ active, onClick, name, blurb }: { active: boolean; onClick: () => void; name: string; blurb: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-3 text-left transition",
        active ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink"
      )}
    >
      <p className="text-sm font-medium">{name}</p>
      <p className={cn("text-xs mt-0.5", active ? "text-paper/70" : "text-ink-muted")}>{blurb}</p>
    </button>
  );
}

function Row({ label, value, highlight }: { label: string; value: number; highlight: "ink" | "signal" }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-ink-soft capitalize">{label}</p>
      <p className={cn("text-2xl font-semibold tabular-nums", highlight === "signal" ? "text-signal" : "text-ink")}>
        ${value.toLocaleString()}
      </p>
    </div>
  );
}
