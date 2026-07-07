import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { ProfilePageContent } from "@/features/profile/ProfilePage";
import { buildPageSeo } from "@/lib/seo/meta";

type ProfileSearch = {
  x?: string;
  fc?: string;
};

function parseProfileSearch(search: Record<string, unknown>): ProfileSearch {
  const x = typeof search.x === "string" ? search.x : undefined;
  const fc = typeof search.fc === "string" ? search.fc : undefined;
  return { x, fc };
}

export const Route = createFileRoute("/profile")({
  validateSearch: parseProfileSearch,
  head: () =>
    buildPageSeo({
      title: "Member Profile",
      description:
        "STACK XI member profile — XP, culture missions, login streak, early believer status, and on-chain founding squad holdings on Base.",
      path: "/profile",
      keywords: ["member profile", "culture missions", "XP", "squad holdings"],
    }),
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <PageShell>
      <ProfilePageContent />
    </PageShell>
  );
}
