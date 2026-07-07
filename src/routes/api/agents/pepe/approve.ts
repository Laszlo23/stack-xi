import { createFileRoute } from "@tanstack/react-router";

import { authorizeWithSecretOrAdmin } from "@/lib/server/agent-auth";
import { pepeNeynarConfigured, readPepeAgentAdminSecret } from "@/server/agents/pepe/env";
import { approvePepeDraft } from "@/server/agents/pepe/tick";

const PEPE_AGENT_HEADERS = ["x-pepe-agent-admin-secret", "x-luck-agent-admin-secret"];

export const Route = createFileRoute("/api/agents/pepe/approve")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = authorizeWithSecretOrAdmin(
          request,
          readPepeAgentAdminSecret,
          PEPE_AGENT_HEADERS,
        );
        if (denied) return denied;

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const draftId = typeof body.draftId === "string" ? body.draftId.trim() : "";
        if (!draftId) {
          return new Response(JSON.stringify({ ok: false, error: "draft_id_required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (!pepeNeynarConfigured()) {
          return new Response(JSON.stringify({ ok: false, error: "neynar_unconfigured" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }

        const result = await approvePepeDraft(draftId);
        return new Response(JSON.stringify(result), {
          status: result.ok ? 200 : 400,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
