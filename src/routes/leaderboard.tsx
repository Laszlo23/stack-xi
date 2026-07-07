import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { SquadLeaderboardPanel } from "@/features/founding/SquadLeaderboardPanel";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/leaderboard")({
  head: () =>
    buildPageSeo({
      title: "Matchday Leaders",
      description: "STACK XI matchday leaderboard — top predictors, culture builders, and legends competing for football glory.",
      path: "/leaderboard",
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Leaderboard", path: "/leaderboard" },
      ]),
    }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-bold">🏆 Matchday Leaders</h1>
        <p className="mt-2 text-muted-foreground">Competition is stronger than explanation.</p>
        <div className="mt-8">
          <SquadLeaderboardPanel />
        </div>
      </div>
    </PageShell>
  );
}
