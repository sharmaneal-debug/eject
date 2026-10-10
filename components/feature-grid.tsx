import { Section, Eyebrow } from "./section";
import { siteConfig, doneForYouCapLabel } from "@/lib/site";

const features = [
 {
 badge: "01",
 title: "Edit by chatting",
 body: `${siteConfig.editing.lead} ${siteConfig.editing.included} ChatGPT, Claude, or Cursor. We don't run a hosted editor you keep paying for.`,
 },
 {
 badge: "02",
 title: "Simple sites only",
 body: "Marketing pages, portfolios, and landing pages. If the site is a store, a member area, or a CMS, we say so and refer you out.",
 },
 {
 badge: "03",
 title: `${siteConfig.pricing.express.name}, $${siteConfig.pricing.express.price}`,
 body: "We run an automated migration of a simple site. You review the pages before DNS. It is not a preview before you pay, and it does not extract a CMS.",
 },
 {
 badge: "04",
 title: "Custom migration",
 body: `A person does the move by hand: ${doneForYouCapLabel()}. Beyond that, we refer out or quote an add-on.`,
 },
 {
 badge: "05",
 title: "Hosting you can leave",
 body: "The result goes on a free static host in an account you control. Eject does not sit in the middle of the site after handoff.",
 },
 {
 badge: "06",
 title: "You own the files",
 body: "The result is a folder of code. There is no Eject login to keep paying. Your domain stays at your registrar.",
 },
];

export function FeatureGrid() {
 return (
 <Section className="bg-white border-y border-line">
 <Eyebrow>What you get</Eyebrow>
 <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-12">
 Chat with your own AI.{" "}
 <span className="text-ink/40">After the site is yours.</span>
 </h2>
 <div className="grid md:grid-cols-2 gap-px bg-line rounded-2xl overflow-hidden border border-line">
 {features.map((f) => (
 <div key={f.badge} className="bg-white p-7 md:p-9">
 <div className="flex items-center gap-3 mb-4">
 <span className="font-mono text-xs text-signal tracking-widest">{f.badge}</span>
 <span className="h-px flex-1 bg-line" />
 </div>
 <h3 className="font-semibold text-xl tracking-tight mb-2">{f.title}</h3>
 <p className="text-ink-soft leading-relaxed">{f.body}</p>
 </div>
 ))}
 </div>
 </Section>
 );
}
