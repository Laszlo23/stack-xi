import { createFileRoute } from "@tanstack/react-router";

import { postTweet, parseMarketingPostBody } from "@/server/x/post-tweet";
import { getTwitterUserClient } from "@/server/x/twitter-client";
import { readLuckAgentAdminSecret } from "@/server/x/x-env";

function unauthorized() {
  return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/marketing/x-post")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = readLuckAgentAdminSecret();
        if (!expected) return unauthorized();
        const hdr =
          request.headers.get("x-luck-agent-admin-secret") ||
          request.headers.get("x-x-marketing-admin-secret");
        if (hdr !== expected) return unauthorized();

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parsed = parseMarketingPostBody(body);
        if (!parsed) {
          return new Response(JSON.stringify({ ok: false, error: "invalid_body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const client = getTwitterUserClient();
        if (!client) {
          return new Response(JSON.stringify({ ok: false, error: "x_client_unconfigured" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }

        const result = await postTweet(client, parsed.text, {
          replyToTweetId: parsed.replyToTweetId,
          quoteTweetId: parsed.quoteTweetId,
        });
        if (!result.ok) {
          return new Response(JSON.stringify({ ok: false, error: result.error }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({
            ok: true,
            tweetId: result.tweetId,
            url: result.url,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
