import type { Metadata } from "next";
import Link from "next/link";

import MarketingLayout from "@/components/marketing/marketing-layout";
import PricingTable from "@/components/marketing/pricing-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Reflxy pricing for free and premium plans. Upgrade to unlock scenario mode and unlimited analyses.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <MarketingLayout>
      <div className="container py-16">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <Badge variant="outline" className="w-fit bg-white/70">
              Pricing
            </Badge>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Calm, confident communication at any scale.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Start free and upgrade when you want deeper analysis. Yearly plans
              save you more, and you can cancel anytime.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/app">
                <Button size="lg">Try it free</Button>
              </Link>
              <span className="text-sm text-muted-foreground">
                No credit card required.
              </span>
            </div>
          </div>
          <div className="surface-glass p-6">
            <div className="section-kicker">Included with premium</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Unlimited analyses with scenario weighting</li>
              <li>Unlimited history and PDF exports</li>
              <li>Impact timeline for longer-term reflection</li>
            </ul>
          </div>
        </section>

        <div className="mt-12">
          <PricingTable />
        </div>
      </div>
    </MarketingLayout>
  );
}
