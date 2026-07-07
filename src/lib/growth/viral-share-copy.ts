import { buildSharePost } from "@/lib/growth/share-copy";

export function buildHeroPickShare(input: {
  pick: string;
  home: string;
  away: string;
  matchPath?: string;
}): string {
  return buildSharePost(
    [
      `I picked ${input.pick} 🐸⚽`,
      `${input.home} vs ${input.away}`,
      "Can Pepe beat me?",
    ],
    { path: input.matchPath ?? "/" },
  );
}

export function buildWinShare(input: {
  pick: string;
  matchLabel: string;
  matchPath?: string;
}): string {
  return buildSharePost(
    [`Pepe predicted it.`, `Luck followed. 🐸`, `${input.pick} · ${input.matchLabel}`],
    { path: input.matchPath ?? "/" },
  );
}

export function buildNftShare(input: { playerName: string; mintOrder: number }): string {
  return buildSharePost(
    [
      `I own player #${input.mintOrder} in STACK XI 🐸⚽`,
      `${input.playerName} — founding card locked.`,
      "I was here from the beginning.",
    ],
    { path: "/squad" },
  );
}

export function buildJourneyShare(input: { tierLabel: string }): string {
  return buildSharePost(
    [`I reached ${input.tierLabel} level on STACK XI 🐸⚽`, "Culture > solo grind."],
    { path: "/profile" },
  );
}

export function buildLeaderboardShare(input: { rank: number }): string {
  return buildSharePost(
    [`I'm Top ${input.rank} on STACK XI today 🏆🐸`, "Beat me if you can."],
    { path: "/leaderboard" },
  );
}
