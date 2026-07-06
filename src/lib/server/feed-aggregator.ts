import type { FeedItem, FeedResponse } from "@/lib/feed/feed-types";
import { getCommunityWatchlist } from "@/lib/agents/community-watchlist";
import { listOutcomes as listLuckOutcomes } from "@/lib/server/luck-agent-storage";
import { listOutcomes as listPepeOutcomes } from "@/lib/server/pepe-agent-storage";
import {
  getFeedStorageSnapshot,
  listCultureOpsEvents,
  setCachedBuilderItems,
} from "@/lib/server/feed-storage";
import { BASESCAN_URL } from "@/lib/base/config";

const BUILDER_CACHE_MS = 60_000;

function luckOutcomeToFeedItem(outcome: {
  tweetId: string;
  actionType: string;
  pillar: string;
  hook: string;
  text?: string;
  url?: string;
  targetHandle?: string;
  publishedAt: string;
}): FeedItem {
  const handle = outcome.targetHandle ? ` → ${outcome.targetHandle}` : "";
  const preview = outcome.text?.trim() || `${outcome.actionType} · ${outcome.pillar}${handle}`;
  return {
    id: `luck-${outcome.tweetId}`,
    lane: "agent",
    platform: "x",
    author: "Luck",
    authorHandle: "@0xleonardo",
    text: preview,
    timestamp: outcome.publishedAt,
    url: outcome.url ?? `https://x.com/i/web/status/${outcome.tweetId}`,
    badge: "Automated agent",
    meta: { hook: outcome.hook, actionType: outcome.actionType },
  };
}

function pepeOutcomeToFeedItem(outcome: {
  castHash: string;
  actionType: string;
  pillar: string;
  hook: string;
  targetHandle?: string;
  publishedAt: string;
  url?: string;
  text?: string;
}): FeedItem {
  const preview = outcome.text?.trim() || `${outcome.actionType} · ${outcome.pillar}`;
  return {
    id: `pepe-${outcome.castHash}`,
    lane: "agent",
    platform: "farcaster",
    author: "Pepe",
    authorHandle: "@0xleonardo",
    text: preview,
    timestamp: outcome.publishedAt,
    url: outcome.url ?? `https://warpcast.com/~/conversations/${outcome.castHash}`,
    badge: "Automated agent",
    meta: { hook: outcome.hook, actionType: outcome.actionType },
  };
}

function cultureOpsToFeedItem(event: {
  id: string;
  kind: string;
  label: string;
  txHash?: string;
  amountLabel?: string;
  publishedAt: string;
}): FeedItem {
  const text = event.amountLabel ? `${event.label} · ${event.amountLabel}` : event.label;
  return {
    id: `ops-${event.id}`,
    lane: "culture",
    platform: "base",
    author: "Protocol Pepe",
    text,
    timestamp: event.publishedAt,
    url: event.txHash ? `${BASESCAN_URL}/tx/${event.txHash}` : undefined,
    badge: "Protocol activity",
    meta: { kind: event.kind },
  };
}

async function neynarFetch(path: string): Promise<Response | null> {
  const apiKey = process.env.NEYNAR_API_KEY?.trim();
  if (!apiKey) return null;
  return fetch(`https://api.neynar.com${path}`, {
    headers: { accept: "application/json", api_key: apiKey },
  });
}

async function fetchBuilderCasts(): Promise<FeedItem[]> {
  const res = await neynarFetch(
    `/v2/farcaster/user/by_username?usernames=${getCommunityWatchlist()
      .slice(0, 8)
      .map((a) => a.username)
      .join(",")}`,
  );
  if (!res?.ok) return [];

  const usersData = (await res.json()) as {
    users?: { fid: number; username: string; display_name?: string }[];
  };
  const users = usersData.users ?? [];
  if (users.length === 0) return [];

  const items: FeedItem[] = [];
  for (const user of users.slice(0, 6)) {
    const feedRes = await neynarFetch(
      `/v2/farcaster/feed/user/casts?fid=${user.fid}&limit=3`,
    );
    if (!feedRes?.ok) continue;
    const feedData = (await feedRes.json()) as {
      casts?: {
        hash: string;
        text: string;
        timestamp: string;
        author?: { username?: string; display_name?: string };
      }[];
    };
    for (const cast of feedData.casts ?? []) {
      if (!cast.text?.trim()) continue;
      items.push({
        id: `builder-${cast.hash}`,
        lane: "builder",
        platform: "farcaster",
        author: cast.author?.display_name ?? user.display_name ?? user.username,
        authorHandle: `@${cast.author?.username ?? user.username}`,
        text: cast.text.trim(),
        timestamp: cast.timestamp,
        url: `https://warpcast.com/${cast.author?.username ?? user.username}/${cast.hash.slice(0, 10)}`,
      });
    }
  }

  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

async function getBuilderItems(): Promise<FeedItem[]> {
  const storage = await getFeedStorageSnapshot();
  const cachedAt = storage.cachedAt ? new Date(storage.cachedAt).getTime() : 0;
  if (Date.now() - cachedAt < BUILDER_CACHE_MS && storage.cachedBuilderItems.length > 0) {
    return storage.cachedBuilderItems;
  }

  const fresh = await fetchBuilderCasts();
  if (fresh.length > 0) {
    await setCachedBuilderItems(fresh);
    return fresh;
  }
  return storage.cachedBuilderItems;
}

export async function aggregateCultureFeed(opts?: {
  limit?: number;
  cursor?: string | null;
}): Promise<FeedResponse> {
  const limit = Math.min(Math.max(opts?.limit ?? 40, 1), 100);
  const cursorTs = opts?.cursor ? Number.parseInt(opts.cursor, 10) : null;

  const [luckOutcomes, pepeOutcomes, cultureOps, builderItems] = await Promise.all([
    listLuckOutcomes(),
    listPepeOutcomes(),
    listCultureOpsEvents(50),
    getBuilderItems(),
  ]);

  const merged: FeedItem[] = [
    ...luckOutcomes.map(luckOutcomeToFeedItem),
    ...pepeOutcomes.map(pepeOutcomeToFeedItem),
    ...cultureOps.map(cultureOpsToFeedItem),
    ...builderItems,
  ];

  const filtered =
    cursorTs != null && Number.isFinite(cursorTs)
      ? merged.filter((item) => new Date(item.timestamp).getTime() < cursorTs)
      : merged;

  const sorted = filtered.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const page = sorted.slice(0, limit);
  const last = page[page.length - 1];
  const nextCursor =
    sorted.length > limit && last
      ? String(new Date(last.timestamp).getTime())
      : null;

  return {
    items: page,
    cursor: nextCursor,
    cachedAt: new Date().toISOString(),
    agents: {
      luck: {
        configured: Boolean(process.env.X_ACCESS_TOKEN?.trim()),
        outcomes: luckOutcomes.length,
      },
      pepe: {
        configured: Boolean(
          process.env.NEYNAR_API_KEY?.trim() && process.env.NEYNAR_SIGNER_UUID?.trim(),
        ),
        outcomes: pepeOutcomes.length,
      },
      cultureOps: {
        configured: Boolean(process.env.CULTURE_OPS_PRIVATE_KEY?.trim()),
        events: cultureOps.length,
      },
    },
  };
}
