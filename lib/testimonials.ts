import { unstable_noStore as noStore } from "next/cache";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { TestimonialInput } from "@/lib/testimonial-shared";

export type TestimonialRecord = TestimonialInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

const testimonialsPath = path.join(process.cwd(), "data", "testimonials.json");

function normalizeTestimonial(item: Partial<TestimonialRecord>, index: number): TestimonialRecord {
  const now = new Date().toISOString();
  return {
    id: item.id ?? crypto.randomUUID(),
    patientName: item.patientName ?? (item as { name?: string }).name ?? "Patient",
    patientPhoto: item.patientPhoto ?? "",
    city: item.city ?? "",
    doctorName: item.doctorName ?? "",
    treatment: item.treatment ?? (item as { condition?: string }).condition ?? "Treatment",
    review: item.review ?? (item as { quote?: string }).quote ?? "",
    rating: item.rating ?? 5,
    beforeImage: item.beforeImage ?? "",
    afterImage: item.afterImage ?? "",
    video: item.video ?? "",
    featured: item.featured ?? false,
    published: item.published ?? true,
    archived: item.archived ?? false,
    displayOrder: item.displayOrder ?? index + 1,
    consent: item.consent ?? true,
    date: item.date ?? (item.createdAt ?? now).slice(0, 10),
    createdAt: item.createdAt ?? now,
    updatedAt: item.updatedAt ?? item.createdAt ?? now
  };
}

async function saveTestimonials(testimonials: TestimonialRecord[]) {
  await mkdir(path.dirname(testimonialsPath), { recursive: true });
  await writeFile(testimonialsPath, `${JSON.stringify(testimonials, null, 2)}\n`, "utf8");
}

export async function getTestimonials(includeArchived = false): Promise<TestimonialRecord[]> {
  noStore();

  try {
    const raw = await readFile(testimonialsPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<TestimonialRecord>[];
    const normalized = parsed.map(normalizeTestimonial);
    const liveTestimonials = normalized.filter((item) => !item.id.startsWith("testimonial_seed_"));

    if (liveTestimonials.length !== normalized.length) {
      await saveTestimonials(liveTestimonials);
    }

    return includeArchived ? liveTestimonials : liveTestimonials.filter((item) => !item.archived);
  } catch {
    await saveTestimonials([]);
    return [];
  }
}

export async function getPublishedTestimonials() {
  const testimonials = await getTestimonials();
  return testimonials
    .filter((item) => item.published && item.consent)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addTestimonial(input: TestimonialInput) {
  const testimonials = await getTestimonials(true);
  const now = new Date().toISOString();
  const testimonial: TestimonialRecord = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now
  };

  await saveTestimonials([testimonial, ...testimonials]);
  return testimonial;
}

export async function updateTestimonial(id: string, update: Partial<TestimonialInput>) {
  const testimonials = await getTestimonials(true);
  const index = testimonials.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: TestimonialRecord = {
    ...testimonials[index],
    ...update,
    updatedAt: new Date().toISOString()
  };

  testimonials[index] = updated;
  await saveTestimonials(testimonials);
  return updated;
}

export async function deleteTestimonial(id: string) {
  const testimonials = await getTestimonials(true);
  const testimonial = testimonials.find((item) => item.id === id);
  if (!testimonial) return null;

  await saveTestimonials(testimonials.filter((item) => item.id !== id));
  return testimonial;
}

export async function duplicateTestimonial(id: string) {
  const testimonials = await getTestimonials(true);
  const testimonial = testimonials.find((item) => item.id === id);
  if (!testimonial) return null;

  const now = new Date().toISOString();
  const copy: TestimonialRecord = {
    ...testimonial,
    id: crypto.randomUUID(),
    patientName: `${testimonial.patientName} Copy`,
    published: false,
    featured: false,
    displayOrder: testimonials.length + 1,
    createdAt: now,
    updatedAt: now
  };

  await saveTestimonials([copy, ...testimonials]);
  return copy;
}

export async function reorderTestimonials(order: Array<{ id: string; displayOrder: number }>) {
  const testimonials = await getTestimonials(true);
  const orderMap = new Map(order.map((item) => [item.id, item.displayOrder]));
  const now = new Date().toISOString();
  const updated = testimonials.map((testimonial) =>
    orderMap.has(testimonial.id)
      ? { ...testimonial, displayOrder: orderMap.get(testimonial.id) ?? testimonial.displayOrder, updatedAt: now }
      : testimonial
  );

  await saveTestimonials(updated);
  return updated.filter((item) => !item.archived);
}

type LegacyCmsTestimonial = {
  name?: string;
  condition?: string;
  quote?: string;
  patientName?: string;
  patientPhoto?: string;
  city?: string;
  doctorName?: string;
  treatment?: string;
  review?: string;
  rating?: number;
  beforeImage?: string;
  afterImage?: string;
  video?: string;
  featured?: boolean;
  published?: boolean;
  displayOrder?: number;
  consent?: boolean;
  date?: string;
};

export async function syncTestimonialsFromCms(items: LegacyCmsTestimonial[]) {
  const existing = await getTestimonials(true);
  const now = new Date().toISOString();
  const synced = items.map((item, index): TestimonialRecord => {
    const previous = existing[index];
    const patientName = item.patientName ?? item.name ?? previous?.patientName ?? "Patient";

    return {
      id: previous?.id ?? crypto.randomUUID(),
      patientName,
      patientPhoto: item.patientPhoto ?? previous?.patientPhoto ?? "",
      city: item.city ?? previous?.city ?? "",
      doctorName: item.doctorName ?? previous?.doctorName ?? "",
      treatment: item.treatment ?? item.condition ?? previous?.treatment ?? "Treatment",
      review: item.review ?? item.quote ?? previous?.review ?? "",
      rating: item.rating ?? previous?.rating ?? 5,
      beforeImage: item.beforeImage ?? previous?.beforeImage ?? "",
      afterImage: item.afterImage ?? previous?.afterImage ?? "",
      video: item.video ?? previous?.video ?? "",
      featured: item.featured ?? previous?.featured ?? index === 0,
      published: item.published ?? previous?.published ?? true,
      archived: false,
      displayOrder: item.displayOrder ?? index + 1,
      consent: item.consent ?? previous?.consent ?? true,
      date: item.date ?? previous?.date ?? now.slice(0, 10),
      createdAt: previous?.createdAt ?? now,
      updatedAt: now
    };
  });

  await saveTestimonials(synced);
  return synced;
}
