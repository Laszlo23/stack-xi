import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { OnchainProofPage } from "@/features/proof/OnchainProofPage";
import { buildBreadcrumbJsonLd, buildContractRegistryJsonLd, buildPageSeo } from "@/lib/seo/meta";
import { BCC_TOKEN_ADDRESS, PREDICTION_POOL_ADDRESS, SQUAD_NFT_ADDRESS, SQUAD_NFT_V2_ADDRESS } from "@/lib/base/config";

export const Route = createFileRoute("/proof")({
  head: () =>
    buildPageSeo({
      title: "Onchain Proof",
      description:
        "Building Culture onchain proof hub — BCC contract registry, DexScreener liquidity, embedded 0x swap, and your STACK XI mint + prediction receipts on Base.",
      path: "/proof",
      keywords: [
        "BCC",
        "Building Culture",
        "Base",
        "onchain proof",
        "DexScreener",
        "0x swap",
        "Clanker",
        "Farcaster mini app",
      ],
      jsonLd: [
        buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Onchain Proof", path: "/proof" },
        ]),
        buildContractRegistryJsonLd([
          { name: "BCC Token", address: BCC_TOKEN_ADDRESS },
          { name: "StackXISquad Genesis", address: SQUAD_NFT_ADDRESS },
          { name: "StackXISquadV2 Packs", address: SQUAD_NFT_V2_ADDRESS },
          { name: "PredictionPool", address: PREDICTION_POOL_ADDRESS },
        ]),
      ],
    }),
  component: ProofRoute,
});

function ProofRoute() {
  return (
    <PageShell>
      <OnchainProofPage />
    </PageShell>
  );
}
