import { useMemo } from "react";
import { getRotatingBuilderTags } from "@/lib/growth/share-copy";
import { getTodayCalendarDay } from "@/lib/growth/viral-calendar";
import { getActiveMarket } from "@/lib/story/match-markets";
import { matchSlug } from "@/lib/story/match-slugs";

export function useDailyHomeContent(now = new Date()) {
  return useMemo(() => {
    const match = getActiveMarket(now);
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000,
    );
    const calendarDay = getTodayCalendarDay(now);
    const builderSpotlight = getRotatingBuilderTags(1, dayOfYear)[0] ?? "@0xleonardo";

    return {
      match,
      matchSlug: matchSlug(match),
      memeHeadline: calendarDay?.theme ?? "Today's matchday energy",
      questHighlight: `Quest bonus · Day ${(dayOfYear % 7) + 1}`,
      xpBonus: dayOfYear % 3 === 0 ? "2× Culture XP on first pick" : "+10 XP for sharing your call",
      builderSpotlight,
    };
  }, [now]);
}
