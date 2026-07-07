import { createContext, useContext, useMemo, type ReactNode } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { pickEthereumWallet } from "@/lib/base/privy-wallet-utils";

const PrivyResolvedAddressContext = createContext<`0x${string}` | undefined>(undefined);

/** Must render inside PrivyProvider — supplies wallet fallback while wagmi syncs. */
export function PrivyResolvedWalletBridge({ children }: { children: ReactNode }) {
  const { authenticated, ready: privyReady } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  const resolved = useMemo(() => {
    if (!privyReady || !walletsReady || !authenticated) return undefined;
    const wallet = pickEthereumWallet(wallets);
    const addr = wallet?.address;
    return addr?.startsWith("0x") ? (addr as `0x${string}`) : undefined;
  }, [privyReady, walletsReady, authenticated, wallets]);

  return (
    <PrivyResolvedAddressContext.Provider value={resolved}>
      {children}
    </PrivyResolvedAddressContext.Provider>
  );
}

/** Wagmi address with Privy wallet fallback when session exists but wagmi lagged on load. */
export function useResolvedWalletAddress(): `0x${string}` | undefined {
  const { address } = useAccount();
  const privyFallback = useContext(PrivyResolvedAddressContext);
  return address ?? privyFallback;
}

/** True when wagmi can sign — not merely when Privy has a cached address. */
export function useResolvedWalletConnected(): boolean {
  const { isConnected } = useAccount();
  return isConnected;
}
