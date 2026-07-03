export const SOCIAL_LINKS = {
  xTargetPost: import.meta.env.VITE_X_TARGET_POST_URL ?? "https://x.com/buildingcultu3",
  farcasterFollow: import.meta.env.VITE_FARCASTER_FOLLOW_URL ?? "https://farcaster.xyz/0xleonardo",
  communityX: import.meta.env.VITE_COMMUNITY_X_URL ?? "https://x.com/buildingcultu3",
} as const;

export const DEFAULT_POST_COPY =
  "STACK XI matchday on Base — Pepe lore, USDC predictions, founding squad mint from $0.77. Team culture > solo grind 🐸⚽";

export function xComposeUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function farcasterComposeUrl(text: string): string {
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
}
