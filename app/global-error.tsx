"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", background: "#FBFAF7", color: "#0B0B0F", padding: "48px" }}>
        <h1 style={{ fontSize: "2rem" }}>This page hit an error.</h1>
        <p>Reference: {error.digest || "none"}</p>
        <button type="button" onClick={() => reset()}>
          Try again
        </button>
      </body>
    </html>
  );
}
