import { Section, Eyebrow } from "./section";

const benefits = [
  {
    headline: "You can edit it by chatting with any AI.",
    body: "Your website is just a folder of files. Open ChatGPT, Claude, or Cursor. Say \"change my hero to: We make great coffee.\" Done. No tool to learn. No designer to hire. No login to Webflow.",
    chip: "ChatGPT · Claude · Cursor — free tiers all work",
  },
  {
    headline: "Nobody can hike your bill.",
    body: "Webflow doubled its prices in 2024. Framer tripled them in 2025. When you own your site, that doesn't matter — there's no bill to hike. Your only ongoing cost is your domain (~$15 a year). That's it.",
    chip: "$0/mo for hosting. Forever.",
  },
  {
    headline: "If anything goes wrong, you can move in 10 minutes.",
    body: "Hosting issue? Move to a different free host with one click. Don't like our work? Hire any developer. We're not in the loop after we hand you the keys. There's nothing to lock you in because there's no us.",
    chip: "Cloudflare · Vercel · Netlify · GitHub Pages — pick any",
  },
  {
    headline: "Your old domain comes with you.",
    body: "Same URL. Same Google rankings. Same email forwarding. Old links keep working because we set up redirects from every old page. Your visitors don't know anything changed.",
    chip: "We handle DNS so you don't have to think about it",
  },
];

export function WhyOwn() {
  return (
    <Section className="bg-white border-y border-line">
      <Eyebrow>Why this matters</Eyebrow>
      <h2 className="h-section text-3xl md:text-5xl max-w-3xl mb-4">
        Owning your website{" "}
        <span className="text-ink/40">is the new flex.</span>
      </h2>
      <p className="text-ink-soft max-w-2xl mb-14 text-lg leading-relaxed">
        For 10 years, you had to pay $30 a month for a website that wasn&apos;t yours. With AI, you don&apos;t anymore. Here&apos;s what changes when the site is yours.
      </p>

      <div className="grid md:grid-cols-2 gap-x-12 gap-y-12 max-w-5xl">
        {benefits.map((b, i) => (
          <div key={b.headline} className="relative">
            <div className="font-mono text-xs text-signal mb-4 tracking-widest">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className="h-section text-2xl md:text-3xl mb-3 max-w-md tracking-tight">
              {b.headline}
            </h3>
            <p className="text-ink-soft leading-relaxed mb-4 max-w-md">
              {b.body}
            </p>
            <p className="inline-flex items-center text-xs font-mono text-ink-muted bg-paper-warm border border-line rounded-full px-3 py-1.5">
              {b.chip}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
