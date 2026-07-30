import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Section } from "@/components/Section";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Health Blog",
  description: "SEO optimized health education articles from N.P.N. Care Hospital."
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const { blogPosts, homepage } = await getCmsContent();

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="eyebrow">Health Blog</span>
          <h1>{homepage.blogTitle}</h1>
          <p className="lead">Articles support categories, tags, featured images, related posts, and rich text editing once connected to the CMS.</p>
        </div>
      </section>

      <Section>
        <label>
          <span className="eyebrow">
            <Search size={17} />
            Search articles
          </span>
          <input placeholder="Search by condition, treatment, or lifestyle topic" />
        </label>
        <div className="grid grid-3" style={{ marginTop: 24 }}>
          {blogPosts.map((post) => (
            <article className="blog-card" key={post.slug}>
              <span className="eyebrow">{post.category}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <strong>{post.readTime}</strong>
              <Link className="card-link" href="/blog">
                Read article <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
