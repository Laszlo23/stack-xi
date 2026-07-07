import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { SquadMintSection } from "@/features/founding/SquadMintSection";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/squad")({
  head: () =>
    buildPageSeo({
      title: "Your Founding Player Card",
      description:
        "Your legendary football card proves you were here from the beginning. Mint your founding STACK XI squad player on Base.",
      path: "/squad",
      keywords: ["STACK XI NFT", "founding squad", "football card", "BCC mint"],
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Squad", path: "/squad" },
      ]),
    }),
  component: SquadPage,
});

function SquadPage() {
  return (
    <PageShell>
      <SquadMintSection />
    </PageShell>
  );
}
