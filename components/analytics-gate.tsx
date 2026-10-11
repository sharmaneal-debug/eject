"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export function AnalyticsGate() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const read = () => setAllowed(window.localStorage.getItem("eject-cookie-choice") === "analytics");
    read();
    window.addEventListener("eject-cookie-choice", read);
    return () => window.removeEventListener("eject-cookie-choice", read);
  }, []);

  if (!allowed) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
