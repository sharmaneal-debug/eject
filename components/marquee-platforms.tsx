const platforms = ["Webflow", "Framer", "Wix", "Squarespace", "Carrd", "Shopify", "Showit", "Cargo"];

export function MarqueePlatforms() {
  return (
    <div className="border-y border-line bg-paper-warm py-5 overflow-hidden">
      <div className="flex items-center gap-12 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
        {[...platforms, ...platforms, ...platforms].map((p, i) => (
          <span key={i} className="text-ink-muted font-medium tracking-tight text-lg flex items-center gap-3">
            <span className="inline-block h-1 w-1 rounded-full bg-line" />
            {p}
            <span className="text-signal/80 text-xs font-mono">→ Next.js</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }`}</style>
    </div>
  );
}
