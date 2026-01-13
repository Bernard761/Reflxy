import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";

import MarketingLayout from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { siteConfig } from "@/lib/seo";

type BlogPageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: BlogPageProps): Metadata {
  try {
    const post = getPostBySlug(params.slug);
    return {
      title: post.title,
      description: post.description,
      alternates: {
        canonical: `/blog/${post.slug}`,
      },
      openGraph: {
        title: post.title,
        description: post.description,
        url: `${siteConfig.url}/blog/${post.slug}`,
        images: [siteConfig.ogImage],
      },
    };
  } catch {
    return {
      title: "Blog",
      alternates: {
        canonical: "/blog",
      },
    };
  }
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  let post;
  try {
    post = getPostBySlug(params.slug);
  } catch {
    notFound();
  }

  const { content } = await compileMDX({
    source: post.content,
    options: { parseFrontmatter: false },
  });

  return (
    <MarketingLayout>
      <div className="container py-16">
        <div className="space-y-4">
          <Link href="/blog" className="text-sm text-muted-foreground">
            &lt;- Back to blog
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{post.date}</span>
            <span>-</span>
            <span>{post.readingTime}</span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {post.title}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            {post.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={`${post.slug}-${tag}`} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <article className="prose prose-sm mt-10 max-w-none break-words prose-neutral sm:prose prose-headings:font-display prose-a:text-primary">
          {content}
        </article>
        <div className="mt-12 surface-card p-6">
          <div className="section-kicker">Try it yourself</div>
          <h2 className="mt-2 font-display text-2xl font-semibold">
            Want to test the tone of your next message?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reflxy analyzes the emotional impact of your draft before you send.
          </p>
          <Link href="/app" className="mt-4 inline-flex">
            <Button size="lg">Try it free</Button>
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}
