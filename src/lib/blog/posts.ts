export type BlogSection = {
  heading?: string;
  paragraphs: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  category: string;
  tags: string[];
  readTimeMinutes: number;
  heroImage?: string;
  sections: BlogSection[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "pepe-matchdays-on-base",
    title: "Pepe Matchdays on Base: Why STACK XI Exists",
    excerpt:
      "Dallas World Cup energy meets Building Culture on Base — BCC predictions, founding squad mints, and a Pepe luck arc built for builders who ship with heart.",
    publishedAt: "2026-07-01T12:00:00.000Z",
    author: "Leonardo · STACK XI",
    category: "Culture",
    tags: ["Base", "World Cup 2026", "Pepe", "Farcaster"],
    readTimeMinutes: 4,
    heroImage: "/pepeheadball.jpg",
    sections: [
      {
        paragraphs: [
          "STACK XI started as a group chat that accidentally became a World Cup watch party with financial consequences — in the best way.",
          "Pepe doesn't chase hype. Luck does. That line isn't marketing copy; it's the emotional through-line for every Dallas matchday story we ship on Base.",
        ],
      },
      {
        heading: "What you can do today",
        paragraphs: [
          "Scroll the visual Pepe lore on the home page, stake BCC on the active Dallas matchday, mint from the 11-player founding squad bonding curve, and track culture missions on your member profile.",
          "Everything runs on Base mainnet. Connect a wallet, verify contract addresses on BaseScan, and treat predictions like a watch-party bet — not financial advice.",
        ],
      },
      {
        heading: "Builders in the frame",
        paragraphs: [
          "The story names the people who made onchain culture feel human: Jesse on Base, Dan on Farcaster, and a feed full of builders who reply with warmth instead of gatekeeping.",
          "If you've ever minted at 2am and prayed someone would care — this product is for you.",
        ],
      },
    ],
  },
  {
    slug: "bonding-curve-squad-mint",
    title: "Blind Pack Squad Mint: 770 + 7 BCC Curve Explained",
    excerpt:
      "847 sealed packs on Base — 77 editions per player. Mint blind, open on-chain, joker to pick. Global curve starts at 770 BCC (+7 BCC per pack).",
    publishedAt: "2026-07-02T10:00:00.000Z",
    author: "Leonardo · STACK XI",
    category: "NFT",
    tags: ["ERC-721", "BCC", "bonding curve", "Base", "blind pack"],
    readTimeMinutes: 5,
    heroImage: "/pepecard.jpg",
    sections: [
      {
        paragraphs: [
          "The community squad is a blind pack game. Mint sealed, then open on-chain to reveal your player — 77 editions per character across 11 founding players.",
          "Pricing is transparent: currentMintPrice and nextMintPrice on StackXISquadV2. Every pack mint raises the global curve for everyone.",
        ],
      },
      {
        heading: "Jokers and early believers",
        paragraphs: [
          "The first 77 global minters earn early-believer status and a joker credit to pick their player on open instead of random reveal.",
          "Genesis v1 holders (the original 11) keep permanent legend perks including the top prediction boost tier.",
        ],
      },
      {
        heading: "Enforced perks",
        paragraphs: [
          "Squad holdings unlock prediction claim boosts (+5% to +25%), merch discount codes on your profile, and culture XP multipliers — calculated from on-chain holdings at claim time.",
          "Approve BCC for the exact current price at transaction time. Only mint from the official StackXISquadV2 contract linked in-app.",
        ],
      },
    ],
  },
  {
    slug: "usdc-predictions-dallas-2026",
    title: "BCC Predictions for Dallas World Cup 2026",
    excerpt:
      "Pick home or away, choose a BCC stake tier, and record your matchday conviction on Base — a guided Pepe flow from side selection to onchain receipt.",
    publishedAt: "2026-07-02T16:00:00.000Z",
    author: "Leonardo · STACK XI",
    category: "Predictions",
    tags: ["BCC", "PredictionPool", "Dallas", "World Cup"],
    readTimeMinutes: 4,
    heroImage: "/pepesoccerbeer.jpg",
    sections: [
      {
        paragraphs: [
          "Predictions are the heartbeat of matchday. STACK XI wraps them in Pepe-guided steps: pick a team, choose 1K / 5K / 10K BCC conviction, connect Base wallet, approve, and submit.",
          "Transactions go through the PredictionPool contract — not a raw token transfer — so your pick is recorded with matchId and side on-chain.",
        ],
      },
      {
        heading: "MVP settlement note",
        paragraphs: [
          "Dallas events during beta may settle manually while oracle automation matures. Read pool behavior and Terms before staking amounts you can't afford to lose.",
          "Crowd split percentages in the UI are illustrative matchday flavor, not live order-book data.",
        ],
      },
      {
        heading: "After you submit",
        paragraphs: [
          "You'll get a BaseScan receipt, profile mission credit for submit_prediction, and share copy tuned for X and Farcaster.",
          "Luck handles the vibes. You handle the conviction.",
        ],
      },
    ],
  },
  {
    slug: "from-base-believers-to-bitcoin-finals",
    title: "From Base Believers to Bitcoin Finals",
    excerpt:
      "STACK XI is Base-first for Dallas 2026. The /finals arc reserves Stacks and Bitcoin for the championship story — here's the roadmap tone.",
    publishedAt: "2026-07-03T09:00:00.000Z",
    author: "Leonardo · STACK XI",
    category: "Roadmap",
    tags: ["Stacks", "Bitcoin", "finals", "sBTC"],
    readTimeMinutes: 3,
    heroImage: "/gaolpepe.jpg",
    sections: [
      {
        paragraphs: [
          "Most of the app lives on Base because that's where our community ships daily: BCC, fast mints, Farcaster-native sharing.",
          "The /finals route is intentionally separate — a teaser for sBTC-era predictions and Bitcoin finals culture without confusing new users on day one.",
        ],
      },
      {
        heading: "Why split the chains?",
        paragraphs: [
          "Clarity beats maximalism in UX. Dallas matchdays need one wallet, one stablecoin, one mint contract. Finals deserve their own myth.",
          "Early squad minters who earn on-chain earlyBeliever flags are part of the bridge narrative when the Stacks chapter opens.",
        ],
      },
    ],
  },
  {
    slug: "member-profile-culture-missions",
    title: "Member Profile & Culture Missions",
    excerpt:
      "XP, streaks, squad holdings, and six culture missions — daily login, social tasks, mint, and predict — keyed to your wallet in local storage.",
    publishedAt: "2026-07-03T14:00:00.000Z",
    updatedAt: "2026-07-03T18:00:00.000Z",
    author: "Leonardo · STACK XI",
    category: "Product",
    tags: ["profile", "XP", "missions", "wallet"],
    readTimeMinutes: 3,
    heroImage: "/fallpepepenug.jpg",
    sections: [
      {
        paragraphs: [
          "Connect on Base and open /profile to see your culture card: total XP, login streak, early believer badge, and on-chain squad holdings pulled via minted() + ownerOf reads.",
          "Six missions mix auto-verified onchain actions with honor-system social tasks — like sharing a matchday cast or following on Farcaster.",
        ],
      },
      {
        heading: "Privacy-first progress",
        paragraphs: [
          "Mission state lives in your browser keyed to wallet address — not on our servers in v1. Clear site data to reset progress; on-chain mints and predictions remain on Base forever.",
          "See the Privacy Policy for the full breakdown.",
        ],
      },
    ],
  },
];

const POSTS_BY_SLUG = new Map(BLOG_POSTS.map((post) => [post.slug, post]));

export function getBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return POSTS_BY_SLUG.get(slug);
}

export function formatBlogDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
