import type { ExposureLevel, PositionSide, RiskTier } from "./types";

export const PROTOCOL_NAME = "STACK XI";
export const PROTOCOL_TAGLINE = "Pepe doesn't chase. Luck does.";
export const PROTOCOL_ONE_LINER =
  "Dallas World Cup matchday stories, USDC predictions on Base, and an 11-player founding squad mint.";

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
