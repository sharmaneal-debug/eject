// The Eject brand mark: triangle over a bar (the ⏏ Unicode eject glyph),
// drawn as actual SVG paths so it renders cleanly at any size and matches
// across browsers regardless of font fallback.
//
// Solid mono mark (cream-on-ink for the favicon, currentColor for inline use).

export function EjectMark({
  className = "",
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path d="M16 7 L24 19 H8 Z" fill="currentColor" />
      <rect x="8" y="21" width="16" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}
