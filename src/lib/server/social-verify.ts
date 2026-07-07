import { SOCIAL_TARGETS } from "@/lib/growth/social-targets";
import { SITE_URL } from "@/lib/seo/site-config";
import type { WalletSocialLinks } from "@/lib/server/social-storage";

export type SocialVerifyResult = {
  verified: boolean;
  method: "api" | "honor_fallback" | "not_connected";
  message: string;
};

async function xApiFetch(path: string, accessToken: string): Promise<Response> {
  return fetch(`https://api.twitter.com/2${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

async function checkXRetweeted(accessToken: string, userId: string, tweetId: string): Promise<boolean> {
  const res = await xApiFetch(`/tweets/${tweetId}/retweeted_by?max_results=100`, accessToken);
  if (!res.ok) return false;
  const data = (await res.json()) as { data?: { id: string }[] };
  return (data.data ?? []).some((user) => user.id === userId);
}

async function checkXRepliedToTweet(
  accessToken: string,
  userId: string,
  tweetId: string,
): Promise<boolean> {
  const query = encodeURIComponent(
    `conversation_id:${tweetId} from:${userId} -is:retweet`,
  );
  const res = await xApiFetch(`/tweets/search/recent?query=${query}&max_results=10`, accessToken);
  if (!res.ok) return false;
  const data = (await res.json()) as { data?: unknown[] };
  return (data.data?.length ?? 0) > 0;
}

async function checkXFollowing(
  accessToken: string,
  userId: string,
  targetUsername: string,
): Promise<boolean> {
  const query = encodeURIComponent(`from:${userId}`);
  const res = await xApiFetch(
    `/users/${userId}/following?max_results=1000&user.fields=username`,
    accessToken,
  );
  if (res.ok) {
    const data = (await res.json()) as { data?: { username?: string }[] };
    const target = targetUsername.toLowerCase();
    if ((data.data ?? []).some((u) => u.username?.toLowerCase() === target)) {
      return true;
    }
  }
  const searchRes = await xApiFetch(
    `/tweets/search/recent?query=${query}&max_results=1`,
    accessToken,
  );
  void searchRes;
  const lookupRes = await xApiFetch(
    `/users/by/username/${encodeURIComponent(targetUsername)}`,
    accessToken,
  );
  if (!lookupRes.ok) return false;
  const lookup = (await lookupRes.json()) as { data?: { id?: string } };
  const targetId = lookup.data?.id;
  if (!targetId) return false;
  const followRes = await xApiFetch(
    `/users/${userId}/following?max_results=1000`,
    accessToken,
  );
  if (!followRes.ok) return false;
  const followData = (await followRes.json()) as { data?: { id?: string }[] };
  return (followData.data ?? []).some((u) => u.id === targetId);
}

async function checkXEngagedWithPost(
  accessToken: string,
  userId: string,
  tweetId: string,
): Promise<boolean> {
  const [replied, retweeted] = await Promise.all([
    checkXRepliedToTweet(accessToken, userId, tweetId),
    checkXRetweeted(accessToken, userId, tweetId),
  ]);
  return replied || retweeted;
}

async function checkXPostedSiteUrl(
  accessToken: string,
  userId: string,
  username: string,
): Promise<boolean> {
  const host = SITE_URL.replace(/^https?:\/\//, "");
  const query = encodeURIComponent(`from:${username} ${host}`);
  const res = await xApiFetch(`/tweets/search/recent?query=${query}&max_results=5`, accessToken);
  if (!res.ok) return false;
  const data = (await res.json()) as { data?: { author_id?: string }[] };
  return (data.data ?? []).some((tweet) => tweet.author_id === userId);
}

export async function verifyXTask(
  taskId: string,
  links: WalletSocialLinks,
): Promise<SocialVerifyResult> {
  const x = links.x;
  if (!x) {
    return {
      verified: false,
      method: "not_connected",
      message: "Connect your X account first.",
    };
  }

  const tweetId = SOCIAL_TARGETS.xTweetId;

  try {
    if (taskId === "comment_x_post") {
      const replied = await checkXRepliedToTweet(x.accessToken, x.userId, tweetId);
      if (replied) {
        return { verified: true, method: "api", message: "Reply detected on target post." };
      }
      return {
        verified: false,
        method: "honor_fallback",
        message: "Could not verify reply via API — mark done if you commented.",
      };
    }

    if (taskId === "follow_x") {
      const following = await checkXFollowing(x.accessToken, x.userId, SOCIAL_TARGETS.xAccount);
      if (following) {
        return { verified: true, method: "api", message: "Following @buildingcultu3 detected." };
      }
      return {
        verified: false,
        method: "honor_fallback",
        message: "Could not verify follow via API — complete follow then retry.",
      };
    }

    if (taskId === "engage_x" || taskId === "engage_x_post" || taskId === "like_share_x") {
      const engaged = await checkXEngagedWithPost(x.accessToken, x.userId, tweetId);
      if (engaged) {
        return {
          verified: true,
          method: "api",
          message: "Engagement detected (reply or repost on target post).",
        };
      }
      return {
        verified: false,
        method: "honor_fallback",
        message:
          "Like/repost/reply not fully verified — engage with the post then retry.",
      };
    }

    if (taskId === "share_campaign" || taskId === "make_post") {
      const posted = await checkXPostedSiteUrl(x.accessToken, x.userId, x.username);
      if (posted) {
        return { verified: true, method: "api", message: "Campaign post with site URL detected." };
      }
      return {
        verified: false,
        method: "honor_fallback",
        message: "Post with the site URL, then verify or mark done.",
      };
    }
  } catch {
    return {
      verified: false,
      method: "honor_fallback",
      message: "X API check failed — mark done if you completed the action.",
    };
  }

  return {
    verified: false,
    method: "honor_fallback",
    message: "Verification unavailable for this task.",
  };
}

async function neynarFetch(path: string): Promise<Response | null> {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) return null;
  return fetch(`https://api.neynar.com${path}`, {
    headers: { accept: "application/json", api_key: apiKey },
  });
}

