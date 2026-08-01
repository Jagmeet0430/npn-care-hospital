"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Clock3,
  HeartPulse,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRoundCheck
} from "lucide-react";
import { AnimatedCounter } from "@/components/Motion";

export type KnowledgeArticle = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  image?: string;
  publishedAt?: string;
  authorName?: string;
  authorQualification?: string;
  metaTitle?: string;
  metaDescription?: string;
};

type KnowledgeCenterProps = {
  articles: KnowledgeArticle[];
};

const filters = [
  "All",
  "Pain Care",
  "Ayurveda",
  "Naturopathy",
  "Lifestyle",
  "Women's Health",
  "Men's Health",
  "Children",
  "Nutrition",
  "Diabetes",
  "Heart Care",
  "Bones & Joints",
  "Skin"
];

const categoryClass: Record<string, string> = {
  "Pain Care": "blue",
  Lifestyle: "orange",
  Ayurveda: "gold",
  Naturopathy: "teal",
  Nutrition: "green",
  "Heart Care": "red",
  Diabetes: "purple",
  Skin: "pink",
  "Bones & Joints": "blue",
  "Women's Health": "pink",
  "Men's Health": "teal",
  Children: "green",
  "Integrative Care": "gold"
};

const topics = [
  "Diabetes",
  "Joint Pain",
  "Migraine",
  "Heart Disease",
  "Weight Loss",
  "Thyroid",
  "Kidney Care",
  "Stress",
  "Skin",
  "Blood Pressure"
];

function articleImage(article: KnowledgeArticle) {
  return article.image || "/images/npn-care-hero.png";
}

function articleDate(article: KnowledgeArticle) {
  if (!article.publishedAt) return "Updated recently";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(article.publishedAt));
}

function articleAuthor(article: KnowledgeArticle) {
  return {
    name: article.authorName || "N.P.N. Doctor Team",
    qualification: article.authorQualification || "Doctor reviewed"
  };
}

function CategoryBadge({ category }: { category: string }) {
  return <span className={`knowledge-category ${categoryClass[category] || "gold"}`}>{category}</span>;
}

function AuthorMini({ article }: { article: KnowledgeArticle }) {
  const author = articleAuthor(article);
  return (
    <span className="knowledge-author">
      <span>{author.name.charAt(0)}</span>
      <span>
        <strong>{author.name}</strong>
        <small>{author.qualification}</small>
      </span>
    </span>
  );
}

function ReadButton({ slug, label = "Read Article" }: { slug: string; label?: string }) {
  return (
    <Link className="knowledge-read-link" href={`/blog/${slug}`}>
      {label}
      <ArrowRight size={17} />
    </Link>
  );
}

