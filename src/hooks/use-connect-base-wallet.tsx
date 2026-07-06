import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useLogout } from "@privy-io/react-auth";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { usePrivyBaseConnect } from "@/hooks/use-privy-base-connect";

type BaseWalletValue = ReturnType<typeof useBaseWallet>;

const ConnectBaseWalletContext = createContext<BaseWalletValue | null>(null);

function mergeConnectState(
  base: BaseWalletValue,
  privy: ReturnType<typeof usePrivyBaseConnect> | null,
  privyLogout?: () => Promise<void>,
): BaseWalletValue {
  const disconnectWallet = async () => {
    base.disconnectWallet();
    if (privyLogout) {
      try {
        await privyLogout();
      } catch {
        // Wagmi disconnect is the primary session clear for onchain actions.
      }
    }
  };

  if (!privy) {
    return { ...base, disconnectWallet };
  }

  return {
    ...base,
    connectWallet: privy.connectWallet,
    isConnecting: privy.connectPending || base.isConnecting || base.isWalletSyncing,
    connectPending: privy.connectPending || base.connectPending,
    connectError: privy.connectError ?? base.connectError,
    clearConnectError: () => {
      privy.clearConnectError();
      base.clearConnectError();
    },
    disconnectWallet,
  };
}

export function ConnectBaseWalletProvider({
  children,
  privyConnect = null,
  privyLogout,
}: {
  children: ReactNode;
  privyConnect?: ReturnType<typeof usePrivyBaseConnect> | null;
  privyLogout?: () => Promise<void>;
}) {
  const base = useBaseWallet();
  const value = useMemo(
    () => mergeConnectState(base, privyConnect, privyLogout),
    [base, privyConnect, privyLogout],
  );

  return (
    <ConnectBaseWalletContext.Provider value={value}>{children}</ConnectBaseWalletContext.Provider>
  );
}

/** Must render under PrivyProvider — bridges Privy login into wagmi connect. */
export function PrivyConnectBridge({ children }: { children: ReactNode }) {
  const privyConnect = usePrivyBaseConnect();
  const { logout } = useLogout();

  const privyLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <ConnectBaseWalletProvider privyConnect={privyConnect} privyLogout={privyLogout}>
      {children}
    </ConnectBaseWalletProvider>
  );
}

export function useConnectBaseWallet(): BaseWalletValue {
  const context = useContext(ConnectBaseWalletContext);
  const fallback = useBaseWallet();
  return context ?? fallback;
}
