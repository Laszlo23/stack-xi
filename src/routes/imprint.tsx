import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/features/legal/LegalDocument";
import { IMPRINT_SECTIONS } from "@/lib/legal/content";
import { buildBreadcrumbJsonLd, buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/imprint")({
  head: () =>
    buildPageSeo({
      title: "Imprint",
      description:
        "STACK XI legal imprint and contact — Building Culture ID, Base smart contracts, and support for mints and predictions.",
      path: "/imprint",
      jsonLd: buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Imprint", path: "/imprint" },
      ]),
    }),
  component: ImprintPage,
});

function ImprintPage() {
  return (
    <LegalDocument
      title="Imprint"
      subtitle="Legal notice and contact information for STACK XI."
      sections={IMRINT_SECTIONS}
    />
  );
}
