import type { TwitterApi } from "twitter-api-v2";

import {
  excludeSelfFromWatchlist,
  pickWatchlistForTick,
} from "@/lib/agents/community-watchlist";
import { hasSupportedHandleToday } from "@/lib/server/luck-agent-storage";

export type RadarCandidate = {
  tweetId: string;
  handle: string;
  username: string;
  note: string;
  text: string;
  score: number;
};

function engagementScore(metrics?: {
  like_count?: number;
  retweet_count?: number;
  reply_count?: number;
}): number {
  if (!metrics) return 0;
  return (
    (metrics.like_count ?? 0) * 2 +
    (metrics.retweet_count ?? 0) * 3 +
    (metrics.reply_count ?? 0) * 2
  );
}

async function searchRecentFromUser(
  client: TwitterApi,
  username: string,
): Promise<RadarCandidate | null> {
  try {
    const query = `from:${username} -is:retweet -is:reply lang:en`;
    const res = await client.v2.search(query, {
      max_results: 10,
      "tweet.fields": ["public_metrics", "created_at", "author_id"],
    });

    const tweets = res.tweets ?? [];
    if (tweets.length === 0) return null;

    const best = [...tweets].sort(
      (a, b) => engagementScore(b.public_metrics) - engagementScore(a.public_metrics),
    )[0]!;

    if (!best.id || !best.text) return null;

    return {
      tweetId: best.id,
      handle: `@${username}`,
      username,
      note: "",
      text: best.text,
      score: engagementScore(best.public_metrics),
    };
  } catch {
    return null;
  }
}

export async function findSupportCandidate(
  client: TwitterApi,
  now = new Date(),
): Promise<RadarCandidate | null> {
  const watchlist = excludeSelfFromWatchlist(pickWatchlistForTick(now, 5));

  for (const account of watchlist) {
    const already = await hasSupportedHandleToday(account.handle, now);
    if (already) continue;

    const candidate = await searchRecentFromUser(client, account.username);
    if (!candidate) continue;

    return {
      ...candidate,
      handle: account.handle,
      note: account.note,
    };
  }

  return null;
}

export function pickSupportAction(
  counts: { quote: number; reply: number; retweet: number },
  caps: { quote: number; reply: number; retweet: number },
): "quote" | "reply" | "retweet" | null {
  const order: Array<"quote" | "reply" | "retweet"> = ["quote", "reply", "retweet"];
  for (const action of order) {
    if (counts[action] < caps[action]) return action;
  }
  return null;
}
