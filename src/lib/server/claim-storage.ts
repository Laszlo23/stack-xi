import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export type ClaimStatus = "requested" | "paid";

export type PredictionClaimRecord = {
  id: string;
  address: string;
  matchId: string;
  txHash: string;
  pick: "home" | "away";
  status: ClaimStatus;
  requestedAt: string;
  paidAt?: string;
  payoutTxHash?: string;
  /** Squad perk boost in basis points at claim time */
  boostBps?: number;
  perkTier?: string;
};

export type ClaimStorageData = {
  claims: PredictionClaimRecord[];
};

const DEFAULT_DATA: ClaimStorageData = { claims: [] };

function dataFilePath(): string {
  return process.env.CLAIM_STORAGE_PATH ?? join(process.cwd(), "data", "prediction-claims.json");
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

async function readStorage(): Promise<ClaimStorageData> {
  await ensureDataFile();
  const raw = await readFile(dataFilePath(), "utf8");
  const parsed = JSON.parse(raw) as Partial<ClaimStorageData>;
  return { claims: parsed.claims ?? [] };
}

async function writeStorage(data: ClaimStorageData): Promise<void> {
  await ensureDataFile();
  await writeFile(dataFilePath(), JSON.stringify(data, null, 2), "utf8");
}

export async function listClaimsForAddress(address: string): Promise<PredictionClaimRecord[]> {
  const data = await readStorage();
  const lower = address.toLowerCase();
  return data.claims.filter((c) => c.address.toLowerCase() === lower);
}

export async function listAllClaims(status?: ClaimStatus): Promise<PredictionClaimRecord[]> {
  const data = await readStorage();
  if (!status) return data.claims;
  return data.claims.filter((c) => c.status === status);
}

export async function getClaimByTxHash(txHash: string): Promise<PredictionClaimRecord | undefined> {
  const data = await readStorage();
  const lower = txHash.toLowerCase();
  return data.claims.find((c) => c.txHash.toLowerCase() === lower);
}

export async function requestClaim(input: {
  address: string;
  matchId: string;
  txHash: string;
  pick: "home" | "away";
  boostBps?: number;
  perkTier?: string;
}): Promise<PredictionClaimRecord> {
  const data = await readStorage();
  const existing = data.claims.find((c) => c.txHash.toLowerCase() === input.txHash.toLowerCase());
  if (existing) return existing;

  const record: PredictionClaimRecord = {
    id: `claim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    address: input.address,
    matchId: input.matchId,
    txHash: input.txHash,
    pick: input.pick,
    status: "requested",
    requestedAt: new Date().toISOString(),
    boostBps: input.boostBps,
    perkTier: input.perkTier,
  };
  data.claims.push(record);
  await writeStorage(data);
  return record;
}

export async function markClaimPaid(
  claimId: string,
  payoutTxHash?: string,
): Promise<PredictionClaimRecord | null> {
  const data = await readStorage();
  const idx = data.claims.findIndex((c) => c.id === claimId);
  if (idx < 0) return null;
  const updated: PredictionClaimRecord = {
    ...data.claims[idx]!,
    status: "paid",
    paidAt: new Date().toISOString(),
    payoutTxHash,
  };
  data.claims[idx] = updated;
  await writeStorage(data);
  return updated;
}
