---
title: "How to Leave Framer Without Losing Your Site (or Paying for Another Year)"
slug: "how-to-leave-framer"
description: "Framer has no HTML export, renews automatically, and doesn't refund unused time. Here's the order of operations for moving a simple Framer site before your next renewal, with verified prices and Framer's own help pages."
date: "2026-10-10"
author: "Eject Team"
tags: ["framer", "cancel", "renewal", "migration", "self-hosted", "seo"]
canonical: "https://ejectfrom.com/blog/how-to-leave-framer"
---
# How to Leave Framer Without Losing Your Site (or Paying for Another Year)

*Prices and policies verified on October 10, 2026 from Framer's own pricing page and help center. Links are at the bottom.*

Framer is a lovely tool for designing a site. Leaving it is less lovely, because there's no export button. If your Framer site is a portfolio, a landing page or a few pages for your business, you can still get out cleanly. The trick is doing things in the right order and starting early enough that your renewal never goes through.

This guide is for **simple sites**: portfolios, landing pages, small-business brochure sites. If your Framer site depends on heavy scroll animations, a big CMS, or several languages, moving is a bigger project. Staying may honestly be the better call.

## What you're paying Framer right now

Framer charges per site. From [framer.com/pricing](https://www.framer.com/pricing):

| Plan | Billed yearly | Billed monthly | Per year (yearly) | Per year (monthly) |
|---|---|---|---|---|
| Basic | $10/mo | $15/mo | $120 | $180 |
| Pro | $30/mo | $45/mo | $360 | $540 |

On top of that, each additional editor costs **$20/month on yearly billing or $30/month on monthly**, and content editors cost $10 or $15. Framer bills added editors monthly even if your site plan is yearly ([Subscriptions and charges](https://www.framer.com/help/articles/subscriptions-and-charges/)).

So a Pro site with one extra editor on monthly billing is **$900 a year** before tax. A Basic portfolio on yearly billing is $120.

## The three facts that decide your timing

1. **Framer renews automatically.** Annual plans are "billed upfront for the full year and renew automatically on the subscription anniversary date." Monthly plans renew every month ([source](https://www.framer.com/help/articles/subscriptions-and-charges/)).
2. **Cancelling doesn't refund unused time.** After you cancel, your plan stays active until the end of the billing cycle. Framer's refund policy says refunds are only available within 7 days of the *initial* purchase (14 days in the EU and Turkey), and "refunds are not provided for unused time remaining in an active subscription term" ([Refund policy](https://www.framer.com/help/articles/refund-policy/)). *Note: Framer's pricing-page FAQ only mentions the EU/Turkey window. Go by the help-center policy and confirm with support if it matters to you.*
3. **There is no export.** In Framer's own words: "Framer does not offer HTML export for self-hosting" ([source](https://www.framer.com/help/articles/can-i-export-my-website-to-html-and-self-host-it/)). Leaving means rebuilding the site somewhere else.

Put those together and the rule is simple: **have the new site live before your renewal date, then cancel.** Cancel too early and you've paid for time you won't use. Cancel too late and you've paid for a whole new year.

## Step 1: Find your renewal date (today)

In Framer, open **Workspace Settings → Plans** to see your active subscriptions, and **Invoices** to see past charges ([source](https://www.framer.com/help/articles/subscriptions-and-charges/)). Your annual renewal is the anniversary of your purchase.

Put two reminders in your calendar: one **30 days before** the renewal (start the move) and one **7 days before** (cancel, once the new site is live).

> Framer's help pages we read don't describe a renewal reminder email. Don't count on getting one. Set your own.

## Step 2: Decide where the site goes

For a simple site, the usual destination is a static site you own, hosted on a free tier. Cloudflare Pages says "all plans come with unlimited sites, seats, requests, and bandwidth" ([pages.cloudflare.com](https://pages.cloudflare.com/)). For a portfolio or brochure site, that usually means **$0 a year for hosting**. Your domain is then the only bill.

One thing to watch: if you planned to use Vercel's free tier for a business site, Vercel says its Hobby plan is "restricted to non-commercial personal use only" ([Vercel fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)).

## Step 3: Rebuild the site (yourself, with an AI, or with us)

Because there's no export, you capture what's on your live site and rebuild it as real files:

1. **Inventory every page.** List each URL, plus your forms, embeds (booking, video, newsletter) and images.
2. **Capture the content.** Copy the text, download your original images (not the compressed versions), and note your fonts and colors.
3. **Rebuild.** An AI coding assistant can rebuild a simple Framer site as a small Next.js or HTML project from screenshots and your content. Our [Framer to Next.js guide](/blog/framer-to-nextjs) walks through it.
4. **Re-create the forms.** Framer's built-in forms won't come with you. Pick a form handler and test that submissions reach your inbox.
5. **Map redirects.** If any URLs change, add redirects so Google and old links still land.

Animations are where Framer sites get hard. Light fades and hovers are easy to redo. Scroll-driven sequences take real work. Be honest with yourself about which one you have.

## Step 4: Check your domain before you touch anything

If your domain came free with a yearly Framer plan, or you connected one you bought elsewhere, find out **where it's registered and when it renews**. You'll point that domain at your new host in the next step, and you want to keep it renewing whatever you decide about Framer.

## Step 5: Switch, then cancel

1. Deploy the new site and check it on its preview URL.
2. Point your domain's DNS at the new host. Keep Framer paid for now as your fallback.
3. Once the new site is serving your domain correctly, **cancel your Framer site plan**. In workspace settings, open **Plans**, click the three-dot menu next to the site and choose **Cancel Plan** ([Cancel your Framer subscription](https://www.framer.com/help/articles/cancel-your-framer-plan/)).
4. **Editors:** to stop paying for editors, cancel every site subscription in the workspace. Once the last one is cancelled, the editor subscription ends at the end of the billing cycle ([same article](https://www.framer.com/help/articles/cancel-your-framer-plan/)).

Thinking about *downgrading* instead of cancelling? Framer converts the unused value into account credit that "cannot be refunded" and only applies to future Framer invoices ([Downgrade your Site plan](https://www.framer.com/help/articles/downgrade-your-framer-plan/)). If you're leaving, cancelling is cleaner.

## A timeline that works

| When | Do this |
|---|---|
| Renewal − 30 days | Inventory pages, capture content, choose host |
| Renewal − 21 days | Rebuild; recreate forms; preview |
| Renewal − 10 days | Point DNS at the new host; watch for a few days |
| Renewal − 7 days | Cancel the Framer plan(s) |
| Renewal date | Nothing charges. Done |

## When you should stay on Framer

- You (or your team) actually design in Framer every week. The editor is the product you're paying for.
- The site depends on complex interactions you don't want to rebuild.
- You use Framer's CMS heavily, localization, or A/B testing add-ons.

None of that is a failure. Framer is good at what it does. This guide is for the many sites that haven't changed in months and are still renewing.

## Keep editing after you leave

The usual worry is "who updates the site now?" Increasingly, the answer is your AI agent. Once the site is plain files in a repository you own, you can ask an assistant to "change our hours" or "add this testimonial", review a preview, and approve it. Eject sets this up as part of the move, including a renewal watch for your domain so the next bill never surprises you.

**Want the numbers for your plan?** Run the [renewal savings calculator](/calculator?p=framer). **Want it done before your renewal?** [See how Eject works](/pricing).

## FAQ

**Can I export my Framer site to HTML?**
No. Framer states it "does not offer HTML export for self-hosting." You rebuild the site elsewhere.

**Do I get a refund if I cancel Framer mid-year?**
Generally no. Refunds are limited to 7 days after the initial purchase (14 in the EU and Turkey), and unused time isn't refunded. Your plan stays active until the end of the term.

**When does Framer charge for renewal?**
Annual plans renew automatically on the anniversary date. Monthly plans renew on the same day each month.

**Will my site go offline the moment I cancel?**
No. Benefits remain until the end of the billing cycle, which is why you switch DNS first and cancel second.

**How much does Framer cost per year?**
Basic is $120/year billed yearly ($180 if monthly). Pro is $360/year billed yearly ($540 if monthly). Extra editors are $20 to $30 per month each.

## Sources (checked October 10, 2026)

- Framer pricing: https://www.framer.com/pricing
- Subscriptions and charges: https://www.framer.com/help/articles/subscriptions-and-charges/
- Cancel your Framer subscription: https://www.framer.com/help/articles/cancel-your-framer-plan/
- Refund policy: https://www.framer.com/help/articles/refund-policy/
- Downgrade your Site plan: https://www.framer.com/help/articles/downgrade-your-framer-plan/
- HTML export: https://www.framer.com/help/articles/can-i-export-my-website-to-html-and-self-host-it/
- Cloudflare Pages: https://pages.cloudflare.com/
- Vercel fair use (Hobby is non-commercial): https://vercel.com/docs/limits/fair-use-guidelines

*Framer is a trademark of its owner. Eject is not affiliated with Framer.*

<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"Can I export my Framer site to HTML?","acceptedAnswer":{"@type":"Answer","text":"No. Framer states it does not offer HTML export for self-hosting. You rebuild the site elsewhere."}},
{"@type":"Question","name":"Do I get a refund if I cancel Framer mid-year?","acceptedAnswer":{"@type":"Answer","text":"Generally no. Framer's refund policy limits refunds to 7 days after the initial purchase (14 days in the EU and Turkey) and does not refund unused time. The plan stays active until the end of the term."}},
{"@type":"Question","name":"When does Framer charge for renewal?","acceptedAnswer":{"@type":"Answer","text":"Annual plans renew automatically on the subscription anniversary date. Monthly plans renew on the same day each month."}},
{"@type":"Question","name":"Will my site go offline the moment I cancel Framer?","acceptedAnswer":{"@type":"Answer","text":"No. Plan benefits remain until the end of the billing cycle, so switch DNS to your new host first and cancel second."}},
{"@type":"Question","name":"How much does Framer cost per year?","acceptedAnswer":{"@type":"Answer","text":"As of October 10, 2026: Basic is $120 per year billed yearly ($15/month if billed monthly) and Pro is $360 per year billed yearly ($45/month if billed monthly). Additional editors are $20 per month on yearly billing or $30 on monthly."}}
]}
</script>


## Where to go next

Automated is $99 and you can buy it on the spot. Custom migration, for a simple site. See [renewal watch](/renewal-watch), [contact us for custom pricing](/book).
