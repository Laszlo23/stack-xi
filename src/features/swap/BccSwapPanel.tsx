import { ExternalLink, Repeat } from "lucide-react";
import { useState } from "react";
import { ZeroXSwapWidget } from "@/features/swap/ZeroXSwapWidget";
import { BccTokenChip } from "@/features/defi/BccTokenChip";
import { useConnectBaseWallet } from "@/hooks/use-connect-base-wallet";
import { useMiniAppContext } from "@/hooks/use-mini-app-context";
import { BCC_SYMBOL, UNISWAP_BCC_SWAP_URL } from "@/lib/base/config";
import { SITE_LINKS } from "@/lib/site/links";
import { type SwapPreset, swapPresetLabel } from "@/lib/swap/swap-config";

function SwapLinks({ preset }: { preset: SwapPreset }) {
  const inputCurrency = preset === "eth-bcc" ? "ETH" : "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const uniswapUrl =
    preset === "eth-bcc"
      ? `${UNISWAP_BCC_SWAP_URL}&inputCurrency=ETH`
      : `${UNISWAP_BCC_SWAP_URL}&inputCurrency=${inputCurrency}`;

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={SITE_LINKS.bccBaseApp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
      >
        Buy {BCC_SYMBOL} in Base App
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      <a
        href={uniswapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:text-primary"
      >
        {swapPresetLabel(preset)} on Uniswap
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

export function BccSwapPanel({ compact }: { compact?: boolean }) {
  const { isConnected, connectWallet, isConnecting } = useConnectBaseWallet();
  const { isMiniApp } = useMiniAppContext();
  const [preset, setPreset] = useState<SwapPreset>("usdc-bcc");

  return (
    <div className={compact ? "space-y-4" : "glass rounded-2xl p-6 sm:p-8 space-y-6"}>
      {!compact && (
        <>
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent">
            <Repeat className="h-3.5 w-3.5" />
            In-app swap
          </div>
          <h3 className="font-display text-2xl font-bold">Swap for {BCC_SYMBOL}</h3>
          <p className="max-w-xl text-sm text-muted-foreground">
            Buy {BCC_SYMBOL} in-app via 0x — aggregates Clanker V4, Uniswap, and Base liquidity.
          </p>
        </>
      )}

      <BccTokenChip compact />

      {isMiniApp && (
        <p className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
          Mini-app detected — 0x swap runs in your connected wallet.
        </p>
      )}

      {!isConnected ? (
        <button
          type="button"
          onClick={() => void connectWallet()}
          disabled={isConnecting}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {isConnecting ? "Connecting…" : "Connect wallet to swap"}
        </button>
      ) : (
        <>
          <ZeroXSwapWidget compact preset={preset} />
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground hover:text-primary">
              External swap links
            </summary>
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                {(["usdc-bcc", "eth-bcc"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPreset(p)}
                    className={`rounded-lg border px-2 py-1 font-mono text-[10px] uppercase ${
                      preset === p
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {swapPresetLabel(p)}
                  </button>
                ))}
              </div>
              <SwapLinks preset={preset} />
            </div>
          </details>
        </>
      )}
    </div>
  );
}
