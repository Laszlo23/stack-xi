import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TypewriterLine } from "@/components/layout/TypewriterLine";
import { useLiveTicker } from "@/hooks/use-live-ticker";
import { formatCountdown, getPredictionWindow } from "@/lib/predict/match-window";
import { getActiveMarket } from "@/lib/story/match-markets";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  live: "LIVE",
  ht: "HT",
  ft: "FT",
};

export function LiveMatchTicker() {
  const { t } = useTranslation();
  const { data: ticker } = useLiveTicker();
  const activeMatch = getActiveMarket();
  const predictionWindow = getPredictionWindow(activeMatch);

  const messages = useMemo(() => {
    const lines: string[] = [];

    if (ticker && ticker.matchId === activeMatch.id) {
      const status = STATUS_LABEL[ticker.status] ?? ticker.status.toUpperCase();
      const score = `${ticker.homeTeam} ${ticker.homeScore}–${ticker.awayScore} ${ticker.awayTeam}`;
      const minute =
        ticker.minute != null && ticker.status === "live" ? ` · ${ticker.minute}'` : "";
      lines.push(`${status}${minute} · ${score}`);
      if (ticker.lastEvent) lines.push(ticker.lastEvent);
    } else {
      lines.push(`Next: ${activeMatch.home} vs ${activeMatch.away} · ${activeMatch.kickoffLabel}`);
    }

    if (predictionWindow.status === "open") {
      lines.push(
        `${t("ticker.lockPick")} · ${formatCountdown(predictionWindow.msUntilClose)}`,
      );
    } else if (predictionWindow.status === "upcoming") {
      lines.push(
        `${t("ticker.opensIn")} ${formatCountdown(predictionWindow.msUntilOpen)}`,
      );
    }

    lines.push(t("ticker.tagline"));

    return lines;
  }, [ticker, activeMatch, predictionWindow, t]);

  const showLockPick = predictionWindow.status !== "closed";

  return (
    <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-hidden sm:gap-3">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          ticker?.status === "live" ? "animate-pulse bg-red-500" : "animate-pulse bg-primary"
        }`}
      />
      <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
        <TypewriterLine
          messages={messages}
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary sm:text-xs sm:tracking-[0.2em]"
        />
      </div>
      {showLockPick && (
        <Link
          to="/"
          hash="predict"
          className="shrink-0 rounded-md bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary transition hover:bg-primary/25 sm:px-2.5 sm:text-xs"
        >
          {t("ticker.lockCta")} →
        </Link>
      )}
    </div>
  );
}
