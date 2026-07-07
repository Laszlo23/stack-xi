import { createFileRoute } from "@tanstack/react-router";
import {
  getBlendedActivity,
  getBlendedLeaderboard,
  getBlendedMatchStats,
  getGlobalPredictionCount,
} from "@/lib/server/activity-blend";
import {
  getMatchStatsFromIndex,
  predictionsToActivity,
  readPredictionIndex,
} from "@/lib/server/prediction-indexer";

export const Route = createFileRoute("/api/matches/$matchId/stats")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const matchId = params.matchId;
        const index = await readPredictionIndex();
        const real = await getMatchStatsFromIndex(matchId);
        const stats = getBlendedMatchStats(matchId, real);

        return Response.json(stats, {
          headers: { "cache-control": "public, max-age=30" },
        });
      },
    },
  },
});
