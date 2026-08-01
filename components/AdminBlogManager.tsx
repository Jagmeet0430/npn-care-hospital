"use client";

import { useMemo, useState } from "react";
import { Copy, ExternalLink, Facebook, Instagram, Link2, Plus, Save, Share2, Trash2, Youtube } from "lucide-react";
import type { CmsContent } from "@/lib/cms";

type CmsArticle = CmsContent["blogPosts"][number] & {
  status?: "Published" | "Draft";
  scheduledFor?: string;
  featured?: boolean;
  displayOrder?: number;
};

type AdminBlogManagerProps = {
  initialContent: CmsContent;
};

const emptyArticle: CmsArticle = {
  slug: "",
  title: "",
  category: "Ayurveda",
  readTime: "5 min read",
  excerpt: "",
  image: "/images/npn-care-hero.png",
  publishedAt: new Date().toISOString().slice(0, 10),
  authorName: "N.P.N. Doctor Team",
  authorQualification: "Doctor reviewed",
  metaTitle: "",
  metaDescription: "",
  fullContent: [],
  status: "Published",
  scheduledFor: "",
  featured: true,
  displayOrder: 1
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function publicArticleUrl(slug: string) {
  if (typeof window === "undefined") return `/blog/${slug}`;
  return `${window.location.origin}/blog/${slug}`;
}

function socialCaption(article: CmsArticle) {
  return `${article.title}\n\n${article.excerpt}\n\nRead more: ${publicArticleUrl(article.slug)}\n\n#NPNCareHospital #HealthEducation #NaturalWellness #Healthcare`;
}

function sortArticles(items: CmsArticle[]) {
  return [...items].sort(
    (a, b) =>
      (a.displayOrder ?? 999) - (b.displayOrder ?? 999) ||
      new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime()
  );
}

export function AdminBlogManager({ initialContent }: AdminBlogManagerProps) {
  const [content, setContent] = useState(initialContent);
  const [articles, setArticles] = useState<CmsArticle[]>(sortArticles(initialContent.blogPosts as CmsArticle[]));
  const [selectedSlug, setSelectedSlug] = useState(articles[0]?.slug ?? "");
  const [draft, setDraft] = useState<CmsArticle>(articles[0] ?? emptyArticle);
  const [draggingSlug, setDraggingSlug] = useState<string | null>(null);
  const [status, setStatus] = useState("Create, edit, delete, and publish blogs here. Customer website updates after save.");
  const [saving, setSaving] = useState(false);

  const selectedArticle = useMemo(() => articles.find((article) => article.slug === selectedSlug) ?? articles[0], [articles, selectedSlug]);
  const caption = useMemo(() => socialCaption(draft), [draft]);

  function selectArticle(article: CmsArticle) {
    setSelectedSlug(article.slug);
    setDraft({ ...emptyArticle, ...article, fullContent: article.fullContent ?? [] });
    setStatus(`Editing ${article.title}`);
  }

  function newArticle() {
    const next = {
      ...emptyArticle,
      slug: `new-health-article-${Date.now()}`,
      displayOrder: articles.length + 1
    };
    setSelectedSlug(next.slug);
    setDraft(next);
    setStatus("New article draft ready. Add title, summary, image, content, then save.");
  }

  function setField<K extends keyof CmsArticle>(key: K, value: CmsArticle[K]) {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (key === "title" && (!current.slug || current.slug.startsWith("new-health-article"))) {
        next.slug = slugify(String(value));
      }
      if (key === "title" && !current.metaTitle) {
        next.metaTitle = `${String(value)} | N.P.N. Care Hospital`;
      }
      if (key === "excerpt" && !current.metaDescription) {
        next.metaDescription = String(value);
      }
      return next;
    });
  }

  async function saveArticle() {
    if (!draft.title.trim() || !draft.slug.trim()) {
      setStatus("Title and slug are required.");
      return;
    }

    setSaving(true);
    const cleanDraft = {
      ...draft,
      slug: slugify(draft.slug),
      displayOrder: Number(draft.displayOrder ?? articles.length + 1),
      fullContent: (draft.fullContent ?? []).filter(Boolean)
    };
    const nextArticles = sortArticles([cleanDraft, ...articles.filter((article) => article.slug !== selectedArticle?.slug && article.slug !== cleanDraft.slug)]);
    const nextContent = { ...content, blogPosts: nextArticles };

    const response = await fetch("/api/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextContent)
    });

    setSaving(false);
    if (!response.ok) {
      setStatus(response.status === 401 ? "Admin login expired. Please login again." : "Could not save article.");
      return;
    }

    const result = (await response.json()) as { content: CmsContent };
    setContent(result.content);
    setArticles(sortArticles(result.content.blogPosts as CmsArticle[]));
    setSelectedSlug(cleanDraft.slug);
    setDraft(cleanDraft);
    setStatus("Article saved. It is now updated on the customer Knowledge Center.");
  }

  async function saveArticles(nextArticles: CmsArticle[], nextStatus: string) {
    const ordered = nextArticles.map((article, index) => ({ ...article, displayOrder: index + 1 }));
    const nextContent = { ...content, blogPosts: ordered };
    const response = await fetch("/api/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextContent)
    });

    if (!response.ok) {
      setStatus("Could not update blog order.");
      return;
    }

    const result = (await response.json()) as { content: CmsContent };
    setContent(result.content);
    setArticles(sortArticles(result.content.blogPosts as CmsArticle[]));
    setStatus(nextStatus);
  }

  function handleDrop(targetSlug: string) {
    if (!draggingSlug || draggingSlug === targetSlug) return;
    const sourceIndex = articles.findIndex((article) => article.slug === draggingSlug);
    const targetIndex = articles.findIndex((article) => article.slug === targetSlug);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const nextArticles = [...articles];
    const [moved] = nextArticles.splice(sourceIndex, 1);
    nextArticles.splice(targetIndex, 0, moved);
    setDraggingSlug(null);
    void saveArticles(nextArticles, "Blog display order updated. Homepage uses published and featured articles first.");
  }

  function toggleStatus() {
    setField("status", draft.status === "Draft" ? "Published" : "Draft");
  }

  async function deleteArticle(slug: string) {
    const nextArticles = articles.filter((article) => article.slug !== slug);
    const nextContent = { ...content, blogPosts: nextArticles };
    const response = await fetch("/api/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextContent)
    });

    if (!response.ok) {
      setStatus("Could not delete article.");
      return;
    }

    const result = (await response.json()) as { content: CmsContent };
    const sorted = sortArticles(result.content.blogPosts as CmsArticle[]);
    const nextSelected = sorted[0];
    setContent(result.content);
    setArticles(sorted);
    setSelectedSlug(nextSelected?.slug ?? "");
    setDraft(nextSelected ?? emptyArticle);
    setStatus("Article deleted from admin and customer website.");
  }

  async function copyCaption() {
    await navigator.clipboard.writeText(caption);
    setStatus("Social caption copied. Paste it into Instagram, Facebook, YouTube, WhatsApp, or any social platform.");
  }

  return (
    <section className="admin-blog-manager">
      <div className="admin-blog-top">
        <div>
          <span className="eyebrow">
            <Share2 size={17} />
            Blog Publishing Center
          </span>
          <h2>Post blogs from admin and sync to customer website.</h2>
          <p>{status}</p>
        </div>
        <button className="button button-gold" type="button" onClick={newArticle}>
          <Plus size={18} />
          New Blog
        </button>
      </div>

      <div className="admin-blog-layout">
        <aside className="admin-blog-list">
          {articles.map((article) => (
            <button
              className={article.slug === selectedSlug ? "active" : ""}
              type="button"
              key={article.slug}
              draggable
              onClick={() => selectArticle(article)}
              onDragStart={() => setDraggingSlug(article.slug)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(article.slug)}
            >
              <span>{article.category}</span>
              <strong>{article.title}</strong>
              <small>{article.featured ? "Featured on homepage" : "Not featured on homepage"}</small>
              <small>{article.status ?? "Published"} • {article.readTime}</small>
            </button>
          ))}
        </aside>

        <div className="admin-blog-editor">
          <div className="form-grid">
            <label>
              Blog Title
              <input value={draft.title} onChange={(event) => setField("title", event.target.value)} />
            </label>
            <label>
              Slug
              <input value={draft.slug} onChange={(event) => setField("slug", event.target.value)} />
            </label>
            <label>
              Category
              <select value={draft.category} onChange={(event) => setField("category", event.target.value)}>
                {["Ayurveda", "Pain Care", "Diabetes", "Heart Care", "Nutrition", "Skin", "Lifestyle", "Naturopathy", "Women's Health", "Men's Health", "Children", "Bones & Joints"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Read Time
              <input value={draft.readTime} onChange={(event) => setField("readTime", event.target.value)} />
            </label>
            <label>
              Published Date
              <input type="date" value={draft.publishedAt ?? ""} onChange={(event) => setField("publishedAt", event.target.value)} />
            </label>
            <label>
              Status
              <select value={draft.status ?? "Published"} onChange={(event) => setField("status", event.target.value as CmsArticle["status"])}>
                <option>Published</option>
                <option>Draft</option>
              </select>
            </label>
            <label>
              Display Order
              <input type="number" min="1" value={draft.displayOrder ?? 1} onChange={(event) => setField("displayOrder", Number(event.target.value))} />
            </label>
            <label>
              Schedule Publish
              <input type="datetime-local" value={draft.scheduledFor ?? ""} onChange={(event) => setField("scheduledFor", event.target.value)} />
            </label>
            <label>
              Featured Image URL
              <input value={draft.image ?? ""} onChange={(event) => setField("image", event.target.value)} />
            </label>
            <label>
              Author
              <input value={draft.authorName ?? ""} onChange={(event) => setField("authorName", event.target.value)} />
            </label>
            <label>
              Qualification
              <input value={draft.authorQualification ?? ""} onChange={(event) => setField("authorQualification", event.target.value)} />
            </label>
          </div>

          <label>
            Summary
            <textarea value={draft.excerpt} onChange={(event) => setField("excerpt", event.target.value)} />
          </label>

          <div className="status-list">
            <label><input type="checkbox" checked={draft.featured === true} onChange={(event) => setField("featured", event.target.checked)} /> Featured on homepage</label>
          </div>

          <label>
            Full Article Content
            <textarea
              className="tall-textarea"
              value={(draft.fullContent ?? []).join("\n\n")}
              onChange={(event) => setField("fullContent", event.target.value.split(/\n{2,}/))}
            />
          </label>

          <div className="form-grid">
            <label>
              Meta Title
              <input value={draft.metaTitle ?? ""} onChange={(event) => setField("metaTitle", event.target.value)} />
            </label>
            <label>
              Meta Description
              <input value={draft.metaDescription ?? ""} onChange={(event) => setField("metaDescription", event.target.value)} />
            </label>
          </div>

          <div className="admin-blog-actions">
            <button className="button button-primary" type="button" onClick={saveArticle} disabled={saving}>
              <Save size={18} />
              {saving ? "Saving..." : "Save & Publish"}
            </button>
            <button className="button button-quiet" type="button" onClick={toggleStatus}>
              {draft.status === "Draft" ? "Publish" : "Unpublish"}
            </button>
            <a className="button button-quiet" href={`/blog/${draft.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink size={18} />
              View Customer Page
            </a>
            <button className="button button-quiet danger" type="button" onClick={() => void deleteArticle(draft.slug)}>
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        <aside className="social-publisher">
          <span className="eyebrow">
            <Share2 size={17} />
            Social Publisher
          </span>
          <h3>Post this blog on social media</h3>
          <p>Instagram does not allow normal websites to auto-post without Meta API approval. This tool prepares the post, copies the caption, and opens each platform.</p>
          <textarea readOnly value={caption} />
          <div className="social-action-grid">
            <button type="button" onClick={() => void copyCaption()}>
              <Copy size={17} />
              Copy Caption
            </button>
            <a href={publicArticleUrl(draft.slug)} target="_blank" rel="noreferrer">
              <Link2 size={17} />
              Open Blog
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
              <Instagram size={17} />
              Instagram
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicArticleUrl(draft.slug))}`} target="_blank" rel="noreferrer">
              <Facebook size={17} />
              Facebook
            </a>
            <a href={`https://www.youtube.com/@N.P.N_CARE_HOSPITAL`} target="_blank" rel="noreferrer">
              <Youtube size={17} />
              YouTube
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
