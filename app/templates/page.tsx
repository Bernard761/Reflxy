import type { Metadata } from "next";
import Link from "next/link";

import MarketingLayout from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { templates } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Message templates",
  description:
    "Scenario-based templates to help you understand emotional impact before sending.",
  alternates: {
    canonical: "/templates",
  },
};

export default function TemplatesPage() {
  return (
    <MarketingLayout>
      <div className="container py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <Badge variant="outline" className="w-fit bg-white/70">
              Message templates
            </Badge>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Templates that surface emotional impact before you send.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Browse scenario-based templates and analyze your own message with
              Reflxy.
            </p>
            <Link href="/app">
              <Button size="lg">Try it free</Button>
            </Link>
          </div>
          <div className="surface-glass p-6">
            <div className="section-kicker">How to use templates</div>
            <p className="mt-3 text-sm text-muted-foreground">
              Each template highlights a scenario where wording can be misread.
              Use the sample, then analyze your own draft to see the ripple.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {templates.map((template) => (
            <Card
              key={template.slug}
              className="min-w-0 border-border/60 bg-white/80"
            >
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{template.scenario}</Badge>
                  <span>Scenario template</span>
                </div>
                <CardTitle className="text-2xl">
                  <Link
                    href={`/templates/${template.slug}`}
                    className="hover:underline"
                  >
                    {template.title}
                  </Link>
                </CardTitle>
                <CardDescription className="break-words">
                  {template.scenarioDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/templates/${template.slug}`}
                  className="text-sm font-medium text-primary"
                >
                  Analyze your own message -&gt;
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 surface-card p-6">
          <div className="section-kicker">Try your own message</div>
          <h2 className="mt-2 font-display text-2xl font-semibold">
            See how your wording evolves over time.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste your draft and see how the emotional impact evolves.
          </p>
          <Link href="/app" className="mt-4 inline-flex">
            <Button variant="outline" size="lg">
              Try it free
            </Button>
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}
