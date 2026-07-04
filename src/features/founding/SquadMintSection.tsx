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
        eyebrow={isSoldOut ? "Founding Squad · Sold out" : "Founding Squad · Member hub"}
        title={
          isSoldOut ? (
            <>
              All eleven minted. <span className="text-gradient">Culture locked in.</span>
            </>
          ) : (
            <>
              Eleven players. <span className="text-gradient">Win-win mint game.</span>
            </>
          )
        }
        sub={
          isSoldOut
            ? "The bonding curve is closed — view the founding XI on BaseScan, check your holdings, and predict the next Dallas matchday."
            : "Mint from 770 BCC — manage holdings, earn culture XP, climb the leaderboard, and swap more BCC."
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
