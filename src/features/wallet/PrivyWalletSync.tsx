import { useEffect, useRef } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import type { Config } from "wagmi";
import { useAccount, useConfig } from "wagmi";
import { getAccount, getConnectors } from "wagmi/actions";
import { base } from "wagmi/chains";
import { switchChain } from "wagmi/actions";
import { pickEthereumWallet, walletConnectorId } from "@/lib/base/privy-wallet-utils";
import { isPrivyEnabled } from "@/lib/base/privy-config";

async function syncPrivyWalletToWagmi(
  config: Config,
  wallet: NonNullable<ReturnType<typeof pickEthereumWallet>>,
  setActiveWallet: ReturnType<typeof useSetActiveWallet>["setActiveWallet"],
): Promise<void> {
  const expectedId = walletConnectorId(wallet);

  const connectorDeadline = Date.now() + 12_000;
  while (Date.now() < connectorDeadline) {
    if (getConnectors(config).some((c) => c.id === expectedId)) break;
    await new Promise((r) => setTimeout(r, 100));
  }

  await setActiveWallet(wallet);

  const syncDeadline = Date.now() + 12_000;
  while (Date.now() < syncDeadline) {
    const account = getAccount(config);
    if (account.isConnected && account.address) break;
    await new Promise((r) => setTimeout(r, 100));
  }

  if (getAccount(config).chainId !== base.id) {
    try {
      await switchChain(config, { chainId: base.id });
    } catch {
      // User may decline chain switch — balance reads still work on Base RPC.
    }
  }
}

/** Re-sync Privy session → wagmi on refresh so balances and txs use the right address. */
export function PrivyWalletSync() {
  const config = useConfig();
  const { authenticated, ready: privyReady } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { isConnected, address, chainId } = useAccount();
  const retriedRef = useRef(false);

  useEffect(() => {
    if (!isPrivyEnabled() || !privyReady || !walletsReady || !authenticated) return;

    const wallet = pickEthereumWallet(wallets);
    if (!wallet?.address) return;

    const needsAddressSync =
      !isConnected || !address || address.toLowerCase() !== wallet.address.toLowerCase();
    const needsChainSync = chainId !== undefined && chainId !== base.id;

    if (!needsAddressSync && !needsChainSync) {
      retriedRef.current = false;
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        await syncPrivyWalletToWagmi(config, wallet, setActiveWallet);
        if (cancelled) return;
        retriedRef.current = false;
      } catch {
        if (cancelled || retriedRef.current) return;
        retriedRef.current = true;
        await new Promise((r) => setTimeout(r, 1_500));
        if (cancelled) return;
        try {
          await syncPrivyWalletToWagmi(config, wallet, setActiveWallet);
        } catch {
          // Connect flow handles explicit user-initiated sync errors.
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    privyReady,
    walletsReady,
    authenticated,
    wallets,
    isConnected,
    address,
    chainId,
    setActiveWallet,
    config,
  ]);

  return null;
}
