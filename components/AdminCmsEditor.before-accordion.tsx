"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Code2,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
} from "lucide-react";
import type { CmsContent } from "@/lib/cms";

type SectionKey = keyof CmsContent;

type AdminCmsEditorProps = {
  initialSection?: SectionKey;
  focusOnly?: boolean;
};

type CareerData = CmsContent["careers"];

const editableSections: Array<{
  key: SectionKey;
  label: string;
  help: string;
}> = [
  {
    key: "hospital",
    label: "Hospital Info",
    help: "Name, phones, address, timing, registration, map query.",
  },
  {
    key: "navigation",
    label: "Navigation",
    help: "Header/menu tab labels and links shown on the customer website.",
  },
  {
    key: "footer",
    label: "Footer",
    help: "Footer description, explore links, copyright, and policy text.",
  },
  {
    key: "hero",
    label: "Homepage Hero",
    help: "Main headline, buttons, location line, and intro copy.",
  },
  {
    key: "homepage",
    label: "Homepage Text",
    help: "Section headings, story copy, mission, vision, and notes.",
  },
  {
    key: "trustStats",
    label: "Statistics",
    help: "Public trust numbers shown on the site.",
  },
  {
    key: "values",
    label: "Why Choose Us",
    help: "Value cards.",
  },
  {
    key: "departments",
    label: "Departments",
    help: "Department cards used on home and departments pages.",
  },
  {
    key: "facilities",
    label: "Facilities",
    help: "Facility cards used on home, facilities, and gallery pages.",
  },
  {
    key: "treatments",
    label: "Treatments",
    help: "Treatment cards and detail pages.",
  },
  {
    key: "doctors",
    label: "Doctors",
    help: "Doctor profile cards and appointment dropdowns.",
  },
  {
    key: "patientSchemes",
    label: "Schemes",
    help: "Free-care, insurance, assurance, and medicine notice cards.",
  },
  {
    key: "conditionGroups",
    label: "Conditions",
    help: "Health concern directory.",
  },
  {
    key: "faqs",
    label: "FAQs",
    help: "Question and answer list.",
  },
  {
    key: "testimonials",
    label: "Testimonials",
    help: "Patient story cards.",
  },
  {
    key: "blogPosts",
    label: "Blogs",
    help: "Create, edit, delete, publish, and schedule articles.",
  },
  {
    key: "careers",
    label: "Careers Page",
    help: "Career hero, openings, benefits, culture, status labels, and FAQs.",
  },
  {
    key: "gallery",
    label: "Gallery",
    help: "Gallery categories.",
  },
  {
    key: "videoTitles",
    label: "Videos",
    help: "Video library titles.",
  },
  {
    key: "patientHindiHighlights",
    label: "Hindi Help",
    help: "Hindi patient notes.",
  },
  {
    key: "cmsAreas",
    label: "CMS Areas",
    help: "Settings cards shown in the admin panel.",
  },
];

