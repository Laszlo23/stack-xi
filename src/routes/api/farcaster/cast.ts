import { createFileRoute } from "@tanstack/react-router";
import {
  checkRateLimit,
  jsonError,
  requireTrustedOrigin,
  securityHeaders,
} from "@/lib/server/api-guard";
import { validateCastText } from "@/lib/swap/validate-swap-params";

export const Route = createFileRoute("/api/farcaster/cast")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rateLimited = checkRateLimit(request, {
          routeId: "farcaster-cast",
          maxPerWindow: 10,
        });
        if (rateLimited) return rateLimited;

        const unauthorized = requireTrustedOrigin(request);
        if (unauthorized) return unauthorized;

        const apiKey = process.env.NEYNAR_API_KEY;
        const signerUuid = process.env.NEYNAR_SIGNER_UUID ?? process.env.GROVE_NEYNAR_SIGNER_UUID;

        if (!apiKey || !signerUuid) {
          return new Response(
            JSON.stringify({
              error: "Neynar auto-post not configured (NEYNAR_API_KEY + NEYNAR_SIGNER_UUID)",
            }),
            { status: 503, headers: securityHeaders() },
          );
        }

        let text = "";
        try {
          const body = (await request.json()) as { text?: string };
          text = body.text?.trim() ?? "";
        } catch {
          return jsonError(400, "Invalid JSON body");
        }

        if (!text) {
          return jsonError(400, "Missing cast text");
        }

        const castValidation = validateCastText(text);
        if (!castValidation.ok) {
          return jsonError(400, castValidation.error);
        }

        try {
          const response = await fetch("https://api.neynar.com/v2/farcaster/cast", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-api-key": apiKey,
            },
            body: JSON.stringify({
              signer_uuid: signerUuid,
              text,
            }),
          });

          if (!response.ok) {
            const body = await response.text();
            throw new Error(body.slice(0, 200));
          }

          const data = (await response.json()) as unknown;
          return new Response(JSON.stringify({ ok: true, data }), {
            headers: securityHeaders(),
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Neynar cast failed";
          return new Response(JSON.stringify({ error: message }), {
            status: 502,
            headers: securityHeaders(),
          });
        }
      },
    },
  },
});
