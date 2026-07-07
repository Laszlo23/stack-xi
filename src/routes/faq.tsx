import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/features/legal/LegalDocument";
import { PREDICTION_FAQ_SECTIONS } from "@/lib/legal/prediction-faq";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/faq")({
  head: () =>
    buildPageSeo({
      title: "Prediction FAQ",
      description:
        "How STACK XI BCC prediction markets work — staking, win-win culture pool, kickoff windows, claims, and sponsored picks on Base.",
      path: "/faq",
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "FAQ", path: "/faq" },
      ]),
    }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <LegalDocument
      title="Prediction FAQ"
      subtitle="How matchday picks, BCC pools, and on-chain receipts work — and why culture wins together."
      sections={PREDICTION_FAQ_SECTIONS}
    />
  );
}
