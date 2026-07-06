import {
  excludeSelfFromWatchlist,
  pickWatchlistForTick,
} from "@/lib/agents/community-watchlist";
import { hasPepeSupportedHandleToday } from "@/lib/server/pepe-agent-storage";

export type PepeRadarCandidate = {
  castHash: string;
  handle: string;
  username: string;
  note: string;
  text: string;
  fid: number;
};

async function neynarFetch(path: string): Promise<Response | null> {
  const apiKey = process.env.NEYNAR_API_KEY?.trim();
  if (!apiKey) return null;
  return fetch(`https://api.neynar.com${path}`, {
    headers: { accept: "application/json", api_key: apiKey },
  });
}

async function fetchRecentCastForUser(username: string): Promise<PepeRadarCandidate | null> {
  const userRes = await neynarFetch(`/v2/farcaster/user/by_username?username=${username}`);
  if (!userRes?.ok) return null;
  const userData = (await userRes.json()) as {
    user?: { fid: number; username: string };
  };
  const user = userData.user;
  if (!user?.fid) return null;

  const feedRes = await neynarFetch(`/v2/farcaster/feed/user/casts?fid=${user.fid}&limit=5`);
  if (!feedRes?.ok) return null;
  const feedData = (await feedRes.json()) as {
    casts?: { hash: string; text: string }[];
  };
  const cast = feedData.casts?.find((c) => c.text?.trim());
  if (!cast?.hash) return null;

  return {
    castHash: cast.hash,
    handle: `@${user.username}`,
    username: user.username,
    note: "",
    text: cast.text.trim(),
    fid: user.fid,
  };
}

export async function findPepeSupportCandidate(
  now = new Date(),
): Promise<PepeRadarCandidate | null> {
  const watchlist = excludeSelfFromWatchlist(pickWatchlistForTick(now, 5));

  for (const account of watchlist) {
    const already = await hasPepeSupportedHandleToday(account.handle, now);
    if (already) continue;

    const candidate = await fetchRecentCastForUser(account.username);
    if (!candidate) continue;

    return {
      ...candidate,
      handle: account.handle,
      note: account.note,
    };
  }

  return null;
}

export function pickPepeSupportAction(
  counts: { reply: number; recast: number },
  caps: { reply: number; recast: number },
): "reply" | "recast" | null {
  if (counts.reply < caps.reply) return "reply";
  if (counts.recast < caps.recast) return "recast";
  return null;
}
