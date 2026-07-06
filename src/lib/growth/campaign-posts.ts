import { buildSharePost } from "@/lib/growth/share-copy";

export type CampaignPost = {
  id: string;
  title: string;
  body: string;
  text: string;
};

const CAMPAIGN_BODIES: readonly { id: string; title: string; lines: readonly string[] }[] = [
  {
    id: "founding-sponsor",
    title: "77 free predictions",
    lines: [
      "First 77 verified builders: connect Farcaster or X, get 1,000 BCC staked free on STACK XI.",
      "Treasury sponsors your onchain receipt — culture > solo grind 🐸⚽",
    ],
  },
  {
    id: "mint-lie",
    title: "Pepe lied about minting",
    lines: [
      "Pepe said he wouldn't mint before kickoff. Pepe lied.",
      "Founding squad from 770 BCC on Base. Culture > solo grind 🐸",
    ],
  },
  {
    id: "bracket-wallet",
    title: "Bracket vs wallet",
    lines: [
      "My bracket said France. My wallet said BCC.",
      "Four QF spots set — Iberian derby in Dallas decides the next. STACK XI onchain 🐸⚽",
    ],
  },
  {
    id: "cast-mint-predict",
    title: "Cast mint predict",
    lines: [
      "Culture > solo grind. I cast, I mint, I predict — Luck handles the rest.",
      "Building Culture matchday hub on Base 🐸",
    ],
  },
  {
    id: "receipt-culture",
    title: "Receipt culture",
    lines: [
      "Receipt culture: if it's not on BaseScan, it didn't happen.",
      "STACK XI — predict, mint, prove onchain 🐸⚽",
    ],
  },
  {
    id: "leonardo-france",
    title: "Leonardo picks France",
    lines: [
      "Leonardo picks France Jul 19. I pick chaos every matchday.",
      "BCC predictions on Base. Pepe doesn't chase — Luck does 🐸",
    ],
  },
  {
    id: "beer-prediction",
    title: "Beer prediction",
    lines: [
      "I told my group chat I'd predict sober. I lied.",
      "Haaland broke Brazil. Bellingham broke Mexico. Iberian derby locked with BCC 🐸🍺",
    ],
  },
  {
    id: "curve-emotional",
    title: "Emotional curve",
    lines: [
      "The bonding curve doesn't care about your feelings. It cares about conviction.",
      "770 BCC start · +70 BCC every mint. Early believers write the lore 🐸",
    ],
  },
  {
    id: "luck-meter",
    title: "Luck meter",
    lines: [
      "Luck isn't random. It's showing up for matchday, minting the squad, and casting your pick.",
      "77M BCC airdrop loading for culture participants 🐸⚽",
    ],
  },
  {
    id: "video-shoutout",
    title: "Video shout-out",
    lines: [
      "Every founding minter gets a personal video shout-out. Leonardo tags you. The culture tags you back.",
      "Mint the squad on Base before the curve gets emotional 🐸",
    ],
  },
  {
    id: "crowd-wrong",
    title: "Crowd is wrong",
    lines: [
      "Crowd consensus is loud. Crowd is usually wrong.",
      "Cast-to-unlock your pick on STACK XI. BCC on Base 🐸⚽",
    ],
  },
  {
    id: "pepe-luck",
    title: "Pepe and Luck",
    lines: [
      "Pepe doesn't chase liquidity. He plays inside it.",
      "Building Culture World Cup matchdays on Base — mint, predict, prove 🐸",
    ],
  },
  {
    id: "full-culture",
    title: "Full culture arc",
    lines: [
      "This isn't a protocol pitch. It's a group chat that became a World Cup watch party with BCC and heart.",
      "Join the culture layer on STACK XI 🐸⚽",
    ],
  },
];

function buildCampaignPost(entry: (typeof CAMPAIGN_BODIES)[number], seed: number): CampaignPost {
  const text = buildSharePost(entry.lines, { path: "/", tagSeed: seed });
  return { id: entry.id, title: entry.title, body: entry.lines.join("\n"), text };
}

export const CAMPAIGN_POSTS: CampaignPost[] = CAMPAIGN_BODIES.map((entry, index) =>
  buildCampaignPost(entry, index + 1),
);

export function getDailyCampaignPost(now = new Date()): CampaignPost {
  const dayIndex = now.getDate() % CAMPAIGN_POSTS.length;
  return CAMPAIGN_POSTS[dayIndex]!;
}

export function getCampaignPostById(id: string): CampaignPost | undefined {
  return CAMPAIGN_POSTS.find((post) => post.id === id);
}