async function resolveTargetCastHash(): Promise<string> {
  const url = SOCIAL_TARGETS.farcasterMatchdayCast;
  const res = await neynarFetch(
    `/v2/farcaster/cast?identifier=${encodeURIComponent(url)}&type=url`,
  );
  if (res?.ok) {
    const data = (await res.json()) as { cast?: { hash?: string } };
    if (data.cast?.hash) return data.cast.hash;
  }
  return SOCIAL_TARGETS.farcasterCastHash;
}

async function checkFarcasterReplied(fid: number, castHash: string): Promise<boolean> {
  const res = await neynarFetch(
    `/v2/farcaster/cast/conversation?identifier=${castHash}&type=hash&reply_depth=1&limit=50`,
  );
  if (!res?.ok) return false;
  const data = (await res.json()) as {
    conversation?: { cast?: { replies?: { casts?: { author?: { fid?: number } }[] } } };
  };
  const replies = data.conversation?.cast?.replies?.casts ?? [];
  return replies.some((cast) => cast.author?.fid === fid);
}

async function checkFarcasterRecasted(fid: number, castHash: string): Promise<boolean> {
  const res = await neynarFetch(`/v2/farcaster/reactions/cast?hash=${castHash}&types=recasts&limit=100`);
  if (!res?.ok) return false;
  const data = (await res.json()) as { reactions?: { user?: { fid?: number } }[] };
  return (data.reactions ?? []).some((reaction) => reaction.user?.fid === fid);
}

async function checkFarcasterPostedSiteUrl(fid: number): Promise<boolean> {
  const res = await neynarFetch(`/v2/farcaster/feed/user/casts?fid=${fid}&limit=25`);
  if (!res?.ok) return false;
  const data = (await res.json()) as { casts?: { text?: string }[] };
  const host = SITE_URL.replace(/^https?:\/\//, "");
  return (data.casts ?? []).some((cast) => cast.text?.includes(host));
}

export async function verifyFarcasterTask(
  taskId: string,
  links: WalletSocialLinks,
): Promise<SocialVerifyResult> {
  const fc = links.farcaster;
  if (!fc) {
    return {
      verified: false,
      method: "not_connected",
      message: "Connect your Farcaster account first.",
    };
  }

  const castHash = await resolveTargetCastHash();

  try {
    if (taskId === "comment_farcaster_cast") {
      const replied = await checkFarcasterReplied(fc.fid, castHash);
      if (replied) {
        return { verified: true, method: "api", message: "Reply detected on target cast." };
      }
      return {
        verified: false,
        method: "honor_fallback",
        message: "Could not verify reply — mark done if you commented.",
      };
    }

    if (taskId === "engage_fc" || taskId === "engage_farcaster_cast") {
      const [replied, recasted] = await Promise.all([
        checkFarcasterReplied(fc.fid, castHash),
        checkFarcasterRecasted(fc.fid, castHash),
      ]);
      if (replied || recasted) {
        return {
          verified: true,
          method: "api",
          message: "Engagement detected on target cast.",
        };
      }
      return {
        verified: false,
        method: "honor_fallback",
        message: "Like/recast/reply not fully verified — engage then retry.",
      };
    }

    if (taskId === "share_campaign" || taskId === "make_post") {
      const posted = await checkFarcasterPostedSiteUrl(fc.fid);
      if (posted) {
        return { verified: true, method: "api", message: "Campaign cast with site URL detected." };
      }
      return {
        verified: false,
        method: "honor_fallback",
        message: "Cast with the site URL, then verify or mark done.",
      };
    }
  } catch {
    return {
      verified: false,
      method: "honor_fallback",
      message: "Farcaster API check failed — mark done if you completed the action.",
    };
  }

  return {
    verified: false,
    method: "honor_fallback",
    message: "Verification unavailable for this task.",
  };
}

export async function verifyQuestStep(
  step: "follow_x" | "engage_x" | "engage_fc",
  links: WalletSocialLinks,
): Promise<SocialVerifyResult> {
  if (step === "follow_x" || step === "engage_x") {
    return verifyXTask(step, links);
  }
  return verifyFarcasterTask(step, links);
}

export async function verifySocialTask(
  taskId: string,
  links: WalletSocialLinks,
): Promise<SocialVerifyResult> {
  if (
    taskId === "follow_x" ||
    taskId === "engage_x" ||
    taskId === "engage_x_post" ||
    taskId === "comment_x_post" ||
    taskId === "like_share_x" ||
    taskId === "make_post" ||
    taskId === "share_campaign"
  ) {
    return verifyXTask(taskId, links);
  }

  if (
    taskId === "engage_fc" ||
    taskId === "engage_farcaster_cast" ||
    taskId === "comment_farcaster_cast" ||
    taskId === "follow_farcaster"
  ) {
    if (taskId === "follow_farcaster") {
      return {
        verified: false,
        method: "honor_fallback",
        message: "Follow verification uses honor system for now.",
      };
    }
    return verifyFarcasterTask(taskId, links);
  }

  return {
    verified: false,
    method: "honor_fallback",
    message: "Task not eligible for API verification.",
  };
}
