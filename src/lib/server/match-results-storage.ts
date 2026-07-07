import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export type MatchWinnerSide = "home" | "away";

export type StoredMatchResult = {
  matchId: string;
  winner: MatchWinnerSide;
  result: string;
  payoutsOpen: boolean;
  settledAt: string;
};

export type MatchResultsStorageData = {
  results: Record<string, StoredMatchResult>;
};

const DEFAULT_RESULTS: MatchResultsStorageData = {
  results: {
    m8: {
      matchId: "m8",
      winner: "away",
      result: "Spain 1-0 (Merino 91')",
      payoutsOpen: true,
      settledAt: "2026-07-06T22:00:00.000Z",
    },
    m9: {
      matchId: "m9",
      winner: "away",
      result: "Belgium 4-1 USA — De Ketelaere brace; Tillman FK",
      payoutsOpen: true,
      settledAt: "2026-07-07T03:00:00.000Z",
    },
  },
};

function dataFilePath(): string {
  return process.env.MATCH_RESULTS_STORAGE_PATH ?? join(process.cwd(), "data", "match-results.json");
}

async function ensureDataFile(): Promise<void> {
  const path = dataFilePath();
  await mkdir(dirname(path), { recursive: true });
  try {
    await readFile(path, "utf8");
  } catch {
    await writeFile(path, JSON.stringify(DEFAULT_RESULTS, null, 2), "utf8");
  }
}

async function readStorage(): Promise<MatchResultsStorageData> {
  await ensureDataFile();
  const raw = await readFile(dataFilePath(), "utf8");
  return JSON.parse(raw) as MatchResultsStorageData;
}

async function writeStorage(data: MatchResultsStorageData): Promise<void> {
  await ensureDataFile();
  await writeFile(dataFilePath(), JSON.stringify(data, null, 2), "utf8");
}

export async function getAllMatchResults(): Promise<Record<string, StoredMatchResult>> {
  const data = await readStorage();
  return data.results;
}

export async function getMatchResult(matchId: string): Promise<StoredMatchResult | null> {
  const data = await readStorage();
  return data.results[matchId] ?? null;
}

export async function upsertMatchResult(
  result: Omit<StoredMatchResult, "settledAt"> & { settledAt?: string },
): Promise<StoredMatchResult> {
  const data = await readStorage();
  const stored: StoredMatchResult = {
    ...result,
    settledAt: result.settledAt ?? new Date().toISOString(),
  };
  data.results[result.matchId] = stored;
  await writeStorage(data);
  return stored;
}
