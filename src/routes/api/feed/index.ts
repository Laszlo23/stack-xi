import { createFileRoute } from "@tanstack/react-router";

import { aggregateCultureFeed } from "@/lib/server/feed-aggregator";

export const Route = createFileRoute("/api/feed/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const limitRaw = url.searchParams.get("limit");
        const cursor = url.searchParams.get("cursor");
        const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 40;

        const feed = await aggregateCultureFeed({
          limit: Number.isFinite(limit) ? limit : 40,
          cursor,
        });

        return new Response(JSON.stringify(feed), {
          headers: {
            "content-type": "application/json",
            "cache-control": "public, max-age=60",
          },
        });
      },
    },
  },
});
