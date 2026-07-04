import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { PepeScrollExperience } from "@/features/story/PepeScrollExperience";
import { SQUAD_TABS, type SquadTab } from "@/hooks/use-squad-tab";
import { buildHomeJsonLd, buildPageSeo } from "@/lib/seo/meta";
import { SITE_DESCRIPTION } from "@/lib/seo/site-config";

type HomeSearch = {
  tab?: SquadTab;
};

function parseHomeSearch(search: Record<string, unknown>): HomeSearch {
  const tab = typeof search.tab === "string" ? search.tab : undefined;
  if (tab && (SQUAD_TABS as readonly string[]).includes(tab)) {
    return { tab: tab as SquadTab };
  }
  return {};
}

export const Route = createFileRoute("/")({
  validateSearch: parseHomeSearch,
  head: () =>
    buildPageSeo({
      title: "Building Culture Pepe on Base",
      description: `${SITE_DESCRIPTION} Pepe doesn't chase. Luck does. Mint with BCC, predict matchdays, prove onchain.`,
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
