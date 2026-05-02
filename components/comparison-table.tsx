import { Section, Eyebrow } from "./section";
import { Check, X } from "lucide-react";

const rows = [
  { label: "Real annual cost", webflow: "$300–$2,800", eject: "$5 (just the domain)" },
  { label: "Code export", webflow: "Static HTML, gated", eject: "Full Next.js repo, yours" },
  { label: "CMS migration", webflow: "—", eject: "API extracted to MDX or Sanity" },
  { label: "Forms", webflow: "Limit 250/mo", eject: "Resend free tier" },
  { label: "SEO continuity", webflow: "Up to you", eject: "301 redirects + canonicals included" },
  { label: "Editor for non-coders", webflow: true, eject: "AI chat editor (optional, $79/mo)" },
  { label: "Vendor lock-in", webflow: true, eject: false },
  { label: "Hosting redundancy", webflow: "Webflow only", eject: "Move to Vercel in 10 minutes" },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <X className="h-4 w-4 text-ink-muted inline" />;
  if (value === false) return <Check className="h-4 w-4 text-signal inline" />;
  return <span>{value}</span>;
}

export function ComparisonTable() {
  return (
    <Section>
      <Eyebrow>Honest comparison</Eyebrow>
      <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-3">
        Same site. Different bill. <span className="text-ink/40">Different freedom.</span>
      </h2>
      <p className="text-ink-soft max-w-2xl mb-12">
        Numbers below assume a typical CMS-backed marketing site on Webflow's CMS plan over 36 months. Adjust your own in the calculator.
      </p>

      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="grid grid-cols-3 bg-paper-warm border-b border-line text-xs font-mono uppercase tracking-widest text-ink-muted">
          <div className="p-4">Dimension</div>
          <div className="p-4 border-l border-line">On Webflow</div>
          <div className="p-4 border-l border-line bg-signal/10 text-ink">On Eject</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={`grid grid-cols-3 ${i !== rows.length - 1 ? "border-b border-line" : ""}`}
          >
            <div className="p-5 font-medium text-sm">{r.label}</div>
            <div className="p-5 border-l border-line text-sm text-ink-soft">
              <Cell value={r.webflow} />
            </div>
            <div className="p-5 border-l border-line text-sm bg-signal/[0.04] text-ink">
              <Cell value={r.eject} />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
