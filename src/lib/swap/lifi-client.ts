import { createClient, type SDKClient } from "@lifi/sdk";
import { EthereumProvider } from "@lifi/sdk-provider-ethereum";
import { getWalletClient, switchChain } from "@wagmi/core";
import type { Config } from "wagmi";
import { getLifiIntegrator, getLifiIntegratorFee } from "@/lib/swap/lifi-config";
import { lifiRpcUrls } from "@/lib/swap/lifi-wagmi-chains";

const DEFAULT_SLIPPAGE = 0.03;

let cachedClient: SDKClient | null = null;
let cachedConfig: Config | null = null;

export function getLifiApiBase(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/lifi/v1`;
  }
  return "/api/lifi/v1";
}

export function getLifiClient(wagmiConfig: Config): SDKClient {
  if (cachedClient && cachedConfig === wagmiConfig) {
    return cachedClient;
  }

  const fee = getLifiIntegratorFee();
  const client = createClient({
    integrator: getLifiIntegrator(),
    apiUrl: getLifiApiBase(),
    rpcUrls: lifiRpcUrls(),
    routeOptions: {
      slippage: DEFAULT_SLIPPAGE,
      ...(fee != null ? { fee } : {}),
    },
  });

  client.setProviders([
    EthereumProvider({
      getWalletClient: async ({ chainId }) => {
        const walletClient = await getWalletClient(wagmiConfig, chainId ? { chainId } : undefined);
        if (!walletClient) {
          throw new Error("Connect your wallet to swap");
        }
        return walletClient;
      },
      switchChain: async (chainId) => {
        const chain = await switchChain(wagmiConfig, { chainId });
        return getWalletClient(wagmiConfig, { chainId: chain.id });
      },
    }),
  ]);

  cachedClient = client;
  cachedConfig = wagmiConfig;
  return client;
}
