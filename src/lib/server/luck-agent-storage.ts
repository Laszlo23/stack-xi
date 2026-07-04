import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { LuckPillar } from "@/lib/agents/luck-voice";

export type LuckActionType = "quote" | "reply" | "retweet" | "original" | "matchday";

export type LuckDraftStatus = "pending" | "approved" | "published" | "rejected";

export type LuckDraft = {
  id: string;
  text: string;
  actionType: "original" | "matchday";
  pillar: LuckPillar;
  hook: string;
  status: LuckDraftStatus;
  createdAt: string;
  approvedAt?: string;
  tweetId?: string;
  url?: string;
};

export type LuckOutcomeMetrics = {
  likes: number;
  retweets: number;
  replies: number;
  impressions?: number;
  polledAt: string;
};

export type LuckOutcome = {
  tweetId: string;
  actionType: LuckActionType;
  pillar: LuckPillar;
  hook: string;
  targetTweetId?: string;
  targetHandle?: string;
  publishedAt: string;
  metrics?: LuckOutcomeMetrics;
  rewardScore?: number;
};

export type LuckAgentStorageData = {
  drafts: LuckDraft[];
  outcomes: LuckOutcome[];
};

const DEFAULT_DATA: LuckAgentStorageData = {
  drafts: [],
  outcomes: [],
};

function dataFilePath(): string {
  return (
    process.env.LUCK_AGENT_STORAGE_PATH ?? join(process.cwd(), "data", "luck-agent.json")
  );
}

async function ensureDataFile(): Promise<void> {
  const path = dataFilePath();
  await mkdir(dirname(path), { recursive: true });
  try {
    await readFile(path, "utf8");
  } catch {
    await writeFile(path, JSON.stringify(DEFAULT_DATA, null, 2), "utf8");
  }
}

async function readStorage(): Promise<LuckAgentStorageData> {
  await ensureDataFile();
  const raw = await readFile(dataFilePath(), "utf8");
  const parsed = JSON.parse(raw) as Partial<LuckAgentStorageData>;
  return {
    drafts: parsed.drafts ?? [],
    outcomes: parsed.outcomes ?? [],
  };
}

async function writeStorage(data: LuckAgentStorageData): Promise<void> {
  await ensureDataFile();
  await writeFile(dataFilePath(), JSON.stringify(data, null, 2), "utf8");
}

export async function listPendingDrafts(): Promise<LuckDraft[]> {
  const data = await readStorage();
  return data.drafts.filter((d) => d.status === "pending");
}

export async function getDraftById(id: string): Promise<LuckDraft | undefined> {
  const data = await readStorage();
  return data.drafts.find((d) => d.id === id);
}

export async function addDraft(draft: Omit<LuckDraft, "id" | "status" | "createdAt">): Promise<LuckDraft> {
  const data = await readStorage();
  const entry: LuckDraft = {
    ...draft,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  data.drafts.unshift(entry);
  await writeStorage(data);
  return entry;
}

export async function updateDraft(
  id: string,
  patch: Partial<Pick<LuckDraft, "status" | "approvedAt" | "tweetId" | "url">>,
): Promise<LuckDraft | null> {
  const data = await readStorage();
  const index = data.drafts.findIndex((d) => d.id === id);
  if (index < 0) return null;
  data.drafts[index] = { ...data.drafts[index]!, ...patch };
  await writeStorage(data);
  return data.drafts[index]!;
}

export async function addOutcome(outcome: Omit<LuckOutcome, "rewardScore">): Promise<LuckOutcome> {
  const data = await readStorage();
  const entry: LuckOutcome = { ...outcome };
  data.outcomes.unshift(entry);
  if (data.outcomes.length > 500) {
    data.outcomes = data.outcomes.slice(0, 500);
  }
  await writeStorage(data);
  return entry;
}

export async function updateOutcomeMetrics(
  tweetId: string,
  metrics: LuckOutcomeMetrics,
  rewardScore: number,
): Promise<void> {
  const data = await readStorage();
  const index = data.outcomes.findIndex((o) => o.tweetId === tweetId);
  if (index < 0) return;
  data.outcomes[index] = {
    ...data.outcomes[index]!,
    metrics,
    rewardScore,
  };
  await writeStorage(data);
}

export async function listOutcomes(since?: Date): Promise<LuckOutcome[]> {
  const data = await readStorage();
  if (!since) return data.outcomes;
  const ts = since.getTime();
  return data.outcomes.filter((o) => new Date(o.publishedAt).getTime() >= ts);
}

export async function countActionsToday(
  now = new Date(),
): Promise<Record<LuckActionType, number>> {
  const data = await readStorage();
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  const counts: Record<LuckActionType, number> = {
    quote: 0,
    reply: 0,
    retweet: 0,
    original: 0,
    matchday: 0,
  };
  for (const outcome of data.outcomes) {
    if (new Date(outcome.publishedAt).getTime() < start.getTime()) continue;
    counts[outcome.actionType] += 1;
  }
  return counts;
}

export async function hasSupportedHandleToday(handle: string, now = new Date()): Promise<boolean> {
  const data = await readStorage();
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  const normalized = handle.startsWith("@") ? handle : `@${handle}`;
  return data.outcomes.some(
    (o) =>
      o.targetHandle?.toLowerCase() === normalized.toLowerCase() &&
      new Date(o.publishedAt).getTime() >= start.getTime(),
  );
}

export async function hasSupportedTargetToday(targetTweetId: string, now = new Date()): Promise<boolean> {
  const data = await readStorage();
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  return data.outcomes.some(
    (o) =>
      o.targetTweetId === targetTweetId &&
      new Date(o.publishedAt).getTime() >= start.getTime(),
  );
}

export async function getLuckAgentStorageSnapshot(): Promise<LuckAgentStorageData> {
  return readStorage();
}
