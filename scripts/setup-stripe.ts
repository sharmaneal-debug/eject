#!/usr/bin/env tsx
/**
 * Create or look up the two test-mode Stripe prices.
 *
 *   STRIPE_SECRET_KEY=sk_test_... pnpm setup-stripe
 *
 * Refuses live keys. Prints price ids and the env var names to set.
 * Does not write an env file.
 */

import Stripe from "stripe";
import { offers } from "../lib/pricing";
import { stripeKeyMode } from "../lib/stripe";

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("error: STRIPE_SECRET_KEY required (test key only, sk_test_…)");
    process.exit(1);
  }
  if (stripeKeyMode(key) === "live") {
    console.error("error: refusing a live Stripe key. Use a test key (sk_test_…).");
    process.exit(1);
  }
  if (stripeKeyMode(key) !== "test") {
    console.error("error: STRIPE_SECRET_KEY must be a Stripe test secret (sk_test_…).");
    process.exit(1);
  }

  const stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });

  for (const offer of offers) {
    const search = await stripe.products.search({
      query: `metadata['eject_tier_lookup']:'${offer.stripeLookupKey}'`,
    });

    let product = search.data[0];
    if (!product) {
      product = await stripe.products.create({
        name: `Eject ${offer.name}`,
        description: offer.blurb,
        metadata: { eject_tier_lookup: offer.stripeLookupKey, eject_tier_id: offer.id },
      });
      console.log(`created product ${offer.id} → ${product.id}`);
    } else {
      console.log(`found product ${offer.id} → ${product.id}`);
    }

    const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
    const targetCents = offer.price * 100;
    let price = prices.data.find((item) => item.unit_amount === targetCents && item.currency === "usd" && item.type === "one_time");
    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        currency: "usd",
        unit_amount: targetCents,
        nickname: `${offer.name} (one-time)`,
        metadata: { eject_tier_id: offer.id },
      });
      console.log(`created price ${offer.id} $${offer.price} → ${price.id}`);
    } else {
      console.log(`found price ${offer.id} $${offer.price} → ${price.id}`);
    }

    console.log(`${offer.stripePriceEnv[0]}=${price.id}`);
  }

  console.log("\nSet those env vars in your shell or host. Do not commit them.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : "setup-stripe failed");
  process.exit(1);
});
