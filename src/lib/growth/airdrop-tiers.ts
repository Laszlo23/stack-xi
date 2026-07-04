export type AirdropTier = {
  id: string;
  label: string;
  minXp: number;
  weight: number;
  description: string;
};

export const AIRDROP_POOL_LABEL = "1,000,000,000 BCC";
export const AIRDROP_POOL_AMOUNT = 1_000_000_000;

export const AIRDROP_TIERS: AirdropTier[] = [
  {
    id: "rookie",
    label: "Matchday Rookie",
    minXp: 0,
    weight: 1,
    description: "Baseline share for every culture participant.",
  },
  {
    id: "regular",
    label: "Matchday Regular",
    minXp: 50,
    weight: 2,
    description: "Consistent matchday presence.",
  },
  {
    id: "starting-xi",
    label: "Starting XI",
    minXp: 100,
    weight: 5,
    description: "Active mint + predict + social missions.",
  },
  {
    id: "captain",
    label: "Culture Captain",
    minXp: 175,
    weight: 10,
    description: "Full engagement across onchain + social.",
  },
  {
    id: "full-culture",
    label: "Full Culture",
    minXp: 250,
    weight: 20,
    description: "Max pool weight — all major missions complete.",
  },
];

export function getAirdropTier(xp: number): AirdropTier {
  const sorted = [...AIRDROP_TIERS].sort((a, b) => b.minXp - a.minXp);
  return sorted.find((tier) => xp >= tier.minXp) ?? AIRDROP_TIERS[0]!;
}

export function getNextAirdropTier(xp: number): AirdropTier | null {
  return AIRDROP_TIERS.find((tier) => xp < tier.minXp) ?? null;
}

export function formatAirdropWeight(weight: number): string {
  return `${weight}×`;
}
