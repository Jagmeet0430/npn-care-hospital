import type { CmsContent } from "@/lib/cms";
import type { TestimonialRecord } from "@/lib/testimonials";

type JsonLdProps = {
  content: CmsContent;
  testimonials?: TestimonialRecord[];
};

export function JsonLd({ content, testimonials = [] }: JsonLdProps) {
  const aggregateRating = testimonials.length
    ? {
        "@type": "AggregateRating",
        ratingValue: (testimonials.reduce((sum, item) => sum + item.rating, 0) / testimonials.length).toFixed(1),
        reviewCount: testimonials.length
      }
    : undefined;

  const data = {
    "@context": "https://schema.org",
    "@type": "Hospital",
    name: content.hospital.name,
    legalName: content.hospital.legalName,
    telephone: content.hospital.phone,
    email: content.hospital.email,
    sameAs: [content.hospital.instagram, content.hospital.facebook, content.hospital.youtube],
    address: content.hospital.address,
    medicalSpecialty: content.treatments.map((item) => item.title),
    availableService: content.treatments.map((item) => ({
      "@type": "MedicalTherapy",
      name: item.title,
      description: item.summary
    })),
    ...(aggregateRating ? { aggregateRating } : {}),
    review: testimonials.map((item) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: item.patientName
      },
      reviewBody: item.review,
      datePublished: item.date,
      reviewRating: {
        "@type": "Rating",
        ratingValue: item.rating,
        bestRating: 5,
        worstRating: 1
      },
      itemReviewed: {
        "@type": "Hospital",
        name: content.hospital.name
      }
    }))
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
