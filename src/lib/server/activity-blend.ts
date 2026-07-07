import { FC_BUILDERS } from "@/lib/story/farcaster-builders";
import type { ActivityItem, LeaderboardRow, MatchStats } from "./activity-types";

const SEED_BASE_PREDICTIONS = 14_238;

export const SEED_ACTIVITY: ActivityItem[] = [
  {
    id: "seed-1",
    kind: "prediction",
    handle: FC_BUILDERS[0]?.handle ?? "@0xleonardo",
    message: "picked Argentina",
    emoji: "🔥",
    timestamp: new Date(Date.now() - 2 * 60_000).toISOString(),
    matchId: "m10",
    seed: true,
  },
  {
    id: "seed-2",
    kind: "prediction",
    handle: FC_BUILDERS[1]?.handle ?? "@jessepollak",
    message: "picked Egypt",
    emoji: "🔥",
    timestamp: new Date(Date.now() - 5 * 60_000).toISOString(),
    matchId: "m10",
    seed: true,
  },
  {
    id: "seed-3",
    kind: "streak",
    handle: FC_BUILDERS[2]?.handle ?? "@linda",
    message: "is on a 9-game streak",
    emoji: "🔥",
    timestamp: new Date(Date.now() - 8 * 60_000).toISOString(),
    seed: true,
  },
  {
    id: "seed-4",
    kind: "tier_unlock",
    handle: FC_BUILDERS[3]?.handle ?? "@coopa",
    message: "unlocked Culture Builder",
    emoji: "🔥",
    timestamp: new Date(Date.now() - 12 * 60_000).toISOString(),
    seed: true,
  },
  {
    id: "seed-5",
    kind: "quest",
    handle: FC_BUILDERS[4]?.handle ?? "@horsefacts",
    message: "completed Quest #4",
    emoji: "✓",
    timestamp: new Date(Date.now() - 18 * 60_000).toISOString(),
    seed: true,
  },
  {
    id: "seed-6",
    kind: "share",
    handle: FC_BUILDERS[5]?.handle ?? "@dwr",
    message: "shared a prediction",
    emoji: "📣",
    timestamp: new Date(Date.now() - 25 * 60_000).toISOString(),
    seed: true,
  },
  {
    id: "seed-7",
    kind: "mint",
    handle: FC_BUILDERS[6]?.handle ?? "@v",
    message: "minted a founding player card",
    emoji: "🏆",
    timestamp: new Date(Date.now() - 40 * 60_000).toISOString(),
    seed: true,
  },
  {
    id: "seed-8",
    kind: "prediction",
    handle: FC_BUILDERS[7]?.handle ?? "@base",
    message: "picked Switzerland",
    emoji: "🔥",
    timestamp: new Date(Date.now() - 55 * 60_000).toISOString(),
    matchId: "m11",
    seed: true,
  },
];

const SEED_LEADERBOARD: LeaderboardRow[] = [
  { rank: 1, handle: FC_BUILDERS[0]?.handle ?? "@0xleonardo", xp: 180, level: "Legend", seed: true },
  { rank: 2, handle: FC_BUILDERS[2]?.handle ?? "@linda", xp: 155, level: "Culture Builder", seed: true },
  { rank: 3, handle: FC_BUILDERS[7]?.handle ?? "@horsefacts", xp: 140, level: "Culture Builder", seed: true },
  { rank: 4, handle: "Pepe", xp: 120, level: "Culture Builder", seed: true },
  { rank: 5, handle: FC_BUILDERS[1]?.handle ?? "@jessepollak", xp: 105, level: "Matchday Player", seed: true },
];

const SEED_MATCH_SPLITS: Record<string, { home: number; away: number }> = {
  m10: { home: 62, away: 38 },
  m11: { home: 48, away: 52 },
};

function mergeById(real: ActivityItem[], seeds: ActivityItem[]): ActivityItem[] {
  const seen = new Set<string>();
  const merged: ActivityItem[] = [];
  for (const item of [...real, ...seeds]) {
    const key = `${item.handle}-${item.kind}-${item.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

export function getBlendedActivity(real: ActivityItem[], limit = 20): ActivityItem[] {
  return mergeById(real, SEED_ACTIVITY).slice(0, limit);
}

export function getBlendedLeaderboard(real: LeaderboardRow[], limit = 50): LeaderboardRow[] {
  const byHandle = new Map<string, LeaderboardRow>();
  for (const row of [...SEED_LEADERBOARD, ...real]) {
    const existing = byHandle.get(row.handle.toLowerCase());
    if (!existing || row.xp > existing.xp) {
      byHandle.set(row.handle.toLowerCase(), row);
    }
  }
  return [...byHandle.values()]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit)
    .map((row, idx) => ({ ...row, rank: idx + 1 }));
}

export function getBlendedMatchStats(
  matchId: string,
  real: Partial<MatchStats> | null,
): MatchStats {
  const seed = SEED_MATCH_SPLITS[matchId] ?? { home: 50, away: 50 };
  const realTotal = real?.totalPicks ?? 0;
  const totalPicks = SEED_BASE_PREDICTIONS + realTotal;

  return {
    matchId,
    totalPicks,
    homePct: real?.homePct ?? seed.home,
    awayPct: real?.awayPct ?? seed.away,
    uniqueWallets: real?.uniqueWallets ?? Math.round(totalPicks * 0.72),
    prizePoolLabel: real?.prizePoolLabel ?? "1,000 BCC pool",
    updatedAt: real?.updatedAt ?? new Date().toISOString(),
  };
}

export function getGlobalPredictionCount(realCount = 0): number {
  return SEED_BASE_PREDICTIONS + realCount;
}
