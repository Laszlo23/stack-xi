import { createFileRoute } from "@tanstack/react-router";
import { listRaffleTicketEntries } from "@/lib/server/raffle-chain";

export const Route = createFileRoute("/api/raffle/entries")({
  server: {
    handlers: {
      GET: async () => {
        const entries = await listRaffleTicketEntries();
        return Response.json({ entries, total: entries.length });
      },
    },
  },
});
