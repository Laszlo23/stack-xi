/** Squad holder perk tiers — enforced in claims, profile, and prediction UI */

export type SquadPerkTierId =
  | "genesis"
  | "early_believer"
  | "full_xi"
  | "squad3"
  | "base_holder"
  | "none";

export type SquadHoldingsInput = {
  genesisCount: number;
  v2RevealedCount: number;
  v2UniquePlayers: number;
  isEarlyBeliever: boolean;
};

export type PerkSnapshot = {
  tierId: SquadPerkTierId;
  tierLabel: string;
  predictionBoostBps: number;
  merchDiscountPercent: number;
  cultureXpMultiplier: number;
  activePerks: string[];
};

const TIER_RANK: Record<SquadPerkTierId, number> = {
  genesis: 5,
  full_xi: 4,
  early_believer: 3,
  squad3: 2,
  base_holder: 1,
  none: 0,
};

function tierFromHoldings(input: SquadHoldingsInput): SquadPerkTierId {
  if (input.genesisCount > 0) return "genesis";
  if (input.v2UniquePlayers >= 11) return "full_xi";
  if (input.isEarlyBeliever) return "early_believer";
  if (input.v2RevealedCount >= 3) return "squad3";
  if (input.v2RevealedCount >= 1) return "base_holder";
  return "none";
}

const TIER_CONFIG: Record<
  Exclude<SquadPerkTierId, "none">,
  Omit<PerkSnapshot, "tierId" | "activePerks">
> = {
  genesis: {
    tierLabel: "Genesis XI",
    predictionBoostBps: 2500,
    merchDiscountPercent: 20,
    cultureXpMultiplier: 1.5,
  },
  early_believer: {
    tierLabel: "Early Believer",
    predictionBoostBps: 1500,
    merchDiscountPercent: 15,
    cultureXpMultiplier: 1.25,
  },
  full_xi: {
    tierLabel: "Full XI Collector",
    predictionBoostBps: 2000,
    merchDiscountPercent: 15,
    cultureXpMultiplier: 1.3,
  },
  squad3: {
    tierLabel: "Squad Trio",
    predictionBoostBps: 1000,
    merchDiscountPercent: 10,
    cultureXpMultiplier: 1.15,
  },
  base_holder: {
    tierLabel: "Squad Holder",
    predictionBoostBps: 500,
    merchDiscountPercent: 5,
    cultureXpMultiplier: 1.05,
  },
};

function activePerkLabels(tierId: SquadPerkTierId, input: SquadHoldingsInput): string[] {
  const perks: string[] = [];
  if (tierId !== "none") {
    perks.push(`${TIER_CONFIG[tierId].predictionBoostBps / 100}% prediction claim boost`);
    perks.push(`${TIER_CONFIG[tierId].merchDiscountPercent}% merch discount`);
  }
  if (input.genesisCount > 0) perks.push("Genesis legend status");
  if (input.isEarlyBeliever) perks.push("Early believer joker earned");
  if (input.v2UniquePlayers >= 11) perks.push("Full XI collector badge");
  return perks;
}

export function computeSquadPerks(input: SquadHoldingsInput): PerkSnapshot {
  const tierId = tierFromHoldings(input);
  if (tierId === "none") {
    return {
      tierId,
      tierLabel: "No squad perks",
      predictionBoostBps: 0,
      merchDiscountPercent: 0,
      cultureXpMultiplier: 1,
      activePerks: [],
    };
  }
  const config = TIER_CONFIG[tierId];
  return {
    tierId,
    ...config,
    activePerks: activePerkLabels(tierId, input),
  };
}

/** Pick strongest tier when multiple wallets or stacked rules apply */
export function mergePerkSnapshots(snapshots: PerkSnapshot[]): PerkSnapshot {
  if (snapshots.length === 0) {
    return computeSquadPerks({
      genesisCount: 0,
      v2RevealedCount: 0,
      v2UniquePlayers: 0,
      isEarlyBeliever: false,
    });
  }
  return snapshots.reduce((best, current) =>
    TIER_RANK[current.tierId] > TIER_RANK[best.tierId] ? current : best,
  );
}

export function formatBoostPercent(boostBps: number): string {
  if (boostBps <= 0) return "0%";
  return `+${(boostBps / 100).toFixed(0)}%`;
}

export function applyBoostBps(baseAmount: bigint, boostBps: number): bigint {
  if (boostBps <= 0) return baseAmount;
  return baseAmount + (baseAmount * BigInt(boostBps)) / 10_000n;
}
