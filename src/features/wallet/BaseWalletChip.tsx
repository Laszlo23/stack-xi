import { Link } from "@tanstack/react-router";
import { ChevronDown, User, Wallet } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FarcasterSignInButton } from "@/features/farcaster/FarcasterSignInButton";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { isPrivyEnabled } from "@/lib/base/privy-config";
import { storeSiwfSession } from "@/lib/farcaster/siwf-session";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function BaseWalletChip({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  const {
    hasWalletSession,
    isWalletSyncing,
    isConnecting,
    address,
    bccBalanceLabel,
    connectWallet,
    requestWalletLogin,
    requestFarcasterLogin,
    connectError,
    clearConnectError,
  } = useWalletSession();

  const [fcAuthError, setFcAuthError] = useState<string | null>(null);

  function handleConnectWalletClick() {
    clearConnectError();
    setFcAuthError(null);
    if (isPrivyEnabled() && requestWalletLogin) {
      requestWalletLogin();
      return;
    }
    void connectWallet().catch(() => undefined);
  }

  function handleFarcasterLoginClick() {
    clearConnectError();
    setFcAuthError(null);
    if (requestFarcasterLogin) {
      requestFarcasterLogin();
      return;
    }
    void connectWallet().catch(() => undefined);
  }

  if (hasWalletSession && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="max-w-[14rem] gap-1.5 border-primary/40 bg-primary/10 font-mono text-xs text-primary hover:bg-primary/20"
            title={`${bccBalanceLabel} · Account menu`}
          >
            <Wallet className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {isWalletSyncing ? "Syncing…" : truncateAddress(address)}
            </span>
            {!isWalletSyncing && (
              <span className="hidden shrink-0 text-[10px] text-muted-foreground sm:inline">
                · {bccBalanceLabel}
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-[100] min-w-[11rem]">
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex cursor-pointer items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const buttonLabel = isConnecting
    ? isWalletSyncing
      ? "Syncing…"
      : "Connecting…"
    : compact
      ? "Wallet"
      : "Connect Base";

  const showPrivyFarcaster = isPrivyEnabled() && Boolean(requestFarcasterLogin);

  return (
    <div className="relative flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          disabled={isConnecting}
          aria-busy={isConnecting}
          title={connectError ?? "Connect a Base wallet"}
          className="gap-1.5 shadow-[0_0_20px_var(--neon)]"
          onClick={handleConnectWalletClick}
        >
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">{buttonLabel}</span>
          <span className="sm:hidden">{isConnecting ? "…" : "Base"}</span>
        </Button>

        {showPrivyFarcaster ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isConnecting}
            className="hidden gap-1 border-primary/40 px-2.5 sm:inline-flex"
            title={t("farcasterAuth.signIn")}
            onClick={handleFarcasterLoginClick}
          >
            <span aria-hidden>🟣</span>
            <span className="max-w-[7rem] truncate text-xs font-semibold">
              {t("farcasterAuth.signIn")}
            </span>
          </Button>
        ) : !isPrivyEnabled() ? (
          <FarcasterSignInButton
            compact
            className="hidden h-9 rounded-md border border-primary/40 px-2.5 text-xs font-semibold sm:inline-flex"
            onSuccess={(result) => {
              if (!result.fid || !result.message || !result.signature || !result.nonce) return;
              storeSiwfSession({
                fid: result.fid,
                username: result.username,
                message: result.message,
                signature: result.signature,
                nonce: result.nonce,
              });
              clearConnectError();
              void connectWallet();
            }}
            onError={setFcAuthError}
          />
        ) : null}
      </div>

      {showPrivyFarcaster ? (
        <button
          type="button"
          disabled={isConnecting}
          className="text-[10px] font-semibold text-primary underline-offset-2 hover:underline sm:hidden"
          onClick={handleFarcasterLoginClick}
        >
          {t("farcasterAuth.signIn")}
        </button>
      ) : null}

      {(connectError || fcAuthError) && (
        <p className="absolute top-full z-[100] mt-1 max-w-[14rem] rounded-md border border-destructive/40 bg-background px-2 py-1 text-right text-[10px] leading-snug text-destructive shadow-lg">
          {connectError ?? fcAuthError}
        </p>
      )}
    </div>
  );
}
