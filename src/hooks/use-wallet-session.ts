import { useConnectBaseWallet } from "@/hooks/use-connect-base-wallet";

/** Wallet session: Privy-resolved address counts even while wagmi reconnects after OAuth reload. */
export function useWalletSession() {
  const wallet = useConnectBaseWallet();
  const hasWalletSession = wallet.isConnected || Boolean(wallet.address);
  const canSign = wallet.isConnected;

  return {
    ...wallet,
    hasWalletSession,
    canSign,
  };
}
