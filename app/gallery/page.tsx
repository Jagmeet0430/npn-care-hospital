import type { Metadata } from "next";
import { Play } from "lucide-react";
import { Section } from "@/components/Section";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Hospital gallery, facilities, videos, patient education, and visual proof of care."
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const { facilities, gallery, galleryImages, homepage, videoTitles } = await getCmsContent();

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="eyebrow">Gallery</span>
          <h1>{homepage.galleryTitle}</h1>
          <p className="lead">A simple, premium gallery for facilities, education, patient awareness, health camps, and hospital moments.</p>
        </div>
      </section>

      {galleryImages.length ? (
        <Section title="Hospital Photos">
          <div className="hospital-photo-grid">
            {galleryImages.map((image) => (
              <article className="hospital-photo-card" key={image.id}>
                <img alt={image.alt} src={image.src} />
                <div>
                  <h3>{image.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="Photo Categories">
        <div className="grid grid-4">
          {gallery.map((item) => (
            <div className="media-tile" key={item}>
              {item}
            </div>
          ))}
        </div>
      </Section>

      <Section className="band" title="Facility Highlights" text={homepage.facilitiesText}>
        <div className="grid grid-4">
          {facilities.map((facility) => (
            <article className="card" key={facility.name}>
              <h3>{facility.name}</h3>
              <p>{facility.summary}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Video Gallery" title={homepage.videoTitle}>
        <div className="grid grid-3">
          {videoTitles.map((item) => (
            <div className="video-tile" key={item}>
              <span className="play">
                <Play size={28} fill="white" />
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
