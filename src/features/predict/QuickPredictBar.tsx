import { useEffect, useState } from "react";
import { Target, X } from "lucide-react";
import { formatCountdown, getPredictionWindow } from "@/lib/predict/match-window";
import { getActiveMarket } from "@/lib/story/match-markets";

const SCROLL_THRESHOLD_PX = 360;

export function QuickPredictBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const match = getActiveMarket();
  const predictionWindow = getPredictionWindow(match);

  useEffect(() => {
    const onScroll = () => {
      setVisible(globalThis.scrollY > SCROLL_THRESHOLD_PX);
    };
    onScroll();
    globalThis.addEventListener("scroll", onScroll, { passive: true });
    return () => globalThis.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed || !visible || predictionWindow.status === "closed") return null;

  const countdown =
    predictionWindow.status === "open"
      ? formatCountdown(predictionWindow.msUntilClose)
      : formatCountdown(predictionWindow.msUntilOpen);

  return (
    <div className="fixed left-0 right-0 top-[calc(5.25rem+env(safe-area-inset-top,0px))] z-40 border-b border-primary/30 bg-background/95 px-3 py-2 backdrop-blur-xl lg:top-[calc(6.5rem+env(safe-area-inset-top,0px))]">
      <div className="mx-auto flex max-w-7xl items-center gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Target className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold sm:text-base">
              {match.home} vs {match.away}
            </p>
            <p className="truncate font-mono text-[10px] text-muted-foreground sm:text-xs">
              {match.kickoffLabel}
              {predictionWindow.status === "open"
                ? ` · ${countdown} until kickoff`
                : ` · opens in ${countdown}`}
            </p>
          </div>
        </div>
        <a
          href="#predict"
          className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-[0_0_16px_var(--neon)] transition hover:brightness-110 sm:px-4 sm:text-sm"
        >
          Lock pick →
        </a>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Dismiss quick predict bar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
