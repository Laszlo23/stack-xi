import { createFileRoute } from "@tanstack/react-router";

import { approvePepeDraft } from "@/server/agents/pepe/tick";
import { pepeNeynarConfigured, readPepeAgentAdminSecret } from "@/server/agents/pepe/env";

function unauthorized() {
  return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/agents/pepe/approve")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = readPepeAgentAdminSecret();
        if (!expected) return unauthorized();
        const hdr =
          request.headers.get("x-pepe-agent-admin-secret") ||
          request.headers.get("x-luck-agent-admin-secret");
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
