/**
 * Server-only: fetch 0x Swap API via x402 micropayments.
 * Payer priority: CDP API wallet → Alchemy/local EVM wallet (PRIVATE_KEY or ALCHEMY_WALLET_KEY).
 */

import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount, type LocalAccount } from "viem/accounts";
import {
  assertAlchemyPayerAddressMatch,
  getAlchemyX402PayerSource,
  getExpectedAlchemyPayerAddress,
  getServerBaseRpcUrl,
  isAlchemyX402PayerConfigured,
  resolveAlchemyX402PayerKey,
} from "@/lib/server/alchemy-config";
import { isCdpConfigured } from "@/lib/server/cdp-config";
import { getCdpSwapPayerSigner } from "@/lib/server/cdp-swap-payer";
import type { ZeroXPriceParams, ZeroXQuoteParams } from "./zerox-types";

const ZEROX_BASE = "https://api.0x.org";
const BASE_NETWORK = "eip155:8453" as const;

let cachedFetch: typeof fetch | null = null;
let initPromise: Promise<typeof fetch> | null = null;

async function resolveX402Signer(): Promise<LocalAccount> {
  if (isCdpConfigured()) {
    return getCdpSwapPayerSigner();
  }

  const key = resolveAlchemyX402PayerKey();
  if (!key) {
    throw new Error(
      "x402 payer not configured — set ALCHEMY_WALLET_KEY or PRIVATE_KEY (with ALCHEMY_API_KEY), or CDP credentials",
    );
  }

  const account = privateKeyToAccount(key);
  assertAlchemyPayerAddressMatch(account.address);
  return account;
}

async function buildX402Fetch(): Promise<typeof fetch> {
  const signer = await resolveX402Signer();
  const client = new x402Client();
  registerExactEvmScheme(client, {
    signer,
    networks: [BASE_NETWORK],
    schemeOptions: {
      8453: { rpcUrl: getServerBaseRpcUrl() },
    },
  });
  return wrapFetchWithPayment(fetch, client);
}

async function getX402Fetch(): Promise<typeof fetch> {
  if (cachedFetch) return cachedFetch;
  if (!initPromise) {
    initPromise = buildX402Fetch();
  }
  cachedFetch = await initPromise;
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
  return isCdpConfigured() || isAlchemyX402PayerConfigured();
}

export type X402PayerKind = "cdp" | "alchemy" | "hot_wallet" | null;

export function getX402PayerKind(): X402PayerKind {
  if (isCdpConfigured()) return "cdp";
  const source = getAlchemyX402PayerSource();
  if (source === "dedicated") return "hot_wallet";
  if (source === "alchemy_wallet" || source === "private_key") return "alchemy";
  return null;
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
  const paidFetch = await getX402Fetch();
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
      const payer = getX402PayerKind();
      throw new Error(
        payer === "cdp"
          ? "x402_payment_required: fund the CDP swap payer wallet with USDC on Base"
          : "x402_payment_required: fund the Alchemy x402 payer wallet with USDC on Base",
      );
    }
    throw new Error(`0x x402 ${response.status}: ${body.slice(0, 200)}`);
  }

  return (await response.json()) as T;
}

/** Smoke-test CDP client init without making a paid 0x call. */
export async function probeCdpSwapPayer(): Promise<{ address: `0x${string}`; name: string }> {
  if (!isCdpConfigured()) {
    throw new Error("CDP credentials are not configured");
  }
  const signer = await getCdpSwapPayerSigner();
  return {
    address: signer.address,
    name: process.env.CDP_SWAP_PAYER_ACCOUNT_NAME?.trim() || "stack-xi-x402-payer",
  };
}

/** Resolve Alchemy/local x402 payer address without a paid 0x call. */
export function probeAlchemySwapPayer(): {
  address: `0x${string}`;
  source: NonNullable<ReturnType<typeof getAlchemyX402PayerSource>>;
  rpcUrl: string;
  expectedAddress: `0x${string}` | null;
} {
  const key = resolveAlchemyX402PayerKey();
  const source = getAlchemyX402PayerSource();
  if (!key || !source) {
    throw new Error("Alchemy x402 payer key not configured");
  }
  const account = privateKeyToAccount(key);
  assertAlchemyPayerAddressMatch(account.address);
  return {
    address: account.address,
    source,
    rpcUrl: getServerBaseRpcUrl(),
    expectedAddress: getExpectedAlchemyPayerAddress(),
  };
}
