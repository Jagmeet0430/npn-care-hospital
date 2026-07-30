import type { CmsContent } from "@/lib/cms";

type JsonLdProps = {
  content: CmsContent;
};

export function JsonLd({ content }: JsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Hospital",
    name: content.hospital.name,
    legalName: content.hospital.legalName,
    telephone: content.hospital.phone,
    email: content.hospital.email,
    address: content.hospital.address,
    medicalSpecialty: content.treatments.map((item) => item.title),
    availableService: content.treatments.map((item) => ({
      "@type": "MedicalTherapy",
      name: item.title,
      description: item.summary
    }))
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
