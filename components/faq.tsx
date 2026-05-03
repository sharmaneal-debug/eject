import { Section, Eyebrow } from "./section";

const items = [
 {
 q: "Will my site look different?",
 a: "No. We rebuild it pixel-for-pixel. Same fonts, colors, photos, copy. Your visitors won't notice anything changed. The only thing different is your bill.",
 },
 {
 q: "What about my domain?",
 a: "It comes with you. Same URL, same Google rankings, same email forwarding. Concierge: we move the domain to point at your new host for you. Express: we hand you the DNS records and a guide; the move takes about 5 minutes at your registrar.",
 },
 {
 q: "What if I want to change something later?",
 a: "Open ChatGPT, Claude, or Cursor (free tiers all work) and paste the instructions we send you. Then type what you want changed in plain English. The AI handles it. We're happy to help if you get stuck. For the first 30 days, it's free.",
 },
 {
 q: "Will my SEO stay the same?",
 a: "Yes. And usually it improves. We set up redirects from every old page so Google finds your new site at the right addresses. Sites we've moved typically score 30–50 points higher on Google's PageSpeed test.",
 },
 {
 q: "Where does my new site actually live?",
 a: "On any free static host you want. Cloudflare Pages, Netlify, Vercel, GitHub Pages. All four have free tiers that cover small-business traffic without ever charging. We give you a 10-minute setup guide (Express) or do the setup for you (Concierge). Eject doesn't host anything; the site is on infrastructure you control, in your name. Your only ongoing cost is your domain (~$15/year), which you already pay.",
 },
 {
 q: "What about my contact form?",
 a: "We rebuild it. Submissions go to your email, just like before. Free up to 3,000 a month. Far more than most businesses ever receive.",
 },
 {
 q: "Do you migrate Shopify?",
 a: "Not yet. We migrate marketing sites on Webflow, Framer, Wix, Squarespace, and WordPress. Shopify storefronts are a different beast (live carts, payment flows, inventory) and need a real ecommerce migration, not a marketing-site rebuild. If you're on Shopify, email us and we'll tell you whether your case is a fit.",
 },
 {
 q: "What if I don't like it?",
 a: "If we hand you the migrated site and you're not happy with it within 14 days, full refund. No arguments.",
 },
];

export function Faq() {
 return (
 <Section>
 <Eyebrow>FAQ</Eyebrow>
 <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-12">
 The questions we get most.
 </h2>
 <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl">
 {items.map((it) => (
 <div key={it.q}>
 <p className="font-semibold text-ink mb-2 text-lg tracking-tight">{it.q}</p>
 <p className="text-ink-soft leading-relaxed">{it.a}</p>
 </div>
 ))}
 </div>
 </Section>
 );
}
