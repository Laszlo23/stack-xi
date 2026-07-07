import { ExternalLink, Loader2, Repeat, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { BccTokenChip } from "@/features/defi/BccTokenChip";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useLifiSwap } from "@/hooks/use-lifi-swap";
import { isLifiReadyClient, useLifiStatus } from "@/hooks/use-lifi-status";
import {
  BCC_SYMBOL,
  CLANKER_BCC_URL,
  UNISWAP_BCC_SWAP_URL,
} from "@/lib/base/config";
import type { LifiAllowedChainId } from "@/lib/swap/lifi-config";
import { buildBaseAppSwapUrl, buildUniswapSwapUrl } from "@/lib/swap/swap-deeplinks";

type BccExchangePanelProps = {
  compact?: boolean;
  defaultFromAmount?: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

function QuickBuyLinks({ amount, token }: { amount: string; token: "usdc" | "eth" }) {
  const preset = token === "eth" ? "eth-bcc" : "usdc-bcc";
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={buildBaseAppSwapUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-bold text-primary"
      >
        Base App
        <ExternalLink className="h-3 w-3" />
      </a>
      <a
        href={buildUniswapSwapUrl(preset, amount)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:border-primary/50 hover:text-primary"
      >
        Uniswap
        <ExternalLink className="h-3 w-3" />
      </a>
      <a
        href={CLANKER_BCC_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:border-primary/50 hover:text-primary"
      >
        Clanker
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

export function BccExchangePanel({
  compact = false,
  defaultFromAmount = "25",
  onSuccess,
  onError,
}: BccExchangePanelProps) {
  const lifiStatus = useLifiStatus();
  const lifiReady = isLifiReadyClient(lifiStatus);
  const { connectWallet, isConnecting, isWalletSyncing, canSign } = useWalletSession();
  const swap = useLifiSwap(defaultFromAmount);
  const reportedSuccess = useRef(false);

  useEffect(() => {
    if (swap.executionLabel === "Swap complete" && !reportedSuccess.current) {
      reportedSuccess.current = true;
      onSuccess?.();
    }
  }, [onSuccess, swap.executionLabel]);

  useEffect(() => {
    if (swap.swapError) onError?.(swap.swapError);
  }, [onError, swap.swapError]);

  if (!lifiReady) {
    return (
      <div className={compact ? "space-y-4" : "glass rounded-2xl p-6 sm:p-8 space-y-5"}>
        {!compact && (
          <>
            <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent">
              <Repeat className="h-3.5 w-3.5" />
              Get {BCC_SYMBOL}
            </div>
            <h3 className="font-display text-2xl font-bold">Buy {BCC_SYMBOL} on Base</h3>
          </>
        )}
        <p className="text-sm text-muted-foreground">
          In-app swap is being configured. Use these trusted links — they open in Base App or
          Uniswap with {BCC_SYMBOL} pre-filled.
        </p>
        <QuickBuyLinks amount={defaultFromAmount} token="usdc" />
        <a
          href={UNISWAP_BCC_SWAP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Open Uniswap swap
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-4" : "glass rounded-2xl p-6 sm:p-8 space-y-5"}>
      {!compact && (
        <>
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Get {BCC_SYMBOL}
          </div>
          <h3 className="font-display text-2xl font-bold">Swap for {BCC_SYMBOL}</h3>
          <p className="max-w-xl text-sm text-muted-foreground">
            Live market quote via LI.FI — best route into {BCC_SYMBOL} on Base. Connect your wallet
            only when you are ready to swap.
          </p>
        </>
      )}

      <BccTokenChip compact />

      <QuickBuyLinks amount={swap.fromAmountInput || defaultFromAmount} token={swap.fromToken} />

      <div className="flex flex-wrap gap-2">
        {swap.chainOptions.map((chain) => (
          <button
            key={chain.id}
            type="button"
            onClick={() => swap.setFromChainId(chain.id as LifiAllowedChainId)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wide ${
              swap.fromChainId === chain.id
                ? "border-primary bg-primary/15 text-primary"
                : "border-border/60 text-muted-foreground"
            }`}
          >
            {chain.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["usdc", "eth"] as const).map((token) => (
          <button
            key={token}
            type="button"
            onClick={() => swap.setFromToken(token)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wide ${
              swap.fromToken === token
                ? "border-primary bg-primary/15 text-primary"
                : "border-border/60 text-muted-foreground"
            }`}
          >
            {token === "usdc" ? "USDC" : "ETH"}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-[10px] uppercase text-muted-foreground">You pay</span>
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2">
            <input
              type="number"
              min="0"
              step={swap.fromToken === "eth" ? "0.001" : "1"}
              value={swap.fromAmountInput}
              onChange={(e) => swap.setFromAmountInput(e.target.value)}
              aria-label={`Amount to pay in ${swap.sellSymbol}`}
              className="w-full bg-transparent font-mono text-sm outline-none"
            />
            <span className="font-mono text-xs text-muted-foreground">{swap.sellSymbol}</span>
          </div>
        </label>
        <div>
          <span className="font-mono text-[10px] uppercase text-muted-foreground">
            You receive ≈
          </span>
          <div className="mt-1 flex h-[42px] items-center rounded-lg border border-primary/30 bg-primary/5 px-3 font-mono text-sm font-bold text-primary">
            {swap.buyAmountLabel}
          </div>
        </div>
      </div>

      {swap.quoteError && (
        <p className="text-xs text-destructive" role="alert">
          {swap.quoteError}
        </p>
      )}

      {!canSign ? (
        <button
          type="button"
          onClick={() => void connectWallet()}
          disabled={isConnecting || isWalletSyncing || !swap.hasValidAmount}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {isConnecting || isWalletSyncing
            ? "Connecting wallet…"
            : `Connect wallet to swap for ${BCC_SYMBOL}`}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void swap.executeSwap()}
          disabled={!swap.canSwap || isWalletSyncing}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {swap.executing && <Loader2 className="h-4 w-4 animate-spin" />}
          {swap.executing
            ? (swap.executionLabel ?? "Swapping…")
            : swap.hasQuote
              ? `Swap for ${BCC_SYMBOL}`
              : "Enter an amount"}
        </button>
      )}

      {isWalletSyncing && (
        <p className="text-center text-xs text-muted-foreground">
          Wallet syncing — swap unlocks once your wallet is ready to sign.
        </p>
      )}

      {!canSign && swap.hasQuote && !isWalletSyncing && (
        <p className="text-center text-xs text-muted-foreground">
          Quote updates live — connect wallet to complete the swap.
        </p>
      )}

      {swap.swapError && (
        <p className="text-xs text-destructive" role="alert">
          {swap.swapError}
        </p>
      )}

      {swap.lastTxLink && (
        <a
          href={swap.lastTxLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View transaction
          <ExternalLink className="h-3 w-3" />
        </a>
      )}

      <p className="text-[10px] text-muted-foreground">
        {swap.isBaseSwap
          ? "Best route on Base via LI.FI · 3% slippage · quotes update as you type"
          : "Cross-chain bridge + swap into BCC on Base · your wallet may ask to switch network"}
      </p>
    </div>
  );
}
