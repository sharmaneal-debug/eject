import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

// Generate Open Graph images dynamically. Each page sets
// `openGraph.images` to /og?title=...&subtitle=...
//
// Defaults to siteConfig.tagline if no params are passed (homepage / OG).

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || siteConfig.tagline).slice(0, 100);
  const subtitle = (searchParams.get("subtitle") || siteConfig.shortTagline).slice(0, 120);
  const eyebrow = (searchParams.get("eyebrow") || siteConfig.name).slice(0, 40);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FBFAF7",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle gradient blobs */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: -50,
            width: 480,
            height: 480,
            borderRadius: 999,
            background: "rgba(255, 92, 42, 0.18)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -50,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(0, 102, 255, 0.14)",
            filter: "blur(80px)",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            fontFamily: "ui-monospace, Menlo, monospace",
            textTransform: "uppercase",
            letterSpacing: 4,
            color: "#5A5A66",
            marginBottom: 30,
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#FF5C2A" }} />
          {eyebrow}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 600,
            color: "#0B0B0F",
            letterSpacing: "-0.04em",
            lineHeight: 1.0,
            maxWidth: 1000,
            marginBottom: 28,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: "#1A1A20",
            lineHeight: 1.3,
            maxWidth: 900,
          }}
        >
          {subtitle}
        </div>

        {/* Footer brand mark */}
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 80,
            right: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "#0B0B0F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Eject mark drawn inline (next/og doesn't support external SVG components) */}
              <svg width="22" height="22" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7 L24 19 H8 Z" fill="#FF5C2A" />
                <rect x="8" y="21" width="16" height="4" rx="1" fill="#FBFAF7" />
              </svg>
            </div>
            <span style={{ fontSize: 24, fontWeight: 600, color: "#0B0B0F", fontFamily: "system-ui" }}>
              {siteConfig.name}
            </span>
          </div>
          <span style={{ color: "#5A5A66" }}>{siteConfig.domain}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
