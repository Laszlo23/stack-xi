import { isAdminRequest } from "@/lib/server/admin-session";

function unauthorized(): Response {
  return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

/** Accept admin session cookie/header or agent-specific secret headers. */
export function authorizeWithSecretOrAdmin(
  request: Request,
  readSecret: () => string | undefined,
  headerNames: string[],
): Response | null {
  if (isAdminRequest(request)) return null;

  const expected = readSecret();
  if (!expected) return unauthorized();

  for (const name of headerNames) {
    if (request.headers.get(name) === expected) return null;
  }

  return unauthorized();
}
