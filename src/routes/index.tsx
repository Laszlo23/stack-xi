import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { PepeScrollExperience } from "@/features/story/PepeScrollExperience";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <PageShell>
      <PepeScrollExperience />
    </PageShell>
  );
}
