import { Trophy } from "lucide-react";
import { useMemo } from "react";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useMemberTasksOptional } from "@/hooks/use-member-tasks";
import { getLeaderboardRank, listLeaderboardEntries } from "@/lib/profile/leaderboard-storage";
import { getCultureLevel } from "@/lib/profile/member-tasks";

export function SquadLeaderboardPanel() {
  const { address, isConnected } = useBaseWallet();
  const memberTasks = useMemberTasksOptional();
  const entries = useMemo(() => listLeaderboardEntries(), [memberTasks?.progress.totalXp]);

  const userRank = getLeaderboardRank(address, entries);
  const userXp = memberTasks?.progress.totalXp ?? 0;
  const userLevel = getCultureLevel(userXp);

  return (
    <section className="space-y-4">
      <div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          <Trophy className="h-3.5 w-3.5" />
          Squad leaderboard
        </div>
        <h2 className="font-display text-2xl font-bold">Culture XP ranks</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Top members by mission XP. Complete culture tasks to climb.
        </p>
      </div>

      {isConnected && (
        <div className="glass rounded-2xl border border-primary/30 p-4">
          <div className="font-mono text-[10px] uppercase text-muted-foreground">Your rank</div>
          <div className="mt-1 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-primary">
              {userRank ? `#${userRank}` : "Unranked"}
            </span>
            <span className="font-mono text-sm text-foreground">
              {userXp} XP · {userLevel.label}
            </span>
          </div>
        </div>
      )}

      <ol className="space-y-2">
        {entries.map((entry, index) => {
          const isYou = address && entry.address.toLowerCase() === address.toLowerCase();
          return (
            <li
              key={entry.address}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 font-mono text-sm ${
                isYou ? "border-primary/40 bg-primary/10" : "border-border/50 bg-background/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold ${
                    index < 3 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </span>
                <div>
                  <div className="font-semibold text-foreground">{entry.handle}</div>
                  <div className="text-[10px] uppercase text-muted-foreground">{entry.level}</div>
                </div>
              </div>
              <span className="font-bold text-primary">{entry.xp} XP</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
