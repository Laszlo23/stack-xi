import type { ConnectedWallet } from "@privy-io/react-auth";

/** Prefer external wallets over Privy embedded wallet when multiple are linked. */
export function pickEthereumWallet(wallets: ConnectedWallet[]): ConnectedWallet | undefined {
  const ethereum = wallets.filter((w) => w.type === "ethereum");
  return (
    ethereum.find((w) => w.walletClientType !== "privy") ??
    ethereum.find((w) => w.walletClientType === "privy") ??
    ethereum[0] ??
    wallets[0]
  );
}

export function walletConnectorId(wallet: ConnectedWallet): string {
  return wallet.walletClientType === "privy"
    ? `${wallet.meta.id}.${wallet.address}`
    : wallet.meta.id;
}
