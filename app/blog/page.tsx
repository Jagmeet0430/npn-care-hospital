import type { Metadata } from "next";
import { KnowledgeCenter, type KnowledgeArticle } from "@/components/KnowledgeCenter";
import { getPublishedBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Health Knowledge Center",
  description:
    "Doctor-reviewed health articles in simple language from N.P.N. Care Hospital.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  const articles: KnowledgeArticle[] = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    category: post.categoryName,
    readTime: `${post.readingTime || 5} min read`,
    excerpt: post.excerpt,
    image: post.featuredImage,
    publishedAt: post.publishedAt ?? undefined,
    authorName: post.authorName,
    authorQualification: post.authorRole,
    metaTitle: post.seoTitle,
    metaDescription: post.seoDescription,
  }));

  return <KnowledgeCenter articles={articles} />;
}