import { FC_BUILDERS } from "@/lib/story/farcaster-builders";
import { getCultureLevel } from "@/lib/profile/member-tasks";

export type LeaderboardEntry = {
  address: string;
  handle: string;
  xp: number;
  level: string;
  updatedAt: string;
};

const LEADERBOARD_KEY = "stackxi:leaderboard";

const SEED_XP = [180, 155, 140, 120, 105, 90, 75, 60];

export const SEED_LEADERBOARD: LeaderboardEntry[] = FC_BUILDERS.map((b, i) => ({
  address: `0xseed${String(i).padStart(38, "0")}`,
  handle: b.handle,
  xp: SEED_XP[i] ?? 50,
  level: getCultureLevel(SEED_XP[i] ?? 50).label,
  updatedAt: "",
}));

function loadLeaderboardMap(): Record<string, LeaderboardEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LeaderboardEntry>;
  } catch {
    return {};
  }
}

export function publishLeaderboardEntry(address: string, xp: number, handle?: string): void {
  if (typeof window === "undefined" || !address) return;
  const level = getCultureLevel(xp).label;
  const map = loadLeaderboardMap();
  map[address.toLowerCase()] = {
    address: address.toLowerCase(),
    handle: handle ?? `${address.slice(0, 6)}…${address.slice(-4)}`,
    xp,
    level,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(map));
}

export function listLeaderboardEntries(): LeaderboardEntry[] {
  const stored = Object.values(loadLeaderboardMap());
  const byAddress = new Map<string, LeaderboardEntry>();

  for (const seed of SEED_LEADERBOARD) {
    byAddress.set(seed.address.toLowerCase(), seed);
  }
  for (const entry of stored) {
    const key = entry.address.toLowerCase();
    const existing = byAddress.get(key);
    if (!existing || entry.xp >= existing.xp) {
      byAddress.set(key, entry);
    }
  }

  return [...byAddress.values()].sort((a, b) => b.xp - a.xp);
}

export function getLeaderboardRank(
  address: string | undefined,
  entries: LeaderboardEntry[],
): number | null {
  if (!address) return null;
  const idx = entries.findIndex((e) => e.address.toLowerCase() === address.toLowerCase());
  return idx >= 0 ? idx + 1 : null;
}
