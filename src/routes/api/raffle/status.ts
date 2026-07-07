import { createFileRoute } from "@tanstack/react-router";
import { questStats } from "@/lib/server/quest-storage";
import { listRaffleTicketEntries, readRaffleOnchainState } from "@/lib/server/raffle-chain";
import { RAFFLE_DRAW_DEADLINE, RAFFLE_PRIZE_BCC } from "@/lib/quest/quest-config";

export const Route = createFileRoute("/api/raffle/status")({
  server: {
    handlers: {
      GET: async () => {
        const [raffle, stats, entries] = await Promise.all([
          readRaffleOnchainState(),
          questStats(),
          listRaffleTicketEntries(),
        ]);

        return Response.json({
          raffle,
          questStats: stats,
          entries,
          prizeBcc: RAFFLE_PRIZE_BCC,
          drawDeadline: RAFFLE_DRAW_DEADLINE,
        });
      },
    },
  },
});
