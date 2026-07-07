import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";
import { getClientBaseRpcUrl } from "@/lib/base/client-rpc";
import type { LifiAllowedChainId } from "@/lib/swap/lifi-config";

function readServerEnv(key: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const value = process.env[key];
  return value?.trim() || undefined;
}

function alchemyRpc(network: string): string | undefined {
  const key = readServerEnv("ALCHEMY_API_KEY");
  if (!key) return undefined;
  return `https://${network}.g.alchemy.com/v2/${key}`;
}

/** Server + client RPC URLs for LI.FI source chains. */
export function getLifiChainRpcUrl(chainId: LifiAllowedChainId): string {
  switch (chainId) {
    case base.id:
      return (
        readServerEnv("BASE_RPC_URL") ||
        readServerEnv("ALCHEMY_BASE_ENDPOINT") ||
        alchemyRpc("base-mainnet") ||
        getClientBaseRpcUrl()
      );
    case mainnet.id:
      return alchemyRpc("eth-mainnet") ?? mainnet.rpcUrls.default.http[0]!;
    case arbitrum.id:
      return alchemyRpc("arb-mainnet") ?? arbitrum.rpcUrls.default.http[0]!;
    case optimism.id:
      return alchemyRpc("opt-mainnet") ?? optimism.rpcUrls.default.http[0]!;
    case polygon.id:
      return alchemyRpc("polygon-mainnet") ?? polygon.rpcUrls.default.http[0]!;
    default: {
      const _exhaustive: never = chainId;
      return _exhaustive;
    }
  }
}
