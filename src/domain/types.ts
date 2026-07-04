export type RiskTier = "veterans" | "midfield" | "strikers";

export type MarketStatus = "upcoming" | "live" | "settled";

export type PositionSide = "long" | "short" | "draw";

export type ExposureLevel = "low" | "medium" | "high";

export type OracleEventType = "goal" | "halftime" | "fulltime" | "kickoff" | "var";

export type PositionStatus = "open" | "won" | "lost" | "pending";

export type PlayerRarity = "Mythic" | "Legendary" | "Rare" | "Common";

export type AccentColor = "neon" | "electric" | "magenta";

export type TrainingCamp = {
  id: string;
  tier: RiskTier;
  name: string;
  tagline: string;
  tvl: number;
  apy: number;
  riskLabel: string;
  accent: AccentColor;
  description: string;
};

export type MatchMarket = {
  id: string;
  home: string;
  away: string;
  stage: string;
  kickoff: string;
  status: MarketStatus;
  homeProb: number;
  awayProb: number;
  drawProb: number;
  volume: number;
  narrative: string;
};

export type UserPosition = {
  id: string;
  marketId: string;
  marketLabel: string;
  side: PositionSide;
  stake: number;
  entryProb: number;
  pnl: number;
  exposure: ExposureLevel;
  status: PositionStatus;
  openedAt: string;
};

export type OracleEvent = {
  id: string;
  matchId: string;
  type: OracleEventType;
  minute: number;
  description: string;
  timestamp: string;
};

export type FoundingPlayer = {
  id: number;
  name: string;
  role: string;
  rarity: PlayerRarity;
  form: number;
  unlocked: boolean;
  img?: string;
  accent: AccentColor;
  winRate: number;
  yieldEarned: number;
  participationScore: number;
};

export type VaultDeposit = {
  campId: string;
  amount: number;
  lpShares: number;
  depositedAt: string;
};

export type ChronicleEntry = {
  id: string;
  headline: string;
  body: string;
  tag: "empire" | "underdog" | "whale" | "chaos";
};

export type MemberTaskId =
  | "daily_login"
  | "like_share_x"
  | "make_post"
  | "follow_farcaster"
  | "mint_squad"
  | "submit_prediction"
  | "engage_x_post"
  | "comment_x_post"
  | "engage_farcaster_cast"
  | "comment_farcaster_cast"
  | "share_campaign"
  | "connect_x"
  | "connect_farcaster"
  | "open_telegram_game"
  | "invite_telegram_friend"
  | "connect_telegram"
  | "share_telegram_matchday";

export type MemberTaskVerification = "auto" | "honor" | "social";

export type MemberTask = {
  id: MemberTaskId;
  label: string;
  description: string;
  points: number;
  verification: MemberTaskVerification;
};

export type MintTxRecord = {
  txId: string;
  playerId: number;
  at: string;
};

export type MemberProgress = {
  completedTaskIds: MemberTaskId[];
  loginStreak: number;
  totalXp: number;
  lastLoginDate: string;
  predictionTxIds: string[];
  mintTxIds: MintTxRecord[];
};

export type SquadHolding = {
  player: FoundingPlayer;
  mintOrder: number;
};
