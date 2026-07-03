export type StacksNetwork = "mainnet" | "testnet";

export const STACKS_NETWORK = (import.meta.env.VITE_STACKS_NETWORK ?? "mainnet") as StacksNetwork;

export const SBTC_CONTRACT =
  import.meta.env.VITE_SBTC_CONTRACT ?? "SM3VDXK3WZZSA84FEFZNADZDOWNZNDC2QRRR9BBA.sbtc-token";

export const PREDICTION_POOL_ADDRESS = import.meta.env.VITE_PREDICTION_POOL_ADDRESS ?? "";

export const HIRO_API_BASE =
  STACKS_NETWORK === "mainnet" ? "https://api.mainnet.hiro.so" : "https://api.testnet.hiro.so";

export const SBTC_DECIMALS = 8;

/** Preset stake tiers in satoshis (sBTC is 1:1 with BTC). */
export const STAKE_TIERS_SATS = [
  { label: "0.001", sats: 100_000, tag: "Casual frog" },
  { label: "0.005", sats: 500_000, tag: "Believer" },
  { label: "0.01", sats: 1_000_000, tag: "Whale energy" },
] as const;

export function formatSbtcFromSats(sats: number): string {
  return (sats / 10 ** SBTC_DECIMALS).toFixed(3);
}

export function isPoolConfigured(): boolean {
  return PREDICTION_POOL_ADDRESS.length > 0 && PREDICTION_POOL_ADDRESS.startsWith("SP");
}
