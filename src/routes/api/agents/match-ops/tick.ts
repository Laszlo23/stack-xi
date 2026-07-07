import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/lib/server/admin-session";
import { runMatchOpsTick } from "@/server/agents/match-ops/tick";

export const Route = createFileRoute("/api/agents/match-ops/tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = requireAdmin(request);
        if (denied) return denied;

        const url = new URL(request.url);
        const dryRun = url.searchParams.get("dryRun") === "1";

        const result = await runMatchOpsTick({ dryRun });
        return Response.json(result, { status: result.ok ? 200 : 500 });
      },
      GET: async ({ request }) => {
        const denied = requireAdmin(request);
        if (denied) return denied;

        const result = await runMatchOpsTick({ dryRun: true });
        return Response.json(result);
      },
    },
  },
});
