import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { FC_BUILDERS } from "@/lib/story/farcaster-builders";
import { getPepeJourneyTier } from "@/lib/growth/pepe-journey";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/u/$handle")({
  loader: ({ params }) => {
    const handle = params.handle.startsWith("@") ? params.handle : `@${params.handle}`;
    const builder = FC_BUILDERS.find(
      (b) => b.handle.toLowerCase() === handle.toLowerCase(),
    );
    if (!builder) throw notFound();

    const xp = 100 + (builder.handle.length % 80);
    const tier = getPepeJourneyTier(xp);

    return { handle: builder.handle, displayName: builder.name, xp, tier: tier.label };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    return buildPageSeo({
      title: `${loaderData.handle} on STACK XI`,
      description: `${loaderData.handle} · ${loaderData.tier} · STACK XI matchday culture on Base.`,
      path: `/u/${loaderData.handle.replace("@", "")}`,
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: loaderData.handle, path: `/u/${loaderData.handle.replace("@", "")}` },
      ]),
    });
  },
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const profile = Route.useLoaderData();

  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="text-5xl">🐸</div>
        <h1 className="mt-4 font-display text-3xl font-bold">{profile.handle}</h1>
        <p className="mt-2 text-primary">{profile.tier}</p>
        <p className="mt-1 text-muted-foreground">{profile.xp} XP · matchday culture</p>
        <Link
          to="/leaderboard"
          className="mt-8 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          View leaderboard
        </Link>
      </div>
    </PageShell>
  );
}
