import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/features/legal/LegalDocument";
import { PRIVACY_SECTIONS } from "@/lib/legal/content";

export const Route = createFileRoute("/privacy")({
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
