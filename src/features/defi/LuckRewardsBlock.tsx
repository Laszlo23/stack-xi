import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { BccTokenChip } from "@/features/defi/BccTokenChip";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useBccBalance } from "@/hooks/use-bcc-balance";
import { useMemberTasksOptional } from "@/hooks/use-member-tasks";
import { getCultureLevel } from "@/lib/profile/member-tasks";
import { BCC_SYMBOL } from "@/lib/base/config";
import {
  AIRDROP_POOL_LABEL,
  formatAirdropWeight,
  getAirdropTier,
} from "@/lib/growth/airdrop-tiers";

export function LuckRewardsBlock() {
  const [hovered, setHovered] = useState(false);
  const { address } = useBaseWallet();
  const { formatted } = useBccBalance(address);
  const memberTasks = useMemberTasksOptional();
  const xp = memberTasks?.progress.totalXp ?? 0;
  const level = getCultureLevel(xp);
  const airdropTier = getAirdropTier(xp);
  const luckPct = Math.min(
    100,
    40 + xp + (Number.parseFloat(formatted.replace(/,/g, "")) || 0) / 100,
  );

  return (
    <article className="defi-luck-panel relative overflow-hidden rounded-2xl border border-primary/25 p-6 sm:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.88_0.28_145/0.12),transparent_55%)]" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Block 04
        </div>
        <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
          Luck + {BCC_SYMBOL} Rewards
        </h3>

        <ul className="mt-6 space-y-3 text-muted-foreground">
          <li>
            <strong className="text-foreground">Hold {BCC_SYMBOL} → Earn LUCK</strong> — culture
            reputation plus onchain token exposure.
          </li>
          <li>
            LUCK unlocks whitelist access, prediction multipliers, and squad leaderboard rank.
          </li>
          <li>
            {AIRDROP_POOL_LABEL} culture airdrop — your tier is {airdropTier.label} (
            {formatAirdropWeight(airdropTier.weight)} weight).
          </li>
        </ul>

        <div className="mt-4">
          <BccTokenChip compact />
        </div>

        <div
          className="mt-8"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-widest">
            <span className="text-muted-foreground">Luck meter · {level.label}</span>
            <span className="text-primary">{Math.round(luckPct)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted/80">
            <div
              className="defi-luck-fill h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-accent"
              style={{ width: `${luckPct}%` }}
            />
          </div>
          {hovered && (
            <p className="defi-luck-tooltip mt-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
              Luck is not random. It is exposure to builders and {BCC_SYMBOL} conviction.
            </p>
          )}
        </div>

        <Link
          to="/"
          hash="squad"
          search={{ tab: "points" }}
          className="defi-energy-btn mt-8 inline-flex rounded-xl border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-bold text-primary hover:bg-primary/20"
        >
          Increase Luck via missions →
        </Link>
      </div>
    </article>
  );
}
