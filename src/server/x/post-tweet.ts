import type { TwitterApi } from "twitter-api-v2";

import { getAuthenticatedUserId } from "@/server/x/twitter-client";

export type PostTweetResult =
  | { ok: true; tweetId: string; url: string }
  | { ok: false; error: string };

export type PostTweetOptions = {
  replyToTweetId?: string;
  quoteTweetId?: string;
};

export async function postTweet(
  client: TwitterApi,
  text: string,
  options: PostTweetOptions = {},
): Promise<PostTweetResult> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "empty_text" };
  if (trimmed.length > 280) return { ok: false, error: "text_too_long" };

  try {
    const reply = options.replyToTweetId?.trim()
      ? { in_reply_to_tweet_id: options.replyToTweetId.trim() }
      : undefined;
    const quote = options.quoteTweetId?.trim()
      ? { quote_tweet_id: options.quoteTweetId.trim() }
      : undefined;

    const payload = quote
      ? { text: trimmed, quote_tweet_id: quote.quote_tweet_id }
      : reply
        ? { text: trimmed, reply }
        : { text: trimmed };

    const res = await client.v2.tweet(payload);
    const tweetId = res.data.id;
    if (!tweetId) return { ok: false, error: "no_tweet_id" };
    return { ok: true, tweetId, url: `https://x.com/i/status/${tweetId}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "tweet_post_failed";
    return { ok: false, error: msg };
  }
}

export async function retweetTweet(
  client: TwitterApi,
  tweetId: string,
): Promise<PostTweetResult> {
  const id = tweetId.trim();
  if (!id) return { ok: false, error: "empty_tweet_id" };

  const userId = await getAuthenticatedUserId(client);
  if (!userId) return { ok: false, error: "user_id_unavailable" };

  try {
    const res = await client.v2.retweet(userId, id);
    const retweetId = res.data.retweeted_tweet_id ?? res.data.id;
    if (!retweetId) return { ok: false, error: "no_retweet_id" };
    return { ok: true, tweetId: retweetId, url: `https://x.com/i/status/${retweetId}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "retweet_failed";
    return { ok: false, error: msg };
  }
}

export type TweetMetrics = {
  likes: number;
  retweets: number;
  replies: number;
  impressions?: number;
};

export async function fetchTweetMetrics(
  client: TwitterApi,
  tweetId: string,
): Promise<TweetMetrics | null> {
  try {
    const res = await client.v2.singleTweet(tweetId, {
      "tweet.fields": ["public_metrics"],
    });
    const metrics = res.data.public_metrics;
    if (!metrics) return null;
    return {
      likes: metrics.like_count ?? 0,
      retweets: metrics.retweet_count ?? 0,
      replies: metrics.reply_count ?? 0,
      impressions: metrics.impression_count,
    };
  } catch {
    return null;
  }
}

export function parseMarketingPostBody(body: unknown): {
  text: string;
  replyToTweetId?: string;
  quoteTweetId?: string;
} | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const text = typeof record.text === "string" ? record.text.trim() : "";
  if (!text) return null;
  const replyToTweetId =
    typeof record.replyToTweetId === "string" ? record.replyToTweetId : undefined;
  const quoteTweetId =
    typeof record.quoteTweetId === "string" ? record.quoteTweetId : undefined;
  return { text, replyToTweetId, quoteTweetId };
}
