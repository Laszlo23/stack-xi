export const SOCIAL_TARGETS = {
  xAccount: "buildingcultu3",
  xMatchdayPost: "https://x.com/buildingcultu3/status/2074296249377788348",
  xTweetId: "2074296249377788348",
  farcasterMatchdayCast: "https://farcaster.xyz/0xleonardo/0x20fe989c",
  farcasterCastHash: "0x20fe989c",
  farcasterCastAuthor: "0xleonardo",
} as const;

export type QuestVerifyStep = "follow_x" | "engage_x" | "engage_fc";

export const QUEST_VERIFY_STEPS: QuestVerifyStep[] = ["follow_x", "engage_x", "engage_fc"];

export function isQuestVerifyStep(value: string): value is QuestVerifyStep {
  return (QUEST_VERIFY_STEPS as readonly string[]).includes(value);
}
