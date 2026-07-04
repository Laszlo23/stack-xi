import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { DeFiLayerPage } from "@/features/defi/DeFiLayerPage";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/defi")({
  head: () =>
    buildPageSeo({
      title: "DeFi Layer",
      description:
        "STACK XI DeFi Layer — BCC predict-to-earn pools, bonding curve squad mint, token positions, luck rewards, and matchday treasury flow on Base.",
      path: "/defi",
      keywords: [
        "DeFi layer",
        "BCC",
        "Building Culture",
        "predict to earn",
        "bonding curve",
        "Clanker",
        "luck rewards",
        "Base DeFi",
      ],
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "DeFi Layer", path: "/defi" },
      ]),
    }),
  component: DeFiRoute,
});

function DeFiRoute() {
  return (
    <PageShell>
      <DeFiLayerPage />
    </PageShell>
  );
}
