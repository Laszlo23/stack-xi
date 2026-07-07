import { createFileRoute } from "@tanstack/react-router";
import { getMarketSchedule } from "@/lib/story/match-markets";

export const Route = createFileRoute("/api/matches/schedule")({
  server: {
    handlers: {
      GET: async () => {
        const schedule = getMarketSchedule();
        return Response.json({ schedule });
      },
    },
  },
});
