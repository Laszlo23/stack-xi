import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Target, Trophy, UserPlus, Zap } from "lucide-react";
import { useMemberTasksOptional } from "@/hooks/use-member-tasks";
import { useSponsoredPrediction } from "@/hooks/use-sponsored-prediction";
import {
  formatAirdropWeight,
  getAirdropTier,
  getNextAirdropTier,
} from "@/lib/growth/airdrop-tiers";
import { MEMBER_TASKS, TOTAL_MEMBER_XP } from "@/lib/profile/member-tasks";
import { formatBcc, SPONSORED_PREDICTION_MAX, SPONSORED_STAKE_BCC } from "@/lib/base/config";

const QUICK_STEPS = [
  {
    step: 1,
    label: "Connect wallet + daily check-in",
    xp: 10,
    icon: Zap,
    to: "/profile" as const,
  },
  {
    step: 2,
    label: "Connect X + Farcaster",
    xp: 30,
    icon: UserPlus,
    to: "/profile" as const,
  },
  {
    step: 3,
    label: "Lock a prediction or mint squad",
    xp: "40–50",
    icon: Target,
    to: "/" as const,
    hash: "predict" as const,
  },
] as const;

function xpByCategory() {
  const connect = MEMBER_TASKS.filter((t) =>
    ["connect_x", "connect_farcaster", "connect_telegram", "daily_login"].includes(t.id),
  ).reduce((s, t) => s + t.points, 0);
  const social = MEMBER_TASKS.filter((t) =>
    [
      "engage_x_post",
      "comment_x_post",
      "engage_farcaster_cast",
      "comment_farcaster_cast",
      "share_campaign",
      "like_share_x",
      "make_post",
      "follow_farcaster",
      "share_telegram_matchday",
      "invite_telegram_friend",
      "open_telegram_game",
    ].includes(t.id),
  ).reduce((s, t) => s + t.points, 0);
  const onchain = MEMBER_TASKS.filter((t) =>
    ["mint_squad", "submit_prediction"].includes(t.id),
  ).reduce((s, t) => s + t.points, 0);
  return { connect, social, onchain };
}

export function PointsQuickStart({
  compact,
  showCategoryBreakdown,
}: {
  compact?: boolean;
  showCategoryBreakdown?: boolean;
}) {
  const memberTasks = useMemberTasksOptional();
  const sponsor = useSponsoredPrediction();
  const xp = memberTasks?.progress.totalXp ?? 0;
  const tier = getAirdropTier(xp);
  const nextTier = getNextAirdropTier(xp);
  const xpPercent = Math.min(100, Math.round((xp / TOTAL_MEMBER_XP) * 100));
  const categories = xpByCategory();

  return (
    <section
      className={
        compact
          ? "rounded-2xl border border-primary/30 bg-primary/5 p-4"
          : "glass rounded-2xl p-6"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            How to earn XP
          </div>
          <h3 className="mt-1 font-display text-xl font-bold sm:text-2xl">
            Fastest path today
          </h3>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            +10 daily · +30 connect socials · +40 predict · +50 mint — more XP = higher airdrop
            weight ({formatAirdropWeight(tier.weight)} now).
          </p>
        </div>
        {!compact && (
          <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-right">
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Your XP</div>
            <div className="font-display text-2xl font-bold text-primary">{xp}</div>
          </div>
        )}
      </div>

      {sponsor.isConfigured && sponsor.remainingSlots > 0 && (
        <div className="mt-4 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          <strong className="text-accent">Founding sponsor:</strong> First {SPONSORED_PREDICTION_MAX}{" "}
          verified members (connect Farcaster or X) get a free {formatBcc(SPONSORED_STAKE_BCC)}{" "}
          prediction — {sponsor.remainingSlots} slots left.
          <Link
            to="/"
            hash="predict"
            className="ml-1 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            Predict now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <ol className="mt-5 space-y-3">
        {QUICK_STEPS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.step}>
              <Link
                to={item.to}
                hash={"hash" in item ? item.hash : undefined}
                className="flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3 transition hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 font-mono text-xs font-bold text-primary">
                  {item.step}
                </span>
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                <span className="font-mono text-xs text-primary">+{item.xp} XP</span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="mt-4">
        <div className="flex justify-between font-mono text-xs text-muted-foreground">
          <span>{tier.label}</span>
          <span>
            {xp}/{TOTAL_MEMBER_XP} XP
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
        {nextTier && (
          <p className="mt-2 text-xs text-muted-foreground">
            {nextTier.minXp - xp} XP to {nextTier.label} ({formatAirdropWeight(nextTier.weight)})
          </p>
        )}
      </div>

      {showCategoryBreakdown && (
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-border/50 px-3 py-2 text-center">
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Connect</div>
            <div className="font-display font-bold text-primary">+{categories.connect} XP</div>
          </div>
          <div className="rounded-lg border border-border/50 px-3 py-2 text-center">
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Social</div>
            <div className="font-display font-bold text-primary">+{categories.social} XP</div>
          </div>
          <div className="rounded-lg border border-border/50 px-3 py-2 text-center">
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Onchain</div>
            <div className="font-display font-bold text-primary">+{categories.onchain} XP</div>
          </div>
        </div>
      )}

      {!compact && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20"
          >
            Open profile missions <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/"
            hash="squad"
            search={{ tab: "points" }}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            <Trophy className="h-4 w-4" />
            All {MEMBER_TASKS.length} tasks
          </Link>
        </div>
      )}
    </section>
  );
}
