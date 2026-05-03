#!/usr/bin/env tsx
/**
 * Eject — Stripe product/price bootstrap
 * --------------------------------------
 * Creates the two products (Express $49, Concierge $299) in your Stripe
 * account and prints the price IDs to paste into .env.
 *
 *   STRIPE_SECRET_KEY=sk_test_... pnpm setup-stripe
 *
 * Idempotent: re-running won't create duplicates as long as the product
 * lookup_key matches an existing product.
 */

import Stripe from "stripe";
import { siteConfig } from "../lib/site";

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("error: STRIPE_SECRET_KEY required (sk_test_… or sk_live_…)");
    process.exit(1);
  }
  const stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });

  const tiers = [
    { lookupKey: "eject_express_v1", config: siteConfig.pricing.express, envKey: "STRIPE_PRICE_EXPRESS" },
    { lookupKey: "eject_concierge_v1", config: siteConfig.pricing.concierge, envKey: "STRIPE_PRICE_CONCIERGE" },
  ] as const;

  for (const t of tiers) {
    const search = await stripe.products.search({
      query: `metadata['eject_tier_lookup']:'${t.lookupKey}'`,
    });

    let product = search.data[0];
    if (!product) {
      product = await stripe.products.create({
        name: `Eject ${t.config.name}`,
        description: t.config.blurb,
        metadata: { eject_tier_lookup: t.lookupKey, eject_tier_id: t.config.id },
      });
      console.log(`✓ created product ${t.config.id} → ${product.id}`);
    } else {
      console.log(`= product ${t.config.id} already exists → ${product.id}`);
    }

    const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
    const targetCents = t.config.price * 100;
    let price = prices.data.find((p) => p.unit_amount === targetCents && p.currency === "usd");
    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        currency: "usd",
        unit_amount: targetCents,
        nickname: `${t.config.name} (one-time)`,
      });
      console.log(`✓ created price ${t.config.id} $${t.config.price} → ${price.id}`);
    } else {
      console.log(`= price ${t.config.id} $${t.config.price} already exists → ${price.id}`);
    }

    console.log(`   ${t.envKey}=${price.id}`);
  }

  console.log("\nPaste the STRIPE_PRICE_* lines into your .env then redeploy.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
