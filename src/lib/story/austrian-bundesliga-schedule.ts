import type { DallasMatch } from "./dallas-schedule";
import { getPredictionWindow } from "@/lib/predict/match-window";

/** SK Rapid Wien — Austrian vibe, Building Culture shoutout. */
export const AUSTRIAN_LEAGUE_TAGLINE = "World Cup → Austrian Bundesliga · SK Rapid Wien first";

export type AustrianMatch = DallasMatch;

export const AUSTRIAN_BUNDESLIGA_SCHEDULE: AustrianMatch[] = [
  {
    id: "rapid-m1",
    home: "SK Rapid Wien",
    away: "FK Austria Wien",
    stage: "Bundesliga · Der Klassiker",
    kickoffLabel: "Aug 9 · 5:00 PM CEST",
    kickoffAt: new Date("2026-08-09T15:00:00Z"),
  },
  {
    id: "rapid-m2",
    home: "SK Rapid Wien",
    away: "Red Bull Salzburg",
    stage: "Bundesliga · Top clash",
    kickoffLabel: "Aug 23 · 4:30 PM CEST",
    kickoffAt: new Date("2026-08-23T14:30:00Z"),
  },
  {
    id: "rapid-m3",
    home: "SK Sturm Graz",
    away: "SK Rapid Wien",
    stage: "Bundesliga · Away day",
    kickoffLabel: "Sep 6 · 5:00 PM CEST",
    kickoffAt: new Date("2026-09-06T15:00:00Z"),
  },
];

export function getActiveAustrianMatchday(now = new Date()): AustrianMatch {
  const openFixture = AUSTRIAN_BUNDESLIGA_SCHEDULE.find(
    (m) => !m.result && !m.isProjected && getPredictionWindow(m, now).status === "open",
  );
  if (openFixture) return openFixture;

  const upcoming = AUSTRIAN_BUNDESLIGA_SCHEDULE.find(
    (m) => !m.result && !m.isProjected && m.kickoffAt.getTime() > now.getTime(),
  );
  if (upcoming) return upcoming;

  const realFixtures = AUSTRIAN_BUNDESLIGA_SCHEDULE.filter((m) => !m.isProjected);
  return realFixtures.at(-1) ?? AUSTRIAN_BUNDESLIGA_SCHEDULE[AUSTRIAN_BUNDESLIGA_SCHEDULE.length - 1]!;
}

export function getLastCompletedAustrianMatchday(now = new Date()): AustrianMatch | null {
  const completed = AUSTRIAN_BUNDESLIGA_SCHEDULE.filter(
    (m) => m.result && m.kickoffAt.getTime() <= now.getTime(),
  );
  return completed.at(-1) ?? null;
}
