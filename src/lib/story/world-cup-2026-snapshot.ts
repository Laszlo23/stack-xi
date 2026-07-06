import { WORLD_CUP_WINNER_PICK } from "@/lib/story/dallas-schedule";

/** Tournament snapshot as of Jul 6, 2026 — Round of 16, four quarterfinalists confirmed. */
export const WORLD_CUP_SNAPSHOT = {
  asOf: "2026-07-06",
  phase: "Round of 16 · quarterfinals forming",
  winnerPick: WORLD_CUP_WINNER_PICK,
  finalDate: "Jul 19 · New York",
  quarterfinalists: ["Morocco", "France", "Norway", "England"] as const,
  confirmedQuarterfinals: [
    "France vs Morocco · Boston · Jul 9 · 4:00 PM ET",
    "Norway vs England · Miami · Jul 11 · 5:00 PM ET",
  ],
  recentResults: [
    "England 3-2 Mexico — Bellingham brace, Kane pen; Quansah red; El Tri out at Azteca",
    "Norway 2-1 Brazil — Haaland 79' & 90'; Brazil's QF streak ends at eight",
    "Morocco 3-0 Canada — first QF since 2022; Houston rout",
    "France 1-0 Paraguay — Mbappé WC goal #19; Les Bleus through in Philadelphia",
    "Portugal 2-1 Croatia — Ramos 93rd-minute winner (Toronto)",
    "Spain 3-0 Austria — first R16 win since South Africa 2010",
    "Egypt 4-2 pens vs Australia — first men's WC knockout win (Dallas)",
    "Argentina 3-2 Cape Verde (AET) — Messi goal #20",
  ],
  todayFixtures: [
    "Portugal vs Spain · Dallas · Jul 6 · 2:00 PM CT",
    "USA vs Belgium · Seattle · Jul 6 · 8:00 PM ET",
  ],
  upcomingR16: [
    "Argentina vs Egypt · Atlanta · Jul 7 · 12:00 PM ET",
    "Switzerland vs Colombia · Vancouver · Jul 7 · 4:00 PM ET",
  ],
  nextDallas: "Portugal vs Spain · Round of 16 · Jul 6 · 2:00 PM CT",
  bracketNote: `${WORLD_CUP_WINNER_PICK} through to the quarters — Leonardo's pick to lift the trophy Jul 19.`,
} as const;
