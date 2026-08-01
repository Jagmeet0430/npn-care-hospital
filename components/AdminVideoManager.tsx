"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Link2, Plus, Save, Star, Trash2, Video } from "lucide-react";
import type { CmsContent, CmsVideoItem } from "@/lib/cms";

type AdminVideoManagerProps = {
  initialContent: CmsContent;
};

type VideoDraft = CmsVideoItem & {
  id: string;
};

const emptyVideo: VideoDraft = {
  id: "",
  title: "",
  category: "Patient Education",
  description: "",
  url: "",
  thumbnail: "",
  featured: false
};

function makeVideo(item: CmsContent["videoTitles"][number], index: number): VideoDraft {
  if (typeof item === "string") {
    return {
      ...emptyVideo,
      id: `video-${index + 1}`,
      title: item,
      description: "Add a short patient-friendly description and video link.",
      featured: index === 0
    };
  }

  return {
    ...emptyVideo,
    ...item,
    id: item.id || `video-${index + 1}`
  };
}

function serializeVideo(video: VideoDraft): CmsVideoItem {
  return {
    id: video.id,
    title: video.title.trim(),
    category: video.category.trim() || "Patient Education",
    description: video.description.trim(),
    url: video.url.trim(),
    thumbnail: video.thumbnail.trim(),
    featured: video.featured
  };
}

