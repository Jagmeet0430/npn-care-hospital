import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { AppointmentForm } from "@/components/AppointmentForm";
import { Section } from "@/components/Section";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  category_id: string | null;
  author_name: string | null;
  author_role: string | null;
  status: string;
  is_featured: boolean;
  reading_time: number | null;
  views: number | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
};

function articleImage(article: BlogPost) {
  return article.featured_image || "/images/npn-care-hero.png";
}

function articleDate(date: string | null) {
  if (!date) {
    return "Updated recently";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function contentToParagraphs(content: string) {
  if (!content) {
    return [];
  }

  // If content contains HTML paragraphs, extract their text.
  const paragraphMatches = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);

  if (paragraphMatches?.length) {
    return paragraphMatches.map((paragraph) =>
      paragraph
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim()
    );
  }

  // Otherwise treat each separated line as a paragraph.
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

async function getArticle(slug: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: article,
    error,
  } = await supabase
    .from("blog_posts")
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      featured_image,
      category_id,
      author_name,
      author_role,
      status,
      is_featured,
      reading_time,
      views,
      seo_title,
      seo_description,
      seo_keywords,
      published_at,
      created_at,
      updated_at
    `)
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle<BlogPost>();

  if (error) {
    console.error("BLOG ARTICLE ERROR:", error);
    return null;
  }

  if (!article) {
    return null;
  }

  let category: BlogCategory | null = null;

  if (article.category_id) {
    const { data: categoryData } = await supabase
      .from("blog_categories")
      .select("id, name, slug")
      .eq("id", article.category_id)
      .maybeSingle<BlogCategory>();

    category = categoryData;
  }

  return {
    article,
    category,
  };
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  const result = await getArticle(slug);

  if (!result) {
    return {};
  }

  const { article } = result;

  return {
    title: article.seo_title || article.title,
    description:
      article.seo_description ||
      article.excerpt ||
      "Health article from N.P.N. Care Hospital.",
    keywords: article.seo_keywords || undefined,

    alternates: {
      canonical: `/blog/${article.slug}`,
    },

    openGraph: {
      title: article.seo_title || article.title,
      description:
        article.seo_description ||
        article.excerpt ||
        "Health article from N.P.N. Care Hospital.",
      images: [
        {
          url: articleImage(article),
        },
      ],
    },
  };
}

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;

  const result = await getArticle(slug);

  if (!result) {
    notFound();
  }

  const { article, category } = result;

  const authorName =
    article.author_name || "N.P.N. Care Hospital";

  const authorRole =
    article.author_role || "Health & Wellness Team";

  const paragraphs = contentToParagraphs(article.content);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",

    headline: article.title,

    description:
      article.excerpt ||
      article.seo_description ||
      "",

    image: articleImage(article),

    datePublished: article.published_at,

    dateModified: article.updated_at,

    author: {
      "@type": "Person",
      name: authorName,
    },

    publisher: {
      "@type": "Hospital",
      name: "N.P.N. Care Hospital",
    },

    about: category?.name || "Health",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />

      <Section className="article-hero">
        <div className="article-breadcrumb">
          <Link href="/blog">
            <ArrowLeft size={17} />
            Back to Health Knowledge Center
          </Link>
        </div>

        <div className="article-header">
          <div className="article-header-content">
            <span className="article-category">
              {category?.name || "Health"}
            </span>

            <h1>{article.title}</h1>

            {article.excerpt && (
              <p className="article-excerpt">
                {article.excerpt}
              </p>
            )}

            <div className="article-meta">
              {article.reading_time && (
                <span>
                  <Clock3 size={17} />
                  {article.reading_time} min read
                </span>
              )}

              <span>
                <CalendarDays size={17} />
                {articleDate(article.published_at)}
              </span>

              <span>
                <ShieldCheck size={17} />
                Doctor reviewed
              </span>
            </div>

            <div className="article-author">
              <div className="article-author-avatar">
                N
              </div>

              <div>
                <strong>{authorName}</strong>
                <small>{authorRole}</small>
              </div>
            </div>
          </div>

          <div className="article-featured-image">
            <Image
              src={articleImage(article)}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>
        </div>
      </Section>

      <Section>
        <div className="article-layout">
          <article className="article-body">
            {paragraphs.map((paragraph, index) => (
              <p key={`${article.id}-${index}`}>
                {paragraph}
              </p>
            ))}

            <div className="article-note">
              <ShieldCheck size={22} />

              <p>
                This article is for educational purposes only.
                It is not a diagnosis or personal treatment
                plan. Please consult a qualified doctor before
                starting or changing treatment.
              </p>
            </div>
          </article>

          <aside className="knowledge-sidebar article-side">
            <div className="knowledge-side-card appointment">
              <Stethoscope size={24} />

              <h2>
                Need help with this topic?
              </h2>

              <p>
                Book a consultation so the care team can
                review symptoms, reports, and treatment
                history.
              </p>

              <Link
                className="button button-primary"
                href="/#appointment"
              >
                Book Appointment
              </Link>
            </div>
          </aside>
        </div>
      </Section>

      <Section
        className="band"
        eyebrow="Book Care"
        title="Speak with the hospital care team."
      >
        <AppointmentForm />
      </Section>
    </>
  );
}