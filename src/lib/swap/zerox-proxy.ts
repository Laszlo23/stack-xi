import type {
  ZeroXPriceParams,
  ZeroXPriceResponse,
  ZeroXQuoteParams,
  ZeroXQuoteResponse,
} from "./zerox-types";
import { fetchZeroXWithX402, getSwapMode, isX402PayerConfigured } from "./zerox-x402-server";

const ZEROX_BASE = "https://api.0x.org";

function getApiKey(): string {
  const key = process.env.ZEROX_API_KEY;
  if (!key) {
    throw new Error("ZEROX_API_KEY is not configured");
  }
  return key;
}

function buildSearchParams(params: ZeroXPriceParams | ZeroXQuoteParams): URLSearchParams {
  const search = new URLSearchParams({
    chainId: "8453",
    sellToken: params.sellToken,
    buyToken: params.buyToken,
    sellAmount: params.sellAmount,
    taker: params.taker,
  });
  if (params.slippageBps != null) {
    search.set("slippageBps", String(params.slippageBps));
  }
  return search;
}

async function fetchZeroXWithApiKey<T>(
  path: string,
  params: ZeroXPriceParams | ZeroXQuoteParams,
): Promise<T> {
  const url = `${ZEROX_BASE}${path}?${buildSearchParams(params).toString()}`;
  const response = await fetch(url, {
    headers: {
      "0x-api-key": getApiKey(),
      "0x-version": "v2",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`0x API ${response.status}: ${body.slice(0, 200)}`);
  }

  return (await response.json()) as T;
}

async function fetchZeroX<T>(
  path: string,
  params: ZeroXPriceParams | ZeroXQuoteParams,
): Promise<T> {
  const mode = getSwapMode();
  if (mode === "api_key") {
    return fetchZeroXWithApiKey<T>(path, params);
  }
  if (mode === "x402") {
    return fetchZeroXWithX402<T>(path, params);
  }
  throw new Error("Swap API not configured — use external deeplinks");
}

export async function proxyZeroXPrice(params: ZeroXPriceParams): Promise<ZeroXPriceResponse> {
  return fetchZeroX<ZeroXPriceResponse>("/swap/allowance-holder/price", params);
}

export async function proxyZeroXQuote(params: ZeroXQuoteParams): Promise<ZeroXQuoteResponse> {
  return fetchZeroX<ZeroXQuoteResponse>("/swap/allowance-holder/quote", params);
}

export function isZeroXConfigured(): boolean {
  return getSwapMode() !== "deeplink_only";
}

export { getSwapMode, isX402PayerConfigured };
