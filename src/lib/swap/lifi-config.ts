import { BCC_TOKEN_ADDRESS, USDC_ADDRESS } from "@/lib/base/config";
import { ETH_PLACEHOLDER } from "@/lib/swap/swap-config";

export const LIFI_API_BASE = "https://li.quest/v1";

export const BASE_CHAIN_ID = 8453;

/** Chains allowed as LI.FI source/destination in STACK XI. */
export const LIFI_ALLOWED_CHAIN_IDS = [1, 10, 137, 42161, 8453] as const;

export type LifiAllowedChainId = (typeof LIFI_ALLOWED_CHAIN_IDS)[number];

/** USDC on supported chains (same address on most L2s). */
export const LIFI_USDC_BY_CHAIN: Record<LifiAllowedChainId, string> = {
  1: USDC_ADDRESS,
  10: "0x0b2C639c533813f4Aa9D7837BAfA34ae11A12F9",
  137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  8453: USDC_ADDRESS,
};

export const LIFI_NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";

const ALLOWED_TO_TOKENS_BASE = new Set([
  BCC_TOKEN_ADDRESS.toLowerCase(),
  USDC_ADDRESS.toLowerCase(),
]);

export function getLifiIntegrator(): string {
  return import.meta.env.VITE_LIFI_INTEGRATOR?.trim() || "stack-xi";
}

export function getLifiIntegratorFee(): number | undefined {
  const raw = import.meta.env.VITE_LIFI_FEE?.trim();
  if (!raw) return undefined;
  const fee = Number.parseFloat(raw);
  if (!Number.isFinite(fee) || fee <= 0 || fee > 0.1) return undefined;
  return fee;
}

export function isLifiSwapEnabled(): boolean {
  const flag = import.meta.env.VITE_LIFI_SWAP_ENABLED?.trim();
  if (flag === "0" || flag === "false") return false;
  return true;
}

export function isLifiConfigured(): boolean {
  const key = process.env.LIFI_API_KEY?.trim();
  return Boolean(key && key.length > 8);
}

export function getLifiApiKey(): string | undefined {
  return process.env.LIFI_API_KEY?.trim() || undefined;
}

export function getLifiHeaders(): Record<string, string> {
  const key = getLifiApiKey();
  if (!key) return {};
  return { "x-lifi-api-key": key };
}

export function isAllowedLifiChain(chainId: number): chainId is LifiAllowedChainId {
  return (LIFI_ALLOWED_CHAIN_IDS as readonly number[]).includes(chainId);
}

export function isAllowedLifiToToken(chainId: number, token: string): boolean {
  if (chainId !== BASE_CHAIN_ID) return false;
  const normalized = token.toLowerCase();
  return ALLOWED_TO_TOKENS_BASE.has(normalized);
}

export function isAllowedLifiFromToken(chainId: number, token: string): boolean {
  if (!isAllowedLifiChain(chainId)) return false;
  const normalized = token.toLowerCase();
  if (normalized === LIFI_NATIVE_TOKEN.toLowerCase()) return true;
  if (normalized === ETH_PLACEHOLDER.toLowerCase()) return true;
  const usdc = LIFI_USDC_BY_CHAIN[chainId]?.toLowerCase();
  return Boolean(usdc && normalized === usdc);
}

export const MAX_LIFI_FROM_AMOUNT_DIGITS = 30;

export function validateLifiFromAmount(
  fromAmount: string,
): { ok: true } | { ok: false; error: string } {
  if (!/^\d+$/.test(fromAmount)) {
    return { ok: false, error: "fromAmount must be a positive integer string" };
  }
  if (fromAmount === "0") {
    return { ok: false, error: "fromAmount must be greater than zero" };
  }
  if (fromAmount.length > MAX_LIFI_FROM_AMOUNT_DIGITS) {
    return { ok: false, error: "fromAmount too large" };
  }
  return { ok: true };
}

export function validateLifiAddress(
  address: string,
): { ok: true } | { ok: false; error: string } {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { ok: false, error: "invalid address" };
  }
  return { ok: true };
}

export function getDefaultLifiBccDestination(): {
  toChain: number;
  toToken: string;
} {
  return {
    toChain: BASE_CHAIN_ID,
    toToken: BCC_TOKEN_ADDRESS,
  };
}
