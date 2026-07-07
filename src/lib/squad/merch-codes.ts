import type { SquadPerkTierId } from "@/lib/squad/perk-tiers";

/** Merch discount codes by perk tier — set in env for rotation */
const MERCH_CODES: Record<Exclude<SquadPerkTierId, "none">, string> = {
  genesis: import.meta.env.VITE_MERCH_CODE_GENESIS?.trim() || "GENESIS20",
  early_believer: import.meta.env.VITE_MERCH_CODE_EARLY?.trim() || "EARLY15",
  full_xi: import.meta.env.VITE_MERCH_CODE_FULLXI?.trim() || "FULLXI15",
  squad3: import.meta.env.VITE_MERCH_CODE_SQUAD3?.trim() || "SQUAD10",
  base_holder: import.meta.env.VITE_MERCH_CODE_HOLDER?.trim() || "HOLDER5",
};

export function merchCodeForTier(tierId: SquadPerkTierId): string | null {
  if (tierId === "none") return null;
  return MERCH_CODES[tierId];
}

export function merchStoreUrl(): string {
  return import.meta.env.VITE_MERCH_STORE_URL?.trim() || "https://buildingcultureid.space/merch";
}
