import type { MemberTask } from "@/domain/types";

export const MEMBER_TASKS: MemberTask[] = [
  {
    id: "daily_login",
    label: "Daily check-in",
    description: "Visit your profile once per day. Pepe respects consistency.",
    points: 10,
    verification: "auto",
  },
  {
    id: "connect_x",
    label: "Connect X account",
    description: "Link your X handle to verify engagement missions.",
    points: 15,
    verification: "auto",
  },
  {
    id: "connect_farcaster",
    label: "Connect Farcaster",
    description: "Link your FID to verify cast engagement missions.",
    points: 15,
    verification: "auto",
  },
  {
    id: "connect_telegram",
    label: "Connect Telegram",
    description: "Open STACK XI in Telegram — instant identity via initData login.",
    points: 15,
    verification: "auto",
  },
  {
    id: "open_telegram_game",
    label: "Play in Telegram",
    description: "Open STACK XI inside Telegram and start the matchday loop.",
    points: 20,
    verification: "auto",
  },
  {
    id: "share_telegram_matchday",
    label: "Share matchday on Telegram",
    description: "Native share your pick or campaign to a Telegram chat.",
    points: 30,
    verification: "honor",
  },
  {
    id: "invite_telegram_friend",
    label: "Invite a friend on Telegram",
    description: "Share your referral link in a group — viral culture > solo grind.",
    points: 25,
    verification: "honor",
  },
  {
    id: "engage_x_post",
    label: "Like, repost & reply on X",
    description: "Boost the matchday post on X — like, repost, and comment.",
    points: 30,
    verification: "social",
  },
  {
    id: "comment_x_post",
    label: "Comment on matchday X post",
    description: "Reply on the official STACK XI matchday thread.",
    points: 20,
    verification: "social",
  },
  {
    id: "engage_farcaster_cast",
    label: "Like, recast & reply on Farcaster",
    description: "Engage with Leonardo's matchday cast — like, recast, and comment.",
    points: 30,
    verification: "social",
  },
  {
    id: "comment_farcaster_cast",
    label: "Comment on matchday cast",
    description: "Reply on the official Farcaster matchday cast.",
    points: 20,
    verification: "social",
  },
  {
    id: "share_campaign",
    label: "Share the culture campaign",
    description: "Post a campaign template on X or Farcaster with the site URL.",
    points: 35,
    verification: "social",
  },
  {
    id: "like_share_x",
    label: "Like & repost on X",
    description: "Boost the matchday post. Luck notices engagement.",
    points: 25,
    verification: "social",
  },
  {
    id: "make_post",
    label: "Post about STACK XI",
    description: "Share the vibe on X or Farcaster — your voice, our squad.",
    points: 30,
    verification: "social",
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
    label: "Lock a BCC prediction",
    description: "Pick a winner and stake BCC on Base — first 77 members get a sponsored 1,000 BCC stake.",
    points: 40,
    verification: "auto",
  },
];

export const TOTAL_MEMBER_XP = MEMBER_TASKS.reduce((sum, t) => sum + t.points, 0);

export function getCultureLevel(xp: number): { label: string; nextAt: number | null } {
  if (xp >= 250) return { label: "Culture Captain", nextAt: null };
  if (xp >= 175) return { label: "Starting XI", nextAt: 250 };
  if (xp >= 100) return { label: "Matchday Regular", nextAt: 175 };
  if (xp >= 50) return { label: "Bench Warmer", nextAt: 100 };
  return { label: "Matchday Rookie", nextAt: 50 };
}

export function isMemberTaskId(value: string): value is import("@/domain/types").MemberTaskId {
  return MEMBER_TASKS.some((t) => t.id === value);
}
