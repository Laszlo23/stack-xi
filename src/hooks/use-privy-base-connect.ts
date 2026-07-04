import { useCallback, useRef, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { shouldUsePrivyConnectFlow } from "@/lib/base/privy-env";
import { isTelegramMiniApp } from "@/lib/telegram/types";

async function waitUntil(check: () => boolean, timeoutMs: number, label: string): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (check()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`${label} timed out — try again`);
}

export function usePrivyBaseConnect() {
  const privyConnectFlow = shouldUsePrivyConnectFlow();
  const { login, authenticated, ready: privyReady } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { address, connectWallet: wagmiConnect, clearConnectError } = useBaseWallet();
  const [connectPending, setConnectPending] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const privyReadyRef = useRef(privyReady);
  const walletsReadyRef = useRef(walletsReady);
  const walletsRef = useRef(wallets);
  privyReadyRef.current = privyReady;
  walletsReadyRef.current = walletsReady;
  walletsRef.current = wallets;

  const connectWallet = useCallback(async (): Promise<`0x${string}`> => {
    if (address) return address;

    setConnectError(null);
    clearConnectError();
    setConnectPending(true);

    try {
      if (isTelegramMiniApp() || !privyConnectFlow) {
        return await wagmiConnect();
      }

      await waitUntil(() => privyReadyRef.current, 12_000, "Wallet login");

      if (!authenticated) {
        await login();
      }

      try {
        await waitUntil(
          () => walletsReadyRef.current && walletsRef.current.length > 0,
          15_000,
          "Wallet selection",
        );
      } catch {
        return await wagmiConnect();
      }

      const wallet =
        walletsRef.current.find((w) => w.walletClientType !== "privy") ??
        walletsRef.current.find((w) => w.walletClientType === "privy") ??
        walletsRef.current[0];

      if (wallet) {
        await setActiveWallet(wallet);
        return wallet.address as `0x${string}`;
      }

      return await wagmiConnect();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not connect wallet";
      setConnectError(message);
      throw error;
    } finally {
      setConnectPending(false);
    }
  }, [
    address,
    authenticated,
    clearConnectError,
    login,
    privyConnectFlow,
    setActiveWallet,
    wagmiConnect,
  ]);

  return {
    connectWallet,
    connectPending,
    connectError,
    clearConnectError: () => {
      setConnectError(null);
      clearConnectError();
    },
  };
}
