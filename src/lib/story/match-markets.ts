import {
  DALLAS_SCHEDULE,
  getActiveMatchday,
  getLastCompletedMatchday,
  type DallasMatch,
} from "./dallas-schedule";
import {
  AUSTRIAN_BUNDESLIGA_SCHEDULE,
  getActiveAustrianMatchday,
  getLastCompletedAustrianMatchday,
} from "./austrian-bundesliga-schedule";

export type MarketKind = "world_cup" | "austrian_bundesliga";

/** After World Cup final — switch predict market to Austrian Bundesliga. */
export const WORLD_CUP_END_AT = new Date("2026-07-20T04:00:00Z");

export function getActiveMarketKind(now = new Date()): MarketKind {
  return now.getTime() >= WORLD_CUP_END_AT.getTime() ? "austrian_bundesliga" : "world_cup";
}

export function getActiveMarket(now = new Date()): DallasMatch {
  if (getActiveMarketKind(now) === "austrian_bundesliga") {
    return getActiveAustrianMatchday(now);
  }
  return getActiveMatchday(now);
}

export function getLastCompletedMarket(now = new Date()): DallasMatch | null {
  if (getActiveMarketKind(now) === "austrian_bundesliga") {
    return getLastCompletedAustrianMatchday(now);
  }
  return getLastCompletedMatchday(now);
}

export function getMarketSchedule(now = new Date()): DallasMatch[] {
  return getActiveMarketKind(now) === "austrian_bundesliga"
    ? AUSTRIAN_BUNDESLIGA_SCHEDULE
    : DALLAS_SCHEDULE;
}

export function getNextMarket(after: DallasMatch, now = new Date()): DallasMatch | null {
  const schedule = getMarketSchedule(now);
  const idx = schedule.findIndex((m) => m.id === after.id);
  if (idx < 0 || idx >= schedule.length - 1) return null;
  return schedule[idx + 1];
}

export function getMatchById(matchId: string): DallasMatch | undefined {
  return (
    DALLAS_SCHEDULE.find((m) => m.id === matchId) ??
    AUSTRIAN_BUNDESLIGA_SCHEDULE.find((m) => m.id === matchId)
  );
}
