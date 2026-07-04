import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/farcaster/cast")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.NEYNAR_API_KEY;
        const signerUuid = process.env.NEYNAR_SIGNER_UUID;

        if (!apiKey || !signerUuid) {
          return new Response(
            JSON.stringify({
              error: "Neynar auto-post not configured (NEYNAR_API_KEY + NEYNAR_SIGNER_UUID)",
            }),
            { status: 503, headers: { "content-type": "application/json" } },
          );
        }

        let text = "";
        try {
          const body = (await request.json()) as { text?: string };
          text = body.text?.trim() ?? "";
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        if (!text) {
          return new Response(JSON.stringify({ error: "Missing cast text" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
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
            headers: { "content-type": "application/json" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Neynar cast failed";
          return new Response(JSON.stringify({ error: message }), {
            status: 502,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
