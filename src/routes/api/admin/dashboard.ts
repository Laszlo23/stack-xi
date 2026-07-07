import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/lib/server/admin-session";
import { listAllClaims } from "@/lib/server/claim-storage";
import { getAllMatchResults, upsertMatchResult } from "@/lib/server/match-results-storage";
import { getLiveTicker, setLiveTicker } from "@/lib/server/live-ticker-storage";
import type { LiveTickerState } from "@/lib/server/live-ticker-storage";

export const Route = createFileRoute("/api/admin/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const denied = requireAdmin(request);
        if (denied) return denied;

        const [claims, results, ticker] = await Promise.all([
          listAllClaims(),
          getAllMatchResults(),
          getLiveTicker(),
        ]);

        return Response.json({
          claims,
          results,
          ticker,
          pendingClaims: claims.filter((c) => c.status === "requested").length,
        });
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

        if (action === "set_match_result") {
          const matchId = typeof body.matchId === "string" ? body.matchId : "";
          const winner = body.winner === "home" || body.winner === "away" ? body.winner : null;
          const result = typeof body.result === "string" ? body.result : "";
          const payoutsOpen = body.payoutsOpen !== false;
          if (!matchId || !winner || !result) {
            return Response.json({ error: "invalid_match_result" }, { status: 400 });
          }
          const stored = await upsertMatchResult({ matchId, winner, result, payoutsOpen });
          return Response.json({ ok: true, result: stored });
        }

        if (action === "set_ticker") {
          const ticker = body.ticker as LiveTickerState | undefined;
          if (!ticker?.matchId) {
            return Response.json({ error: "invalid_ticker" }, { status: 400 });
          }
          const stored = await setLiveTicker(ticker);
          return Response.json({ ok: true, ticker: stored });
        }

        return Response.json({ error: "unknown_action" }, { status: 400 });
      },
    },
  },
});
