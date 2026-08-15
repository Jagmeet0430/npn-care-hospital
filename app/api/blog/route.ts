import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requirePermission } from "@/lib/server-auth";
import { appendAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

// GET — Admin: get all blog posts
export async function GET(request: Request) {
  const authorization = await requirePermission("cms:update", request);

  if (!authorization.authorized) {
    return authorization.response;
  }

  try {
    const { data, error } = await supabase
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
      console.error("GET /api/blog:", error);

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
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Unable to load blog posts.",
      },
      { status: 500 }
    );
  }
}

// POST — Create blog post
export async function POST(request: Request) {
  const authorization = await requirePermission("cms:update", request);

  if (!authorization.authorized) {
    return authorization.response;
  }

  try {
    const body = await request.json();

    if (!body?.title || !body?.slug || !body?.content) {
      return NextResponse.json(
        {
          ok: false,
          message: "Title, slug and content are required.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt ?? "",
        content: body.content ?? "",
        featured_image: body.featuredImage ?? null,
        category_id: body.categoryId ?? null,
        author_name: body.authorName ?? "N.P.N. Care Hospital",
        author_role: body.authorRole ?? "Health & Wellness Team",
        status: body.status ?? "DRAFT",
        is_featured: body.isFeatured ?? false,
        reading_time: Number(body.readingTime ?? 5),
        views: 0,
        seo_title: body.seoTitle ?? body.title,
        seo_description: body.seoDescription ?? body.excerpt ?? "",
        seo_keywords: body.seoKeywords ?? "",
        published_at:
          body.status === "PUBLISHED"
            ? body.publishedAt ?? new Date().toISOString()
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
      console.error("POST /api/blog:", error);

      return NextResponse.json(
        {
          ok: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    await appendAuditLog({
      action: "BLOG_CREATED",
      actorId: authorization.session.user.id,
      actorEmail: authorization.session.user.email ?? undefined,
      role: authorization.session.user.role,
      targetType: "BLOG_POST",
      targetId: data.id,
      message: `Blog post created: ${data.title}`,
    });

    return NextResponse.json(
      {
        ok: true,
        post: data,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Unable to create blog post.",
      },
      { status: 500 }
    );
  }
}

// PUT — Update blog post
export async function PUT(request: Request) {
  const authorization = await requirePermission("cms:update", request);

  if (!authorization.authorized) {
    return authorization.response;
  }

  try {
    const body = await request.json();

    if (!body?.id) {
      return NextResponse.json(
        {
          ok: false,
          message: "Blog post ID is required.",
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.content !== undefined) updateData.content = body.content;

    if (body.featuredImage !== undefined) {
      updateData.featured_image = body.featuredImage;
    }

    if (body.categoryId !== undefined) {
      updateData.category_id = body.categoryId || null;
    }

    if (body.authorName !== undefined) {
      updateData.author_name = body.authorName;
    }

    if (body.authorRole !== undefined) {
      updateData.author_role = body.authorRole;
    }

    if (body.status !== undefined) {
      updateData.status = body.status;

      if (body.status === "PUBLISHED") {
        updateData.published_at =
          body.publishedAt ?? new Date().toISOString();
      } else {
        updateData.published_at = null;
      }
    }

    if (body.isFeatured !== undefined) {
      updateData.is_featured = body.isFeatured;
    }

    if (body.readingTime !== undefined) {
      updateData.reading_time = Number(body.readingTime);
    }

    if (body.seoTitle !== undefined) {
      updateData.seo_title = body.seoTitle;
    }

    if (body.seoDescription !== undefined) {
      updateData.seo_description = body.seoDescription;
    }

    if (body.seoKeywords !== undefined) {
      updateData.seo_keywords = body.seoKeywords;
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .update(updateData)
      .eq("id", body.id)
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
      console.error("PUT /api/blog:", error);

      return NextResponse.json(
        {
          ok: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    await appendAuditLog({
      action: "BLOG_UPDATED",
      actorId: authorization.session.user.id,
      actorEmail: authorization.session.user.email ?? undefined,
      role: authorization.session.user.role,
      targetType: "BLOG_POST",
      targetId: data.id,
      message: `Blog post updated: ${data.title}`,
    });

    return NextResponse.json({
      ok: true,
      post: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Unable to update blog post.",
      },
      { status: 500 }
    );
  }
}

// DELETE — Delete blog post
export async function DELETE(request: Request) {
  const authorization = await requirePermission("cms:update", request);

  if (!authorization.authorized) {
    return authorization.response;
  }

  try {
    const body = await request.json();

    if (!body?.id) {
      return NextResponse.json(
        {
          ok: false,
          message: "Blog post ID is required.",
        },
        { status: 400 }
      );
    }

    const { data: existingPost } = await supabase
      .from("blog_posts")
      .select("id, title")
      .eq("id", body.id)
      .maybeSingle();

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", body.id);

    if (error) {
      console.error("DELETE /api/blog:", error);

      return NextResponse.json(
        {
          ok: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    await appendAuditLog({
      action: "BLOG_DELETED",
      actorId: authorization.session.user.id,
      actorEmail: authorization.session.user.email ?? undefined,
      role: authorization.session.user.role,
      targetType: "BLOG_POST",
      targetId: body.id,
      message: `Blog post deleted: ${existingPost?.title ?? body.id}`,
    });

    return NextResponse.json({
      ok: true,
      message: "Blog post deleted successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Unable to delete blog post.",
      },
      { status: 500 }
    );
  }
}