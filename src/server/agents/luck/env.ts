import type { LuckActionType } from "@/lib/server/luck-agent-storage";

export function luckAutoSupportEnabled(): boolean {
  const v = process.env.LUCK_AGENT_AUTO_SUPPORT?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function luckAutoOriginalEnabled(): boolean {
  const v = process.env.LUCK_AGENT_AUTO_ORIGINAL?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function luckPublishingPaused(): boolean {
  const v = process.env.LUCK_AGENT_PAUSED?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function luckDailyCap(action: LuckActionType): number {
  const caps: Record<LuckActionType, string | undefined> = {
    quote: process.env.LUCK_AGENT_CAP_QUOTE,
    reply: process.env.LUCK_AGENT_CAP_REPLY,
    retweet: process.env.LUCK_AGENT_CAP_RETWEET,
    original: process.env.LUCK_AGENT_CAP_ORIGINAL,
    matchday: process.env.LUCK_AGENT_CAP_MATCHDAY,
  };
  const defaults: Record<LuckActionType, number> = {
    quote: 2,
    reply: 3,
    retweet: 1,
    original: 2,
    matchday: 2,
  };
  const raw = caps[action]?.trim();
  if (!raw) return defaults[action];
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : defaults[action];
}

export function luckPostCooldownMinutes(): number {
  const raw = process.env.LUCK_AGENT_COOLDOWN_MINUTES?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 45;
  return Number.isFinite(n) && n >= 0 ? n : 45;
}

export function luckSlackWebhookUrl(): string | undefined {
  return process.env.LUCK_AGENT_SLACK_WEBHOOK?.trim() || undefined;
}

export function luckLlmEnabled(): boolean {
  const v = process.env.LUCK_AGENT_LLM_ENABLED?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function luckOpenAiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim() || undefined;
}
