import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { WorldCupPromoBanner } from "@/features/growth/WorldCupPromoBanner";
import { WorldCupSnapshotSection } from "@/features/story/WorldCupSnapshotSection";
import { MatchdayStorySection } from "@/features/story/MatchdayStorySection";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/world-cup")({
  head: () =>
    buildPageSeo({
      title: "World Cup 2026 Culture",
      description:
        "World Cup 2026 matchday culture on STACK XI — bracket picks, match stories, and community predictions on Base.",
      path: "/world-cup",
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "World Cup", path: "/world-cup" },
      ]),
    }),
  component: WorldCupPage,
});

function WorldCupPage() {
  return (
    <PageShell>
      <WorldCupPromoBanner />
      <WorldCupSnapshotSection />
      <MatchdayStorySection />
    </PageShell>
  );
}
