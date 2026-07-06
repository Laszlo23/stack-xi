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
    status: "live",
    homeProb: 42,
    awayProb: 44,
    drawProb: 14,
    volume: 2_840_000,
    narrative:
      "Iberian derby with a quarterfinal berth on the line — Ronaldo vs Yamal after four QF spots are already set.",
  },
  {
    id: "mkt-us-be",
    home: "USA",
    away: "Belgium",
    stage: "World Cup · Round of 16 · Seattle",
    kickoff: "Tue 00:00 UTC",
    status: "upcoming",
    homeProb: 36,
    awayProb: 48,
    drawProb: 16,
    volume: 1_920_000,
    narrative:
      "Balogun suspension overturned — USMNT chase first quarterfinal since 2002 in Seattle.",
  },
  {
    id: "mkt-fr-ma",
    home: "France",
    away: "Morocco",
    stage: "World Cup · Quarterfinal · Boston",
    kickoff: "Thu 20:00 UTC",
    status: "upcoming",
    homeProb: 58,
    awayProb: 28,
    drawProb: 14,
    volume: 1_560_000,
    narrative: "Mbappé's France vs unbeaten Morocco — first confirmed quarterfinal Jul 9.",
  },
  {
    id: "mkt-no-en",
    home: "Norway",
    away: "England",
    stage: "World Cup · Quarterfinal · Miami",
    kickoff: "Sat 21:00 UTC",
    status: "upcoming",
    homeProb: 38,
    awayProb: 46,
    drawProb: 16,
    volume: 1_740_000,
    narrative: "Haaland's Norway vs Bellingham's England — Miami quarterfinal Jul 11.",
  },
  {
    id: "mkt-eg-ar",
    home: "Egypt",
    away: "Argentina",
    stage: "World Cup · Round of 16 · Atlanta",
    kickoff: "Tue 16:00 UTC",
    status: "upcoming",
    homeProb: 22,
    awayProb: 58,
    drawProb: 20,
    volume: 1_620_000,
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
    marketId: "mkt-no-en",
    marketLabel: "Norway vs England",
    side: "long",
    stake: 250,
    entryProb: 38,
    pnl: 8.2,
    exposure: "medium",
    status: "open",
    openedAt: "2h ago",
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
    matchId: "mkt-pt-es",
    type: "kickoff",
    minute: 0,
    description: "Kickoff — Portugal vs Spain. Round of 16 · Dallas · quarterfinal berth on the line.",
    timestamp: "19:00:04",
  },
  {
    id: "orc-2",
    matchId: "mkt-no-en",
    type: "goal",
    minute: 90,
    description: "GOAL · Norway. Haaland 90' · Brazil out · first Norway QF ever.",
    timestamp: "Jul 5",
  },
  {
    id: "orc-3",
    matchId: "mkt-fr-ma",
    type: "fulltime",
    minute: 90,
    description: "France 1-0 Paraguay · Mbappé WC goal #19 · QF vs Morocco confirmed Jul 9.",
    timestamp: "Jul 4",
  },
  {
    id: "orc-4",
    matchId: "mkt-eg-ar",
    type: "var",
    minute: 0,
    description: "England 3-2 Mexico at Azteca — Bellingham brace · QF vs Norway Jul 11.",
    timestamp: "Jul 5",
  },
  {
    id: "orc-5",
    matchId: "mkt-us-be",
    type: "halftime",
    minute: 0,
    description: "USA vs Belgium tonight Seattle — Balogun cleared to play after FIFA reversal.",
    timestamp: "Scheduled",
  },
];

export const CHRONICLE_ENTRIES: ChronicleEntry[] = [
  {
    id: "ch-1",
    headline: "Haaland breaks Brazil",
    body: "Norway 2-1 Brazil — two late Haaland goals. First Norwegian quarterfinal ever.",
    tag: "underdog",
  },
  {
    id: "ch-2",
    headline: "Iberian derby live",
    body: "Portugal vs Spain in Dallas — four QF spots already claimed. Ronaldo vs Yamal.",
    tag: "empire",
  },
  {
    id: "ch-3",
    headline: "France path holds",
    body: "Leonardo's bracket: France through to quarters. Trophy pick still Jul 19 in New York.",
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
