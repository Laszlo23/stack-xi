import { createFileRoute } from "@tanstack/react-router";

import { approveLuckDraft } from "@/server/agents/luck/tick";
import { getTwitterUserClient } from "@/server/x/twitter-client";
import { readLuckAgentAdminSecret } from "@/server/x/x-env";

function unauthorized() {
  return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/agents/luck/approve")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = readLuckAgentAdminSecret();
        if (!expected) return unauthorized();
        const hdr =
          request.headers.get("x-luck-agent-admin-secret") ||
          request.headers.get("x-x-marketing-admin-secret");
        if (hdr !== expected) return unauthorized();

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

        const client = getTwitterUserClient();
        if (!client) {
          return new Response(JSON.stringify({ ok: false, error: "x_client_unconfigured" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }

        const result = await approveLuckDraft(client, draftId);
        return new Response(JSON.stringify(result), {
          status: result.ok ? 200 : 400,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
