"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Interval = "monthly" | "yearly";

export default function PricingTable() {
  const [interval, setInterval] = React.useState<Interval>("monthly");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });

      if (response.status === 401) {
        window.location.href = "/auth";
        return;
      }

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to start checkout.");
      }

      const payload = (await response.json()) as { url: string };
      window.location.href = payload.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const pricing =
    interval === "monthly"
      ? { price: "$12", cadence: "per month" }
      : { price: "$96", cadence: "per year", savings: "Save 33%" };

  const features = [
    "Unlimited analyses and history",
    "Scenario mode: boss, partner, client",
    "Export as PDF + impact timeline",
    "Priority support",
  ];

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-border/70 bg-white/70 p-1 text-xs sm:text-sm">
        {(["monthly", "yearly"] as Interval[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setInterval(value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition sm:text-sm",
              interval === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            {value === "monthly" ? "Monthly" : "Yearly"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-white/80">
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>For thoughtful, occasional check-ins.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="text-3xl font-semibold text-foreground">$0</div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                5 analyses per day
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Basic ripple visualization
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Last 10 saved analyses
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-[linear-gradient(140deg,rgba(207,239,247,0.5),rgba(255,255,255,0.95))]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Premium</CardTitle>
              {pricing.savings && <Badge variant="accent">{pricing.savings}</Badge>}
            </div>
            <CardDescription>
              Unlimited insights for leaders and client-facing teams.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-semibold text-foreground">
                {pricing.price}
              </div>
              <span>{pricing.cadence}</span>
            </div>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button variant="outline" onClick={handleCheckout} disabled={isLoading}>
              {isLoading ? "Opening checkout..." : "Upgrade to premium"}
            </Button>
            <p className="text-xs text-muted-foreground">Cancel anytime.</p>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
