import type { ExposureLevel, PositionSide, RiskTier } from "./types";

export const PROTOCOL_NAME = "STACK XI";
export const PROTOCOL_TAGLINE = "Pepe doesn't chase. Luck does.";
export const PROTOCOL_ONE_LINER =
  "Building Culture matchday hub on Base — mint the founding squad with BCC, predict World Cup picks, swap on 0x, and prove it onchain.";
export const PROTOCOL_POSITIONING = "Social prediction sport · not finance · not NFT banking";

export const RISK_TIER_LABELS: Record<RiskTier, string> = {
  veterans: "Veterans",
  midfield: "Midfield",
  strikers: "Strikers",
};

export const POSITION_SIDE_LABELS: Record<PositionSide, string> = {
  long: "LONG",
  short: "SHORT",
  draw: "DRAW",
};

export const EXPOSURE_LABELS: Record<ExposureLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
