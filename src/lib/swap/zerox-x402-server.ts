/**
 * Server-only: fetch 0x Swap API via x402 micropayments (project payer wallet).
 * Requires X402_SWAP_PAYER_PRIVATE_KEY with USDC on Base.
 */

import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";
import type { ZeroXPriceParams, ZeroXQuoteParams } from "./zerox-types";

const ZEROX_BASE = "https://api.0x.org";

let cachedFetch: typeof fetch | null = null;

function getX402Fetch(): typeof fetch {
  if (cachedFetch) return cachedFetch;

  const key = process.env.X402_SWAP_PAYER_PRIVATE_KEY;
  if (!key?.startsWith("0x")) {
    throw new Error("X402_SWAP_PAYER_PRIVATE_KEY is not configured");
  }

  const account = privateKeyToAccount(key as `0x${string}`);
  const client = new x402Client().register("eip155:8453", new ExactEvmScheme(account));
  cachedFetch = wrapFetchWithPayment(fetch, client);
  return cachedFetch;
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

export function isX402PayerConfigured(): boolean {
  return Boolean(process.env.X402_SWAP_PAYER_PRIVATE_KEY?.startsWith("0x"));
}

export type SwapMode = "api_key" | "x402" | "deeplink_only";

export function getSwapMode(): SwapMode {
  if (process.env.ZEROX_API_KEY) return "api_key";
  if (isX402PayerConfigured()) return "x402";
  return "deeplink_only";
}

export async function fetchZeroXWithX402<T>(
  path: string,
  params: ZeroXPriceParams | ZeroXQuoteParams,
): Promise<T> {
  const paidFetch = getX402Fetch();
  const url = `${ZEROX_BASE}${path}?${buildSearchParams(params).toString()}`;

  const response = await paidFetch(url, {
    headers: {
      "0x-version": "v2",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 402) {
      throw new Error("x402_payment_required: fund payer wallet with USDC on Base");
    }
    throw new Error(`0x x402 ${response.status}: ${body.slice(0, 200)}`);
  }

  return (await response.json()) as T;
}
