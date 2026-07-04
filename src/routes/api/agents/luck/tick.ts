import { createFileRoute } from "@tanstack/react-router";

import { getLuckAgentStatus, runLuckTick } from "@/server/agents/luck/tick";
import { getTwitterUserClient } from "@/server/x/twitter-client";
import { readLuckAgentAdminSecret } from "@/server/x/x-env";

function unauthorized() {
  return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/agents/luck/tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = readLuckAgentAdminSecret();
        if (!expected) return unauthorized();
        const hdr =
          request.headers.get("x-luck-agent-admin-secret") ||
          request.headers.get("x-x-marketing-admin-secret");
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

        const client = getTwitterUserClient();
        const result = await runLuckTick(client, { dryRun });

        return new Response(JSON.stringify(result), {
          status: result.ok ? 200 : 400,
          headers: { "Content-Type": "application/json" },
        });
      },
      GET: async () => {
        const client = getTwitterUserClient();
        const status = await getLuckAgentStatus(client);
        return new Response(JSON.stringify(status), {
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
