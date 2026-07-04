import { WORLD_CUP_WINNER_PICK } from "@/lib/story/dallas-schedule";

/** Tournament snapshot as of Jul 4, 2026 — Round of 16 underway. */
export const WORLD_CUP_SNAPSHOT = {
  asOf: "2026-07-04",
  phase: "Round of 16",
  winnerPick: WORLD_CUP_WINNER_PICK,
  finalDate: "Jul 19 · New York",
  recentResults: [
    "Egypt 1-1 Australia — Egypt win 4-2 on pens (first WC knockout win)",
    "Argentina 3-2 Cape Verde (AET) — Messi goal #20",
    "Portugal 2-1 Croatia — Ramos 93rd-minute winner (Toronto)",
    "Spain 3-0 Austria — back in R16 for first time since 2010",
    "France 3-0 Sweden · Norway 2-1 Côte d'Ivoire (Dallas R32)",
    "Germany out to Paraguay on pens · Netherlands out to Morocco on pens",
  ],
  todayFixtures: [
    "Canada vs Morocco · Houston · Jul 4",
    "Paraguay vs France · Philadelphia · Jul 4",
  ],
  nextDallas: "Portugal vs Spain · Round of 16 · Jul 6 · 2:00 PM CT",
  bracketNote: `${WORLD_CUP_WINNER_PICK} is Leonardo's pick to lift the trophy on Jul 19.`,
} as const;
