import { base } from "viem/chains";

export const BASE_CHAIN_ID = Number(import.meta.env.VITE_BASE_CHAIN_ID ?? base.id);

export const USDC_ADDRESS =
  (import.meta.env.VITE_USDC_ADDRESS as `0x${string}`) ??
  ("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const);

export const SQUAD_NFT_ADDRESS = import.meta.env.VITE_SQUAD_NFT_ADDRESS as
  `0x${string}` | undefined;

export const PREDICTION_POOL_ADDRESS = import.meta.env.VITE_PREDICTION_POOL_ADDRESS as
  `0x${string}` | undefined;

export const PREDICTION_SPONSOR_ADDRESS = import.meta.env.VITE_PREDICTION_SPONSOR_ADDRESS as
  `0x${string}` | undefined;

export const USDC_DECIMALS = 6;

/** BCC payment layer — 18 decimals (Clanker token on Base) */
export const BCC_DECIMALS = 18;
export const BCC_UNIT = 10n ** 18n;

export const SPONSORED_STAKE_BCC = 1_000n * BCC_UNIT;
export const SPONSORED_PREDICTION_MAX = Number(
  import.meta.env.VITE_SPONSORED_PREDICTION_MAX ?? 77,
);

export const MINT_BASE_PRICE_BCC = 770n * BCC_UNIT;
export const MINT_PRICE_INCREMENT_BCC = 70n * BCC_UNIT;

/** Legacy USDC curve constants — display/history only */
export const MINT_BASE_PRICE_USDC = 770_000n;
export const MINT_PRICE_INCREMENT_USDC = 70_000n;
export const MINT_PRICE_USDC = MINT_BASE_PRICE_USDC;

export const STAKE_TIERS_BCC = [
  { label: "1,000", amount: 1_000n * BCC_UNIT, tag: "Casual frog" },
  { label: "5,000", amount: 5_000n * BCC_UNIT, tag: "Believer" },
  { label: "10,000", amount: 10_000n * BCC_UNIT, tag: "Whale energy" },
] as const;

/** @deprecated Use STAKE_TIERS_BCC */
export const STAKE_TIERS_USDC = STAKE_TIERS_BCC;

export const BASESCAN_URL = "https://basescan.org";

export const BCC_TOKEN_ADDRESS = (import.meta.env.VITE_BCC_TOKEN_ADDRESS ??
  "0xb890a5289f789f1346032ccc1847939e855fab07") as `0x${string}`;

export const BCC_SYMBOL = "BCC";

export const BASE_APP_COIN_URL = `https://base.app/coin/base-mainnet/${BCC_TOKEN_ADDRESS}`;

export const BCC_BASESCAN_URL = `${BASESCAN_URL}/token/${BCC_TOKEN_ADDRESS}`;

export const UNISWAP_BCC_SWAP_URL = `https://app.uniswap.org/swap?chain=base&outputCurrency=${BCC_TOKEN_ADDRESS}`;

export const CLANKER_BCC_URL = `https://clanker.world/clanker/${BCC_TOKEN_ADDRESS}`;

export const DEXSCREENER_BCC_POOL_URL =
  import.meta.env.VITE_DEXSCREENER_POOL_URL ??
  "https://dexscreener.com/base/0xbb1a4e26d908a8fdddcea5d634faaa47eb8959b78384af66fea0bf45732143fb";

export const DEXSCREENER_BOOST_URL = "https://docs.dexscreener.com/token-boosting";

export function formatUsdc(amount: bigint): string {
  const whole = Number(amount) / 10 ** USDC_DECIMALS;
  if (whole < 1) return `$${whole.toFixed(2)}`;
  return `$${whole.toFixed(2)}`;
}

export function formatBcc(amount: bigint, decimals = BCC_DECIMALS): string {
  const whole = Number(amount) / 10 ** decimals;
  if (whole >= 1000) {
    return `${whole.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${BCC_SYMBOL}`;
  }
  return `${whole.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${BCC_SYMBOL}`;
}

export function isSquadContractConfigured(): boolean {
  return Boolean(SQUAD_NFT_ADDRESS?.startsWith("0x"));
}

export function isPredictionPoolConfigured(): boolean {
  return Boolean(PREDICTION_POOL_ADDRESS?.startsWith("0x"));
}

export function isSponsorConfigured(): boolean {
  return Boolean(PREDICTION_SPONSOR_ADDRESS?.startsWith("0x"));
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
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
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
    name: "BCC",
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
  {
    type: "function",
    name: "predictFor",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "matchId", type: "string" },
      { name: "pickHome", type: "bool" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export const PREDICTION_SPONSOR_ABI = [
  {
    type: "function",
    name: "sponsoredPredict",
    stateMutability: "nonpayable",
    inputs: [
      { name: "matchId", type: "string" },
      { name: "pickHome", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "remainingSlots",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "isEligible",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "hasUsedSponsored",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "allowed",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "sponsoredCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;
