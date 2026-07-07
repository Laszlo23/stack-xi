import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TeamFlag } from "@/features/predict/TeamFlag";
import { usePredictionSession } from "@/hooks/use-prediction-session";
import { formatCountdown, getPredictionWindow } from "@/lib/predict/match-window";
import { buildHeroPickShare } from "@/lib/growth/viral-share-copy";
import { farcasterComposeUrl } from "@/lib/profile/social-links";
import { resolvePredictionMarket } from "@/lib/story/match-markets";

function xComposeUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function HeroPredictCard() {
  const { t } = useTranslation();
  const { session, setPick } = usePredictionSession();
  const match = resolvePredictionMarket(session?.matchId);
  const window = getPredictionWindow(match);
  const closed = window.status === "closed";

  const activePick =
    session?.matchId === match.id && session.pick
      ? session.pick === "home"
        ? match.home
        : match.away
      : null;

  const [localPick, setLocalPick] = useState<string | null>(null);
  const pickedTeam = activePick ?? localPick;

  function handlePick(side: "home" | "away") {
    const team = side === "home" ? match.home : match.away;
    setLocalPick(team);
    setPick(match.id, side);
    document.getElementById("predict")?.scrollIntoView({ behavior: "smooth" });
  }

  const shareText = pickedTeam
    ? buildHeroPickShare({ pick: pickedTeam, home: match.home, away: match.away })
    : "";

  return (
    <div id="play" className="glass-neon relative overflow-hidden rounded-2xl border border-primary/35 p-5 shadow-[0_0_48px_var(--neon)] sm:p-6">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

      <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
        {t("home.predict.eyebrow")}
      </div>
      <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
        {t("home.predict.title")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {formatCountdown(window.msUntilClose)} {t("quickPredict.untilKickoff")}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-2 py-3">
          <TeamFlag team={match.home} size="lg" />
          <span className="text-center text-sm font-bold leading-tight text-foreground sm:text-base">
            {match.home}
          </span>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-2 py-3">
          <TeamFlag team={match.away} size="lg" />
          <span className="text-center text-sm font-bold leading-tight text-foreground sm:text-base">
            {match.away}
          </span>
        </div>
      </div>

      {!pickedTeam && !closed && (
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handlePick("home")}
            className="rounded-xl bg-primary/15 px-4 py-3.5 text-sm font-bold text-primary transition hover:bg-primary/25"
          >
            {t("home.predict.pick", { team: match.home })}
          </button>
          <button
            type="button"
            onClick={() => handlePick("away")}
            className="rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_0_24px_var(--neon)] transition hover:brightness-110"
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
        <div className="mt-6 space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-center text-sm font-semibold text-primary">
            {t("home.predict.locked", { team: pickedTeam })}
          </p>
          <p className="text-center text-xs text-muted-foreground">{t("home.predict.sharePrompt")}</p>
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
              className="rounded-lg border border-border/60 px-4 py-2 text-xs font-bold text-foreground hover:border-primary/40"
            >
              {t("home.predict.postX")}
            </a>
          </div>
          <a
            href="#predict"
            className="block text-center text-xs font-semibold text-primary hover:underline"
          >
            {t("home.predict.lockOnchain")}
          </a>
        </div>
      )}
    </div>
  );
}
