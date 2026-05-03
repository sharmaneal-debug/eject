// The Eject brand mark: a triangle (signal orange) over a bar (cream),
// drawn as actual SVG paths so it renders cleanly at any size and matches
// across browsers regardless of the system font's emoji rendering.
//
// Variants:
//   - default: orange triangle + cream bar (full color, for a dark background)
//   - mono: both pieces use currentColor (for tinting in headers/footers
//     where the surrounding container provides the background)

export function EjectMark({
  className = "",
  size = 24,
  variant = "default",
}: {
  className?: string;
  size?: number;
  variant?: "default" | "mono";
}) {
  const triangleFill = variant === "mono" ? "currentColor" : "#FF5C2A";
  const barFill = variant === "mono" ? "currentColor" : "#FBFAF7";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path d="M16 7 L24 19 H8 Z" fill={triangleFill} />
      <rect x="8" y="21" width="16" height="4" rx="1" fill={barFill} />
    </svg>
  );
}
