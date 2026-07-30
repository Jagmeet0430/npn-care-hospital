import type { MetadataRoute } from "next";
import { getCmsContent } from "@/lib/cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://npncarehospital.com";
  const { treatments } = await getCmsContent();
  const staticPages = [
    "",
    "/agreement",
    "/about",
    "/treatments",
    "/doctors",
    "/departments",
    "/facilities",
    "/schemes",
    "/faqs",
    "/gallery",
    "/blog",
    "/contact",
    "/admin",
    "/admin/agreements",
    "/doctor-dashboard",
    "/patient"
  ];

  return [
    ...staticPages.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8
    })),
    ...treatments.map((treatment) => ({
      url: `${base}/treatments/${treatment.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85
    }))
  ];
}
