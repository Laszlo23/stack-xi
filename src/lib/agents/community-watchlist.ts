import { FC_BUILDERS } from "@/lib/story/farcaster-builders";

export type WatchlistAccount = {
  handle: string;
  username: string;
  note: string;
  priority: number;
};

const OG_WEB3_HANDLES: readonly Omit<WatchlistAccount, "handle">[] = [
  { username: "base", note: "onchain everywhere", priority: 10 },
  { username: "coinbase", note: "wallet gravity", priority: 8 },
  { username: "balajis", note: "network state energy", priority: 7 },
  { username: "a16zcrypto", note: "builder gravity", priority: 6 },
];

function parseEnvWatchlist(): WatchlistAccount[] {
  const raw = process.env.LUCK_AGENT_WATCHLIST?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim().replace(/^@/, ""))
    .filter(Boolean)
    .map((username, index) => ({
      handle: `@${username}`,
      username,
      note: "community watchlist",
      priority: 5 + index,
    }));
}

export function getCommunityWatchlist(): WatchlistAccount[] {
  const fromBuilders: WatchlistAccount[] = FC_BUILDERS.map((b, index) => ({
    handle: b.handle,
    username: b.handle.replace(/^@/, ""),
    note: b.note,
    priority: 9 - Math.min(index, 5),
  }));

  const fromOg: WatchlistAccount[] = OG_WEB3_HANDLES.map((entry) => ({
    handle: `@${entry.username}`,
    ...entry,
  }));

  const fromEnv = parseEnvWatchlist();
  const merged = new Map<string, WatchlistAccount>();

  for (const account of [...fromBuilders, ...fromOg, ...fromEnv]) {
    const key = account.username.toLowerCase();
    const existing = merged.get(key);
    if (!existing || account.priority > existing.priority) {
      merged.set(key, account);
    }
  }

  return [...merged.values()].sort((a, b) => b.priority - a.priority);
}

export function pickWatchlistForTick(now = new Date(), count = 3): WatchlistAccount[] {
  const list = getCommunityWatchlist();
  if (list.length === 0) return [];
  const start = now.getUTCHours() % list.length;
  const picks: WatchlistAccount[] = [];
  for (let i = 0; i < Math.min(count, list.length); i += 1) {
    picks.push(list[(start + i) % list.length]!);
  }
  return picks;
}

export function excludeSelfFromWatchlist(accounts: WatchlistAccount[]): WatchlistAccount[] {
  return accounts.filter((a) => a.username.toLowerCase() !== "0xleonardo");
}
