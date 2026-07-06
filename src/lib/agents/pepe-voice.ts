import { PROTOCOL_TAGLINE } from "@/domain/constants";
import { getDailyCampaignPost } from "@/lib/growth/campaign-posts";
import { getTodayCalendarDay } from "@/lib/growth/viral-calendar";
import { getRotatingBuilderTagsLine } from "@/lib/growth/share-copy";
import { voiceCheck } from "@/lib/agents/luck-voice";
import { serverSiteUrl } from "@/server/x/x-env";

export type PepePillar =
  | "matchday"
  | "builder_feed"
  | "luck_myth"
  | "receipt_culture"
  | "community_shout";

export const PEPE_PILLAR_ROTATION: PepePillar[] = [
  "matchday",
  "builder_feed",
  "luck_myth",
  "receipt_culture",
  "community_shout",
];

export type PepeCopy = {
  pillar: PepePillar;
  text: string;
  hook: string;
  requiresApproval: boolean;
};

function trimForCast(text: string, maxLen = 320): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

function withUtm(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}ref=pepe-agent`;
}

export function pepeVoiceCheck(
  text: string,
  maxLen = 320,
): { ok: true } | { ok: false; reason: string } {
  return voiceCheck(text, maxLen);
}

export function selectPepePillar(now = new Date()): PepePillar {
  return PEPE_PILLAR_ROTATION[now.getUTCHours() % PEPE_PILLAR_ROTATION.length]!;
}

export function buildPepeReplyText(handle: string, note?: string): string {
  const clean = handle.startsWith("@") ? handle : `@${handle}`;
  const flavor = note ? ` — ${note}` : "";
  return trimForCast(
    `The feed is the match${flavor}. ${clean} been building while timelines chase noise. Pepe sees you 🐸⚽`,
  );
}

export function generatePepeCopy(pillar: PepePillar, now = new Date()): PepeCopy {
  const site = withUtm(serverSiteUrl());
  const tags = getRotatingBuilderTagsLine(4, now.getDate());

  switch (pillar) {
    case "matchday": {
      const day = getTodayCalendarDay(now);
      if (day) {
        return {
          pillar,
          hook: day.hook,
          text: trimForCast(`${day.farcasterPost}\n${site}`),
          requiresApproval: true,
        };
      }
      const campaign = getDailyCampaignPost(now);
      return {
        pillar,
        hook: campaign.title,
        text: trimForCast(`${campaign.text}\n${site}`),
        requiresApproval: true,
      };
    }
    case "luck_myth": {
      const campaign = getDailyCampaignPost(now);
      return {
        pillar,
        hook: campaign.id,
        text: trimForCast(`${campaign.text}\n${site}`),
        requiresApproval: true,
      };
    }
    case "receipt_culture":
      return {
        pillar,
        hook: "receipt-culture",
        text: trimForCast(
          `Receipt culture on Base: predict, mint, prove. If it's not onchain, Pepe doesn't count it 🐸\n${site}`,
        ),
        requiresApproval: true,
      };
    case "community_shout":
      return {
        pillar,
        hook: "builder-tags",
        text: trimForCast(
          `Culture > solo grind. Tag the builders who reply with warmth.\n${tags}\n${PROTOCOL_TAGLINE}\n${site}`,
        ),
        requiresApproval: true,
      };
    case "builder_feed":
    default:
      return {
        pillar: "builder_feed",
        hook: "builder-feed",
        text: trimForCast(
          `Pepe reads the builder feed so you don't have to scroll alone. Matchday energy + Base receipts 🐸⚽\n${site}`,
        ),
        requiresApproval: false,
      };
  }
}

export function generatePepeSupportCopy(
  action: "reply" | "recast",
  handle: string,
  note?: string,
): PepeCopy {
  const text =
    action === "reply"
      ? buildPepeReplyText(handle, note)
      : trimForCast(`Recasting culture from ${handle.startsWith("@") ? handle : `@${handle}`} 🐸⚽`);
  return {
    pillar: "builder_feed",
    hook: `support-${action}-${handle.replace("@", "")}`,
    text,
    requiresApproval: false,
  };
}
