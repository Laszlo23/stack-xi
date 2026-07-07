import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/lib/server/admin-session";
import { markClaimPaid } from "@/lib/server/claim-storage";

export const Route = createFileRoute("/api/admin/claims/mark-paid")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = requireAdmin(request);
        if (denied) return denied;

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const claimId = typeof body.claimId === "string" ? body.claimId.trim() : "";
        const payoutTxHash =
          typeof body.payoutTxHash === "string" ? body.payoutTxHash.trim() : undefined;

        if (!claimId) {
          return Response.json({ error: "claim_id_required" }, { status: 400 });
        }

        const updated = await markClaimPaid(claimId, payoutTxHash);
        if (!updated) {
          return Response.json({ error: "claim_not_found" }, { status: 404 });
        }

        return Response.json({ ok: true, claim: updated });
      },
    },
  },
});
