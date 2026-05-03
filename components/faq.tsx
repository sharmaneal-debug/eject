import { Section, Eyebrow } from "./section";

const items = [
 {
 q: "Will my site look different?",
 a: "No. We rebuild it pixel-for-pixel. Same fonts, colors, photos, copy. Your visitors won't notice anything changed. The only thing different is your bill.",
 },
 {
 q: "What about my domain?",
 a: "It comes with you. Same URL, same Google ranking, same email forwarding. We handle the technical move so your visitors land in the right place from day one.",
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
 q: "Is this really free hosting?",
 a: "Yes. Cloudflare's free tier covers more traffic than 99% of small business websites ever get. Your only ongoing cost is your domain (about $15 a year), which you already pay.",
 },
 {
 q: "What about my contact form?",
 a: "We rebuild it. Submissions go to your email, just like before. Free up to 3,000 a month. Far more than most businesses ever receive.",
 },
 {
 q: "Do you migrate Shopify or WordPress?",
 a: "Not yet. We focus on Webflow, Framer, Wix, and Squarespace. If you're on something else, drop us an email and we'll tell you whether it's a good fit.",
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
