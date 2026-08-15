import type { Metadata } from "next";

import { JsonLd } from "@/components/JsonLd";
import { PageLoadingBar } from "@/components/Motion";
import { PublicSiteChrome } from "@/components/PublicSiteChrome";

import { getCmsContent } from "@/lib/cms";
import { getPublishedTestimonials } from "@/lib/testimonials";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://npncarehospital.com"),

  title: {
    default:
      "N.P.N. Care Hospital | Integrated Healthcare for Better Living",
    template: "%s | N.P.N. Care Hospital",
  },

  description:
    "Personalized treatment through Ayurveda, Naturopathy, Electro Homeopathy, and Integrative Healthcare with experienced doctors.",

  keywords: [
    "NPN Care Hospital",
    "Navel Power Naturopathy India Pvt Ltd",
    "Ayurveda hospital Iglas",
    "Naturopathy hospital Aligarh",
    "Electro Homeopathy care",
    "joint pain treatment",
    "diabetes care",
    "chronic disease support",
  ],

  openGraph: {
    title: "N.P.N. Care Hospital",
    description: "Integrated Healthcare for Better Living",
    type: "website",
    images: ["/images/npn-care-hero.png"],
  },

  twitter: {
    card: "summary_large_image",
    title: "N.P.N. Care Hospital",
    description: "Integrated Healthcare for Better Living",
    images: ["/images/npn-care-hero.png"],
  },

  alternates: {
    canonical: "/",
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getCmsContent();
  const testimonials = await getPublishedTestimonials();

  return (
    <html lang="en">
      <body>
        <JsonLd
          content={content}
          testimonials={testimonials}
        />

        <PageLoadingBar />

        <PublicSiteChrome
          hospital={content.hospital}
          footer={content.footer}
        >
          {children}
        </PublicSiteChrome>
      </body>
    </html>
  );
}