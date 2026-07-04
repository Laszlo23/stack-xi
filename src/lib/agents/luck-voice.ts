import { PROTOCOL_TAGLINE } from "@/domain/constants";
import { getDailyCampaignPost } from "@/lib/growth/campaign-posts";
import { getTodayCalendarDay } from "@/lib/growth/viral-calendar";
import { getRotatingBuilderTagsLine } from "@/lib/growth/share-copy";
import { serverSiteUrl } from "@/server/x/x-env";

export type LuckPillar =
  | "matchday"
  | "support_og"
  | "luck_myth"
  | "receipt_culture"
  | "community_shout";

export const LUCK_PILLAR_ROTATION: LuckPillar[] = [
  "matchday",
  "support_og",
  "luck_myth",
  "receipt_culture",
  "community_shout",
];

const BLOCKED =
  /\b(100x|guaranteed returns|moon\b|price target|financial advice|airdrop hunter)\b/i;

export const LUCK_AGENT_SYSTEM_PROMPT = `You are Luck — the sarcastic Pepe voice for @0xleonardo on X.
Rules:
- Support established web3 builders first. Cheer people who ship, not hype.
- Blend soccer matchday energy with Base/BCC culture when relevant.
- Sarcastic Pepe tone: "Pepe said he wouldn't… Pepe lied." Luck handles the rest.
- Tagline: "${PROTOCOL_TAGLINE}"
- Never promise price targets, guaranteed returns, or financial advice.
- One CTA max. Prefer linking STACK XI when pitching product.
- Short, punchy, human — not corporate DeFi speak.`;

export function voiceCheck(
  text: string,
  maxLen = 280,
): { ok: true } | { ok: false; reason: string } {
  const t = text.trim();
  if (!t) return { ok: false, reason: "empty" };
  if (t.length > maxLen) return { ok: false, reason: "too_long" };
  if (BLOCKED.test(t)) return { ok: false, reason: "blocked_phrase" };
  return { ok: true };
}

export function selectOutcomeDrivenPillar(rewardScore7d: number | null, now = new Date()): LuckPillar {
  if (rewardScore7d != null && rewardScore7d >= 50) return "support_og";
  if (rewardScore7d != null && rewardScore7d >= 30) return "matchday";
  const hour = now.getUTCHours();
  return LUCK_PILLAR_ROTATION[hour % LUCK_PILLAR_ROTATION.length]!;
}

export function buildSupportQuoteText(handle: string, note?: string): string {
  const clean = handle.startsWith("@") ? handle : `@${handle}`;
  const flavor = note ? ` (${note})` : "";
  return `Pepe said he wouldn't cheer for builders. Pepe lied. ${clean}${flavor} been shipping since before it was cool. Luck's rooting for you 🐸⚽`;
}

export function buildSupportReplyText(handle: string): string {
  const clean = handle.startsWith("@") ? handle : `@${handle}`;
  return `${clean} — culture > solo grind. Luck sees you. 🐸`;
}

export type LuckCopy = {
  pillar: LuckPillar;
  text: string;
  hook: string;
  requiresApproval: boolean;
};

function trimForX(text: string): string {
  const t = text.trim();
  if (t.length <= 280) return t;
  return `${t.slice(0, 277)}…`;
}

function withUtm(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}ref=luck-agent`;
}

export function generateLuckCopy(pillar: LuckPillar, now = new Date()): LuckCopy {
  const site = withUtm(serverSiteUrl());
  const tags = getRotatingBuilderTagsLine(3, now.getDate());

  switch (pillar) {
    case "matchday": {
      const day = getTodayCalendarDay(now);
      if (day) {
        return {
          pillar,
          hook: day.hook,
          text: trimForX(day.xPost),
          requiresApproval: true,
        };
      }
      const campaign = getDailyCampaignPost(now);
      return {
        pillar,
        hook: campaign.title,
        text: trimForX(campaign.text),
        requiresApproval: true,
      };
    }
    case "luck_myth": {
      const campaign = getDailyCampaignPost(now);
      return {
        pillar,
        hook: campaign.id,
        text: trimForX(campaign.text),
        requiresApproval: true,
      };
    }
    case "receipt_culture":
      return {
        pillar,
        hook: "receipt-culture",
        text: trimForX(
          `Receipt culture: if it's not on BaseScan, it didn't happen. STACK XI — predict, mint, prove onchain 🐸⚽\n${site}`,
        ),
        requiresApproval: true,
      };
    case "community_shout":
      return {
        pillar,
        hook: "builder-tags",
        text: trimForX(
          `Culture > solo grind. Builders who believed early deserve the loud applause.\n${tags}\n${site}`,
        ),
        requiresApproval: true,
      };
    case "support_og":
    default:
      return {
        pillar: "support_og",
        hook: "support-radar",
        text: trimForX(
          `OG builders still shipping on Base while timelines chase noise. Luck backs the ones who stayed 🐸⚽\n${tags}`,
        ),
        requiresApproval: false,
      };
  }
}

export function generateSupportCopy(
  action: "quote" | "reply",
  handle: string,
  note?: string,
): LuckCopy {
  const text =
    action === "quote" ? buildSupportQuoteText(handle, note) : buildSupportReplyText(handle);
  return {
    pillar: "support_og",
    hook: `support-${action}-${handle.replace("@", "")}`,
    text: trimForX(text),
    requiresApproval: false,
  };
}
