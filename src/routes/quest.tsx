import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { QuestPage } from "@/features/quest/QuestPage";
import { buildPageSeo } from "@/lib/seo/meta";

export const Route = createFileRoute("/quest")({
  head: () =>
    buildPageSeo({
      title: "Culture Quest — 7.7M BCC Raffle",
      description:
        "Complete social quests on X and Farcaster, mint a free raffle ticket, and win 7,777,777 BCC. Transparent on-chain draw.",
      path: "/quest",
    }),
  component: QuestRoute,
});

function QuestRoute() {
  return (
    <PageShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <QuestPage />
      </main>
    </PageShell>
  );
}
