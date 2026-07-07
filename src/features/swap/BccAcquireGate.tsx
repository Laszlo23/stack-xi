import { RefreshCw, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { BccBuyAdvisor } from "@/features/swap/BccBuyAdvisor";
import { BccExchangePanel } from "@/features/swap/BccExchangePanel";
import { useConnectBaseWallet } from "@/hooks/use-connect-base-wallet";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { BCC_SYMBOL, CLANKER_BCC_URL, formatBcc } from "@/lib/base/config";
import { SITE_LINKS } from "@/lib/site/links";

type BccAcquireGateProps = {
  requiredAmount: bigint;
  actionLabel: string;
  intent?: "mint" | "predict";
  onProceed?: () => void;
  compact?: boolean;
};

export function BccAcquireGate({
  requiredAmount,
  actionLabel,
  intent = "mint",
  onProceed,
  compact,
}: BccAcquireGateProps) {
  const { isConnected, bccBalance, refetchBccBalance, connectWallet, isConnecting } =
    useConnectBaseWallet();
  const [refreshing, setRefreshing] = useState(false);
  const [prefillUsdc, setPrefillUsdc] = useState("10");
  const [swapError, setSwapError] = useState<string | null>(null);

  const hasEnough = bccBalance >= requiredAmount;
  const shortfall = requiredAmount > bccBalance ? requiredAmount - bccBalance : 0n;

  const suggestedUsdc = useMemo(() => {
    if (shortfall <= 0n) return "10";
    const bccNeeded = Number(shortfall) / 1e18;
    return String(Math.max(5, Math.ceil(bccNeeded * 1.1 * 10) / 10));
  }, [shortfall]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refetchBccBalance();
    } finally {
      setRefreshing(false);
    }
  }

  if (hasEnough) {
    if (!onProceed) return null;
    return (
      <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
        <span className="font-mono font-bold">{formatBcc(bccBalance)}</span> ready — you can{" "}
        {actionLabel.toLowerCase()}.
        <button
          type="button"
          onClick={onProceed}
          className="ml-2 font-bold underline underline-offset-2"
        >
          Continue →
        </button>
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "space-y-4 rounded-xl border border-accent/40 bg-accent/5 p-4"
          : "space-y-5 rounded-2xl border border-accent/40 bg-accent/5 p-6"
      }
    >
      <div className="flex items-start gap-3">
        <ShoppingCart className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div>
          <h4 className="font-display text-lg font-bold">Get {BCC_SYMBOL} first</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            {actionLabel} requires{" "}
            <span className="font-mono font-bold text-foreground">{formatBcc(requiredAmount)}</span>
            {isConnected && (
              <>
                {" "}
                — you have{" "}
                <span className="font-mono text-foreground">{formatBcc(bccBalance)}</span>
                {shortfall > 0n && (
                  <>
                    {" "}
                    (need <span className="font-mono text-accent">{formatBcc(shortfall)}</span>{" "}
                    more)
                  </>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      <BccBuyAdvisor
        intent={intent}
        requiredAmount={requiredAmount}
        onSuggestBuy={(usdc) => setPrefillUsdc(usdc)}
      />

      {!isConnected ? (
        <button
          type="button"
          onClick={() => void connectWallet()}
          disabled={isConnecting}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {isConnecting ? "Connecting…" : "Connect wallet"}
        </button>
      ) : (
        <>
          <BccExchangePanel
            compact
            defaultFromAmount={prefillUsdc || suggestedUsdc}
            onSuccess={() => void refetchBccBalance()}
            onError={(message) => setSwapError(message)}
          />
          {swapError ? (
            <p className="text-xs font-medium text-destructive">{swapError}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:border-primary/50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh balance
            </button>
            <a
              href={CLANKER_BCC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View on Clanker →
            </a>
            <a
              href={SITE_LINKS.bccDexScreener}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-muted-foreground hover:text-primary"
            >
              DexScreener →
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export function useBccSufficient(requiredAmount: bigint): boolean {
  const { bccBalance } = useBaseWallet();
  return bccBalance >= requiredAmount;
}
