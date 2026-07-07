import { Link } from "@tanstack/react-router";
import { Check, Coins, ExternalLink, Loader2, RefreshCw, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { predictionTxUrl, useUserPredictions } from "@/hooks/use-user-predictions";
import { useResolvedWalletAddress } from "@/hooks/use-resolved-wallet-address";
import {
  getClaimStateFromRecords,
  useClaims,
  useClaimsMutations,
  type ServerClaimRecord,
} from "@/hooks/use-claims";
import { useSquadPerks } from "@/hooks/use-squad-perks";
import { formatBoostPercent } from "@/lib/squad/perk-tiers";
import { useMatchResults } from "@/hooks/use-match-results";
import {
  getPredictionOutcome,
  getSettledMatch,
  winnerTeamName,
  type PredictionOutcome,
} from "@/lib/predict/match-settlement";

function formatWhen(timestamp: number | null): string {
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OutcomeBadge({ outcome }: { outcome: PredictionOutcome }) {
  const { t } = useTranslation();
  const labels: Record<PredictionOutcome, string> = {
    awaiting_result: t("claim.outcome.awaiting"),
    lost: t("claim.outcome.lost"),
    won_claimable: t("claim.outcome.claimable"),
    won_claimed: t("claim.outcome.claimed"),
    won_paid: t("claim.outcome.paid"),
  };
  const styles: Record<PredictionOutcome, string> = {
    awaiting_result: "border-accent/40 bg-accent/10 text-accent",
    lost: "border-border bg-muted/30 text-muted-foreground",
    won_claimable: "border-primary/50 bg-primary/15 text-primary",
    won_claimed: "border-primary/40 bg-primary/10 text-primary",
    won_paid: "border-primary/50 bg-primary/20 text-primary",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${styles[outcome]}`}
    >
      {labels[outcome]}
    </span>
  );
}

export function MyPredictionsPanel() {
  const { t } = useTranslation();
  const address = useResolvedWalletAddress();
  useMatchResults();
  const { rows, isLoading, error, refetch, hasPredictions } = useUserPredictions();
  const { data: claims = [] } = useClaims(address);
  const { requestClaim } = useClaimsMutations(address);
  const { perks: squadPerks } = useSquadPerks(address);
  const [claimBusy, setClaimBusy] = useState<string | null>(null);

  function claimForTx(txHash: string): ServerClaimRecord | undefined {
    return claims.find((c) => c.txHash.toLowerCase() === txHash.toLowerCase());
  }

  const claimableCount = useMemo(() => {
    return rows.filter((row) => {
      if (row.pick === null || row.matchId === "—" || !address) return false;
      const claimState = getClaimStateFromRecords(row.txHash, claims);
      const outcome = getPredictionOutcome(row.matchId, row.pick, claimState);
      return outcome === "won_claimable";
    }).length;
  }, [rows, claims, address]);

  async function handleClaim(
    txHash: string,
    matchId: string,
    pick: "home" | "away",
  ) {
    if (!address) return;
    setClaimBusy(txHash);
    try {
      await requestClaim({ address, matchId, txHash, pick });
      await refetch();
    } finally {
      setClaimBusy(null);
    }
  }

  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary">
            <Target className="h-3.5 w-3.5" />
            {t("claim.title")}
          </div>
          <h2 className="mt-1 font-display text-xl font-bold">{t("claim.subtitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("claim.howItWorks")} {t("claim.claimEta")}
          </p>
          {claimableCount > 0 && (
            <p className="mt-2 text-sm font-semibold text-primary">
              {t("claim.readyCount", { count: claimableCount })}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:border-primary/50 disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {t("common.refresh")}
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
        <strong className="text-foreground">Not automatic on-chain yet.</strong>{" "}
        {t("claim.autoNote")}
      </div>

      {isLoading && !hasPredictions && (
        <p className="mt-4 text-sm text-muted-foreground">{t("common.loading")}</p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {!isLoading && !error && !hasPredictions && (
        <div className="mt-4 rounded-xl border border-border/50 bg-muted/10 px-4 py-5 text-center">
          <p className="text-sm text-muted-foreground">{t("claim.noPredictions")}</p>
          <Link
            to="/"
            hash="predict"
            className="mt-3 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110"
          >
            {t("claim.firstPick")}
          </Link>
        </div>
      )}

      {hasPredictions && (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => {
            const settled = getSettledMatch(row.matchId);
            const pick = row.pick;
            const claimState = getClaimStateFromRecords(row.txHash, claims);
            const outcome =
              pick && row.matchId !== "—"
                ? getPredictionOutcome(row.matchId, pick, claimState)
                : ("awaiting_result" as const);
            const winner = winnerTeamName(row.matchId);
            const canClaim = outcome === "won_claimable";
            const isClaimed = outcome === "won_claimed" || outcome === "won_paid";
            const claimRecord = claimForTx(row.txHash);

            return (
              <li
                key={row.id}
                className="rounded-xl border border-border/50 bg-background/40 px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-display font-bold">{row.matchLabel}</div>
                      {row.matchId !== "—" && <OutcomeBadge outcome={outcome} />}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Pick: <span className="font-mono text-foreground">{row.pickLabel}</span>
                      {row.stakeLabel && (
                        <>
                          {" "}
                          · Stake:{" "}
                          <span className="font-mono text-primary">{row.stakeLabel}</span>
                        </>
                      )}
                    </div>
                    {settled && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Final: <span className="text-foreground">{settled.result}</span>
                        {winner && (
                          <>
                            {" "}
                            · Winner: <span className="text-primary">{winner}</span>
                          </>
                        )}
                      </div>
                    )}
                    <div className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">
                      {formatWhen(row.timestamp)}
                      {row.source === "local" && " · local receipt"}
                    </div>
                  </div>
                  <a
                    href={predictionTxUrl(row.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                  >
                    {row.txHash.slice(0, 10)}…
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {canClaim && pick && (
                  <>
                    {squadPerks.predictionBoostBps > 0 && (
                      <p className="mt-2 text-xs text-primary">
                        {t("claim.squadBoostHint", {
                          boost: formatBoostPercent(squadPerks.predictionBoostBps),
                        })}
                      </p>
                    )}
                    <button
                    type="button"
                    disabled={claimBusy === row.txHash}
                    onClick={() => void handleClaim(row.txHash, row.matchId, pick)}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 disabled:opacity-60"
                  >
                    {claimBusy === row.txHash ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Coins className="h-3.5 w-3.5" />
                    )}
                    {t("claim.claimButton")}
                  </button>
                  </>
                )}

                {isClaimed && (
                  <>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                      <Check className="h-3.5 w-3.5" />
                      {outcome === "won_paid" ? t("claim.paid") : t("claim.claimSubmitted")}
                    </p>
                    {(claimRecord?.boostBps ?? 0) > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("claim.squadBoostApplied", {
                          boost: formatBoostPercent(claimRecord!.boostBps!),
                        })}
                      </p>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link to="/" hash="predict" className="font-semibold text-primary hover:underline">
          New prediction →
        </Link>
        <Link to="/proof" className="text-muted-foreground hover:text-primary hover:underline">
          Full onchain proof hub
        </Link>
      </div>
    </section>
  );
}
