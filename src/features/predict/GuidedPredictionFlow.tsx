import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { FarcasterCastAssistant } from "@/features/farcaster/FarcasterCastAssistant";
import { PepeBubble } from "@/features/story/PepeBubble";
import { BccAcquireGate } from "@/features/swap/BccAcquireGate";
import { CrowdPressureBar } from "@/features/predict/CrowdPressureBar";
import { TeamFlag } from "@/features/predict/TeamFlag";
import { PredictionReceiptPanel } from "@/features/predict/PredictionReceiptPanel";
import { PredictionShareCard } from "@/features/predict/PredictionShareCard";
import { ShareUnlockStep } from "@/features/predict/ShareUnlockStep";
import { useConnectBaseWallet } from "@/hooks/use-connect-base-wallet";
import { useMemberTasksOptional } from "@/hooks/use-member-tasks";
import { useMiniAppContext } from "@/hooks/use-mini-app-context";
import { usePredictionSession } from "@/hooks/use-prediction-session";
import { useWorldVerification } from "@/hooks/use-world-verification";
import { WorldVerifyPanel } from "@/features/world/WorldVerifyPanel";
import { useSponsoredPrediction } from "@/hooks/use-sponsored-prediction";
import { useSquadPerks } from "@/hooks/use-squad-perks";
import { formatBoostPercent } from "@/lib/squad/perk-tiers";
import {
  BASESCAN_URL,
  BCC_SYMBOL,
  SPONSORED_PREDICTION_MAX,
  SPONSORED_STAKE_BCC,
  STAKE_TIERS_BCC,
  formatBcc,
  isPredictionPoolConfigured,
  isSponsorConfigured,
} from "@/lib/base/config";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildPredictCast } from "@/lib/farcaster/cast-templates";
import {
  formatCountdown,
  getPredictionWindow,
  isPredictionSubmitAllowed,
} from "@/lib/predict/match-window";
import { hasShareUnlock } from "@/lib/predict/share-unlock";
import { submitBasePrediction, submitSponsoredPrediction } from "@/lib/base/submit-prediction";
import { recordPredictionTx } from "@/lib/profile/task-storage";
import { resolvePredictionMarket } from "@/lib/story/match-markets";
import {
  PEPE_CONFIRM_INTRO,
  PEPE_PREDICT_INTRO,
  PEPE_RETURN_HOOK,
  PEPE_STAKE_INTRO,
  PEPE_SUCCESS,
} from "@/lib/story/pepe-script";

