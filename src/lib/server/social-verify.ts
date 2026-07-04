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

    if (taskId === "engage_x_post" || taskId === "like_share_x") {
      const replied = await checkXRepliedToTweet(x.accessToken, x.userId, tweetId);
      if (replied) {
        return {
          verified: true,
          method: "api",
          message: "Engagement detected (reply on target thread).",
        };
      }
      return {
        verified: false,
        method: "honor_fallback",
        message:
          "Full like/repost verification needs X API Basic tier — reply detected or mark done manually.",
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

  const castHash = SOCIAL_TARGETS.farcasterCastHash;

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

    if (taskId === "engage_farcaster_cast") {
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
        message: "Like/recast/reply not fully verified — mark done if you engaged.",
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

export async function verifySocialTask(
  taskId: string,
  links: WalletSocialLinks,
): Promise<SocialVerifyResult> {
  if (
    taskId === "engage_x_post" ||
    taskId === "comment_x_post" ||
    taskId === "like_share_x" ||
    taskId === "make_post" ||
    taskId === "share_campaign"
  ) {
    return verifyXTask(taskId, links);
  }

  if (
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
