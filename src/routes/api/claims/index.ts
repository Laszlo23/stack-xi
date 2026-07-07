import { createFileRoute } from "@tanstack/react-router";
import { listClaimsForAddress } from "@/lib/server/claim-storage";

export const Route = createFileRoute("/api/claims/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const address = url.searchParams.get("address")?.trim();

        if (!address?.startsWith("0x") || address.length !== 42) {
          return Response.json({ error: "invalid_address" }, { status: 400 });
        }

        const claims = await listClaimsForAddress(address);
        return Response.json({ address, claims });
      },
    },
  },
});
