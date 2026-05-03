import { Section, Eyebrow } from "./section";

const rows = [
 { label: "What you pay", before: "$300–$2,800 a year, every year", after: "$299–$499 once. Then your domain (~$15/yr)." },
 { label: "Editing your site", before: "Their editor only. Subscription required.", after: "Any AI you already use. ChatGPT, Claude, Cursor." },
 { label: "Hosting", before: "Their hosting only. Goes down? Tough.", after: "Cloudflare free tier. Move to Vercel in 10 minutes if you want." },
 { label: "If they raise prices", before: "You pay it or rebuild from scratch.", after: "You don't. The site is yours." },
 { label: "If they shut your account", before: "Your site disappears.", after: "Nothing happens. We're not in the loop." },
 { label: "Your old domain", before: "Tied to their account.", after: "Comes with you. Same URL. Same rankings." },
];

export function ComparisonTable() {
 return (
 <Section>
 <Eyebrow>Honest comparison</Eyebrow>
 <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-3">
 Same site.{" "}
 <span className="text-ink/40">No more monthly bills.</span>
 </h2>
 <p className="text-ink-soft max-w-2xl mb-12">
 Webflow, Framer, Wix, Squarespace: they all work the same way. They charge you forever. Eject ends that.
 </p>

 <div className="rounded-2xl border border-line bg-white overflow-hidden">
 <div className="grid grid-cols-[1.2fr_1fr_1fr] bg-paper-warm border-b border-line text-xs font-mono uppercase tracking-widest text-ink-muted">
 <div className="p-4">&nbsp;</div>
 <div className="p-4 border-l border-line">Today</div>
 <div className="p-4 border-l border-line bg-signal/10 text-ink">After Eject</div>
 </div>
 {rows.map((r, i) => (
 <div
 key={r.label}
 className={`grid grid-cols-[1.2fr_1fr_1fr] ${i !== rows.length - 1 ? "border-b border-line" : ""}`}
 >
 <div className="p-5 font-medium text-sm">{r.label}</div>
 <div className="p-5 border-l border-line text-sm text-ink-soft">{r.before}</div>
 <div className="p-5 border-l border-line text-sm bg-signal/[0.04] text-ink">{r.after}</div>
 </div>
 ))}
 </div>
 </Section>
 );
}
