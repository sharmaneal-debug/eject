import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { Section, Eyebrow } from "@/components/section";
import { createCheckoutSession, type CheckoutResult } from "@/lib/checkout";
import { normalizeTier, tierConfig, type Tier } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "One payment for a simple-site migration. Stripe test mode, or a local mock checkout.",
};

async function requestOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) return process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;
  const forwarded = headerList.get("x-forwarded-proto");
  const proto = forwarded ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; url?: string }>;
}) {
  const sp = await searchParams;
  const tier: Tier = normalizeTier(sp.tier) ?? "automated";
  const cfg = tierConfig(tier);

  let result: CheckoutResult;
  try {
    result = await createCheckoutSession({
      tier,
      origin: await requestOrigin(),
      siteUrl: sp.url,
    });
  } catch (err) {
    console.error("[checkout] session create failed:", err instanceof Error ? err.message : "error");
    result = { kind: "unavailable", reason: "Checkout could not be started." };
  }

  // redirect() throws. It stays outside try/catch so Next can complete it.
  if (result.kind === "redirect") {
    redirect(result.url);
  }

  return (
    <Section>
      <Eyebrow>Checkout</Eyebrow>
      <div className="max-w-xl">
        <h1 className="h-display text-4xl md:text-5xl tracking-tightest mb-5">
          {cfg.name} · ${cfg.price}
        </h1>
        <p className="text-ink-soft text-lg leading-relaxed mb-8">{result.reason}</p>
        <div className="rounded-2xl border border-line bg-paper-warm p-6 mb-8">
          <p className="text-sm font-medium mb-3">{cfg.name} includes:</p>
          <ul className="text-sm space-y-2 text-ink-soft">
            {cfg.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="text-signal">·</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-ink-muted mb-6">
          Questions:{" "}
          <a className="text-accent hover:text-signal" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
        </p>
        <Link href="/" className="text-sm text-ink-muted hover:text-ink">
          ← back to home
        </Link>
      </div>
    </Section>
  );
}
