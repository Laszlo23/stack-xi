import { useState } from "react";
import { Link2, Loader2, Wallet } from "lucide-react";
import { useCreateWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { useConnectBaseWallet } from "@/hooks/use-connect-base-wallet";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { useTelegramSession } from "@/hooks/use-telegram-session";
import { isPrivyEnabled } from "@/lib/base/privy-config";
import { shouldUsePrivyConnectFlow } from "@/lib/base/privy-env";

export function TelegramConnectWallet() {
  const { isTelegram, user, needsWalletLink, linkWallet, error, clearError } =
    useTelegramSession();
  const { isConnected, address, isConnecting } = useBaseWallet();
  const [linkBusy, setLinkBusy] = useState(false);

  if (!isTelegram) return null;

  if (isConnected && address && needsWalletLink) {
    return (
      <section className="glass rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-amber-400">
          <Link2 className="h-3.5 w-3.5" />
          Link wallet to Telegram
        </div>
        <p className="text-sm text-muted-foreground">
          Wallet connected ({address.slice(0, 6)}…{address.slice(-4)}). Sign once to merge XP with
          {user?.username ? ` @${user.username}` : " your Telegram account"}.
        </p>
        <button
          type="button"
          disabled={linkBusy}
          onClick={() => {
            clearError();
            setLinkBusy(true);
            void linkWallet(address)
              .catch(() => {
                // Error surfaced via session error state.
              })
              .finally(() => setLinkBusy(false));
          }}
          className="cursor-pointer rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {linkBusy ? (
            <Loader2 className="inline h-3.5 w-3.5 animate-spin" />
          ) : (
            "Sign to link wallet"
          )}
        </button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </section>
    );
  }

  if (isConnected) return null;

  return (
    <section className="glass rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-amber-400">
        <Wallet className="h-3.5 w-3.5" />
        Connect Base wallet
      </div>
      <p className="text-sm text-muted-foreground">
        {user?.username
          ? `@${user.username}, link a wallet to lock BCC predictions onchain.`
          : "Telegram identity loaded — connect a Base wallet for onchain actions."}
      </p>
      <div className="flex flex-wrap gap-2">
        <TelegramWalletConnectButton disabled={isConnecting} />
        {isPrivyEnabled() && shouldUsePrivyConnectFlow() && <TelegramPrivyWalletButton />}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </section>
  );
}

function TelegramWalletConnectButton({ disabled }: { disabled: boolean }) {
  const { connectWallet, connectError, clearConnectError, isConnecting } = useConnectBaseWallet();
  const [localError, setLocalError] = useState<string | null>(null);
  const busy = isConnecting;

  async function connectWalletConnect() {
    clearConnectError();
    setLocalError(null);
    try {
      await connectWallet();
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "WalletConnect failed");
    }
  }

  const displayError = localError ?? connectError;

  return (
    <>
      <button
        type="button"
        disabled={busy || disabled}
        onClick={() => void connectWalletConnect()}
        className="cursor-pointer rounded-lg border border-primary/40 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="inline h-3.5 w-3.5 animate-spin" />
        ) : (
          "Connect with WalletConnect"
        )}
      </button>
      {displayError && <p className="w-full text-xs text-destructive">{displayError}</p>}
    </>
  );
}

function TelegramPrivyWalletButton() {
  const { login, authenticated, ready: privyReady } = usePrivy();
  const { wallets } = useWallets();
  const { createWallet } = useCreateWallet();
  const { setActiveWallet } = useSetActiveWallet();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createEmbeddedWallet() {
    setError(null);
    setBusy(true);
    try {
      if (!authenticated) {
        await login();
      }
      let wallet = wallets.find((w) => w.walletClientType === "privy") ?? wallets[0];
      if (!wallet) {
        wallet = await createWallet();
      }
      if (wallet) {
        await setActiveWallet(wallet);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Embedded wallet failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={busy || !privyReady}
        onClick={() => void createEmbeddedWallet()}
        className="cursor-pointer rounded-lg border border-border px-4 py-2.5 text-xs font-semibold hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="inline h-3.5 w-3.5 animate-spin" />
        ) : (
          "Create embedded wallet"
        )}
      </button>
      {error && <p className="w-full text-xs text-destructive">{error}</p>}
    </>
  );
}
