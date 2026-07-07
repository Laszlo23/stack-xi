import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { QuestStepsState } from "@/lib/quest/quest-config";
import { allQuestStepsComplete } from "@/lib/quest/quest-config";

export type QuestProgressRecord = {
  address: string;
  steps: QuestStepsState;
  completedAt?: string;
  mintApprovedAt?: string;
  ticketTokenId?: number;
  ticketTxHash?: string;
  updatedAt: string;
};

export type QuestStorageData = {
  progress: Record<string, QuestProgressRecord>;
};

const EMPTY_STEPS: QuestStepsState = {
  connect: false,
  followX: false,
  engageX: false,
  engageFc: false,
};

function dataFilePath(): string {
  return process.env.QUEST_STORAGE_PATH ?? join(process.cwd(), "data", "quest-progress.json");
}

async function ensureDataFile(): Promise<void> {
  const path = dataFilePath();
  await mkdir(dirname(path), { recursive: true });
  try {
    await readFile(path, "utf8");
  } catch {
    await writeFile(path, JSON.stringify({ progress: {} } satisfies QuestStorageData, null, 2), "utf8");
  }
}

async function readStorage(): Promise<QuestStorageData> {
  await ensureDataFile();
  const raw = await readFile(dataFilePath(), "utf8");
  return JSON.parse(raw) as QuestStorageData;
}

async function writeStorage(data: QuestStorageData): Promise<void> {
  await ensureDataFile();
  await writeFile(dataFilePath(), JSON.stringify(data, null, 2), "utf8");
}

function key(address: string): string {
  return address.toLowerCase();
}

export function emptyQuestProgress(address: string): QuestProgressRecord {
  return {
    address: address.toLowerCase(),
    steps: { ...EMPTY_STEPS },
    updatedAt: new Date().toISOString(),
  };
}

export async function getQuestProgress(address: string): Promise<QuestProgressRecord> {
  const data = await readStorage();
  return data.progress[key(address)] ?? emptyQuestProgress(address);
}

export async function setQuestStep(
  address: string,
  step: keyof QuestStepsState,
  value: boolean,
): Promise<QuestProgressRecord> {
  const data = await readStorage();
  const k = key(address);
  const existing = data.progress[k] ?? emptyQuestProgress(address);
  const steps = { ...existing.steps, [step]: value };
  const record: QuestProgressRecord = {
    ...existing,
    address: k,
    steps,
    updatedAt: new Date().toISOString(),
    completedAt:
      allQuestStepsComplete(steps) && !existing.mintApprovedAt
        ? new Date().toISOString()
        : existing.completedAt,
  };
  data.progress[k] = record;
  await writeStorage(data);
  return record;
}

export async function markMintApproved(address: string): Promise<QuestProgressRecord> {
  const data = await readStorage();
  const k = key(address);
  const existing = data.progress[k] ?? emptyQuestProgress(address);
  const record: QuestProgressRecord = {
    ...existing,
    address: k,
    mintApprovedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.progress[k] = record;
  await writeStorage(data);
  return record;
}

export async function recordTicketMint(
  address: string,
  tokenId: number,
  txHash: string,
): Promise<QuestProgressRecord> {
  const data = await readStorage();
  const k = key(address);
  const existing = data.progress[k] ?? emptyQuestProgress(address);
  const record: QuestProgressRecord = {
    ...existing,
    address: k,
    ticketTokenId: tokenId,
    ticketTxHash: txHash,
    updatedAt: new Date().toISOString(),
  };
  data.progress[k] = record;
  await writeStorage(data);
  return record;
}

export async function listQuestProgress(): Promise<QuestProgressRecord[]> {
  const data = await readStorage();
  return Object.values(data.progress);
}

export async function questStats(): Promise<{
  totalStarted: number;
  completed: number;
  mintApproved: number;
  ticketsMinted: number;
}> {
  const rows = await listQuestProgress();
  return {
    totalStarted: rows.length,
    completed: rows.filter((r) => allQuestStepsComplete(r.steps)).length,
    mintApproved: rows.filter((r) => Boolean(r.mintApprovedAt)).length,
    ticketsMinted: rows.filter((r) => r.ticketTokenId != null).length,
  };
}