export function AdminVideoManager({ initialContent }: AdminVideoManagerProps) {
  const [content, setContent] = useState(initialContent);
  const [videos, setVideos] = useState<VideoDraft[]>(initialContent.videoTitles.map(makeVideo));
  const [selectedId, setSelectedId] = useState(videos[0]?.id ?? "");
  const [draft, setDraft] = useState<VideoDraft>(videos[0] ?? { ...emptyVideo, id: crypto.randomUUID() });
  const [status, setStatus] = useState("Add real video links and thumbnails here. Customer gallery updates after save.");
  const [saving, setSaving] = useState(false);

  const selectedVideo = useMemo(() => videos.find((video) => video.id === selectedId) ?? videos[0], [selectedId, videos]);
  const publishedVideos = videos.filter((video) => video.title.trim());

  function selectVideo(video: VideoDraft) {
    setSelectedId(video.id);
    setDraft(video);
    setStatus(`Editing ${video.title || "new video"}.`);
  }

  function addVideo() {
    const next = {
      ...emptyVideo,
      id: crypto.randomUUID(),
      title: "New hospital video",
      description: "Short patient-friendly video description."
    };
    setSelectedId(next.id);
    setDraft(next);
    setStatus("New video ready. Add title, link, thumbnail, then save.");
  }

  function setField<K extends keyof VideoDraft>(key: K, value: VideoDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function saveVideo() {
    if (!draft.title.trim()) {
      setStatus("Video title is required.");
      return;
    }

    setSaving(true);
    const cleanDraft = serializeVideo(draft);
    const nextVideos = [cleanDraft, ...videos.filter((video) => video.id !== selectedVideo?.id && video.id !== draft.id).map(serializeVideo)];
    const nextContent = { ...content, videoTitles: nextVideos };

    const response = await fetch("/api/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextContent)
    });

    setSaving(false);
    if (!response.ok) {
      setStatus(response.status === 401 ? "Admin login expired. Please login again." : "Could not save video.");
      return;
    }

    const result = (await response.json()) as { content: CmsContent };
    const updatedVideos = result.content.videoTitles.map(makeVideo);
    const updatedDraft = makeVideo(cleanDraft, 0);
    setContent(result.content);
    setVideos(updatedVideos);
    setSelectedId(updatedDraft.id);
    setDraft(updatedDraft);
    setStatus("Video saved. It is now updated on the customer gallery page.");
  }

  async function deleteVideo(id: string) {
    const nextVideos = videos.filter((video) => video.id !== id).map(serializeVideo);
    const response = await fetch("/api/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...content, videoTitles: nextVideos })
    });

    if (!response.ok) {
      setStatus("Could not delete video.");
      return;
    }

    const result = (await response.json()) as { content: CmsContent };
    const updatedVideos = result.content.videoTitles.map(makeVideo);
    setContent(result.content);
    setVideos(updatedVideos);
    setSelectedId(updatedVideos[0]?.id ?? "");
    setDraft(updatedVideos[0] ?? { ...emptyVideo, id: crypto.randomUUID() });
    setStatus("Video deleted from admin and customer website.");
  }

  return (
    <section className="admin-video-manager">
      <div className="admin-video-top">
        <div>
          <span className="eyebrow">
            <Video size={17} />
            Video Publishing Center
          </span>
          <h2>Manage patient education videos.</h2>
          <p>{status}</p>
        </div>
        <button className="button button-gold" type="button" onClick={addVideo}>
          <Plus size={18} />
          Add Video
        </button>
      </div>

      <div className="admin-video-layout">
        <aside className="admin-video-list" aria-label="Video list">
          {publishedVideos.length ? (
            publishedVideos.map((video) => (
              <button className={video.id === selectedId ? "active" : ""} type="button" key={video.id} onClick={() => selectVideo(video)}>
                <span>{video.category}</span>
                <strong>{video.title}</strong>
                <small>{video.url ? "Linked video" : "Needs video link"}</small>
              </button>
            ))
          ) : (
            <div className="empty-state">No videos yet. Add the first real hospital video.</div>
          )}
        </aside>

        <div className="admin-video-editor">
          <div className="form-grid">
            <label>
              Video Title
              <input value={draft.title} onChange={(event) => setField("title", event.target.value)} placeholder="Doctor explains chronic care" />
            </label>
            <label>
              Category
              <select value={draft.category} onChange={(event) => setField("category", event.target.value)}>
                {["Patient Education", "Doctor Guidance", "Facility Tour", "Patient Story", "Wellness Tips", "Health Camp"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Video URL
              <input value={draft.url} onChange={(event) => setField("url", event.target.value)} placeholder="YouTube, Instagram, Facebook, or video link" />
            </label>
            <label>
              Thumbnail URL
              <input value={draft.thumbnail} onChange={(event) => setField("thumbnail", event.target.value)} placeholder="/images/video-cover.jpg or image URL" />
            </label>
          </div>

          <label>
            Patient-Friendly Description
            <textarea value={draft.description} onChange={(event) => setField("description", event.target.value)} placeholder="Explain what patients will learn from this video." />
          </label>

          <label className="toggle-row">
            <input checked={draft.featured} type="checkbox" onChange={(event) => setField("featured", event.target.checked)} />
            <span>
              <Star size={16} />
              Feature this video first
            </span>
          </label>

          <div className="admin-video-actions">
            <button className="button button-primary" type="button" onClick={saveVideo} disabled={saving}>
              <Save size={18} />
              {saving ? "Saving..." : "Save Video"}
            </button>
            {draft.url ? (
              <a className="button button-quiet" href={draft.url} target="_blank" rel="noreferrer">
                <ExternalLink size={18} />
                Preview Link
              </a>
            ) : null}
            <button className="button button-quiet danger" type="button" onClick={() => void deleteVideo(draft.id)}>
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        <aside className="admin-video-preview">
          <span className="eyebrow">
            <Link2 size={17} />
            Customer Preview
          </span>
          <div className="video-preview-card" style={draft.thumbnail ? { backgroundImage: `linear-gradient(145deg, rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.22)), url(${draft.thumbnail})` } : undefined}>
            <span className="play">▶</span>
            <strong>{draft.title || "Video title"}</strong>
            <small>{draft.category}</small>
          </div>
          <p>{draft.description || "Add a short description so patients understand why this video is useful."}</p>
        </aside>
      </div>
    </section>
  );
}
