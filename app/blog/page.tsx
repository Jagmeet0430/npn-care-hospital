import type { Metadata } from "next";
import { KnowledgeCenter } from "@/components/KnowledgeCenter";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Health Knowledge Center",
  description: "Doctor-reviewed health articles in simple language from N.P.N. Care Hospital."
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const { blogPosts } = await getCmsContent();
  const now = Date.now();
  const publishedPosts = blogPosts.filter((post) => {
    const status = "status" in post ? post.status : "Published";
    const scheduledFor = "scheduledFor" in post ? post.scheduledFor : undefined;
    return status !== "Draft" && (!scheduledFor || new Date(String(scheduledFor)).getTime() <= now);
  });

  return <KnowledgeCenter articles={publishedPosts} />;
}
