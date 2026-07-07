import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { base } from "viem/chains";
import { createPublicClient, http, parseAbiItem } from "viem";
import { PREDICTION_POOL_ADDRESS } from "@/lib/base/config";
import type { ActivityItem, MatchStats } from "./activity-types";

const predictionEvent = parseAbiItem(
  "event Prediction(address indexed user, string matchId, bool pickHome, uint256 amount, uint256 timestamp)",
);

const DEFAULT_FROM_BLOCK = 33_500_000n;

export type IndexedPrediction = {
  user: string;
  matchId: string;
  pickHome: boolean;
  amount: string;
  timestamp: number;
  txHash: string;
  blockNumber: string;
};

export type PredictionIndexData = {
  predictions: IndexedPrediction[];
  matchStats: Record<string, MatchStats>;
  updatedAt: string;
};

const DEFAULT_INDEX: PredictionIndexData = {
  predictions: [],
  matchStats: {},
  updatedAt: new Date(0).toISOString(),
};

function indexFilePath(): string {
  return process.env.PREDICTION_INDEX_PATH ?? join(process.cwd(), "data", "prediction-index.json");
}

function getServerRpcUrl(): string {
  return (
    process.env.BASE_RPC_URL?.trim() ||
    process.env.ALCHEMY_BASE_ENDPOINT?.trim() ||
    (process.env.ALCHEMY_API_KEY
      ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY.trim()}`
      : base.rpcUrls.default.http[0])
  );
}

async function ensureIndexFile(): Promise<void> {
  const path = indexFilePath();
  await mkdir(dirname(path), { recursive: true });
  try {
    await readFile(path, "utf8");
  } catch {
    await writeFile(path, JSON.stringify(DEFAULT_INDEX, null, 2), "utf8");
  }
}

export async function readPredictionIndex(): Promise<PredictionIndexData> {
  await ensureIndexFile();
  try {
    const raw = await readFile(indexFilePath(), "utf8");
    return JSON.parse(raw) as PredictionIndexData;
  } catch {
    return { ...DEFAULT_INDEX };
  }
}

async function writePredictionIndex(data: PredictionIndexData): Promise<void> {
  await ensureIndexFile();
  await writeFile(indexFilePath(), JSON.stringify(data, null, 2), "utf8");
}

function computeMatchStats(predictions: IndexedPrediction[]): Record<string, MatchStats> {
  const byMatch = new Map<string, { home: number; away: number; wallets: Set<string> }>();

  for (const p of predictions) {
    if (!p.matchId) continue;
    const bucket = byMatch.get(p.matchId) ?? { home: 0, away: 0, wallets: new Set<string>() };
    if (p.pickHome) bucket.home += 1;
    else bucket.away += 1;
    bucket.wallets.add(p.user.toLowerCase());
    byMatch.set(p.matchId, bucket);
  }

  const stats: Record<string, MatchStats> = {};
  const now = new Date().toISOString();

  for (const [matchId, bucket] of byMatch) {
    const total = bucket.home + bucket.away;
    const homePct = total > 0 ? Math.round((bucket.home / total) * 100) : 50;
    stats[matchId] = {
      matchId,
      totalPicks: total,
      homePct,
      awayPct: 100 - homePct,
      uniqueWallets: bucket.wallets.size,
      prizePoolLabel: "1,000 BCC pool",
      updatedAt: now,
    };
  }

  return stats;
}

export async function refreshPredictionIndex(): Promise<PredictionIndexData> {
  if (!PREDICTION_POOL_ADDRESS?.startsWith("0x")) {
    return readPredictionIndex();
  }

  const client = createPublicClient({
    chain: base,
    transport: http(getServerRpcUrl()),
  });

  const logs = await client.getLogs({
    address: PREDICTION_POOL_ADDRESS,
    event: predictionEvent,
    fromBlock: DEFAULT_FROM_BLOCK,
    toBlock: "latest",
  });

  const predictions: IndexedPrediction[] = logs.map((log) => ({
    user: (log.args.user ?? "0x0").toLowerCase(),
    matchId: log.args.matchId ?? "",
    pickHome: Boolean(log.args.pickHome),
    amount: (log.args.amount ?? 0n).toString(),
    timestamp: Number(log.args.timestamp ?? 0n),
    txHash: log.transactionHash,
    blockNumber: log.blockNumber.toString(),
  }));

  const data: PredictionIndexData = {
    predictions,
    matchStats: computeMatchStats(predictions),
    updatedAt: new Date().toISOString(),
  };

  await writePredictionIndex(data);
  return data;
}

export async function getMatchStatsFromIndex(matchId: string): Promise<MatchStats | null> {
  const index = await readPredictionIndex();
  return index.matchStats[matchId] ?? null;
}

export function predictionsToActivity(predictions: IndexedPrediction[], limit = 20): ActivityItem[] {
  return [...predictions]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map((p, idx) => ({
      id: `onchain-${p.txHash}-${idx}`,
      kind: "prediction" as const,
      handle: `${p.user.slice(0, 6)}…${p.user.slice(-4)}`,
      message: `picked ${p.pickHome ? "home" : "away"}`,
      emoji: "🔥",
      timestamp: new Date(p.timestamp * 1000).toISOString(),
      matchId: p.matchId,
      seed: false,
    }));
}
