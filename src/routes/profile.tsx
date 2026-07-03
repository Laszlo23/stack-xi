import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { ProfilePageContent } from "@/features/profile/ProfilePage";

export const Route = createFileRoute("/profile")({
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <PageShell>
      <ProfilePageContent />
    </PageShell>
  );
}
