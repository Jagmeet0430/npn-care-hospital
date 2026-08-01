import { z } from "zod";

export const testimonialSchema = z.object({
  patientName: z.string().min(2).max(120),
  patientPhoto: z.string().max(20000).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  doctorName: z.string().max(120).optional().or(z.literal("")),
  treatment: z.string().min(2).max(140),
  review: z.string().min(8).max(900),
  rating: z.coerce.number().int().min(1).max(5),
  beforeImage: z.string().max(20000).optional().or(z.literal("")),
  afterImage: z.string().max(20000).optional().or(z.literal("")),
  video: z.string().max(20000).optional().or(z.literal("")),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(true),
  archived: z.coerce.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
  consent: z.coerce.boolean().refine(Boolean, "Patient consent is required."),
  date: z.string().min(1).max(40)
});

export const testimonialUpdateSchema = testimonialSchema.partial();
export type TestimonialInput = z.infer<typeof testimonialSchema>;
