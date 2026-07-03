import { HIRO_API_BASE, SBTC_CONTRACT } from "./config";

type FungibleBalance = {
  balance: string;
  total_sent: string;
  total_received: string;
};

type AddressBalances = {
  fungible_tokens?: Record<string, FungibleBalance>;
};

export async function fetchSbtcBalanceSats(stxAddress: string): Promise<number> {
  if (typeof window === "undefined") return 0;

  const res = await fetch(`${HIRO_API_BASE}/extended/v1/address/${stxAddress}/balances`);
  if (!res.ok) return 0;

  const data = (await res.json()) as AddressBalances;
  const raw = data.fungible_tokens?.[SBTC_CONTRACT]?.balance;
  if (!raw) return 0;

  return Number.parseInt(raw, 10) || 0;
}
