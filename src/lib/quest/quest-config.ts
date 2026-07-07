import { BCC_UNIT } from "@/lib/base/config";
import { SOCIAL_TARGETS } from "@/lib/growth/social-targets";

export const RAFFLE_PRIZE_BCC = 7_777_777;
export const RAFFLE_PRIZE_WEI = BigInt(RAFFLE_PRIZE_BCC) * BCC_UNIT;

/** Public draw deadline — admin may close entries earlier. */
export const RAFFLE_DRAW_DEADLINE = "2026-07-12T04:00:00.000Z";

export const QUEST_STEPS = [
  {
    id: "connect" as const,
    label: "Connect wallet + social",
    description: "Link your Base wallet, X, and Farcaster.",
  },
  {
    id: "follow_x" as const,
    label: "Follow @buildingcultu3",
    description: "Follow the official STACK XI account on X.",
    url: "https://x.com/buildingcultu3",
  },
  {
    id: "engage_x" as const,
    label: "Engage on X",
    description: "Like, repost, or comment on the campaign post.",
    url: SOCIAL_TARGETS.xMatchdayPost,
  },
  {
    id: "engage_fc" as const,
    label: "Engage on Farcaster",
    description: "Like, recast, or reply on the campaign cast.",
    url: SOCIAL_TARGETS.farcasterMatchdayCast,
  },
  {
    id: "mint" as const,
    label: "Mint raffle ticket",
    description: "Free ERC721 ticket — you pay Base gas only.",
  },
] as const;

export type QuestStepId = (typeof QUEST_STEPS)[number]["id"];

export type QuestStepsState = {
  connect: boolean;
  followX: boolean;
  engageX: boolean;
  engageFc: boolean;
};

export function allQuestStepsComplete(steps: QuestStepsState): boolean {
  return steps.connect && steps.followX && steps.engageX && steps.engageFc;
}
