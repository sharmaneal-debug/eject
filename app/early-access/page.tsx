import type { Metadata } from "next";
import Link from "next/link";
import { CostCalculator } from "@/components/cost-calculator";
import { EarlyAccessForm } from "@/components/early-access-form";
import { SiteScanForm } from "@/components/site-scan-form";
import { checkoutOpen } from "@/lib/checkout-gate";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Early access",
  description: "Launching soon. Join the list.",
  path: "/early-access",
});

export default function Page() {
  const open = checkoutOpen();
  return (
    <section className="mx-auto max-w-content min-w-0 px-4 py-10 sm:px-6 md:py-16">
      <h1 className="h-display text-4xl tracking-tight md:text-6xl">Launching soon. Join the list.</h1>
      <p className="mt-4 max-w-xl text-lg text-ink-soft">
        {open
          ? "Free scan and a savings calculator. Test checkout is open from the link below."
          : "Free scan and a savings calculator. No payment on this page."}
      </p>
      <div className="mt-8">
        <SiteScanForm />
      </div>
      <div className="mt-10">
        <CostCalculator />
      </div>
      <div className="mt-10">
        <EarlyAccessForm />
      </div>
      {open ? (
        <p className="mt-8 text-base">
          <Link href="/checkout?tier=automated" className="inline-flex min-h-11 items-center text-accent underline-offset-2 hover:underline">
            Test checkout is open
          </Link>
        </p>
      ) : null}
    </section>
  );
}
