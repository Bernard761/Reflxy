import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import MarketingLayout from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/lib/seo";
import { getTemplateBySlug, templates } from "@/lib/templates";

type TemplatePageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return templates.map((template) => ({ slug: template.slug }));
}

export function generateMetadata({ params }: TemplatePageProps): Metadata {
  const template = getTemplateBySlug(params.slug);

  if (!template) {
    return {
      title: "Message templates",
      alternates: {
        canonical: "/templates",
      },
    };
  }

  return {
    title: template.title,
    description: template.scenarioDescription,
    alternates: {
      canonical: `/templates/${template.slug}`,
    },
    openGraph: {
      title: template.title,
      description: template.scenarioDescription,
      url: `${siteConfig.url}/templates/${template.slug}`,
      images: [siteConfig.ogImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: template.title,
      description: template.scenarioDescription,
      images: [siteConfig.ogImage],
    },
  };
}

export default function TemplatePage({ params }: TemplatePageProps) {
  const template = getTemplateBySlug(params.slug);

  if (!template) {
    notFound();
  }

  return (
    <MarketingLayout>
      <div className="container py-16">
        <div className="space-y-4">
          <Link href="/templates" className="text-sm text-muted-foreground">
            &lt;- Back to templates
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{template.scenario}</Badge>
            <span className="section-kicker">Scenario template</span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {template.title}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            {template.scenarioDescription}
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
          <Card className="min-w-0 border-border/60 bg-white/80">
            <CardHeader>
              <CardTitle className="text-2xl">Example message</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground">
              <p className="surface-glass p-4 break-words">
                {template.exampleMessage}
              </p>
            </CardContent>
          </Card>
          <Card className="min-w-0 border-border/60 bg-white/80">
            <CardHeader>
              <CardTitle className="text-2xl">Why it can be misread</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="break-words">{template.misunderstandingRisk}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 surface-card p-6">
          <div className="section-kicker">Analyze your own message</div>
          <h2 className="mt-2 font-display text-2xl font-semibold">
            Analyze your own message
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste your draft and see how the emotional impact changes over time.
          </p>
          <Link href="/app" className="mt-4 inline-flex">
            <Button size="lg">Analyze your own message</Button>
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}