export function AdminCmsEditor({
  initialSection = "hospital",
  focusOnly = false,
}: AdminCmsEditorProps) {
  const [content, setContent] = useState<CmsContent | null>(null);
  const [active, setActive] = useState<SectionKey>(initialSection);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("Loading CMS content...");
  const [saving, setSaving] = useState(false);

  const availableSections = useMemo(() => {
    const focused = editableSections.filter(
      (item) => item.key === initialSection
    );

    return focusOnly && focused.length ? focused : editableSections;
  }, [focusOnly, initialSection]);

  const activeMeta = useMemo(
    () => editableSections.find((item) => item.key === active),
    [active]
  );

  useEffect(() => {
    void loadContent();
  }, []);

  useEffect(() => {
    setActive(initialSection);
  }, [initialSection]);

  useEffect(() => {
    if (content && active !== "careers") {
      setDraft(JSON.stringify(content[active], null, 2));
    }

    if (content && active === "careers") {
      setDraft(JSON.stringify(content.careers, null, 2));
    }
  }, [active, content]);

  async function loadContent() {
    try {
      setStatus("Loading CMS content...");

      const response = await fetch("/api/cms", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load CMS content.");
      }

      const nextContent = (await response.json()) as CmsContent;

      setContent(nextContent);
      setDraft(
        JSON.stringify(nextContent[initialSection], null, 2)
      );
      setStatus("CMS content loaded.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to load CMS content."
      );
    }
  }

  async function saveSection() {
    if (!content) return;

    try {
      setSaving(true);

      const parsed = JSON.parse(draft) as CmsContent[SectionKey];

      const nextContent = {
        ...content,
        [active]: parsed,
      } as CmsContent;

      const response = await fetch("/api/cms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-cms-section": active,
        },
        body: JSON.stringify(nextContent),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Admin login expired. Please login again."
            : "CMS save failed."
        );
      }

      const result = (await response.json()) as {
        content: CmsContent;
      };

      setContent(result.content);
      setDraft(
        JSON.stringify(result.content[active], null, 2)
      );

      setStatus(
        active === "testimonials"
          ? "Saved Testimonials and synced the public testimonial slider."
          : `Saved ${
              activeMeta?.label ?? active
            }. Refresh the customer website to see it immediately.`
      );
    } catch (error) {
      setStatus(
        error instanceof SyntaxError
          ? "Invalid JSON. Please fix the section before saving."
          : error instanceof Error
          ? error.message
          : "Could not save CMS content."
      );
    } finally {
      setSaving(false);
    }
  }

  function updateCareers(nextCareers: CareerData) {
    setDraft(JSON.stringify(nextCareers, null, 2));
  }

  if (!content) {
    return (
      <section className="cms-editor" id="website-content">
        <div className="section-heading">
          <span className="eyebrow">
            <Code2 size={17} />
            Live Website CMS
          </span>

          <h2>Edit customer website content</h2>

          <p>{status}</p>
        </div>
      </section>
    );
  }

  const careers =
    active === "careers"
      ? (JSON.parse(draft) as CareerData)
      : content.careers;

  return (
    <section className="cms-editor" id="website-content">
      <div className="section-heading">
        <span className="eyebrow">
          <Code2 size={17} />
          Live Website CMS
        </span>

        <h2>Edit customer website content</h2>

        <p>
          Save a section here, then refresh the public website.
          Customer pages read this same CMS content source.
        </p>
      </div>

      <div className="cms-editor-layout">
        <div className="cms-section-list">
          {availableSections.map((item) => (
            <button
              className={
                item.key === active
                  ? "cms-section-button active"
                  : "cms-section-button"
              }
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
              <span className="eyebrow">
                {activeMeta?.label}
              </span>

              <h3>{activeMeta?.help}</h3>
            </div>

            <div className="hero-actions">
              <button
                className="button button-quiet"
                type="button"
                onClick={loadContent}
              >
                <RefreshCcw size={18} />
                Reload
              </button>

              <button
                className="button button-primary"
                type="button"
                onClick={saveSection}
                disabled={saving}
              >
                <Save size={18} />

                {saving ? "Saving..." : "Save Section"}
              </button>
            </div>
          </div>

          {active === "careers" ? (
            <CareersEditor
              value={careers}
              onChange={updateCareers}
            />
          ) : (
            <textarea
              className="cms-textarea"
              value={draft}
              onChange={(event) =>
                setDraft(event.target.value)
              }
              spellCheck={false}
            />
          )}

          <p className="success-note">{status}</p>
        </div>
      </div>
    </section>
  );
}

type CareersEditorProps = {
  value: CareerData;
  onChange: (value: CareerData) => void;
};

function CareersEditor({
  value,
  onChange,
}: CareersEditorProps) {
  function updateField<K extends keyof CareerData>(
    key: K,
    nextValue: CareerData[K]
  ) {
    onChange({
      ...value,
      [key]: nextValue,
    });
  }

  function updateOpening(
    index: number,
    field: "title" | "text",
    text: string
  ) {
    const openings = [...value.openings];

    openings[index] = {
      ...openings[index],
      [field]: text,
    };

    updateField("openings", openings);
  }

  function addOpening() {
    updateField("openings", [
      ...value.openings,
      {
        title: "New Position",
        text: "Describe this position.",
      },
    ]);
  }

  function removeOpening(index: number) {
    updateField(
      "openings",
      value.openings.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function updateBenefit(index: number, text: string) {
    const benefits = [...value.benefits];
    benefits[index] = text;
    updateField("benefits", benefits);
  }

  function addBenefit() {
    updateField("benefits", [
      ...value.benefits,
      "New benefit",
    ]);
  }

  function removeBenefit(index: number) {
    updateField(
      "benefits",
      value.benefits.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function updateCultureCard(
    index: number,
    field: "title" | "text",
    text: string
  ) {
    const cultureCards = [...value.cultureCards];

    cultureCards[index] = {
      ...cultureCards[index],
      [field]: text,
    };

    updateField("cultureCards", cultureCards);
  }

  function addCultureCard() {
    updateField("cultureCards", [
      ...value.cultureCards,
      {
        title: "New Culture Point",
        text: "Describe this culture point.",
      },
    ]);
  }

  function removeCultureCard(index: number) {
    updateField(
      "cultureCards",
      value.cultureCards.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  function updateStatus(index: number, text: string) {
    const statusList = [...value.statusList];
    statusList[index] = text;
    updateField("statusList", statusList);
  }

  function addStatus() {
    updateField("statusList", [
      ...value.statusList,
      "New Status",
    ]);
  }

  function removeStatus(index: number) {
    updateField(
      "statusList",
      value.statusList.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  function updateFaq(
    index: number,
    field: "q" | "a",
    text: string
  ) {
    const faqs = [...value.faqs];

    faqs[index] = {
      ...faqs[index],
      [field]: text,
    };

    updateField("faqs", faqs);
  }

  function addFaq() {
    updateField("faqs", [
      ...value.faqs,
      {
        q: "New question?",
        a: "Write the answer here.",
      },
    ]);
  }

  function removeFaq(index: number) {
    updateField(
      "faqs",
      value.faqs.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  return (
    <div className="careers-admin-editor">
      <div className="careers-admin-intro">
        <div>
          <span className="eyebrow">CAREERS PAGE</span>

          <h3>Manage Careers Website Content</h3>

          <p>
            Update the careers page without editing raw JSON.
            Changes are saved to the same CMS used by the
            public Careers page.
          </p>
        </div>
      </div>

      {/* HERO */}
      <div className="career-admin-card">
        <div className="career-admin-card-heading">
          <div>
            <span className="career-admin-number">01</span>

            <div>
              <h3>Hero Section</h3>
              <p>Main Careers page introduction.</p>
            </div>
          </div>
        </div>

        <div className="career-admin-grid">
          <Field
            label="Hero Title"
            value={value.heroTitle}
            onChange={(text) =>
              updateField("heroTitle", text)
            }
          />

          <Field
            label="Primary Button"
            value={value.primaryButton}
            onChange={(text) =>
              updateField("primaryButton", text)
            }
          />

          <Field
            label="Secondary Button"
            value={value.secondaryButton}
            onChange={(text) =>
              updateField("secondaryButton", text)
            }
          />
        </div>

        <TextAreaField
          label="Hero Description"
          value={value.heroText}
          onChange={(text) =>
            updateField("heroText", text)
          }
        />
      </div>

      {/* OPENINGS */}
      <div className="career-admin-card">
        <div className="career-admin-card-heading">
          <div>
            <span className="career-admin-number">02</span>

            <div>
              <h3>Current Openings</h3>
              <p>Manage available job positions.</p>
            </div>
          </div>

          <button
            type="button"
            className="career-admin-add"
            onClick={addOpening}
          >
            <Plus size={17} />
            Add Position
          </button>
        </div>

        <div className="career-admin-grid">
          <Field
            label="Section Eyebrow"
            value={value.openingsEyebrow}
            onChange={(text) =>
              updateField("openingsEyebrow", text)
            }
          />

          <Field
            label="Section Title"
            value={value.openingsTitle}
            onChange={(text) =>
              updateField("openingsTitle", text)
            }
          />
        </div>

        <div className="career-repeat-list">
          {value.openings.map((opening, index) => (
            <div
              className="career-repeat-card"
              key={`opening-${index}`}
            >
              <div className="career-repeat-header">
                <strong>
                  Position {index + 1}
                </strong>

                <button
                  type="button"
                  className="career-delete"
                  onClick={() =>
                    removeOpening(index)
                  }
                  aria-label="Delete position"
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <Field
                label="Position Title"
                value={opening.title}
                onChange={(text) =>
                  updateOpening(index, "title", text)
                }
              />

              <TextAreaField
                label="Position Description"
                value={opening.text}
                onChange={(text) =>
                  updateOpening(index, "text", text)
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* BENEFITS */}
      <div className="career-admin-card">
        <div className="career-admin-card-heading">
          <div>
            <span className="career-admin-number">03</span>

            <div>
              <h3>Benefits</h3>
              <p>Benefits displayed to potential applicants.</p>
            </div>
          </div>

          <button
            type="button"
            className="career-admin-add"
            onClick={addBenefit}
          >
            <Plus size={17} />
            Add Benefit
          </button>
        </div>

        <div className="career-admin-grid">
          <Field
            label="Section Eyebrow"
            value={value.benefitsEyebrow}
            onChange={(text) =>
              updateField("benefitsEyebrow", text)
            }
          />

          <Field
            label="Section Title"
            value={value.benefitsTitle}
            onChange={(text) =>
              updateField("benefitsTitle", text)
            }
          />
        </div>

        <div className="career-simple-list">
          {value.benefits.map((benefit, index) => (
            <div
              className="career-list-item"
              key={`benefit-${index}`}
            >
              <input
                className="career-admin-input"
                value={benefit}
                onChange={(event) =>
                  updateBenefit(
                    index,
                    event.target.value
                  )
                }
              />

              <button
                type="button"
                className="career-delete"
                onClick={() =>
                  removeBenefit(index)
                }
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CULTURE */}
      <div className="career-admin-card">
        <div className="career-admin-card-heading">
          <div>
            <span className="career-admin-number">04</span>

            <div>
              <h3>Hospital Culture</h3>
              <p>Culture and workplace information.</p>
            </div>
          </div>

          <button
            type="button"
            className="career-admin-add"
            onClick={addCultureCard}
          >
            <Plus size={17} />
            Add Card
          </button>
        </div>

        <div className="career-admin-grid">
          <Field
            label="Section Eyebrow"
            value={value.cultureEyebrow}
            onChange={(text) =>
              updateField("cultureEyebrow", text)
            }
          />

          <Field
            label="Section Title"
            value={value.cultureTitle}
            onChange={(text) =>
              updateField("cultureTitle", text)
            }
          />
        </div>

        <div className="career-repeat-list">
          {value.cultureCards.map((card, index) => (
            <div
              className="career-repeat-card"
              key={`culture-${index}`}
            >
              <div className="career-repeat-header">
                <strong>
                  Culture Card {index + 1}
                </strong>

                <button
                  type="button"
                  className="career-delete"
                  onClick={() =>
                    removeCultureCard(index)
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <Field
                label="Card Title"
                value={card.title}
                onChange={(text) =>
                  updateCultureCard(
                    index,
                    "title",
                    text
                  )
                }
              />

              <TextAreaField
                label="Card Description"
                value={card.text}
                onChange={(text) =>
                  updateCultureCard(
                    index,
                    "text",
                    text
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* EMPLOYEE VOICE */}
      <div className="career-admin-card">
        <div className="career-admin-card-heading">
          <div>
            <span className="career-admin-number">05</span>

            <div>
              <h3>Employee Voice</h3>
              <p>Quote section shown on the Careers page.</p>
            </div>
          </div>
        </div>

        <div className="career-admin-grid">
          <Field
            label="Eyebrow"
            value={value.quoteEyebrow}
            onChange={(text) =>
              updateField("quoteEyebrow", text)
            }
          />

          <Field
            label="Quote"
            value={value.quoteTitle}
            onChange={(text) =>
              updateField("quoteTitle", text)
            }
          />
        </div>

        <TextAreaField
          label="Quote Description"
          value={value.quoteText}
          onChange={(text) =>
            updateField("quoteText", text)
          }
        />
      </div>

      {/* APPLICATION */}
      <div className="career-admin-card">
        <div className="career-admin-card-heading">
          <div>
            <span className="career-admin-number">06</span>

            <div>
              <h3>Application & Status</h3>
              <p>Application information and status labels.</p>
            </div>
          </div>

          <button
            type="button"
            className="career-admin-add"
            onClick={addStatus}
          >
            <Plus size={17} />
            Add Status
          </button>
        </div>

        <div className="career-admin-grid">
          <Field
            label="Application Eyebrow"
            value={value.applicationEyebrow}
            onChange={(text) =>
              updateField(
                "applicationEyebrow",
                text
              )
            }
          />

          <Field
            label="Application Title"
            value={value.applicationTitle}
            onChange={(text) =>
              updateField(
                "applicationTitle",
                text
              )
            }
          />

          <Field
            label="Status Title"
            value={value.applicationStatusTitle}
            onChange={(text) =>
              updateField(
                "applicationStatusTitle",
                text
              )
            }
          />
        </div>

        <TextAreaField
          label="Status Description"
          value={value.applicationStatusText}
          onChange={(text) =>
            updateField(
              "applicationStatusText",
              text
            )
          }
        />

        <div className="career-status-list">
          {value.statusList.map((status, index) => (
            <div
              className="career-list-item"
              key={`status-${index}`}
            >
              <input
                className="career-admin-input"
                value={status}
                onChange={(event) =>
                  updateStatus(
                    index,
                    event.target.value
                  )
                }
              />

              <button
                type="button"
                className="career-delete"
                onClick={() =>
                  removeStatus(index)
                }
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="career-admin-card">
        <div className="career-admin-card-heading">
          <div>
            <span className="career-admin-number">07</span>

            <div>
              <h3>Career FAQs</h3>
              <p>Questions and answers for applicants.</p>
            </div>
          </div>

          <button
            type="button"
            className="career-admin-add"
            onClick={addFaq}
          >
            <Plus size={17} />
            Add FAQ
          </button>
        </div>

        <div className="career-admin-grid">
          <Field
            label="FAQ Eyebrow"
            value={value.faqEyebrow}
            onChange={(text) =>
              updateField("faqEyebrow", text)
            }
          />

          <Field
            label="FAQ Title"
            value={value.faqTitle}
            onChange={(text) =>
              updateField("faqTitle", text)
            }
          />
        </div>

        <div className="career-repeat-list">
          {value.faqs.map((faq, index) => (
            <div
              className="career-repeat-card"
              key={`faq-${index}`}
            >
              <div className="career-repeat-header">
                <strong>
                  Question {index + 1}
                </strong>

                <button
                  type="button"
                  className="career-delete"
                  onClick={() =>
                    removeFaq(index)
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <Field
                label="Question"
                value={faq.q}
                onChange={(text) =>
                  updateFaq(index, "q", text)
                }
              />

              <TextAreaField
                label="Answer"
                value={faq.a}
                onChange={(text) =>
                  updateFaq(index, "a", text)
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="career-admin-field">
      <span>{label}</span>

      <input
        className="career-admin-input"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="career-admin-field career-admin-field-full">
      <span>{label}</span>

      <textarea
        className="career-admin-textarea"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        rows={4}
      />
    </label>
  );
}