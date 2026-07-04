import { WagmiProvider, createConfig, http, type Config } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import type { ReactNode } from "react";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim();
const siteUrl = (import.meta.env.VITE_SITE_URL ?? "https://pepe.buildingcultureid.space").replace(
  /\/$/,
  "",
);

type EthereumProvider = {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isRabby?: boolean;
  isBraveWallet?: boolean;
  isPhantom?: boolean;
  isTon?: boolean;
  isTON?: boolean;
  ton?: boolean;
  isTelegram?: boolean;
  request?: (args: { method: string }) => Promise<unknown>;
};

/** Skip TON / Telegram / non-EVM wallets that hijack window.ethereum. */
export function isEvmInjectedProvider(provider: EthereumProvider | undefined): boolean {
  if (!provider?.request) return false;
  if (provider.isTon || provider.isTON || provider.ton) return false;
  if (provider.isTelegram) return false;
  return true;
}

export function getBrowserEthereumProvider(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  const eth = window.ethereum as EthereumProvider | undefined;
  if (!eth) return undefined;

  const providers = (eth as EthereumProvider & { providers?: EthereumProvider[] }).providers;
  if (Array.isArray(providers)) {
    return providers.find(isEvmInjectedProvider) ?? providers.find((p) => p.request);
  }

  return isEvmInjectedProvider(eth) ? eth : undefined;
}

/** Build connector list once — shared by Privy and plain wagmi configs. */
export function buildConnectors() {
  const evmProvider = typeof window !== "undefined" ? getBrowserEthereumProvider() : undefined;

  const walletConnectConnector = walletConnectProjectId
    ? walletConnect({
        projectId: walletConnectProjectId,
        showQrModal: true,
        metadata: {
          name: "STACK XI",
          description: "World Cup predictions + squad mint on Base",
          url: siteUrl,
          icons: [`${siteUrl}/favicon-32.png`],
        },
      })
    : null;

  return [
    injected({
      shimDisconnect: true,
      target: evmProvider ? () => ({ id: "injected-evm", name: "Browser wallet", provider: evmProvider }) : undefined,
    }),
    coinbaseWallet({ appName: "STACK XI" }),
    ...(walletConnectConnector ? [walletConnectConnector] : []),
  ];
}

/** Client-only wagmi config — avoids SSR/client duplicate instances with empty connectors. */
export function createWagmiConfig(): Config {
  return createConfig({
    chains: [base],
    connectors: buildConnectors(),
    multiInjectedProviderDiscovery: false,
    ssr: false,
    transports: {
      [base.id]: http(),
    },
  });
}

export function BaseWagmiProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: Config;
}) {
  return (
    <WagmiProvider config={config} reconnectOnMount>
      {children}
    </WagmiProvider>
  );
}

export { walletConnectProjectId };
