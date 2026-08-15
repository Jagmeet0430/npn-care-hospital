import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/server-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  const authorization = await requirePermission("cms:update", request);

  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid blog post payload.",
      },
      { status: 400 }
    );
  }

  const {
    title,
    slug,
    excerpt,
    content,
    featured_image,
    category_id,
    author_name,
    author_role,
    status,
    is_featured,
    reading_time,
    seo_title,
    seo_description,
    seo_keywords,
    published_at,
  } = body as Record<string, unknown>;

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof title === "string") updates.title = title.trim();
  if (typeof slug === "string") updates.slug = slug.trim();
  if (typeof excerpt === "string") updates.excerpt = excerpt;
  if (typeof content === "string") updates.content = content;

  if (
    featured_image === null ||
    typeof featured_image === "string"
  ) {
    updates.featured_image = featured_image;
  }

  if (
    category_id === null ||
    typeof category_id === "string"
  ) {
    updates.category_id = category_id;
  }

  if (author_name === null || typeof author_name === "string") {
    updates.author_name = author_name;
  }

  if (author_role === null || typeof author_role === "string") {
    updates.author_role = author_role;
  }

  if (status === "PUBLISHED" || status === "DRAFT") {
    updates.status = status;
  }

  if (typeof is_featured === "boolean") {
    updates.is_featured = is_featured;
  }

  if (typeof reading_time === "number") {
    updates.reading_time = reading_time;
  }

  if (seo_title === null || typeof seo_title === "string") {
    updates.seo_title = seo_title;
  }

  if (
    seo_description === null ||
    typeof seo_description === "string"
  ) {
    updates.seo_description = seo_description;
  }

  if (
    seo_keywords === null ||
    typeof seo_keywords === "string"
  ) {
    updates.seo_keywords = seo_keywords;
  }

  if (
    published_at === null ||
    typeof published_at === "string"
  ) {
    updates.published_at = published_at;
  }

  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .update(updates)
    .eq("id", id)
    .select(`
      *,
      blog_categories (
        id,
        name,
        slug
      )
    `)
    .single();

  if (error) {
    console.error("ADMIN BLOG UPDATE ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        message: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    post: data,
  });
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  const authorization = await requirePermission("cms:update", request);

  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from("blog_posts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("ADMIN BLOG DELETE ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        message: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Blog post deleted.",
  });
}