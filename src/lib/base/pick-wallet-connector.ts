import type { Connector } from "wagmi";
import { UserRejectedRequestError } from "viem";

export function isInjectedProviderAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}

export function findWalletConnector(
  connectors: readonly Connector[],
  id: string,
): Connector | undefined {
  return connectors.find((connector) => connector.id === id);
}

export function getWalletConnectConnector(connectors: readonly Connector[]): Connector | undefined {
  return findWalletConnector(connectors, "walletConnect");
}

function getCoinbaseConnector(connectors: readonly Connector[]): Connector | undefined {
  return (
    findWalletConnector(connectors, "coinbaseWalletSDK") ??
    findWalletConnector(connectors, "coinbaseWallet")
  );
}

/** Ordered list — try each until one connects. */
export function getWalletConnectorsInOrder(
  connectors: readonly Connector[],
  options: { preferWalletConnect?: boolean } = {},
): Connector[] {
  if (connectors.length === 0) return [];

  const walletConnect = getWalletConnectConnector(connectors);
  const injected = findWalletConnector(connectors, "injected");
  const coinbase = getCoinbaseConnector(connectors);

  const ordered: Connector[] = [];

  if (options.preferWalletConnect) {
    if (walletConnect) ordered.push(walletConnect);
    if (coinbase) ordered.push(coinbase);
    if (injected) ordered.push(injected);
  } else {
    if (injected) ordered.push(injected);
    if (coinbase) ordered.push(coinbase);
    if (walletConnect) ordered.push(walletConnect);
  }

  if (ordered.length > 0) return ordered;

  return [...connectors];
}

/** @deprecated Prefer getWalletConnectorsInOrder + sequential connect attempts. */
export function pickWalletConnector(
  connectors: readonly Connector[],
  options: { preferWalletConnect?: boolean } = {},
): Connector | undefined {
  return getWalletConnectorsInOrder(connectors, options)[0];
}

export function isWalletConnectUserRejection(error: unknown): boolean {
  if (error instanceof UserRejectedRequestError) return true;
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("rejected") ||
      message.includes("denied") ||
      message.includes("cancel") ||
      message.includes("declined")
    );
  }
  return false;
}

export function formatWalletConnectError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Could not connect wallet";
}
