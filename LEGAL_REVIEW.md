# Legal review list

This file is for a lawyer. Nothing in the site, the terms, the privacy policy, the refunds page, or the disclaimers is a finished legal opinion. The product copy describes what the software does today.

## Entity

- The footer and `lib/site.ts` say the operator is **Laniakea LLC**.
- That name appears in this repository (`lib/site.ts`, `docs/setup-resend.md`, `docs/buildout-plan.md`). This workspace has no formation certificate, operating agreement, or vault document.
- **Uncertain:** whether "Laniakea LLC" is the exact registered name, the formation state, the registered address, and whether Georgia is that state. Do not treat Georgia as confirmed.
- Governing law and arbitration were removed from a definitive sentence in the terms until this is confirmed.

## Items that need review

1. **CAN-SPAM.** Renewal reminders are commercial email. They include an unsubscribe link. Confirm the from-address, postal address requirement, and that order emails are classified correctly as transactional.
2. **GDPR and UK GDPR.** Scans fetch public pages. Booking and checkout collect name, email, and URL. Confirm lawful basis, retention, and whether a representative or DPA is required. The cookie notice gates analytics. Confirm that is enough for the analytics vendor actually used.
3. **CCPA / CPRA.** Confirm whether the business meets the thresholds, and whether "we do not sell personal information" is accurate once analytics and any lead webhook are on.
4. **Tax and merchant of record.** Stripe collects the card. Sales tax is mentioned as something that may be added. Confirm who is merchant of record, whether Stripe Tax is on, and nexus.
5. **Liability cap and indemnity.** The terms cap liability at fees paid in the prior 12 months and include an indemnity. Confirm enforceability and consumer exceptions.
6. **Refund law.** The product offers a 14-day window and a person-sent refund when a site is out of scope. The app does not call Stripe to refund. Confirm this matches card-network and state automatic-renewal rules. Eject itself is not a subscription. The customer's old platform may be.
7. **Copying third-party sites and IP.** The customer must have rights to the text, images, and brand. Platform terms (Framer, Webflow, Wix, Squarespace) may restrict export. Confirm the intake representation is enough, and what we do with snapshots after delivery or refund.
8. **AI disclosures.** A rebuild may send public HTML to an AI vendor when a key is configured. The customer then edits with their own agent. Confirm disclosure, subprocessors, and training opt-out language.
9. **Cookies.** Analytics and speed insights load only after an "Allow analytics" choice stored in localStorage. Confirm whether that storage itself is a cookie or similar technology that needs consent in the EU.
10. **Booking.** `BOOKING_URL` may embed Cal.com or Google Calendar. Those vendors receive the booking. Name them in the privacy policy once the URL is chosen.
11. **Receipts.** Stripe can email a receipt when `receipt_email` is set and the Stripe account allows it. We also send our own confirmation through Resend. Confirm both are acceptable and what happens when Resend is unset (the send is skipped).
12. **No contractor model.** Done for you is described as Neal and a colleague, not a contractor marketplace. Confirm employment or contractor status of the colleague before that sentence is public.
