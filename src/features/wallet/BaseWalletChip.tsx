import { Link } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { useBaseWallet } from "@/hooks/use-base-wallet";

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function BaseWalletChip({ compact }: { compact?: boolean }) {
  const { isConnected, isConnecting, address, usdcBalanceLabel, connectWallet } = useBaseWallet();

  if (isConnected && address) {
    return (
      <Link
        to="/profile"
        className="inline-flex max-w-[11rem] items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 font-mono text-xs text-primary transition hover:bg-primary/20"
        title="Open profile"
      >
        <Wallet className="h-4 w-4 shrink-0" />
        <span className="truncate">{truncateAddress(address)}</span>
        {!compact && (
          <span className="hidden text-muted-foreground sm:inline">· {usdcBalanceLabel}</span>
        )}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => connectWallet()}
      disabled={isConnecting}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground shadow-[0_0_20px_var(--neon)] transition hover:brightness-110 disabled:opacity-60"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? "Connecting…" : compact ? "Wallet" : "Connect Base"}
    </button>
  );
}
