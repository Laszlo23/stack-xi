import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/features/legal/LegalDocument";
import { TERMS_SECTIONS } from "@/lib/legal/content";

export const Route = createFileRoute("/terms")({
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
