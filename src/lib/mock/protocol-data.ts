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
    id: "mkt-br-arg",
    home: "Brazil",
    away: "Argentina",
    stage: "World Cup · Semi Final",
    kickoff: "Sat 21:00 UTC",
    status: "live",
    homeProb: 44,
    awayProb: 38,
    drawProb: 18,
    volume: 2_840_000,
    narrative: "The empire meets its mirror — liquidity coiled at kickoff.",
  },
  {
    id: "mkt-de-fr",
    home: "Germany",
    away: "France",
    stage: "World Cup · Quarter Final",
    kickoff: "Fri 20:00 UTC",
    status: "upcoming",
    homeProb: 36,
    awayProb: 41,
    drawProb: 23,
    volume: 1_120_000,
    narrative: "Two tactical giants. Probability shifts every training cycle.",
  },
  {
    id: "mkt-ng-gh",
    home: "Nigeria",
    away: "Ghana",
    stage: "World Cup · Round of 16",
    kickoff: "Tue 18:30 UTC",
    status: "upcoming",
    homeProb: 52,
    awayProb: 31,
    drawProb: 17,
    volume: 680_000,
    narrative: "Underdog narrative loading — Strikers camp on alert.",
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
    marketId: "mkt-br-arg",
    marketLabel: "Brazil vs Argentina",
    side: "long",
    stake: 250,
    entryProb: 41,
    pnl: 18.5,
    exposure: "medium",
    status: "open",
    openedAt: "2h ago",
  },
  {
    id: "pos-2",
    marketId: "mkt-de-fr",
    marketLabel: "Germany vs France",
    side: "short",
    stake: 120,
    entryProb: 39,
    pnl: -4.2,
    exposure: "low",
    status: "open",
    openedAt: "5h ago",
  },
];

export const ORACLE_FEED: OracleEvent[] = [
  {
    id: "orc-1",
    matchId: "mkt-br-arg",
    type: "kickoff",
    minute: 0,
    description: "Kickoff — Brazil vs Argentina. Referee Protocol online.",
    timestamp: "21:00:04",
  },
  {
    id: "orc-2",
    matchId: "mkt-br-arg",
    type: "goal",
    minute: 23,
    description: "GOAL · Brazil. Long probability +6.2%",
    timestamp: "21:23:11",
  },
  {
    id: "orc-3",
    matchId: "mkt-br-arg",
    type: "halftime",
    minute: 45,
    description: "Halftime · 1-0. Liquidity rebalancing in Veterans Camp.",
    timestamp: "21:45:00",
  },
  {
    id: "orc-4",
    matchId: "mkt-br-arg",
    type: "var",
    minute: 52,
    description: "VAR check — goal confirmed. Strikers exposure spikes.",
    timestamp: "22:02:33",
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
    headline: "The empire wobbles",
    body: "Brazil trails at halftime — liquidity shifts from Veterans to Strikers.",
    tag: "empire",
  },
  {
    id: "ch-2",
    headline: "Strikers awaken",
    body: "Nigeria upset odds compress. Chaos liquidity event in the meme layer.",
    tag: "underdog",
  },
  {
    id: "ch-3",
    headline: "Captain benched",
    body: "Whale LONG on Argentina fails at 88'. Next cycle governance penalty.",
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
