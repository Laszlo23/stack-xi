import type { MemberTask, MemberTaskId } from "@/domain/types";

export const MEMBER_TASKS: MemberTask[] = [
  {
    id: "daily_login",
    label: "Daily check-in",
    description: "Visit your profile once per day. Pepe respects consistency.",
    points: 10,
    verification: "auto",
  },
  {
    id: "like_share_x",
    label: "Like & repost on X",
    description: "Boost the matchday post. Luck notices engagement.",
    points: 25,
    verification: "honor",
  },
  {
    id: "make_post",
    label: "Post about STACK XI",
    description: "Share the vibe on X or Farcaster — your voice, our squad.",
    points: 30,
    verification: "honor",
  },
  {
    id: "follow_farcaster",
    label: "Follow on Farcaster",
    description: "Join the builder feed where Pepe actually reads the comments.",
    points: 20,
    verification: "honor",
  },
  {
    id: "mint_squad",
    label: "Mint a founding player",
    description: "Own a piece of the squad on Base. Video shout-out included.",
    points: 50,
    verification: "auto",
  },
  {
    id: "submit_prediction",
    label: "Lock a USDC prediction",
    description: "Pick a winner and stake real USDC on Base.",
    points: 40,
    verification: "auto",
  },
];

export const TOTAL_MEMBER_XP = MEMBER_TASKS.reduce((sum, t) => sum + t.points, 0);

export function getCultureLevel(xp: number): { label: string; nextAt: number | null } {
  if (xp >= 150) return { label: "Culture Captain", nextAt: null };
  if (xp >= 100) return { label: "Starting XI", nextAt: 150 };
  if (xp >= 50) return { label: "Matchday Regular", nextAt: 100 };
  if (xp >= 25) return { label: "Bench Warmer", nextAt: 50 };
  return { label: "Matchday Rookie", nextAt: 25 };
}

export function isMemberTaskId(value: string): value is MemberTaskId {
  return MEMBER_TASKS.some((t) => t.id === value);
}
