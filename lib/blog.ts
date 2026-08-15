import { supabase } from "@/lib/supabase";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  categoryId: string | null;
  categoryName: string;
  authorName: string;
  authorRole: string;
  status: string;
  isFeatured: boolean;
  readingTime: number;
  views: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapBlogPost(row: any): BlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    content: row.content ?? "",
    featuredImage: row.featured_image ?? "/images/npn-care-hero.png",
    categoryId: row.category_id ?? null,
    categoryName: row.blog_categories?.name ?? "Health",
    authorName: row.author_name ?? "N.P.N. Doctor Team",
    authorRole: row.author_role ?? "Doctor reviewed",
    status: row.status ?? "Draft",
    isFeatured: row.is_featured ?? false,
    readingTime: row.reading_time ?? 5,
    views: row.views ?? 0,
    seoTitle: row.seo_title ?? row.title,
    seoDescription: row.seo_description ?? row.excerpt ?? "",
    seoKeywords: row.seo_keywords ?? "",
    publishedAt: row.published_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPublishedBlogPosts() {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      blog_categories (
        id,
        name,
        slug
      )
    `)
    .eq("status", "PUBLISHED")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) {
    console.error("getPublishedBlogPosts:", error);
    throw new Error("Unable to load blog posts.");
  }

  return (data ?? []).map(mapBlogPost);
}

export async function getBlogPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      blog_categories (
        id,
        name,
        slug
      )
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getBlogPostBySlug:", error);
    throw new Error("Unable to load blog article.");
  }

  return data ? mapBlogPost(data) : null;
}

export async function getAllBlogPosts() {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      blog_categories (
        id,
        name,
        slug
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllBlogPosts:", error);
    throw new Error("Unable to load blog posts.");
  }

  return (data ?? []).map(mapBlogPost);
}