/**
 * Lightweight server-side guards for API routes (rate limit + optional shared secret).
 * In-memory limits suit single-instance deploys (Lovable); use edge KV for multi-region.
 */

const RATE_WINDOW_MS = 60_000;
const DEFAULT_MAX_PER_WINDOW = 30;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(
  request: Request,
  options?: { maxPerWindow?: number; routeId?: string },
): Response | null {
  const max = options?.maxPerWindow ?? DEFAULT_MAX_PER_WINDOW;
  const key = `${options?.routeId ?? "api"}:${clientKey(request)}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > max) {
    return jsonError(429, "Too many requests — try again in a minute");
  }

  return null;
}

export function requireInternalApiSecret(request: Request): Response | null {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return null;

  const header = request.headers.get("x-internal-api-secret");
  if (header === secret) return null;

  return requireTrustedOrigin(request);
}

/** Block cross-origin abuse of server routes; allow same-site browser + secret header. */
export function requireTrustedOrigin(request: Request): Response | null {
  const secret = process.env.INTERNAL_API_SECRET;
  if (secret && request.headers.get("x-internal-api-secret") === secret) {
    return null;
  }

  const siteUrl = process.env.VITE_SITE_URL?.replace(/\/$/, "") ?? "";
  const origin = request.headers.get("origin") ?? "";
  const referer = request.headers.get("referer") ?? "";

  const allowedBases = [
    siteUrl,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
  ].filter(Boolean);

  const trusted = allowedBases.some((base) => origin.startsWith(base) || referer.startsWith(base));

  if (trusted) return null;

  // Same-host requests may omit Origin; require Referer or secret in production.
  if (!origin && !referer && process.env.NODE_ENV === "production") {
    return jsonError(403, "Forbidden");
  }

  if (origin && !trusted) {
    return jsonError(403, "Forbidden");
  }

  return null;
}

export function jsonError(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function securityHeaders(): Record<string, string> {
  return {
    "content-type": "application/json",
    "x-content-type-options": "nosniff",
    "cache-control": "no-store",
  };
}
