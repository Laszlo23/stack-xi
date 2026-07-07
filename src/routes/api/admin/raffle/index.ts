import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/lib/server/admin-session";
import {
  adminCloseRaffleEntries,
  adminCommitDraw,
  adminRevealAndDraw,
} from "@/lib/server/raffle-allowlist";
import { questStats } from "@/lib/server/quest-storage";
import { readRaffleOnchainState } from "@/lib/server/raffle-chain";
import type { Hex } from "viem";

export const Route = createFileRoute("/api/admin/raffle/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const denied = requireAdmin(request);
        if (denied) return denied;

        const [raffle, stats] = await Promise.all([readRaffleOnchainState(), questStats()]);
        return Response.json({ raffle, questStats: stats });
      },
      POST: async ({ request }) => {
        const denied = requireAdmin(request);
        if (denied) return denied;

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const action = typeof body.action === "string" ? body.action : "";

        if (action === "close_entries") {
          const result = await adminCloseRaffleEntries();
          return Response.json(result, { status: result.ok ? 200 : 500 });
        }

        if (action === "commit_draw") {
          const secretHex = typeof body.secretHex === "string" ? body.secretHex.trim() : "";
          if (!secretHex.startsWith("0x") || secretHex.length !== 66) {
            return Response.json({ error: "secretHex must be 32-byte hex" }, { status: 400 });
          }
          const result = await adminCommitDraw(secretHex as Hex);
          return Response.json(result, { status: result.ok ? 200 : 500 });
        }

        if (action === "reveal_draw") {
          const secretHex = typeof body.secretHex === "string" ? body.secretHex.trim() : "";
          if (!secretHex.startsWith("0x") || secretHex.length !== 66) {
            return Response.json({ error: "secretHex must be 32-byte hex" }, { status: 400 });
          }
          const result = await adminRevealAndDraw(secretHex as Hex);
          return Response.json(result, { status: result.ok ? 200 : 500 });
        }

        return Response.json({ error: "unknown_action" }, { status: 400 });
      },
    },
  },
});
