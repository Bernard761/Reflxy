import type { Metadata } from "next";
import Link from "next/link";

import MarketingLayout from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Reflxy journal: clarity, tone, and emotional impact in written communication.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Reflxy journal",
    description:
      "Clarity, tone, and emotional impact in written communication from Reflxy.",
    url: `${siteConfig.url}/blog`,
    images: [siteConfig.ogImage],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reflxy journal",
    description:
      "Clarity, tone, and emotional impact in written communication from Reflxy.",
    images: [siteConfig.ogImage],
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <MarketingLayout>
      <div className="container py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <Badge variant="outline" className="w-fit bg-white/70">
              Reflxy journal
            </Badge>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Writing that lands the way you intend.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Practical guidance on clarity, warmth, and emotional impact in
              written communication.
            </p>
            <Link href="/app">
              <Button size="lg">Try it free</Button>
            </Link>
          </div>
          <div className="surface-glass p-6">
            <div className="section-kicker">Editorial focus</div>
            <p className="mt-3 text-sm text-muted-foreground">
              Each post explores a scenario where tone matters, with actionable
              reflection prompts you can apply immediately.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Card
              key={post.slug}
              className="min-w-0 border-border/60 bg-white/80"
            >
              <CardHeader>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{post.date}</span>
                  <span>-</span>
                  <span>{post.readingTime}</span>
                </div>
                <CardTitle className="text-2xl">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="break-words">
                  {post.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={`${post.slug}-${tag}`} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 surface-card p-6">
          <div className="section-kicker">Ready to analyze?</div>
          <h2 className="mt-2 font-display text-2xl font-semibold">
            Ready to analyze your next message?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reflxy shows the emotional impact before you send.
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
