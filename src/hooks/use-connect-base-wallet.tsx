import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { usePrivyBaseConnect } from "@/hooks/use-privy-base-connect";

type BaseWalletValue = ReturnType<typeof useBaseWallet>;

const ConnectBaseWalletContext = createContext<BaseWalletValue | null>(null);

function mergeConnectState(
  base: BaseWalletValue,
  privy: ReturnType<typeof usePrivyBaseConnect> | null,
): BaseWalletValue {
  if (!privy) return base;

  return {
    ...base,
    connectWallet: privy.connectWallet,
    isConnecting: privy.connectPending || base.isConnecting,
    connectPending: privy.connectPending || base.connectPending,
    connectError: privy.connectError ?? base.connectError,
    clearConnectError: () => {
      privy.clearConnectError();
      base.clearConnectError();
    },
  };
}

export function ConnectBaseWalletProvider({
  children,
  privyConnect = null,
}: {
  children: ReactNode;
  privyConnect?: ReturnType<typeof usePrivyBaseConnect> | null;
}) {
  const base = useBaseWallet();
  const value = useMemo(() => mergeConnectState(base, privyConnect), [base, privyConnect]);

  return (
    <ConnectBaseWalletContext.Provider value={value}>{children}</ConnectBaseWalletContext.Provider>
  );
}

/** Must render under PrivyProvider — bridges Privy login into wagmi connect. */
export function PrivyConnectBridge({ children }: { children: ReactNode }) {
  const privyConnect = usePrivyBaseConnect();
  return (
    <ConnectBaseWalletProvider privyConnect={privyConnect}>{children}</ConnectBaseWalletProvider>
  );
}

export function useConnectBaseWallet(): BaseWalletValue {
  const context = useContext(ConnectBaseWalletContext);
  const fallback = useBaseWallet();
  return context ?? fallback;
}
