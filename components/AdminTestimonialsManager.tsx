"use client";

import { useMemo, useState } from "react";
import { Archive, Copy, Eye, EyeOff, Pencil, Plus, Save, Search, Star, Trash2 } from "lucide-react";
import type { TestimonialInput } from "@/lib/testimonial-shared";
import type { TestimonialRecord } from "@/lib/testimonials";

type AdminTestimonialsManagerProps = {
  testimonials: TestimonialRecord[];
  doctors: Array<{ name: string }>;
  treatments: Array<{ title: string }>;
};

type SortMode = "newest" | "oldest" | "highest" | "order";
type FilterMode = "All" | "Published" | "Draft" | "Featured";

const emptyForm: TestimonialInput = {
  patientName: "",
  patientPhoto: "",
  city: "",
  doctorName: "",
  treatment: "",
  review: "",
  rating: 5,
  beforeImage: "",
  afterImage: "",
  video: "",
  featured: false,
  published: true,
  archived: false,
  displayOrder: 1,
  consent: false,
  date: new Date().toISOString().slice(0, 10)
};

export function AdminTestimonialsManager({ testimonials: initialTestimonials, doctors, treatments }: AdminTestimonialsManagerProps) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [form, setForm] = useState<TestimonialInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("All");
  const [rating, setRating] = useState("All");
  const [treatment, setTreatment] = useState("All");
  const [doctor, setDoctor] = useState("All");
  const [sort, setSort] = useState<SortMode>("order");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [status, setStatus] = useState("Testimonials CMS ready.");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return testimonials
      .filter((item) => {
        const matchesQuery =
          !q ||
          [item.patientName, item.doctorName, item.treatment, item.review].join(" ").toLowerCase().includes(q);
        const matchesFilter =
          filter === "All" ||
          (filter === "Published" && item.published) ||
          (filter === "Draft" && !item.published) ||
          (filter === "Featured" && item.featured);
        const matchesRating = rating === "All" || item.rating === Number(rating);
        const matchesTreatment = treatment === "All" || item.treatment === treatment;
        const matchesDoctor = doctor === "All" || item.doctorName === doctor;
        return matchesQuery && matchesFilter && matchesRating && matchesTreatment && matchesDoctor;
      })
      .sort((a, b) => {
        if (sort === "highest") return b.rating - a.rating;
        if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return a.displayOrder - b.displayOrder;
      });
  }, [doctor, filter, query, rating, sort, testimonials, treatment]);

  function updateForm<K extends keyof TestimonialInput>(key: K, value: TestimonialInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function editTestimonial(testimonial: TestimonialRecord) {
    setEditingId(testimonial.id);
    setForm({
      patientName: testimonial.patientName,
      patientPhoto: testimonial.patientPhoto,
      city: testimonial.city,
      doctorName: testimonial.doctorName,
      treatment: testimonial.treatment,
      review: testimonial.review,
      rating: testimonial.rating,
      beforeImage: testimonial.beforeImage,
      afterImage: testimonial.afterImage,
      video: testimonial.video,
      featured: testimonial.featured,
      published: testimonial.published,
      archived: testimonial.archived,
      displayOrder: testimonial.displayOrder,
      consent: testimonial.consent,
      date: testimonial.date
    });
    setStatus(`Editing ${testimonial.patientName}.`);
  }

  async function saveTestimonial() {
    const response = await fetch(editingId ? `/api/testimonials/${editingId}` : "/api/testimonials", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const result = (await response.json()) as { ok: boolean; testimonial?: TestimonialRecord; message?: string };

    if (!response.ok || !result.testimonial) {
      setStatus(result.message ?? "Could not save testimonial. Check required fields and consent.");
      return;
    }

    setTestimonials((current) =>
      editingId
        ? current.map((item) => (item.id === result.testimonial?.id ? result.testimonial : item))
        : [result.testimonial as TestimonialRecord, ...current]
    );
    setEditingId(null);
    setForm({ ...emptyForm, displayOrder: testimonials.length + 2 });
    setStatus("Testimonial saved. Public slider updates automatically after refresh.");
  }

  async function patchTestimonial(id: string, update: Partial<TestimonialInput>) {
    const response = await fetch(`/api/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update)
    });
    const result = (await response.json()) as { ok: boolean; testimonial?: TestimonialRecord };
    if (!response.ok || !result.testimonial) {
      setStatus("Could not update testimonial.");
      return;
    }
    setTestimonials((current) => current.map((item) => (item.id === result.testimonial?.id ? result.testimonial : item)));
    setStatus("Testimonial updated.");
  }

  async function duplicateTestimonial(id: string) {
    const response = await fetch(`/api/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" })
    });
    const result = (await response.json()) as { ok: boolean; testimonial?: TestimonialRecord };
    if (result.testimonial) {
      setTestimonials((current) => [result.testimonial as TestimonialRecord, ...current]);
      setStatus("Testimonial duplicated as draft.");
    }
  }

  async function deleteTestimonial(id: string) {
    if (!window.confirm("Delete this testimonial permanently?")) return;
    const response = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus("Could not delete testimonial.");
      return;
    }
    setTestimonials((current) => current.filter((item) => item.id !== id));
    setStatus("Testimonial deleted.");
  }

  async function reorder(nextItems: TestimonialRecord[]) {
    const ordered = nextItems.map((item, index) => ({ ...item, displayOrder: index + 1 }));
    setTestimonials(ordered);
    await fetch("/api/testimonials/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: ordered.map((item) => ({ id: item.id, displayOrder: item.displayOrder })) })
    });
    setStatus("Display order updated.");
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    const sourceIndex = testimonials.findIndex((item) => item.id === draggingId);
    const targetIndex = testimonials.findIndex((item) => item.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextItems = [...testimonials];
    const [moved] = nextItems.splice(sourceIndex, 1);
    nextItems.splice(targetIndex, 0, moved);
    setDraggingId(null);
    void reorder(nextItems);
  }

  return (
    <div className="testimonial-cms">
      <div className="admin-access-card">
        <div>
          <h3>Testimonials Management</h3>
          <p>Add, edit, publish, feature, archive, duplicate, delete, and reorder patient testimonials without editing JSON.</p>
        </div>
        <button className="button button-primary" type="button" onClick={() => { setEditingId(null); setForm({ ...emptyForm, displayOrder: testimonials.length + 1 }); }}>
          <Plus size={18} />
          Add Testimonial
        </button>
      </div>

      <div className="cms-panel testimonial-form-panel">
        <div className="form-grid">
          <label><span>Patient Name</span><input value={form.patientName} onChange={(event) => updateForm("patientName", event.target.value)} /></label>
          <label><span>Patient Photo Optional</span><input value={form.patientPhoto} onChange={(event) => updateForm("patientPhoto", event.target.value)} placeholder="Image URL or data URL" /></label>
          <label><span>City</span><input value={form.city} onChange={(event) => updateForm("city", event.target.value)} /></label>
          <label><span>Treatment</span><input list="testimonial-treatment-list" value={form.treatment} onChange={(event) => updateForm("treatment", event.target.value)} /></label>
          <label><span>Doctor Name</span><input list="testimonial-doctor-list" value={form.doctorName} onChange={(event) => updateForm("doctorName", event.target.value)} /></label>
          <label><span>Rating</span><select value={form.rating} onChange={(event) => updateForm("rating", Number(event.target.value))}>{[1, 2, 3, 4, 5].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Before Image Optional</span><input value={form.beforeImage} onChange={(event) => updateForm("beforeImage", event.target.value)} /></label>
          <label><span>After Image Optional</span><input value={form.afterImage} onChange={(event) => updateForm("afterImage", event.target.value)} /></label>
          <label><span>Video Testimonial Optional</span><input value={form.video} onChange={(event) => updateForm("video", event.target.value)} /></label>
          <label><span>Display Order</span><input type="number" min="0" value={form.displayOrder} onChange={(event) => updateForm("displayOrder", Number(event.target.value))} /></label>
          <label><span>Date</span><input type="date" value={form.date} onChange={(event) => updateForm("date", event.target.value)} /></label>
          <label><span>Review Text</span><textarea value={form.review} onChange={(event) => updateForm("review", event.target.value)} /></label>
        </div>
        <datalist id="testimonial-treatment-list">{treatments.map((item) => <option key={item.title} value={item.title} />)}</datalist>
        <datalist id="testimonial-doctor-list">{doctors.map((item) => <option key={item.name} value={item.name} />)}</datalist>
        <div className="status-list">
          <label><input type="checkbox" checked={form.featured} onChange={(event) => updateForm("featured", event.target.checked)} /> Featured</label>
          <label><input type="checkbox" checked={form.published} onChange={(event) => updateForm("published", event.target.checked)} /> Published</label>
          <label><input type="checkbox" checked={form.consent} onChange={(event) => updateForm("consent", event.target.checked)} /> Patient consent received</label>
        </div>
        <div className="hero-actions">
          <button className="button button-primary" type="button" onClick={() => void saveTestimonial()}><Save size={18} /> {editingId ? "Save Changes" : "Add Testimonial"}</button>
          <button className="button button-quiet" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Clear</button>
        </div>
        <p className="success-note">{status}</p>
      </div>

      <div className="filter-bar">
        <label><span className="eyebrow"><Search size={16} /> Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Patient, doctor, treatment, review" /></label>
        <label>Status<select value={filter} onChange={(event) => setFilter(event.target.value as FilterMode)}><option>All</option><option>Published</option><option>Draft</option><option>Featured</option></select></label>
        <label>Rating<select value={rating} onChange={(event) => setRating(event.target.value)}><option>All</option>{[5, 4, 3, 2, 1].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Treatment<select value={treatment} onChange={(event) => setTreatment(event.target.value)}><option>All</option>{Array.from(new Set(testimonials.map((item) => item.treatment))).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Doctor<select value={doctor} onChange={(event) => setDoctor(event.target.value)}><option>All</option>{Array.from(new Set(testimonials.map((item) => item.doctorName).filter(Boolean))).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Sort<select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="order">Display Order</option><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="highest">Highest Rating</option></select></label>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Patient Name</th>
              <th>Treatment</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Published</th>
              <th>Order</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.id}
                draggable
                onDragStart={() => setDraggingId(item.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(item.id)}
              >
                <td>{item.patientPhoto ? <img className="testimonial-thumb" src={item.patientPhoto} alt="" loading="lazy" /> : <span className="doctor-avatar">{item.patientName.slice(0, 2).toUpperCase()}</span>}</td>
                <td><strong>{item.patientName}</strong><br /><small>{item.city || "No city"}</small></td>
                <td>{item.treatment}</td>
                <td>{Array.from({ length: item.rating }).map((_, index) => <Star key={index} size={14} fill="#D4AF37" color="#D4AF37" />)}</td>
                <td><span className="status">{item.archived ? "Archived" : item.published ? "Published" : "Draft"}</span></td>
                <td>{item.featured ? "Yes" : "No"}</td>
                <td>{item.published ? "Yes" : "No"}</td>
                <td>{item.displayOrder}</td>
                <td>{new Date(item.createdAt).toLocaleDateString("en-IN")}</td>
                <td>
                  <div className="table-actions">
                    <button className="icon-button" title="View" type="button" onClick={() => window.alert(item.review)}><Eye size={16} /></button>
                    <button className="icon-button" title="Edit" type="button" onClick={() => editTestimonial(item)}><Pencil size={16} /></button>
                    <button className="icon-button" title="Duplicate" type="button" onClick={() => void duplicateTestimonial(item.id)}><Copy size={16} /></button>
                    <button className="icon-button" title={item.published ? "Unpublish" : "Publish"} type="button" onClick={() => void patchTestimonial(item.id, { published: !item.published })}>{item.published ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    <button className="icon-button" title={item.featured ? "Unfeature" : "Feature"} type="button" onClick={() => void patchTestimonial(item.id, { featured: !item.featured })}><Star size={16} /></button>
                    <button className="icon-button" title="Archive" type="button" onClick={() => void patchTestimonial(item.id, { archived: true, published: false })}><Archive size={16} /></button>
                    <button className="icon-button" title="Delete" type="button" onClick={() => void deleteTestimonial(item.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
