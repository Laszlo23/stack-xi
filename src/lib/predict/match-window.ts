import type { DallasMatch } from "@/lib/story/dallas-schedule";

/** Predictions unlock this many minutes before kickoff. */
export const PREDICTION_WINDOW_MINUTES = 90;

export type PredictionWindowStatus = "open" | "upcoming" | "closed";

export type PredictionWindowState = {
  status: PredictionWindowStatus;
  opensAt: Date;
  closesAt: Date;
  msUntilOpen: number;
  msUntilClose: number;
};

function windowAlwaysOpen(): boolean {
  return import.meta.env.VITE_PREDICTION_WINDOW_ALWAYS_OPEN === "true";
}

export function getPredictionWindow(match: DallasMatch, now = new Date()): PredictionWindowState {
  const closesAt = match.kickoffAt;
  const opensAt = new Date(closesAt.getTime() - PREDICTION_WINDOW_MINUTES * 60 * 1000);
  const msUntilOpen = opensAt.getTime() - now.getTime();
  const msUntilClose = closesAt.getTime() - now.getTime();

  if (windowAlwaysOpen()) {
    return { status: "open", opensAt, closesAt, msUntilOpen: 0, msUntilClose: msUntilClose };
  }

  if (now.getTime() >= closesAt.getTime()) {
    return { status: "closed", opensAt, closesAt, msUntilOpen: 0, msUntilClose: 0 };
  }
  if (now.getTime() < opensAt.getTime()) {
    return { status: "upcoming", opensAt, closesAt, msUntilOpen, msUntilClose };
  }
  return { status: "open", opensAt, closesAt, msUntilOpen: 0, msUntilClose };
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "0m";
  const totalMin = Math.ceil(ms / 60_000);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
