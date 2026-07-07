import { createFileRoute } from "@tanstack/react-router";
import { getAllMatchResults } from "@/lib/server/match-results-storage";

export const Route = createFileRoute("/api/matches/results")({
  server: {
    handlers: {
      GET: async () => {
        const results = await getAllMatchResults();
        return Response.json({ results });
      },
    },
  },
});
