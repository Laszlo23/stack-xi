import type { DallasMatch } from "./dallas-schedule";
import { AUSTRIAN_BUNDESLIGA_SCHEDULE } from "./austrian-bundesliga-schedule";
import { DALLAS_SCHEDULE } from "./dallas-schedule";
import { getActiveMarket, getMarketSchedule } from "./match-markets";

function slugifyTeam(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function matchSlug(match: Pick<DallasMatch, "home" | "away">): string {
  return `${slugifyTeam(match.home)}-vs-${slugifyTeam(match.away)}`;
}

export function getMatchBySlug(slug: string): DallasMatch | undefined {
  const all = [...DALLAS_SCHEDULE, ...AUSTRIAN_BUNDESLIGA_SCHEDULE];
  return all.find((m) => matchSlug(m) === slug);
}

export function getActiveMatchSlug(now = new Date()): string {
  return matchSlug(getActiveMarket(now));
}

export function listMatchSlugs(now = new Date()): Array<{ slug: string; match: DallasMatch }> {
  return getMarketSchedule(now).map((match) => ({ slug: matchSlug(match), match }));
}

export function matchPath(match: Pick<DallasMatch, "home" | "away">): string {
  return `/match/${matchSlug(match)}`;
}
