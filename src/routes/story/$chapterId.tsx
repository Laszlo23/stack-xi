import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PageShell } from "@/components/layout/AppShell";
import { PEPE_ORIGIN_CHAPTERS } from "@/lib/story/pepe-origin-chapters";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";
import { absoluteUrl } from "@/lib/seo/site-config";
import { farcasterComposeUrl } from "@/lib/profile/social-links";

function xComposeUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export const Route = createFileRoute("/story/$chapterId")({
  loader: ({ params }) => {
    const chapter = PEPE_ORIGIN_CHAPTERS.find((c) => c.id === params.chapterId);
    if (!chapter) throw notFound();
    return chapter;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return buildPageSeo({
      title: loaderData.title,
      description: loaderData.line,
      path: `/story/${loaderData.id}`,
      ogImage: absoluteUrl(loaderData.image),
      ogImageAlt: loaderData.title,
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Story", path: "/story" },
        { name: loaderData.title, path: `/story/${loaderData.id}` },
      ]),
    });
  },
  component: StoryChapterPage,
});

function StoryChapterPage() {
  const chapter = Route.useLoaderData();

  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Link to="/story" className="text-sm font-semibold text-primary hover:underline">
          ← All chapters
        </Link>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border/50">
          <img src={chapter.image} alt="" className="aspect-[16/10] w-full object-cover" />
        </div>
        <div className="mt-6 font-mono text-[10px] uppercase tracking-widest text-primary">
          Chapter {chapter.chapter}
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{chapter.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{chapter.line}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          <a
            href={farcasterComposeUrl(chapter.sharePost)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
          >
            Cast <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href={xComposeUrl(chapter.sharePost)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-4 py-2 text-sm font-semibold"
          >
            Post on X <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </article>
    </PageShell>
  );
}