export function GuidedPredictionFlow() {
  const { t } = useTranslation();
  const { session, step, setPick, setStake, applyShareUnlock, markShareUnlocked, markSubmitted, reset } =
    usePredictionSession();
  const {
    isConnected,
    address,
    bccBalance,
    bccBalanceLabel,
    connectWallet,
    isConnecting,
    writeContractAsync,
    ensureBccAllowance,
  } = useConnectBaseWallet();
  const memberTasks = useMemberTasksOptional();
  const { isWorldApp } = useMiniAppContext();
  const { verified: worldVerified, refresh: refreshWorldVerification } = useWorldVerification();
  const sponsor = useSponsoredPrediction();
  const { perks: squadPerks } = useSquadPerks(address);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, tick] = useState(0);

  const match = resolvePredictionMarket(session?.matchId);
  const window = getPredictionWindow(match);
  const pickedTeam =
    session?.pick === "home" ? match.home : session?.pick === "away" ? match.away : null;
  const stakeLabel = session ? formatBcc(session.stakeBcc) : `0 ${BCC_SYMBOL}`;

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!address || !session || session.shareUnlocked) return;
    if (hasShareUnlock(address, session.matchId)) {
      // Cast gate already passed for this match — do not skip stake selection.
      applyShareUnlock(false);
    }
  }, [address, session, applyShareUnlock]);

  async function handleSubmit() {
    if (!session || session.stakeBcc <= 0n) return;
    if (isWorldApp && !worldVerified) {
      setSubmitError("Verify with World ID before submitting from World App.");
      return;
    }

    const liveWindow = getPredictionWindow(match);
    if (!isPredictionSubmitAllowed(liveWindow)) {
      setSubmitError("Prediction window closed — match has started or strict mode not open yet.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      let wallet = address;
      if (!wallet) {
        wallet = await connectWallet();
      }
      if (!wallet) {
        throw new Error("Connect your Base wallet first.");
      }

      const isSponsored = Boolean(session.sponsored);

      const txHash = isSponsored
        ? await submitSponsoredPrediction(
            (args) =>
              writeContractAsync({
                address: args.address,
                abi: args.abi,
                functionName: args.functionName,
                args: args.args,
              }),
            {
              matchId: session.matchId,
              pickHome: session.pick === "home",
            },
          )
        : await submitBasePrediction(
            (args) =>
              writeContractAsync({
                address: args.address,
                abi: args.abi,
                functionName: args.functionName,
                args: args.args,
              }),
            ensureBccAllowance,
            {
              matchId: session.matchId,
              pickHome: session.pick === "home",
              amount: session.stakeBcc,
              useContract: isPredictionPoolConfigured(),
            },
          );

      markSubmitted(txHash);
      recordPredictionTx(wallet, txHash);
      memberTasks?.refreshProgress();
      void sponsor.refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const windowClosed = window.status === "closed";
  const isSponsoredStake = Boolean(session?.sponsored);
  const canSubmitOnchain =
    Boolean(session && session.stakeBcc > 0n) &&
    isPredictionPoolConfigured() &&
    (!isWorldApp || worldVerified) &&
    (isSponsoredStake
      ? isSponsorConfigured() && sponsor.isEligible
      : Boolean(session && session.stakeBcc <= bccBalance)) &&
    isPredictionSubmitAllowed(window);

  const submitBlockers: string[] = [];
  if (session && session.stakeBcc <= 0n) {
    submitBlockers.push("Select a BCC stake tier before locking");
  }
  if (!isPredictionPoolConfigured()) {
    submitBlockers.push("Prediction pool not configured (VITE_PREDICTION_POOL_ADDRESS)");
  }
  if (isSponsoredStake) {
    if (!isSponsorConfigured()) {
      submitBlockers.push("Sponsor contract not configured (VITE_PREDICTION_SPONSOR_ADDRESS)");
    } else if (!sponsor.isEligible) {
      if (!sponsor.socialGate.socialEligible) {
        submitBlockers.push("Connect Farcaster or X on Profile to unlock sponsored stake");
      } else if (sponsor.socialGate.onChainAllowed === false) {
        submitBlockers.push("On-chain allowlist syncing — wait a moment and retry");
      } else {
        submitBlockers.push("Sponsored slot unavailable — already used or all 77 claimed");
      }
    }
  } else if (session && session.stakeBcc > bccBalance) {
    submitBlockers.push(`Insufficient ${BCC_SYMBOL} balance for stake`);
  }
  if (windowClosed) submitBlockers.push("Match window closed — predictions lock at kickoff");
  if (isWorldApp && !worldVerified) {
    submitBlockers.push("Verify with World ID to submit from World App");
  }

  return (
    <section id="predict" className="py-16 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Social prediction sport · not finance
        </div>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>
            Step {step} of 4 · {match.stage}
          </span>
          <LiveWindowBadge window={window} />
        </div>

        {sponsor.isConfigured && sponsor.remainingSlots > 0 && step < 4 && (
          <div className="mb-6 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
            <strong className="text-accent">Founding sponsor:</strong> First {SPONSORED_PREDICTION_MAX}{" "}
            verified members (Farcaster FID or linked X) get {formatBcc(SPONSORED_STAKE_BCC)} staked
            free —{" "}
            <span className="font-mono text-primary">{sponsor.remainingSlots} slots left</span>
            {sponsor.isEligible && step === 2 && (
              <span className="text-muted-foreground"> · You&apos;re eligible</span>
            )}
            {address && !sponsor.socialGate.socialEligible && (
              <span className="mt-2 block text-muted-foreground">
                {sponsor.socialGate.reason}{" "}
                <Link to="/profile" className="font-semibold text-primary hover:underline">
                  Connect on Profile →
                </Link>
              </span>
            )}
            {address &&
              sponsor.socialGate.socialEligible &&
              sponsor.socialGate.onChainAllowed === false && (
                <span className="mt-2 block text-muted-foreground">
                  Social verified — syncing on-chain allowlist (retry in a few seconds).
                </span>
              )}
          </div>
        )}

        {windowClosed && step === 1 && (
          <div className="mb-8 space-y-6">
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              Live match window closed. Predictions lock at kickoff — receipts are in.
            </div>
            <PredictionReceiptPanel home={match.home} away={match.away} stage={match.stage} />
          </div>
        )}

        {step === 1 && !windowClosed && (
          <div className="space-y-8">
            <PepeBubble beat={PEPE_PREDICT_INTRO} />
            <div className="rounded-2xl border border-border/60 bg-card/95 p-4 text-center shadow-lg sm:p-6">
              <div className="font-mono text-xs uppercase tracking-widest text-primary">
                Next up · {match.kickoffLabel}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Predictions stay open until kickoff · {formatCountdown(window.msUntilClose)} left
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setPick(match.id, "home")}
                  className="predict-team-pick group flex min-h-[11rem] flex-col items-center justify-between gap-3 rounded-xl border border-border/80 bg-background px-2 py-4 transition active:scale-[0.98] hover:border-primary/50 hover:shadow-[0_0_24px_oklch(0.88_0.28_145/0.15)] sm:min-h-[12rem] sm:px-4 sm:py-6"
                >
                  <TeamFlag
                    team={match.home}
                    size="xl"
                    className="transition group-hover:scale-105"
                  />
                  <div className="max-w-full px-1 text-center font-display text-base font-bold leading-tight text-foreground sm:text-2xl">
                    {match.home}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary opacity-0 transition group-hover:opacity-100">
                    Pick home →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPick(match.id, "away")}
                  className="predict-team-pick group flex min-h-[11rem] flex-col items-center justify-between gap-3 rounded-xl border border-border/80 bg-background px-2 py-4 transition active:scale-[0.98] hover:border-primary/50 hover:shadow-[0_0_24px_oklch(0.88_0.28_145/0.15)] sm:min-h-[12rem] sm:px-4 sm:py-6"
                >
                  <TeamFlag
                    team={match.away}
                    size="xl"
                    className="transition group-hover:scale-105"
                  />
                  <div className="max-w-full px-1 text-center font-display text-base font-bold leading-tight text-foreground sm:text-2xl">
                    {match.away}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary opacity-0 transition group-hover:opacity-100">
                    Pick away →
                  </span>
                </button>
              </div>

              <CrowdPressureBar matchId={match.id} />
            </div>
          </div>
        )}

        {step === 2 && pickedTeam && (
          <div className="space-y-8">
            <PepeBubble beat={PEPE_STAKE_INTRO} />
            <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 font-mono text-sm text-primary">
              Your pick: <strong>{pickedTeam}</strong>
            </div>
            {session?.shareUnlocked && (
              <p className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                Cast gate already passed for this match — pick your stake and lock another prediction.
              </p>
            )}
            <div className="grid gap-3">
              {sponsor.isEligible && (
                <button
                  type="button"
                  onClick={() => setStake(SPONSORED_STAKE_BCC, true)}
                  className="flex items-center justify-between rounded-xl border-2 border-accent/50 bg-accent/10 px-5 py-4 text-left transition hover:border-accent hover:bg-accent/15"
                >
                  <div>
                    <div className="font-display text-xl font-bold text-accent">
                      {formatBcc(SPONSORED_STAKE_BCC)} · Sponsored
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Founding member stake — free from treasury ({sponsor.remainingSlots} left)
                    </div>
                  </div>
                  <span className="font-mono text-xs uppercase text-accent">Free →</span>
                </button>
              )}
              {STAKE_TIERS_BCC.map((tier) => (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => setStake(tier.amount, false)}
                  className="glass flex items-center justify-between rounded-xl px-5 py-4 text-left transition hover:border-primary/50 hover:bg-primary/5"
                >
                  <div>
                    <div className="font-display text-xl font-bold">
                      {tier.label} {BCC_SYMBOL}
                    </div>
                    <div className="text-sm text-muted-foreground">{tier.tag}</div>
                  </div>
                  <span className="text-primary">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && session && pickedTeam && session.stakeBcc > 0n && (
          <div className="space-y-8">
            <PepeBubble beat={PEPE_CONFIRM_INTRO} />
            <div className="glass space-y-4 rounded-2xl p-6">
              <div className="flex justify-between font-mono text-sm">
                <span className="text-muted-foreground">Match</span>
                <span>
                  {match.home} vs {match.away}
                </span>
              </div>
              <div className="flex justify-between font-mono text-sm">
                <span className="text-muted-foreground">Your pick</span>
                <span className="font-bold text-primary">{pickedTeam}</span>
              </div>
              <div className="flex justify-between font-mono text-sm">
                <span className="text-muted-foreground">Stake</span>
                <span>
                  {formatBcc(session.stakeBcc)}
                  {session.sponsored && (
                    <span className="ml-2 text-accent">· sponsored</span>
                  )}
                </span>
              </div>
              {squadPerks.predictionBoostBps > 0 && (
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-muted-foreground">{t("predict.squadBoost")}</span>
                  <span className="text-primary">
                    {formatBoostPercent(squadPerks.predictionBoostBps)} on claims · {squadPerks.tierLabel}
                  </span>
                </div>
              )}
              {isConnected && address && !session.sponsored && (
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-muted-foreground">Your balance</span>
                  <span>{bccBalanceLabel}</span>
                </div>
              )}
              {session.sponsored && (
                <p className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
                  Treasury sponsors your {formatBcc(SPONSORED_STAKE_BCC)} stake — no BCC needed in
                  wallet.
                </p>
              )}
              {!isPredictionPoolConfigured() && (
                <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  Pool address not configured. Set VITE_PREDICTION_POOL_ADDRESS to enable on-chain
                  stakes.
                </p>
              )}
              {isConnected && !session.sponsored && session.stakeBcc > bccBalance && (
                <BccAcquireGate
                  requiredAmount={session.stakeBcc}
                  actionLabel="Submit prediction"
                  intent="predict"
                  compact
                />
              )}
              {isWorldApp && !worldVerified && (
                <WorldVerifyPanel
                  compact
                  onVerified={() => void refreshWorldVerification()}
                />
              )}
            </div>

            {!isConnected ? (
              <button
                type="button"
                onClick={() => void connectWallet()}
                disabled={isConnecting}
                className="w-full rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-[0_0_32px_var(--neon)] hover:brightness-110 disabled:opacity-60"
              >
                {isConnecting ? "Connecting wallet…" : "Connect Base wallet"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting || !canSubmitOnchain}
                className="defi-energy-btn flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-[0_0_32px_var(--neon)] hover:brightness-110 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                {session.sponsored
                  ? `Lock sponsored prediction · ${formatBcc(session.stakeBcc)} free`
                  : `Lock in prediction · ${formatBcc(session.stakeBcc)}`}
              </button>
            )}

            {!canSubmitOnchain && submitBlockers.length > 0 && (
              <ul className="space-y-1 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                {submitBlockers.map((blocker) => (
                  <li key={blocker}>• {blocker}</li>
                ))}
              </ul>
            )}

            {windowClosed && (
              <p className="text-center text-sm text-muted-foreground">
                Predictions lock at kickoff. This match window is closed.
              </p>
            )}

            {!windowClosed && window.status === "open" && (
              <p className="text-center text-sm text-muted-foreground">
                Open until kickoff · {formatCountdown(window.msUntilClose)} left
              </p>
            )}

            {submitError && <p className="text-center text-sm text-destructive">{submitError}</p>}
          </div>
        )}

        {step === 4 && session?.txId && pickedTeam && (
          <div className="space-y-8">
            <PepeBubble beat={PEPE_SUCCESS} large luckMeter={95} />
            <PredictionShareCard
              home={match.home}
              away={match.away}
              pick={pickedTeam}
              stakeLabel={stakeLabel.replace("$", "")}
              matchId={match.id}
            />
            <div className="glass-neon rounded-2xl p-6 text-center">
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
                You&apos;re in
              </div>
              <div className="mt-2 font-display text-2xl font-bold">{pickedTeam} to win</div>
              <div className="mt-4 break-all font-mono text-xs text-muted-foreground">
                tx: {session.txId}
              </div>
              <a
                href={`${BASESCAN_URL}/tx/${session.txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm text-primary hover:underline"
              >
                View on BaseScan →
              </a>
              <p className="mt-4 text-sm text-muted-foreground">
                Winners share the culture pool when the match settles — BCC rewards sent from the
                prediction pool after final whistle.
              </p>
            </div>
            <FarcasterCastAssistant
              castText={buildPredictCast({
                pick: pickedTeam,
                stakeLabel: stakeLabel,
                txHash: session.txId,
                matchLabel: `${match.home} vs ${match.away}`,
              })}
              txHash={session.txId}
            />
            {!hasShareUnlock(address, session.matchId) && (
              <ShareUnlockStep
                home={match.home}
                away={match.away}
                pick={pickedTeam}
                stakeLabel={stakeLabel}
                stage={match.stage}
                address={address}
                matchId={session.matchId}
                unlocked={Boolean(session.shareUnlocked)}
                onUnlocked={markShareUnlocked}
              />
            )}
            <Link
              to="/proof"
              className="block text-center text-sm font-semibold text-primary hover:underline"
            >
              View all onchain proofs →
            </Link>
            <PepeBubble beat={PEPE_RETURN_HOOK} />
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary"
            >
              Make another prediction
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function LiveWindowBadge({ window }: { window: ReturnType<typeof getPredictionWindow> }) {
  if (window.status === "closed") {
    return <span className="text-muted-foreground">Window closed</span>;
  }
  if (window.status === "upcoming") {
    return (
      <span className="text-accent">
        Strict mode · opens in {formatCountdown(window.msUntilOpen)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-primary">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
      Open · {formatCountdown(window.msUntilClose)} until kickoff
    </span>
  );
}
