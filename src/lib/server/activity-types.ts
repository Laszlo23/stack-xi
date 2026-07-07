export type ActivityKind =
  | "prediction"
  | "streak"
  | "tier_unlock"
  | "quest"
  | "mint"
  | "share";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  handle: string;
  message: string;
  emoji: string;
  timestamp: string;
  matchId?: string;
  seed?: boolean;
};

export type MatchStats = {
  matchId: string;
  totalPicks: number;
  homePct: number;
  awayPct: number;
  uniqueWallets: number;
  prizePoolLabel: string;
  updatedAt: string;
};

export type LeaderboardRow = {
  rank: number;
  handle: string;
  xp: number;
  level: string;
  address?: string;
  seed?: boolean;
};
