import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export type LiveTickerStatus = "scheduled" | "live" | "ht" | "ft";

export type LiveTickerState = {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number | null;
  status: LiveTickerStatus;
  lastEvent?: string;
  updatedAt: string;
};

export type LiveTickerStorageData = {
  ticker: LiveTickerState | null;
};

const DEFAULT_TICKER: LiveTickerState = {
  matchId: "m10",
  homeTeam: "Argentina",
  awayTeam: "Egypt",
  homeScore: 0,
  awayScore: 0,
  minute: null,
  status: "scheduled",
  lastEvent: "Kickoff 12:00 PM ET Atlanta",
  updatedAt: new Date().toISOString(),
};

function dataFilePath(): string {
  return process.env.LIVE_TICKER_STORAGE_PATH ?? join(process.cwd(), "data", "live-ticker.json");
}

async function ensureDataFile(): Promise<void> {
  const path = dataFilePath();
  await mkdir(dirname(path), { recursive: true });
  try {
    await readFile(path, "utf8");
  } catch {
    await writeFile(
      path,
      JSON.stringify({ ticker: DEFAULT_TICKER } satisfies LiveTickerStorageData, null, 2),
      "utf8",
    );
  }
}

async function readStorage(): Promise<LiveTickerStorageData> {
  await ensureDataFile();
  const raw = await readFile(dataFilePath(), "utf8");
  return JSON.parse(raw) as LiveTickerStorageData;
}

async function writeStorage(data: LiveTickerStorageData): Promise<void> {
  await ensureDataFile();
  await writeFile(dataFilePath(), JSON.stringify(data, null, 2), "utf8");
}

export async function getLiveTicker(): Promise<LiveTickerState | null> {
  const data = await readStorage();
  return data.ticker;
}

export async function setLiveTicker(ticker: LiveTickerState): Promise<LiveTickerState> {
  const stored = { ...ticker, updatedAt: new Date().toISOString() };
  await writeStorage({ ticker: stored });
  return stored;
}
