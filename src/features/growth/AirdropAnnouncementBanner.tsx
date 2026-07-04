import { Link } from "@tanstack/react-router";
import { Gift, Sparkles } from "lucide-react";
import { useMemberTasksOptional } from "@/hooks/use-member-tasks";
import {
  AIRDROP_POOL_LABEL,
  formatAirdropWeight,
  getAirdropTier,
  getNextAirdropTier,
} from "@/lib/growth/airdrop-tiers";

export function AirdropAnnouncementBanner({ compact }: { compact?: boolean }) {
  const memberTasks = useMemberTasksOptional();
  const xp = memberTasks?.progress.totalXp ?? 0;
  const tier = getAirdropTier(xp);
  const nextTier = getNextAirdropTier(xp);

  return (
    <section
      className={
        compact
          ? "rounded-2xl border border-accent/30 bg-accent/5 p-4"
          : "relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-primary/5 to-background p-6 sm:p-8"
      }
    >
      {!compact && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
      )}
      <div className="relative">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent">
          <Gift className="h-3.5 w-3.5" />
          Culture airdrop
        </div>
        <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
          {AIRDROP_POOL_LABEL} for participants
        </h3>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          +10 daily · +30 connect socials · +40 predict · +50 mint — complete missions to increase
          your share of the pool. More XP = higher airdrop weight. Claim mechanics coming — promotional
          allocation subject to tokenomics.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2">
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Your tier</div>
            <div className="font-display text-lg font-bold text-primary">
              {tier.label} · {formatAirdropWeight(tier.weight)}
            </div>
          </div>
          <div className="rounded-xl border border-border/60 px-4 py-2">
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Culture XP</div>
            <div className="font-display text-lg font-bold">{xp}</div>
          </div>
          {nextTier && (
            <div className="text-sm text-muted-foreground">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-accent" />
              {nextTier.minXp - xp} XP to {nextTier.label} ({formatAirdropWeight(nextTier.weight)})
            </div>
          )}
        </div>

        {!compact && (
          <Link
            to="/"
            hash="squad"
            search={{ tab: "points" }}
            className="mt-5 inline-flex rounded-xl border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary/20"
          >
            Complete missions → increase your share
          </Link>
        )}
      </div>
    </section>
  );
}
