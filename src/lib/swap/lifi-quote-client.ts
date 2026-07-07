import type { LiFiStep } from "@lifi/sdk";
import { getDefaultLifiBccDestination } from "@/lib/swap/lifi-config";

/** Valid address for price-only LI.FI quotes (no wallet required). */
export const LIFI_QUOTE_PREVIEW_ADDRESS =
  "0x0000000000000000000000000000000000000001" as const;

export type LifiQuoteRequest = {
  fromChain: number;
  fromToken: string;
  fromAmount: string;
  fromAddress?: string;
  toAddress?: string;
  slippage?: number;
};

export async function fetchLifiQuote(
  params: LifiQuoteRequest,
  signal?: AbortSignal,
): Promise<LiFiStep> {
  const destination = getDefaultLifiBccDestination();
  const url = new URL("/api/lifi/quote", window.location.origin);
  url.searchParams.set("fromChain", String(params.fromChain));
  url.searchParams.set("toChain", String(destination.toChain));
  url.searchParams.set("fromToken", params.fromToken);
  url.searchParams.set("toToken", destination.toToken);
  url.searchParams.set("fromAmount", params.fromAmount);
  url.searchParams.set(
    "fromAddress",
    params.fromAddress ?? LIFI_QUOTE_PREVIEW_ADDRESS,
  );
  if (params.toAddress) {
    url.searchParams.set("toAddress", params.toAddress);
  }
  if (params.slippage != null) {
    url.searchParams.set("slippage", String(params.slippage));
  }

  const res = await fetch(url.toString(), { signal });
  const data = (await res.json()) as LiFiStep | { error?: string };
  if (!res.ok) {
    const message =
      "error" in data && data.error ? data.error : `Quote failed (${res.status})`;
    throw new Error(message);
  }
  return data as LiFiStep;
}
