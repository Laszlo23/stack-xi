/** Illustrative crowd splits — not live order book data. */
const BASE_SPLITS: Record<string, { home: number; away: number }> = {
  m7: { home: 44, away: 56 },
  m8: { home: 70, away: 30 },
};

export type CrowdSplit = { home: number; away: number; trending: "home" | "away" | "flat" };

export function getCrowdSplit(matchId: string, jitter = 0): CrowdSplit {
  const base = BASE_SPLITS[matchId] ?? { home: 50, away: 50 };
  const home = Math.min(92, Math.max(8, base.home + jitter));
  const away = 100 - home;
  const trending: CrowdSplit["trending"] = jitter > 1 ? "home" : jitter < -1 ? "away" : "flat";
  return { home, away, trending };
}
