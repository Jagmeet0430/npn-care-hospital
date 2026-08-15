import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requirePermission } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await requirePermission("cms:update", request);

  if (!authorization.authorized) {
    return authorization.response;
  }

  const { data, error } = await supabase
    .from("blog_categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    console.error("GET /api/blog/categories:", error);

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
    categories: data ?? [],
  });
}