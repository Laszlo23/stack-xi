import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PepeBubble } from "@/features/story/PepeBubble";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useMemberTasksOptional } from "@/hooks/use-member-tasks";
import { usePredictionSession } from "@/hooks/use-prediction-session";
import {
  BASESCAN_URL,
  STAKE_TIERS_USDC,
  formatUsdc,
  isPredictionPoolConfigured,
} from "@/lib/base/config";
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

const CROWD_SPLIT: Record<string, { home: number; away: number }> = {
  m7: { home: 44, away: 56 },
};

function getCrowdSplit(matchId: string) {
  return CROWD_SPLIT[matchId] ?? { home: 50, away: 50 };
}

export function GuidedPredictionFlow() {
  const { session, step, setPick, setStake, markSubmitted, reset } = usePredictionSession();
  const {
    isConnected,
    address,
    usdcBalance,
    usdcBalanceLabel,
    connectWallet,
    isConnecting,
    writeContractAsync,
    approveUsdc,
  } = useBaseWallet();
  const memberTasks = useMemberTasksOptional();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const match = getActiveMatchday();
  const crowd = getCrowdSplit(match.id);
  const pickedTeam =
    session?.pick === "home" ? match.home : session?.pick === "away" ? match.away : null;

  async function handleSubmit() {
    if (!session || session.stakeUsdc <= 0n) return;

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
        approveUsdc,
        {
          matchId: session.matchId,
          pickHome: session.pick === "home",
          amount: session.stakeUsdc,
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

  return (
    <section id="predict" className="py-16 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Step {step} of 4 · {match.stage}
        </div>

        {step === 1 && (
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
                  className="glass flex-1 rounded-xl px-4 py-8 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_32px_var(--neon)]"
                >
                  <div className="font-display text-2xl font-bold">{match.home}</div>
                  <div className="mt-2 font-mono text-sm text-primary">{crowd.home}% crowd</div>
                </button>
                <div className="font-display text-xl font-bold text-muted-foreground">vs</div>
                <button
                  type="button"
                  onClick={() => setPick(match.id, "away")}
                  className="glass flex-1 rounded-xl px-4 py-8 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_32px_var(--neon)]"
                >
                  <div className="font-display text-2xl font-bold">{match.away}</div>
                  <div className="mt-2 font-mono text-sm text-primary">{crowd.away}% crowd</div>
                </button>
              </div>
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
              {STAKE_TIERS_USDC.map((tier) => (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => setStake(tier.amount)}
                  className="glass flex items-center justify-between rounded-xl px-5 py-4 text-left transition hover:border-primary/50 hover:bg-primary/5"
                >
                  <div>
                    <div className="font-display text-xl font-bold">{tier.label} USDC</div>
                    <div className="text-sm text-muted-foreground">{tier.tag}</div>
                  </div>
                  <span className="text-primary">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && session && pickedTeam && (
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
                <span>{formatUsdc(session.stakeUsdc)} USDC</span>
              </div>
              {isConnected && address && (
                <div className="flex justify-between font-mono text-sm">
                  <span className="text-muted-foreground">Your balance</span>
                  <span>{usdcBalanceLabel} USDC</span>
                </div>
              )}
              {!isPredictionPoolConfigured() && (
                <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  Pool address not configured. Set VITE_PREDICTION_POOL_ADDRESS to enable on-chain
                  stakes.
                </p>
              )}
              {isConnected && session.stakeUsdc > usdcBalance && (
                <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  Insufficient USDC balance for this stake.
                </p>
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
                  submitting || !isPredictionPoolConfigured() || session.stakeUsdc > usdcBalance
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-[0_0_32px_var(--neon)] hover:brightness-110 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                Lock in prediction · {formatUsdc(session.stakeUsdc)} USDC
              </button>
            )}

            {submitError && <p className="text-center text-sm text-destructive">{submitError}</p>}
          </div>
        )}

        {step === 4 && session?.txId && (
          <div className="space-y-8">
            <PepeBubble beat={PEPE_SUCCESS} large luckMeter={95} />
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
