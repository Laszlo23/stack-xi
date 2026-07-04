import { createFileRoute } from "@tanstack/react-router";
import type { MemberTaskId } from "@/domain/types";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";
import { getWalletSocialLinks } from "@/lib/server/social-storage";
import { verifySocialTask } from "@/lib/server/social-verify";
import { isMemberTaskId } from "@/lib/profile/member-tasks";

export const Route = createFileRoute("/api/social/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rateLimited = checkRateLimit(request, { routeId: "social-verify", maxPerWindow: 20 });
        if (rateLimited) return rateLimited;

        const unauthorized = requireTrustedOrigin(request);
        if (unauthorized) return unauthorized;

        let body: { address?: string; taskId?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return jsonError(400, "Invalid JSON body");
        }

        const address = body.address?.trim().toLowerCase();
        const taskId = body.taskId?.trim();

        if (!address || !taskId || !isMemberTaskId(taskId)) {
          return jsonError(400, "Valid address and taskId required");
        }

        const links = await getWalletSocialLinks(address);
        if (!links) {
          return new Response(
            JSON.stringify({
              verified: false,
              method: "not_connected",
              message: "Connect X or Farcaster first.",
            }),
            { status: 200, headers: securityHeaders() },
          );
        }

        const result = await verifySocialTask(taskId as MemberTaskId, links);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: securityHeaders(),
        });
      },
    },
  },
});
