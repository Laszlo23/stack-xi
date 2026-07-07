import { createFileRoute } from "@tanstack/react-router";
import { getActiveMarket } from "@/lib/story/match-markets";
import { getAllMatchResults } from "@/lib/server/match-results-storage";

export const Route = createFileRoute("/api/matches/active")({
  server: {
    handlers: {
      GET: async () => {
        const active = getActiveMarket();
        const results = await getAllMatchResults();
        return Response.json({
          active,
          settled: results,
        });
      },
    },
  },
});
