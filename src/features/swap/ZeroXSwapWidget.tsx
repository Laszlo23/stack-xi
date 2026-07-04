import { ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useConnectBaseWallet } from "@/hooks/use-connect-base-wallet";
import { useZeroXSwap } from "@/hooks/use-zero-x-swap";
import { BASESCAN_URL, BCC_SYMBOL } from "@/lib/base/config";
import { SITE_LINKS } from "@/lib/site/links";
import { DEFAULT_SWAP_SLIPPAGE, type SwapPreset, swapPresetLabel } from "@/lib/swap/swap-config";
import {
  buildAerodromePoolUrl,
  buildBaseAppSwapUrl,
  buildUniswapSwapUrl,
} from "@/lib/swap/swap-deeplinks";

type SwapStatus = {
  configured: boolean;
  mode: "api_key" | "x402" | "deeplink_only";
  hint?: string;
};

type ZeroXSwapWidgetProps = {
  compact?: boolean;
  preset?: SwapPreset;
  defaultSellAmount?: string;
  onSuccess?: () => void;
};

function SwapFallbackLinks({
  preset,
  sellAmount,
  status,
}: {
  preset: SwapPreset;
  sellAmount: string;
  status: SwapStatus | null;
}) {
  const uniswapUrl = buildUniswapSwapUrl(preset, sellAmount);
  const baseAppUrl = buildBaseAppSwapUrl();
  const aerodromeUrl = buildAerodromePoolUrl();

  return (
    <div className="space-y-3 rounded-xl border border-border/50 bg-background/40 p-4 text-sm text-muted-foreground">
      <p>
        {status?.mode === "deeplink_only"
          ? "In-app swap needs ZEROX_API_KEY or a funded X402_SWAP_PAYER_PRIVATE_KEY — use external links:"
          : "In-app quotes unavailable — swap via:"}
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href={uniswapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          Uniswap
          <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={baseAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          Base App
          <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={SITE_LINKS.bccClanker}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          Clanker
          <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={aerodromeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          Aerodrome
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {status?.hint && <p className="text-[10px]">{status.hint}</p>}
    </div>
  );
}

export function ZeroXSwapWidget({
  compact,
  preset: initialPreset = "usdc-bcc",
  defaultSellAmount = "10",
  onSuccess,
}: ZeroXSwapWidgetProps) {
  const { isConnected, connectWallet, isConnecting } = useConnectBaseWallet();
  const [preset, setPreset] = useState<SwapPreset>(initialPreset);
  const [sellAmountInput, setSellAmountInput] = useState(defaultSellAmount);
  const [swapStatus, setSwapStatus] = useState<SwapStatus | null>(null);

  const {
    priceLoading,
    priceError,
    buyAmountLabel,
    needsApproval,
    swapping,
    swapError,
    lastTxHash,
    executeSwap,
    sellAmount,
  } = useZeroXSwap(preset, sellAmountInput);

  useEffect(() => {
    setSellAmountInput(defaultSellAmount);
  }, [defaultSellAmount]);

  useEffect(() => {
    void fetch("/api/swap/status")
      .then((r) => r.json())
      .then((data: SwapStatus) => setSwapStatus(data))
      .catch(() => setSwapStatus({ configured: false, mode: "deeplink_only" }));
  }, []);

  useEffect(() => {
    if (lastTxHash) onSuccess?.();
  }, [lastTxHash, onSuccess]);

  const sellSymbol = preset === "eth-bcc" ? "ETH" : "USDC";

  if (swapStatus && !swapStatus.configured) {
    return <SwapFallbackLinks preset={preset} sellAmount={sellAmountInput} status={swapStatus} />;
  }

  return (
    <div
      className={compact ? "space-y-3" : "space-y-4"}
      role="region"
      aria-label={`Swap for ${BCC_SYMBOL}`}
    >
      {swapStatus?.mode === "x402" && !compact && (
        <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[10px] text-muted-foreground">
          Quotes via project x402 wallet · you sign the swap with your connected wallet
        </p>
      )}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Swap route">
        {(["usdc-bcc", "eth-bcc"] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={preset === p}
            onClick={() => setPreset(p)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              preset === p
                ? "border-primary bg-primary/15 text-primary"
                : "border-border/60 text-muted-foreground"
            }`}
          >
            {swapPresetLabel(p)}
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
              step={preset === "eth-bcc" ? "0.001" : "1"}
              value={sellAmountInput}
              onChange={(e) => setSellAmountInput(e.target.value)}
              aria-label={`Amount to pay in ${sellSymbol}`}
              className="w-full bg-transparent font-mono text-sm outline-none"
            />
            <span className="font-mono text-xs text-muted-foreground">{sellSymbol}</span>
          </div>
        </label>
        <div>
          <span className="font-mono text-[10px] uppercase text-muted-foreground">
            You receive ≈
          </span>
          <div className="mt-1 flex h-[42px] items-center rounded-lg border border-primary/30 bg-primary/5 px-3 font-mono text-sm font-bold text-primary">
            {priceLoading ? "Fetching…" : buyAmountLabel}
          </div>
        </div>
      </div>

      {priceError && (
        <p className="text-xs text-destructive" role="alert">
          {priceError}
        </p>
      )}

      {!isConnected ? (
        <button
          type="button"
          onClick={() => void connectWallet()}
          disabled={isConnecting}
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {isConnecting ? "Connecting…" : "Connect Base wallet to swap for BCC"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void executeSwap()}
          disabled={
            swapping || !sellAmount || sellAmount <= 0n || priceLoading || Boolean(priceError)
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {swapping && <Loader2 className="h-4 w-4 animate-spin" />}
          {needsApproval ? `Approve & swap for ${BCC_SYMBOL}` : `Swap for ${BCC_SYMBOL}`}
        </button>
      )}

      {swapError && (
        <p className="text-xs text-destructive" role="alert">
          {swapError}
        </p>
      )}

      {lastTxHash && (
        <a
          href={`${BASESCAN_URL}/tx/${lastTxHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View swap on BaseScan
          <ExternalLink className="h-3 w-3" />
        </a>
      )}

      {!compact && (
        <p className="text-[10px] text-muted-foreground">
          Powered by 0x on Base · {DEFAULT_SWAP_SLIPPAGE}% slippage · Best route includes Clanker V4
          pool
        </p>
      )}
    </div>
  );
}
