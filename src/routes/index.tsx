import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { PepeScrollExperience } from "@/features/story/PepeScrollExperience";
import { buildHomeJsonLd, buildPageSeo } from "@/lib/seo/meta";
import { SITE_DESCRIPTION } from "@/lib/seo/site-config";

export const Route = createFileRoute("/")({
  head: () =>
    buildPageSeo({
      title: "Pepe Matchdays on Base",
      description: `${SITE_DESCRIPTION} Pepe doesn't chase. Luck does.`,
      path: "/",
      home: true,
      jsonLd: buildHomeJsonLd(),
    }),
  component: Index,
});

function Index() {
  return (
    <PageShell>
      <PepeScrollExperience />
    </PageShell>
  );
}
