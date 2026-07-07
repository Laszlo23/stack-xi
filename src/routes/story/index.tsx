import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { PepeOriginStory } from "@/features/home/PepeOriginStory";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/story/")({
  head: () =>
    buildPageSeo({
      title: "How Pepe became STACK XI",
      description:
        "Pepe wasn't always lucky. Four chapters of matchday culture — from watching the feed to building STACK XI with the community.",
      path: "/story",
      keywords: ["Pepe lore", "STACK XI story", "Building Culture", "Farcaster football"],
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Story", path: "/story" },
      ]),
    }),
  component: StoryIndexPage,
});

function StoryIndexPage() {
  return (
    <PageShell>
      <PepeOriginStory />
      <div className="mx-auto max-w-7xl px-4 pb-16 text-center sm:px-6">
        <Link
          to="/story/visual"
          className="inline-flex rounded-xl border border-primary/40 px-6 py-3 text-sm font-bold text-primary hover:bg-primary/10"
        >
          Full visual lore →
        </Link>
        <Link
          to="/"
          hash="predict"
          className="ml-3 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          Back to predict →
        </Link>
      </div>
    </PageShell>
  );
}
