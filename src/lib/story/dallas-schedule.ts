export type DallasMatch = {
  id: string;
  home: string;
  away: string;
  stage: string;
  kickoffLabel: string;
  kickoffAt: Date;
};

export const DALLAS_SCHEDULE: DallasMatch[] = [
  {
    id: "m1",
    home: "Netherlands",
    away: "Japan",
    stage: "Group Stage",
    kickoffLabel: "Jun 14 · 3:00 PM CT",
    kickoffAt: new Date("2026-06-14T20:00:00Z"),
  },
  {
    id: "m2",
    home: "England",
    away: "Croatia",
    stage: "Group Stage",
    kickoffLabel: "Jun 17 · 3:00 PM CT",
    kickoffAt: new Date("2026-06-17T20:00:00Z"),
  },
  {
    id: "m3",
    home: "Argentina",
    away: "Austria",
    stage: "Group Stage",
    kickoffLabel: "Jun 22 · 12:00 PM CT",
    kickoffAt: new Date("2026-06-22T17:00:00Z"),
  },
  {
    id: "m4",
    home: "Japan",
    away: "Sweden",
    stage: "Group Stage",
    kickoffLabel: "Jun 25 · 6:00 PM CT",
    kickoffAt: new Date("2026-06-25T23:00:00Z"),
  },
  {
    id: "m5",
    home: "Jordan",
    away: "Argentina",
    stage: "Group Stage",
    kickoffLabel: "Jun 27 · 9:00 PM CT",
    kickoffAt: new Date("2026-06-28T02:00:00Z"),
  },
  {
    id: "m6",
    home: "Côte d'Ivoire",
    away: "Norway",
    stage: "Round of 32",
    kickoffLabel: "Jun 30 · 12:00 PM CT",
    kickoffAt: new Date("2026-06-30T17:00:00Z"),
  },
  {
    id: "m7",
    home: "Australia",
    away: "Egypt",
    stage: "Round of 32",
    kickoffLabel: "Jul 3 · 1:00 PM CT",
    kickoffAt: new Date("2026-07-03T18:00:00Z"),
  },
  {
    id: "m8",
    home: "Winner M83",
    away: "Winner M84",
    stage: "Round of 16",
    kickoffLabel: "Jul 6 · 2:00 PM CT",
    kickoffAt: new Date("2026-07-06T19:00:00Z"),
  },
  {
    id: "m9",
    home: "Winner M97",
    away: "Winner M98",
    stage: "Semifinal",
    kickoffLabel: "Jul 14 · 2:00 PM CT",
    kickoffAt: new Date("2026-07-14T19:00:00Z"),
  },
];

export function getActiveMatchday(now = new Date()): DallasMatch {
  const upcoming = DALLAS_SCHEDULE.find((m) => m.kickoffAt.getTime() > now.getTime());
  return upcoming ?? DALLAS_SCHEDULE[DALLAS_SCHEDULE.length - 1];
}

export function getNextMatchday(after: DallasMatch): DallasMatch | null {
  const idx = DALLAS_SCHEDULE.findIndex((m) => m.id === after.id);
  if (idx < 0 || idx >= DALLAS_SCHEDULE.length - 1) return null;
  return DALLAS_SCHEDULE[idx + 1];
}
