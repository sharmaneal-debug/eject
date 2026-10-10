---
title: "How to Leave Webflow: Cancel the Right Plans, Keep Your Domain, and Beat the November 16 Change"
slug: "how-to-leave-webflow"
description: "Webflow renewals aren't refundable, Site and Workspace plans cancel separately, and new pricing reaches Freelancer/Agency Workspaces on or after November 16, 2026. Here's the safe order of operations for a simple site."
date: "2026-10-10"
author: "Eject Team"
tags: ["webflow", "cancel", "renewal", "pricing-change", "migration", "seo"]
canonical: "https://ejectfrom.com/blog/how-to-leave-webflow"
---
# How to Leave Webflow: Cancel the Right Plans, Keep Your Domain, and Beat the November 16 Change

*Prices and policies verified on October 10, 2026 from Webflow's pricing page and help center. Links are at the bottom.*

Leaving Webflow is mostly about **timing and order**. Do things in the wrong order and either your site goes dark or you pay for another year you didn't want. This guide covers **simple sites**: portfolios, landing pages and small-business brochure sites. If you run a Webflow store or a big CMS, this isn't your playbook.

## First: is the November 16 change about you?

In May 2026 Webflow merged its CMS and Business Site plans into a single **Premium** plan and changed prices. The changes reach existing sites in phases ([Webflow help center](https://help.webflow.com/hc/en-us/articles/51059955082387-Updated-pricing-and-simplified-plans-for-May-2026)):

| Date | Who it affects |
|---|---|
| May 13, 2026 | New Site plan purchases |
| On or after June 29, 2026 | Most existing sites, at the next renewal or "billable change" |
| **On or after November 16, 2026** | **Sites in Freelancer or Agency Workspaces, or on legacy pricing from 2022 or earlier**, at the next renewal or billable change |

What changes, per Webflow:
- **Basic:** price "increases to $15/month (yearly) or $25/month (monthly)."
- **CMS:** price "increases to $25/month (yearly) or $39/month (monthly)", and the site moves to Premium.
- **Business:** price "decreases to $25/month (yearly) or $39/month (monthly)", but included bandwidth drops from 100GB to 50GB, so some sites end up paying more once bandwidth add-ons are counted.

Webflow also offers a way to stay put: "If you switch from monthly to yearly billing before the Site plan changes go into effect for your account, you can lock in your current plan for one more year." If you love Webflow, do that. If your site is simple and hasn't changed in months, that extra year is also enough time to plan a calm exit.

## What Webflow costs today

From [webflow.com/pricing](https://webflow.com/pricing), per site:

| Plan | Billed yearly | Billed monthly | Per year (yearly) |
|---|---|---|---|
| Basic (no CMS) | $15/mo | $25/mo | $180 |
| Premium (CMS) | $25/mo | $39/mo | $300 |

Workspace plans are billed **separately**: Core $19/mo yearly ($28 monthly), Growth $49 ($60), Freelancer $16 ($24), Agency $35 ($42). Extra full seats are $39/mo yearly ($45 monthly).

## The rules that decide your timing

From Webflow's [refund policy](https://help.webflow.com/hc/en-us/articles/40102090399635-Webflow-Refund-Policy):

- "**Plan renewals are non-refundable.** To avoid an unwanted renewal, cancel your plan before the next billing date."
- "Annual plans send a reminder **at least 7 days** before renewal." That's not a lot of notice for rebuilding a site.
- New plan purchases are refundable within 14 days. Renewals are not.
- Cancelling keeps your plan active until the end of the current billing cycle, with no refund for the rest of it.

And the one that catches people out:

> When a cancelled Site plan reaches the end of its billing period, "your custom domains are removed and your site is unpublished from its custom domain and its webflow.io subdomain."

So you can't let the plan lapse and sort out the new site afterwards. **The new site must be live on your domain before your Webflow term ends.**

## Step 1: Find your renewal date

Open your site's **Site settings → Plans**. Check your Workspace plan's billing too, because they're separate subscriptions. Put a reminder in your calendar **30 days** before the earliest renewal. Webflow's 7-day reminder is too late to start a rebuild.

## Step 2: Understand what export does (and doesn't) give you

Webflow can export code, but:
- Code export requires a **paid Workspace plan** (Core or above, per the pricing page).
- "Dynamic content (CMS items/pages) can't be exported."
- Webflow's pricing FAQ adds that when you host elsewhere, "forms will stop working."

For a simple static site, the export is a decent starting point. For anything with a blog, plan to export each CMS Collection as CSV and rebuild those pages. Our [Webflow to Next.js playbook](/blog/webflow-to-nextjs) covers the technical side.

## Step 3: Build the new site and host it for free

For simple sites, a static site on Cloudflare Pages is the common destination: "all plans come with unlimited sites, seats, requests, and bandwidth" ([pages.cloudflare.com](https://pages.cloudflare.com/)). Before you switch:

1. Rebuild every page and check it on the preview URL.
2. Replace Webflow forms with a form handler and send a test submission.
3. Map redirects for any URL that changes.
4. Add analytics so you can see traffic arrive after the switch.

## Step 4: Switch DNS while Webflow is still paid

Point your domain at the new host **before** the Webflow term ends. Webflow keeps serving the old site until DNS changes take effect, so you have a safety net. Watch traffic for a few days.

If your domain is registered somewhere else, nothing changes there except the DNS records. If you're unsure where it's registered, check before you cancel anything.

## Step 5: Cancel both plans (Site and Workspace)

Webflow is explicit: "Site plans and Workspace plans are billed separately and cancelled in different places. Cancelling one doesn't cancel the other, so if you're leaving Webflow entirely, cancel both" ([refund policy](https://help.webflow.com/hc/en-us/articles/40102090399635-Webflow-Refund-Policy)).

- **Site plan:** Site settings → Plans → Website tab → **Downgrade to Starter**. Remove any add-ons (like bandwidth) first, because Webflow requires it ([Downgrade or cancel your Site plan](https://help.webflow.com/hc/en-us/articles/33961220482707-Downgrade-or-cancel-your-Site-plan)).
- **Workspace plan:** Workspace settings → Plans → downgrade to the free Starter Workspace. Remove team members and seats first.

Avoid "Downgrade now" unless your new site is already live. Immediate cancellation "takes your site offline right away" and gives no credit.

## A timeline that works

| When | Do this |
|---|---|
| Renewal − 30 days | Inventory pages, forms and CMS; pick host |
| Renewal − 21 days | Rebuild; recreate forms; map redirects |
| Renewal − 10 days | Switch DNS; monitor |
| Renewal − 7 days or earlier | Downgrade Site plan to Starter (end of period) and Workspace plan |
| Renewal date | No charge. Webflow unpublishes the old copy; your domain already points to the new site |

## When you should stay on Webflow

- Your team edits in the Designer every week, or relies on the CMS for a busy blog.
- You run a Webflow store. (Ecommerce plans weren't part of the May changes, per Webflow.)
- You need Webflow's localization, A/B testing or analytics add-ons.

## Who keeps the site updated after you leave?

Your own AI agent. Once the site is files in a repository you own, you can ask it to update pricing or add a case study, check a preview, and approve. Eject migrates simple Webflow sites before your renewal and sets up that agent workflow, including a renewal watch for your domain.

**See the numbers:** [renewal savings calculator](/calculator?p=webflow). **Freelancer or agency with several client sites?** [Talk to us before November 16](/migrate).

## FAQ

**Can I get a refund on a Webflow renewal?**
No. Webflow says plan renewals are non-refundable. New purchases are refundable within 14 days.

**What happens to my site when I cancel Webflow?**
At the end of the billing period your custom domains are removed and the site is unpublished from both the custom domain and the webflow.io subdomain. The project stays in your Workspace.

**Do I need to cancel the Workspace plan too?**
Yes, if you're leaving entirely. Site and Workspace plans are billed and cancelled separately.

**What is changing on November 16, 2026?**
New Site plan pricing reaches existing sites in Freelancer or Agency Workspaces, and sites on legacy pricing from 2022 or earlier, at their next renewal or billable change on or after that date. Switching to yearly billing before then locks your current plan for one more year.

**Can I export my Webflow site?**
With a paid Workspace plan you can export HTML/CSS, but CMS items and pages aren't included and forms stop working when hosted elsewhere.

## Sources (checked October 10, 2026)

- Webflow pricing: https://webflow.com/pricing
- Updated pricing and simplified plans for May 2026: https://help.webflow.com/hc/en-us/articles/51059955082387-Updated-pricing-and-simplified-plans-for-May-2026
- Webflow Refund Policy: https://help.webflow.com/hc/en-us/articles/40102090399635-Webflow-Refund-Policy
- Downgrade or cancel your Site plan: https://help.webflow.com/hc/en-us/articles/33961220482707-Downgrade-or-cancel-your-Site-plan
- Cloudflare Pages: https://pages.cloudflare.com/

*Webflow is a trademark of its owner. Eject is not affiliated with Webflow.*

<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"Can I get a refund on a Webflow renewal?","acceptedAnswer":{"@type":"Answer","text":"No. Webflow's refund policy says plan renewals are non-refundable. New Site and Workspace plan purchases are refundable within 14 days."}},
{"@type":"Question","name":"What happens to my site when I cancel Webflow?","acceptedAnswer":{"@type":"Answer","text":"At the end of the billing period, custom domains are removed and the site is unpublished from its custom domain and its webflow.io subdomain. The project stays in your Workspace."}},
{"@type":"Question","name":"Do I need to cancel the Webflow Workspace plan too?","acceptedAnswer":{"@type":"Answer","text":"Yes, if you are leaving entirely. Webflow bills and cancels Site plans and Workspace plans separately."}},
{"@type":"Question","name":"What is changing on November 16, 2026?","acceptedAnswer":{"@type":"Answer","text":"Webflow's new Site plan pricing takes effect for existing sites in Freelancer or Agency Workspaces, and sites on legacy pricing from 2022 or earlier, at the next renewal or billable change on or after November 16, 2026. Switching to yearly billing before then locks the current plan for one more year."}},
{"@type":"Question","name":"Can I export my Webflow site?","acceptedAnswer":{"@type":"Answer","text":"With a paid Workspace plan you can export HTML and CSS, but CMS items and pages are not included and forms stop working when hosted elsewhere."}}
]}
</script>


## Where to go next

Automated is $99 and you can buy it on the spot. Done for you is $199 after a call, for a simple site. See [renewal watch](/renewal-watch), [book a call](/book).
