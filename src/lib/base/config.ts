import { base } from "viem/chains";

export const BASE_CHAIN_ID = Number(import.meta.env.VITE_BASE_CHAIN_ID ?? base.id);

export const USDC_ADDRESS =
  (import.meta.env.VITE_USDC_ADDRESS as `0x${string}`) ??
  ("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const);

export const SQUAD_NFT_ADDRESS = import.meta.env.VITE_SQUAD_NFT_ADDRESS as
  `0x${string}` | undefined;

export const PREDICTION_POOL_ADDRESS = import.meta.env.VITE_PREDICTION_POOL_ADDRESS as
  `0x${string}` | undefined;

export const MINT_BASE_PRICE_USDC = 770_000n; // $0.77
export const MINT_PRICE_INCREMENT_USDC = 70_000n; // $0.07 per mint
export const MINT_PRICE_USDC = MINT_BASE_PRICE_USDC; // legacy alias

export const USDC_DECIMALS = 6;

export const STAKE_TIERS_USDC = [
  { label: "$1", amount: 1_000_000n, tag: "Casual frog" },
  { label: "$5", amount: 5_000_000n, tag: "Believer" },
  { label: "$10", amount: 10_000_000n, tag: "Whale energy" },
] as const;

export const BASESCAN_URL = "https://basescan.org";

export function formatUsdc(amount: bigint): string {
  const whole = Number(amount) / 10 ** USDC_DECIMALS;
  if (whole < 1) return `$${whole.toFixed(2)}`;
  return `$${whole.toFixed(2)}`;
}

export function isSquadContractConfigured(): boolean {
  return Boolean(SQUAD_NFT_ADDRESS?.startsWith("0x"));
}

export function isPredictionPoolConfigured(): boolean {
  return Boolean(PREDICTION_POOL_ADDRESS?.startsWith("0x"));
}

export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

export const SQUAD_NFT_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [{ name: "playerId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "minted",
    stateMutability: "view",
    inputs: [{ name: "playerId", type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "earlyBeliever",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "currentMintPrice",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "nextMintPrice",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "mintCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "remainingPlayers",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "mintOrderOf",
    stateMutability: "view",
    inputs: [{ name: "playerId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "minterOf",
    stateMutability: "view",
    inputs: [{ name: "playerId", type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "BASE_PRICE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "PRICE_INCREMENT",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "USDC",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "event",
    name: "SquadMinted",
    inputs: [
      { name: "minter", type: "address", indexed: true },
      { name: "playerId", type: "uint256", indexed: true },
      { name: "mintOrder", type: "uint256", indexed: false },
      { name: "pricePaid", type: "uint256", indexed: false },
      { name: "nextPrice", type: "uint256", indexed: false },
    ],
  },
] as const;

export const PREDICTION_POOL_ABI = [
  {
    type: "function",
    name: "predict",
    stateMutability: "nonpayable",
    inputs: [
      { name: "matchId", type: "string" },
      { name: "pickHome", type: "bool" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;
