# Legal review list

This file is for a lawyer. The pages in this pull request are plain-language descriptions of the public website as it works on `main` today. They are not a finished legal opinion.

Checkout on the public site is not fully working. A payment does not start an automatic rebuild. This branch does not add a booking page, renewal reminders, or new order-email templates.

## Entity

- The footer and `lib/site.ts` say the operator is **Laniakea LLC**.
- That name also appears in `docs/setup-resend.md` and `docs/buildout-plan.md`. This repository has no formation certificate, operating agreement, or vault document.
- **Uncertain:** whether "Laniakea LLC" is the exact registered name, the formation state, the registered address, and whether Georgia is that state. Do not treat Georgia as confirmed.
- The terms do not name a governing state and do not require arbitration until this is confirmed.

## Items that need review

1. **CAN-SPAM.** This branch does not add a mailing program. The existing checkout code can try to send mail after a successful Stripe session, and that path is not reliable today. Confirm the from-address, the physical postal address, and whether those messages are transactional, before any commercial email goes out.
2. **GDPR and UK GDPR.** The public scan fetches pages the visitor submits. Checkout, when it works, collects name, email, and URL. Confirm lawful basis, retention, and whether a representative or a data-processing agreement is required. The cookie notice stores a choice and does not load an analytics script.
3. **CCPA / CPRA.** Confirm whether the business meets the thresholds, and whether "we do not sell personal information" stays accurate if a lead webhook or analytics is turned on later.
4. **Tax and merchant of record.** Stripe is the intended card processor. The terms say sales tax may be added. Confirm who is merchant of record, whether Stripe Tax is on, and where the business has nexus. Checkout may not complete on the live site yet.
5. **Liability cap and indemnity.** The terms cap liability at fees paid in the prior 12 months and include an indemnity. Confirm enforceability and consumer exceptions.
6. **Refund law.** The refunds page offers a 14-day window after delivery, a refund when nothing was delivered or the site is out of scope, and a person-sent refund. The website does not call Stripe to refund. Confirm this against card-network rules and state law. Eject is not a subscription. The customer's old platform may be.
7. **Copying third-party sites and IP.** The customer must have rights to the text, images, and brand. Platform terms (Framer, Webflow, Wix, Squarespace, and others) may restrict export. Confirm what we may keep after delivery or a refund.
8. **AI disclosures.** The public scan does not send page content to an AI model. A person might use an AI vendor later for a specific order. Confirm disclosure, subprocessors, and training language before that is a normal step.
9. **Cookies.** The banner stores `eject-cookie-choice` in localStorage. No analytics script loads. "Allow analytics" only saves the preference. Confirm whether that storage needs consent in the EU, and update the privacy page before any analytics vendor is added.
10. **Booking.** This version of the site has no calendar embed and no booking vendor. If one is added later, name it in the privacy policy.
11. **Receipts.** A working Stripe Checkout session can cause Stripe to email the customer, depending on the Stripe account. Our own mail depends on Resend being configured and on checkout finishing. Confirm both before relying on them.
12. **Who does the work.** The public pages say the operator is Laniakea LLC. They do not name a person and they do not describe a contractor marketplace. Confirm who performs a paid order before that is spelled out on the site.
