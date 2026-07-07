import { createFileRoute } from "@tanstack/react-router";

import { authorizeWithSecretOrAdmin } from "@/lib/server/agent-auth";
import { readPepeAgentAdminSecret } from "@/server/agents/pepe/env";
import { getPepeAgentStatus, runPepeTick } from "@/server/agents/pepe/tick";

const PEPE_AGENT_HEADERS = ["x-pepe-agent-admin-secret", "x-luck-agent-admin-secret"];

export const Route = createFileRoute("/api/agents/pepe/tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = authorizeWithSecretOrAdmin(
          request,
          readPepeAgentAdminSecret,
          PEPE_AGENT_HEADERS,
        );
        if (denied) return denied;

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
