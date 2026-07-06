import { useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { useAccount, useConfig } from "wagmi";
import { getAccount, getConnectors } from "wagmi/actions";
import { base } from "wagmi/chains";
import { switchChain } from "wagmi/actions";
import { pickEthereumWallet, walletConnectorId } from "@/lib/base/privy-wallet-utils";
import { isPrivyEnabled } from "@/lib/base/privy-config";

/** Re-sync Privy session → wagmi on refresh so balances and txs use the right address. */
export function PrivyWalletSync() {
  const config = useConfig();
  const { authenticated, ready: privyReady } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { isConnected, address, chainId } = useAccount();

  useEffect(() => {
    if (!isPrivyEnabled() || !privyReady || !walletsReady || !authenticated) return;

    const wallet = pickEthereumWallet(wallets);
    if (!wallet?.address) return;

    const needsAddressSync =
      !isConnected || !address || address.toLowerCase() !== wallet.address.toLowerCase();
    const needsChainSync = chainId !== undefined && chainId !== base.id;

    if (!needsAddressSync && !needsChainSync) return;

    let cancelled = false;

    void (async () => {
      try {
        const expectedId = walletConnectorId(wallet);

        const deadline = Date.now() + 12_000;
        while (Date.now() < deadline) {
          if (getConnectors(config).some((c) => c.id === expectedId)) break;
          await new Promise((r) => setTimeout(r, 100));
        }

        if (cancelled) return;

        await setActiveWallet(wallet);

        const syncDeadline = Date.now() + 12_000;
        while (Date.now() < syncDeadline) {
          const account = getAccount(config);
          if (account.isConnected && account.address) break;
          await new Promise((r) => setTimeout(r, 100));
        }

        if (cancelled) return;

        if (getAccount(config).chainId !== base.id) {
          try {
            await switchChain(config, { chainId: base.id });
          } catch {
            // User may decline chain switch — balance reads still work on Base RPC.
          }
        }
      } catch {
        // Connect flow handles explicit user-initiated sync errors.
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
