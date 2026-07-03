import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/features/legal/LegalDocument";
import { TERMS_SECTIONS } from "@/lib/legal/content";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/terms")({
  head: () =>
    buildPageSeo({
      title: "Terms of Service",
      description:
        "STACK XI terms — USDC predictions, ERC-721 squad mints on Base, social missions, and liability for matchday culture products.",
      path: "/terms",
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Terms", path: "/terms" },
      ]),
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      subtitle="Rules for using STACK XI matchday stories, NFT mints, and USDC predictions."
      sections={TERMS_SECTIONS}
    />
  );
}
