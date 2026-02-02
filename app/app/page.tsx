import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";

import AnalyzeClient from "@/components/app/analyze-client";
import RecentAnalyses from "@/components/app/recent-analyses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubscriptionState, isPremiumActive } from "@/lib/subscription";

export const metadata: Metadata = {
  title: "Analyze your message",
  description:
    "Analyze your draft with Reflxy to see clarity, warmth, and risk before you send.",
  alternates: {
    canonical: "/app",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AppPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const subscription = userId ? await getSubscriptionState(userId) : null;
  const isPremium = isPremiumActive(subscription);
  const dailyLimit = 5;

  const today = new Date();
  const usageDate = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );

  let remaining: number | null = null;

  if (!isPremium && userId) {
    const usage = await prisma.dailyUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: usageDate,
        },
      },
    });
    remaining = Math.max(0, dailyLimit - (usage?.count ?? 0));
  }

  if (!isPremium && !userId) {
    const cookieStore = cookies();
    const usageCookie = cookieStore.get("reflxy_usage")?.value;
    const dayKey = usageDate.toISOString().slice(0, 10);
    if (usageCookie) {
      try {
        const parsed = JSON.parse(usageCookie) as {
          day: string;
          count: number;
        };
        if (parsed.day === dayKey) {
          remaining = Math.max(0, dailyLimit - parsed.count);
        }
      } catch {
        remaining = dailyLimit;
      }
    } else {
      remaining = dailyLimit;
    }
  }

  const planLabel = isPremium ? "Premium" : "Free plan";
  const historyLabel = isPremium ? "Unlimited history" : "Last 10 saved";
  const scenarioLabel = isPremium ? "Scenario mode active" : "Scenario mode locked";
  const usageLabel = isPremium
    ? "Unlimited analyses"
    : remaining !== null
    ? `${remaining} of ${dailyLimit} left today`
    : `Free plan includes ${dailyLimit} per day`;

  return (
    <div className="space-y-12">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="surface-aurora p-[1px]">
          <div className="relative overflow-hidden rounded-[32px] bg-white/90 p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
            />
            <div className="relative space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="bg-white/70">
                  Reflxy workspace
                </Badge>
                <span className="section-kicker">{planLabel}</span>
                {!userId && (
                  <Link href="/auth" className="text-sm text-primary">
                    Sign in to save history
                  </Link>
                )}
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  Understand the emotional impact before your message leaves your
                  outbox.
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Paste a draft, run a calm analysis, and decide what to send with
                  clarity. Reflxy is reflective decision support, not a writing
                  assistant.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {!session?.user && (
                  <Link href="/auth">
                    <Button variant="outline" size="sm">
                      Save your history
                    </Button>
                  </Link>
                )}
                {!isPremium && (
                  <Link href="/pricing">
                    <Button variant="ghost" size="sm">
                      Explore premium
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="surface-sunrise p-5">
            <div className="section-kicker">Daily usage</div>
            <p className="mt-2 text-sm text-foreground">{usageLabel}</p>
          </div>
          <div className="surface-muted p-5">
            <div className="section-kicker">Scenario mode</div>
            <p className="mt-2 text-sm text-foreground">{scenarioLabel}</p>
          </div>
          <div className="surface-glass p-5">
            <div className="section-kicker">History</div>
            <p className="mt-2 text-sm text-foreground">{historyLabel}</p>
          </div>
        </div>
      </section>
      <AnalyzeClient
        isPremium={isPremium}
        remaining={remaining}
        dailyLimit={dailyLimit}
        hasUser={Boolean(userId)}
      />
      {userId ? <RecentAnalyses userId={userId} isPremium={isPremium} /> : null}
    </div>
  );
}
