import { createFileRoute } from "@tanstack/react-router";
import { getBlendedLeaderboard } from "@/lib/server/activity-blend";

export const Route = createFileRoute("/api/leaderboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const limitRaw = url.searchParams.get("limit");
        const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 50;

        const entries = getBlendedLeaderboard([], Number.isFinite(limit) ? limit : 50);

        return Response.json(
          { entries },
          { headers: { "cache-control": "public, max-age=60" } },
        );
      },
    },
  },
});
