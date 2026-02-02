import type { MetadataRoute } from "next";

import { getAllPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/seo";
import { templates } from "@/lib/templates";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const resolveDate = (value: string) => {
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
      return null;
    }
    return new Date(timestamp);
  };
  const routes = [
    "",
    "/pricing",
    "/faq",
    "/blog",
    "/templates",
    "/privacy",
    "/terms",
  ];

  const staticRoutes = routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
  }));

  const blogRoutes = getAllPosts().map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: resolveDate(post.date) ?? now,
  }));

  const templateRoutes = templates.map((template) => ({
    url: `${siteConfig.url}/templates/${template.slug}`,
    lastModified: now,
  }));

  return [...staticRoutes, ...blogRoutes, ...templateRoutes];
}
