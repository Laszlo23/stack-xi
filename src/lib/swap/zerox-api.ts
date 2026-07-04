import { BASE_CHAIN_ID } from "@/lib/base/config";
import { DEFAULT_SWAP_SLIPPAGE } from "@/lib/swap/swap-config";
import type {
  ZeroXPriceParams,
  ZeroXPriceResponse,
  ZeroXQuoteParams,
  ZeroXQuoteResponse,
} from "./zerox-types";

export type { ZeroXPriceParams, ZeroXPriceResponse, ZeroXQuoteParams, ZeroXQuoteResponse };

function slippageBps(slippagePercent = DEFAULT_SWAP_SLIPPAGE): number {
  return Math.round(slippagePercent * 100);
}

export async function fetchZeroXPrice(params: ZeroXPriceParams): Promise<ZeroXPriceResponse> {
  const search = new URLSearchParams({
    chainId: String(BASE_CHAIN_ID),
    sellToken: params.sellToken,
    buyToken: params.buyToken,
    sellAmount: params.sellAmount,
    taker: params.taker,
    slippageBps: String(params.slippageBps ?? slippageBps()),
  });

  const response = await fetch(`/api/swap/price?${search.toString()}`);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Price fetch failed (${response.status})`);
  }
  return (await response.json()) as ZeroXPriceResponse;
}

export async function fetchZeroXQuote(params: ZeroXQuoteParams): Promise<ZeroXQuoteResponse> {
  const search = new URLSearchParams({
    chainId: String(BASE_CHAIN_ID),
    sellToken: params.sellToken,
    buyToken: params.buyToken,
    sellAmount: params.sellAmount,
    taker: params.taker,
    slippageBps: String(params.slippageBps ?? slippageBps()),
  });

  const response = await fetch(`/api/swap/quote?${search.toString()}`);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Quote fetch failed (${response.status})`);
  }
  return (await response.json()) as ZeroXQuoteResponse;
}
