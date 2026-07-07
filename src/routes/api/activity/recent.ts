import { createFileRoute } from "@tanstack/react-router";
import { getBlendedActivity, getGlobalPredictionCount } from "@/lib/server/activity-blend";
import { predictionsToActivity, readPredictionIndex } from "@/lib/server/prediction-indexer";

export const Route = createFileRoute("/api/activity/recent")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const limitRaw = url.searchParams.get("limit");
        const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 20;

        const index = await readPredictionIndex();
        const realActivity = predictionsToActivity(index.predictions, limit);
        const items = getBlendedActivity(realActivity, Number.isFinite(limit) ? limit : 20);
        const totalPredictions = getGlobalPredictionCount(index.predictions.length);

        return Response.json(
          { items, totalPredictions },
          { headers: { "cache-control": "public, max-age=30" } },
        );
      },
    },
  },
});
