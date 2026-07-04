import type { DallasMatch } from "@/lib/story/dallas-schedule";

/** Legacy strict mode: only open in final N minutes before kickoff (off by default). */
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

function strictPreKickoffWindow(): boolean {
  return import.meta.env.VITE_PREDICTION_WINDOW_STRICT === "true";
}

/** Predictions stay open until kickoff; closed after. Strict mode uses 90-min pre-kickoff gate. */
export function getPredictionWindow(match: DallasMatch, now = new Date()): PredictionWindowState {
  const closesAt = match.kickoffAt;
  const strictOpensAt = new Date(closesAt.getTime() - PREDICTION_WINDOW_MINUTES * 60 * 1000);
  const msUntilClose = closesAt.getTime() - now.getTime();

  if (windowAlwaysOpen()) {
    return {
      status: "open",
      opensAt: strictOpensAt,
      closesAt,
      msUntilOpen: 0,
      msUntilClose: Math.max(0, msUntilClose),
    };
  }

  if (now.getTime() >= closesAt.getTime()) {
    return { status: "closed", opensAt: strictOpensAt, closesAt, msUntilOpen: 0, msUntilClose: 0 };
  }

  if (strictPreKickoffWindow()) {
    const msUntilOpen = strictOpensAt.getTime() - now.getTime();
    if (now.getTime() < strictOpensAt.getTime()) {
      return { status: "upcoming", opensAt: strictOpensAt, closesAt, msUntilOpen, msUntilClose };
    }
  }

  return {
    status: "open",
    opensAt: strictOpensAt,
    closesAt,
    msUntilOpen: 0,
    msUntilClose,
  };
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "0m";
  const totalMin = Math.ceil(ms / 60_000);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function isPredictionSubmitAllowed(window: PredictionWindowState): boolean {
  if (windowAlwaysOpen()) return true;
  if (window.status === "closed") return false;
  if (strictPreKickoffWindow()) return window.status === "open";
  return window.status === "open";
}
