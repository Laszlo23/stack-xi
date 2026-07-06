import { createFileRoute } from "@tanstack/react-router";
import { signRequest } from "@worldcoin/idkit-server";
import { proofOfHuman } from "@worldcoin/idkit-core";

import {
  isWorldIdServerConfigured,
  worldAppId,
  worldRpId,
  worldRpSigningKey,
  worldVerifyAction,
} from "@/lib/server/world-id-config";
import { securityHeaders } from "@/lib/server/api-guard";

export const Route = createFileRoute("/api/auth/world/start")({
  server: {
    handlers: {
      GET: async () => {
        if (!isWorldIdServerConfigured()) {
          return new Response(
            JSON.stringify({
              configured: false,
              error: "Set VITE_WORLD_APP_ID, WORLD_RP_ID, WORLD_RP_SIGNING_KEY",
            }),
            { status: 503, headers: securityHeaders() },
          );
        }

        const action = worldVerifyAction();
        const signed = signRequest({
          signingKeyHex: worldRpSigningKey()!,
          action,
          ttl: 3600,
        });

        const appId = worldAppId()!;
        const rpId = worldRpId()!;

        return new Response(
          JSON.stringify({
            configured: true,
            app_id: appId,
            action,
            action_description: "Verify as a unique human to unlock STACK XI predictions",
            preset: proofOfHuman(),
            allow_legacy_proofs: true,
            rp_context: {
              rp_id: rpId,
              nonce: signed.nonce,
              created_at: signed.createdAt,
              expires_at: signed.expiresAt,
              signature: signed.sig,
            },
          }),
          { headers: securityHeaders() },
        );
      },
    },
  },
});
