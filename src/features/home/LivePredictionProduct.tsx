import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { PepeJourneyBar } from "@/features/home/PepeJourneyBar";
import { TeamFlag } from "@/features/predict/TeamFlag";
import { UpcomingMarketsBar } from "@/features/predict/UpcomingMarketsBar";
import { GuidedPredictionFlow } from "@/features/predict/GuidedPredictionFlow";
import { useMatchStats } from "@/hooks/use-match-stats";
import { useMemberTasksOptional } from "@/hooks/use-member-tasks";
import { usePredictionSession } from "@/hooks/use-prediction-session";
import { BCC_SYMBOL, STAKE_TIERS_BCC, formatBcc } from "@/lib/base/config";
import { buildHeroPickShare } from "@/lib/growth/viral-share-copy";
import { PEPE_JOURNEY_TIERS } from "@/lib/growth/pepe-journey";
import { formatCountdown, getPredictionWindow } from "@/lib/predict/match-window";
import { farcasterComposeUrl } from "@/lib/profile/social-links";
import { matchPath } from "@/lib/story/match-slugs";
import { resolvePredictionMarket } from "@/lib/story/match-markets";

function xComposeUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function LivePredictionProduct() {
  const { t } = useTranslation();
  const { session, setPick } = usePredictionSession();
  const memberTasks = useMemberTasksOptional();
  const match = resolvePredictionMarket(session?.matchId);
  const window = getPredictionWindow(match);
  const closed = window.status === "closed";
  const { data: stats } = useMatchStats(match.id);

  const activePick =
    session?.matchId === match.id && session.pick
      ? session.pick === "home"
        ? match.home
        : match.away
      : null;

  const [localPick, setLocalPick] = useState<string | null>(null);
  const pickedTeam = activePick ?? localPick;
  const stakeLabel = `${formatBcc(STAKE_TIERS_BCC[0]!.amount)} ${BCC_SYMBOL}`;
  const xpReward = PEPE_JOURNEY_TIERS[1]?.minXp ?? 50;
  const loginStreak = memberTasks?.progress.loginStreak ?? 0;

  const shareText = pickedTeam
    ? buildHeroPickShare({
        pick: pickedTeam,
        home: match.home,
        away: match.away,
        matchPath: matchPath(match),
      })
    : "";

  function handlePick(side: "home" | "away") {
    const team = side === "home" ? match.home : match.away;
    setLocalPick(team);
    setPick(match.id, side);
    document.getElementById("predict-flow")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="predict" className="border-t border-border/40 bg-background/50 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <UpcomingMarketsBar />

        <div className="glass-neon relative overflow-hidden rounded-3xl border border-primary/40 p-6 shadow-[0_0_64px_var(--neon)] sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
                {t("home.predict.eyebrow")}
              </div>
              <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
                {t("home.predict.title")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {match.stage} · {match.kickoffLabel}
              </p>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("home.live.countdown")}
              </div>
              <div className="font-display text-2xl font-bold text-primary">
                {formatCountdown(window.msUntilClose)}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 items-center gap-3 sm:gap-6">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-background/80 px-2 py-4">
              <TeamFlag team={match.home} size="lg" className="h-16 w-24 sm:h-20 sm:w-28" />
              <span className="text-center text-base font-bold leading-tight text-foreground sm:text-xl">
                {match.home}
              </span>
              {stats && (
                <span className="font-mono text-xs text-primary">{stats.homePct}%</span>
              )}
            </div>
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-background/80 px-2 py-4">
              <TeamFlag team={match.away} size="lg" className="h-16 w-24 sm:h-20 sm:w-28" />
              <span className="text-center text-base font-bold leading-tight text-foreground sm:text-xl">
                {match.away}
              </span>
              {stats && (
                <span className="font-mono text-xs text-accent">{stats.awayPct}%</span>
              )}
            </div>
          </div>

          {stats && (
            <div className="mt-6">
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="bg-gradient-to-r from-primary/80 to-primary transition-all duration-700"
                  style={{ width: `${stats.homePct}%` }}
                />
                <div
                  className="bg-gradient-to-r from-accent/60 to-accent transition-all duration-700"
                  style={{ width: `${stats.awayPct}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatChip label={t("home.live.predictions")} value={stats?.totalPicks.toLocaleString() ?? "—"} />
            <StatChip label={t("home.live.prizePool")} value={stats?.prizePoolLabel ?? stakeLabel} />
            <StatChip label={t("home.live.xpReward")} value={`+${xpReward} XP`} />
            <StatChip
              label={t("home.live.streak")}
              value={loginStreak > 0 ? `${loginStreak}🔥` : "—"}
            />
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t("home.live.fansPlaying", { count: stats?.uniqueWallets.toLocaleString() ?? "14k+" })}
          </p>

          {!pickedTeam && !closed && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handlePick("home")}
                className="rounded-xl bg-primary/15 px-4 py-4 text-base font-bold text-primary transition hover:bg-primary/25"
              >
                {t("home.predict.pick", { team: match.home })}
              </button>
              <button
                type="button"
                onClick={() => handlePick("away")}
                className="rounded-xl bg-primary px-4 py-4 text-base font-bold text-primary-foreground shadow-[0_0_32px_var(--neon)] transition hover:brightness-110"
              >
                {t("home.predict.pick", { team: match.away })}
              </button>
            </div>
          )}

          {closed && (
            <p className="mt-6 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
              {t("predict.windowClosed")}
            </p>
          )}

          {pickedTeam && (
            <div className="mt-6 space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
              <p className="text-center text-sm font-semibold text-primary">
                {t("home.predict.locked", { team: pickedTeam })}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <a
                  href={farcasterComposeUrl(shareText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20"
                >
                  {t("home.predict.castFc")}
                </a>
                <a
                  href={xComposeUrl(shareText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border/60 px-4 py-2 text-xs font-bold hover:border-primary/40"
                >
                  {t("home.predict.postX")}
                </a>
                <Link
                  to={matchPath(match)}
                  className="rounded-lg border border-border/60 px-4 py-2 text-xs font-bold hover:border-primary/40"
                >
                  {t("home.live.challengeFriend")}
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <PepeJourneyBar />
        </div>

        <div id="predict-flow" className="mt-10">
          <GuidedPredictionFlow />
        </div>
      </div>
    </section>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/40 px-3 py-2.5 text-center">
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}
