import { useEffect } from "react";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useMemberTasks } from "@/hooks/use-member-tasks";
import { useUserSquadHoldings } from "@/hooks/use-user-squad-holdings";
import { ProfileConnectPrompt, ProfileHeader } from "@/features/profile/ProfileHeader";
import { MemberTasksPanel, MemberTasksPreview } from "@/features/profile/MemberTasksPanel";
import { SquadHoldingsPanel } from "@/features/profile/SquadHoldingsPanel";
import { processDailyLogin } from "@/lib/profile/task-storage";

export function ProfilePageContent() {
  const { isConnected, address } = useBaseWallet();
  const { holdings, isLoading, isConfigured } = useUserSquadHoldings(address);
  const { refreshProgress } = useMemberTasks();

  useEffect(() => {
    if (!address) return;
    processDailyLogin(address);
    refreshProgress();
  }, [address, refreshProgress]);

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6 sm:py-16">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          Member hub
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Your STACK XI profile</h1>
        <p className="mt-2 text-muted-foreground">
          Squad NFTs, daily streaks, and social missions — all tied to your Base wallet.
        </p>
      </div>

      {!isConnected ? (
        <>
          <ProfileConnectPrompt />
          <MemberTasksPreview />
        </>
      ) : (
        <>
          <ProfileHeader />
          <SquadHoldingsPanel
            holdings={holdings}
            isLoading={isLoading}
            isConfigured={isConfigured}
          />
          <MemberTasksPanel />
        </>
      )}
    </div>
  );
}
