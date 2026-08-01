import type { Metadata } from "next";
import { Play } from "lucide-react";
import { Section } from "@/components/Section";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Hospital gallery, facilities, videos, patient education, and visual proof of care."
};

export const dynamic = "force-dynamic";

function getVideo(item: Awaited<ReturnType<typeof getCmsContent>>["videoTitles"][number], index: number) {
  if (typeof item === "string") {
    return {
      id: `video-${index + 1}`,
      title: item,
      category: "Patient Education",
      description: "Hospital video guidance for patients and families.",
      url: "",
      thumbnail: "",
      featured: index === 0
    };
  }

  return {
    id: item.id || `video-${index + 1}`,
    title: item.title,
    category: item.category,
    description: item.description,
    url: item.url,
    thumbnail: item.thumbnail,
    featured: item.featured
  };
}

export default async function GalleryPage() {
  const { facilities, gallery, galleryImages, homepage, videoTitles } = await getCmsContent();
  const categoryImages = new Map(galleryImages.filter((image) => image.category).map((image) => [image.category as string, image]));
  const videos = videoTitles.map(getVideo).filter((video) => video.title.trim()).sort((a, b) => Number(b.featured) - Number(a.featured));

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
          <div className="hospital-photo-grid gallery-swipe-grid">
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
        <div className="grid grid-4 gallery-swipe-grid">
          {gallery.map((item) => {
            const image = categoryImages.get(item);
            return (
              <div className="media-tile" key={item} style={image ? { backgroundImage: `linear-gradient(145deg, rgba(15, 23, 42, 0.52), rgba(15, 23, 42, 0.16)), url(${image.src})` } : undefined}>
                {item}
              </div>
            );
          })}
        </div>
      </Section>

      <Section className="band" title="Facility Highlights" text={homepage.facilitiesText}>
        <div className="grid grid-4 gallery-swipe-grid">
          {facilities.map((facility) => (
            <article className="card" key={facility.name}>
              <h3>{facility.name}</h3>
              <p>{facility.summary}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Video Gallery" title={homepage.videoTitle}>
        <div className="grid grid-3 gallery-swipe-grid">
          {videos.map((video) => (
            <a
              className="video-tile"
              href={video.url || "#"}
              key={video.id}
              rel="noreferrer"
              target={video.url ? "_blank" : undefined}
              style={video.thumbnail ? { backgroundImage: `linear-gradient(145deg, rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.24)), url(${video.thumbnail})` } : undefined}
            >
              <span className="play">
                <Play size={28} fill="white" />
              </span>
              <small>{video.category}</small>
              <span>{video.title}</span>
              <p>{video.description}</p>
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}
