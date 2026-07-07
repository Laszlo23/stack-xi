import { createFileRoute } from "@tanstack/react-router";
import { getLiveTicker } from "@/lib/server/live-ticker-storage";

export const Route = createFileRoute("/api/matches/live")({
  server: {
    handlers: {
      GET: async () => {
        const ticker = await getLiveTicker();
        return Response.json({ ticker });
      },
    },
  },
});
