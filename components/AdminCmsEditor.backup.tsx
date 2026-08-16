"use client";

import { useEffect, useMemo, useState } from "react";
import { Code2, RefreshCcw, Save } from "lucide-react";
import type { CmsContent } from "@/lib/cms";

type SectionKey = keyof CmsContent;
type AdminCmsEditorProps = {
  initialSection?: SectionKey;
  focusOnly?: boolean;
};

const editableSections: Array<{ key: SectionKey; label: string; help: string }> = [
  { key: "hospital", label: "Hospital Info", help: "Name, phones, address, timing, registration, map query." },
  { key: "navigation", label: "Navigation", help: "Header/menu tab labels and links shown on the customer website." },
  { key: "footer", label: "Footer", help: "Footer description, explore links, copyright, and policy text." },
  { key: "hero", label: "Homepage Hero", help: "Main headline, buttons, location line, and intro copy." },
  { key: "homepage", label: "Homepage Text", help: "Section headings, story copy, mission, vision, and notes." },
  { key: "trustStats", label: "Statistics", help: "Public trust numbers shown on the site." },
  { key: "values", label: "Why Choose Us", help: "Value cards. Keep iconKey values like heart, shield, users, leaf." },
  { key: "departments", label: "Departments", help: "Department cards used on home and departments pages." },
  { key: "facilities", label: "Facilities", help: "Facility cards used on home, facilities, and gallery pages." },
  { key: "treatments", label: "Treatments", help: "Treatment cards and detail pages. Keep slugs unique." },
  { key: "doctors", label: "Doctors", help: "Doctor profile cards and appointment dropdowns." },
  { key: "patientSchemes", label: "Schemes", help: "Free-care, insurance, assurance, and medicine notice cards." },
  { key: "conditionGroups", label: "Conditions", help: "Health concern directory from the pamphlets." },
  { key: "faqs", label: "FAQs", help: "Question and answer list on customer pages." },
  { key: "testimonials", label: "Testimonials", help: "Patient story cards. Saving here syncs to the public testimonial slider." },
  { key: "blogPosts", label: "Blogs", help: "Create, edit, delete, publish, and schedule article objects. Use slug, category, image, author, readTime, metaTitle, metaDescription, and fullContent." },
  { key: "careers", label: "Careers Page", help: "Career hero, openings, benefits, culture, status labels, and career FAQs." },
  { key: "gallery", label: "Gallery", help: "Gallery category tiles." },
  { key: "videoTitles", label: "Videos", help: "Video library tile titles." },
  { key: "patientHindiHighlights", label: "Hindi Help", help: "Hindi patient notes shown on home and schemes pages." },
  { key: "cmsAreas", label: "CMS Areas", help: "Settings cards shown in the admin panel." }
];

export function AdminCmsEditor({ initialSection = "hospital", focusOnly = false }: AdminCmsEditorProps) {
  const [content, setContent] = useState<CmsContent | null>(null);
  const [active, setActive] = useState<SectionKey>(initialSection);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("Loading CMS content...");
  const [saving, setSaving] = useState(false);

  const availableSections = useMemo(() => {
    const focused = editableSections.filter((item) => item.key === initialSection);
    return focusOnly && focused.length ? focused : editableSections;
  }, [focusOnly, initialSection]);

  const activeMeta = useMemo(() => editableSections.find((item) => item.key === active), [active]);

  useEffect(() => {
    void loadContent();
  }, []);

  useEffect(() => {
    setActive(initialSection);
  }, [initialSection]);

  useEffect(() => {
    if (content) {
      setDraft(JSON.stringify(content[active], null, 2));
    }
  }, [active, content]);

  async function loadContent() {
    setStatus("Loading CMS content...");
    const response = await fetch("/api/cms", { cache: "no-store" });
    const nextContent = (await response.json()) as CmsContent;
    setContent(nextContent);
    setDraft(JSON.stringify(nextContent[active], null, 2));
    setStatus("CMS content loaded.");
  }

  async function saveSection() {
    if (!content) return;

    try {
      setSaving(true);
      const parsed = JSON.parse(draft) as CmsContent[SectionKey];
      const nextContent = { ...content, [active]: parsed };
      const response = await fetch("/api/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-cms-section": active },
        body: JSON.stringify(nextContent)
      });

      if (!response.ok) {
        throw new Error(response.status === 401 ? "Admin login expired. Please login again." : "CMS save failed");
      }

      const result = (await response.json()) as { content: CmsContent };
      setContent(result.content);
      setStatus(active === "testimonials" ? "Saved Testimonials and synced the public testimonial slider." : `Saved ${activeMeta?.label ?? active}. Refresh the customer website to see it immediately.`);
    } catch (error) {
      setStatus(error instanceof SyntaxError ? "Invalid JSON. Please fix the section before saving." : error instanceof Error ? error.message : "Could not save CMS content.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="cms-editor" id="website-content">
      <div className="section-heading">
        <span className="eyebrow">
          <Code2 size={17} />
          Live Website CMS
        </span>
        <h2>Edit customer website content</h2>
        <p>Save a section here, then refresh the public website. The customer pages read this same CMS content source.</p>
      </div>

      <div className="cms-editor-layout">
        <div className="cms-section-list">
          {availableSections.map((item) => (
            <button
              className={item.key === active ? "cms-section-button active" : "cms-section-button"}
              key={item.key}
              onClick={() => setActive(item.key)}
              type="button"
            >
              <strong>{item.label}</strong>
              <span>{item.help}</span>
            </button>
          ))}
        </div>

        <div className="cms-panel">
          <div className="cms-panel-top">
            <div>
              <span className="eyebrow">{activeMeta?.label}</span>
              <h3>{activeMeta?.help}</h3>
            </div>
            <div className="hero-actions">
              <button className="button button-quiet" type="button" onClick={loadContent}>
                <RefreshCcw size={18} />
                Reload
              </button>
              <button className="button button-primary" type="button" onClick={saveSection} disabled={saving}>
                <Save size={18} />
                {saving ? "Saving..." : "Save Section"}
              </button>
            </div>
          </div>
          <textarea
            className="cms-textarea"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
          />
          <p className="success-note">{status}</p>
        </div>
      </div>
    </section>
  );
}
