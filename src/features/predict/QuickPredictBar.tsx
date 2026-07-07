import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TeamFlag } from "@/features/predict/TeamFlag";
import { useConnectBaseWallet } from "@/hooks/use-connect-base-wallet";
import { usePredictionSession } from "@/hooks/use-prediction-session";
import { useSponsoredPrediction } from "@/hooks/use-sponsored-prediction";
import {
  BCC_SYMBOL,
  SPONSORED_STAKE_BCC,
  STAKE_TIERS_BCC,
  formatBcc,
  isPredictionPoolConfigured,
} from "@/lib/base/config";
import {
  formatCountdown,
  getPredictionWindow,
  isPredictionSubmitAllowed,
} from "@/lib/predict/match-window";
import { resolvePredictionMarket } from "@/lib/story/match-markets";

const DEFAULT_STAKE = STAKE_TIERS_BCC[0]!.amount;

export function QuickPredictBar() {
  const { t } = useTranslation();
  const { setPick, setStake, session } = usePredictionSession();
  const match = resolvePredictionMarket(session?.matchId);
  const window = getPredictionWindow(match);
  const { isConnected, isConnecting, connectWallet } = useConnectBaseWallet();
  const sponsor = useSponsoredPrediction(match.id);

  const closed = window.status === "closed" || !isPredictionSubmitAllowed(window);
  const activePick = session?.matchId === match.id ? session.pick : null;

  function scrollToPredict() {
    document.getElementById("predict")?.scrollIntoView({ behavior: "smooth" });
  }

  async function quickPick(side: "home" | "away") {
    const stake = sponsor.isEligible ? SPONSORED_STAKE_BCC : DEFAULT_STAKE;
    const sponsored = sponsor.isEligible;
    setPick(match.id, side);
    setStake(stake, sponsored);
    scrollToPredict();

    if (!isConnected) {
      await connectWallet();
    }
  }

  if (closed || !isPredictionPoolConfigured()) return null;

  return (
    <div className="sticky top-[calc(var(--header-offset,0px)+3.5rem)] z-40 mx-auto max-w-2xl px-4 sm:px-6">
      <div className="glass-neon rounded-2xl border border-primary/30 p-4 shadow-[0_0_40px_var(--neon)]">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          {t("quickPredict.label")}
        </div>

        <div className="mt-3 flex items-center justify-center gap-3 sm:gap-5">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <TeamFlag team={match.home} size="md" />
            <span className="max-w-[7rem] truncate text-center text-xs font-semibold sm:max-w-none sm:text-sm">
              {match.home}
            </span>
          </div>

          <div className="shrink-0 font-display text-sm font-bold text-muted-foreground">vs</div>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <TeamFlag team={match.away} size="md" />
            <span className="max-w-[7rem] truncate text-center text-xs font-semibold sm:max-w-none sm:text-sm">
              {match.away}
            </span>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          {formatBcc(sponsor.isEligible ? SPONSORED_STAKE_BCC : DEFAULT_STAKE)} {BCC_SYMBOL} ·{" "}
          {formatCountdown(window.msUntilClose)} {t("quickPredict.untilKickoff")}
        </p>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={isConnecting}
            onClick={() => void quickPick("home")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition disabled:opacity-60 ${
              activePick === "home"
                ? "bg-primary text-primary-foreground shadow-[0_0_24px_var(--neon)]"
                : "bg-primary/15 text-primary hover:bg-primary/25"
            }`}
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <TeamFlag team={match.home} size="sm" className="!h-4 !w-6" />
                <span className="truncate">{match.home}</span>
              </>
            )}
          </button>
          <button
            type="button"
            disabled={isConnecting}
            onClick={() => void quickPick("away")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition disabled:opacity-60 ${
              activePick === "away"
                ? "bg-primary text-primary-foreground shadow-[0_0_24px_var(--neon)]"
                : "bg-primary/15 text-primary hover:bg-primary/25"
            }`}
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <TeamFlag team={match.away} size="sm" className="!h-4 !w-6" />
                <span className="truncate">{match.away}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
