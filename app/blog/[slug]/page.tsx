import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, ShieldCheck, Stethoscope } from "lucide-react";
import { AppointmentForm } from "@/components/AppointmentForm";
import { Section } from "@/components/Section";
import { getCmsContent } from "@/lib/cms";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function articleImage(article: { image?: string }) {
  return article.image || "/images/npn-care-hero.png";
}

function articleDate(article: { publishedAt?: string }) {
  if (!article.publishedAt) return "Updated recently";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(article.publishedAt));
}

function fullArticle(article: { title: string; excerpt: string; fullContent?: string[] }) {
  return article.fullContent?.length
    ? article.fullContent
    : [
        article.excerpt,
        "Patients should use health education as a starting point for better questions during consultation. Personal treatment depends on symptoms, age, medical history, reports, medicines, and doctor assessment.",
        "For safe care decisions, bring recent reports and prescriptions where available, then discuss the next step with the hospital care team."
      ];
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { blogPosts } = await getCmsContent();
  const article = blogPosts.find((item) => item.slug === slug);

  if (!article || ("status" in article && article.status === "Draft")) return {};

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    alternates: {
      canonical: `/blog/${article.slug}`
    },
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      images: [articleImage(article)]
    }
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { blogPosts, hospital } = await getCmsContent();
  const article = blogPosts.find((item) => item.slug === slug);

  if (!article || ("status" in article && article.status === "Draft")) {
    notFound();
  }

  const authorName = article.authorName || "N.P.N. Doctor Team";
  const authorQualification = article.authorQualification || "Doctor reviewed";
  const content = fullArticle(article);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    headline: article.title,
    description: article.excerpt,
    image: articleImage(article),
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: authorName
    },
    publisher: {
      "@type": "Hospital",
      name: hospital.name
    },
    about: article.category
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <section className="article-hero">
        <div className="article-hero-copy">
          <Link className="button button-quiet" href="/blog">
            <ArrowLeft size={18} />
            Knowledge Center
          </Link>
          <span className="knowledge-category gold">{article.category}</span>
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
          <div className="knowledge-meta">
            <span><Clock3 size={16} /> {article.readTime}</span>
            <span><CalendarDays size={16} /> {articleDate(article)}</span>
            <span><ShieldCheck size={16} /> Doctor reviewed</span>
          </div>
          <div className="knowledge-author article-author">
            <span>{authorName.charAt(0)}</span>
            <span>
              <strong>{authorName}</strong>
              <small>{authorQualification}</small>
            </span>
          </div>
        </div>
        <div className="article-hero-image">
          <Image src={articleImage(article)} alt="" fill sizes="(max-width: 900px) 100vw, 44vw" priority />
        </div>
      </section>

      <Section>
        <div className="article-layout">
          <article className="article-body">
            {content.map((paragraph, index) => (
              <p key={`${article.slug}-${index}`}>{paragraph}</p>
            ))}
            <div className="article-note">
              <ShieldCheck size={22} />
              This article is for education only. It is not a diagnosis or personal treatment plan. Please consult a qualified doctor before starting or changing treatment.
            </div>
          </article>
          <aside className="knowledge-sidebar article-side">
            <div className="knowledge-side-card appointment">
              <Stethoscope size={24} />
              <h2>Need help with this topic?</h2>
              <p>Book a consultation so the care team can review symptoms, reports, and treatment history.</p>
              <Link className="button button-primary" href="/#appointment">Book Appointment</Link>
            </div>
          </aside>
        </div>
      </Section>

      <Section className="band" eyebrow="Book Care" title="Speak with the hospital care team.">
        <AppointmentForm />
      </Section>
    </>
  );
}
