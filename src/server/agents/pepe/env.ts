import type { PepeActionType } from "@/lib/server/pepe-agent-storage";

export function pepeAutoSupportEnabled(): boolean {
  const v = process.env.PEPE_AGENT_AUTO_SUPPORT?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function pepePublishingPaused(): boolean {
  const v = process.env.PEPE_AGENT_PAUSED?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function pepeDailyCap(action: PepeActionType): number {
  const caps: Record<PepeActionType, string | undefined> = {
    reply: process.env.PEPE_AGENT_CAP_REPLY,
    recast: process.env.PEPE_AGENT_CAP_RECAST,
    original: process.env.PEPE_AGENT_CAP_ORIGINAL,
    matchday: process.env.PEPE_AGENT_CAP_MATCHDAY,
  };
  const defaults: Record<PepeActionType, number> = {
    reply: 3,
    recast: 2,
    original: 2,
    matchday: 2,
  };
  const raw = caps[action]?.trim();
  if (!raw) return defaults[action];
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : defaults[action];
}

export function pepePostCooldownMinutes(): number {
  const raw = process.env.PEPE_AGENT_COOLDOWN_MINUTES?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 45;
  return Number.isFinite(n) && n >= 0 ? n : 45;
}

export function pepeSlackWebhookUrl(): string | undefined {
  return process.env.PEPE_AGENT_SLACK_WEBHOOK?.trim() || process.env.LUCK_AGENT_SLACK_WEBHOOK?.trim();
}

export function readPepeAgentAdminSecret(): string | undefined {
  return (
    process.env.PEPE_AGENT_ADMIN_SECRET?.trim() ||
    process.env.LUCK_AGENT_ADMIN_SECRET?.trim() ||
    process.env.X_MARKETING_ADMIN_SECRET?.trim()
  );
}

export function pepeNeynarConfigured(): boolean {
  return Boolean(
    process.env.NEYNAR_API_KEY?.trim() &&
      (process.env.NEYNAR_SIGNER_UUID?.trim() || process.env.GROVE_NEYNAR_SIGNER_UUID?.trim()),
  );
}
