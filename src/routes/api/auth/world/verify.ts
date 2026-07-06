import { createFileRoute } from "@tanstack/react-router";
import type { IDKitResult } from "@worldcoin/idkit-core";

import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";
import { verifyWalletSignature } from "@/lib/server/oauth-pkce";
import {
  isWorldNullifierTaken,
  linkWorldIdAccount,
} from "@/lib/server/social-storage";
import { worldVerifyAction } from "@/lib/server/world-id-config";

function extractNullifier(result: IDKitResult): string | null {
  if (result.protocol_version === "3.0") {
    const item = result.responses[0];
    return item && "nullifier_hash" in item ? String(item.nullifier_hash) : null;
  }
  if (result.protocol_version === "4.0" && !("session_id" in result && result.session_id)) {
    const item = result.responses[0];
    return item?.nullifier ?? null;
  }
  if ("session_id" in result && result.session_id) {
    const item = result.responses[0];
    return item?.session_nullifier?.[0] ?? null;
  }
  return null;
}

export const Route = createFileRoute("/api/auth/world/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rateLimited = checkRateLimit(request, {
          routeId: "auth-world-verify",
          maxPerWindow: 20,
        });
        if (rateLimited) return rateLimited;

        const unauthorized = requireTrustedOrigin(request);
        if (unauthorized) return unauthorized;

        let body: {
          address?: string;
          message?: string;
          signature?: string;
          proof?: IDKitResult;
        };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return jsonError(400, "Invalid JSON body");
        }

        const address = body.address?.trim() as `0x${string}` | undefined;
        const message = body.message?.trim();
        const signature = body.signature?.trim() as `0x${string}` | undefined;
        const proof = body.proof;

        if (!address || !proof) {
          return jsonError(400, "address and proof are required");
        }

        if (message && signature) {
          const valid = await verifyWalletSignature({ address, message, signature });
          if (!valid) {
            return jsonError(401, "Invalid wallet signature");
          }
        }

        const nullifier = extractNullifier(proof);
        if (!nullifier) {
          return jsonError(400, "Could not extract nullifier from proof");
        }

        const expectedAction = worldVerifyAction();
        if (
          proof.protocol_version === "4.0" &&
          "action" in proof &&
          proof.action &&
          proof.action !== expectedAction
        ) {
          return jsonError(400, "Proof action mismatch");
        }

        if (await isWorldNullifierTaken(nullifier, address)) {
          return jsonError(409, "This World ID was already linked to another wallet");
        }

        await linkWorldIdAccount(address, {
          nullifier,
          protocolVersion: proof.protocol_version,
          verifiedAt: new Date().toISOString(),
        });

        return new Response(
          JSON.stringify({
            ok: true,
            worldId: {
              verified: true,
              protocolVersion: proof.protocol_version,
            },
          }),
          { status: 200, headers: securityHeaders() },
        );
      },
    },
  },
});