export function KnowledgeCenter({ articles }: KnowledgeCenterProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const reduceMotion = useReducedMotion();

  const normalizedArticles = articles.map((article) => ({
    ...article,
    category: article.category || "Health Education"
  }));

  const filteredArticles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return normalizedArticles.filter((article) => {
      const matchesFilter = activeFilter === "All" || article.category === activeFilter;
      const haystack = `${article.title} ${article.category} ${article.excerpt} ${article.authorName ?? ""}`.toLowerCase();
      return matchesFilter && (!needle || haystack.includes(needle));
    });
  }, [activeFilter, normalizedArticles, query]);

  const featured = filteredArticles[0] ?? normalizedArticles[0];
  const cardArticles = filteredArticles.filter((article) => article.slug !== featured?.slug);
  const latest = normalizedArticles.slice(0, 5);
  const popular = normalizedArticles.slice(0, 4);

  return (
    <section className="knowledge-page" aria-labelledby="knowledge-title">
      <div className="knowledge-shell">
        <motion.div
          className="knowledge-hero"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="knowledge-eyebrow">
            <BookOpenCheck size={18} />
            Articles
          </span>
          <h1 id="knowledge-title">Health Knowledge Center</h1>
          <p>Trusted health articles written in simple language to help patients understand diseases, treatments and healthy living.</p>
          <div className="knowledge-trust-badges" aria-label="Article trust badges">
            <span><UserRoundCheck size={17} /> Doctor Reviewed</span>
            <span><BookOpenCheck size={17} /> Easy to Understand</span>
            <span><CalendarDays size={17} /> Updated Regularly</span>
            <span><HeartPulse size={17} /> Natural Wellness</span>
          </div>
        </motion.div>

        <motion.div
          className="knowledge-search-panel"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <label className="knowledge-search-box">
            <Search size={22} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search diseases, symptoms, treatments or wellness topics..."
              aria-label="Search articles"
            />
          </label>
          <div className="knowledge-filters" aria-label="Article categories">
            {filters.map((filter) => (
              <button
                type="button"
                key={filter}
                className={activeFilter === filter ? "active" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </motion.div>

        {!featured ? (
          <div className="knowledge-empty">
            <Sparkles size={38} />
            <h2>No articles available yet.</h2>
            <p>Articles added from the admin CMS will appear here automatically.</p>
            <button type="button" onClick={() => setActiveFilter("All")}>Back to Categories</button>
          </div>
        ) : (
          <div className="knowledge-layout">
            <main className="knowledge-main">
              <motion.article
                className="knowledge-featured"
                initial={reduceMotion ? false : { opacity: 0, y: 26 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="knowledge-featured-image">
                  <Image src={articleImage(featured)} alt="" fill sizes="(max-width: 900px) 100vw, 45vw" priority />
                </div>
                <div className="knowledge-featured-copy">
                  <CategoryBadge category={featured.category} />
                  <h2>{featured.title}</h2>
                  <p>{featured.excerpt}</p>
                  <div className="knowledge-meta">
                    <span><Clock3 size={16} /> {featured.readTime}</span>
                    <span><CalendarDays size={16} /> {articleDate(featured)}</span>
                  </div>
                  <AuthorMini article={featured} />
                  <ReadButton slug={featured.slug} />
                </div>
              </motion.article>

              <motion.div
                className="knowledge-grid"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.1 } }
                }}
              >
                {cardArticles.map((article) => (
                  <motion.article
                    className="knowledge-card"
                    key={article.slug}
                    variants={{
                      hidden: reduceMotion ? {} : { opacity: 0, y: 26 },
                      show: reduceMotion ? {} : { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
                    }}
                  >
                    <div className="knowledge-card-image">
                      <Image src={articleImage(article)} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                    </div>
                    <div className="knowledge-card-body">
                      <CategoryBadge category={article.category} />
                      <h3>{article.title}</h3>
                      <p>{article.excerpt}</p>
                      <AuthorMini article={article} />
                      <div className="knowledge-card-footer">
                        <span><Clock3 size={15} /> {article.readTime}</span>
                        <span>{articleDate(article)}</span>
                      </div>
                      <ReadButton slug={article.slug} label="Read More" />
                    </div>
                  </motion.article>
                ))}
              </motion.div>

              <section className="knowledge-stats" aria-label="Knowledge center statistics">
                <div><strong><AnimatedCounter value="150+" /></strong><span>Health Articles</span></div>
                <div><strong><AnimatedCounter value="25+" /></strong><span>Doctors</span></div>
                <div><strong><AnimatedCounter value="50+" /></strong><span>Conditions Covered</span></div>
                <div><strong><AnimatedCounter value="10K+" /></strong><span>Monthly Readers</span></div>
              </section>

              <section className="knowledge-newsletter">
                <div>
                  <span className="knowledge-eyebrow"><Mail size={17} /> Newsletter</span>
                  <h2>Stay Healthy With Expert Advice</h2>
                  <p>Receive practical health tips, wellness updates and educational articles directly in your inbox.</p>
                </div>
                <form>
                  <input placeholder="Name" aria-label="Name" />
                  <input placeholder="Email" type="email" aria-label="Email" />
                  <button className="button button-gold" type="button">Subscribe</button>
                </form>
              </section>

              <section className="knowledge-topics">
                <h2>Popular Topics</h2>
                <div>
                  {topics.map((topic) => (
                    <button type="button" key={topic} onClick={() => setQuery(topic)}>
                      {topic}
                    </button>
                  ))}
                </div>
              </section>

              <section className="knowledge-latest">
                <h2>Latest Articles</h2>
                {latest.map((article) => (
                  <Link href={`/blog/${article.slug}`} key={article.slug}>
                    <span>{articleDate(article)}</span>
                    <strong>{article.title}</strong>
                    <em>{article.category}</em>
                    <ArrowRight size={18} />
                  </Link>
                ))}
              </section>
            </main>

            <aside className="knowledge-sidebar" aria-label="Knowledge center sidebar">
              <div className="knowledge-side-card">
                <h2>Popular Articles</h2>
                {popular.map((article) => (
                  <Link href={`/blog/${article.slug}`} key={article.slug}>{article.title}</Link>
                ))}
              </div>
              <div className="knowledge-side-card">
                <h2>Categories</h2>
                {filters.slice(1, 8).map((filter) => (
                  <button type="button" key={filter} onClick={() => setActiveFilter(filter)}>
                    {filter}
                  </button>
                ))}
              </div>
              <div className="knowledge-side-card appointment">
                <Stethoscope size={24} />
                <h2>Need Doctor Guidance?</h2>
                <p>Book an appointment for report review, symptoms, or treatment planning.</p>
                <Link className="button button-primary" href="/#appointment">Quick Appointment</Link>
              </div>
              <div className="knowledge-side-card">
                <h2>Hospital Timing</h2>
                <p>Mon-Sat, 10:00 AM - 4:00 PM. Sunday closed.</p>
                <p><ShieldCheck size={16} /> Emergency contact is available through the care desk.</p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
