import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/AppShell";
import { SectionHead } from "@/components/layout/SectionHead";
import { FoundingSquadSection } from "@/features/founding/FoundingSquadSection";
import { MatchTradingRoom } from "@/features/markets/MatchTradingRoom";
import { RefereeFeed } from "@/features/oracle/RefereeFeed";
import { PositionsPanel } from "@/features/positions/PositionsPanel";
import { TrainingCampsSection } from "@/features/vaults/TrainingCampsSection";

export const Route = createFileRoute("/labs")({
  component: LabsPage,
});

function LabsPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionHead
          eyebrow="Internal · Protocol labs"
          title={<>Advanced DeFi UI</>}
          sub="Legacy vault, perps, and positions prototypes. Not linked from main nav."
        />
        <div className="mt-12 space-y-20">
          <TrainingCampsSection />
          <MatchTradingRoom />
          <PositionsPanel />
          <RefereeFeed />
          <FoundingSquadSection />
        </div>
      </div>
    </PageShell>
  );
}
