import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "stackxi_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function adminSecret(): string | null {
  return process.env.ADMIN_SECRET?.trim() || process.env.PEPE_AGENT_ADMIN_SECRET?.trim() || null;
}

function signToken(payload: string): string {
  const secret = adminSecret();
  if (!secret) throw new Error("ADMIN_SECRET not configured");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function readAdminSecret(): string | null {
  return adminSecret();
}

export function verifyAdminSecret(candidate: string | null | undefined): boolean {
  const secret = adminSecret();
  if (!secret || !candidate) return false;
  try {
    const a = Buffer.from(candidate);
    const b = Buffer.from(secret);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function createAdminSessionToken(): string | null {
  const secret = adminSecret();
  if (!secret) return null;
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${expiresAt}.${nonce}`;
  const sig = signToken(payload);
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string | null | undefined): boolean {
  if (!token || !adminSecret()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expiresRaw, nonce, sig] = parts;
  if (!expiresRaw || !nonce || !sig) return false;
  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  const payload = `${expiresRaw}.${nonce}`;
  const expected = signToken(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function adminSessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_MS / 1000}${secure}`;
}

export function clearAdminSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

export function parseAdminSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match?.[1] ?? null;
}

export function isAdminRequest(request: Request): boolean {
  const cookie = parseAdminSessionCookie(request.headers.get("cookie"));
  if (verifyAdminSessionToken(cookie)) return true;
  const hdr = request.headers.get("x-admin-secret")?.trim();
  return verifyAdminSecret(hdr);
}

export function requireAdmin(request: Request): Response | null {
  if (isAdminRequest(request)) return null;
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}
