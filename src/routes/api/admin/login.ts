import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit } from "@/lib/server/api-guard";
import {
  adminSessionCookie,
  clearAdminSessionCookie,
  createAdminSessionToken,
  isAdminRequest,
  readAdminSecret,
  verifyAdminSecret,
} from "@/lib/server/admin-session";

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rateLimited = checkRateLimit(request, {
          routeId: "admin-login",
          maxPerWindow: 5,
        });
        if (rateLimited) return rateLimited;

        const expected = readAdminSecret();
        if (!expected) {
          return Response.json({ error: "admin_not_configured" }, { status: 503 });
        }

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const secret = typeof body.secret === "string" ? body.secret.trim() : "";
        if (!verifyAdminSecret(secret)) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        const token = createAdminSessionToken();
        if (!token) {
          return Response.json({ error: "session_failed" }, { status: 500 });
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": adminSessionCookie(token),
          },
        });
      },
      GET: async ({ request }) => {
        return Response.json({ authenticated: isAdminRequest(request) });
      },
      DELETE: async () => {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": clearAdminSessionCookie(),
          },
        });
      },
    },
  },
});
