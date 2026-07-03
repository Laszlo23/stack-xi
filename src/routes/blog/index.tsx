import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { BlogIndexPage } from "@/features/blog/BlogIndexPage";
import { buildBlogIndexJsonLd, buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";
import { getBlogPosts } from "@/lib/blog/posts";

export const Route = createFileRoute("/blog/")({
  head: () => {
    const posts = getBlogPosts();
    const seo = buildPageSeo({
      title: "Blog",
      description:
        "STACK XI blog — Pepe matchday culture, Base USDC predictions, founding squad NFT mint guides, and Dallas World Cup 2026 builder stories.",
      path: "/blog",
      keywords: ["STACK XI blog", "Base crypto culture", "World Cup predictions", "NFT mint guide"],
      jsonLd: [
        buildBlogIndexJsonLd(posts.length),
        buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]),
      ],
    });
    return seo;
  },
  component: BlogRoute,
});

function BlogRoute() {
  return (
    <PageShell>
      <BlogIndexPage />
    </PageShell>
  );
}
