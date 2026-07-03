import {
  connect,
  disconnect,
  getLocalStorage,
  isConnected as stacksIsConnected,
} from "@stacks/connect";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchSbtcBalanceSats } from "@/lib/stacks/fetch-balance";
import { formatSbtcFromSats } from "@/lib/stacks/config";

type StacksWalletContextValue = {
  isReady: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  stxAddress: string | null;
  sbtcBalanceSats: number;
  sbtcBalanceLabel: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  error: string | null;
};

const StacksWalletContext = createContext<StacksWalletContextValue | null>(null);

function readStxAddress(): string | null {
  if (typeof window === "undefined") return null;
  const data = getLocalStorage();
  return data?.addresses?.stx?.[0]?.address ?? null;
}

export function StacksWalletProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [stxAddress, setStxAddress] = useState<string | null>(null);
  const [sbtcBalanceSats, setSbtcBalanceSats] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = useCallback(async () => {
    const addr = readStxAddress();
    setStxAddress(addr);
    if (!addr) {
      setSbtcBalanceSats(0);
      return;
    }
    try {
      const balance = await fetchSbtcBalanceSats(addr);
      setSbtcBalanceSats(balance);
    } catch {
      setSbtcBalanceSats(0);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    void refreshBalance().finally(() => setIsReady(true));
  }, [refreshBalance]);

  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined") return;
    setIsConnecting(true);
    setError(null);
    try {
      await connect({
        forceWalletSelect: true,
        enableLocalStorage: true,
      });
      await refreshBalance();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wallet connection failed";
      setError(message);
    } finally {
      setIsConnecting(false);
    }
  }, [refreshBalance]);

  const disconnectWallet = useCallback(() => {
    if (typeof window === "undefined") return;
    disconnect();
    setStxAddress(null);
    setSbtcBalanceSats(0);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      isConnected: isReady && (stacksIsConnected() || Boolean(stxAddress)),
      isConnecting,
      stxAddress,
      sbtcBalanceSats,
      sbtcBalanceLabel: formatSbtcFromSats(sbtcBalanceSats),
      connectWallet,
      disconnectWallet,
      refreshBalance,
      error,
    }),
    [
      isReady,
      isConnecting,
      stxAddress,
      sbtcBalanceSats,
      connectWallet,
      disconnectWallet,
      refreshBalance,
      error,
    ],
  );

  return <StacksWalletContext.Provider value={value}>{children}</StacksWalletContext.Provider>;
}

export function useStacksWallet() {
  const ctx = useContext(StacksWalletContext);
  if (!ctx) {
    throw new Error("useStacksWallet must be used within StacksWalletProvider");
  }
  return ctx;
}
