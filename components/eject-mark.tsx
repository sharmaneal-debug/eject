// The Eject brand mark: a triangle over a bar (the ⏏ Unicode eject glyph,
// drawn as actual SVG paths so it renders cleanly at any size and matches
// across browsers regardless of the system font's emoji rendering).

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
