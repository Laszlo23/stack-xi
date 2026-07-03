import { Wallet } from "lucide-react";
import { useStacksWallet } from "@/hooks/use-stacks-wallet";

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function StacksWalletChip({ compact }: { compact?: boolean }) {
  const {
    isReady,
    isConnected,
    isConnecting,
    stxAddress,
    sbtcBalanceLabel,
    connectWallet,
    disconnectWallet,
  } = useStacksWallet();

  if (!isReady) {
    return <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" aria-hidden />;
  }

  if (isConnected && stxAddress) {
    return (
      <button
        type="button"
        onClick={disconnectWallet}
        className="inline-flex max-w-[11rem] items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 font-mono text-xs text-primary transition hover:bg-primary/20"
        title="Click to disconnect"
      >
        <Wallet className="h-4 w-4 shrink-0" />
        <span className="truncate">{truncateAddress(stxAddress)}</span>
        {!compact && (
          <span className="hidden text-muted-foreground sm:inline">· {sbtcBalanceLabel}</span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void connectWallet()}
      disabled={isConnecting}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground shadow-[0_0_20px_var(--neon)] transition hover:brightness-110 disabled:opacity-60"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? "Connecting…" : compact ? "Wallet" : "Connect wallet"}
    </button>
  );
}
