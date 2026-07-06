import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/AppShell";
import { CultureFeedPage } from "@/features/feed/CultureFeedPage";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/feed")({
  head: () =>
    buildPageSeo({
      title: "Culture Feed",
      description:
        "STACK XI culture feed — Luck on X, Pepe on Farcaster, builder casts, and disclosed protocol activity for World Cup matchday culture on Base.",
      path: "/feed",
      keywords: [
        "Building Culture",
        "Farcaster feed",
        "World Cup predictions",
        "BCC",
        "STACK XI feed",
        "Pepe culture",
      ],
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Culture Feed", path: "/feed" },
      ]),
    }),
  component: FeedRoute,
});

function FeedRoute() {
  return (
    <PageShell>
      <CultureFeedPage />
    </PageShell>
  );
}
