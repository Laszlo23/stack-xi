import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { LivePredictionProduct } from "@/features/home/LivePredictionProduct";
import { usePredictionSession } from "@/hooks/use-prediction-session";
import { buildBreadcrumbJsonLd, buildMatchEventJsonLd, buildPageSeo } from "@/lib/seo/meta";
import { absoluteUrl } from "@/lib/seo/site-config";
import { getMatchBySlug } from "@/lib/story/match-slugs";
import { useEffect } from "react";

export const Route = createFileRoute("/match/$slug")({
  loader: ({ params }) => {
    const match = getMatchBySlug(params.slug);
    if (!match) throw notFound();
    return { match, slug: params.slug };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { match, slug } = loaderData;
    const title = `${match.home} vs ${match.away} — Predict`;
    const description = `Predict ${match.home} vs ${match.away}. ${match.stage}. Lock your pick before kickoff on STACK XI.`;
    const ogImage = absoluteUrl(`/api/og/match?slug=${encodeURIComponent(slug)}`);

    return buildPageSeo({
      title,
      description,
      path: `/match/${slug}`,
      ogImage,
      ogImageAlt: `${match.home} vs ${match.away} on STACK XI`,
      keywords: [match.home, match.away, "World Cup prediction", "STACK XI", match.stage],
      jsonLd: [
        buildMatchEventJsonLd({ ...match, slug }),
        buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: `${match.home} vs ${match.away}`, path: `/match/${slug}` },
        ]),
      ],
    });
  },
  component: MatchPage,
});

function MatchPage() {
  const { match } = Route.useLoaderData();
  const { selectMarket } = usePredictionSession();

  useEffect(() => {
    selectMarket(match.id);
  }, [match.id, selectMarket]);

  return (
    <PageShell>
      <div className="border-b border-border/40 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
            {match.stage}
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            {match.home} <span className="text-muted-foreground">vs</span> {match.away}
          </h1>
          <p className="mt-2 text-muted-foreground">{match.kickoffLabel}</p>
        </div>
      </div>
      <LivePredictionProduct />
    </PageShell>
  );
}
