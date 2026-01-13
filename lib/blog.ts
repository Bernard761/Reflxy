import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingTime: string;
  content: string;
};

const postsDirectory = path.join(process.cwd(), "content", "blog");

export function getAllPosts(): BlogPost[] {
  const entries = fs.readdirSync(postsDirectory);
  return entries
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => getPostBySlug(file.replace(/\.mdx$/, "")))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "",
    tags: data.tags ?? [],
    readingTime: data.readingTime ?? "4 min read",
    content,
  };
}
