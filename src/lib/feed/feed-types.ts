export type FeedLane = "agent" | "builder" | "culture" | "user";

export type FeedPlatform = "x" | "farcaster" | "base" | "world";

export type FeedItem = {
  id: string;
  lane: FeedLane;
  platform: FeedPlatform;
  author: string;
  authorHandle?: string;
  text: string;
  timestamp: string;
  url?: string;
  badge?: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type FeedResponse = {
  items: FeedItem[];
  cursor: string | null;
  cachedAt: string;
  agents: {
    luck: { configured: boolean; outcomes: number };
    pepe: { configured: boolean; outcomes: number };
    cultureOps: { configured: boolean; events: number };
  };
};
