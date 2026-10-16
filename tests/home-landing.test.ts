import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { moveCheckoutHref } from "../lib/checkout-gate";
import { AGENT_PRICE_LINE, HOME_DESCRIPTION, HOME_H1, HOME_LEDE, homeFaqItems } from "../lib/home-copy";
import { annualFromListPrice } from "../lib/pricing/savings";
import { PLATFORMS } from "../lib/pricing/platforms";
import { formatUsdRange, hostingPriceRange } from "../lib/pricing/hosting-range";
import { faqSchema, productSchema } from "../lib/schema";
import { siteConfig } from "../lib/site";

test("home copy is the short offer and the $99 agent line", () => {
  assert.equal(HOME_H1, "Move your website.");
  assert.equal(HOME_LEDE, "Stop paying to host your website. Move it to your agent for free.");
  assert.equal(HOME_DESCRIPTION, siteConfig.description);
  assert.match(HOME_DESCRIPTION, /\$99/);
  assert.equal(HOME_DESCRIPTION.includes("199"), false);
  assert.equal(
    AGENT_PRICE_LINE,
    "It's $99 here, and you can use a free ChatGPT account or any AI tool to manage this website.",
  );
  assert.equal(siteConfig.pricing.express.price, 99);
  assert.equal(homeFaqItems.length >= 5 && homeFaqItems.length <= 6, true);
  const faq = faqSchema([...homeFaqItems]);
  assert.equal(faq.mainEntity.length, homeFaqItems.length);
  assert.deepEqual(
    faq.mainEntity.map((item) => item.name),
    homeFaqItems.map((item) => item.q),
  );
  assert.deepEqual(
    faq.mainEntity.map((item) => item.acceptedAnswer.text),
    homeFaqItems.map((item) => item.a),
  );
  const product = productSchema();
  assert.equal(product.offers.price, 99);
  assert.equal(product.offers.priceCurrency, "USD");
});

test("buy CTA enters /checkout even while checkout is closed", () => {
  const previous = process.env.CHECKOUT_OPEN;
  delete process.env.CHECKOUT_OPEN;
  try {
    const href = moveCheckoutHref("https://example.com");
    assert.match(href, /^\/checkout\?/);
    assert.match(href, /tier=automated/);
    assert.match(href, /url=https%3A%2F%2Fexample\.com/);
    assert.equal(href.includes("/early-access"), false);
  } finally {
    if (previous === undefined) delete process.env.CHECKOUT_OPEN;
    else process.env.CHECKOUT_OPEN = previous;
  }
});

test("hosting ranges come from published plan prices and unknown stays general", () => {
  const published = new Set<number>();
  for (const platform of PLATFORMS) {
    for (const plan of platform.plans) {
      for (const billing of ["yearly", "monthly"] as const) {
        const annual = annualFromListPrice(plan, billing);
        if (annual != null) published.add(annual);
      }
    }
  }

  const framer = hostingPriceRange("framer");
  assert.equal(framer.pricedPlatform, true);
  assert.equal(framer.platformLabel, "Framer");
  assert.equal(framer.lowUsd, 120);
  assert.equal(framer.highUsd, 360);
  assert.equal(framer.simplePlansOnly, true);
  assert.equal(framer.savingsLowUsd, 120);
  assert.equal(framer.savingsHighUsd, 360);
  assert.equal(formatUsdRange(framer.lowUsd, framer.highUsd), "$120–$360");
  assert.equal(published.has(framer.lowUsd), true);
  assert.equal(published.has(framer.highUsd), true);
  assert.match(framer.note, /range, not your bill/);

  const webflow = hostingPriceRange("webflow");
  assert.equal(webflow.lowUsd, 180);
  assert.equal(webflow.highUsd, 300);
  assert.equal(webflow.simplePlansOnly, true);

  const squarespace = hostingPriceRange("squarespace");
  assert.equal(squarespace.lowUsd, 228);
  assert.equal(squarespace.highUsd, 300);

  const wix = hostingPriceRange("wix");
  assert.equal(wix.simplePlansOnly, false);
  assert.equal(wix.lowUsd, 204);
  assert.equal(wix.highUsd, 1908);
  assert.match(wix.note, /outside a simple site/);
  assert.equal(published.has(wix.lowUsd), true);
  assert.equal(published.has(wix.highUsd), true);

  for (const platform of ["other", "shopify", "wordpress"] as const) {
    const range = hostingPriceRange(platform);
    assert.equal(range.pricedPlatform, false);
    assert.equal(range.lowUsd, 120);
    assert.equal(range.highUsd, 360);
    assert.match(range.note, /general range/);
    assert.match(range.note, /not your bill/);
    assert.equal(range.lowUsd < range.highUsd, true);
  }
  assert.match(hostingPriceRange("other").note, /couldn't tell the platform/);
  assert.match(hostingPriceRange("shopify").note, /We detected Shopify/);
});

test("llms files state the service and the $99 price", () => {
  for (const name of ["llms.txt", "llms-full.txt"]) {
    const text = readFileSync(path.join(process.cwd(), "public", name), "utf8");
    assert.match(text, /\$99/);
    assert.match(text, /ejectfrom\.com/);
    assert.match(text, /You own the code/);
    assert.equal(text.includes("199"), false);
  }
});
