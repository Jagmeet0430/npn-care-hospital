import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/server-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requirePermission("cms:update", request);

  if (!authorization.authorized) {
    return authorization.response;
  }

  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .select(`
      *,
      blog_categories (
        id,
        name,
        slug
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ADMIN BLOG GET ERROR:", error);

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
    posts: data ?? [],
  });
}

export async function POST(request: Request) {
  const authorization = await requirePermission("cms:update", request);

  if (!authorization.authorized) {
    return authorization.response;
  }

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

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof slug !== "string" ||
    !slug.trim()
  ) {
    return NextResponse.json(
      {
        ok: false,
        message: "Title and slug are required.",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("blog_posts")
    .insert({
      title: title.trim(),
      slug: slug.trim(),
      excerpt: typeof excerpt === "string" ? excerpt : "",
      content: typeof content === "string" ? content : "",
      featured_image:
        typeof featured_image === "string" ? featured_image : null,
      category_id:
        typeof category_id === "string" && category_id
          ? category_id
          : null,
      author_name:
        typeof author_name === "string" ? author_name : null,
      author_role:
        typeof author_role === "string" ? author_role : null,
      status:
        status === "PUBLISHED" || status === "DRAFT"
          ? status
          : "DRAFT",
      is_featured: is_featured === true,
      reading_time:
        typeof reading_time === "number" ? reading_time : 5,
      seo_title:
        typeof seo_title === "string" ? seo_title : null,
      seo_description:
        typeof seo_description === "string" ? seo_description : null,
      seo_keywords:
        typeof seo_keywords === "string" ? seo_keywords : null,
      published_at:
        typeof published_at === "string" && published_at
          ? published_at
          : null,
    })
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
    console.error("ADMIN BLOG CREATE ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        message: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      post: data,
    },
    { status: 201 }
  );
}