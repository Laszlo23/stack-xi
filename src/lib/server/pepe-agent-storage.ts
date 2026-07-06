import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { PepePillar } from "@/lib/agents/pepe-voice";

export type PepeActionType = "reply" | "recast" | "original" | "matchday";

export type PepeDraftStatus = "pending" | "approved" | "published" | "rejected";

export type PepeDraft = {
  id: string;
  text: string;
  actionType: "original" | "matchday";
  pillar: PepePillar;
  hook: string;
  status: PepeDraftStatus;
  createdAt: string;
  approvedAt?: string;
  castHash?: string;
  url?: string;
};

export type PepeOutcome = {
  castHash: string;
  actionType: PepeActionType;
  pillar: PepePillar;
  hook: string;
  text?: string;
  targetCastHash?: string;
  targetHandle?: string;
  publishedAt: string;
  url?: string;
};

export type PepeAgentStorageData = {
  drafts: PepeDraft[];
  outcomes: PepeOutcome[];
};

const DEFAULT_DATA: PepeAgentStorageData = {
  drafts: [],
  outcomes: [],
};

function dataFilePath(): string {
  return process.env.PEPE_AGENT_STORAGE_PATH ?? join(process.cwd(), "data", "pepe-agent.json");
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

async function readStorage(): Promise<PepeAgentStorageData> {
  await ensureDataFile();
  const raw = await readFile(dataFilePath(), "utf8");
  const parsed = JSON.parse(raw) as Partial<PepeAgentStorageData>;
  return {
    drafts: parsed.drafts ?? [],
    outcomes: parsed.outcomes ?? [],
  };
}

async function writeStorage(data: PepeAgentStorageData): Promise<void> {
  await ensureDataFile();
  await writeFile(dataFilePath(), JSON.stringify(data, null, 2), "utf8");
}

export async function listPendingPepeDrafts(): Promise<PepeDraft[]> {
  const data = await readStorage();
  return data.drafts.filter((d) => d.status === "pending");
}

export async function getPepeDraftById(id: string): Promise<PepeDraft | undefined> {
  const data = await readStorage();
  return data.drafts.find((d) => d.id === id);
}

export async function addPepeDraft(
  draft: Omit<PepeDraft, "id" | "status" | "createdAt">,
): Promise<PepeDraft> {
  const data = await readStorage();
  const entry: PepeDraft = {
    ...draft,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  data.drafts.unshift(entry);
  await writeStorage(data);
  return entry;
}

export async function updatePepeDraft(
  id: string,
  patch: Partial<Pick<PepeDraft, "status" | "approvedAt" | "castHash" | "url">>,
): Promise<PepeDraft | null> {
  const data = await readStorage();
  const index = data.drafts.findIndex((d) => d.id === id);
  if (index < 0) return null;
  data.drafts[index] = { ...data.drafts[index]!, ...patch };
  await writeStorage(data);
  return data.drafts[index]!;
}

export async function addPepeOutcome(
  outcome: PepeOutcome,
): Promise<PepeOutcome> {
  const data = await readStorage();
  data.outcomes.unshift(outcome);
  if (data.outcomes.length > 500) {
    data.outcomes = data.outcomes.slice(0, 500);
  }
  await writeStorage(data);
  return outcome;
}

export async function listOutcomes(since?: Date): Promise<PepeOutcome[]> {
  const data = await readStorage();
  if (!since) return data.outcomes;
  const ts = since.getTime();
  return data.outcomes.filter((o) => new Date(o.publishedAt).getTime() >= ts);
}

export async function countPepeActionsToday(
  now = new Date(),
): Promise<Record<PepeActionType, number>> {
  const data = await readStorage();
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  const counts: Record<PepeActionType, number> = {
    reply: 0,
    recast: 0,
    original: 0,
    matchday: 0,
  };
  for (const outcome of data.outcomes) {
    if (new Date(outcome.publishedAt).getTime() < start.getTime()) continue;
    counts[outcome.actionType] += 1;
  }
  return counts;
}

export async function hasPepeSupportedHandleToday(handle: string, now = new Date()): Promise<boolean> {
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

export async function getPepeAgentStorageSnapshot(): Promise<PepeAgentStorageData> {
  return readStorage();
}
