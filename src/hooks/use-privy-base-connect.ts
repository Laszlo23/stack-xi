import { useCallback, useRef, useState } from "react";
import {
  useConnectWallet,
  useLogin,
  usePrivy,
  useWallets,
  type ConnectedWallet,
} from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { useConfig } from "wagmi";
import { getAccount, getConnectors, switchChain } from "wagmi/actions";
import { base } from "wagmi/chains";
import { useBaseWallet } from "@/hooks/use-base-wallet";
import {
  formatWalletConnectError,
  isWalletConnectUserRejection,
} from "@/lib/base/pick-wallet-connector";

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

function walletConnectorId(wallet: ConnectedWallet): string {
  return wallet.walletClientType === "privy"
    ? `${wallet.meta.id}.${wallet.address}`
    : wallet.meta.id;
}

export function usePrivyBaseConnect() {
  const config = useConfig();
  const { authenticated, ready: privyReady } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { address, clearConnectError } = useBaseWallet();
  const [connectPending, setConnectPending] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const loginWaiterRef = useRef<{
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  const connectModalWaiterRef = useRef<{
    resolve: (wallet: ConnectedWallet) => void;
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

  const { connectWallet: openConnectWalletModal } = useConnectWallet({
    onSuccess: ({ wallet }) => {
      if (wallet?.type === "ethereum") {
        connectModalWaiterRef.current?.resolve(wallet as ConnectedWallet);
      } else {
        connectModalWaiterRef.current?.reject(
          new Error("Connect an Ethereum wallet on Base to continue."),
        );
      }
      connectModalWaiterRef.current = null;
    },
    onError: (error) => {
      connectModalWaiterRef.current?.reject(new Error(String(error)));
      connectModalWaiterRef.current = null;
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

  const waitForWalletConnector = useCallback(
    async (wallet: ConnectedWallet): Promise<void> => {
      const expectedId = walletConnectorId(wallet);
      await waitUntil(
        () => getConnectors(config).some((connector) => connector.id === expectedId),
        15_000,
        "Privy connector setup",
      );
    },
    [config],
  );

  const syncPrivyWalletToWagmi = useCallback(
    async (wallet: ConnectedWallet): Promise<`0x${string}`> => {
      await waitForWalletConnector(wallet);
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
    [config, setActiveWallet, waitForWalletConnector],
  );

  const waitForPrivyLogin = useCallback((): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      loginWaiterRef.current = { resolve, reject };
      login({ loginMethods: ["wallet"] });
    });
  }, [login]);

  const promptConnectWallet = useCallback((): Promise<ConnectedWallet> => {
    return new Promise<ConnectedWallet>((resolve, reject) => {
      connectModalWaiterRef.current = { resolve, reject };
      openConnectWalletModal();
    });
  }, [openConnectWalletModal]);

  const connectWallet = useCallback(async (): Promise<`0x${string}`> => {
    const active = getAccount(config).address ?? address;
    if (active) return active;

    setConnectError(null);
    clearConnectError();
    setConnectPending(true);

    try {
      await waitUntil(() => privyReadyRef.current, 20_000, "Wallet service");

      if (authenticatedRef.current && walletsRef.current.length > 0) {
        if (!walletsReadyRef.current) {
          await waitUntil(() => walletsReadyRef.current, 8_000, "Wallet list");
        }
        const existing = pickEthereumWallet(walletsRef.current);
        if (existing) {
          return await syncPrivyWalletToWagmi(existing);
        }
      }

      try {
        const connectedWallet = await promptConnectWallet();
        return await syncPrivyWalletToWagmi(connectedWallet);
      } catch (modalError) {
        if (isWalletConnectUserRejection(modalError)) {
          throw modalError;
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
          throw new Error(
            "No wallet found after login — connect an external wallet or create one.",
          );
        }

        return await syncPrivyWalletToWagmi(wallet);
      }
    } catch (error) {
      if (!isWalletConnectUserRejection(error)) {
        const message = formatWalletConnectError(error);
        setConnectError(message);
      }
      throw error;
    } finally {
      setConnectPending(false);
    }
  }, [address, clearConnectError, config, promptConnectWallet, syncPrivyWalletToWagmi, waitForPrivyLogin]);

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
