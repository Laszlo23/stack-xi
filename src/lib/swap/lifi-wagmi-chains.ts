import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains";
import { http, type Transport } from "viem";
import type { LifiAllowedChainId } from "@/lib/swap/lifi-config";
import { getLifiChainRpcUrl } from "@/lib/swap/lifi-chain-rpc";

/** Chains supported for LI.FI cross-chain swaps (wagmi + viem). */
export const LIFI_WAGMI_CHAINS = [base, mainnet, arbitrum, optimism, polygon] as const;

export const LIFI_CHAIN_LABELS: Record<LifiAllowedChainId, string> = {
  [base.id]: "Base",
  [mainnet.id]: "Ethereum",
  [arbitrum.id]: "Arbitrum",
  [optimism.id]: "Optimism",
  [polygon.id]: "Polygon",
};

export function buildLifiWagmiTransports(): Record<number, Transport> {
  const transports: Record<number, Transport> = {};
  for (const chain of LIFI_WAGMI_CHAINS) {
    transports[chain.id] = http(getLifiChainRpcUrl(chain.id as LifiAllowedChainId));
  }
  return transports;
}

export function lifiRpcUrls(): Partial<Record<number, string[]>> {
  const urls: Partial<Record<number, string[]>> = {};
  for (const chain of LIFI_WAGMI_CHAINS) {
    urls[chain.id] = [getLifiChainRpcUrl(chain.id as LifiAllowedChainId)];
  }
  return urls;
}
