import type {
  ChronicleEntry,
  MatchMarket,
  OracleEvent,
  TrainingCamp,
  UserPosition,
} from "@/domain/types";

export const TRAINING_CAMPS: TrainingCamp[] = [
  {
    id: "camp-veterans",
    tier: "veterans",
    name: "Veterans Camp",
    tagline: "Safe Yield · Club Backers",
    tvl: 1_240_000,
    apy: 8.4,
    riskLabel: "Low risk · steady culture yield",
    accent: "neon",
    description:
      "Conservative LP layer. Earn from trading fees and settled match markets with minimal drawdown.",
  },
  {
    id: "camp-midfield",
    tier: "midfield",
    name: "Midfield Camp",
    tagline: "Balanced Yield · Momentum LPs",
    tvl: 890_000,
    apy: 14.2,
    riskLabel: "Medium risk · narrative swings",
    accent: "electric",
    description:
      "Split exposure across fee streams and live match volatility. For holders who ride the story arc.",
  },
  {
    id: "camp-strikers",
    tier: "strikers",
    name: "Strikers Camp",
    tagline: "High Risk Meme Yield",
    tvl: 420_000,
    apy: 28.7,
    riskLabel: "High risk · chaos liquidity",
    accent: "magenta",
    description:
      "Meme capital squad. Maximum upside when underdogs win and liquidity events hit the chain league.",
  },
];

export const MATCH_MARKETS: MatchMarket[] = [
  {
    id: "mkt-pt-es",
    home: "Portugal",
    away: "Spain",
    stage: "World Cup · Round of 16 · Dallas",
    kickoff: "Mon 19:00 UTC",
    status: "upcoming",
    homeProb: 42,
    awayProb: 44,
    drawProb: 14,
    volume: 1_680_000,
    narrative:
      "Iberian derby after Ramos and Oyarzabal wrote R32 epics — liquidity coiled for Dallas.",
  },
  {
    id: "mkt-py-fr",
    home: "Paraguay",
    away: "France",
    stage: "World Cup · Round of 16 · Philadelphia",
    kickoff: "Sat 21:00 UTC",
    status: "live",
    homeProb: 18,
    awayProb: 62,
    drawProb: 20,
    volume: 2_240_000,
    narrative: "Paraguay stunned Germany on pens — France and Mbappé favored to advance.",
  },
  {
    id: "mkt-ca-ma",
    home: "Canada",
    away: "Morocco",
    stage: "World Cup · Round of 16 · Houston",
    kickoff: "Sat 18:00 UTC",
    status: "live",
    homeProb: 38,
    awayProb: 40,
    drawProb: 22,
    volume: 980_000,
    narrative: "2022 rematch with a quarterfinal berth on the line.",
  },
  {
    id: "mkt-eg-ar",
    home: "Egypt",
    away: "Argentina",
    stage: "World Cup · Round of 16 · Atlanta",
    kickoff: "Tue 17:00 UTC",
    status: "upcoming",
    homeProb: 22,
    awayProb: 58,
    drawProb: 20,
    volume: 1_420_000,
    narrative: "Salah vs Messi after Egypt's first-ever knockout win on pens in Dallas.",
  },
  {
    id: "mkt-stack-culture",
    home: "STACK XI",
    away: "Culture FC",
    stage: "Chain League · Matchday 3",
    kickoff: "Settled",
    status: "settled",
    homeProb: 100,
    awayProb: 0,
    drawProb: 0,
    volume: 940_000,
    narrative: "Club victory — founding squad form ratings boosted.",
  },
];

export const FEATURED_MATCH = {
  ...MATCH_MARKETS[0],
  predictionsOpenUntil: "halftime" as const,
};

export const SEED_POSITIONS: UserPosition[] = [
  {
    id: "pos-1",
    marketId: "mkt-py-fr",
    marketLabel: "Paraguay vs France",
    side: "short",
    stake: 250,
    entryProb: 62,
    pnl: 12.4,
    exposure: "medium",
    status: "open",
    openedAt: "1h ago",
  },
  {
    id: "pos-2",
    marketId: "mkt-pt-es",
    marketLabel: "Portugal vs Spain",
    side: "long",
    stake: 180,
    entryProb: 42,
    pnl: -2.1,
    exposure: "low",
    status: "open",
    openedAt: "3h ago",
  },
];

export const ORACLE_FEED: OracleEvent[] = [
  {
    id: "orc-1",
    matchId: "mkt-py-fr",
    type: "kickoff",
    minute: 0,
    description: "Kickoff — Paraguay vs France. Round of 16 · Philadelphia.",
    timestamp: "21:00:02",
  },
  {
    id: "orc-2",
    matchId: "mkt-py-fr",
    type: "goal",
    minute: 34,
    description: "GOAL · France. Mbappé · Short probability +8.1%",
    timestamp: "21:34:18",
  },
  {
    id: "orc-3",
    matchId: "mkt-pt-es",
    type: "halftime",
    minute: 0,
    description: "Preview — Portugal vs Spain opens Dallas R16 Monday 2 PM CT.",
    timestamp: "Scheduled",
  },
  {
    id: "orc-4",
    matchId: "mkt-eg-ar",
    type: "var",
    minute: 0,
    description: "Egypt advance on pens in Dallas — Salah vs Messi next in Atlanta.",
    timestamp: "Jul 3",
  },
  {
    id: "orc-5",
    matchId: "mkt-stack-culture",
    type: "fulltime",
    minute: 90,
    description: "Full time · STACK XI 2-1 Culture FC. Culture Yield distributed.",
    timestamp: "Yesterday",
  },
];

export const CHRONICLE_ENTRIES: ChronicleEntry[] = [
  {
    id: "ch-1",
    headline: "Pharaohs on pens",
    body: "Egypt beat Australia 4-2 on pens in Dallas — first men's WC knockout win.",
    tag: "underdog",
  },
  {
    id: "ch-2",
    headline: "Iberian derby loading",
    body: "Portugal and Spain collide in Dallas Jul 6 after dramatic R32 wins.",
    tag: "empire",
  },
  {
    id: "ch-3",
    headline: "France path",
    body: "Leonardo's bracket: France lift the trophy Jul 19 in New York.",
    tag: "whale",
  },
];

export function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function sideToTeam(side: "long" | "short" | "draw", market: MatchMarket): string {
  if (side === "long") return market.home;
  if (side === "short") return market.away;
  return "Draw";
}

export function entryProbForSide(side: "long" | "short" | "draw", market: MatchMarket): number {
  if (side === "long") return market.homeProb;
  if (side === "short") return market.awayProb;
  return market.drawProb;
}
