import { getAllPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/seo";

export async function GET() {
  const posts = getAllPosts();
  const rssItems = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteConfig.url}/blog/${post.slug}</link>
      <guid>${siteConfig.url}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>${siteConfig.name} Blog</title>
      <link>${siteConfig.url}/blog</link>
      <description>${siteConfig.description}</description>
      ${rssItems}
    </channel>
  </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
