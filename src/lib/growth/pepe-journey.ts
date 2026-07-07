export type PepeJourneyTier = {
  id: string;
  label: string;
  minXp: number;
};

export const PEPE_JOURNEY_TIERS: PepeJourneyTier[] = [
  { id: "rookie", label: "Matchday Rookie", minXp: 0 },
  { id: "player", label: "Matchday Player", minXp: 50 },
  { id: "builder", label: "Culture Builder", minXp: 100 },
  { id: "legend", label: "Legend", minXp: 175 },
];

export function getPepeJourneyTier(xp: number): PepeJourneyTier {
  let tier = PEPE_JOURNEY_TIERS[0]!;
  for (const candidate of PEPE_JOURNEY_TIERS) {
    if (xp >= candidate.minXp) tier = candidate;
  }
  return tier;
}

export function getNextPepeJourneyTier(xp: number): PepeJourneyTier | null {
  const current = getPepeJourneyTier(xp);
  const idx = PEPE_JOURNEY_TIERS.findIndex((t) => t.id === current.id);
  return PEPE_JOURNEY_TIERS[idx + 1] ?? null;
}
