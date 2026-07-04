import { Link } from "@tanstack/react-router";
import { Loader2, Timer } from "lucide-react";
import { FarcasterCastAssistant } from "@/features/farcaster/FarcasterCastAssistant";
import { PepeBubble } from "@/features/story/PepeBubble";
import { BccAcquireGate } from "@/features/swap/BccAcquireGate";
import { CrowdPressureBar } from "@/features/predict/CrowdPressureBar";
import { PredictionReceiptPanel } from "@/features/predict/PredictionReceiptPanel";
import { PredictionShareCard } from "@/features/predict/PredictionShareCard";
import { ShareUnlockStep } from "@/features/predict/ShareUnlockStep";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useMemberTasksOptional } from "@/hooks/use-member-tasks";
import { usePredictionSession } from "@/hooks/use-prediction-session";
import {
  BASESCAN_URL,
  BCC_SYMBOL,
  STAKE_TIERS_BCC,
  formatBcc,
  isPredictionPoolConfigured,
} from "@/lib/base/config";
import { useEffect, useState } from "react";
import { buildPredictCast } from "@/lib/farcaster/cast-templates";
import { formatCountdown, getPredictionWindow } from "@/lib/predict/match-window";
import { hasShareUnlock } from "@/lib/predict/share-unlock";
import { getAccount } from "wagmi/actions";
import { submitBasePrediction } from "@/lib/base/submit-prediction";
import { recordPredictionTx } from "@/lib/profile/task-storage";
import { getActiveMatchday } from "@/lib/story/dallas-schedule";
import { wagmiConfig } from "@/lib/base/wagmi-config";
import {
  PEPE_CONFIRM_INTRO,
  PEPE_PREDICT_INTRO,
  PEPE_RETURN_HOOK,
  PEPE_STAKE_INTRO,
  PEPE_SUCCESS,
} from "@/lib/story/pepe-script";

export function GuidedPredictionFlow() {
  const { session, step, setPick, setStake, markShareUnlocked, markSubmitted, reset } =
    usePredictionSession();
  const {
    isConnected,
    address,
    bccBalance,
    bccBalanceLabel,
    connectWallet,
    isConnecting,
    writeContractAsync,
    approveBcc,
  } = useBaseWallet();
  const memberTasks = useMemberTasksOptional();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, tick] = useState(0);

  const match = getActiveMatchday();
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
      markShareUnlocked();
    }
  }, [address, session, markShareUnlocked]);

  async function handleSubmit() {
    if (!session || session.stakeBcc <= 0n || !session.shareUnlocked) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (!isConnected) {
        await connectWallet();
      }
      const wallet = getAccount(wagmiConfig).address ?? address;
      if (!wallet) {
        throw new Error("Connect your Base wallet first.");
      }

      const txHash = await submitBasePrediction(
        (args) =>
          writeContractAsync({
            address: args.address,
            abi: args.abi,
            functionName: args.functionName,
            args: args.args,
          }),
        approveBcc,
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const windowClosed = window.status === "closed";
  const windowUpcoming = window.status === "upcoming";

  return (
    <section id="predict" className="py-16 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Social prediction sport · not finance
        </div>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>
            Step {step} of 5 · {match.stage}
          </span>
          <LiveWindowBadge window={window} />
        </div>

        {windowClosed && step === 1 && (
          <div className="mb-8 space-y-6">
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              Live match window closed. Predictions lock at kickoff — receipts are in.
            </div>
            <PredictionReceiptPanel home={match.home} away={match.away} stage={match.stage} />
          </div>
        )}

        {windowUpcoming && step === 1 && (
          <div className="mb-8 rounded-xl border border-accent/30 bg-accent/5 px-4 py-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase text-accent">
              <Timer className="h-4 w-4" />
              Live window opens in {formatCountdown(window.msUntilOpen)}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Predictions unlock {formatCountdown(window.msUntilOpen)} before kickoff. Set your pick
              early — share gate still applies.
            </p>
          </div>
        )}

        {step === 1 && !windowClosed && (
          <div className="space-y-8">
            <PepeBubble beat={PEPE_PREDICT_INTRO} />
            <div className="glass-neon rounded-2xl p-6 text-center">
              <div className="font-mono text-xs uppercase tracking-widest text-primary">
                Next up · {match.kickoffLabel}
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setPick(match.id, "home")}
                  disabled={windowUpcoming}
                  className="glass flex-1 rounded-xl px-4 py-8 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_32px_var(--neon)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="font-display text-2xl font-bold">{match.home}</div>
                </button>
                <div className="font-display text-xl font-bold text-muted-foreground">vs</div>
                <button
                  type="button"
                  onClick={() => setPick(match.id, "away")}
                  disabled={windowUpcoming}
                  className="glass flex-1 rounded-xl px-4 py-8 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_32px_var(--neon)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="font-display text-2xl font-bold">{match.away}</div>
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
            <div className="grid gap-3">
              {STAKE_TIERS_BCC.map((tier) => (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => setStake(tier.amount)}
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

        {step === 3 && session && pickedTeam && (
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

        {step === 4 && session && pickedTeam && (
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
                <span>{formatBcc(session.stakeBcc)}</span>
              </div>
              <div className="flex justify-between font-mono text-sm">
                <span className="text-muted-foreground">Social unlock</span>
                <span className="text-primary">✓ Cast gate passed</span>
              </div>
              {isConnected && address && (
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-muted-foreground">Your balance</span>
                  <span>{bccBalanceLabel}</span>
                </div>
              )}
              {!isPredictionPoolConfigured() && (
                <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  Pool address not configured. Set VITE_PREDICTION_POOL_ADDRESS to enable on-chain
                  stakes.
                </p>
              )}
              {isConnected && session.stakeBcc > bccBalance && (
                <BccAcquireGate
                  requiredAmount={session.stakeBcc}
                  actionLabel="Submit prediction"
                  intent="predict"
                  compact
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
                disabled={
                  submitting ||
                  !session.shareUnlocked ||
                  !isPredictionPoolConfigured() ||
                  session.stakeBcc > bccBalance ||
                  window.status !== "open"
                }
                className="defi-energy-btn flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-[0_0_32px_var(--neon)] hover:brightness-110 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                Lock in prediction · {formatBcc(session.stakeBcc)}
              </button>
            )}

            {window.status !== "open" && (
              <p className="text-center text-sm text-muted-foreground">
                Onchain lock requires an open live window ({formatCountdown(window.msUntilClose)}{" "}
                left).
              </p>
            )}

            {submitError && <p className="text-center text-sm text-destructive">{submitError}</p>}
          </div>
        )}

        {step === 5 && session?.txId && pickedTeam && (
          <div className="space-y-8">
            <PepeBubble beat={PEPE_SUCCESS} large luckMeter={95} />
            <PredictionShareCard
              home={match.home}
              away={match.away}
              pick={pickedTeam}
              stakeLabel={stakeLabel.replace("$", "")}
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
  if (window.status === "open") {
    return (
      <span className="inline-flex items-center gap-1.5 text-primary">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        Live · {formatCountdown(window.msUntilClose)} left
      </span>
    );
  }
  if (window.status === "upcoming") {
    return <span className="text-accent">Opens in {formatCountdown(window.msUntilOpen)}</span>;
  }
  return <span className="text-muted-foreground">Window closed</span>;
}
