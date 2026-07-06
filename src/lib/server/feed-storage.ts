import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { FeedItem } from "@/lib/feed/feed-types";

export type CultureOpsEvent = {
  id: string;
  kind: "prediction" | "swap" | "note";
  label: string;
  txHash?: string;
  amountLabel?: string;
  publishedAt: string;
};

export type FeedStorageData = {
  cachedBuilderItems: FeedItem[];
  cachedAt: string | null;
  cultureOpsEvents: CultureOpsEvent[];
};

const DEFAULT_DATA: FeedStorageData = {
  cachedBuilderItems: [],
  cachedAt: null,
  cultureOpsEvents: [],
};

function dataFilePath(): string {
  return process.env.FEED_STORAGE_PATH ?? join(process.cwd(), "data", "feed-storage.json");
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

async function readStorage(): Promise<FeedStorageData> {
  await ensureDataFile();
  const raw = await readFile(dataFilePath(), "utf8");
  const parsed = JSON.parse(raw) as Partial<FeedStorageData>;
  return {
    cachedBuilderItems: parsed.cachedBuilderItems ?? [],
    cachedAt: parsed.cachedAt ?? null,
    cultureOpsEvents: parsed.cultureOpsEvents ?? [],
  };
}

async function writeStorage(data: FeedStorageData): Promise<void> {
  await ensureDataFile();
  await writeFile(dataFilePath(), JSON.stringify(data, null, 2), "utf8");
}

export async function getFeedStorageSnapshot(): Promise<FeedStorageData> {
  return readStorage();
}

export async function setCachedBuilderItems(items: FeedItem[]): Promise<void> {
  const data = await readStorage();
  data.cachedBuilderItems = items.slice(0, 100);
  data.cachedAt = new Date().toISOString();
  await writeStorage(data);
}

export async function addCultureOpsEvent(
  event: Omit<CultureOpsEvent, "id" | "publishedAt"> & { publishedAt?: string },
): Promise<CultureOpsEvent> {
  const data = await readStorage();
  const entry: CultureOpsEvent = {
    ...event,
    id: crypto.randomUUID(),
    publishedAt: event.publishedAt ?? new Date().toISOString(),
  };
  data.cultureOpsEvents.unshift(entry);
  if (data.cultureOpsEvents.length > 200) {
    data.cultureOpsEvents = data.cultureOpsEvents.slice(0, 200);
  }
  await writeStorage(data);
  return entry;
}

export async function listCultureOpsEvents(limit = 50): Promise<CultureOpsEvent[]> {
  const data = await readStorage();
  return data.cultureOpsEvents.slice(0, limit);
}
