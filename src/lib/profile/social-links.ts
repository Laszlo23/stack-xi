import { buildSharePost } from "@/lib/growth/share-copy";
import { SOCIAL_TARGETS } from "@/lib/growth/social-targets";

export const SOCIAL_LINKS = {
  xTargetPost: import.meta.env.VITE_X_TARGET_POST_URL ?? SOCIAL_TARGETS.xMatchdayPost,
  farcasterTargetCast:
    import.meta.env.VITE_FARCASTER_TARGET_CAST_URL ?? SOCIAL_TARGETS.farcasterMatchdayCast,
  farcasterFollow: import.meta.env.VITE_FARCASTER_FOLLOW_URL ?? "https://farcaster.xyz/0xleonardo",
  communityX: import.meta.env.VITE_COMMUNITY_X_URL ?? "https://x.com/buildingcultu3",
} as const;

export const DEFAULT_POST_COPY = buildSharePost(
  [
    "STACK XI matchday on Base — Pepe lore, BCC predictions, founding squad mint from 770 BCC.",
    "Team culture > solo grind 🐸⚽",
  ],
  { path: "/" },
);

export function xComposeUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function xReplyUrl(tweetId: string, text?: string): string {
  const base = `https://twitter.com/intent/tweet?in_reply_to=${tweetId}`;
  if (!text) return base;
  return `${base}&text=${encodeURIComponent(text)}`;
}

export function xRetweetUrl(tweetId: string): string {
  return `https://twitter.com/intent/retweet?tweet_id=${tweetId}`;
}

export function farcasterComposeUrl(text: string): string {
  return `https://farcaster.xyz/~/compose?text=${encodeURIComponent(text)}`;
}
