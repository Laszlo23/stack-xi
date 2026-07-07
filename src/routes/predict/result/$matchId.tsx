import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { useMatchResults } from "@/hooks/use-match-results";
import { buildWinShare } from "@/lib/growth/viral-share-copy";
import { getMatchById } from "@/lib/story/match-markets";
import { matchPath } from "@/lib/story/match-slugs";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";
import { farcasterComposeUrl } from "@/lib/profile/social-links";

function xComposeUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export const Route = createFileRoute("/predict/result/$matchId")({
  loader: ({ params }) => {
    const match = getMatchById(params.matchId);
    if (!match) throw notFound();
    return { match };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { match } = loaderData;
    return buildPageSeo({
      title: `${match.home} vs ${match.away} — Result`,
      description: `Match result for ${match.home} vs ${match.away} on STACK XI.`,
      path: `/predict/result/${match.id}`,
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Result", path: `/predict/result/${match.id}` },
      ]),
    });
  },
  component: PredictResultPage,
});

function PredictResultPage() {
  const { match } = Route.useLoaderData();
  const { data: results } = useMatchResults();
  const result = results?.[match.id];

  const shareText = buildWinShare({
    pick: result?.winner === "home" ? match.home : match.away,
    matchLabel: `${match.home} vs ${match.away}`,
    matchPath: matchPath(match),
  });

  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          {match.stage}
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold">
          {match.home} vs {match.away}
        </h1>
        {result ? (
          <>
            <p className="mt-4 text-2xl font-bold text-primary">{result.result}</p>
            <p className="mt-2 text-muted-foreground">
              Winner: {result.winner === "home" ? match.home : match.away}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <a
                href={farcasterComposeUrl(shareText)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
              >
                Cast result
              </a>
              <a
                href={xComposeUrl(shareText)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border px-4 py-2 text-sm font-bold"
              >
                Post on X
              </a>
            </div>
          </>
        ) : (
          <p className="mt-4 text-muted-foreground">Final whistle pending. Check back after the match.</p>
        )}
        <Link
          to={matchPath(match)}
          className="mt-8 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Predict next match →
        </Link>
      </div>
    </PageShell>
  );
}
