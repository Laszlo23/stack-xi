import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useMemberTasks } from "@/hooks/use-member-tasks";
import { useUserSquadHoldings } from "@/hooks/use-user-squad-holdings";
import { ProfileConnectPrompt, ProfileHeader } from "@/features/profile/ProfileHeader";
import { MemberTasksPreview } from "@/features/profile/MemberTasksPanel";
import { SquadHoldingsPanel } from "@/features/profile/SquadHoldingsPanel";
import { getCultureLevel, TOTAL_MEMBER_XP } from "@/lib/profile/member-tasks";
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
          <section className="glass rounded-2xl p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Culture XP
            </div>
            <ProfileXpSummary />
            <Link
              to="/"
              hash="squad"
              search={{ tab: "points" }}
              className="mt-4 inline-flex rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20"
            >
              Open full missions in Squad →
            </Link>
          </section>
        </>
      )}
    </div>
  );
}

function ProfileXpSummary() {
  const { progress } = useMemberTasks();
  const level = getCultureLevel(progress.totalXp);
  const xpPercent = Math.round((progress.totalXp / TOTAL_MEMBER_XP) * 100);

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-2xl font-bold">{level.label}</span>
        <span className="font-mono text-sm text-primary">
          {progress.totalXp}/{TOTAL_MEMBER_XP} XP
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${xpPercent}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {progress.completedTaskIds.length} missions complete · {progress.loginStreak}-day streak
      </p>
    </div>
  );
}
