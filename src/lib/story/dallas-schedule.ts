export type DallasMatch = {
  id: string;
  home: string;
  away: string;
  stage: string;
  kickoffLabel: string;
  kickoffAt: Date;
  /** Final score or shootout result when the match is complete. */
  result?: string;
  /** Bracket projection — not confirmed until teams qualify. */
  isProjected?: boolean;
};

/** Leonardo / Building Culture bracket pick for the tournament winner. */
export const WORLD_CUP_WINNER_PICK = "France";

export const DALLAS_SCHEDULE: DallasMatch[] = [
  {
    id: "m1",
    home: "Netherlands",
    away: "Japan",
    stage: "Group Stage",
    kickoffLabel: "Jun 14 · 3:00 PM CT",
    kickoffAt: new Date("2026-06-14T20:00:00Z"),
    result: "Netherlands 2-1 Japan",
  },
  {
    id: "m2",
    home: "England",
    away: "Croatia",
    stage: "Group Stage",
    kickoffLabel: "Jun 17 · 3:00 PM CT",
    kickoffAt: new Date("2026-06-17T20:00:00Z"),
    result: "England 2-1 Croatia",
  },
  {
    id: "m3",
    home: "Argentina",
    away: "Austria",
    stage: "Group Stage",
    kickoffLabel: "Jun 22 · 12:00 PM CT",
    kickoffAt: new Date("2026-06-22T17:00:00Z"),
    result: "Argentina 2-0 Austria",
  },
  {
    id: "m4",
    home: "Japan",
    away: "Sweden",
    stage: "Group Stage",
    kickoffLabel: "Jun 25 · 6:00 PM CT",
    kickoffAt: new Date("2026-06-25T23:00:00Z"),
    result: "Japan 1-1 Sweden",
  },
  {
    id: "m5",
    home: "Jordan",
    away: "Argentina",
    stage: "Group Stage",
    kickoffLabel: "Jun 27 · 9:00 PM CT",
    kickoffAt: new Date("2026-06-28T02:00:00Z"),
    result: "Argentina 2-0 Jordan",
  },
  {
    id: "m6",
    home: "Côte d'Ivoire",
    away: "Norway",
    stage: "Round of 32",
    kickoffLabel: "Jun 30 · 12:00 PM CT",
    kickoffAt: new Date("2026-06-30T17:00:00Z"),
    result: "Norway 2-1",
  },
  {
    id: "m7",
    home: "Australia",
    away: "Egypt",
    stage: "Round of 32",
    kickoffLabel: "Jul 3 · 1:00 PM CT",
    kickoffAt: new Date("2026-07-03T18:00:00Z"),
    result: "Egypt win 4-2 pens (1-1)",
  },
  {
    id: "m8",
    home: "Portugal",
    away: "Spain",
    stage: "Round of 16",
    kickoffLabel: "Jul 6 · 2:00 PM CT",
    kickoffAt: new Date("2026-07-06T19:00:00Z"),
  },
  {
    id: "m9",
    home: "France",
    away: "Portugal",
    stage: "Semifinal · bracket projection",
    kickoffLabel: "Jul 14 · 2:00 PM CT",
    kickoffAt: new Date("2026-07-14T19:00:00Z"),
    isProjected: true,
  },
];

export function getActiveMatchday(now = new Date()): DallasMatch {
  // Keep the open Dallas fixture active until a result is recorded — kickoff alone
  // must not advance to bracket projections (e.g. France vs Portugal semifinal).
  const openFixture = DALLAS_SCHEDULE.find((m) => !m.result && !m.isProjected);
  if (openFixture) return openFixture;

  const upcoming = DALLAS_SCHEDULE.find(
    (m) => !m.isProjected && m.kickoffAt.getTime() > now.getTime(),
  );
  if (upcoming) return upcoming;

  const realFixtures = DALLAS_SCHEDULE.filter((m) => !m.isProjected);
  return realFixtures.at(-1) ?? DALLAS_SCHEDULE[DALLAS_SCHEDULE.length - 1]!;
}

export function getLastCompletedMatchday(now = new Date()): DallasMatch | null {
  const completed = DALLAS_SCHEDULE.filter(
    (m) => m.result && m.kickoffAt.getTime() <= now.getTime(),
  );
  return completed.at(-1) ?? null;
}

export function getNextMatchday(after: DallasMatch): DallasMatch | null {
  const idx = DALLAS_SCHEDULE.findIndex((m) => m.id === after.id);
  if (idx < 0) return null;
  for (let i = idx + 1; i < DALLAS_SCHEDULE.length; i++) {
    const candidate = DALLAS_SCHEDULE[i]!;
    if (!candidate.isProjected) return candidate;
  }
  return null;
}
