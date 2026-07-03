import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/features/legal/LegalDocument";
import { IMPRINT_SECTIONS } from "@/lib/legal/content";

export const Route = createFileRoute("/imprint")({
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
