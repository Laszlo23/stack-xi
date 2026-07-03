import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/features/legal/LegalDocument";
import { PRIVACY_SECTIONS } from "@/lib/legal/content";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/privacy")({
  head: () =>
    buildPageSeo({
      title: "Privacy Policy",
      description:
        "STACK XI privacy policy — wallet connections, on-chain data, localStorage mission progress, and third-party services on Base.",
      path: "/privacy",
      robots: "index, follow",
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Privacy", path: "/privacy" },
      ]),
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      subtitle="How STACK XI handles wallet connections, on-chain data, and local progress."
      sections={PRIVACY_SECTIONS}
    />
  );
}
