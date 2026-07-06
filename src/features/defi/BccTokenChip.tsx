import { ExternalLink } from "lucide-react";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useBccBalance } from "@/hooks/use-bcc-balance";
import {
  BASE_APP_COIN_URL,
  BCC_BASESCAN_URL,
  BCC_SYMBOL,
  CLANKER_BCC_URL,
} from "@/lib/base/config";

export function BccTokenChip({ compact }: { compact?: boolean }) {
  const { address, isConnected } = useBaseWallet();
  const { formatted, symbol, isLoading } = useBccBalance(address);

  const balanceLabel =
    isConnected && address
      ? isLoading
        ? "…"
        : formatted
      : null;

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 ${compact ? "px-3 py-1.5" : "px-4 py-2"}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
        {symbol ?? BCC_SYMBOL}
      </span>
      {balanceLabel !== null && (
        <span className="font-display text-sm font-bold text-foreground">{balanceLabel}</span>
      )}
      <a
        href={CLANKER_BCC_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-mono text-[10px] text-accent hover:underline"
      >
        Clanker
        <ExternalLink className="h-3 w-3" />
      </a>
      <a
        href={BASE_APP_COIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-mono text-[10px] text-primary hover:underline"
      >
        Base App
        <ExternalLink className="h-3 w-3" />
      </a>
      <a
        href={BCC_BASESCAN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-primary"
      >
        BaseScan
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
