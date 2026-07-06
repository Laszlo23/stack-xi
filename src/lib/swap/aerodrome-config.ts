import { BCC_TOKEN_ADDRESS, USDC_ADDRESS } from "@/lib/base/config";
import type { SwapPreset } from "@/lib/swap/swap-config";

/** Aerodrome Router on Base mainnet */
export const AERODROME_ROUTER_ADDRESS =
  "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43" as const;

export const WETH_ON_BASE = "0x4200000000000000000000000000000000000006" as const;

/** Router uses defaultFactory when factory is zero address */
export const AERODROME_DEFAULT_FACTORY = "0x0000000000000000000000000000000000000000" as const;

export type AerodromeRoute = {
  from: `0x${string}`;
  to: `0x${string}`;
  stable: boolean;
  factory: `0x${string}`;
};

export const AERODROME_ROUTER_ABI = [
  {
    type: "function",
    name: "getAmountsOut",
    stateMutability: "view",
    inputs: [
      { name: "amountIn", type: "uint256" },
      {
        name: "routes",
        type: "tuple[]",
        components: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "stable", type: "bool" },
          { name: "factory", type: "address" },
        ],
      },
    ],
    outputs: [{ type: "uint256[]" }],
  },
  {
    type: "function",
    name: "swapExactTokensForTokens",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      {
        name: "routes",
        type: "tuple[]",
        components: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "stable", type: "bool" },
          { name: "factory", type: "address" },
        ],
      },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ type: "uint256[]" }],
  },
  {
    type: "function",
    name: "swapExactETHForTokens",
    stateMutability: "payable",
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      {
        name: "routes",
        type: "tuple[]",
        components: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "stable", type: "bool" },
          { name: "factory", type: "address" },
        ],
      },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ type: "uint256[]" }],
  },
] as const;

function volatileHop(from: `0x${string}`, to: `0x${string}`): AerodromeRoute {
  return {
    from,
    to,
    stable: false,
    factory: AERODROME_DEFAULT_FACTORY,
  };
}

export function aerodromeRoutesForPreset(preset: SwapPreset): AerodromeRoute[] {
  switch (preset) {
    case "usdc-bcc":
      return [volatileHop(USDC_ADDRESS, WETH_ON_BASE), volatileHop(WETH_ON_BASE, BCC_TOKEN_ADDRESS)];
    case "eth-bcc":
      return [volatileHop(WETH_ON_BASE, BCC_TOKEN_ADDRESS)];
    default: {
      const _exhaustive: never = preset;
      return _exhaustive;
    }
  }
}

export function minAmountOut(amountOut: bigint, slippagePercent: number): bigint {
  const bps = BigInt(Math.round(slippagePercent * 100));
  return (amountOut * (10_000n - bps)) / 10_000n;
}

export function swapDeadline(secondsFromNow = 1200): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + secondsFromNow);
}
