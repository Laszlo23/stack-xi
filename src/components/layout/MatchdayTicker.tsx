import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TypewriterLine } from "@/components/layout/TypewriterLine";
import { formatCountdown, getPredictionWindow } from "@/lib/predict/match-window";
import { getActiveMarket, getLastCompletedMarket } from "@/lib/story/match-markets";

export function MatchdayTicker() {
  const [, refresh] = useState(0);

  useEffect(() => {
    const id = setInterval(() => refresh((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const activeMatch = getActiveMarket();
  const lastResult = getLastCompletedMarket();
  const predictionWindow = getPredictionWindow(activeMatch);

  const messages = useMemo(() => {
    const lines: string[] = [];

    if (lastResult?.result) {
      lines.push(`Last: ${lastResult.home} vs ${lastResult.away} · ${lastResult.result}`);
    }

    lines.push(`Next: ${activeMatch.home} vs ${activeMatch.away} · ${activeMatch.kickoffLabel}`);

    if (predictionWindow.status === "open") {
      lines.push(
        `Lock your pick · ${formatCountdown(predictionWindow.msUntilClose)} until kickoff`,
      );
    } else if (predictionWindow.status === "upcoming") {
      lines.push(`Predictions open in ${formatCountdown(predictionWindow.msUntilOpen)}`);
    }

    lines.push("Base BCC · Building Culture layer on Base");

    return lines;
  }, [activeMatch, lastResult, predictionWindow]);

  const showLockPick = predictionWindow.status !== "closed";

  return (
    <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-hidden sm:gap-3">
      <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary" />
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
          Lock pick →
        </Link>
      )}
    </div>
  );
}
