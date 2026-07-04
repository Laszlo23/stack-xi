import { useCallback, useRef, useState } from "react";
import {
  useActiveWallet,
  useLogin,
  usePrivy,
  useWallets,
  type ConnectedWallet,
} from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { useConfig } from "wagmi";
import { getAccount, switchChain } from "wagmi/actions";
import { base } from "wagmi/chains";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import { isPrivyEnabled } from "@/lib/base/privy-config";
import {
  formatWalletConnectError,
  isWalletConnectUserRejection,
} from "@/lib/base/pick-wallet-connector";
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

function pickEthereumWallet(wallets: ConnectedWallet[]): ConnectedWallet | undefined {
  const ethereum = wallets.filter((w) => w.type === "ethereum");
  return (
    ethereum.find((w) => w.walletClientType !== "privy") ??
    ethereum.find((w) => w.walletClientType === "privy") ??
    ethereum[0] ??
    wallets[0]
  );
}

export function usePrivyBaseConnect() {
  const config = useConfig();
  const privyConnectFlow = shouldUsePrivyConnectFlow() && isPrivyEnabled();
  const { authenticated, ready: privyReady } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { connect: privyWalletConnect } = useActiveWallet();
  const { setActiveWallet } = useSetActiveWallet();
  const { address, connectWallet: wagmiConnect, clearConnectError } = useBaseWallet();
  const [connectPending, setConnectPending] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const loginWaiterRef = useRef<{
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  const { login } = useLogin({
    onComplete: () => {
      loginWaiterRef.current?.resolve();
      loginWaiterRef.current = null;
    },
    onError: (error) => {
      loginWaiterRef.current?.reject(new Error(String(error)));
      loginWaiterRef.current = null;
    },
  });

  const privyReadyRef = useRef(privyReady);
  const walletsReadyRef = useRef(walletsReady);
  const walletsRef = useRef(wallets);
  const authenticatedRef = useRef(authenticated);
  privyReadyRef.current = privyReady;
  walletsReadyRef.current = walletsReady;
  walletsRef.current = wallets;
  authenticatedRef.current = authenticated;

  const syncPrivyWalletToWagmi = useCallback(
    async (wallet: ConnectedWallet): Promise<`0x${string}`> => {
      await setActiveWallet(wallet);

      await waitUntil(() => {
        const account = getAccount(config);
        return account.isConnected && Boolean(account.address);
      }, 12_000, "Wallet sync");

      const account = getAccount(config);
      if (account.chainId !== base.id) {
        try {
          await switchChain(config, { chainId: base.id });
        } catch (chainError) {
          if (!isWalletConnectUserRejection(chainError)) {
            throw new Error("Switch your wallet to Base network, then try again.");
          }
          throw chainError;
        }
      }

      const synced = getAccount(config).address;
      if (!synced) {
        throw new Error("Wallet connected in Privy but not synced — refresh and try again.");
      }

      return synced;
    },
    [config, setActiveWallet],
  );

  const waitForPrivyLogin = useCallback((): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      loginWaiterRef.current = { resolve, reject };
      login({ loginMethods: ["wallet"] });
    });
  }, [login]);

  const connectWallet = useCallback(async (): Promise<`0x${string}`> => {
    const active = getAccount(config).address ?? address;
    if (active) return active;

    setConnectError(null);
    clearConnectError();
    setConnectPending(true);

    try {
      if (isTelegramMiniApp() || !privyConnectFlow) {
        return await wagmiConnect();
      }

      await waitUntil(() => privyReadyRef.current, 12_000, "Wallet service");

      if (authenticatedRef.current && walletsReadyRef.current && walletsRef.current.length > 0) {
        const existing = pickEthereumWallet(walletsRef.current);
        if (existing) {
          return await syncPrivyWalletToWagmi(existing);
        }
      }

      const connectResult = await privyWalletConnect();
      if (connectResult.wallet && connectResult.wallet.type === "ethereum") {
        return await syncPrivyWalletToWagmi(connectResult.wallet as ConnectedWallet);
      }

      if (!authenticatedRef.current) {
        await waitForPrivyLogin();
      }

      await waitUntil(
        () => walletsReadyRef.current && walletsRef.current.length > 0,
        20_000,
        "Wallet selection",
      );

      const wallet = pickEthereumWallet(walletsRef.current);
      if (!wallet) {
        throw new Error("No wallet found after login — connect an external wallet or create one.");
      }

      return await syncPrivyWalletToWagmi(wallet);
    } catch (error) {
      if (!isWalletConnectUserRejection(error)) {
        const message = formatWalletConnectError(error);
        setConnectError(message);
      }
      throw error;
    } finally {
      setConnectPending(false);
    }
  }, [
    address,
    clearConnectError,
    config,
    privyConnectFlow,
    privyWalletConnect,
    syncPrivyWalletToWagmi,
    waitForPrivyLogin,
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
