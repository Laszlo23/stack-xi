import { SectionHead } from "@/components/layout/SectionHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberTasksPanel } from "@/features/profile/MemberTasksPanel";
import { PointsQuickStart } from "@/features/growth/PointsQuickStart";
import { SquadHoldingsPanel } from "@/features/profile/SquadHoldingsPanel";
import { BccSwapPanel } from "@/features/swap/BccSwapPanel";
import { SquadLeaderboardPanel } from "@/features/founding/SquadLeaderboardPanel";
import { SquadMintTabContent } from "@/features/founding/SquadMintTabContent";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useSquadMintStatus } from "@/hooks/use-squad-mint-status";
import { squadTabLabel, useSquadTab, type SquadTab } from "@/hooks/use-squad-tab";
import { useUserSquadHoldings } from "@/hooks/use-user-squad-holdings";

export function SquadMintSection() {
  const { tab, setTab } = useSquadTab();
  const { isSoldOut } = useSquadMintStatus();
  const { address, isConnected } = useBaseWallet();
  const { holdings, isLoading, isConfigured } = useUserSquadHoldings(address);

  return (
    <section id="squad" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHead
        eyebrow={isSoldOut ? "Blind packs · Sold out" : "Blind pack mint"}
        title={
          isSoldOut ? (
            <>
              You missed the kickoff. <span className="text-gradient">The squad lives on.</span>
            </>
          ) : (
            <>
              Rip a sealed pack. <span className="text-gradient">Reveal your legend.</span>
            </>
          )
        }
        sub={
          isSoldOut
            ? "847 community packs minted on Base — trade secondary, stack perks, predict with BCC."
            : "77 editions per player. Mint sealed, open on-chain, joker to pick. Perks hit predictions, merch, and culture XP."
        }
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as SquadTab)} className="mt-10">
        <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1">
          {(["mint", "holdings", "points", "leaderboard", "swap"] as const).map((t) => (
            <TabsTrigger key={t} value={t} className="font-mono text-xs uppercase tracking-wide">
              {squadTabLabel(t)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="mint">
          <SquadMintTabContent />
        </TabsContent>

        <TabsContent value="holdings">
          {!isConnected ? (
            <p className="rounded-xl border border-border/50 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              Connect your Base wallet to view squad holdings.
            </p>
          ) : (
            <SquadHoldingsPanel
              holdings={holdings}
              isLoading={isLoading}
              isConfigured={isConfigured}
            />
          )}
        </TabsContent>

        <TabsContent value="points">
          {!isConnected ? (
            <p className="rounded-xl border border-border/50 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              Connect Base wallet to track culture mission XP and mint with BCC.
            </p>
          ) : (
            <div className="space-y-6">
              <PointsQuickStart showCategoryBreakdown />
              <MemberTasksPanel />
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard">
          <SquadLeaderboardPanel />
        </TabsContent>

        <TabsContent value="swap">
          <BccSwapPanel />
        </TabsContent>
      </Tabs>
    </section>
  );
}
