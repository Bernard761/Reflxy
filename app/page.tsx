import type { Metadata } from "next";
import Link from "next/link";

import RippleVisualization from "@/components/app/ripple-visualization";
import MarketingLayout from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Emotional impact analysis for written messages",
  description:
    "Reflxy helps you understand the emotional impact of messages before sending with a calm ripple visualization.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Reflxy",
    description:
      "Understand the emotional impact of messages before you send with a calm ripple visualization.",
    url: siteConfig.url,
    images: [siteConfig.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reflxy",
    description:
      "Understand the emotional impact of messages before you send with a calm ripple visualization.",
    images: [siteConfig.ogImage],
  },
};

export default function Home() {
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Reflxy",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Reflxy helps you understand the emotional impact of written messages before you send.",
    url: siteConfig.url,
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Free",
      },
      {
        "@type": "Offer",
        price: "12",
        priceCurrency: "USD",
        name: "Premium Monthly",
      },
    ],
  };

  return (
    <MarketingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <div className="container pb-24 pt-16">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="bg-white/70">
                Reflective decision support
              </Badge>
              <span className="section-kicker">Reflxy workspace</span>
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                See the emotional echo of your message before you send.
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                Reflxy shows how your words may land over time. Paste a draft,
                view the ripple impact, and decide with clarity. It never rewrites
                your message.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/app">
                <Button size="lg">Try it free</Button>
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground">
                View pricing details -&gt;
              </Link>
            </div>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
              {[
                {
                  label: "Daily checks",
                  value: "5 free analyses",
                },
                {
                  label: "History",
                  value: "Last 10 saved",
                },
                {
                  label: "Scenario mode",
                  value: "Premium unlock",
                },
              ].map((item) => (
                <div key={item.label} className="surface-muted p-4">
                  <div className="section-kicker">{item.label}</div>
                  <p className="mt-2 text-sm text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="section-kicker">Ripple preview</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Clarity, warmth, and risk mapped over time.
                </p>
              </div>
              <Badge variant="accent">Live sample</Badge>
            </div>
            <div className="mt-6">
              <RippleVisualization
                clarity={74}
                warmth={68}
                risk={26}
                variant="compact"
              />
            </div>
            <div className="mt-6 grid gap-3 text-xs text-muted-foreground [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
              {[
                {
                  label: "Now",
                  detail: "Immediate emotional temperature.",
                  className:
                    "bg-[linear-gradient(140deg,rgba(207,239,247,0.7),rgba(255,255,255,0.95))]",
                },
                {
                  label: "24 hours",
                  detail: "How the message lingers after reflection.",
                  className:
                    "bg-[linear-gradient(140deg,rgba(255,237,205,0.8),rgba(255,255,255,0.95))]",
                },
                {
                  label: "1 week",
                  detail: "What likely sticks in memory.",
                  className:
                    "bg-[linear-gradient(140deg,rgba(254,224,214,0.7),rgba(255,255,255,0.95))]",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border border-border/60 p-3 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.2)] ${item.className}`}
                >
                  <div className="section-kicker">{item.label}</div>
                  <p className="mt-2 text-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
            <div className="surface-glass mt-6 p-4 text-sm text-muted-foreground">
              <div className="section-kicker">Echo summary</div>
              <p className="mt-2 text-foreground">
                The message feels clear and supportive, with low emotional risk over
                time.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Paste your draft",
              description:
                "Keep your original words. Reflxy reflects the tone you plan to send.",
            },
            {
              title: "Read the ripple",
              description:
                "A calm visualization shows how emotion may evolve now, tomorrow, and next week.",
            },
            {
              title: "Decide with care",
              description:
                "Use the summary and optional suggestions to make the final call.",
            },
          ].map((step) => (
            <div key={step.title} className="surface-card p-6">
              <div className="section-kicker">Step</div>
              <h3 className="mt-3 font-display text-xl font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-20 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="section-kicker">Scenario mode</div>
            <h2 className="font-display text-3xl font-semibold">
              Tune the analysis to the relationship dynamic.
            </h2>
            <p className="text-sm text-muted-foreground">
              Premium scenario mode adjusts clarity, warmth, and risk weighting
              based on who the message is for. You still decide what to send.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Boss",
                  detail: "Prioritize clarity and risk awareness.",
                },
                {
                  title: "Partner",
                  detail: "Elevate warmth and long-term impact.",
                },
                {
                  title: "Client",
                  detail: "Balance clarity with reassurance.",
                },
              ].map((item) => (
                <div key={item.title} className="surface-muted p-4">
                  <div className="text-sm font-medium text-foreground">
                    {item.title}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="surface-card p-6">
            <div className="section-kicker">Trusted by calm communicators</div>
            <div className="mt-4 space-y-4 text-sm text-muted-foreground">
              {[
                "Reflxy helps us slow down before sending sensitive client updates.",
                "Scenario mode is the fastest way to sanity-check executive comms.",
                "It helps me write tough notes without second-guessing the tone.",
              ].map((quote) => (
                <div key={quote} className="surface-muted p-4">
                  “{quote}”
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20 surface-card p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="section-kicker">Ready to start?</div>
              <h2 className="mt-3 font-display text-3xl font-semibold">
                Try Reflxy free and see the ripple before you send.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Five free analyses per day. Upgrade only if you want deeper insight.
              </p>
            </div>
            <Link href="/app">
              <Button variant="outline" size="lg">
                Try it free
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
