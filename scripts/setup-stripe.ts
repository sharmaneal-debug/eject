#!/usr/bin/env tsx
/**
 * Eject — Stripe product/price bootstrap
 * --------------------------------------
 * Creates the two products (DIY $499, DFY $299) in your Stripe account and
 * prints the price IDs to paste into .env.
 *
 *   STRIPE_SECRET_KEY=sk_test_... pnpm tsx scripts/setup-stripe.ts
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
    { lookupKey: "eject_diy_v1", config: siteConfig.pricing.diy },
    { lookupKey: "eject_dfy_v1", config: siteConfig.pricing.dfy },
  ] as const;

  for (const t of tiers) {
    // Look for an existing product by metadata.eject_tier_lookup; create if missing.
    const search = await stripe.products.search({
      query: `metadata['eject_tier_lookup']:'${t.lookupKey}'`,
    });

    let product = search.data[0];
    if (!product) {
      product = await stripe.products.create({
        name: t.config.name,
        description: t.config.blurb,
        metadata: { eject_tier_lookup: t.lookupKey, eject_tier_id: t.config.id },
      });
      console.log(`✓ created product ${t.config.id} → ${product.id}`);
    } else {
      console.log(`= product ${t.config.id} already exists → ${product.id}`);
    }

    // Find existing price at the right amount; create if missing.
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

    console.log(`   STRIPE_PRICE_${t.config.id.toUpperCase()}=${price.id}`);
  }

  console.log("\nPaste the STRIPE_PRICE_* lines into your .env then redeploy.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
