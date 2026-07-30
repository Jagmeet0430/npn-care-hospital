"use client";

import { useRef, useState } from "react";
import { ImagePlus, UploadCloud } from "lucide-react";
import type { HospitalGalleryImage } from "@/lib/gallery-shared";

type AdminGalleryUploaderProps = {
  images: HospitalGalleryImage[];
};

export function AdminGalleryUploader({ images: initialImages }: AdminGalleryUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState(initialImages);
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [status, setStatus] = useState("Upload hospital photos here. They will appear on the customer gallery page.");
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title || file.name.replace(/\.[^.]+$/, ""));
    formData.append("alt", alt || "N.P.N. Care Hospital image");

    setUploading(true);
    setStatus("Uploading image...");

    const response = await fetch("/api/gallery-images", {
      method: "POST",
      body: formData
    });

    const result = (await response.json()) as {
      ok: boolean;
      image?: HospitalGalleryImage;
      message?: string;
    };

    setUploading(false);

    if (!response.ok || !result.image) {
      setStatus(result.message ?? "Could not upload image. Check your admin session and file type.");
      return;
    }

    setImages((current) => [result.image as HospitalGalleryImage, ...current]);
    setTitle("");
    setAlt("");
    if (inputRef.current) inputRef.current.value = "";
    setStatus("Image uploaded. It is now visible on the customer gallery page.");
  }

  return (
    <section className="gallery-uploader" aria-label="Hospital image upload">
      <div className="section-heading compact-heading">
        <span className="eyebrow">
          <ImagePlus size={17} />
          Hospital Images
        </span>
        <h2>Upload hospital photos</h2>
        <p>Use real photos of reception, therapy rooms, doctors, wellness spaces, pharmacy, and patient areas.</p>
      </div>

      <div className="upload-panel">
        <label>
          Image title
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Reception area, therapy room, doctor cabin" />
        </label>
        <label>
          Image description
          <input value={alt} onChange={(event) => setAlt(event.target.value)} placeholder="Short description for patients and accessibility" />
        </label>
        <label className="upload-dropzone">
          <UploadCloud size={24} />
          <strong>{uploading ? "Uploading..." : "Choose hospital image"}</strong>
          <span>JPG, PNG, or WebP up to 6MB</span>
          <input
            ref={inputRef}
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadImage(file);
            }}
            type="file"
          />
        </label>
      </div>

      <p className="success-note">{status}</p>

      {images.length ? (
        <div className="uploaded-gallery-grid">
          {images.map((image) => (
            <article className="uploaded-image-card" key={image.id}>
              <img alt={image.alt} src={image.src} />
              <div>
                <h3>{image.title}</h3>
                <p>{new Date(image.uploadedAt).toLocaleDateString("en-IN")}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
