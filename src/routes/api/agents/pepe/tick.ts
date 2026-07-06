import { createFileRoute } from "@tanstack/react-router";

import { getPepeAgentStatus, runPepeTick } from "@/server/agents/pepe/tick";
import { readPepeAgentAdminSecret } from "@/server/agents/pepe/env";

function unauthorized() {
  return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/agents/pepe/tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = readPepeAgentAdminSecret();
        if (!expected) return unauthorized();
        const hdr =
          request.headers.get("x-pepe-agent-admin-secret") ||
          request.headers.get("x-luck-agent-admin-secret");
        if (hdr !== expected) return unauthorized();

        let body: Record<string, unknown> = {};
        try {
          const raw = await request.text();
          if (raw.trim()) body = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const dryRun =
          body.dryRun === true ||
          (typeof body.dryRun === "string" && body.dryRun.toLowerCase() === "true");

        const result = await runPepeTick({ dryRun });

        return new Response(JSON.stringify(result), {
          status: result.ok ? 200 : 400,
          headers: { "Content-Type": "application/json" },
        });
      },
      GET: async () => {
        const status = await getPepeAgentStatus();
        return new Response(JSON.stringify(status), {
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
