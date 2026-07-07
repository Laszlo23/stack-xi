import { WORLD_CUP_WINNER_PICK } from "@/lib/story/dallas-schedule";

/** Tournament snapshot as of Jul 7, 2026 — six QF spots filled, R16 doubleheader today. */
export const WORLD_CUP_SNAPSHOT = {
  asOf: "2026-07-07",
  phase: "Round of 16 · Messi vs Salah today",
  winnerPick: WORLD_CUP_WINNER_PICK,
  finalDate: "Jul 19 · New York",
  quarterfinalists: ["Morocco", "France", "Norway", "England", "Spain", "Belgium"] as const,
  confirmedQuarterfinals: [
    "France vs Morocco · Boston · Jul 9 · 4:00 PM ET",
    "Norway vs England · Miami · Jul 11 · 5:00 PM ET",
    "Spain vs Belgium · LA · Jul 10 · 3:00 PM ET",
  ],
  recentResults: [
    "Belgium 4-1 USA — De Ketelaere brace; Tillman FK; all three hosts out in R16",
    "Spain 1-0 Portugal — Merino 91' in Dallas; Ronaldo's WC farewell",
    "England 3-2 Mexico — Bellingham brace; Kane pen drama at Azteca",
    "Norway 2-1 Brazil — Haaland 79' & 90'; Brazil out before quarters",
    "Morocco 3-0 Canada — Houston rout into quarters",
    "France 1-0 Paraguay — Mbappé WC goal #19 in Philadelphia",
    "Egypt 4-2 pens vs Australia — first men's WC knockout win (Dallas)",
    "Argentina 3-2 Cape Verde (AET) — Messi goal #20",
  ],
  todayFixtures: [
    "Argentina vs Egypt · Atlanta · Jul 7 · 12:00 PM ET",
    "Switzerland vs Colombia · Vancouver · Jul 7 · 4:00 PM ET",
  ],
  upcomingR16: [] as const,
  nextHighlight: "Messi vs Salah · Atlanta · Jul 7 · noon ET",
  bracketNote: `${WORLD_CUP_WINNER_PICK} through — Belgium rout USA in Seattle; Spain await in LA Jul 10.`,
} as const;
