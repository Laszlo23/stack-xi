import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { BlogPostPage } from "@/features/blog/BlogPostPage";
import { getBlogPost } from "@/lib/blog/posts";
import { buildBlogPostJsonLd, buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";
import { absoluteUrl } from "@/lib/seo/site-config";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getBlogPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const heroImage = loaderData.heroImage ? absoluteUrl(loaderData.heroImage) : undefined;
    const seo = buildPageSeo({
      title: loaderData.title,
      description: loaderData.excerpt,
      path: `/blog/${loaderData.slug}`,
      ogType: "article",
      ogImage: heroImage,
      ogImageAlt: loaderData.title,
      keywords: loaderData.tags,
      article: {
        publishedTime: loaderData.publishedAt,
        modifiedTime: loaderData.updatedAt,
        author: loaderData.author,
        section: loaderData.category,
        tags: loaderData.tags,
      },
      jsonLd: [
        buildBlogPostJsonLd({
          ...loaderData,
          heroImage,
        }),
        buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: loaderData.title, path: `/blog/${loaderData.slug}` },
        ]),
      ],
    });
    return seo;
  },
  component: BlogPostRoute,
});

function BlogPostRoute() {
  const post = Route.useLoaderData();
  return (
    <PageShell>
      <BlogPostPage post={post} />
    </PageShell>
  );
}
